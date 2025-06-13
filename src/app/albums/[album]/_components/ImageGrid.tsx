"use client";

import { Photo } from "@/types/types";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import DeleteImageButton from "./DeleteImageButton";

export default function ImageGrid({ photos }: { photos: Photo[] }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );

  const closeImage = () => {
    setOpen(false);
    setTimeout(() => {
      const target = document.getElementById(`photo-${currentPhotoIndex}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
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
    const handler = (event: KeyboardEvent) => keyboardShortCuts(event);

    if (open) {
      window.addEventListener("keydown", handler);
    }

    return () => {
      window.removeEventListener("keydown", keyboardShortCuts);
    };
  }, [open, keyboardShortCuts]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const deltaX = touchStart.x - touch.clientX;
    const deltaY = touchStart.y - touch.clientY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    const SWIPE_THRESHOLD = 35;
    const VERTICAL_THRESHOLD = 60;

    if (absX > SWIPE_THRESHOLD && absX > absY) {
      if (deltaX > 0) {
        incrementCurrentPhotoIndex();
      } else {
        decrementCurrentPhotoIndex();
      }
    } else if (deltaY < -VERTICAL_THRESHOLD && absY > absX) {
      closeImage();
    }

    setTouchStart(null);
  };

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Dialog
        className="flex items-center justify-center bg-black/80"
        open={open}
        fullScreen
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        PaperProps={{
          style: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        {open && (
          <IconButton onClick={closeImage} className="fixed top-4 right-4 z-20">
            <CloseIcon sx={{ color: "white" }} />
          </IconButton>
        )}
        <div className="relative w-screen h-screen flex items-center justify-center bg-black/80">
          <Image
            src={
              currentPhotoIndex !== null
                ? photos[currentPhotoIndex].url
                : "/modelo_cat.jpg"
            }
            alt={"Expanded image"}
            fill
            sizes="100vw"
            className="object-contain p-2 hover:cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </Dialog>

      {photos.map((photo, index) => (
        <div
          key={photo.key}
          id={`photo-${index}`}
          className="relative w-full h-[70vh]"
        >
          <div className="absolute top-2 right-2 z-10">
            <DeleteImageButton photoKey={photo.key} />
          </div>
          <Image
            className="hover:cursor-zoom-in"
            src={photo.url}
            alt={photo.key}
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
