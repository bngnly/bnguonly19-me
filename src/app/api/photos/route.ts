import { getAlbumPhotos } from "@/services/PhotosService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const album = searchParams.get("album")!;
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "20");

  const data = await getAlbumPhotos(album, offset, limit);

  return Response.json(data);
}