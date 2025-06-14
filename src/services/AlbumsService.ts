"use server";

import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { Album } from "@/types/types";
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

export const getAllAlbums = async (): Promise<Album[]> => {
  const albums: Album[] = [];

  try {
    let albumResContinuationToken: string | undefined = undefined;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        Delimiter: "/",
        ContinuationToken: albumResContinuationToken,
      });

      const albumNamesRes: ListObjectsV2CommandOutput = await s3client.send(
        listCommand
      );

      const albumNames =
        albumNamesRes.CommonPrefixes?.map((prefix) =>
          prefix.Prefix?.replace(/\/$/, "")
        ).filter((name): name is string => Boolean(name)) ?? [];

      const albumsWithPhotoCount: Album[] = await Promise.all(
        albumNames.map(async (albumName) => {
          let count = 0;
          let photoResToken: string | undefined = undefined;

          do {
            const photosRes: ListObjectsV2CommandOutput = await s3client.send(
              new ListObjectsV2Command({
                Bucket: process.env.AWS_BUCKET,
                Prefix: `${albumName}/`,
                ContinuationToken: photoResToken,
              })
            );

            count +=
              photosRes.Contents?.filter(
                (photo) => photo.Key && !photo.Key.endsWith("/")
              ).length ?? 0;

            photoResToken = photosRes.NextContinuationToken;
          } while (photoResToken);

          return { name: albumName, photosCount: count };
        })
      );

      albums.push(...albumsWithPhotoCount);
      albumResContinuationToken = albumNamesRes.NextContinuationToken;
    } while (albumResContinuationToken);
  } catch (error) {
    console.error("Failed to fetch albums:", error);
  }

  return albums;
};

export async function createAlbum(albumName: string) {
  const session = await auth();
  if (!session || !session.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  const folderName = albumName.trim();

  if (!folderName || folderName.includes("..") || folderName.includes("//")) {
    throw new Error("Invalid folder name");
  }

  await s3client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: `${folderName}/`,
      Body: Buffer.alloc(0),
    })
  );

  revalidatePath("/upload");

  return {
    name: folderName,
    photosCount: 0,
  };
}
