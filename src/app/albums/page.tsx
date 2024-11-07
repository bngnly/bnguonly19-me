import { getAllAlbums } from "@/services/AlbumsService";
import Image from "next/image";
import Link from "next/link";

export default async function AlbumsPage() {
  const albums = await getAllAlbums();

  return (
    <div className="w-[90vw]">
      {albums ? (
        albums.map((album, _index) => {
          return (
            <div key={_index}>
              <Link href={`/albums/${album}`}>{album}</Link>
            </div>
          );
        })
      ) : (
        <div className="relative h-[30vh]">
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
