import { useMemo } from "react";
import { PhotoWithLocation } from "@/types/types";

type LocationClusterData = {
  count: number;
  coords: [number, number];
};

export function useDensestPhotoLocation(
  photos: PhotoWithLocation[]
): [number, number] | null {
  return useMemo(() => {
    if (!photos.length) return null;

    const locationCounts = new Map<string, LocationClusterData>();

    for (const photo of photos) {
      if (
        typeof photo.latitude !== "number" ||
        typeof photo.longitude !== "number" ||
        isNaN(photo.latitude) ||
        isNaN(photo.longitude)
      ) {
        continue;
      }

      const lat = +photo.latitude.toFixed(3);
      const lng = +photo.longitude.toFixed(3);
      const key = `${lat},${lng}`;

      if (!locationCounts.has(key)) {
        locationCounts.set(key, { count: 1, coords: [lat, lng] });
      } else {
        locationCounts.get(key)!.count += 1;
      }
    }

    if (locationCounts.size === 0) return null;

    const densest = Array.from(locationCounts.values()).reduce((max, cluster) =>
      cluster.count > max.count ? cluster : max
    );

    return densest.coords;
  }, [photos]);
}
