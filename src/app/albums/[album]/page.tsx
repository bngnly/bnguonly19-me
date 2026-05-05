import { getAllAlbums } from "@/services/AlbumsService";
import { getAlbumPhotos } from "@/services/PhotosService";
import { Album, PhotosPaginated } from "@/types/types";
import Image from "next/image";
import InfiniteImageGrid from "@/app/albums/[album]/_components/InfiniteImageGrid";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function generateStaticParams(): Promise<{ album: string }[]> {
  const albums: Album[] = await getAllAlbums();

  return albums.map((album) => ({ album: String(album.name) })) ?? [];
}

export default async function AlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ album: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { album: albumName } = await params;
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? "1"));

  const rawPageSize = Number(sp.pageSize ?? DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.isNaN(rawPageSize) ? DEFAULT_PAGE_SIZE : rawPageSize)
  );

  const offset = (page - 1) * pageSize;

  const photosPaginated: PhotosPaginated = await getAlbumPhotos(albumName, offset, pageSize);

  return (
    <div className="w-[90vw]">
      <h1 className="text-center">
        {albumName} ({photosPaginated.total})
      </h1>
      {photosPaginated.photos.length > 0 ? (
        <InfiniteImageGrid
          initialPhotos={photosPaginated.photos}
          initialOffset={offset}
          pageSize={pageSize}
          album={albumName}
          hasNextPage={photosPaginated.hasNextPage}
        />
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
