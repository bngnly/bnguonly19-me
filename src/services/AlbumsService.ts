"use server";

import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { Album, AlbumsManifest } from "@/types/types";
import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getGlobalAlbumsManifest, putGlobalAlbumsManifest } from "@/helpers/ManifestHelper";

export const getAllAlbums = async (): Promise<Album[]> => {
  const data: AlbumsManifest = await getGlobalAlbumsManifest();

  return data.albums ?? [];
};

export const createAlbum = async (albumName: string): Promise<Album> => {
  const session = await auth();
  if (!session || !session.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  const folderName = albumName.trim();

  if (!folderName || folderName.includes("..") || folderName.includes("//")) {
    throw new Error("Invalid Album name");
  }

  const manifest = await getGlobalAlbumsManifest();

  if (manifest.albums.some(
    (album) => album.name === folderName
  )) {
    throw new Error("Album already exists");
  }


  await s3client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: `${folderName}/`,
      Body: Buffer.alloc(0),
    })
  );

  const newAlbum: Album = {
    name: folderName,
    photosCount: 0,
  };

  manifest.albums.unshift(newAlbum);
  manifest.updatedAt = new Date().toISOString();

  await putGlobalAlbumsManifest(manifest);

  revalidatePath("/");
  revalidatePath("/upload");

  return newAlbum;
};