import { getAllAlbums } from "@/services/AlbumsService";
import { getAlbumPhotos } from "@/services/PhotosService";
import { Photo } from "@/types/types";
import Image from "next/image";

export const revalidate = 2592000;

export async function generateStaticParams() {
  const albums = await getAllAlbums();

  return albums?.map((album) => ({
    album,
  }));
}

export default async function AlbumPage({
  params,
}: {
  params: { album: string };
}) {
  const album = (await params).album;
  const photos: Photo[] | undefined = await getAlbumPhotos(album);

  return (
    <div className="w-[90vw]">
      <h1 className="text-center">
        {album} ({photos ? photos.length : 0})
      </h1>
      {photos ? (
        <div className="grid sm: grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, _index) => (
            <div key={_index} className="relative w-full h-[70vh]">
              <Image
                src={photo.url}
                alt="Error retrieving image"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="">
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
