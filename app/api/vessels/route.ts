import { NextRequest, NextResponse } from "next/server";

/** Default Baltic Sea center coordinates */
const DEFAULT_CENTER = { lat: 58.5, lon: 20 };
const DEFAULT_RADIUS = 50;

export async function GET(request: NextRequest) {
  const apiKey = process.env.DATALASTIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DATALASTIC_API_KEY not set" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || DEFAULT_CENTER.lat;
  const lon = searchParams.get("lon") || DEFAULT_CENTER.lon;
  const radius = Math.min(
    Number(searchParams.get("radius")) || DEFAULT_RADIUS,
    50
  );
  const type = searchParams.get("type");
  const navStatus = searchParams.get("nav_status");

  try {
    let url = `https://api.datalastic.com/api/v0/vessel_inradius?api-key=${apiKey}&lat=${lat}&lon=${lon}&radius=${radius}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    if (navStatus) url += `&nav_status=${navStatus}`;

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
