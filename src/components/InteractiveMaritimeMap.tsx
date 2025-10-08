"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// --- Dark basemap using CartoDB tiles ---
const darkStyle: any = {
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

// ---- CONFIG: set your real endpoints here ----
// TIP: Put tokens in localStorage (same key) or expose as NEXT_PUBLIC_* envs.
const API = {
  // GFW heat/traffic raster tiles (example pattern – adjust to your service)
  GFW_RASTER_TEMPLATE: "https://YOUR_GFW/tiles/{START_ISO}/{END_ISO}.png?token={TOKEN}",

  // EMODnet MVT (Vector tiles) — you MUST provide the correct source-layer names
  EMODNET_CABLES_MVT: "https://YOUR_EMODNET/cables/{z}/{x}/{y}.pbf",
  EMODNET_CABLES_SOURCE_LAYER: "cables",          // <— fix me
  EMODNET_PIPELINES_MVT: "https://YOUR_EMODNET/pipelines/{z}/{x}/{y}.pbf",
  EMODNET_PIPELINES_SOURCE_LAYER: "pipelines",    // <— fix me
  EMODNET_WINDFARMS_MVT: "https://YOUR_EMODNET/windfarms/{z}/{x}/{y}.pbf",
  EMODNET_WINDFARMS_SOURCE_LAYER: "windfarms",    // <— fix me
  EMODNET_TURBINES_MVT: "https://YOUR_EMODNET/turbines/{z}/{x}/{y}.pbf",
  EMODNET_TURBINES_SOURCE_LAYER: "turbines",      // <— fix me

  // CMEMS / CAMS as WMS rasters (must be proper WMS GetMap URLs)
  CMEMS_WAVE_WMS: "https://YOUR_CMEMS/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=YOUR_LAYER&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}&TIME={TIME}",
  CAMS_NO2_WMS:   "https://YOUR_CAMS/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=YOUR_LAYER&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}&TIME={TIME}",
};

function getToken(key: string) {
  // Prefer runtime-safe Next.js envs (NEXT_PUBLIC_*), else localStorage
  const env = (process as any)?.env?.[`NEXT_PUBLIC_${key}`] || "";
  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem(key) || "";
    return (ls || env || "").trim();
  }
  return (env || "").trim();
}

type StatusMap = Record<string, string>;

type AddLayerArgs = {
  sourceId: string;
  layerId: string;
  sourceType: "raster" | "vector";
  tiles: string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  sourceLayer?: string;      // for vector tiles (MVT)
  layerType: "raster" | "line" | "fill" | "circle";
  paint: any;
  before?: string;
};

export default function MarineOpsMap() {
  const mapRef = useRef<MapLibreMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [ready, setReady] = useState(false);
  const [apiStatus, setApiStatus] = useState<StatusMap>({});

  // Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatOpacity, setHeatOpacity] = useState(0.85);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.95);
  const [showPipelines, setShowPipelines] = useState(true);
  const [pipelinesOpacity, setPipelinesOpacity] = useState(0.95);
  const [showWindInfra, setShowWindInfra] = useState(true);
  const [windOpacity, setWindOpacity] = useState(0.9);

  // Utility: add source+layer safely
  async function addApiLayer(cfg: AddLayerArgs) {
    const m = mapRef.current;
    if (!m || !ready) return;

    try {
      if (!m.getSource(cfg.sourceId)) {
        if (cfg.sourceType === "vector") {
          m.addSource(cfg.sourceId, { type: "vector", tiles: cfg.tiles, minzoom: cfg.minzoom, maxzoom: cfg.maxzoom });
        } else {
          m.addSource(cfg.sourceId, { type: "raster", tiles: cfg.tiles, tileSize: cfg.tileSize ?? 256 });
        }
      }
      if (!m.getLayer(cfg.layerId)) {
        const layer: any = { id: cfg.layerId, type: cfg.layerType, source: cfg.sourceId, paint: cfg.paint };
        if (cfg.sourceType === "vector" && cfg.sourceLayer) layer["source-layer"] = cfg.sourceLayer;
        m.addLayer(layer, cfg.before);
      }
      setApiStatus((s) => ({ ...s, [cfg.layerId]: "Live" }));
    } catch (e: any) {
      console.error(`[Layer ${cfg.layerId}]`, e);
      setApiStatus((s) => ({ ...s, [cfg.layerId]: `Error: ${e?.message || e}` }));
    }
  }

  // Build live layers
  async function connectAPIs() {
    const m = mapRef.current;
    if (!m || !ready) {
      setApiStatus((s) => ({ ...s, all: "Map not ready" }));
      return;
    }

    // Time window example (adjust as needed)
    const startISO = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    const endISO = new Date().toISOString();
    const timeISO = endISO; // for WMS TIME param

    // --- GFW raster (heat/traffic)
    const gfwToken = getToken("GFW_TOKEN");
    await addApiLayer({
      sourceId: "gfw-src",
      layerId: "gfw-layer",
      sourceType: "raster",
      tiles: [
        API.GFW_RASTER_TEMPLATE
          .replace("{START_ISO}", encodeURIComponent(startISO))
          .replace("{END_ISO}", encodeURIComponent(endISO))
          .replace("{TOKEN}", encodeURIComponent(gfwToken || "MISSING_TOKEN"))
      ],
      layerType: "raster",
      paint: { "raster-opacity": heatOpacity },
    });

    // --- EMODnet cables (MVT)
    await addApiLayer({
      sourceId: "emodnet-cables-src",
      layerId: "emodnet-cables-layer",
      sourceType: "vector",
      tiles: [API.EMODNET_CABLES_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: API.EMODNET_CABLES_SOURCE_LAYER, // must be correct
      layerType: "line",
      paint: { "line-color": "#ff2f92", "line-width": 2.2, "line-opacity": gridOpacity },
    });

    // --- EMODnet pipelines (MVT)
    await addApiLayer({
      sourceId: "emodnet-pipelines-src",
      layerId: "emodnet-pipelines-layer",
      sourceType: "vector",
      tiles: [API.EMODNET_PIPELINES_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: API.EMODNET_PIPELINES_SOURCE_LAYER,
      layerType: "line",
      paint: { "line-color": "#33c3ff", "line-width": 2.2, "line-opacity": pipelinesOpacity, "line-dasharray": [2, 1] },
    });

    // --- Wind farms (polygons, MVT)
    await addApiLayer({
      sourceId: "emodnet-windfarms-src",
      layerId: "emodnet-windfarms-fill",
      sourceType: "vector",
      tiles: [API.EMODNET_WINDFARMS_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: API.EMODNET_WINDFARMS_SOURCE_LAYER,
      layerType: "fill",
      paint: { "fill-color": "#00ffd1", "fill-opacity": 0.12 },
    });

    // --- Turbines (points, MVT)
    await addApiLayer({
      sourceId: "emodnet-turbines-src",
      layerId: "emodnet-turbines-points",
      sourceType: "vector",
      tiles: [API.EMODNET_TURBINES_MVT],
      minzoom: 0,
      maxzoom: 12,
      sourceLayer: API.EMODNET_TURBINES_SOURCE_LAYER,
      layerType: "circle",
      paint: {
        "circle-radius": 3,
        "circle-color": "#111111",
        "circle-stroke-color": "#00ffd1",
        "circle-stroke-width": 1.5,
        "circle-opacity": windOpacity,
      },
    });

    // --- CMEMS (WMS raster)
    await addApiLayer({
      sourceId: "cmems-wave-src",
      layerId: "cmems-wave-layer",
      sourceType: "raster",
      tiles: [API.CMEMS_WAVE_WMS.replace("{TIME}", encodeURIComponent(timeISO))],
      layerType: "raster",
      paint: { "raster-opacity": 0.65 },
    });

    // --- CAMS NO2 (WMS raster)
    await addApiLayer({
      sourceId: "cams-no2-src",
      layerId: "cams-no2-layer",
      sourceType: "raster",
      tiles: [API.CAMS_NO2_WMS.replace("{TIME}", encodeURIComponent(timeISO))],
      layerType: "raster",
      paint: { "raster-opacity": 0.55 },
    });

    setApiStatus((s) => ({ ...s, all: "Connected" }));
  }

  // Init map
  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: darkStyle as any,
        center: [19.2, 57.3],
        zoom: 4.8,
        hash: true,
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));
      map.on("load", () => {
        mapRef.current = map;
        setReady(true);
      });
      return () => map.remove();
    }
  }, []);

  // Apply toggle opacities to the exact layer IDs we created above
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !ready) return;

    const setPaint = (id: string, prop: string, val: any) => {
      if (m.getLayer(id)) m.setPaintProperty(id, prop, val);
    };

    // Heat (GFW + CMEMS + CAMS use raster-opacity)
    setPaint("gfw-layer", "raster-opacity", showHeatmap ? heatOpacity : 0);
    setPaint("cmems-wave-layer", "raster-opacity", showHeatmap ? 0.65 : 0);
    setPaint("cams-no2-layer", "raster-opacity", showHeatmap ? 0.55 : 0);

    // Grid cables
    setPaint("emodnet-cables-layer", "line-opacity", showGrid ? gridOpacity : 0);

    // Pipelines
    setPaint("emodnet-pipelines-layer", "line-opacity", showPipelines ? pipelinesOpacity : 0);

    // Wind farms + turbines
    setPaint("emodnet-windfarms-fill", "fill-opacity", showWindInfra ? 0.12 : 0);
    setPaint("emodnet-turbines-points", "circle-opacity", showWindInfra ? windOpacity : 0);
  }, [showHeatmap, heatOpacity, showGrid, gridOpacity, showPipelines, pipelinesOpacity, showWindInfra, windOpacity, ready]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      {/* Side panel */}
      <aside className="absolute left-4 top-4 bottom-4 w-[360px] bg-[#0b0b0bcc] text-white p-4 z-10 rounded-xl overflow-y-auto">
        <button onClick={connectAPIs} className="px-3 py-2 bg-white/10 rounded border border-white/20 hover:bg-white/20">
          Connect APIs
        </button>

        <div className="mt-3">
          <h2 className="font-semibold mb-1">Status</h2>
          <ul className="text-sm space-y-1">
            {Object.entries(apiStatus).map(([k, v]) => (
              <li key={k}><span className="opacity-70">{k}</span>: {v}</li>
            ))}
          </ul>
        </div>

        {/* Simple toggles */}
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
            Heat overlays (GFW/CMEMS/CAMS)
          </label>
          <label className="flex items-center gap-2">
            <input type="range" min={0} max={1} step={0.05} value={heatOpacity}
                   onChange={e => setHeatOpacity(parseFloat(e.target.value))} />
            Heat opacity: {heatOpacity.toFixed(2)}
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
            Cables
          </label>
          <label className="flex items-center gap-2">
            <input type="range" min={0} max={1} step={0.05} value={gridOpacity}
                   onChange={e => setGridOpacity(parseFloat(e.target.value))} />
            Cable opacity: {gridOpacity.toFixed(2)}
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showPipelines} onChange={e => setShowPipelines(e.target.checked)} />
            Pipelines
          </label>
          <label className="flex items-center gap-2">
            <input type="range" min={0} max={1} step={0.05} value={pipelinesOpacity}
                   onChange={e => setPipelinesOpacity(parseFloat(e.target.value))} />
            Pipeline opacity: {pipelinesOpacity.toFixed(2)}
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showWindInfra} onChange={e => setShowWindInfra(e.target.checked)} />
            Wind infra (farms + turbines)
          </label>
          <label className="flex items-center gap-2">
            <input type="range" min={0} max={1} step={0.05} value={windOpacity}
                   onChange={e => setWindOpacity(parseFloat(e.target.value))} />
            Wind opacity: {windOpacity.toFixed(2)}
          </label>
        </div>
      </aside>
    </div>
  );
}

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
