/**
 * Mock vessel data for development to avoid Datalastic API costs.
 * @module lib/mock-vessels
 */

import type { Vessel } from "./vessel";

/** Mock vessels in Baltic Sea region with varied shadow fleet risk profiles */
export const mockVessels: Vessel[] = [
  // High risk vessels (shadow fleet indicators)
  {
    MMSI: 273456789,
    NAME: "VOLGA CRUDE",
    LATITUDE: 59.2,
    LONGITUDE: 19.8,
    SOG: 8.5,
    COG: 225,
    HEADING: 220,
    NAVSTAT: 0,
    TYPE: "Tanker",
    FLAG: "CM",
    COUNTRY: "Cameroon",
  },
  {
    MMSI: 636091234,
    NAME: "BALTIC SHADOW",
    LATITUDE: 58.9,
    LONGITUDE: 20.5,
    SOG: 6.2,
    COG: 180,
    HEADING: 178,
    NAVSTAT: 0,
    TYPE: "Tanker",
    FLAG: "LR",
    COUNTRY: "Liberia",
  },
  {
    MMSI: 352987654,
    NAME: "DARK VOYAGER",
    LATITUDE: 57.8,
    LONGITUDE: 18.2,
    SOG: 0,
    COG: 0,
    HEADING: 45,
    NAVSTAT: 1,
    TYPE: "Tanker",
    FLAG: "PA",
    COUNTRY: "Panama",
  },
  {
    MMSI: 667123456,
    NAME: "SILENT RUNNER",
    LATITUDE: 59.5,
    LONGITUDE: 21.1,
    SOG: 4.8,
    COG: 90,
    HEADING: 88,
    NAVSTAT: 0,
    TYPE: "Tanker",
    FLAG: "GA",
    COUNTRY: "Gabon",
  },
  // Medium risk vessels
  {
    MMSI: 311234567,
    NAME: "OCEAN TRADER",
    LATITUDE: 58.1,
    LONGITUDE: 19.3,
    SOG: 12.1,
    COG: 315,
    HEADING: 312,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "MT",
    COUNTRY: "Malta",
  },
  {
    MMSI: 256789012,
    NAME: "BALTIC CARRIER",
    LATITUDE: 59.8,
    LONGITUDE: 20.8,
    SOG: 9.4,
    COG: 45,
    HEADING: 42,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "CY",
    COUNTRY: "Cyprus",
  },
  {
    MMSI: 538456123,
    NAME: "NORTH WIND",
    LATITUDE: 57.5,
    LONGITUDE: 17.9,
    SOG: 0.3,
    COG: 0,
    HEADING: 180,
    NAVSTAT: 5,
    TYPE: "Tanker",
    FLAG: "MH",
    COUNTRY: "Marshall Islands",
  },
  // Low risk vessels (legitimate fleet)
  {
    MMSI: 265123456,
    NAME: "NORDIC STAR",
    LATITUDE: 58.4,
    LONGITUDE: 18.5,
    SOG: 14.2,
    COG: 270,
    HEADING: 268,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "SE",
    COUNTRY: "Sweden",
  },
  {
    MMSI: 230987654,
    NAME: "SUOMI EXPRESS",
    LATITUDE: 59.9,
    LONGITUDE: 22.3,
    SOG: 11.8,
    COG: 135,
    HEADING: 132,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "FI",
    COUNTRY: "Finland",
  },
  {
    MMSI: 219876543,
    NAME: "DANISH WAVE",
    LATITUDE: 56.2,
    LONGITUDE: 15.8,
    SOG: 0,
    COG: 0,
    HEADING: 90,
    NAVSTAT: 1,
    TYPE: "Tanker",
    FLAG: "DK",
    COUNTRY: "Denmark",
  },
  {
    MMSI: 211456789,
    NAME: "GERMANIA",
    LATITUDE: 54.8,
    LONGITUDE: 13.5,
    SOG: 7.6,
    COG: 60,
    HEADING: 58,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "DE",
    COUNTRY: "Germany",
  },
  {
    MMSI: 261234567,
    NAME: "POLARIS",
    LATITUDE: 57.3,
    LONGITUDE: 16.9,
    SOG: 15.3,
    COG: 180,
    HEADING: 178,
    NAVSTAT: 0,
    TYPE: "Container",
    FLAG: "NO",
    COUNTRY: "Norway",
  },
  {
    MMSI: 244789012,
    NAME: "AMSTERDAM TRADER",
    LATITUDE: 55.9,
    LONGITUDE: 14.2,
    SOG: 10.5,
    COG: 210,
    HEADING: 208,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "NL",
    COUNTRY: "Netherlands",
  },
  {
    MMSI: 235678901,
    NAME: "BRITANNIA",
    LATITUDE: 56.8,
    LONGITUDE: 12.1,
    SOG: 0.1,
    COG: 0,
    HEADING: 270,
    NAVSTAT: 5,
    TYPE: "Tanker",
    FLAG: "GB",
    COUNTRY: "United Kingdom",
  },
  {
    MMSI: 276543210,
    NAME: "ESTONIAN PRIDE",
    LATITUDE: 59.4,
    LONGITUDE: 24.5,
    SOG: 8.9,
    COG: 315,
    HEADING: 312,
    NAVSTAT: 0,
    TYPE: "Cargo",
    FLAG: "EE",
    COUNTRY: "Estonia",
  },
];

import type { VesselPosition } from "./vessel";

/**
 * Generates mock historical positions for a vessel.
 * Creates a trail of positions going back in time from current location.
 */
export function generateMockHistory(mmsi: number): VesselPosition[] {
  const vessel = mockVessels.find((v) => v.MMSI === mmsi);
  if (!vessel) return [];

  const positions: VesselPosition[] = [];
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  // Generate 24 positions over the past 7 days
  for (let i = 0; i < 24; i++) {
    const hoursAgo = i * 7; // ~7 hour intervals
    const timestamp = new Date(now - hoursAgo * hourMs).toISOString();

    // Create slight position variations going backwards
    const latOffset = Math.sin(i * 0.5) * 0.1 + i * 0.02;
    const lonOffset = Math.cos(i * 0.5) * 0.1 + i * 0.03;

    positions.push({
      lat: vessel.LATITUDE - latOffset,
      lon: vessel.LONGITUDE - lonOffset,
      speed: vessel.SOG + Math.sin(i) * 2,
      course: (vessel.COG ?? 0) + Math.sin(i * 0.3) * 10,
      heading: (vessel.HEADING ?? 0) + Math.sin(i * 0.3) * 10,
      timestamp,
    });
  }

  return positions;
}
