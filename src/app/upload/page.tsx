import { getAllAlbums } from "@/services/AlbumsService";
import { List } from "@mui/material";
import CreateAlbumForm from "./_components/CreateAlbumForm";
import AlbumListItem from "./_components/AlbumListItem";
import { Album } from "@/types/types";

export default async function UploadPage() {
  const albums: Album[] = await getAllAlbums();

  return (
    <>
      <div className="items-center">
        <h3>Albums</h3>
        <CreateAlbumForm />
        <List>
          {albums.reverse().map((album, _index) => (
            <AlbumListItem album={album} key={_index} />
          ))}
        </List>
      </div>
    </>
  );
}
