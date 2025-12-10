/**
 * Interactive Mapbox GL map component for vessel tracking.
 * Displays vessel markers and handles map interactions.
 * @module components/Map
 */

"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { type Vessel, getVesselColor, createMarkerSvg } from "./lib/vessel";

/**
 * Imperative handle for controlling the map from parent components.
 * @property flyTo - Animates the map to center on given coordinates
 */
export interface MapHandle {
  flyTo: (lng: number, lat: number) => void;
}

/**
 * Map component with vessel markers and navigation controls.
 * Fetches vessels on load and displays them with interactive popups.
 * @param onVesselsLoaded - Callback fired when vessels are fetched from API
 * @param ref - Imperative handle for programmatic map control
 */
const Map = forwardRef<MapHandle, { onVesselsLoaded?: (v: Vessel[]) => void }>(
  ({ onVesselsLoaded }, ref) => {
    /** Reference to the map container DOM element */
    const containerRef = useRef<HTMLDivElement>(null);
    /** Reference to the Mapbox GL map instance */
    const mapRef = useRef<mapboxgl.Map | null>(null);

    useImperativeHandle(ref, () => ({
      flyTo: (lng, lat) =>
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 10 }),
    }));

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

      map.on("load", async () => {
        try {
          const vessels: Vessel[] = await fetch("/api/vessels").then((r) =>
            r.json()
          );
          onVesselsLoaded?.(vessels);

          vessels.forEach((v) => {
            const el = document.createElement("div");
            el.style.cssText = "width:20px;height:20px;cursor:pointer";
            el.innerHTML = createMarkerSvg(
              getVesselColor(v),
              v.HEADING ?? v.COG ?? 0,
              (v.SOG ?? 0) >= 0.5
            );

            new mapboxgl.Marker({ element: el })
              .setLngLat([v.LONGITUDE, v.LATITUDE])
              .setPopup(
                new mapboxgl.Popup({ offset: 10 }).setHTML(
                  `<div style="color:var(--foreground);font-size:12px"><strong>${
                    v.NAME || "Unknown"
                  }</strong><br/>MMSI: ${v.MMSI}<br/>Speed: ${
                    v.SOG ?? 0
                  } kn</div>`
                )
              )
              .addTo(map);
          });
        } catch (e) {
          console.error(e);
        }
      });

      return () => {
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }, [onVesselsLoaded]);

    return <div ref={containerRef} className="w-full h-full" />;
  }
);

Map.displayName = "Map";
export default Map;
