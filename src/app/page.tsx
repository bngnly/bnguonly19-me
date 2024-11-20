import { getRandomPhotos } from "@/services/PhotosService";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const randomPhotos = await getRandomPhotos(5);
  return (
    <div className="w-[90vw] space-y-[2vh]">
      <div className="relative h-[30vh]">
        <Image
          src="/my_headshot.jpg"
          alt="Photo of me"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
      <p className="text-center">
        Since graduating college I&apos;ve been fortunate enough to travel.
        These are just some photos I&apos;ve been willing to share online in
        hopes of showing some of my journey. Thanks to everyone who I&apos;ve
        met during my time, especially those who hosted me.
      </p>
      <p className="text-center">
        Here are Some Random Photos (Until I Figure Out What Else to Put Here):
      </p>

      {randomPhotos.length > 0 ? (
        <div>
          {randomPhotos.map((photo, _index) => {
            return (
              <div className="relative h-[30vh] my-0.5" key={_index}>
                <Image
                  src={photo.url}
                  alt="Photo of me"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            );
          })}
        </div>
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
