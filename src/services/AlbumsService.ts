import s3client from "@/clients/s3client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export const getAllAlbums = async (): Promise<
  (string | undefined)[] | undefined
> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET,
      Delimiter: "/",
    });
    const s3res = await s3client.send(command);
    const albums = s3res.CommonPrefixes!.map((prefix) => prefix.Prefix);
    // console.log(albums);
    return albums;
  } catch (error) {
    console.log(error);
  }
};
