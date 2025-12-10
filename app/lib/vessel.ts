/**
 * Vessel type definitions and utilities for maritime tracking.
 * @module lib/vessel
 */

/**
 * Represents a vessel with AIS data.
 * @property MMSI - Maritime Mobile Service Identity (unique vessel identifier)
 * @property LONGITUDE - Current longitude position
 * @property LATITUDE - Current latitude position
 * @property NAME - Vessel name
 * @property SOG - Speed Over Ground in knots
 * @property COG - Course Over Ground in degrees (optional)
 * @property HEADING - True heading in degrees (optional)
 * @property NAVSTAT - Navigation status code (optional)
 * @property TYPE - Vessel type string (optional)
 * @property FLAG - ISO country code of vessel flag (optional)
 * @property COUNTRY - Full country name of vessel flag (optional)
 * @property isShadowFleet - Whether vessel is flagged as shadow fleet
 */
export interface Vessel {
  MMSI: number;
  LONGITUDE: number;
  LATITUDE: number;
  NAME: string;
  SOG: number;
  COG?: number;
  HEADING?: number;
  NAVSTAT?: number;
  TYPE?: string;
  FLAG?: string;
  COUNTRY?: string;
  isShadowFleet?: boolean;
}

/** Map ISO country codes to flag emojis */
export const getFlagEmoji = (countryCode?: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🏳️";
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
};

/** Historical position point for vessel route display */
export interface VesselPosition {
  lat: number;
  lon: number;
  speed: number;
  course: number;
  heading: number;
  timestamp: string;
}

/** Filter parameters for vessel queries */
export interface VesselFilter {
  type?: string;
  navStatus?: number;
  radius?: number;
  lat?: number;
  lon?: number;
}

/** Available vessel types from Datalastic API */
export const VESSEL_TYPES = [
  "Cargo",
  "Tanker",
  "Passenger",
  "Fishing",
  "Tug",
  "Dredger",
  "Military Ops",
  "Sailing Vessel",
  "Pleasure Craft",
  "Pilot Vessel",
  "SAR",
  "Law Enforce",
] as const;

/** Navigation status codes and their descriptions */
export const NAV_STATUS = [
  { code: 0, label: "Under way using engine" },
  { code: 1, label: "At anchor" },
  { code: 2, label: "Not under command" },
  { code: 3, label: "Restricted manoeuvrability" },
  { code: 4, label: "Constrained by draught" },
  { code: 5, label: "Moored" },
  { code: 6, label: "Aground" },
  { code: 7, label: "Engaged in fishing" },
  { code: 8, label: "Under way sailing" },
] as const;

/**
 * Vessel status colors mapped to CSS variables from globals.css.
 * These must stay in sync with the :root variables.
 */
export const VESSEL_COLORS = {
  active: "var(--vessel-active)",
  idle: "var(--vessel-idle)",
  shadow: "var(--vessel-shadow)",
  anchored: "var(--vessel-anchored)",
} as const;

/**
 * Returns the appropriate color for a vessel based on its status.
 * Shadow fleet vessels are highlighted with the shadow color.
 * @param v - The vessel to get color for
 * @returns CSS variable string for the vessel color
 */
export const getVesselColor = (v: Vessel): string =>
  v.isShadowFleet ? VESSEL_COLORS.shadow : VESSEL_COLORS.active;

/**
 * Creates an SVG marker string for displaying vessels on the map.
 * Moving vessels show as triangles (rotated by heading), stationary as diamonds.
 * @param color - Fill color (CSS variable or hex)
 * @param heading - Vessel heading in degrees for rotation
 * @param isMoving - Whether vessel is moving (SOG >= 0.5)
 * @returns SVG markup string
 */
export const createMarkerSvg = (
  color: string,
  heading: number,
  isMoving: boolean
): string =>
  isMoving
    ? `<svg viewBox="0 0 20 20" fill="${color}" style="transform:rotate(${heading}deg)"><path d="M10 2L18 18L10 14L2 18Z" stroke="rgba(255,255,255,0.4)" stroke-width="1"/></svg>`
    : `<svg viewBox="0 0 20 20" fill="${color}"><path d="M10 2L18 10L10 18L2 10Z" stroke="rgba(255,255,255,0.4)" stroke-width="1"/></svg>`;
