import { getAllAlbums } from "@/services/AlbumsService";
import { getAlbumPhotos } from "@/services/PhotosService";
import { Album, Photo } from "@/types/types";
import Image from "next/image";
import ImageGrid from "@/app/albums/[album]/_components/ImageGrid";

export const revalidate = 604800;

export async function generateStaticParams(): Promise<{ album: string }[]> {
  const albums: Album[] = await getAllAlbums();

  return albums.map((album) => ({ album: String(album.name) })) ?? [];
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const albumName: string = (await params).album;
  const photos: Photo[] = await getAlbumPhotos(albumName);

  return (
    <div className="w-[90vw]">
      <h1 className="text-center">
        {albumName} ({photos ? photos.length : 0})
      </h1>
      {photos.length > 0 ? (
        <ImageGrid photos={photos} />
      ) : (
        <div>
          <Image
            src="/modelo_cat.jpg"
            alt="Error retrieving images"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
