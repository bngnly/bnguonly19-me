import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { files, albumName } = await req.json();

  const urls = await Promise.all(
    files.map(
      async ({
        name,
        timestamp,
        latitude,
        longitude,
        contentType,
      }: {
        name: string;
        timestamp: string;
        latitude: string;
        longitude: string;
        contentType: string;
      }) => {
        const safeName = name.replace(/\s+/g, "_");
        const cleanedAlbum = albumName.replace(/\/+$/, "");
        const key = `${cleanedAlbum}/${timestamp}_${latitude}_${longitude}_${safeName}`;

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
          ContentType: contentType,
        });

        const url = await getSignedUrl(s3client, command, { expiresIn: 300 });
        return { url, key };
      }
    )
  );

  return NextResponse.json({ urls });
}
