import { Photo, PhotoWithLocation } from "@/types/types";

export function filterPhotosWithLocation(photos: Photo[]): PhotoWithLocation[] {
  return photos.filter(
    (photo) =>
      typeof photo.latitude === "number" && typeof photo.longitude === "number"
  ) as PhotoWithLocation[];
}
