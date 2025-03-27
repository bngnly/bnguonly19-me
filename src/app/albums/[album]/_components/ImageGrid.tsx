"use client";

import { Photo } from "@/types/types";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@mui/material";

export default function ImageGrid({ photos }: { photos: Photo[] }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const closeImage = () => {
    setOpen(false);
    setCurrentPhotoIndex(null);
  };

  const decrementCurrentPhotoIndex = useCallback(() => {
    if (currentPhotoIndex !== null) {
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex(currentPhotoIndex - 1);
      } else {
        setCurrentPhotoIndex(photos.length - 1);
      }
    }
  }, [currentPhotoIndex, setCurrentPhotoIndex, photos]);

  const incrementCurrentPhotoIndex = useCallback(() => {
    if (currentPhotoIndex !== null) {
      if (currentPhotoIndex < photos.length - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      } else {
        setCurrentPhotoIndex(0);
      }
    }
  }, [currentPhotoIndex, setCurrentPhotoIndex, photos]);

  const keyboardShortCuts = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        incrementCurrentPhotoIndex();
      } else if (event.key === "ArrowRight") {
        decrementCurrentPhotoIndex();
      }
    },
    [decrementCurrentPhotoIndex, incrementCurrentPhotoIndex]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", keyboardShortCuts);
    } else {
      window.removeEventListener("keydown", keyboardShortCuts);
    }

    return () => {
      window.removeEventListener("keydown", keyboardShortCuts);
    };
  }, [open, keyboardShortCuts]);

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Dialog
        className="flex items-center justify-center bg-black/80 hover:cursor-zoom-out"
        open={open}
        fullScreen
        onClick={() => setOpen(false)}
        onClose={closeImage}
        PaperProps={{
          style: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center bg-black/80"
          onClick={() => setOpen(false)}
        >
          <Image
            src={
              currentPhotoIndex !== null
                ? photos[currentPhotoIndex].url
                : "/modelo_cat.jpg"
            }
            alt={"Expanded image"}
            height={9000}
            width={9000}
            sizes="100vw"
            className="max-w-screen max-h-screen w-auto h-auto p-4 hover:cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </Dialog>

      {photos.map((photo, index) => (
        <div key={index} className="relative w-full h-[70vh]">
          <Image
            className="hover:cursor-zoom-in"
            src={photo.url}
            alt={photo.url}
            fill
            style={{ objectFit: "contain" }}
            onClick={() => {
              setCurrentPhotoIndex(index);
              setOpen(true);
            }}
          />
        </div>
      ))}
    </div>
  );
}
