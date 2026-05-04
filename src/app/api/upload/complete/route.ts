import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
    getAlbumManifest,
    getGlobalAlbumsManifest,
    putAlbumManifest,
    putGlobalAlbumsManifest,
} from "@/helpers/ManifestHelper";
import { StoredPhoto } from "@/types/types"

interface UploadCompleteItem {
    key: string;
    timestamp: string | null;
    latitude: number | null;
    longitude: number | null;
};

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { albumName, uploads } = await req.json();

        if (!Array.isArray(uploads) || uploads.some(u => !u.key)) {
            return NextResponse.json(
                { error: "Invalid uploads payload" },
                { status: 400 }
            );
        }

        if (!albumName || albumName.includes("..") || albumName.includes("//")) {
            return NextResponse.json(
                { error: "Invalid album name" },
                { status: 400 }
            );
        }

        const albumManifest = await getAlbumManifest(albumName);

        if (!albumManifest) {
            return NextResponse.json(
                { error: "Album not found" },
                { status: 404 }
            );
        }

        const newPhotos: StoredPhoto[] = uploads.map((u: UploadCompleteItem) => ({
            key: u.key,
            timestamp: u.timestamp,
            latitude: u.latitude,
            longitude: u.longitude,
        }));

        const existingKeys = new Set(albumManifest.photos.map(p => p.key));

        const uniqueNewPhotos = newPhotos.filter(
            (p) => !existingKeys.has(p.key)
        );

        albumManifest.photos.push(...uniqueNewPhotos);

        albumManifest.photos.sort((a, b) => {
            const tA = a.timestamp ? Date.parse(a.timestamp) : 0;
            const tB = b.timestamp ? Date.parse(b.timestamp) : 0;
            return tB - tA;
        });

        albumManifest.photosCount = albumManifest.photos.length;
        albumManifest.updatedAt = new Date().toISOString();

        await putAlbumManifest(albumName, albumManifest);

        const globalManifest = await getGlobalAlbumsManifest();

        const albumEntry = globalManifest.albums.find(
            (a) => a.name === albumName
        );

        if (albumEntry) {
            albumEntry.photosCount = albumManifest.photos.length;
        }

        globalManifest.updatedAt = new Date().toISOString();

        await putGlobalAlbumsManifest(globalManifest);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Upload complete failed:", error);

        return NextResponse.json(
            { error: "Failed to complete upload" },
            { status: 500 }
        );
    }
}