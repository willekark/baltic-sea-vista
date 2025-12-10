"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Vessel } from "./types/vessel";

export interface MapHandle {
  flyTo: (lng: number, lat: number) => void;
}

interface MapProps {
  onVesselsLoaded?: (vessels: Vessel[]) => void;
}

const Map = forwardRef<MapHandle, MapProps>(({ onVesselsLoaded }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lng, lat) => {
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 10 });
    },
  }));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20, 59],
      zoom: 5,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", async () => {
      try {
        const res = await fetch("/api/vessels");
        const vessels: Vessel[] = await res.json();

        onVesselsLoaded?.(vessels);

        vessels.forEach((v) => {
          const color = v.isShadowFleet ? "#f85149" : "#3fb950";
          const heading = v.HEADING ?? v.COG ?? 0;
          const isMoving = (v.SOG ?? 0) >= 0.5;

          const el = document.createElement("div");
          el.style.cssText = `
            width: 20px;
            height: 20px;
            cursor: pointer;
            transform: rotate(${heading}deg);
          `;

          // Triangle SVG for moving vessels, diamond for stationary
          el.innerHTML = isMoving
            ? `<svg viewBox="0 0 20 20" fill="${color}">
                <path d="M10 2 L18 18 L10 14 L2 18 Z" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
               </svg>`
            : `<svg viewBox="0 0 20 20" fill="${color}">
                <path d="M10 2 L18 10 L10 18 L2 10 Z" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
               </svg>`;

          new mapboxgl.Marker({ element: el })
            .setLngLat([v.LONGITUDE, v.LATITUDE])
            .setPopup(
              new mapboxgl.Popup({ offset: 10 }).setHTML(`
                <div style="color: #fff; font-size: 12px;">
                  <strong>${v.NAME || "Unknown"}</strong><br/>
                  MMSI: ${v.MMSI}<br/>
                  Speed: ${v.SOG ?? 0} kn
                </div>
              `)
            )
            .addTo(map);
        });
      } catch (err) {
        console.error("Failed to load vessels:", err);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onVesselsLoaded]);

  return <div ref={containerRef} className="w-full h-full" />;
});

Map.displayName = "Map";
export default Map;
