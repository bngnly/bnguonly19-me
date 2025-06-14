"use server";

import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

export const getAllAlbumNames = async (): Promise<string[]> => {
  const albums = [];

  try {
    let continuationToken: string | undefined = undefined;
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        Delimiter: "/",
        ContinuationToken: continuationToken,
      });
      const s3res: ListObjectsV2CommandOutput = await s3client.send(command);
      if (s3res && s3res.CommonPrefixes) {
        albums.push(
          ...s3res.CommonPrefixes.map((prefix) =>
            prefix.Prefix?.replace(/\/$/, "")
          ).filter((key): key is string => Boolean(key))
        );
      }
      continuationToken = s3res.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.log(error);
  }
  console.log(`Retrieved ${albums.length} albums`);
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
}
