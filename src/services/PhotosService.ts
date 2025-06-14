"use server";

import s3client from "@/clients/s3client";
import { Photo } from "@/types/types";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

function getPhotoInfo(key: string) {
  const fileName = key.includes("/") ? key.split("/").pop() : key;

  if (!fileName) {
    return {
      latitude: null,
      longitude: null,
      timestamp: null,
    };
  }

  const parts = fileName.split("_");
  if (parts.length < 3) {
    return {
      latitude: null,
      longitude: null,
      timestamp: null,
    };
  }

  const timestampRaw = parts[0];
  const latitudeRaw = parts[1];
  const longitudeRaw = parts[2];

  const latitude = isNaN(parseFloat(latitudeRaw))
    ? null
    : parseFloat(latitudeRaw);
  const longitude = isNaN(parseFloat(longitudeRaw))
    ? null
    : parseFloat(longitudeRaw);

  const timestampRegex = /^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})$/;

  const timestamp = timestampRegex.test(timestampRaw)
    ? new Date(timestampRaw.replace(timestampRegex, "$1-$2-$3T$4:$5:$6"))
    : null;

  return {
    latitude,
    longitude,
    timestamp,
  };
}

export const getRandomPhotos = async (quantity: number): Promise<Photo[]> => {
  const allKeys: string[] = [];

  try {
    let continuationToken: string | undefined = undefined;
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        ContinuationToken: continuationToken,
      });
      const s3res: ListObjectsV2CommandOutput = await s3client.send(command);
      if (s3res && s3res.Contents) {
        allKeys.push(
          ...s3res.Contents.map((item) => item.Key).filter(
            (key) => key !== undefined
          )
        );
      }
      continuationToken = s3res.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.log(error);
  }

  const photoKeys = allKeys.filter((key) => {
    if (key) {
      const lowerCaseKey = key.toLowerCase();
      return (
        lowerCaseKey.endsWith(".jpeg") ||
        lowerCaseKey.endsWith(".jpg") ||
        lowerCaseKey.endsWith(".png")
      );
    }
  });

  const shuffledKeys = photoKeys.sort(() => 0.5 - Math.random());
  const selectedKeys = shuffledKeys.slice(0, quantity);

  console.log(`Retrieved ${selectedKeys.length} random photos`);
  return selectedKeys.map((key) => {
    const { latitude, longitude, timestamp } = getPhotoInfo(key);

    return {
      key,
      url: `https://${process.env.AWS_CLOUDFRONT_ID}.cloudfront.net/${key}`,
      album: key.includes("/") ? key.split("/")[0] + "/" : "",
      latitude,
      longitude,
      timestamp,
    };
  });
};

export const getAlbumPhotos = async (album: string): Promise<Photo[]> => {
  const keys: string[] = [];

  try {
    let continuationToken: string | undefined = undefined;
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        ContinuationToken: continuationToken,
        Prefix: album + "/",
      });
      const s3res: ListObjectsV2CommandOutput = await s3client.send(command);
      if (s3res && s3res.Contents) {
        keys.push(
          ...s3res.Contents.map((item) => item.Key).filter(
            (key) => key !== undefined
          )
        );
      }
      continuationToken = s3res.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.log(error);
  }

  const photoKeys = keys.filter((key) => {
    if (key) {
      const lowerCaseKey = key.toLowerCase();
      return (
        lowerCaseKey.endsWith(".jpeg") ||
        lowerCaseKey.endsWith(".jpg") ||
        lowerCaseKey.endsWith(".png")
      );
    }
  });

  console.log(`Retrieved ${album} with ${photoKeys.length} photos`);
  return photoKeys.map((key) => {
    const { latitude, longitude, timestamp } = getPhotoInfo(key);

    return {
      key,
      url: `https://${process.env.AWS_CLOUDFRONT_ID}.cloudfront.net/${key}`,
      album,
      latitude,
      longitude,
      timestamp,
    };
  });
};

export async function deletePhoto(photoKey: string) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    await s3client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: photoKey,
      })
    );
    const albumName = photoKey.split("/")[0];
    revalidatePath(`/albums/${albumName}`);
    console.log(`Deleted photo: ${photoKey} by ${session.user.name}`);

    return { success: true };
  } catch (err) {
    console.error("S3 delete error:", err);
    throw new Error("Failed to delete photo");
  }
}
