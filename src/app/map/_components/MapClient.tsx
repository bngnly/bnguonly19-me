"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Photo } from "@/types/types";
import { PhotoMarker } from "./PhotoMarker";

interface MapClientProps {
  photos: Photo[];
}

export default function MapClient({ photos }: MapClientProps) {
  const validPhotos = photos.filter(
    (photo) =>
      typeof photo.latitude === "number" && typeof photo.longitude === "number"
  );

  return (
    <MapContainer
      center={[34.0614, -118.308]} // Koreatown, LA
      zoom={10}
      minZoom={4}
      maxZoom={18}
      scrollWheelZoom={true}
      zoomControl={false}
      className="w-full h-full"
      worldCopyJump={false}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        noWrap={true}
      />
      {validPhotos.map((photo) => (
        <PhotoMarker key={photo.key} photo={photo} />
      ))}
    </MapContainer>
  );
}
