"use server";

import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { Album, GlobalAlbumsManifest, AlbumManifest } from "@/types/types";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getGlobalAlbumsManifest, putGlobalAlbumsManifest } from "@/helpers/ManifestHelper";

const BUCKET = process.env.AWS_BUCKET!;

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

export const deleteAlbum = async (albumName: string): Promise<void> => {
  if (!albumName) {
    throw new Error("Invalid album name");
  }

  const globalAlbumsManifest = await getGlobalAlbumsManifest();
  if (!globalAlbumsManifest.albums.some(a => a.name === albumName)) {
    throw new Error(`Album "${albumName}" does not exist`);
  };

  const prefix = `albums/${albumName}/`;

  try {
    globalAlbumsManifest.albums = (globalAlbumsManifest.albums ?? []).filter(
      (album) => album.name !== albumName
    );
    globalAlbumsManifest.updatedAt = new Date().toISOString();

    await putGlobalAlbumsManifest(globalAlbumsManifest);

    let continuationToken: string | undefined = undefined;

    do {
      const listAlbumObjects: ListObjectsV2CommandOutput = await s3client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      const objects = listAlbumObjects.Contents ?? [];

      if (objects.length > 0) {
        const deleteRes = await s3client.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET,
            Delete: {
              Objects: objects.map((obj) => ({ Key: obj.Key! })),
            },
          })
        );

        if (deleteRes.Errors && deleteRes.Errors.length > 0) {
          console.error(
            `Some objects failed to delete for album "${albumName}":`,
            deleteRes.Errors
          );
        }
      }

      continuationToken = listAlbumObjects.IsTruncated
        ? listAlbumObjects.NextContinuationToken
        : undefined;
    } while (continuationToken);
  } catch (error) {
    console.error(`Failed to delete album "${albumName}":`, error);
    throw error;
  }
}