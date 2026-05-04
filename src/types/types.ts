export interface Album {
  name: string;
  photosCount: number;
}

export interface StoredPhoto {
  key: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
}

export interface Photo extends StoredPhoto {
  url: string;
  album: string;
}

export interface GlobalAlbumsManifest {
  albums: Album[];
  updatedAt: string;
}

export interface AlbumManifest {
  photosCount: number;
  updatedAt: string;
  photos: StoredPhoto[];
}

export const MY_LOCATION = [34.0614, -118.308] as [number, number];
export const DEFAULT_ZOOM = 10;
