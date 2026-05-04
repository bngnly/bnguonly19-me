"use client";

import { Album } from "@/types/types";
import { AddPhotoAlternate, FileUpload } from "@mui/icons-material";
import {
  CircularProgress,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import exifr from "exifr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ALLOWED_TYPES } from "@/helpers/constants";

const UPLOADED_PHOTOS_CONCURRENCY = 5;

interface AlbumListItemProps {
  album: Album;
}

export default function AlbumListItem({ album }: AlbumListItemProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles([...e.target.files]);
  };

  const extractMetadata = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const exif = await exifr.parse(buffer);

    const takenAt = exif?.DateTimeOriginal ?? new Date();
    const timestamp = takenAt.toISOString();
    const latitude =
      typeof exif?.latitude === "number" ? exif.latitude.toFixed(5) : "unknown";
    const longitude =
      typeof exif?.longitude === "number"
        ? exif.longitude.toFixed(5)
        : "unknown";

    return {
      name: file.name,
      timestamp,
      latitude,
      longitude,
      contentType: file.type,
    };
  };

  const handleFileUpload = async () => {
    try {
      if (selectedFiles.length === 0) return;

      const filteredFiles = selectedFiles.filter((file) =>
        ALLOWED_TYPES.includes(file.type)
      );

      const filesWithMeta = await Promise.all(
        filteredFiles.map(async (file) => ({
          file,
          ...(await extractMetadata(file)),
        }))
      );

      const presignedUrlsRes = await fetch("/api/upload/presigned-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumName: album.name,
          files: filesWithMeta.map(
            ({ name, timestamp, latitude, longitude, contentType }) => ({
              name,
              timestamp,
              latitude,
              longitude,
              contentType,
            })
          ),
        }),
      });

      if (!presignedUrlsRes.ok) {
        throw new Error("Failed to get presigned URLs");
      }

      const { uploads } = await presignedUrlsRes.json();

      if (!uploads || !Array.isArray(uploads)) {
        throw new Error("Invalid upload response");
      }

      if (uploads.length !== filesWithMeta.length) {
        throw new Error("Mismatch between files and upload URLs");
      }

      let attempted = 0;
      const successfulUploads: {
        key: string;
        timestamp: string | null;
        latitude: number | null;
        longitude: number | null;
      }[] = [];

      for (let i = 0; i < uploads.length; i += UPLOADED_PHOTOS_CONCURRENCY) {
        const batch = uploads.slice(i, i + UPLOADED_PHOTOS_CONCURRENCY);

        await Promise.all(
          batch.map(async ({ url, key }: { url: string, key: string }, j: number) => {
            const index = i + j;
            const { file, timestamp, latitude, longitude } = filesWithMeta[index];

            try {
              const res = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": file.type,
                },
              });

              if (!res.ok) {
                throw new Error(`Upload failed: ${file.name}`);
              }

              successfulUploads.push({
                key,
                timestamp: timestamp ?? null,
                latitude: latitude === "unknown" ? null : Number(latitude),
                longitude: longitude === "unknown" ? null : Number(longitude),
              });


            } catch (err) {
              console.error(`Failed upload: ${file.name}`, err);
            }
            
            attempted++;
            setProgress(Math.round((attempted / uploads.length) * 100));
          })
        );
      }

      const completeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumName: album.name,
          uploads: successfulUploads,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error("Failed to update manifest files for upload");
      }

      setSelectedFiles([]);
      setTimeout(() => setProgress(null), 500);
    } catch (error) {
      console.log("Upload failed.", error);
      setProgress(null);
    }
  };

  return (
    <ListItem className="border-b">
      <ListItemButton>
        <ListItemText
          primary={`${album.name} (${album.photosCount})`}
          secondary={`Files Selected: ${selectedFiles.length}`}
          onClick={() => router.push(`/albums/${album.name}`)}
        />
      </ListItemButton>
      <IconButton component="label">
        <AddPhotoAlternate />
        <input
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleFileChange}
          disabled={progress !== null}
        />
      </IconButton>
      <IconButton onClick={handleFileUpload} disabled={progress !== null}>
        <FileUpload />
      </IconButton>
      {progress !== null && (
        <CircularProgress variant="determinate" value={progress} />
      )}
    </ListItem>
  );
}
