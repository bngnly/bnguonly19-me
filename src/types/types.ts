export interface Photo {
  key: string;
  url: string;
  album: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: Date | null;
}
