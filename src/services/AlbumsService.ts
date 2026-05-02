"use server";

import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { Album, AlbumsManifest } from "@/types/types";
import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

export const getAllAlbums = async (): Promise<Album[]> => {
  try {
    if (!process.env.CDN_URL) {
      throw new Error("CDN_URL is not defined");
    }

    const res = await fetch(
      `${process.env.CDN_URL}/albums/manifest.json`,
      {
        next: { revalidate: 60 }, // cache for 60s
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch manifest: ${res.status}`);
    }

    const data: AlbumsManifest = await res.json();

    return data.albums ?? [];
  } catch (error) {
    console.error("Failed to fetch albums manifest:", error);
    return [];
  }
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

  const getAlbumsManifestResponse = await s3client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: "albums/manifest.json",
    })
  );

  const body = await getAlbumsManifestResponse.Body?.transformToString();

  if (!body) {
    throw new Error("Manifest file is empty or missing");
  }

  const manifest: AlbumsManifest = JSON.parse(body);


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

  await s3client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: "albums/manifest.json",
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
    })
  );

  revalidatePath("/");
  revalidatePath("/upload");

  return newAlbum;
};