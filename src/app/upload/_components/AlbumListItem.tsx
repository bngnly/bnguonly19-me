"use client";

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

interface AlbumListItemProps {
  albumName: string;
}

export default function AlbumListItem({ albumName }: AlbumListItemProps) {
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
    const timestamp = takenAt.toISOString().replace(/[:T]/g, "-").split(".")[0];
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
    if (selectedFiles.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    const filteredFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
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
        albumName,
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

    const { urls } = await presignedUrlsRes.json();

    for (let i = 0; i < filesWithMeta.length; i++) {
      const { file } = filesWithMeta[i];
      await fetch(urls[i].url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      setProgress(Math.round(((i + 1) / filesWithMeta.length) * 100));
    }

    setSelectedFiles([]);
    setTimeout(() => setProgress(null), 500);
  };

  return (
    <ListItem className="border-b">
      <ListItemButton>
        <ListItemText
          primary={albumName}
          secondary={`Files Selected: ${selectedFiles.length}`}
          onClick={() => router.push(`/albums/${albumName}`)}
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
