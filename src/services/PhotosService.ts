"use server";

import s3client from "@/clients/s3client";
import { Photo } from "@/types/types";
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

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
    return {
      url: `https://${process.env.AWS_CLOUDFRONT_ID}.cloudfront.net/${key}`,
      album: key.split("/")[0] + "/",
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
    return {
      url: `https://${process.env.AWS_CLOUDFRONT_ID}.cloudfront.net/${key}`,
      album,
    };
  });
};
