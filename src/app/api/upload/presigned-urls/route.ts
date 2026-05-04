import { auth } from "@/auth";
import s3client from "@/clients/s3client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ALLOWED_TYPES } from "@/helpers/constants"

const VALID_ALBUM_NAMES_REGEX = /^[a-zA-Z0-9-_]+$/;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { files, albumName } = await req.json();

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (!albumName || !VALID_ALBUM_NAMES_REGEX.test(albumName)) {
      return NextResponse.json(
        { error: "Invalid album name" },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!file.name || !file.contentType) {
        return NextResponse.json(
          { error: "Invalid file metadata" },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.contentType)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.contentType}` },
          { status: 400 }
        );
      }
    }

    const uploads = await Promise.all(
      files.map(
        async ({
          name,
          contentType,
        }: {
          name: string;
          contentType: string;
        }) => {
          const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const key = `albums/${albumName}/${randomUUID()}_${safeName}`;

          const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
            ContentType: contentType,
          });

          const url = await getSignedUrl(s3client, command, {
            expiresIn: 60 * 10,
          });

          return { key, url };
        }
      )
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Presigned URL generation failed:", error);

    return NextResponse.json(
      { error: "Failed to generate presigned URLs" },
      { status: 500 }
    );
  }
}