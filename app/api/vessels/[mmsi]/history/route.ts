import { NextRequest, NextResponse } from "next/server";
import { generateMockHistory } from "@/app/lib/mock-vessels";

const USE_MOCK = process.env.NODE_ENV === "development";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mmsi: string }> },
) {
  const { mmsi } = await params;

  if (USE_MOCK) {
    return NextResponse.json(generateMockHistory(Number(mmsi)));
  }

  const apiKey = process.env.GLOBAL_FISHING_WATCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GLOBAL_FISHING_WATCH_API_KEY not set" },
      { status: 500 },
    );
  }

  const days = Number(new URL(request.url).searchParams.get("days")) || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://gateway.api.globalfishingwatch.org/v3/vessels/${mmsi}/tracks?start-date=${startDate}&end-date=${endDate}&format=json&datasets=public-global-tracks:latest`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "API error" }, { status: res.status });
    }

    const json = await res.json();
    if (!json.coordinatesCollection) {
      return NextResponse.json(
        { error: "No track data returned" },
        { status: 400 },
      );
    }

    const positions = json.coordinatesCollection.flatMap((track: any) =>
      (track.coordinates || [])
        .filter((coord: any) => coord.length >= 3)
        .map((coord: any, i: number) => ({
          lat: coord[1],
          lon: coord[0],
          speed: track.speeds?.[i] || 0,
          course: track.courses?.[i] || 0,
          heading: track.courses?.[i] || 0,
          timestamp: new Date(coord[2]).toISOString(),
        })),
    );

    return NextResponse.json(positions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vessel history" },
      { status: 500 },
    );
  }
}
