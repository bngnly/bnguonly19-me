import { getAllAlbums } from "@/services/AlbumsService";
import Image from "next/image";
import AlbumCard from "./_components/AlbumCard";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const albumNames: string[] = await getAllAlbums();

  return (
    <div className="w-[90vw] grid grid-cols-1 md:grid-cols-2 gap-6">
      {albumNames.length > 0 ? (
        albumNames.reverse().map((albumName, _index) => (
          <div key={_index}>
            <AlbumCard albumName={albumName} />
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
