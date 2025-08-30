import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  Waves, 
  Wind, 
  Thermometer, 
  Activity,
  Droplets,
  Leaf,
  Snowflake,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';

interface IntelligenceMapProps {
  basin: string;
  depth: string;
  showBaseline: boolean;
}

interface MapLayer {
  id: string;
  name: string;
  icon: React.ElementType;
  visible: boolean;
  type: 'fill' | 'circle' | 'line' | 'raster';
  color?: string;
}

const IntelligenceMap: React.FC<IntelligenceMapProps> = ({ basin, depth, showBaseline }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'currents', name: 'Currents', icon: Navigation, visible: true, type: 'line', color: '#3b82f6' },
    { id: 'waves', name: 'Waves', icon: Waves, visible: false, type: 'fill', color: '#06b6d4' },
    { id: 'wind', name: 'Wind', icon: Wind, visible: false, type: 'line', color: '#10b981' },
    { id: 'sst', name: 'Temperature', icon: Thermometer, visible: false, type: 'fill', color: '#f59e0b' },
    { id: 'sealevel', name: 'Sea Level', icon: Activity, visible: false, type: 'fill', color: '#8b5cf6' },
    { id: 'oxygen', name: 'Oxygen', icon: Droplets, visible: false, type: 'fill', color: '#06b6d4' },
    { id: 'chlorophyll', name: 'Chlorophyll', icon: Leaf, visible: false, type: 'fill', color: '#22c55e' },
    { id: 'seaice', name: 'Sea Ice', icon: Snowflake, visible: false, type: 'fill', color: '#e5e7eb' }
  ]);

  // Baltic Sea bounds
  const BALTIC_BOUNDS: [number, number, number, number] = [10.0, 53.0, 31.0, 66.0];
  
  // Basin centers for fly-to functionality
  const BASIN_CENTERS = {
    baltic_proper: [18.0, 57.0],
    gulf_of_finland: [25.0, 60.0],
    gulf_of_riga: [23.5, 57.5],
    bothnian_sea: [19.0, 62.0],
    bothnian_bay: [21.0, 64.5],
    kattegat: [11.5, 57.5]
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with a fallback token or basic style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [18.0, 57.0],
      zoom: 5,
      maxBounds: BALTIC_BOUNDS
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addDataLayers();
      addMockData();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current && BASIN_CENTERS[basin]) {
      map.current.flyTo({
        center: BASIN_CENTERS[basin] as [number, number],
        zoom: basin === 'baltic_proper' ? 5 : 6,
        duration: 1000
      });
    }
  }, [basin]);

  const addDataLayers = () => {
    if (!map.current) return;

    // Add sources for different data layers
    const dataSources = {
      'currents-data': {
        type: 'geojson' as const,
        data: {
          type: 'FeatureCollection' as const,
          features: []
        }
      },
      'waves-data': {
        type: 'geojson' as const,
        data: {
          type: 'FeatureCollection' as const, 
          features: []
        }
      },
      'temperature-data': {
        type: 'geojson' as const,
        data: {
          type: 'FeatureCollection' as const,
          features: []
        }
      }
    };

    Object.entries(dataSources).forEach(([id, source]) => {
      if (!map.current!.getSource(id)) {
        map.current!.addSource(id, source);
      }
    });

    // Add layers
    layers.forEach(layer => {
      if (map.current!.getLayer(layer.id)) return;

      switch (layer.type) {
        case 'line':
          map.current!.addLayer({
            id: layer.id,
            type: 'line',
            source: layer.id === 'currents' ? 'currents-data' : 'waves-data',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
              visibility: layer.visible ? 'visible' : 'none'
            },
            paint: {
              'line-color': layer.color || '#3b82f6',
              'line-width': 2,
              'line-opacity': 0.8
            }
          });
          break;
        case 'fill':
          map.current!.addLayer({
            id: layer.id,
            type: 'fill',
            source: layer.id === 'sst' ? 'temperature-data' : 'waves-data',
            layout: {
              visibility: layer.visible ? 'visible' : 'none'
            },
            paint: {
              'fill-color': layer.color || '#06b6d4',
              'fill-opacity': 0.6
            }
          });
          break;
        case 'circle':
          map.current!.addLayer({
            id: layer.id,
            type: 'circle',
            source: 'temperature-data',
            layout: {
              visibility: layer.visible ? 'visible' : 'none'
            },
            paint: {
              'circle-radius': 6,
              'circle-color': layer.color || '#f59e0b',
              'circle-opacity': 0.8
            }
          });
          break;
      }
    });
  };

  const addMockData = () => {
    if (!map.current) return;

    // Generate mock current vectors
    const currentFeatures = [];
    for (let lat = 54; lat < 61; lat += 1) {
      for (let lon = 12; lon < 26; lon += 2) {
        const angle = Math.random() * 360;
        const magnitude = Math.random() * 0.5;
        const endLat = lat + Math.cos(angle * Math.PI / 180) * magnitude;
        const endLon = lon + Math.sin(angle * Math.PI / 180) * magnitude;
        
        currentFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[lon, lat], [endLon, endLat]]
          },
          properties: {
            speed: magnitude,
            direction: angle
          }
        });
      }
    }

    // Generate mock temperature grid
    const temperatureFeatures = [];
    for (let lat = 54; lat < 61; lat += 0.5) {
      for (let lon = 12; lon < 26; lon += 0.5) {
        const temp = 8 + Math.random() * 6;
        temperatureFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          properties: {
            temperature: temp,
            anomaly: (Math.random() - 0.5) * 2
          }
        });
      }
    }

    // Update sources with data
    const currentsSource = map.current.getSource('currents-data') as mapboxgl.GeoJSONSource;
    if (currentsSource) {
      currentsSource.setData({
        type: 'FeatureCollection',
        features: currentFeatures
      });
    }

    const temperatureSource = map.current.getSource('temperature-data') as mapboxgl.GeoJSONSource;
    if (temperatureSource) {
      temperatureSource.setData({
        type: 'FeatureCollection',
        features: temperatureFeatures
      });
    }
  };

  const toggleLayer = (layerId: string) => {
    if (!map.current) return;

    const newLayers = layers.map(layer => {
      if (layer.id === layerId) {
        const newVisible = !layer.visible;
        map.current!.setLayoutProperty(
          layerId,
          'visibility',
          newVisible ? 'visible' : 'none'
        );
        return { ...layer, visible: newVisible };
      }
      return layer;
    });

    setLayers(newLayers);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Layer Controls */}
      <Card className="absolute top-4 left-4 z-10 max-w-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4" />
            <span className="font-medium text-sm">Data Layers</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {layers.map(layer => {
              const IconComponent = layer.icon;
              return (
                <Button
                  key={layer.id}
                  variant={layer.visible ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2 text-xs"
                  onClick={() => toggleLayer(layer.id)}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="hidden sm:inline">{layer.name}</span>
                  {layer.visible ? (
                    <Eye className="h-3 w-3 ml-auto" />
                  ) : (
                    <EyeOff className="h-3 w-3 ml-auto opacity-50" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Indicator */}
      <Card className="absolute bottom-4 left-4 z-10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {basin.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge variant="outline">
              {depth}
            </Badge>
            {showBaseline && (
              <Badge variant="secondary">
                Baseline
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligenceMap;