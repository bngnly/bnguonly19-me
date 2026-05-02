"use server";

import s3client from "@/clients/s3client";
import { Photo, AlbumManifest, AlbumsManifest, StoredPhoto } from "@/types/types";
import {
  DeleteObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export const getRandomPhotos = async (
  quantity: number
): Promise<Photo[]> => {
  try {
    const getGlobalAlbumsManifestResponse = await fetch(
      `${process.env.CDN_URL}/albums/manifest.json`
    );

    if (!getGlobalAlbumsManifestResponse.ok) {
      throw new Error(`Failed to fetch global manifest: ${getGlobalAlbumsManifestResponse.status}`);
    }

    const data: AlbumsManifest = await getGlobalAlbumsManifestResponse.json();

    if (!data.albums?.length) return [];

    const shuffledAlbums = [...data.albums].sort(
      () => 0.5 - Math.random()
    );

    const selectedAlbums = shuffledAlbums.slice(
      0,
      Math.min(5, shuffledAlbums.length)
    );

    const albumManifests = await Promise.all(
      selectedAlbums.map(async (album) => {
        const res = await fetch(
          `${process.env.CDN_URL}/albums/${album.name}/manifest.json`
        );

        if (!res.ok) return null;

        return (await res.json()) as AlbumManifest;
      })
    );

    const allPhotos: StoredPhoto[] = albumManifests
      .filter(Boolean)
      .flatMap((album) => album!.photos);

    if (!allPhotos.length) return [];

    const selected = [...allPhotos]
      .sort(() => 0.5 - Math.random())
      .slice(0, quantity);

    // 7. Return formatted response
    return selected.map((photo) => ({
      key: photo.key,
      album: photo.key.split("/")[0],
      latitude: photo.latitude,
      longitude: photo.longitude,
      timestamp: photo.timestamp,
      url: `${process.env.CDN_URL}/${photo.key}`,
    }));
  } catch (error) {
    console.error("Failed to get random photos:", error);
    return [];
  }
};

export const getAlbumPhotos = async (album: string): Promise<Photo[]> => {
  try {
    const getAlbumsManifestResponse = await fetch(
      `${process.env.CDN_URL}/albums/${album}/manifest.json`
    );

    if (!getAlbumsManifestResponse.ok) {
      throw new Error(`Failed to fetch album manifest: ${getAlbumsManifestResponse.status}`);
    }

    const albumManifest: AlbumManifest = await getAlbumsManifestResponse.json();

    return albumManifest.photos.map((photo) => ({
      key: photo.key,
      album,
      latitude: photo.latitude,
      longitude: photo.longitude,
      timestamp: photo.timestamp,
      url: `${process.env.CDN_URL}/${photo.key}`,
    }));
  } catch (error) {
    console.error("Failed to fetch album photos:", error);
    return [];
  }
};

export async function deletePhoto(photoKey: string) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    const albumName = photoKey.split("/")[0];

    await s3client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: photoKey,
      })
    );

    const albumRes = await fetch(
      `${process.env.CDN_URL}/albums/${albumName}/manifest.json`
    );

    if (!albumRes.ok) {
      throw new Error("Failed to fetch album manifest");
    }

    const albumManifest: AlbumManifest = await albumRes.json();

    albumManifest.photos = albumManifest.photos.filter(
      (p) => p.key !== photoKey
    );
    albumManifest.photosCount = albumManifest.photos.length;
    albumManifest.updatedAt = new Date().toISOString();

    await s3client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: `albums/${albumName}/manifest.json`,
        Body: JSON.stringify(albumManifest),
        ContentType: "application/json",
      })
    );

    const globalRes = await fetch(
      `${process.env.CDN_URL}/albums/manifest.json`
    );

    if (!globalRes.ok) {
      throw new Error("Failed to fetch global manifest");
    }

    const globalManifest: AlbumsManifest = await globalRes.json();

    const albumEntry = globalManifest.albums.find(
      (a) => a.name === albumName
    );

    if (albumEntry) {
      albumEntry.photosCount = Math.max(
        0,
        albumEntry.photosCount - 1
      );
    }

    globalManifest.updatedAt = new Date().toISOString();

    await s3client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: "albums/manifest.json",
        Body: JSON.stringify(globalManifest),
        ContentType: "application/json",
      })
    );

    revalidatePath(`/albums/${albumName}`);
    revalidatePath("/albums");
    revalidatePath("/upload"); 
    revalidatePath("/");

    console.log(
      `Deleted photo: ${photoKey} by ${session.user.name}`
    );

    return { success: true };
  } catch (err) {
    console.error("Delete photo error:", err);
    throw new Error("Failed to delete photo");
  }
}
