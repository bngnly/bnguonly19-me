import s3client from "@/clients/s3client";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getRandomPhotos = async (quantity: number) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET,
    });
    const s3res = await s3client.send(command);
    if (s3res.Contents) {
      const keys = await Promise.all(
        s3res.Contents.map(async (object) => object.Key)
      );
      const photoKeys = keys.filter((key) => {
        if (key) {
          const lowerCaseKey = key.toLowerCase();
          return (
            lowerCaseKey.endsWith(".jpeg") ||
            lowerCaseKey.endsWith(".jpg") ||
            lowerCaseKey.endsWith(".png")
          );
        }
      });
      if (quantity > photoKeys.length) {
        throw new Error(`Too many requested items: ${quantity} requested`);
      }
      const shuffledKeys = photoKeys.sort(() => 0.5 - Math.random());
      const selectedKeys = shuffledKeys.slice(0, quantity);
      const photos = await Promise.all(
        selectedKeys.map(async (selectedKey) => {
          if (selectedKey) {
            const getObjectCommand = new GetObjectCommand({
              Bucket: s3res.Name,
              Key: selectedKey,
            });
            const url = await getSignedUrl(s3client, getObjectCommand, {
              expiresIn: 60,
            });
            const album = selectedKey.split("/")[0] + "/";
            const photo = { album, url };
            return photo;
          }
        })
      );
      return photos;
    }
  } catch (e) {
    console.log(e);
  }
};

export const getAlbumPhotos = async (album: string) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET,
      Prefix: album + '/',
    });
    const s3res = await s3client.send(command);
    const photos = await Promise.all(
      s3res.Contents!.map(async (object) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: s3res.Name,
          Key: object.Key,
        });
        const url = await getSignedUrl(s3client, getObjectCommand, {
          expiresIn: 60,
        });
        const photo = { album, url };
        return photo;
      })
    );
    console.log(photos);
    return photos;
  } catch (error) {
    console.log(error);
  }
};
