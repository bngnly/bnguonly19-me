"use client";

import { Photo } from "@/types/types";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
});

interface MapWrapperProps {
  photos: Photo[];
}

export default function MapWrapper({ photos }: MapWrapperProps) {
  return <MapClient photos={photos} />;
}
