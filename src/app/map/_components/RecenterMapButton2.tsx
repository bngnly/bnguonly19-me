"use client";

import { useMap } from "react-leaflet";
import { IconButton } from "@mui/material";
import { GpsFixed } from "@mui/icons-material";

interface RecenterButtonProps {
  location: [number, number];
}

export function RecenterMapButton2({ location }: RecenterButtonProps) {
  const map = useMap();
  return (
    <IconButton
      onClick={() => map.panTo(location)}
      className="bg-white z-[100] hover:bg-gray-700"
    >
      <GpsFixed />
    </IconButton>
  );
}
