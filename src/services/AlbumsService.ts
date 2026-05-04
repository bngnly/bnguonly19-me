"use server";

import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { Album, GlobalAlbumsManifest, AlbumManifest } from "@/types/types";
import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getGlobalAlbumsManifest, putGlobalAlbumsManifest } from "@/helpers/ManifestHelper";

export const getAllAlbums = async (): Promise<Album[]> => {
  const data: GlobalAlbumsManifest = await getGlobalAlbumsManifest();

  return data.albums ?? [];
};

export const createAlbum = async (albumName: string): Promise<Album> => {
  try {
    const session = await auth();
    if (!session || !session.user?.isAdmin) {
      throw new Error("Unauthorized user");
    }

    const folderName = albumName.trim();

    const globalManifest = await getGlobalAlbumsManifest();

    const doesAlbumAlreadyExist = globalManifest.albums.some(
      (album) => album.name === folderName
    );

    if (!folderName || folderName.includes("..") ||
      folderName.includes("//") || doesAlbumAlreadyExist) {
      throw new Error("Invalid Album name");
    }

    const newAlbumManifest: AlbumManifest = {
      photos: [],
      photosCount: 0,
      updatedAt: new Date().toISOString(),
    };

    await s3client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: `albums/${folderName}/manifest.json`,
        Body: JSON.stringify(newAlbumManifest),
        ContentType: "application/json",
      })
    );

    const newAlbum: Album = {
      name: folderName,
      photosCount: 0,
    };

    globalManifest.albums.unshift(newAlbum);
    globalManifest.updatedAt = new Date().toISOString();

    await putGlobalAlbumsManifest(globalManifest);

    revalidatePath("/");
    revalidatePath("/upload");

    return newAlbum;
  } catch (error) {
    console.error(error);
    throw error;
  }
};