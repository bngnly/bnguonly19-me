"use client";

import { createAlbum } from "@/services/AlbumsService";
import { CreateNewFolder } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import { useState } from "react";

export default function CreateAlbumForm() {
  const [newAlbumName, setNewAlbumName] = useState("");

  return (
    <form
      className="flex justify-center"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await createAlbum(newAlbumName);
          setNewAlbumName("");
        } catch (e) {
          console.log(e);
        }
      }}
    >
      <TextField
        label="New Album"
        variant="outlined"
        value={newAlbumName}
        onChange={(e) => setNewAlbumName(e.target.value)}
        required
      />
      <IconButton type="submit">
        <CreateNewFolder />
      </IconButton>
    </form>
  );
}
