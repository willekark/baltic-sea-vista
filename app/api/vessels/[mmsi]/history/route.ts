import { NextRequest, NextResponse } from "next/server";
import { generateMockHistory } from "@/app/lib/mock-vessels";

/** Use mock data in development to avoid API costs */
const USE_MOCK = process.env.NODE_ENV === "development";

/**
 * Fetches historical positions for a vessel by MMSI.
 * Returns array of positions with lat, lon, speed, course, heading, timestamp.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mmsi: string }> }
) {
  const { mmsi } = await params;

  // Return mock history in development
  if (USE_MOCK) {
    const positions = generateMockHistory(Number(mmsi));
    return NextResponse.json(positions);
  }

  const apiKey = process.env.DATALASTIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DATALASTIC_API_KEY not set" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") || "7";

  try {
    const url = `https://api.datalastic.com/api/v0/vessel_history?api-key=${apiKey}&mmsi=${mmsi}&days=${days}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      const text = await res.text();
      console.error("Datalastic history API error:", text);
      return NextResponse.json({ error: "API error" }, { status: res.status });
    }

    const json = await res.json();

    if (!json.meta?.success) {
      return NextResponse.json(
        { error: json.meta?.error || "Unknown error" },
        { status: 400 }
      );
    }

    // Transform positions to our format
    const positions = (json.data?.positions || []).map(
      (p: Record<string, unknown>) => ({
        lat: p.lat,
        lon: p.lon,
        speed: p.speed ?? 0,
        course: p.course ?? 0,
        heading: p.heading ?? 0,
        timestamp: p.last_position_UTC,
      })
    );

    return NextResponse.json(positions);
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vessel history" },
      { status: 500 }
    );
  }
}
