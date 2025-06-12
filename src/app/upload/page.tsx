import { getAllAlbumNames } from "@/services/AlbumsService";
import { List } from "@mui/material";
import CreateAlbumForm from "./_components/CreateAlbumForm";
import AlbumListItem from "./_components/AlbumListItem";

export default async function UploadPage() {
  const albumNames = await getAllAlbumNames();

  return (
    <>
      <div className="items-center">
        <h3>Albums</h3>
        <CreateAlbumForm />
        <List>
          {albumNames.reverse().map((albumName, _index) => (
            <AlbumListItem albumName={albumName} key={_index} />
          ))}
        </List>
      </div>
    </>
  );
}
