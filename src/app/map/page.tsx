import { getAlbumPhotos } from "@/services/PhotosService";
import MapWrapper from "./_components/MapWrapper";
import { Photo } from "@/types/types";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const photos: Photo[] = await getAlbumPhotos("here");

  return (
    <div className="w-full h-screen">
      <MapWrapper photos={photos} />
    </div>
  );
}
