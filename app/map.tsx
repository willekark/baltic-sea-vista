/**
 * Interactive Mapbox GL map component for vessel tracking.
 * Displays vessel markers and handles map interactions.
 * @module components/Map
 */

"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  type Vessel,
  type VesselFilter,
  type VesselPosition,
  getVesselColor,
  createMarkerSvg,
} from "./lib/vessel";

/**
 * Imperative handle for controlling the map from parent components.
 * @property flyTo - Animates the map to center on given coordinates
 */
export interface MapHandle {
  flyTo: (lng: number, lat: number) => void;
}

/** Route source and layer IDs */
const HISTORY_SOURCE = "vessel-history";
const HISTORY_LAYER = "vessel-history-line";
const PROJECTED_SOURCE = "vessel-projected";
const PROJECTED_LAYER = "vessel-projected-line";

/** Earth radius in nautical miles */
const EARTH_RADIUS_NM = 3440.065;

/**
 * Calculate destination point given start, bearing and distance.
 * @param lat - Starting latitude in degrees
 * @param lon - Starting longitude in degrees
 * @param bearing - Bearing in degrees
 * @param distanceNm - Distance in nautical miles
 * @returns [longitude, latitude] coordinate pair
 */
const destinationPoint = (
  lat: number,
  lon: number,
  bearing: number,
  distanceNm: number
): [number, number] => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const θ = toRad(bearing);
  const δ = distanceNm / EARTH_RADIUS_NM;

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return [toDeg(λ2), toDeg(φ2)];
};

/**
 * Map component with vessel markers and navigation controls.
 * Fetches vessels on load and displays them with interactive popups.
 * @param filter - Filter parameters for vessel query
 * @param onVesselsLoaded - Callback fired when vessels are fetched from API
 * @param onVesselSelect - Callback fired when a vessel marker is clicked
 * @param ref - Imperative handle for programmatic map control
 */
const Map = forwardRef<
  MapHandle,
  {
    filter?: VesselFilter;
    onVesselsLoaded?: (v: Vessel[]) => void;
    onVesselSelect?: (v: Vessel) => void;
  }
>(({ filter, onVesselsLoaded, onVesselSelect }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useImperativeHandle(ref, () => ({
    flyTo: (lng, lat) => {
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 10 });
    },
  }));

  /** Build query string from filter */
  const buildQuery = (f?: VesselFilter): string => {
    if (!f) return "";
    const params = new URLSearchParams();
    if (f.type) params.set("type", f.type);
    if (f.navStatus !== undefined)
      params.set("nav_status", String(f.navStatus));
    if (f.radius) params.set("radius", String(f.radius));
    if (f.lat) params.set("lat", String(f.lat));
    if (f.lon) params.set("lon", String(f.lon));
    return params.toString() ? `?${params.toString()}` : "";
  };

  /** Fetch and display vessels */
  const loadVessels = async (map: mapboxgl.Map, f?: VesselFilter) => {
    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    try {
      const vessels: Vessel[] = await fetch(
        `/api/vessels${buildQuery(f)}`
      ).then((r) => r.json());
      onVesselsLoaded?.(vessels);

      vessels.forEach((v) => {
        const el = document.createElement("div");
        el.style.cssText = "width:20px;height:20px;cursor:pointer";
        el.innerHTML = createMarkerSvg(
          getVesselColor(v),
          v.HEADING ?? v.COG ?? 0,
          (v.SOG ?? 0) >= 0.5
        );
        el.addEventListener("click", async () => {
          onVesselSelect?.(v);
          await showVesselRoutes(map, v);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([v.LONGITUDE, v.LATITUDE])
          .addTo(map);
        markersRef.current.push(marker);
      });
    } catch (e) {
      console.error(e);
    }
  };

  /** Update or create a GeoJSON line layer */
  const setLineLayer = (
    map: mapboxgl.Map,
    sourceId: string,
    layerId: string,
    coordinates: number[][],
    color: string,
    dashed: boolean
  ) => {
    const data: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates },
    };
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(data);
    } else {
      map.addSource(sourceId, { type: "geojson", data });
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 3,
          "line-opacity": 0.9,
          ...(dashed ? { "line-dasharray": [4, 2] } : {}),
        },
      });
    }
  };

  /** Fetch and display vessel historical route + projected route */
  const showVesselRoutes = async (map: mapboxgl.Map, vessel: Vessel) => {
    // Draw projected route (1 hour ahead based on SOG/COG)
    const speed = vessel.SOG ?? 0;
    const course = vessel.COG ?? vessel.HEADING ?? 0;
    if (speed > 0.5) {
      const distanceNm = speed; // 1 hour projection
      const dest = destinationPoint(
        vessel.LATITUDE,
        vessel.LONGITUDE,
        course,
        distanceNm
      );
      setLineLayer(
        map,
        PROJECTED_SOURCE,
        PROJECTED_LAYER,
        [[vessel.LONGITUDE, vessel.LATITUDE], dest],
        "#67e8f9", // bright cyan for projected
        false
      );
    } else {
      // Clear projected route if vessel is stationary
      const src = map.getSource(PROJECTED_SOURCE) as mapboxgl.GeoJSONSource;
      if (src)
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        });
    }

    // Fetch and draw historical route
    try {
      const positions: VesselPosition[] = await fetch(
        `/api/vessels/${vessel.MMSI}/history?days=7`
      ).then((r) => r.json());

      console.log(
        "History positions:",
        positions.length,
        positions.slice(0, 3)
      );

      if (positions.length) {
        const coords = positions.map((p) => [p.lon, p.lat]);
        console.log("Drawing route with coords:", coords.length);
        setLineLayer(
          map,
          HISTORY_SOURCE,
          HISTORY_LAYER,
          coords,
          "#d1d5db", // light grey for history
          true
        );
      }
    } catch (e) {
      console.error("Failed to load route:", e);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    const map = (mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20, 59],
      zoom: 5,
    }));

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", () => loadVessels(map, filter));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (mapRef.current?.loaded()) {
      loadVessels(mapRef.current, filter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return <div ref={containerRef} className="w-full h-full" />;
});

Map.displayName = "Map";
export default Map;
