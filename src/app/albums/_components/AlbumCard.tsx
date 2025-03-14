import Link from "next/link";
import { Card, CardContent, Typography } from "@mui/material";

interface AlbumCardProps {
  albumName: string;
}

export default function AlbumCard({ albumName }: AlbumCardProps) {
  return (
    <Link href={`/albums/${albumName}`}>
      <Card>
        <CardContent>
          <Typography className="text-center">{albumName}</Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
