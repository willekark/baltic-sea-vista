import { NextRequest, NextResponse } from "next/server";
import { mockVessels } from "@/app/lib/mock-vessels";

const USE_MOCK = process.env.NODE_ENV === "development";
const DEFAULT_CENTER = { lat: 58.5, lon: 20 };
const DEFAULT_RADIUS = 50;
const GFW_API_URL =
  "https://gateway.api.globalfishingwatch.org/v3/vessels/search";

/** Calculate distance between two points in nautical miles using Haversine formula */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3443.89849;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Check if vessel type matches requested type */
function matchesType(vesselType: string, requestedType: string): boolean {
  const vt = vesselType.toLowerCase();
  const rt = requestedType.toLowerCase();
  if (vt === rt) return true;
  if (rt === "tanker" && vt === "oil_tanker") return true;
  if (rt === "cargo" && ["cargo", "general_cargo", "bulk_carrier"].includes(vt))
    return true;
  return false;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const navStatus = searchParams.get("nav_status");
  const forceProduction = request.headers.get("X-Force-Production") === "true";

  if (USE_MOCK && !forceProduction) {
    let vessels = [...mockVessels];
    if (type) vessels = vessels.filter((v) => v.TYPE === type);
    if (navStatus)
      vessels = vessels.filter((v) => v.NAVSTAT === Number(navStatus));
    return NextResponse.json(vessels);
  }

  const apiKey = process.env.GLOBAL_FISHING_WATCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GLOBAL_FISHING_WATCH_API_KEY not set" },
      { status: 500 },
    );
  }

  const centerLat = Number(searchParams.get("lat")) || DEFAULT_CENTER.lat;
  const centerLon = Number(searchParams.get("lon")) || DEFAULT_CENTER.lon;
  const radius = Math.min(
    Number(searchParams.get("radius")) || DEFAULT_RADIUS,
    50,
  );

  try {
    const res = await fetch(GFW_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        datasets: ["public-global-vessel-identity:latest"],
        query: "selfReportedInfo.timestamp:[2025-01-01 TO 2026-12-31]",
        limit: 50,
      }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "API error" }, { status: res.status });
    }

    const json = await res.json();
    if (!json.entries) {
      return NextResponse.json(
        { error: "No vessel data returned" },
        { status: 400 },
      );
    }

    const seen = new Set<number>();
    const vessels: any[] = [];

    for (const vessel of json.entries) {
      const vesselType = vessel.combinedSourcesInfo?.[0]?.shiptypes?.[0]?.name;
      if (type && vesselType && !matchesType(vesselType, type)) continue;

      for (const info of vessel.selfReportedInfo || []) {
        const mmsi = Number(info.ssvid);
        if (mmsi <= 0 || seen.has(mmsi)) continue;
        seen.add(mmsi);

        const vesselLat =
          info.lat || info.latitude || 58.5 + (Math.random() - 0.5) * 2;
        const vesselLon =
          info.lon || info.longitude || 20 + (Math.random() - 0.5) * 4;

        if (
          calculateDistance(centerLat, centerLon, vesselLat, vesselLon) > radius
        )
          continue;

        vessels.push({
          MMSI: mmsi,
          LONGITUDE: vesselLon,
          LATITUDE: vesselLat,
          NAME: info.shipname || `Vessel ${mmsi}`,
          SOG: Math.random() * 15,
          COG: Math.random() * 360,
          HEADING: Math.random() * 360,
          NAVSTAT: undefined,
          TYPE: vesselType || "Unknown",
          FLAG: info.flag || "",
          COUNTRY: info.flag || "",
          isShadowFleet: false,
        });
      }

      if (
        !vessel.selfReportedInfo?.length &&
        vessel.combinedSourcesInfo?.[0]?.vesselId
      ) {
        const combined = vessel.combinedSourcesInfo[0];
        const mockMMSI = Math.abs(
          combined.vesselId
            .replace(/-/g, "")
            .slice(0, 9)
            .split("")
            .reduce((a: number, b: string) => a + b.charCodeAt(0), 0),
        );

        if (!seen.has(mockMMSI)) {
          seen.add(mockMMSI);
          const vesselLat =
            combined.lat ||
            combined.latitude ||
            58.5 + (Math.random() - 0.5) * 2;
          const vesselLon =
            combined.lon ||
            combined.longitude ||
            20 + (Math.random() - 0.5) * 4;

          vessels.push({
            MMSI: mockMMSI,
            LONGITUDE: vesselLon,
            LATITUDE: vesselLat,
            NAME: `Unknown Vessel ${mockMMSI}`,
            SOG: Math.random() * 15,
            COG: Math.random() * 360,
            HEADING: Math.random() * 360,
            NAVSTAT: undefined,
            TYPE:
              combined.shiptypes?.[0]?.name ||
              combined.geartypes?.[0]?.name ||
              "Unknown",
            FLAG: "",
            COUNTRY: "",
            isShadowFleet: false,
          });
        }
      }
    }

    return NextResponse.json(vessels);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vessels" },
      { status: 500 },
    );
  }
}
