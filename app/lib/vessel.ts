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
 * @property TYPE - Vessel type code (optional)
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
  TYPE?: number;
  isShadowFleet?: boolean;
}

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
