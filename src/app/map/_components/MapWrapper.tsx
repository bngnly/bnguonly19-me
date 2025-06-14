"use client";

import { getAllAlbums } from "@/services/AlbumsService";
import { getAlbumPhotos } from "@/services/PhotosService";
import { Album, Photo } from "@/types/types";
import { MenuItem, Select } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
});

export default function MapWrapper() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumName, setSelectedAlbumName] = useState<string | null>(
    null
  );
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    async function fetchAlbums() {
      const fetchedAlbums: Album[] = await getAllAlbums();
      setAlbums(fetchedAlbums.reverse());
      setSelectedAlbumName(fetchedAlbums[0].name ?? null);
    }

    fetchAlbums();
  }, [albums]);

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
          {albums.map((album) => (
            <MenuItem key={album.name} value={album.name}>
              {album.name} ({album.photosCount})
            </MenuItem>
          ))}
        </Select>
      </div>

      <MapClient photos={photos} />
    </div>
  );
}
