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
const ALL_ROUTES_SOURCE = "all-vessel-routes";
const ALL_ROUTES_LAYER = "all-vessel-routes-line";
const SELECTED_ROUTE_SOURCE = "selected-vessel-route";
const SELECTED_ROUTE_LAYER = "selected-vessel-route-line";
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

      // Fetch all vessel histories in parallel
      const historyPromises = vessels.map((v) =>
        fetch(`/api/vessels/${v.MMSI}/history?days=7`)
          .then((r) => r.json())
          .then((positions: VesselPosition[]) => ({
            mmsi: v.MMSI,
            coords: positions.map((p) => [p.lon, p.lat]),
          }))
          .catch(() => ({ mmsi: v.MMSI, coords: [] as number[][] }))
      );
      const allHistories = await Promise.all(historyPromises);
      const vesselHistoryMap: Record<number, number[][]> = {};
      allHistories.forEach((h) => {
        vesselHistoryMap[h.mmsi] = h.coords;
      });

      // Draw all routes as dark grey
      const allFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = allHistories
        .filter((h) => h.coords.length > 1)
        .map((h) => ({
          type: "Feature" as const,
          properties: { mmsi: h.mmsi },
          geometry: { type: "LineString" as const, coordinates: h.coords },
        }));

      const allRoutesData: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: "FeatureCollection",
        features: allFeatures,
      };

      const allSrc = map.getSource(ALL_ROUTES_SOURCE) as mapboxgl.GeoJSONSource;
      if (allSrc) {
        allSrc.setData(allRoutesData);
      } else {
        map.addSource(ALL_ROUTES_SOURCE, {
          type: "geojson",
          data: allRoutesData,
        });
        map.addLayer({
          id: ALL_ROUTES_LAYER,
          type: "line",
          source: ALL_ROUTES_SOURCE,
          paint: {
            "line-color": "#4b5563", // dark grey
            "line-width": 1.5,
            "line-opacity": 0.6,
          },
        });
      }

      // Initialize empty selected route layer
      const selSrc = map.getSource(
        SELECTED_ROUTE_SOURCE
      ) as mapboxgl.GeoJSONSource;
      if (!selSrc) {
        map.addSource(SELECTED_ROUTE_SOURCE, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });
        map.addLayer({
          id: SELECTED_ROUTE_LAYER,
          type: "line",
          source: SELECTED_ROUTE_SOURCE,
          paint: {
            "line-color": "#e5e7eb", // bright grey
            "line-width": 3,
            "line-opacity": 0.9,
          },
        });
      }

      // Initialize empty projected route layer
      const projSrc = map.getSource(PROJECTED_SOURCE) as mapboxgl.GeoJSONSource;
      if (!projSrc) {
        map.addSource(PROJECTED_SOURCE, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });
        map.addLayer({
          id: PROJECTED_LAYER,
          type: "line",
          source: PROJECTED_SOURCE,
          paint: {
            "line-color": "#67e8f9", // bright cyan
            "line-width": 3,
            "line-opacity": 0.9,
          },
        });
      }

      vessels.forEach((v) => {
        const el = document.createElement("div");
        el.style.cssText = "width:20px;height:20px;cursor:pointer";
        el.innerHTML = createMarkerSvg(
          getVesselColor(v),
          v.HEADING ?? v.COG ?? 0,
          (v.SOG ?? 0) >= 0.5
        );
        el.addEventListener("click", () => {
          onVesselSelect?.(v);
          highlightVesselRoute(map, v, vesselHistoryMap[v.MMSI] || []);
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

  /** Highlight selected vessel route and show projected course */
  const highlightVesselRoute = (
    map: mapboxgl.Map,
    vessel: Vessel,
    coords: number[][]
  ) => {
    // Highlight historical route
    const selSrc = map.getSource(
      SELECTED_ROUTE_SOURCE
    ) as mapboxgl.GeoJSONSource;
    if (selSrc && coords.length > 1) {
      selSrc.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords },
      });
    }

    // Draw projected route
    const speed = vessel.SOG ?? 0;
    const course = vessel.COG ?? vessel.HEADING ?? 0;
    const projSrc = map.getSource(PROJECTED_SOURCE) as mapboxgl.GeoJSONSource;
    if (speed > 0.5 && projSrc) {
      const dest = destinationPoint(
        vessel.LATITUDE,
        vessel.LONGITUDE,
        course,
        speed
      );
      projSrc.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [[vessel.LONGITUDE, vessel.LATITUDE], dest],
        },
      });
    } else if (projSrc) {
      projSrc.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      });
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
