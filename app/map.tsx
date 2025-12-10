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
const ROUTE_SOURCE = "vessel-route";
const ROUTE_LAYER = "vessel-route-line";

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
          await showVesselRoute(map, v.MMSI);
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

  /** Fetch and display vessel historical route */
  const showVesselRoute = async (map: mapboxgl.Map, mmsi: number) => {
    try {
      const positions: VesselPosition[] = await fetch(
        `/api/vessels/${mmsi}/history?days=7`
      ).then((r) => r.json());

      if (!positions.length) return;

      const coordinates = positions.map((p) => [p.lon, p.lat]);

      // Update or create route source
      const source = map.getSource(ROUTE_SOURCE) as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        });
      } else {
        map.addSource(ROUTE_SOURCE, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates },
          },
        });
        map.addLayer({
          id: ROUTE_LAYER,
          type: "line",
          source: ROUTE_SOURCE,
          paint: {
            "line-color": "var(--vessel-active)",
            "line-width": 2,
            "line-opacity": 0.7,
            "line-dasharray": [2, 2],
          },
        });
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
