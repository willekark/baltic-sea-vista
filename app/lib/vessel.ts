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

// CSS variable values - keep in sync with globals.css
export const VESSEL_COLORS = {
  active: "var(--vessel-active)",
  idle: "var(--vessel-idle)",
  shadow: "var(--vessel-shadow)",
  anchored: "var(--vessel-anchored)",
} as const;

export const getVesselColor = (v: Vessel) =>
  v.isShadowFleet ? VESSEL_COLORS.shadow : VESSEL_COLORS.active;

export const createMarkerSvg = (
  color: string,
  heading: number,
  isMoving: boolean
) =>
  isMoving
    ? `<svg viewBox="0 0 20 20" fill="${color}" style="transform:rotate(${heading}deg)"><path d="M10 2L18 18L10 14L2 18Z" stroke="rgba(255,255,255,0.4)" stroke-width="1"/></svg>`
    : `<svg viewBox="0 0 20 20" fill="${color}"><path d="M10 2L18 10L10 18L2 10Z" stroke="rgba(255,255,255,0.4)" stroke-width="1"/></svg>`;
