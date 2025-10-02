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
import { Info, Layers, Upload, Play, Pause } from "lucide-react";

/**
 * Interactive maritime map for layers like wind, waves, vessel traffic, and grid infrastructure.
 * - Built on MapLibre (no API key required). Uses OSM raster tiles by default.
 * - Toggle layers, control opacity, load your own GeoJSON or XYZ raster tiles.
 * - Demo vessel pings + heatmap (with basic time filtering).
 * - Production note: use your own tile server / CDN and real data feeds.
 */

// --- Simple OSM light style using XYZ tiles (swap for your own) ---
const lightStyle: any = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        "© OpenStreetMap contributors | Basemap for demo only; use your own tiles in production.",
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 },
  ],
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

export default function InteractiveMaritimeMap() {
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = useState(false);

  // Layer toggles & settings
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatOpacity, setHeatOpacity] = useState(0.85);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.9);

  const [rasterLayers, setRasterLayers] = useState<RasterLayerCfg[]>([
    // Example (commented out): { id: "wind-tiles", url: "https://.../{z}/{x}/{y}.png", opacity: 0.7, visible: false }
  ]);

  // Time filtering (hours window around demo epoch range)
  const minTs = 1727395200; // demo start
  const maxTs = 1727416800; // demo end
  const [tsWindow, setTsWindow] = useState<[number, number]>([minTs, maxTs]);
  const [play, setPlay] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: lightStyle as any,
        center: [18.5, 56.3],
        zoom: 4.5,
        hash: true,
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));

      map.on("load", () => {
        setIsReady(true);
        mapRef.current = map;

        // Add vessel pings source
        map.addSource("vessel-pings", {
          type: "geojson",
          data: demoVesselPings,
        });

        // Heatmap layer
        map.addLayer({
          id: "vessel-heat",
          type: "heatmap",
          source: "vessel-pings",
          maxzoom: 9,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "sog"], 0, 0, 20, 1],
            "heatmap-intensity": 1.2,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(0,0,255,0)",
              0.2, "#1e90ff",
              0.4, "#00ffff",
              0.6, "#39ff14",
              0.8, "#ffd700",
              1, "#ff4500",
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 8, 24],
            "heatmap-opacity": heatOpacity,
          },
        } as any);

        // Grid source & layers
        map.addSource("grid", { type: "geojson", data: demoGrid });
        map.addLayer({
          id: "grid-lines",
          type: "line",
          source: "grid",
          filter: ["==", ["geometry-type"], "LineString"],
          paint: { "line-color": "#ff0066", "line-width": 2.5, "line-opacity": gridOpacity },
        });
        map.addLayer({
          id: "grid-points",
          type: "circle",
          source: "grid",
          filter: ["==", ["geometry-type"], "Point"],
          paint: {
            "circle-radius": 6,
            "circle-color": "#111",
            "circle-stroke-color": "#ff0066",
            "circle-stroke-width": 2,
            "circle-opacity": gridOpacity,
          },
        });
        map.addLayer({
          id: "grid-labels",
          type: "symbol",
          source: "grid",
          filter: ["==", ["geometry-type"], "Point"],
          layout: { "text-field": ["get", "name"], "text-offset": [0, 1.2], "text-size": 12 },
          paint: { "text-color": "#111", "text-halo-color": "#ffffff", "text-halo-width": 1.2, "text-opacity": gridOpacity },
        });

        // Initial time filter
        map.setFilter("vessel-heat", ["all", [">=", ["get", "ts"], tsWindow[0]], ["<=", ["get", "ts"], tsWindow[1]]]);
      });

      return () => map.remove();
    }
  }, []);

  // React to UI changes: opacity & visibility
  useEffect(() => {
    const m = mapRef.current; if (!m || !isReady) return;
    if (m.getLayer("vessel-heat")) m.setPaintProperty("vessel-heat", "heatmap-opacity", showHeatmap ? heatOpacity : 0);
  }, [heatOpacity, showHeatmap, isReady]);

  useEffect(() => {
    const m = mapRef.current; if (!m || !isReady) return;
    ["grid-lines", "grid-points", "grid-labels"].forEach((id) => {
      if (!m.getLayer(id)) return;
      const prop = id.includes("labels") ? "text-opacity" : id.includes("points") ? "circle-opacity" : "line-opacity";
      const val = showGrid ? gridOpacity : 0;
      m.setPaintProperty(id, prop as any, val);
    });
  }, [gridOpacity, showGrid, isReady]);

  // Time filter updates
  useEffect(() => {
    const m = mapRef.current; if (!m || !isReady) return;
    if (m.getLayer("vessel-heat")) {
      m.setFilter("vessel-heat", ["all", [">=", ["get", "ts"], tsWindow[0]], ["<=", ["get", "ts"], tsWindow[1]]]);
    }
  }, [tsWindow, isReady]);

  // Simple playhead that moves the window forward
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => {
      setTsWindow(([a, b]) => {
        const step = 600; // 10 minutes
        const width = b - a;
        let na = a + step;
        let nb = b + step;
        if (nb > maxTs) { na = minTs; nb = minTs + width; }
        return [na, nb];
      });
    }, 500);
    return () => clearInterval(id);
  }, [play]);

  // Raster layer add/remove
  const addRaster = (url: string) => {
    const id = `raster-${Math.random().toString(36).slice(2, 8)}`;
    setRasterLayers((prev) => [...prev, { id, url, opacity: 0.75, visible: true }]);
    const m = mapRef.current; if (!m || !isReady) return;
    if (!m.getSource(id)) {
      m.addSource(id, { type: "raster", tiles: [url], tileSize: 256 });
      m.addLayer({ id, type: "raster", source: id, paint: { "raster-opacity": 0.75 } }, "vessel-heat");
    }
  };

  useEffect(() => {
    const m = mapRef.current; if (!m || !isReady) return;
    rasterLayers.forEach((rl) => {
      const exists = m.getSource(rl.id);
      if (!exists) {
        m.addSource(rl.id, { type: "raster", tiles: [rl.url], tileSize: 256 });
        m.addLayer({ id: rl.id, type: "raster", source: rl.id, paint: { "raster-opacity": rl.opacity } }, "vessel-heat");
      } else if (m.getLayer(rl.id)) {
        m.setPaintProperty(rl.id, "raster-opacity", rl.visible ? rl.opacity : 0);
      }
    });
  }, [rasterLayers, isReady]);

  // Handle local GeoJSON upload (adds as a new source + layers)
  const onGeoJSONUpload = async (file?: File | null) => {
    if (!file) return;
    const data = await readGeoJSON(file);
    if (!data) return;
    const id = `geojson-${Math.random().toString(36).slice(2, 8)}`;
    const m = mapRef.current; if (!m || !isReady) return;
    m.addSource(id, { type: "geojson", data });
    m.addLayer({ id: `${id}-fill`, type: "fill", source: id, filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "#2684ff", "fill-opacity": 0.25 } });
    m.addLayer({ id: `${id}-line`, type: "line", source: id, filter: ["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "MultiLineString"]], paint: { "line-color": "#2684ff", "line-width": 2 } });
    m.addLayer({ id: `${id}-pt`, type: "circle", source: id, filter: ["==", ["geometry-type"], "Point"], paint: { "circle-color": "#111", "circle-stroke-color": "#2684ff", "circle-stroke-width": 2, "circle-radius": 5 } });
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-[360px_1fr]">
      {/* Left control panel */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card/80 backdrop-blur border-r p-3 lg:p-4 overflow-y-auto"
      >
        <Card className="mb-3 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><Layers className="w-4 h-4"/>Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vessel heatmap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Vessel traffic (heatmap)</Label>
                <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
              </div>
              <div>
                <Label>Opacity</Label>
                <Slider value={[Math.round(heatOpacity * 100)]} onValueChange={(v) => setHeatOpacity(v[0] / 100)} step={1} min={0} max={100} />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={play ? "secondary" : "default"} onClick={() => setPlay((p) => !p)}>
                  {play ? <Pause className="w-4 h-4 mr-1"/> : <Play className="w-4 h-4 mr-1"/>}{play ? "Pause" : "Play"}
                </Button>
                <div className="text-xs text-muted-foreground">Time window: {Math.round((tsWindow[1]-tsWindow[0])/60)} min</div>
              </div>
              <div>
                <Label>Filter window</Label>
                <Slider value={[((tsWindow[0]-minTs)/(maxTs-minTs))*100, ((tsWindow[1]-minTs)/(maxTs-minTs))*100]}
                  onValueChange={(v) => {
                    const toTs = (pct:number)=> minTs + (pct/100)*(maxTs-minTs);
                    setTsWindow([toTs(v[0]), toTs(v[1])] as [number, number]);
                  }} step={1} min={0} max={100} />
              </div>
            </div>

            {/* Grid */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Energy grid (demo)</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
              <div>
                <Label>Opacity</Label>
                <Slider value={[Math.round(gridOpacity * 100)]} onValueChange={(v) => setGridOpacity(v[0] / 100)} step={1} min={0} max={100} />
              </div>
            </div>

            {/* Raster add */}
            <div className="space-y-3 pt-3 border-t">
              <Label className="font-medium">Add raster tiles (XYZ)</Label>
              <div className="flex gap-2">
                <Input id="raster-url" placeholder="https://server/{z}/{x}/{y}.png or .mvt" />
                <Button onClick={() => {
                  const inp = document.getElementById("raster-url") as HTMLInputElement | null;
                  if (inp && inp.value) addRaster(inp.value);
                }}>Add</Button>
              </div>
              <div className="space-y-2">
                {rasterLayers.map((rl, i) => (
                  <div key={rl.id} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm" title={rl.url}>{rl.url}</div>
                      <Switch checked={rl.visible} onCheckedChange={(v) => setRasterLayers((prev) => prev.map((p, idx) => idx===i ? { ...p, visible: v } : p))} />
                    </div>
                    <div className="mt-1">
                      <Label className="text-xs">Opacity</Label>
                      <Slider value={[Math.round(rl.opacity * 100)]}
                        onValueChange={(v) => setRasterLayers((prev) => prev.map((p, idx) => idx===i ? { ...p, opacity: v[0]/100 } : p))}
                        step={1} min={0} max={100} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-2 pt-3 border-t">
              <Label className="font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Add GeoJSON (local)</Label>
              <Input type="file" accept=".geojson,application/geo+json,application/json" onChange={(e)=> onGeoJSONUpload(e.target.files?.[0]) } />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><Info className="w-4 h-4"/>Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• Paste a public XYZ URL for wind/wave tiles or WMS-proxied layers. Example pattern: <code>https://your-tiles/{"{z}"}/{"{x}"}/{"{y}"}.png</code>.</p>
            <p>• Upload GeoJSON with a <code>ts</code> property to enable time filtering (used by the heatmap demo).</p>
            <p>• Replace the basemap style or center/zoom to your AOI. For production, serve your own basemap tiles.</p>
          </CardContent>
        </Card>
      </motion.aside>

      {/* Map */}
      <div ref={mapContainerRef} className="relative w-full h-[60vh] lg:h-full" />
    </div>
  );
}
