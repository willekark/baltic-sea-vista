"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Vessel } from "./types/vessel";

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

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

        vessels.forEach((v) => {
          const color = v.isShadowFleet ? "#f85149" : "#3fb950";

          const el = document.createElement("div");
          el.className = "vessel-marker";
          el.style.cssText = `
            width: 12px;
            height: 12px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
            cursor: pointer;
          `;

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
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
