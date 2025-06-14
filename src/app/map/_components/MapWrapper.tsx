"use client";

import { getAllAlbumNames } from "@/services/AlbumsService";
import { getAlbumPhotos } from "@/services/PhotosService";
import { Photo } from "@/types/types";
import { MenuItem, Select } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
});

export default function MapWrapper() {
  const [albumNames, setAlbumNames] = useState<string[]>([]);
  const [selectedAlbumName, setSelectedAlbumName] = useState<string | null>(
    null
  );
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    async function fetchAlbums() {
      const names = await getAllAlbumNames();
      setAlbumNames(names.reverse());
      setSelectedAlbumName(names[0] ?? null);
    }

    fetchAlbums();
  }, []);

  useEffect(() => {
    async function fetchPhotos() {
      if (!selectedAlbumName) return;
      setPhotos(await getAlbumPhotos(selectedAlbumName));
    }

    fetchPhotos();
  }, [selectedAlbumName]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4">
        <Select
          value={selectedAlbumName ?? ""}
          onChange={(e) => setSelectedAlbumName(e.target.value)}
          displayEmpty
          size="small"
          fullWidth
          className="z-[500] bg-white"
        >
          {albumNames.map((albumName) => (
            <MenuItem key={albumName} value={albumName}>
              {albumName}
            </MenuItem>
          ))}
        </Select>
      </div>

      <MapClient photos={photos} />
    </div>
  );
}
