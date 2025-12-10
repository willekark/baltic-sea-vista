import { NextResponse } from "next/server";

// Baltic Sea bounding box center (approximately)
const BALTIC_CENTER = { lat: 58.5, lon: 20 };
const RADIUS_NM = 50; // Max allowed by API

export async function GET() {
  const apiKey = process.env.DATALASTIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DATALASTIC_API_KEY not set" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.datalastic.com/api/v0/vessel_inradius?api-key=${apiKey}&lat=${BALTIC_CENTER.lat}&lon=${BALTIC_CENTER.lon}&radius=${RADIUS_NM}`;

    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      const text = await res.text();
      console.error("Datalastic API error:", text);
      return NextResponse.json({ error: "API error" }, { status: res.status });
    }

    const json = await res.json();

    if (!json.meta?.success) {
      return NextResponse.json(
        { error: json.meta?.error || "Unknown error" },
        { status: 400 }
      );
    }

    // Transform to match our Vessel interface
    const vessels = (json.data?.vessels || []).map(
      (v: Record<string, unknown>) => ({
        MMSI: Number(v.mmsi),
        LONGITUDE: v.lon,
        LATITUDE: v.lat,
        NAME: v.name || "Unknown",
        SOG: v.speed ?? 0,
        COG: v.course,
        HEADING: v.heading,
        NAVSTAT: v.navigation_status,
        TYPE: v.type,
      })
    );

    return NextResponse.json(vessels);
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vessels" },
      { status: 500 }
    );
  }
}
