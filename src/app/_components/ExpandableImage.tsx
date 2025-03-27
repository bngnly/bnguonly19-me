"use client";

import { Photo } from "@/types/types";
import { Dialog } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

interface ExpandableImageProps {
  photo: Photo;
}

export default function ExpandableImage({ photo }: ExpandableImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        className="contain hover:cursor-zoom-in"
        src={photo.url}
        alt={photo.url}
        fill
        style={{ objectFit: "contain" }}
        onClick={() => setOpen(true)}
      />

      <Dialog
        className="flex items-center justify-center bg-black/80"
        open={open}
        fullScreen
        onClick={() => setOpen(false)}
        PaperProps={{
          style: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        {open && (
          <IconButton
            onClick={() => setOpen(false)}
            className="fixed top-4 right-4"
          >
            <CloseIcon sx={{ color: "white" }} />
          </IconButton>
        )}
        <div
          className="w-full h-full flex items-center justify-center bg-black/80"
          onClick={() => setOpen(false)}
        >
          <Image
            src={photo.url}
            alt={"Expanded image"}
            height={9000}
            width={9000}
            sizes="100vw"
            className="max-w-screen max-h-screen w-auto h-auto p-4 hover:cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </Dialog>
    </>
  );
}
