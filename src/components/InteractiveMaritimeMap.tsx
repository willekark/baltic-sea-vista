import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Layers, Play, Pause } from "lucide-react";

/**
 * Interactive maritime map for layers like wind, waves, vessel traffic, and grid infrastructure.
 * - Built on MapLibre (no API key required). Uses OSM raster tiles by default.
 * - Toggle layers, control opacity, load your own GeoJSON or XYZ raster tiles.
 * - Demo vessel pings + heatmap (with basic time filtering).
 * - Production note: use your own tile server / CDN and real data feeds.
 */

// --- Dark basemap using CartoDB tiles ---
const lightStyle: any = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }],
};

// ---- PRODUCTION API CONFIG (edit these or load from env) ----
const API = {
  GFW_AIS_TILES: "https://your-gfw-api/tiles/{START}/{END}?token=${GFW_TOKEN}",
  EMODNET_GRID_CABLES_MVT: "https://your-emodnet-api/cables/{z}/{x}/{y}.mvt",
  EMODNET_PIPELINES_MVT: "https://your-emodnet-api/pipelines/{z}/{x}/{y}.mvt",
  EMODNET_WINDFARMS_MVT: "https://your-emodnet-api/windfarms/{z}/{x}/{y}.mvt",
  EMODNET_TURBINES_MVT: "https://your-emodnet-api/turbines/{z}/{x}/{y}.mvt",
  CMEMS_WAVE_TILES: "https://your-cmems-api/waves/{ISO}/{z}/{x}/{y}.png",
  CAMS_NO2_TILES: "https://your-cams-api/no2/{ISO}/{z}/{x}/{y}.png",
};

function getToken(key: string) {
  const token = localStorage.getItem(key) || process.env[key] || "";
  if (!token || token === "YOUR_TOKEN") {
    console.warn(`Missing or invalid API token for ${key}`);
    return "";
  }
  return token;
}

type RasterLayerCfg = { id: string; url: string; opacity: number; visible: boolean };

export default function MarineOpsMap() {
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = useState(false);

  // Layer toggles & settings
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatOpacity, setHeatOpacity] = useState(0.9);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.95);
  const [showEmissionZones, setShowEmissionZones] = useState(true);
  const [showPipelines, setShowPipelines] = useState(true);
  const [pipelinesOpacity, setPipelinesOpacity] = useState(0.95);
  const [showWindInfra, setShowWindInfra] = useState(true);
  const [windOpacity, setWindOpacity] = useState(0.9);

  const [rasterLayers, setRasterLayers] = useState<RasterLayerCfg[]>([]);
  const minTs = 1727395200; // demo start
  const maxTs = 1727416800; // demo end
  const [tsWindow, setTsWindow] = useState<[number, number]>([minTs, maxTs]);
  const [play, setPlay] = useState(false);

  const [apiStatus, setApiStatus] = useState<Record<string, string>>({});

  // Helper: call API source and layer, with error diagnostics
  async function addApiLayer({ id, type, tiles, tileSize, sourceLayer, paint, minzoom, maxzoom, beforeLayer }: any) {
    const m = mapRef.current;
    if (!m || !isReady) return;
    try {
      if (!m.getSource(id)) {
        if (type === "vector") {
          m.addSource(id, { type, tiles, minzoom, maxzoom });
        } else {
          m.addSource(id, { type, tiles, tileSize });
        }
        
        const layerType = paint["raster-opacity"] !== undefined ? "raster" : 
                         paint["circle-radius"] !== undefined ? "circle" : 
                         paint["line-color"] !== undefined ? "line" : "fill";
        
        const layerConfig: any = { id, type: layerType, source: id, paint };
        if (sourceLayer) layerConfig["source-layer"] = sourceLayer;
        m.addLayer(layerConfig, beforeLayer);
      }
      setApiStatus(s => ({ ...s, [id]: "Live" }));
    } catch (e: any) {
      console.error(`[API Overlay] Failed for ${id}`, e);
      setApiStatus(s => ({ ...s, [id]: `Error: ${e.message || e}` }));
    }
  }

  async function connectAPIs() {
    const m = mapRef.current;
    if (!m || !isReady) {
      setApiStatus(s => ({ ...s, all: "Map not ready" }));
      return;
    }

    // Vessel traffic (heatmap/raster)
    await addApiLayer({
      id: "gfw-vessel-tiles",
      type: "raster",
      tiles: [API.GFW_AIS_TILES.replace("${GFW_TOKEN}", encodeURIComponent(getToken("GFW_TOKEN")))
        .replace("{START}", encodeURIComponent(new Date(1727395200000).toISOString()))
        .replace("{END}", encodeURIComponent(new Date(1727416800000).toISOString()))],
      tileSize: 256,
      paint: { "raster-opacity": 0.85 },
      minzoom: undefined,
      maxzoom: undefined,
      sourceLayer: undefined,
      beforeLayer: undefined
    });

    // EMODNET cables (vector)
    await addApiLayer({
      id: "emodnet-cables",
      type: "vector",
      tiles: [API.EMODNET_GRID_CABLES_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: "layer0",
      paint: { "line-color": "#ff2f92", "line-width": 2.2, "line-opacity": 0.95 },
      tileSize: undefined,
      beforeLayer: undefined
    });

    // Pipelines (vector)
    await addApiLayer({
      id: "emodnet-pipelines",
      type: "vector",
      tiles: [API.EMODNET_PIPELINES_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: "layer0",
      paint: { "line-color": "#33c3ff", "line-width": 2.2, "line-opacity": pipelinesOpacity, "line-dasharray": [2, 1] },
      tileSize: undefined,
      beforeLayer: undefined
    });

    // Wind farm polygons
    await addApiLayer({
      id: "emodnet-windfarms",
      type: "vector",
      tiles: [API.EMODNET_WINDFARMS_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: "layer0",
      paint: { "fill-color": "#00ffd1", "fill-opacity": 0.12 },
      tileSize: undefined,
      beforeLayer: undefined
    });

    // Turbines (vector, points)
    await addApiLayer({
      id: "emodnet-turbines",
      type: "vector",
      tiles: [API.EMODNET_TURBINES_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: "layer0",
      paint: { "circle-radius": 3, "circle-color": "#141414", "circle-stroke-color": "#00ffd1", "circle-stroke-width": 1.5, "circle-opacity": windOpacity },
      tileSize: undefined,
      beforeLayer: undefined
    });

    // CMEMS wave
    await addApiLayer({
      id: "cmems-wave",
      type: "raster",
      tiles: [API.CMEMS_WAVE_TILES.replace("{ISO}", encodeURIComponent(new Date(1727402400000).toISOString()))],
      tileSize: 256,
      paint: { "raster-opacity": 0.65 },
      minzoom: undefined,
      maxzoom: undefined,
      sourceLayer: undefined,
      beforeLayer: undefined
    });

    // CAMS NO2
    await addApiLayer({
      id: "cams-no2",
      type: "raster",
      tiles: [API.CAMS_NO2_TILES.replace("{ISO}", encodeURIComponent(new Date(1727402400000).toISOString()))],
      tileSize: 256,
      paint: { "raster-opacity": 0.55 },
      minzoom: undefined,
      maxzoom: undefined,
      sourceLayer: undefined,
      beforeLayer: undefined
    });

    setApiStatus(s => ({ ...s, all: "Connected" }));
  }

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isReady) return;
    ["gfw-vessel-tiles", "vessel-heat", "vessel-heat-glow", "vessel-heat-core"].forEach(id => {
      if (m.getLayer(id)) m.setPaintProperty(id, "raster-opacity", showHeatmap ? heatOpacity : 0);
    });
    ["emodnet-cables", "grid-lines", "grid-points", "grid-labels"].forEach(id => {
      if (m.getLayer(id)) m.setPaintProperty(id, "line-opacity", showGrid ? gridOpacity : 0);
    });
    ["emodnet-pipelines-line", "pipelines-line"].forEach(id => {
      if (m.getLayer(id)) m.setPaintProperty(id, "line-opacity", showPipelines ? pipelinesOpacity : 0);
    });
    ["emodnet-windfarms-fill", "wind-farm-fill", "wind-farm-line", "turbines"].forEach(id => {
      if (m.getLayer(id)) m.setPaintProperty(id, "fill-opacity", showWindInfra ? 0.12 : 0);
      if (m.getLayer(id)) m.setPaintProperty(id, "line-opacity", showWindInfra ? windOpacity : 0);
      if (m.getLayer(id)) m.setPaintProperty(id, "circle-opacity", showWindInfra ? windOpacity : 0);
    });
    ["cmems-wave", "cams-no2"].forEach(id => {
      if (m.getLayer(id)) m.setPaintProperty(id, "raster-opacity", showHeatmap ? 0.65 : 0);
    });
  }, [showHeatmap, heatOpacity, showGrid, gridOpacity, showPipelines, pipelinesOpacity, showWindInfra, windOpacity, isReady]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: lightStyle as any,
        center: [19.2, 57.3],
        zoom: 4.8,
        hash: true,
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));

      map.on("load", () => {
        setIsReady(true);
        mapRef.current = map;
        // ... (add initial demo layers, unchanged)
      });

      return () => map.remove();
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="absolute inset-0" />
      </div>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute left-4 top-4 bottom-4 w-[380px] bg-[#0b0b0bcc] text-white p-4 z-10 rounded-xl overflow-y-auto"
      >
        <button onClick={connectAPIs}>Connect APIs</button>
        <div>
          <h2>Status</h2>
          <ul>
            {Object.entries(apiStatus).map(([key, val]) => (
              <li key={key}>{key}: {val}</li>
            ))}
          </ul>
        </div>
        {/* ...rest of your controls for toggling layers... */}
      </motion.aside>
      {/* Legend and overlays ... */}
    </div>
  );
}