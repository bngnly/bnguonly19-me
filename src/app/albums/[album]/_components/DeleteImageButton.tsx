"use client";

import { deletePhoto } from "@/services/PhotosService";
import { HighlightOffTwoTone } from "@mui/icons-material";
import { Dialog, IconButton } from "@mui/material";
import { useState } from "react";

interface DeleteImageButtonProps {
  photoKey: string;
}

export default function DeleteImageButton({
  photoKey,
}: DeleteImageButtonProps) {
  const [openModal, setOpenModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePhoto(photoKey);
    } catch (err) {
      alert(`Failed to delete ${photoKey}`);
    }
  };

  return (
    <>
      <IconButton onClick={() => setOpenModal(true)}>
        <HighlightOffTwoTone className="text-red-500" />
      </IconButton>
      <Dialog open={openModal}>
        <div className="flex flex-col items-center justify-center p-4">
          <h2 className="text-lg font-bold mb-4">Delete Image</h2>
          <p>Are you sure you want to delete this image?</p>
          <div className="flex gap-4 mt-4">
            <IconButton color="secondary" onClick={() => setOpenModal(false)}>
              Cancel
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => {
                handleDelete();
                setOpenModal(false);
              }}
            >
              Yes
            </IconButton>
          </div>
        </div>
      </Dialog>
    </>
  );
}
