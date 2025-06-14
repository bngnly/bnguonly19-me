import { getAlbumPhotos } from "@/services/PhotosService";
import MapWrapper from "./_components/MapWrapper";
import { Photo } from "@/types/types";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const photos: Photo[] = await getAlbumPhotos("2025_01_18_Thailand_v2");

  return <MapWrapper photos={photos} />;
}
