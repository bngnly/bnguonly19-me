export interface Album {
  name: string;
  photosCount: number;
}

export interface Photo {
  key: string;
  url: string;
  album: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: Date | null;
}

export interface PhotoWithLocation {
  key: string;
  url: string;
  album: string;
  latitude: number;
  longitude: number;
  timestamp: Date | null;
}

export const MY_LOCATION = [34.0614, -118.308] as [number, number];
export const DEFAULT_ZOOM = 10;
