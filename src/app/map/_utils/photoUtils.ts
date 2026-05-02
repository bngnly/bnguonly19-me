import { Photo } from "@/types/types";

export function filterPhotosWithLocation(
  photos: Photo[]
): Photo[] {
  return photos.filter(
    (photo): photo is Photo =>
      photo.latitude !== null &&
      photo.longitude !== null
  );
}