import Link from "next/link";
import { Card, CardContent, Typography } from "@mui/material";
import { Album } from "@/types/types";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/albums/${album.name}`}>
      <Card>
        <CardContent>
          <Typography className="text-center">
            {album.name} ({album.photosCount})
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
