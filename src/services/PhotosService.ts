"use server";

import s3client from "@/clients/s3client";
import { Photo, StoredPhoto } from "@/types/types";
import {
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getGlobalAlbumsManifest,
  getAlbumManifest,
  putGlobalAlbumsManifest,
  putAlbumManifest,
} from "@/helpers/ManifestHelper";

export const getRandomPhotos = async (
  quantity: number
): Promise<Photo[]> => {
  try {
    const data = await getGlobalAlbumsManifest();

    if (!data.albums?.length) return [];

    const shuffledAlbums = [...data.albums].sort(
      () => 0.5 - Math.random()
    );

    const selectedAlbums = shuffledAlbums.slice(
      0,
      Math.min(5, shuffledAlbums.length)
    );

    const albumManifests = await Promise.all(
      selectedAlbums.map((a) => getAlbumManifest(a.name))
    );

    const allPhotos: StoredPhoto[] = albumManifests
      .filter(Boolean)
      .flatMap((m) => m?.photos ?? []);

    if (!allPhotos.length) return [];

    const selected = [...allPhotos]
      .sort(() => 0.5 - Math.random())
      .slice(0, quantity);


    return selected.map((photo) => ({
      key: photo.key,
      album: photo.key.split("/")[1] ?? "unknown",
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
    const albumManifest = await getAlbumManifest(album);

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
    const [, albumName] = photoKey.split("/");

    await s3client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: photoKey,
      })
    );

    const albumManifest = await getAlbumManifest(albumName);

    albumManifest.photos = albumManifest.photos.filter(
      (p) => p.key !== photoKey
    );
    albumManifest.photosCount = albumManifest.photos.length;
    albumManifest.updatedAt = new Date().toISOString();

    await putAlbumManifest(albumName, albumManifest);

    const globalManifest = await getGlobalAlbumsManifest();

    const albumEntry = globalManifest.albums.find(
      (a) => a.name === albumName
    );

    if (albumEntry) {
      albumEntry.photosCount = albumManifest.photosCount;
    }

    globalManifest.updatedAt = new Date().toISOString();

    await putGlobalAlbumsManifest(globalManifest);

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
