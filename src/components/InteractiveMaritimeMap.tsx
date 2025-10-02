import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Layers, Upload, Wand2, Play, Pause } from "lucide-react";

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
  // Vessel presence/heatmap tiles (PNG or MVT). Example with token as query param.
  GFW_AIS_TILES: "https://YOUR_GFW_TILE_SERVER/vessel-presence/{z}/{x}/{y}.png?style=presence&start={START}&end={END}&key=${GFW_TOKEN}",

  // CMEMS proxy endpoints you host that return XYZ tiles for wave height, wind speed, surface currents
  CMEMS_WAVE_TILES: "https://your-proxy.example.com/cmems/wave-hs/{z}/{x}/{y}.png?time={ISO}",
  CMEMS_WIND_VECTOR: "https://your-proxy.example.com/cmems/wind-arrows/{z}/{x}/{y}.mvt?time={ISO}",
  CMEMS_CURRENT_VECTOR: "https://your-proxy.example.com/cmems/currents/{z}/{x}/{y}.mvt?time={ISO}",

  // EMODnet Human Activities WMS/WFS proxy -> XYZ/MVT you host (recommended for speed)
  EMODNET_GRID_CABLES_MVT: "https://your-proxy.example.com/emodnet/grid-cables/{z}/{x}/{y}.mvt",
  EMODNET_WINDFARMS_MVT: "https://your-proxy.example.com/emodnet/windfarms/{z}/{x}/{y}.mvt",

  // CAMS air-quality tiles (via your proxy)
  CAMS_NO2_TILES: "https://your-proxy.example.com/cams/no2/{z}/{x}/{y}.png?time={ISO}",
};

// Resolve tokens: read from window.ENV or local storage
const getToken = (name: string) => (window as any)?.ENV?.[name] || localStorage.getItem(name) || "";

// Little helper to add headers to all requests (MapLibre supports transformRequest)
const authTransformRequest = (url: string, resourceType?: string) => {
  const headers: Record<string, string> = {};
  // Examples: attach Authorization only for your domains
  if (url.includes("your-proxy.example.com")) {
    const token = getToken("API_BEARER");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  if (url.includes("YOUR_GFW_TILE_SERVER")) {
    // If GFW uses header auth instead of query param
    const gfw = getToken("GFW_TOKEN");
    if (gfw) headers["x-api-key"] = gfw;
  }
  return { url, headers };
};

// --- Tiny demo dataset: vessel pings in the Baltic (timestamps in epoch seconds) ---
const demoVesselPings: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: [
    // Gdańsk -> Gotland corridor (fake sample points)
    { type: "Feature", properties: { ts: 1727395200, sog: 12 }, geometry: { type: "Point", coordinates: [18.65, 54.35] } },
    { type: "Feature", properties: { ts: 1727398800, sog: 13 }, geometry: { type: "Point", coordinates: [19.2, 55.0] } },
    { type: "Feature", properties: { ts: 1727402400, sog: 13 }, geometry: { type: "Point", coordinates: [19.9, 55.7] } },
    { type: "Feature", properties: { ts: 1727406000, sog: 14 }, geometry: { type: "Point", coordinates: [20.6, 56.3] } },
    { type: "Feature", properties: { ts: 1727409600, sog: 14 }, geometry: { type: "Point", coordinates: [21.4, 57.0] } },
    { type: "Feature", properties: { ts: 1727413200, sog: 15 }, geometry: { type: "Point", coordinates: [21.9, 57.5] } },
    { type: "Feature", properties: { ts: 1727416800, sog: 15 }, geometry: { type: "Point", coordinates: [18.07, 59.33] } }, // Stockholm (jump)
  ],
};

// --- Tiny demo grid (HVDC cables and substations) ---
const demoGrid: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "HVDC Cable (demo)" },
      geometry: {
        type: "LineString",
        coordinates: [
          [11.87, 57.7], // Gothenburg area
          [12.7, 56.0],
          [14.3, 55.4],
          [16.0, 55.3], // south Baltic
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Substation: Nynäshamn (demo)" },
      geometry: { type: "Point", coordinates: [18.0, 58.9] },
    },
    {
      type: "Feature",
      properties: { name: "Offshore Hub (demo)" },
      geometry: { type: "Point", coordinates: [19.8, 56.2] },
    },
  ],
};

// Generic JSON fetch with retry/backoff + error surface
async function fetchJSON<T = any>(url: string, opts: RequestInit = {}, retries = 2): Promise<T> {
  try {
    const res = await fetch(url, { ...opts, headers: { "Accept": "application/json", ...(opts.headers||{}) } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 400 * (3 - retries)));
      return fetchJSON(url, opts, retries - 1);
    }
    throw e;
  }
}
// Utility to read uploaded GeoJSON files
async function readGeoJSON(file: File): Promise<GeoJSON.FeatureCollection | null> {
  const text = await file.text();
  try {
    const json = JSON.parse(text);
    return json as GeoJSON.FeatureCollection;
  } catch (e) {
    console.error("Invalid GeoJSON", e);
    return null;
  }
}

// Layer configuration type
type RasterLayerCfg = { id: string; url: string; opacity: number; visible: boolean };

export default function MarineOpsMap() {
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = useState(false);

  // THEME: dark glass UI + Baltic neon palette
  const PALETTE = {
    heat: [
      "rgba(0,0,0,0)",
      "#00ffd1", // mint
      "#2bff00", // neon green lanes
      "#b5ff00",
      "#ffd400",
      "#ff6a00",
      "#ff0033", // hotspot red
    ],
    gridLine: "#ff2f92",
    gridPoint: "#141414",
    label: "#eaeaea",
  } as const;

  // Layer toggles & settings
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatOpacity, setHeatOpacity] = useState(0.9);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.95);
  const [showEmissionZones, setShowEmissionZones] = useState(true);

  const [rasterLayers, setRasterLayers] = useState<RasterLayerCfg[]>([]);

  // Time filtering
  const minTs = 1727395200; // demo start
  const maxTs = 1727416800; // demo end
  const [tsWindow, setTsWindow] = useState<[number, number]>([minTs, maxTs]);
  const [play, setPlay] = useState(false);

  // Emission zones (demo Baltic SECA/NECA envelope)
  const demoECA: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Baltic SECA/NECA (demo)", sox: "≤0.10% m/m", nox: "Tier III (newbuilds ≥2021)" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [9.0, 54.5], [14.5, 54.3], [18.8, 54.3], [21.0, 55.0], [24.5, 57.0], [28.0, 59.6], [26.0, 60.8], [24.1, 60.2], [20.1, 59.5], [18.5, 59.7], [16.0, 57.8], [12.0, 55.5], [9.0, 54.5]
            ],
          ],
        },
      },
    ],
  };

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: lightStyle as any,
        center: [19.2, 57.3],
        zoom: 4.8,
        hash: true,
        transformRequest: authTransformRequest,
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));

      map.on("load", () => {
        setIsReady(true);
        mapRef.current = map;

        // Vessel pings
        map.addSource("vessel-pings", { type: "geojson", data: demoVesselPings });
        
        // Base heatmap layer (kept invisible, serves as base)
        map.addLayer({
          id: "vessel-heat",
          type: "heatmap",
          source: "vessel-pings",
          maxzoom: 10,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "sog"], 0, 0, 25, 1],
            "heatmap-intensity": 1.3,
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0.00, PALETTE.heat[0],
              0.15, PALETTE.heat[1],
              0.35, PALETTE.heat[2],
              0.55, PALETTE.heat[3],
              0.75, PALETTE.heat[4],
              0.90, PALETTE.heat[5],
              1.00, PALETTE.heat[6],
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 28],
            "heatmap-opacity": 0.02,
          },
        } as any);

        // Glow layer (softer, wider spread with blue/cyan)
        map.addLayer({
          id: "vessel-heat-glow",
          type: "heatmap",
          source: "vessel-pings",
          maxzoom: 10,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "sog"], 0, 0, 25, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 8, 1.4, 10, 1.8],
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0.00, "rgba(0,0,0,0)",
              0.05, "#001f7a",
              0.15, "#0033cc",
              0.30, "#00b3ff",
              0.45, "#00fff0",
              0.60, "#57ffb3"
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 3, 6, 18, 9, 34],
            "heatmap-opacity": 0.55
          }
        } as any);

        // Core layer (neon green → yellow → orange → red)
        map.addLayer({
          id: "vessel-heat-core",
          type: "heatmap",
          source: "vessel-pings",
          maxzoom: 10,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "sog"], 0, 0, 25, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1.0, 8, 1.8, 10, 2.2],
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0.00, "rgba(0,0,0,0)",
              0.20, "#2bff00",
              0.40, "#b5ff00",
              0.60, "#ffd400",
              0.80, "#ff6a00",
              1.00, "#ff0033"
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 6, 12, 9, 22],
            "heatmap-opacity": heatOpacity
          }
        } as any);

        // Debug layer - shows actual vessel ping points
        map.addLayer({
          id: "vessel-debug-points",
          type: "circle",
          source: "vessel-pings",
          paint: {
            "circle-radius": 6,
            "circle-color": "#00ffd1",
            "circle-stroke-color": "#111",
            "circle-stroke-width": 1.5
          }
        });

        // Grid
        map.addSource("grid", { type: "geojson", data: demoGrid });
        map.addLayer({ id: "grid-lines", type: "line", source: "grid", filter: ["==", ["geometry-type"], "LineString"], paint: { "line-color": PALETTE.gridLine, "line-width": 2.8, "line-opacity": gridOpacity } });
        map.addLayer({ id: "grid-points", type: "circle", source: "grid", filter: ["==", ["geometry-type"], "Point"], paint: { "circle-radius": 6, "circle-color": PALETTE.gridPoint, "circle-stroke-color": PALETTE.gridLine, "circle-stroke-width": 2, "circle-opacity": gridOpacity } });
        map.addLayer({ id: "grid-labels", type: "symbol", source: "grid", filter: ["==", ["geometry-type"], "Point"], layout: { "text-field": ["get", "name"], "text-offset": [0, 1.2], "text-size": 12 }, paint: { "text-color": PALETTE.label, "text-halo-color": "#0b0b0b", "text-halo-width": 1.4, "text-opacity": gridOpacity } });

        // Emission control area
        map.addSource("eca", { type: "geojson", data: demoECA });
        map.addLayer({ id: "eca-fill", type: "fill", source: "eca", paint: { "fill-color": "#6a5acd", "fill-opacity": 0.12 } });
        map.addLayer({ id: "eca-line", type: "line", source: "eca", paint: { "line-color": "#a994ff", "line-width": 1.5, "line-dasharray": [2, 2], "line-opacity": 0.9 } });

        // Time filter - apply to all vessel layers
        ["vessel-heat", "vessel-heat-glow", "vessel-heat-core"].forEach(id => {
          if (map.getLayer(id)) {
            map.setFilter(id, ["all", [">=", ["get", "ts"], tsWindow[0]], ["<=", ["get", "ts"], tsWindow[1]]] as any);
          }
        });

        // Cursor feedback
        map.on("mouseenter", "grid-points", () => map.getCanvas().style.cursor = "pointer");
        map.on("mouseleave", "grid-points", () => map.getCanvas().style.cursor = "");
        map.on("click", "grid-points", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          new maplibregl.Popup({ closeButton: true })
            .setLngLat((f.geometry as any).coordinates)
            .setHTML(`<div class='font-medium'>${f.properties?.name || "Asset"}</div><div class='text-xs opacity-80'>Energy infrastructure</div>`) 
            .addTo(map);
        });
      });

      return () => map.remove();
    }
  }, []);

  // UI reactions
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isReady) return;
    ["vessel-heat", "vessel-heat-glow", "vessel-heat-core"].forEach(id => {
      if (!m.getLayer(id)) return;
      const val = !showHeatmap
        ? 0
        : id.includes("core")
          ? heatOpacity
          : id === "vessel-heat"
            ? 0.02     // keep old layer invisible
            : Math.min(0.6, heatOpacity * 0.7); // glow
      m.setPaintProperty(id, "heatmap-opacity", val);
    });
  }, [heatOpacity, showHeatmap, isReady]);
  useEffect(() => { const m = mapRef.current; if (!m || !isReady) return; ["grid-lines","grid-points","grid-labels"].forEach((id)=>{ if (!m.getLayer(id)) return; const prop = id.includes("labels")?"text-opacity": id.includes("points")?"circle-opacity":"line-opacity"; const val = showGrid? gridOpacity: 0; m.setPaintProperty(id, prop as any, val); }); }, [gridOpacity, showGrid, isReady]);
  useEffect(() => { const m = mapRef.current; if (!m || !isReady) return; const v = showEmissionZones ? 1 : 0; if (m.getLayer("eca-fill")) m.setPaintProperty("eca-fill", "fill-opacity", showEmissionZones ? 0.12 : 0); if (m.getLayer("eca-line")) m.setPaintProperty("eca-line", "line-opacity", v); }, [showEmissionZones, isReady]);
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isReady) return;
    ["vessel-heat", "vessel-heat-glow", "vessel-heat-core"].forEach(id => {
      if (m.getLayer(id)) {
        m.setFilter(id, ["all", [">=", ["get", "ts"], tsWindow[0]], ["<=", ["get", "ts"], tsWindow[1]]] as any);
      }
    });
  }, [tsWindow, isReady]);
  useEffect(() => { if (!play) return; const id = setInterval(() => { setTsWindow(([a,b])=>{ const step=600; const width=b-a; let na=a+step, nb=b+step; if (nb>maxTs){na=minTs; nb=minTs+width;} return [na,nb]; }); }, 450); return () => clearInterval(id); }, [play]);

  // Raster layer add/remove
  const addRaster = (url: string) => {
    const id = `raster-${Math.random().toString(36).slice(2, 8)}`;
    setRasterLayers((prev) => [...prev, { id, url, opacity: 0.75, visible: true }]);
    const m = mapRef.current; if (!m || !isReady) return;
    if (!m.getSource(id)) {
      m.addSource(id, { type: "raster", tiles: [url], tileSize: 256 });
      m.addLayer({ id, type: "raster", source: id, paint: { "raster-opacity": 0.75 } }, "vessel-heat-glow");
    }
  };

  useEffect(() => { const m = mapRef.current; if (!m || !isReady) return; rasterLayers.forEach((rl)=>{ const exists = m.getSource(rl.id); if (!exists){ m.addSource(rl.id,{ type:"raster", tiles:[rl.url], tileSize:256}); m.addLayer({ id: rl.id, type:"raster", source: rl.id, paint:{"raster-opacity": rl.opacity}}, "vessel-heat-glow"); } else if (m.getLayer(rl.id)){ m.setPaintProperty(rl.id, "raster-opacity", rl.visible ? rl.opacity : 0);} }); }, [rasterLayers, isReady]);

  const onGeoJSONUpload = async (file?: File | null) => { if (!file) return; const data = await readGeoJSON(file); if (!data) return; const id = `geojson-${Math.random().toString(36).slice(2, 8)}`; const m = mapRef.current; if (!m || !isReady) return; m.addSource(id, { type: "geojson", data }); m.addLayer({ id: `${id}-fill`, type: "fill", source: id, filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "#2684ff", "fill-opacity": 0.25 } }); m.addLayer({ id: `${id}-line`, type: "line", source: id, filter: ["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "MultiLineString"]], paint: { "line-color": "#2684ff", "line-width": 2 } }); m.addLayer({ id: `${id}-pt`, type: "circle", source: id, filter: ["==", ["geometry-type"], "Point"], paint: { "circle-color": "#111", "circle-stroke-color": "#2684ff", "circle-stroke-width": 2, "circle-radius": 5 } }); };

  // Legend component (static for demo; dynamic in prod)
  const Legend = () => (
    <div className="pointer-events-auto rounded-2xl bg-[#0b0b0bcc] text-white p-3 shadow-xl border border-white/10">
      <div className="font-semibold mb-2">Legend</div>
      <div className="text-xs space-y-2">
        <div>
          <div className="opacity-80">Vessel density</div>
          <div className="flex items-center gap-1 mt-1">
            {PALETTE.heat.slice(1).map((c, i) => (<span key={i} className="h-2 w-6 rounded" style={{ background: c }} />))}
          </div>
        </div>
        <div className="flex items-center gap-2"><span className="h-0.5 w-6" style={{ background: PALETTE.gridLine }} /> <span>HV cable / line</span></div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border-2" style={{ borderColor: PALETTE.gridLine }} /> <span>Substation / hub</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-6 rounded bg-[#6a5acd]"/> <span>ECA (SECA/NECA)</span></div>
      </div>
    </div>
  );

  // API status display
  const [apiStatus, setApiStatus] = useState<Record<string, string>>({});

  // Example: connect real APIs on demand
  async function connectAPIs() {
    const m = mapRef.current; if (!m || !isReady) return;

    // 1) Vessel heatmap via tiles
    try {
      setApiStatus(s => ({ ...s, gfw: "Connecting..." }));
      const start = new Date(1727395200000).toISOString();
      const end = new Date(1727416800000).toISOString();
      const token = getToken("GFW_TOKEN") || "YOUR_TOKEN";
      const url = API.GFW_AIS_TILES
        .replace("${GFW_TOKEN}", encodeURIComponent(token))
        .replace("{START}", encodeURIComponent(start))
        .replace("{END}", encodeURIComponent(end));
      const id = "gfw-vessel-tiles";
      if (!m.getSource(id)) {
        m.addSource(id, { type: "raster", tiles: [url], tileSize: 256 });
        m.addLayer({ id, type: "raster", source: id, paint: { "raster-opacity": 0.9 } }, "vessel-heat");
      }
      setApiStatus(s => ({ ...s, gfw: "Live" }));
    } catch (e:any) {
      console.error(e);
      setApiStatus(s => ({ ...s, gfw: `Error: ${e.message||e}` }));
    }

    // 2) EMODnet cables (vector)
    try {
      setApiStatus(s => ({ ...s, emodnet: "Connecting..." }));
      const id = "emodnet-cables";
      if (!m.getSource(id)) {
        m.addSource(id, { type: "vector", tiles: [API.EMODNET_GRID_CABLES_MVT], minzoom: 0, maxzoom: 12 });
        m.addLayer({ id: `${id}-line`, type: "line", source: id, "source-layer": "layer0", paint: { "line-color": "#ff2f92", "line-width": 2.2, "line-opacity": 0.95 } }, "grid-lines");
      }
      setApiStatus(s => ({ ...s, emodnet: "Live" }));
    } catch (e:any) {
      console.error(e);
      setApiStatus(s => ({ ...s, emodnet: `Error: ${e.message||e}` }));
    }

    // 3) CMEMS Wave tiles
    try {
      setApiStatus(s => ({ ...s, cmemsWave: "Connecting..." }));
      const iso = new Date(1727402400000).toISOString();
      const id = "cmems-wave";
      if (!m.getSource(id)) {
        const tiles = [API.CMEMS_WAVE_TILES.replace("{ISO}", encodeURIComponent(iso))];
        m.addSource(id, { type: "raster", tiles, tileSize: 256 });
        m.addLayer({ id, type: "raster", source: id, paint: { "raster-opacity": 0.65 } }, "vessel-heat");
      }
      setApiStatus(s => ({ ...s, cmemsWave: "Live" }));
    } catch (e:any) {
      console.error(e);
      setApiStatus(s => ({ ...s, cmemsWave: `Error: ${e.message||e}` }));
    }

    // 4) CAMS NO2 tiles
    try {
      setApiStatus(s => ({ ...s, cams: "Connecting..." }));
      const iso = new Date(1727402400000).toISOString();
      const id = "cams-no2";
      if (!m.getSource(id)) {
        const tiles = [API.CAMS_NO2_TILES.replace("{ISO}", encodeURIComponent(iso))];
        m.addSource(id, { type: "raster", tiles, tileSize: 256 });
        m.addLayer({ id, type: "raster", source: id, paint: { "raster-opacity": 0.55 } }, "vessel-heat");
      }
      setApiStatus(s => ({ ...s, cams: "Live" }));
    } catch (e:any) {
      console.error(e);
      setApiStatus(s => ({ ...s, cams: `Error: ${e.message||e}` }));
    }
  }

  return (
    <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-[380px_1fr]">
      {/* Left control panel */}
      <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="bg-[#0b0b0bcc] text-white backdrop-blur border-r border-white/10 p-3 lg:p-4 overflow-y-auto">
        <Card className="mb-3 shadow-sm bg-transparent border-white/10">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Layers className="w-4 h-4"/>Data Layers</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label className="font-medium text-white">Vessel Traffic</Label><Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} /></div>
              <div><Label>Opacity</Label><Slider value={[Math.round(heatOpacity * 100)]} onValueChange={(v) => setHeatOpacity(v[0]/100)} step={1} min={0} max={100}/></div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={play?"secondary":"default"} onClick={() => setPlay(p=>!p)}>{play? <Pause className="w-4 h-4 mr-1"/>:<Play className="w-4 h-4 mr-1"/>}{play?"Pause":"Play"}</Button>
                <div className="text-xs opacity-80">Window: {Math.round((tsWindow[1]-tsWindow[0])/60)} min</div>
              </div>
              <div>
                <Label>Filter window</Label>
                <Slider value={[((tsWindow[0]-minTs)/(maxTs-minTs))*100, ((tsWindow[1]-minTs)/(maxTs-minTs))*100]} onValueChange={(v)=>{ const toTs=(pct:number)=> minTs + (pct/100)*(maxTs-minTs); setTsWindow([toTs(v[0]), toTs(v[1])] as [number, number]); }} step={1} min={0} max={100}/>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between"><Label className="font-medium text-white">Energy Grid</Label><Switch checked={showGrid} onCheckedChange={setShowGrid} /></div>
              <div><Label>Opacity</Label><Slider value={[Math.round(gridOpacity * 100)]} onValueChange={(v) => setGridOpacity(v[0]/100)} step={1} min={0} max={100}/></div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between"><Label className="font-medium text-white">Emission Control Areas</Label><Switch checked={showEmissionZones} onCheckedChange={setShowEmissionZones} /></div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <Label className="font-medium">Add raster tiles (XYZ)</Label>
              <div className="flex gap-2">
                <Input id="raster-url" placeholder="https://server/{z}/{x}/{y}.png" className="bg-black/20 border-white/10 text-white placeholder:text-white/40"/>
                <Button onClick={() => { const inp = document.getElementById("raster-url") as HTMLInputElement | null; if (inp && inp.value) addRaster(inp.value); }}>Add</Button>
              </div>
              <div className="space-y-2">
                {rasterLayers.map((rl, i) => (
                  <div key={rl.id} className="rounded-lg border border-white/10 p-2 bg-black/20">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm" title={rl.url}>{rl.url}</div>
                      <Switch checked={rl.visible} onCheckedChange={(v)=> setRasterLayers(prev => prev.map((p,idx)=> idx===i? { ...p, visible: v }: p))}/>
                    </div>
                    <div className="mt-1"><Label className="text-xs">Opacity</Label><Slider value={[Math.round(rl.opacity*100)]} onValueChange={(v)=> setRasterLayers(prev => prev.map((p,idx)=> idx===i? { ...p, opacity: v[0]/100 }: p))} step={1} min={0} max={100}/></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10">
              <Label className="font-medium">Add GeoJSON (local)</Label>
              <Input type="file" accept=".geojson,application/geo+json,application/json" onChange={(e)=> onGeoJSONUpload(e.target.files?.[0]) } className="bg-black/20 border-white/10 text-white file:text-white"/>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-transparent border-white/10">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Info className="w-4 h-4"/>Status</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3 text-white/80">
            <div className="flex justify-between"><span>Active layers</span><span>{[showHeatmap, showGrid, showEmissionZones].filter(Boolean).length}/3</span></div>
            <div className="flex justify-between"><span>Map mode</span><span>{Object.values(apiStatus).some(v=>v==="Live")? "Live" : "Mock"}</span></div>
            <div className="flex justify-between"><span>Center</span><span>Baltic AOI</span></div>
            <Button onClick={connectAPIs} className="w-full">Connect APIs</Button>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-black/30 p-2"><div className="opacity-70">Vessel tiles</div><div>{apiStatus.gfw || "—"}</div></div>
              <div className="rounded bg-black/30 p-2"><div className="opacity-70">EMODnet grid</div><div>{apiStatus.emodnet || "—"}</div></div>
              <div className="rounded bg-black/30 p-2"><div className="opacity-70">CMEMS wave</div><div>{apiStatus.cmemsWave || "—"}</div></div>
              <div className="rounded bg-black/30 p-2"><div className="opacity-70">CAMS NO₂</div><div>{apiStatus.cams || "—"}</div></div>
            </div>
          </CardContent>
        </Card>
      </motion.aside>

      {/* Map slot */}
      <div className="relative w-full h-[60vh] lg:h-full">
        <div ref={mapContainerRef} className="absolute inset-0" />
        <div className="absolute right-3 bottom-3"><Legend/></div>
      </div>
    </div>
  );
}
