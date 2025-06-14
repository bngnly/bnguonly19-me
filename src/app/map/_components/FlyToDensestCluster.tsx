"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { MY_LOCATION, PhotoWithLocation } from "@/types/types";
import { useDensestPhotoLocation } from "../_utils/useDensestLocation";

interface FlyToDensestClusterProps {
  photos: PhotoWithLocation[];
  zoom: number;
}

export function FlyToDensestCluster({
  photos,
  zoom,
}: FlyToDensestClusterProps) {
  const map = useMap();
  const densestCoords = useDensestPhotoLocation(photos);

  useEffect(() => {
    const target = densestCoords ?? MY_LOCATION;
    map.flyTo(target, zoom, { duration: 1.5 });
  }, [densestCoords, map, zoom]);

  return null;
}
