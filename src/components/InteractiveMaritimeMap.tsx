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

const topographicStyle: any = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    }
  },
  layers: [
    { 
      id: "osm", 
      type: "raster", 
      source: "osm", 
      minzoom: 0, 
      maxzoom: 19 
    }
  ],
};

const API = {
  GFW_AIS_TILES: "https://your-gfw-api/tiles/{START}/{END}?token=${GFW_TOKEN}",
  EMODNET_GRID_CABLES_MVT: "https://your-emodnet-api/cables/{z}/{x}/{y}.mvt",
  EMODNET_PIPELINES_MVT: "https://your-emodnet-api/pipelines/{z}/{x}/{y}.mvt",
  EMODNET_WINDFARMS_MVT: "https://your-emodnet-api/windfarms/{z}/{x}/{y}.mvt",
  EMODNET_TURBINES_MVT: "https://your-emodnet-api/turbines/{z}/{x}/{y}.mvt",
  CMEMS_WAVE_TILES: "https://your-cmems-api/waves/{ISO}/{z}/{x}/{y}.png",
  CAMS_NO2_TILES: "https://your-cams-api/no2/{ISO}/{z}/{x}/{y}.png",
  HELCOM_SHIPPING_WMS: "https://maps.helcom.fi/arcgis/services/HELCOM/Shipping_2019_2021/MapServer/WmsServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=0&STYLES=&SRS=EPSG:3857&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
  OPEN_METEO_MARINE: "https://marine-api.open-meteo.com/v1/marine",
  AISHUB: "https://data.aishub.net/ws.php?username={USERNAME}&format=1&output=json&compress=0",
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
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatOpacity, setHeatOpacity] = useState(0.9);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.95);
  const [showEmissionZones, setShowEmissionZones] = useState(true);
  const [showPipelines, setShowPipelines] = useState(true);
  const [pipelinesOpacity, setPipelinesOpacity] = useState(0.95);
  const [showWindInfra, setShowWindInfra] = useState(true);
  const [windOpacity, setWindOpacity] = useState(0.9);
  const [showShippingIntensity, setShowShippingIntensity] = useState(true);
  const [shippingOpacity, setShippingOpacity] = useState(0.8);
  const [showShippingContours, setShowShippingContours] = useState(true);
  const [contourOpacity, setContourOpacity] = useState(0.8);
  const [showTerrainContours, setShowTerrainContours] = useState(true);
  const [terrainOpacity, setTerrainOpacity] = useState(0.7);
  const [showHillshade, setShowHillshade] = useState(true);
  const [showWindFlow, setShowWindFlow] = useState(true);
  const [windFlowOpacity, setWindFlowOpacity] = useState(0.85);
  const [isLoadingWind, setIsLoadingWind] = useState(false);
  const [showVessels, setShowVessels] = useState(true);
  const [vesselMarkers, setVesselMarkers] = useState<maplibregl.Marker[]>([]);
  const [isLoadingVessels, setIsLoadingVessels] = useState(false);
  const [vesselCount, setVesselCount] = useState(0);
  // New state for static layers
  const [showPowerGrids, setShowPowerGrids] = useState(true);
  const [powerGridMarkers, setPowerGridMarkers] = useState<maplibregl.Marker[]>([]);
  const [showWindmills, setShowWindmills] = useState(true);
  const [windmillMarkers, setWindmillMarkers] = useState<maplibregl.Marker[]>([]);
  const [showStaticPipelines, setShowStaticPipelines] = useState(true);
  const [pipelineMarkers, setPipelineMarkers] = useState<maplibregl.Marker[]>([]);

  const [rasterLayers, setRasterLayers] = useState<RasterLayerCfg[]>([]);
  const minTs = 1727395200;
  const maxTs = 1727416800;
  const [tsWindow, setTsWindow] = useState<[number, number]>([minTs, maxTs]);
  const [play, setPlay] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, string>>({});

  function generateWindStreamlines(gridData: any[], gridStep: number) {
    const streamlines = [];
    const maxStreamlineLength = 20;
    const startPoints = gridData
      .filter(point => point.velocity > 0.5)
      .map(point => ({
        lat: point.lat,
        lon: point.lon,
        velocity: point.velocity,
        direction: point.direction
      }));
    
    startPoints.forEach(startPoint => {
      const coordinates = [];
      let currentLat = startPoint.lat;
      let currentLon = startPoint.lon;
      let currentDir = startPoint.direction;
      let currentVel = startPoint.velocity;
      
      coordinates.push([currentLon, currentLat]);
      
      for (let step = 0; step < maxStreamlineLength; step++) {
        const stepSize = Math.min(currentVel * 0.02, 0.15);
        const dirRad = (currentDir * Math.PI) / 180;
        const nextLon = currentLon + stepSize * Math.sin(dirRad);
        const nextLat = currentLat + stepSize * Math.cos(dirRad);
        
        const nearestPoint = gridData.find(point => 
          Math.abs(point.lat - nextLat) < gridStep * 0.6 && 
          Math.abs(point.lon - nextLon) < gridStep * 0.6
        );
        
        if (nearestPoint && nearestPoint.velocity > 0.1) {
          const blendFactor = 0.7;
          currentDir = currentDir * (1 - blendFactor) + nearestPoint.direction * blendFactor;
          currentVel = Math.max(currentVel * 0.95, nearestPoint.velocity * 0.5);
          coordinates.push([nextLon, nextLat]);
          currentLon = nextLon;
          currentLat = nextLat;
        } else {
          break;
        }
      }
      
      if (coordinates.length > 2) {
        streamlines.push({
          type: 'Feature',
          properties: {
            velocity: startPoint.velocity,
            intensity: Math.min(startPoint.velocity / 8, 1),
            length: coordinates.length
          },
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        });
      }
    });
    
    return streamlines;
  }

  function createShipIcon(heading: number = 0, color: string = '#1e40af') {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(${heading} 16 16)">
          <path d="M16 6 L20 18 L12 18 Z" 
                fill="${color}" 
                stroke="#ffffff" 
                stroke-width="1.5"/>
          <circle cx="16" cy="6" r="2" fill="#ffffff"/>
          <line x1="16" y1="6" x2="16" y2="2" 
                stroke="#ef4444" 
                stroke-width="2"/>
        </g>
      </svg>
    `)}`;
  }

  function createPowerGridIcon() {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="16" height="16" fill="#ff2f92" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M16 12 V20 M12 16 H20" stroke="#ffffff" stroke-width="2"/>
      </svg>
    `)}`;
  }

  function createWindmillIcon() {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 22 V10 M12 14 L16 10 L20 14" fill="#00ffd1" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="16" cy="22" r="3" fill="#141414" stroke="#00ffd1" stroke-width="1.5"/>
      </svg>
    `)}`;
  }

  function createPipelineIcon() {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 16 H24" stroke="#33c3ff" stroke-width="4" stroke-dasharray="4 2"/>
        <circle cx="16" cy="16" r="4" fill="#33c3ff" stroke="#ffffff" stroke-width="1.5"/>
      </svg>
    `)}`;
  }

  async function loadVesselsFromAISHub() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for vessel data");
      return;
    }

    setIsLoadingVessels(true);
    
    try {
      const username = localStorage.getItem('AISHUB_USERNAME') || process.env.AISHUB_USERNAME || 'DEMO';
      const apiUrl = API.AISHUB.replace('{USERNAME}', username);
      console.log('Fetching vessel data from AISHub...');
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`AISHub API failed: ${response.status}`);
      
      const data = await response.json();
      vesselMarkers.forEach(marker => marker.remove());
      setVesselMarkers([]);
      
      const vessels = data[1] || [];
      console.log(`Received ${vessels.length} vessels from AISHub`);
      
      const balticVessels = vessels.filter((vessel: any) => {
        const lat = parseFloat(vessel.LATITUDE);
        const lon = parseFloat(vessel.LONGITUDE);
        return lat >= 53.5 && lat <= 65.5 && lon >= 10 && lon <= 30;
      });
      
      console.log(`${balticVessels.length} vessels in Baltic Sea region`);
      const newMarkers: maplibregl.Marker[] = [];
      
      balticVessels.forEach((vessel: any) => {
        const lat = parseFloat(vessel.LATITUDE);
        const lon = parseFloat(vessel.LONGITUDE);
        const heading = parseFloat(vessel.HEADING) || 0;
        const speed = parseFloat(vessel.SPEED) || 0;
        const name = vessel.NAME || 'Unknown Vessel';
        const mmsi = vessel.MMSI;
        const shipType = vessel.TYPE || 'Unknown';
        
        if (isNaN(lat) || isNaN(lon)) return;
        
        const shipIconUrl = createShipIcon(heading, '#1e40af');
        const el = document.createElement('div');
        el.className = 'vessel-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundImage = `url(${shipIconUrl})`;
        el.style.backgroundSize = 'contain';
        el.style.cursor = 'pointer';
        
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: bold;">
              ${name}
            </h3>
            <div style="font-size: 12px; color: #333;">
              <div style="margin: 4px 0;"><strong>MMSI:</strong> ${mmsi}</div>
              <div style="margin: 4px 0;"><strong>Type:</strong> ${shipType}</div>
              <div style="margin: 4px 0;"><strong>Speed:</strong> ${speed.toFixed(1)} knots</div>
              <div style="margin: 4px 0;"><strong>Heading:</strong> ${heading}°</div>
              <div style="margin: 4px 0;"><strong>Position:</strong> ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</div>
            </div>
          </div>
        `);
        
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .setPopup(popup)
          .addTo(m);
        
        newMarkers.push(marker);
      });
      
      setVesselMarkers(newMarkers);
      setVesselCount(balticVessels.length);
      setApiStatus(s => ({ ...s, 'aishub-vessels': `Live (${balticVessels.length} vessels)` }));
    } catch (error: any) {
      console.error('Failed to load vessels from AISHub:', error);
      setApiStatus(s => ({ ...s, 'aishub-vessels': `Error: ${error.message}` }));
      createDemoVessels();
    } finally {
      setIsLoadingVessels(false);
    }
  }

  function loadPowerGrids() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for power grid data");
      return;
    }

    powerGridMarkers.forEach(marker => marker.remove());
    setPowerGridMarkers([]);

    const powerGrids = [
      { id: "PG1", name: "NordBalt Substation", lat: 55.8, lon: 21.2, type: "Substation", voltage: "300 kV" },
      { id: "PG2", name: "SwePol Link", lat: 54.5, lon: 18.6, type: "Converter Station", voltage: "450 kV" },
      { id: "PG3", name: "Baltic Cable", lat: 56.1, lon: 12.7, type: "Substation", voltage: "400 kV" },
    ];

    const newMarkers: maplibregl.Marker[] = [];
    powerGrids.forEach(grid => {
      const iconUrl = createPowerGridIcon();
      const el = document.createElement('div');
      el.className = 'power-grid-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #ff2f92; font-size: 14px; font-weight: bold;">
            ${grid.name}
          </h3>
          <div style="font-size: 12px; color: #333;">
            <div style="margin: 4px 0;"><strong>ID:</strong> ${grid.id}</div>
            <div style="margin: 4px 0;"><strong>Type:</strong> ${grid.type}</div>
            <div style="margin: 4px 0;"><strong>Voltage:</strong> ${grid.voltage}</div>
            <div style="margin: 4px 0;"><strong>Position:</strong> ${grid.lat.toFixed(4)}°N, ${grid.lon.toFixed(4)}°E</div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([grid.lon, grid.lat])
        .setPopup(popup)
        .addTo(m);
      
      newMarkers.push(marker);
    });

    setPowerGridMarkers(newMarkers);
    setApiStatus(s => ({ ...s, 'power-grids': `Static (${newMarkers.length} substations)` }));
  }

  function loadWindmills() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for windmill data");
      return;
    }

    windmillMarkers.forEach(marker => marker.remove());
    setWindmillMarkers([]);

    const windmills = [
      { id: "WM1", name: "Anholt Wind Farm", lat: 56.6, lon: 11.2, type: "Offshore Wind", capacity: "400 MW" },
      { id: "WM2", name: "Rødsand II", lat: 54.5, lon: 11.7, type: "Offshore Wind", capacity: "207 MW" },
      { id: "WM3", name: "Kriegers Flak", lat: 55.0, lon: 13.0, type: "Offshore Wind", capacity: "600 MW" },
    ];

    const newMarkers: maplibregl.Marker[] = [];
    windmills.forEach(windmill => {
      const iconUrl = createWindmillIcon();
      const el = document.createElement('div');
      el.className = 'windmill-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #00ffd1; font-size: 14px; font-weight: bold;">
            ${windmill.name}
          </h3>
          <div style="font-size: 12px; color: #333;">
            <div style="margin: 4px 0;"><strong>ID:</strong> ${windmill.id}</div>
            <div style="margin: 4px 0;"><strong>Type:</strong> ${windmill.type}</div>
            <div style="margin: 4px 0;"><strong>Capacity:</strong> ${windmill.capacity}</div>
            <div style="margin: 4px 0;"><strong>Position:</strong> ${windmill.lat.toFixed(4)}°N, ${windmill.lon.toFixed(4)}°E</div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([windmill.lon, windmill.lat])
        .setPopup(popup)
        .addTo(m);
      
      newMarkers.push(marker);
    });

    setWindmillMarkers(newMarkers);
    setApiStatus(s => ({ ...s, 'windmills': `Static (${newMarkers.length} wind farms)` }));
  }

  function loadStaticPipelines() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for pipeline data");
      return;
    }

    pipelineMarkers.forEach(marker => marker.remove());
    setPipelineMarkers([]);

    const pipelines = [
      { id: "PL1", name: "Nord Stream 1", lat: 60.5, lon: 27.7, type: "Gas Pipeline", length: "1224 km" },
      { id: "PL2", name: "Nord Stream 2", lat: 60.0, lon: 27.5, type: "Gas Pipeline", length: "1230 km" },
      { id: "PL3", name: "Baltic Pipe", lat: 55.5, lon: 12.5, type: "Gas Pipeline", length: "900 km" },
    ];

    const newMarkers: maplibregl.Marker[] = [];
    pipelines.forEach(pipeline => {
      const iconUrl = createPipelineIcon();
      const el = document.createElement('div');
      el.className = 'pipeline-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #33c3ff; font-size: 14px; font-weight: bold;">
            ${pipeline.name}
          </h3>
          <div style="font-size: 12px; color: #333;">
            <div style="margin: 4px 0;"><strong>ID:</strong> ${pipeline.id}</div>
            <div style="margin: 4px 0;"><strong>Type:</strong> ${pipeline.type}</div>
            <div style="margin: 4px 0;"><strong>Length:</strong> ${pipeline.length}</div>
            <div style="margin: 4px 0;"><strong>Position:</strong> ${pipeline.lat.toFixed(4)}°N, ${pipeline.lon.toFixed(4)}°E</div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pipeline.lon, pipeline.lat])
        .setPopup(popup)
        .addTo(m);
      
      newMarkers.push(marker);
    });

    setPipelineMarkers(newMarkers);
    setApiStatus(s => ({ ...s, 'static-pipelines': `Static (${newMarkers.length} pipelines)` }));
  }

  function addTerrainVisualization() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for terrain visualization");
      return;
    }

    try {
      if (!m.getSource('hillshade-source')) {
        m.addSource('hillshade-source', {
          type: 'raster-dem',
          tiles: ['https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'],
          tileSize: 512,
          maxzoom: 12
        });
      }

      if (!m.getLayer('hillshade-layer')) {
        m.addLayer({
          id: 'hillshade-layer',
          type: 'hillshade',
          source: 'hillshade-source',
          layout: { visibility: showHillshade ? 'visible' : 'none' },
          paint: {
            'hillshade-exaggeration': 0.3,
            'hillshade-shadow-color': '#000000',
            'hillshade-highlight-color': '#ffffff',
            'hillshade-accent-color': '#ffffff'
          }
        });
      }

      console.log('Hillshade layer added successfully');
      setApiStatus(s => ({ ...s, 'hillshade': 'Active' }));
      addBathymetricContours();
    } catch (error: any) {
      console.error('Failed to add terrain visualization:', error);
      setApiStatus(s => ({ ...s, 'hillshade': `Error: ${error.message}` }));
    }
  }

  function addBathymetricContours() {
    const m = mapRef.current;
    if (!m || !isReady) return;

    try {
      const bathymetricData: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { depth: 50, level: 1 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [12.0, 55.5], [13.0, 55.8], [14.5, 56.2], [16.0, 56.5],
                [17.5, 56.8], [19.0, 57.0], [20.5, 57.2], [22.0, 57.5],
                [23.0, 58.0], [24.0, 58.5], [25.0, 59.0], [26.0, 59.5]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { depth: 50, level: 1 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [12.5, 54.0], [13.5, 54.3], [15.0, 54.7], [16.5, 55.0],
                [18.0, 55.3], [19.5, 55.6], [21.0, 55.9], [22.5, 56.2]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { depth: 20, level: 0 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [11.5, 55.0], [12.5, 55.3], [14.0, 55.7], [15.5, 56.0],
                [17.0, 56.3], [18.5, 56.5], [20.0, 56.8], [21.5, 57.0],
                [23.0, 57.5], [24.5, 58.0], [25.5, 58.5], [26.5, 59.0]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { depth: 20, level: 0 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [11.0, 53.5], [12.0, 53.8], [13.5, 54.2], [15.0, 54.5],
                [16.5, 54.8], [18.0, 55.1], [19.5, 55.4], [21.0, 55.7]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { depth: 10, level: 0 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [11.0, 54.5], [12.0, 54.8], [13.5, 55.2], [15.0, 55.5],
                [16.5, 55.8], [18.0, 56.0], [19.5, 56.3], [21.0, 56.5],
                [22.5, 57.0], [23.5, 57.5], [24.5, 58.0], [25.5, 58.5]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { depth: 10, level: 0 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [10.5, 53.0], [11.5, 53.3], [13.0, 53.7], [14.5, 54.0],
                [16.0, 54.3], [17.5, 54.6], [19.0, 54.9], [20.5, 55.2]
              ]
            }
          }
        ]
      };

      if (!m.getSource('bathymetric-contours')) {
        m.addSource('bathymetric-contours', {
          type: 'geojson',
          data: bathymetricData
        });
      }

      if (!m.getLayer('bathymetric-lines')) {
        m.addLayer({
          id: 'bathymetric-lines',
          type: 'line',
          source: 'bathymetric-contours',
          paint: {
            'line-opacity': terrainOpacity,
            'line-color': [
              'match',
              ['get', 'level'],
              1, '#4A90E2',
              0, '#7ED321'
            ],
            'line-width': [
              'match',
              ['get', 'level'],
              1, 2.5,
              0, 1.5
            ],
            'line-blur': 0.5
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          }
        });
      }

      if (!m.getLayer('bathymetric-labels')) {
        m.addLayer({
          id: 'bathymetric-labels',
          type: 'symbol',
          source: 'bathymetric-contours',
          filter: ['>', ['get', 'level'], 0],
          paint: {
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
            'text-color': '#2C3E50',
            'text-opacity': terrainOpacity
          },
          layout: {
            'symbol-placement': 'line',
            'text-size': 11,
            'text-field': [
              'concat',
              ['number-format', ['get', 'depth'], {}],
              'm'
            ],
            'text-font': ['Open Sans Bold'],
            'text-rotation-alignment': 'map'
          }
        });
      }

      console.log('Bathymetric contours added successfully');
      setApiStatus(s => ({ ...s, 'bathymetric-contours': 'Active' }));
    } catch (error: any) {
      console.error('Failed to add bathymetric contours:', error);
      setApiStatus(s => ({ ...s, 'bathymetric-contours': `Error: ${error.message}` }));
    }
  }

  function addShippingDensityContours() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for shipping contours");
      return;
    }

    try {
      const densityData: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { density: 100, level: 2 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [12.5, 56.0], [12.8, 56.2], [13.0, 56.5], [13.2, 56.8],
                [13.5, 57.0], [14.0, 57.2], [15.0, 57.5], [16.0, 58.0],
                [26.0, 60.6], [27.0, 60.7], [28.0, 60.8]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { density: 80, level: 2 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [24.0, 59.5], [25.0, 59.7], [26.0, 60.0], [27.0, 60.1],
                [28.0, 60.0], [29.0, 59.9]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { density: 60, level: 1 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [18.0, 59.0], [18.2, 59.2], [18.5, 59.3], [19.0, 59.3],
                [19.5, 59.4]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { density: 50, level: 1 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [14.0, 54.5], [15.0, 54.8], [16.0, 55.0], [17.0, 55.2],
                [18.0, 55.5], [19.0, 55.8]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { density: 30, level: 0 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [18.0, 57.0], [18.5, 57.5], [19.0, 58.0], [19.5, 58.5]
              ]
            }
          }
        ]
      };

      if (!m.getSource('shipping-density-contours')) {
        m.addSource('shipping-density-contours', {
          type: 'geojson',
          data: densityData,
          lineMetrics: true
        });
      }

      if (!m.getLayer('shipping-contour-lines')) {
        m.addLayer({
          id: 'shipping-contour-lines',
          type: 'line',
          source: 'shipping-density-contours',
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['get', 'density'],
              0, 'rgba(0, 255, 0, 0.3)',
              30, 'rgba(255, 255, 0, 0.5)',
              50, 'rgba(255, 165, 0, 0.7)',
              80, 'rgba(255, 100, 0, 0.8)',
              100, 'rgba(255, 0, 0, 1)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['get', 'level'],
              0, 2,
              1, 4,
              2, 6
            ],
            'line-opacity': contourOpacity,
            'line-blur': 1
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          }
        });
      }

      if (!m.getLayer('shipping-contour-buffer')) {
        m.addLayer({
          id: 'shipping-contour-buffer',
          type: 'line',
          source: 'shipping-density-contours',
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['get', 'density'],
              0, 'rgba(0, 255, 0, 0.1)',
              30, 'rgba(255, 255, 0, 0.2)',
              50, 'rgba(255, 165, 0, 0.3)',
              80, 'rgba(255, 100, 0, 0.4)',
              100, 'rgba(255, 0, 0, 0.5)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['get', 'level'],
              0, 8,
              1, 12,
              2, 16
            ],
            'line-opacity': contourOpacity * 0.3,
            'line-blur': 3
          }
        }, 'shipping-contour-lines');
      }

      console.log('Shipping density contours added successfully');
      setApiStatus(s => ({ ...s, 'shipping-contours': 'Active (HELCOM data)' }));
    } catch (error: any) {
      console.error('Failed to add shipping contours:', error);
      setApiStatus(s => ({ ...s, 'shipping-contours': `Error: ${error.message}` }));
    }
  }

  function createDemoVessels() {
    const m = mapRef.current;
    if (!m || !isReady) return;
    
    vesselMarkers.forEach(marker => marker.remove());
    
    const demoVessels = Array.from({ length: 20 }, (_, i) => ({
      lat: 56 + Math.random() * 3,
      lon: 18 + Math.random() * 4,
      heading: Math.random() * 360,
      speed: Math.random() * 15 + 5,
      name: `Demo Vessel ${i + 1}`,
      mmsi: `211${String(i).padStart(6, '0')}`,
      type: ['Cargo', 'Tanker', 'Passenger', 'Fishing'][i % 4]
    }));
    
    const newMarkers: maplibregl.Marker[] = [];
    
    demoVessels.forEach(vessel => {
      const shipIconUrl = createShipIcon(vessel.heading, '#1e40af');
      const el = document.createElement('div');
      el.className = 'vessel-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${shipIconUrl})`;
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';
      
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: bold;">
            ${vessel.name}
          </h3>
          <div style="font-size: 12px; color: #333;">
            <div style="margin: 4px 0;"><strong>MMSI:</strong> ${vessel.mmsi}</div>
            <div style="margin: 4px 0;"><strong>Type:</strong> ${vessel.type}</div>
            <div style="margin: 4px 0;"><strong>Speed:</strong> ${vessel.speed.toFixed(1)} knots</div>
            <div style="margin: 4px 0;"><strong>Heading:</strong> ${vessel.heading.toFixed(0)}°</div>
            <div style="margin: 4px 0;"><strong>Position:</strong> ${vessel.lat.toFixed(4)}°N, ${vessel.lon.toFixed(4)}°E</div>
          </div>
        </div>
      `);
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vessel.lon, vessel.lat])
        .setPopup(popup)
        .addTo(m);
      
      newMarkers.push(marker);
    });
    
    setVesselMarkers(newMarkers);
    setVesselCount(demoVessels.length);
    setApiStatus(s => ({ ...s, 'aishub-vessels': `Demo (${demoVessels.length} vessels)` }));
  }

  async function loadWindFlowData() {
    const m = mapRef.current;
    if (!m || !isReady) {
      console.warn("Map not ready for wind data - map or isReady not available");
      return;
    }

    if (!m.isStyleLoaded || !m.isStyleLoaded()) {
      console.warn("Map style not loaded, waiting...");
      await new Promise((resolve) => {
        if (m.isStyleLoaded && m.isStyleLoaded()) {
          resolve(true);
        } else {
          const onStyleLoad = () => {
            m.off('styledata', onStyleLoad);
            resolve(true);
          };
          m.on('styledata', onStyleLoad);
          setTimeout(() => {
            m.off('styledata', onStyleLoad);
            resolve(false);
          }, 5000);
        }
      });
    }

    setIsLoadingWind(true);
    try {
      const latRange = { min: 53.5, max: 65.5 };
      const lonRange = { min: 10, max: 30 };
      const gridStep = 0.3;
      const centerLat = (latRange.min + latRange.max) / 2;
      const centerLon = (lonRange.min + lonRange.max) / 2;
      
      console.log(`Making SINGLE API call to Open-Meteo for Baltic Sea center (${centerLat}, ${centerLon})`);
      
      const response = await fetch(
        `${API.OPEN_METEO_MARINE}?latitude=${centerLat.toFixed(2)}&longitude=${centerLon.toFixed(2)}&current=ocean_current_velocity,ocean_current_direction&timezone=auto`
      );
      
      if (!response.ok) throw new Error(`API call failed: ${response.status}`);
      
      const data = await response.json();
      const centerVelocity = data.current?.ocean_current_velocity || 0;
      const centerDirection = data.current?.ocean_current_direction || 0;
      
      console.log(`Received wind data: velocity=${centerVelocity}, direction=${centerDirection}`);
      
      const results = [];
      for (let lat = latRange.min; lat <= latRange.max; lat += gridStep) {
        for (let lon = lonRange.min; lon <= lonRange.max; lon += gridStep) {
          const distanceFromCenter = Math.sqrt(
            Math.pow(lat - centerLat, 2) + Math.pow(lon - centerLon, 2)
          );
          const velocityVariation = 1 + (Math.random() - 0.5) * 0.3;
          const directionVariation = (Math.random() - 0.5) * 30;
          const adjustedVelocity = Math.max(0.1, centerVelocity * velocityVariation * (1 - distanceFromCenter * 0.1));
          
          results.push({
            lat,
            lon,
            velocity: adjustedVelocity,
            direction: (centerDirection + directionVariation + 360) % 360
          });
        }
      }
      
      console.log(`Generated ${results.length} wind data points from SINGLE API call`);
      const streamlines = generateWindStreamlines(results, gridStep);
      
      if (!m.getSource('wind-flow-streamlines')) {
        m.addSource('wind-flow-streamlines', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: streamlines
          }
        });
      } else {
        (m.getSource('wind-flow-streamlines') as any).setData({
          type: 'FeatureCollection',
          features: streamlines
        });
      }

      if (!m.getLayer('wind-flow-streamlines-layer')) {
        m.addLayer({
          id: 'wind-flow-streamlines-layer',
          type: 'line',
          source: 'wind-flow-streamlines',
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 'rgba(255,100,100,0.3)',
              0.2, 'rgba(255,150,100,0.5)',
              0.4, 'rgba(255,200,100,0.7)',
              0.6, 'rgba(255,180,80,0.8)',
              0.8, 'rgba(255,120,60,0.9)',
              1, 'rgba(255,80,40,1)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 1.5,
              0.2, 2,
              0.4, 2.5,
              0.6, 3,
              0.8, 3.5,
              1, 4
            ],
            'line-opacity': windFlowOpacity,
            'line-blur': 0.5
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          }
        });
      }

      setApiStatus(s => ({ ...s, 'open-meteo-wind': `Live (${streamlines.length} streamlines from 1 API call)` }));
    } catch (e: any) {
      console.error("Failed to load wind flow data:", e);
      setApiStatus(s => ({ ...s, 'open-meteo-wind': `Error: ${e.message}` }));
    } finally {
      setIsLoadingWind(false);
    }
  }

  async function addApiLayer({ id, type, tiles, tileSize, sourceLayer, paint, minzoom, maxzoom, beforeLayer }: any) {
    const m = mapRef.current;
    if (!m || !isReady || !m.isStyleLoaded || !m.isStyleLoaded()) return;
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
    if (!m || !isReady || !m.isStyleLoaded || !m.isStyleLoaded()) {
      setApiStatus(s => ({ ...s, all: "Map not ready" }));
      return;
    }

    addShippingDensityContours();

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

    await addApiLayer({
      id: "helcom-shipping-intensity",
      type: "raster",
      tiles: [API.HELCOM_SHIPPING_WMS],
      tileSize: 256,
      paint: { "raster-opacity": shippingOpacity },
      minzoom: undefined,
      maxzoom: undefined,
      sourceLayer: undefined,
      beforeLayer: undefined
    });

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
    
    if (!m.isStyleLoaded || !m.isStyleLoaded()) return;
    
    try {
      if (m.getLayer("vessel-heat")) {
        m.setPaintProperty("vessel-heat", "heatmap-opacity", showHeatmap ? heatOpacity : 0);
      }
      
      ["gfw-vessel-tiles", "cmems-wave", "cams-no2"].forEach(id => {
        if (m.getLayer(id)) {
          m.setPaintProperty(id, "raster-opacity", showHeatmap ? 0.65 : 0);
        }
      });
      
      if (m.getLayer("helcom-shipping-intensity")) {
        m.setPaintProperty("helcom-shipping-intensity", "raster-opacity", showShippingIntensity ? shippingOpacity : 0);
      }
      
      ["emodnet-cables", "grid-lines"].forEach(id => {
        if (m.getLayer(id)) {
          m.setPaintProperty(id, "line-opacity", showGrid ? gridOpacity : 0);
        }
      });
      
      ["emodnet-pipelines", "pipelines-line"].forEach(id => {
        if (m.getLayer(id)) {
          m.setPaintProperty(id, "line-opacity", showPipelines ? pipelinesOpacity : 0);
        }
      });
      
      if (m.getLayer("wind-farm-fill")) {
        m.setPaintProperty("wind-farm-fill", "fill-opacity", showWindInfra ? 0.12 : 0);
      }
      if (m.getLayer("wind-farm-line")) {
        m.setPaintProperty("wind-farm-line", "line-opacity", showWindInfra ? windOpacity : 0);
      }
      ["emodnet-windfarms", "emodnet-turbines"].forEach(id => {
        if (m.getLayer(id)) {
          const layer = m.getLayer(id);
          if (layer && layer.type === 'fill') {
            m.setPaintProperty(id, "fill-opacity", showWindInfra ? 0.12 : 0);
          } else if (layer && layer.type === 'circle') {
            m.setPaintProperty(id, "circle-opacity", showWindInfra ? windOpacity : 0);
          } else if (layer && layer.type === 'line') {
            m.setPaintProperty(id, "line-opacity", showWindInfra ? windOpacity : 0);
          }
        }
      });
      
      if (m.getLayer("wind-flow-streamlines-layer")) {
        m.setPaintProperty("wind-flow-streamlines-layer", "line-opacity", showWindFlow ? windFlowOpacity : 0);
      }
      
      if (m.getLayer("shipping-contour-lines")) {
        m.setPaintProperty("shipping-contour-lines", "line-opacity", showShippingContours ? contourOpacity : 0);
      }
      if (m.getLayer("shipping-contour-buffer")) {
        m.setPaintProperty("shipping-contour-buffer", "line-opacity", showShippingContours ? contourOpacity * 0.3 : 0);
      }
      
      if (m.getLayer("bathymetric-lines")) {
        m.setPaintProperty("bathymetric-lines", "line-opacity", showTerrainContours ? terrainOpacity : 0);
      }
      if (m.getLayer("bathymetric-labels")) {
        m.setPaintProperty("bathymetric-labels", "text-opacity", showTerrainContours ? terrainOpacity : 0);
      }
      
      if (m.getLayer("hillshade-layer")) {
        m.setLayoutProperty("hillshade-layer", "visibility", showHillshade ? "visible" : "none");
      }
    } catch (e) {
      console.warn("Error updating layer properties:", e);
    }
  }, [showHeatmap, heatOpacity, showGrid, gridOpacity, showPipelines, pipelinesOpacity, showWindInfra, windOpacity, showShippingIntensity, shippingOpacity, showWindFlow, windFlowOpacity, showShippingContours, contourOpacity, showTerrainContours, terrainOpacity, showHillshade, isReady]);

  useEffect(() => {
    if (showWindFlow && isReady && mapRef.current) {
      const hasStreamlines = mapRef.current.getLayer('wind-flow-streamlines-layer');
      if (!hasStreamlines) {
        loadWindFlowData();
        addShippingDensityContours();
        createDemoVessels();
      }
    }
    if (showPowerGrids && isReady && mapRef.current) {
      loadPowerGrids();
    }
    if (showWindmills && isReady && mapRef.current) {
      loadWindmills();
    }
    if (showStaticPipelines && isReady && mapRef.current) {
      loadStaticPipelines();
    }
  }, [showWindFlow, showPowerGrids, showWindmills, showStaticPipelines, isReady]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: topographicStyle as any,
        center: [19.2, 57.3],
        zoom: 6,
        hash: true,
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));

      map.on("load", () => {
        mapRef.current = map;

        map.addSource('vessel-heat-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: Array.from({ length: 50 }, (_, i) => ({
              type: 'Feature',
              properties: { intensity: Math.random() },
              geometry: {
                type: 'Point',
                coordinates: [
                  18 + Math.random() * 4,
                  56 + Math.random() * 3
                ]
              }
            }))
          }
        });
        
        map.addLayer({
          id: 'vessel-heat',
          type: 'heatmap',
          source: 'vessel-heat-source',
          paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': 0.9,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.2, 'rgb(0, 0, 255)',
              0.4, 'rgb(0,255,255)',
              0.6, 'rgb(0,255,0)',
              0.8, 'rgb(255,255,0)',
              1, 'rgb(255,0,0)'
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': heatOpacity
          }
        });

        setIsReady(true);
        
        setTimeout(() => {
          if (showWindFlow) {
            console.log("Auto-loading wind flow data...");
            loadWindFlowData().catch(console.error);
          }
        }, 2000);
        
        setTimeout(() => {
          if (showVessels) {
            console.log("Auto-loading vessel data from AISHub...");
            loadVesselsFromAISHub().catch(console.error);
          }
        }, 3000);
        
        setTimeout(() => {
          console.log("Auto-loading terrain visualization...");
          addTerrainVisualization();
        }, 500);
        
        setTimeout(() => {
          if (showShippingContours) {
            console.log("Auto-loading shipping density contours...");
            addShippingDensityContours();
          }
        }, 1500);
        
        setTimeout(() => {
          if (showPowerGrids) {
            console.log("Auto-loading power grid data...");
            loadPowerGrids();
          }
        }, 1000);
        
        setTimeout(() => {
          if (showWindmills) {
            console.log("Auto-loading windmill data...");
            loadWindmills();
          }
        }, 1200);
        
        setTimeout(() => {
          if (showStaticPipelines) {
            console.log("Auto-loading static pipeline data...");
            loadStaticPipelines();
          }
        }, 1400);
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
        className="absolute left-4 top-4 bottom-4 w-[380px] bg-[#0b0b0bcc] text-white p-4 z-10 rounded-xl overflow-y-auto space-y-4"
      >
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5" />
              Maritime Map Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={connectAPIs} className="w-full">
              Connect External APIs
            </Button>
            
            {Object.keys(apiStatus).length > 0 && (
              <div className="text-xs">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  API Status
                </h3>
                <div className="space-y-1 text-white/70">
            {Object.entries(apiStatus).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className={val === "Live" ? "text-green-400" : "text-yellow-400"}>
                        {val}
                      </span>
                    </div>
                  ))}
        </div>
              </div>
            )}

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Terrain Hillshade
                </Label>
                <Switch
                  checked={showHillshade}
                  onCheckedChange={setShowHillshade}
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Bathymetric Contours
                </Label>
                <Switch
                  checked={showTerrainContours}
                  onCheckedChange={setShowTerrainContours}
                />
              </div>
              {showTerrainContours && (
                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Opacity: {Math.round(terrainOpacity * 100)}%</Label>
                  <Slider
                    value={[terrainOpacity]}
                    onValueChange={(v) => setTerrainOpacity(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-1"
                  />
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Depth Contours:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Major contours (50m+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Minor contours (10-20m)</span>
                    </div>
                    <div className="text-white/50 mt-2 text-xs">
                      Baltic Sea bathymetry
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  HELCOM Shipping Traffic
                </Label>
                <Switch
                  checked={showShippingIntensity}
                  onCheckedChange={setShowShippingIntensity}
                />
              </div>
              {showShippingIntensity && (
                <div>
                  <Label className="text-xs text-white/70">Opacity: {Math.round(shippingOpacity * 100)}%</Label>
                  <Slider
                    value={[shippingOpacity]}
                    onValueChange={(v) => setShippingOpacity(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Shipping Density Contours
                </Label>
                <Switch
                  checked={showShippingContours}
                  onCheckedChange={setShowShippingContours}
                />
              </div>
              {showShippingContours && (
                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Opacity: {Math.round(contourOpacity * 100)}%</Label>
                  <Slider
                    value={[contourOpacity]}
                    onValueChange={(v) => setContourOpacity(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-1"
                  />
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Traffic Density:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(0, 255, 0, 0.7)'}}></div>
                      <span>Low (0-30 vessels/day)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255, 255, 0, 0.7)'}}></div>
                      <span>Medium-Low (30-50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255, 165, 0, 0.7)'}}></div>
                      <span>Medium (50-80)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255, 100, 0, 0.7)'}}></div>
                      <span>High (80-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255, 0, 0, 0.9)'}}></div>
                      <span>Very High (&gt;100)</span>
                    </div>
                    <div className="text-white/50 mt-2 text-xs">
                      Based on HELCOM shipping routes 2019-2021
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Ocean Currents Flow (Open-Meteo)
                </Label>
                <Switch
                  checked={showWindFlow}
                  onCheckedChange={setShowWindFlow}
                />
              </div>
              {showWindFlow && (
                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Opacity: {Math.round(windFlowOpacity * 100)}%</Label>
                  <Slider
                    value={[windFlowOpacity]}
                    onValueChange={(v) => setWindFlowOpacity(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-1"
                  />
                  <Button 
                    onClick={loadWindFlowData} 
                    disabled={isLoadingWind}
                    size="sm"
                    className="w-full text-xs"
                  >
                    {isLoadingWind ? "Loading..." : "Load Current Data"}
                  </Button>
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Flow Intensity:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255,100,100,0.3)'}}></div>
                      <span>Low (0-1 km/h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255,150,100,0.5)'}}></div>
                      <span>Light (1-2 km/h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255,200,100,0.7)'}}></div>
                      <span>Moderate (2-4 km/h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255,180,80,0.8)'}}></div>
                      <span>Strong (4-6 km/h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255,120,60,0.9)'}}></div>
                      <span>Very Strong (6-8 km/h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{backgroundColor: 'rgba(255,80,40,1)'}}></div>
                      <span>Extreme (&gt;8 km/h)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Real-time Vessels (AISHub)
                </Label>
                <Switch
                  checked={showVessels}
                  onCheckedChange={(checked) => {
                    setShowVessels(checked);
                    if (checked) {
                      loadVesselsFromAISHub();
                    } else {
                      vesselMarkers.forEach(marker => marker.remove());
                      setVesselMarkers([]);
                    }
                  }}
                />
              </div>
              {showVessels && (
                <div className="space-y-2">
                  <Button 
                    onClick={loadVesselsFromAISHub} 
                    disabled={isLoadingVessels}
                    size="sm"
                    className="w-full text-xs"
                  >
                    {isLoadingVessels ? "Loading..." : `Refresh Vessels (${vesselCount})`}
                  </Button>
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Vessel Information:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span>Ship Icon: Shows heading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span>Red arrow: Direction</span>
                    </div>
                    <div className="text-white/50 mt-2 text-xs">
                      Click on vessel for details (MMSI, speed, position)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Power Grids
                </Label>
                <Switch
                  checked={showPowerGrids}
                  onCheckedChange={(checked) => {
                    setShowPowerGrids(checked);
                    if (checked) {
                      loadPowerGrids();
                    } else {
                      powerGridMarkers.forEach(marker => marker.remove());
                      setPowerGridMarkers([]);
                    }
                  }}
                />
              </div>
              {showPowerGrids && (
                <div className="space-y-2">
                  <Button 
                    onClick={loadPowerGrids} 
                    size="sm"
                    className="w-full text-xs"
                  >
                    Refresh Power Grids ({powerGridMarkers.length})
                  </Button>
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Power Grid Information:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span>Substation/Converter Station</span>
                    </div>
                    <div className="text-white/50 mt-2 text-xs">
                      Click for details (ID, type, voltage)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">Power Grids</Label>
                <Switch
                  checked={showPowerGrids}
                  onCheckedChange={(checked) => {
                    setShowPowerGrids(checked);
                    if (!checked) {
                      powerGridMarkers.forEach(marker => marker.remove());
                      setPowerGridMarkers([]);
                    }
                  }}
                />
              </div>
              {showPowerGrids && (
                <div className="space-y-2">
                  <Button onClick={loadPowerGrids} size="sm" className="w-full text-xs">
                    Refresh Power Grids ({powerGridMarkers.length})
                  </Button>
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Power Grid Information:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span>Substation/Converter Station</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">Windmills</Label>
                <Switch
                  checked={showWindmills}
                  onCheckedChange={(checked) => {
                    setShowWindmills(checked);
                    if (!checked) {
                      windmillMarkers.forEach(marker => marker.remove());
                      setWindmillMarkers([]);
                    }
                  }}
                />
              </div>
              {showWindmills && (
                <div className="space-y-2">
                  <Button onClick={loadWindmills} size="sm" className="w-full text-xs">
                    Refresh Windmills ({windmillMarkers.length})
                  </Button>
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Windmill Information:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                      <span>Offshore Wind Farm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">Pipelines</Label>
                <Switch
                  checked={showStaticPipelines}
                  onCheckedChange={(checked) => {
                    setShowStaticPipelines(checked);
                    if (!checked) {
                      pipelineMarkers.forEach(marker => marker.remove());
                      setPipelineMarkers([]);
                    }
                  }}
                />
              </div>
              {showStaticPipelines && (
                <div className="space-y-2">
                  <Button onClick={loadStaticPipelines} size="sm" className="w-full text-xs">
                    Refresh Pipelines ({pipelineMarkers.length})
                  </Button>
                  <div className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded">
                    <div className="font-semibold mb-1">Pipeline Information:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                      <span>Gas Pipeline</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Vessel Heatmap
                </Label>
                <Switch
                  checked={showHeatmap}
                  onCheckedChange={setShowHeatmap}
                />
              </div>
              {showHeatmap && (
                <div>
                  <Label className="text-xs text-white/70">Opacity: {Math.round(heatOpacity * 100)}%</Label>
                  <Slider
                    value={[heatOpacity]}
                    onValueChange={(v) => setHeatOpacity(v[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-1"
                  />
                </div>
              )}
        </div>

            
          </CardContent>
        </Card>
      </motion.aside>
      {/* Legend and overlays ... */}
    </div>
  );
}
