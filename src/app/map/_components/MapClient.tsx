"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_ZOOM, MY_LOCATION, Photo } from "@/types/types";
import { PhotoMarker } from "./PhotoMarker";
import { RecenterMapButton } from "./RecenterMapButton";
import { FlyToDensestCluster } from "./FlyToDensestCluster";
import { filterPhotosWithLocation } from "../_utils/photoUtils";
import { useDensestPhotoLocation } from "../_utils/useDensestLocation";

interface MapClientProps {
  photos: Photo[];
}

export default function MapClient({ photos }: MapClientProps) {
  const validPhotos = filterPhotosWithLocation(photos);
  const densistCoords = useDensestPhotoLocation(validPhotos);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={densistCoords ?? MY_LOCATION}
        zoom={DEFAULT_ZOOM}
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
        <FlyToDensestCluster photos={validPhotos} zoom={DEFAULT_ZOOM} />
        <RecenterMapButton location={densistCoords ?? MY_LOCATION} />
      </MapContainer>
    </div>
  );
}
