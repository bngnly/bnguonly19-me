import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { Photo } from "@/types/types";
import Image from "next/image";

const customIcon = L.icon({
  iconUrl: "/modelo_cat.jpg",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export function PhotoMarker({ photo }: { photo: Photo }) {
  return (
    <Marker position={[photo.latitude!, photo.longitude!]} icon={customIcon}>
      <Popup maxWidth={600} minWidth={300}>
        <div className="w-[80vw] max-w-[500px] flex flex-col items-center">
          <div className="relative w-full h-[300px]">
            <Image
              src={photo.url}
              alt={photo.key}
              fill
              className="object-contain rounded-md"
            />
          </div>
          <p className=" mt-2 text-center text-white text-lg">
            {photo.timestamp?.toLocaleString() ?? "Unknown date"}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
