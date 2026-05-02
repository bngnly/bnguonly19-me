import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import "dotenv/config";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_BUCKET!;

// --- your existing logic adapted ---
function getPhotoInfo(key: string) {
    const fileName = key.split("/").pop();
    if (!fileName) return { latitude: null, longitude: null, timestamp: null };

    const parts = fileName.split("_");
    if (parts.length < 3) {
        return { latitude: null, longitude: null, timestamp: null };
    }

    const [timestampRaw, latitudeRaw, longitudeRaw] = parts;

    const latitude = isNaN(parseFloat(latitudeRaw))
        ? null
        : parseFloat(latitudeRaw);

    const longitude = isNaN(parseFloat(longitudeRaw))
        ? null
        : parseFloat(longitudeRaw);

    const timestampRegex = /^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})$/;

    const timestamp = timestampRegex.test(timestampRaw)
        ? new Date(
            timestampRaw.replace(timestampRegex, "$1-$2-$3T$4:$5:$6")
        ).toISOString()
        : null;

    return { latitude, longitude, timestamp };
}

// --- helper ---
function isImage(key: string) {
    const lower = key.toLowerCase();
    return (
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png")
    );
}

async function main() {
    console.log("🚀 Starting manifest generation...");

    const allKeys: string[] = [];
    let token: string | undefined;

    // --- 1. scan entire bucket ---
    do {
        const res: ListObjectsV2CommandOutput = await s3.send(
            new ListObjectsV2Command({
                Bucket: BUCKET,
                ContinuationToken: token,
            })
        );

        const keys =
            res.Contents?.map((obj) => obj.Key).filter(Boolean) as string[];

        allKeys.push(...keys);
        token = res.NextContinuationToken;
    } while (token);

    console.log(`📦 Found ${allKeys.length} total objects`);

    // --- 2. filter images ---
    const imageKeys = allKeys.filter(isImage).filter((key) => !key.startsWith("albums/"));

    console.log(`🖼 Found ${imageKeys.length} images`);

    // --- 3. group by album ---
    const albumsMap: Record<string, string[]> = {};

    for (const key of imageKeys) {
        const parts = key.split("/");
        if (parts.length < 2) continue;

        const album = parts[0]; // assuming structure: album/file.jpg

        if (!albumsMap[album]) {
            albumsMap[album] = [];
        }

        albumsMap[album].push(key);
    }

    const albumNames = Object.keys(albumsMap);

    console.log(`📁 Found ${albumNames.length} albums`);

    // --- 4. build album manifests ---
    const albumsManifest = {
        albums: [] as { name: string; photosCount: number }[],
        updatedAt: new Date().toISOString(),
    };

    for (const album of albumNames) {
        const keys = albumsMap[album];

        const photos = keys.map((key) => {
            const { latitude, longitude, timestamp } = getPhotoInfo(key);

            return {
                key,
                latitude,
                longitude,
                timestamp,
            };
        });

        photos.sort((a, b) => {
            if (!a.timestamp && !b.timestamp) return 0;
            if (!a.timestamp) return 1;   // push nulls to bottom
            if (!b.timestamp) return -1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        const albumManifest = {
            name: album,
            photosCount: photos.length,
            updatedAt: new Date().toISOString(),
            photos,
        };

        // --- upload album manifest ---
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: `albums/${album}/manifest.json`,
                Body: JSON.stringify(albumManifest, null, 2),
                ContentType: "application/json",
            })
        );

        console.log(`✅ Uploaded manifest for album: ${album}`);

        // --- add to global ---
        albumsManifest.albums.push({
            name: album,
            photosCount: photos.length,
        });
    }

    // --- 5. upload global manifest ---
    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: "albums/manifest.json",
            Body: JSON.stringify(albumsManifest, null, 2),
            ContentType: "application/json",
        })
    );

    console.log("🌍 Uploaded global albums manifest");
    console.log("🎉 Done!");
}

main().catch((err) => {
    console.error("❌ Migration failed:", err);
});