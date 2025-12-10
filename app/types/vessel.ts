export interface Vessel {
  MMSI: number;
  LONGITUDE: number;
  LATITUDE: number;
  NAME: string;
  SOG: number;
  COG?: number;
  HEADING?: number;
  NAVSTAT?: number;
  TYPE?: number;
  isShadowFleet?: boolean;
}
