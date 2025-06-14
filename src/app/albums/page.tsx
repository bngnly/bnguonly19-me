import { getAllAlbums } from "@/services/AlbumsService";
import Image from "next/image";
import AlbumCard from "./_components/AlbumCard";
import { Album } from "@/types/types";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const albums: Album[] = await getAllAlbums();

  return (
    <div className="w-[90vw] grid grid-cols-1 md:grid-cols-2 gap-6">
      {albums.length > 0 ? (
        albums.reverse().map((album, _index) => (
          <div key={_index}>
            <AlbumCard album={album} />
          </div>
        ))
      ) : (
        <div className="relative h-[30vh]">
          <Image
            src="/modelo_cat.jpg"
            alt="Error retrieving albums"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
