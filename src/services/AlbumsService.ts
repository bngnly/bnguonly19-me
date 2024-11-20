import s3client from "@/clients/s3client";
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

export const getAllAlbums = async (): Promise<string[]> => {
  const albums = [];

  try {
    let continuationToken: string | undefined = undefined;
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        Delimiter: "/",
        ContinuationToken: continuationToken,
      });
      const s3res: ListObjectsV2CommandOutput = await s3client.send(command);
      if (s3res && s3res.CommonPrefixes) {
        albums.push(
          ...s3res.CommonPrefixes.map((prefix) => prefix.Prefix).filter(
            (key) => key !== undefined
          )
        );
      }
      continuationToken = s3res.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.log(error);
  }
  console.log(`Retrieved ${albums.length} albums`);
  return albums;
};
