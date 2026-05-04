"use server";

import s3client from "@/clients/s3client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GlobalAlbumsManifest, AlbumManifest } from "@/types/types";

const BUCKET = process.env.AWS_BUCKET!;
const CDN_URL = process.env.CDN_URL!;


export async function getGlobalAlbumsManifest(): Promise<GlobalAlbumsManifest> {
    console.log(`[CDN] GET ${CDN_URL}/albums/manifest.json`);

    const res = await fetch(`${CDN_URL}/albums/manifest.json`, {
        headers: { Accept: "application/json" }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch global manifest: ${res.status}`);
    }

    return res.json();
}

export async function getAlbumManifest(
    album: string
): Promise<AlbumManifest> {
    console.log(`[CDN] GET ${CDN_URL}/albums/${album}/manifest.json`);

    const res = await fetch(`${CDN_URL}/albums/${album}/manifest.json`, {
        headers: { Accept: "application/json" }
    });

    if (!res.ok) {
        throw new Error(
            `Failed to fetch album manifest: ${album} (${res.status})`
        );
    }
    return res.json();
}

export async function putGlobalAlbumsManifest(manifest: GlobalAlbumsManifest) {
    await s3client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: "albums/manifest.json",
            Body: JSON.stringify(manifest),
            ContentType: "application/json",
        })
    );

    console.log("[S3] Updated global manifest");
}

export async function putAlbumManifest(
    album: string,
    manifest: AlbumManifest
) {
    await s3client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: `albums/${album}/manifest.json`,
            Body: JSON.stringify(manifest),
            ContentType: "application/json",
        })
    );

    console.log(`[S3] Updated album manifest: ${album}`);
}