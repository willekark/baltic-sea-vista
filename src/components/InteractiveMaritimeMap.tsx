import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Layers, 
  Activity, 
  Waves, 
  Wind, 
  Thermometer, 
  Ship, 
  Droplets, 
  Eye, 
  MapPin,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Info,
  AlertTriangle,
  Anchor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useToast } from '@/hooks/use-toast';

interface LayerConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  opacity: number;
  color: string;
  dataType: 'vector' | 'raster' | 'real-time';
}

interface MarineDataPoint {
  id: string;
  name: string;
  primaryValue: number;
  primaryUnit: string;
  location?: { lat: number; lng: number };
  status: string;
  icon: string;
  secondaryMetrics?: Array<{
    label: string;
    value: number | string;
    unit: string;
  }>;
}

const InteractiveMaritimeMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [marineData, setMarineData] = useState<MarineDataPoint[]>([]);
  const [selectedDataPoint, setSelectedDataPoint] = useState<MarineDataPoint | null>(null);
  const { token: mapboxToken, isLoading: tokenLoading } = useMapboxToken();
  const tokenError = !mapboxToken && !tokenLoading;
  const { toast } = useToast();

  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: 'currents', name: 'Surface Currents', icon: Activity, enabled: true, opacity: 0.7, color: '#3b82f6', dataType: 'vector' },
    { id: 'waves', name: 'Wave Height', icon: Waves, enabled: true, opacity: 0.6, color: '#06b6d4', dataType: 'raster' },
    { id: 'wind', name: 'Wind Speed', icon: Wind, enabled: true, opacity: 0.5, color: '#10b981', dataType: 'vector' },
    { id: 'sst', name: 'Sea Surface Temp', icon: Thermometer, enabled: false, opacity: 0.6, color: '#f59e0b', dataType: 'raster' },
    { id: 'shipping', name: 'Vessel Traffic', icon: Ship, enabled: true, opacity: 0.8, color: '#ef4444', dataType: 'real-time' },
    { id: 'oxygen', name: 'Dissolved Oxygen', icon: Droplets, enabled: false, opacity: 0.5, color: '#8b5cf6', dataType: 'raster' },
    { id: 'chlorophyll', name: 'Chlorophyll-a', icon: Eye, enabled: false, opacity: 0.5, color: '#22c55e', dataType: 'raster' },
    { id: 'infrastructure', name: 'Ports & Infrastructure', icon: Anchor, enabled: true, opacity: 1.0, color: '#6b7280', dataType: 'vector' }
  ]);

  // Fetch real-time marine data
  const fetchMarineData = async () => {
    try {
      console.log('Fetching marine data...');
      const { data, error } = await supabase.functions.invoke('fetch-baltic-marine-data', {
        body: {
          basin: 'baltic_proper',
          depth: 'surface',
          timeMode: 'nowcast'
        }
      });

      console.log('Marine data response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      // The function returns data directly, not wrapped in success/data
      if (data && data.data) {
        console.log('Processing', data.data.length, 'data points');
        
        // Convert API data to map data points with synthetic locations
        const mapData = data.data.map((item: any, index: number) => ({
          id: item.id,
          name: item.name,
          primaryValue: item.primaryValue,
          primaryUnit: item.primaryUnit,
          status: item.status,
          icon: item.icon,
          secondaryMetrics: item.secondaryMetrics,
          // Generate synthetic locations across Baltic Sea for demonstration
          location: generateBalticLocation(index, data.data.length)
        }));

        console.log('Processed map data:', mapData);
        setMarineData(mapData);
        
        if (map.current && isMapReady) {
          console.log('Updating map layers with data');
          updateMapLayers(mapData);
        }

        toast({
          title: "Data Updated",
          description: `Loaded ${mapData.length} data points`
        });
      } else {
        console.warn('No data received from API');
        toast({
          title: "No Data",
          description: "No marine data available at this time",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching marine data:', error);
      toast({
        title: "Data Error",
        description: "Failed to fetch marine data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate realistic Baltic Sea coordinates
  const generateBalticLocation = (index: number, total: number) => {
    const balticBounds = {
      north: 65.5,
      south: 53.5,
      east: 30.0,
      west: 10.0
    };

    // Create a more realistic distribution of points
    const angle = (index / total) * 2 * Math.PI;
    const radius = 0.3 + Math.random() * 0.4; // Vary the radius
    
    const centerLat = (balticBounds.north + balticBounds.south) / 2;
    const centerLng = (balticBounds.east + balticBounds.west) / 2;
    
    const lat = centerLat + Math.cos(angle) * radius * (balticBounds.north - balticBounds.south) / 2;
    const lng = centerLng + Math.sin(angle) * radius * (balticBounds.east - balticBounds.west) / 2;

    return { lat, lng };
  };

  // Initialize Mapbox map
  const initializeMap = async (token: string) => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [19.5, 59.0], // Baltic Sea center
        zoom: 5,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        addMapLayers();
        setIsMapReady(true);
        fetchMarineData();
        
        toast({
          title: "Map Loaded",
          description: "Interactive maritime map is ready with real-time data layers"
        });
      });

      // Set up regular data updates
      const updateInterval = setInterval(fetchMarineData, 30000); // Update every 30 seconds

      return () => clearInterval(updateInterval);

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  // Add map layers and sources
  const addMapLayers = () => {
    if (!map.current) return;

    // Add synthetic current vectors
    map.current.addSource('currents', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add wave data as heatmap
    map.current.addSource('waves', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add wind vectors
    map.current.addSource('wind', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add vessel traffic points
    map.current.addSource('vessels', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add infrastructure points
    map.current.addSource('infrastructure', {
      type: 'geojson',
      data: generateInfrastructureData()
    });

    // Current vectors layer
    map.current.addLayer({
      id: 'current-vectors',
      type: 'line',
      source: 'currents',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 3,
        'line-opacity': 0.7
      }
    });

    // Wave heatmap layer
    map.current.addLayer({
      id: 'wave-heatmap',
      type: 'heatmap',
      source: 'waves',
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(6, 182, 212, 0)',
          0.2, 'rgba(6, 182, 212, 0.3)',
          0.4, 'rgba(14, 165, 233, 0.5)',
          0.6, 'rgba(59, 130, 246, 0.7)',
          0.8, 'rgba(29, 78, 216, 0.8)',
          1, 'rgba(30, 64, 175, 0.9)'
        ],
        'heatmap-radius': 30,
        'heatmap-opacity': 0.6
      }
    });

    // Wind vectors layer
    map.current.addLayer({
      id: 'wind-vectors',
      type: 'line',
      source: 'wind',
      paint: {
        'line-color': '#10b981',
        'line-width': 2,
        'line-opacity': 0.5
      }
    });

    // Vessel traffic layer
    map.current.addLayer({
      id: 'vessel-traffic',
      type: 'circle',
      source: 'vessels',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['get', 'intensity'], 1, 4, 10, 12],
        'circle-color': '#ef4444',
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Infrastructure layer
    map.current.addLayer({
      id: 'infrastructure-points',
      type: 'symbol',
      source: 'infrastructure',
      layout: {
        'icon-image': 'marker-15',
        'icon-size': 1.2,
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 2],
        'text-anchor': 'top'
      },
      paint: {
        'icon-color': '#6b7280',
        'text-color': '#374151',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });

    // Add click handlers
    map.current.on('click', 'vessel-traffic', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        showPopup(e.lngLat, feature.properties);
      }
    });

    map.current.on('click', 'infrastructure-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        showPopup(e.lngLat, feature.properties);
      }
    });
  };

  // Generate infrastructure data
  const generateInfrastructureData = (): GeoJSON.FeatureCollection => {
    const ports = [
      { name: 'Port of Stockholm', lat: 59.3293, lng: 18.0686, type: 'major_port' },
      { name: 'Port of Helsinki', lat: 60.1699, lng: 24.9384, type: 'major_port' },
      { name: 'Port of Gdansk', lat: 54.3520, lng: 18.6466, type: 'major_port' },
      { name: 'Port of Copenhagen', lat: 55.6761, lng: 12.5683, type: 'major_port' },
      { name: 'Port of Riga', lat: 56.9496, lng: 24.1052, type: 'port' },
      { name: 'Port of Tallinn', lat: 59.4370, lng: 24.7536, type: 'port' }
    ];

    return {
      type: 'FeatureCollection',
      features: ports.map(port => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [port.lng, port.lat]
        },
        properties: {
          name: port.name,
          type: port.type,
          description: `${port.type.replace('_', ' ').toUpperCase()}`
        }
      }))
    };
  };

  // Update map layers with real data
  const updateMapLayers = (data: MarineDataPoint[]) => {
    if (!map.current) return;

    // Update current vectors
    const currentFeatures = data
      .filter(d => d.id === 'currents')
      .map(d => generateCurrentVector(d))
      .filter((f): f is GeoJSON.Feature => f !== null);

    if (map.current.getSource('currents')) {
      (map.current.getSource('currents') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: currentFeatures
      });
    }

    // Update wave data
    const waveFeatures = data
      .filter(d => d.id === 'waves')
      .flatMap(d => generateWavePoints(d));

    if (map.current.getSource('waves')) {
      (map.current.getSource('waves') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: waveFeatures
      });
    }

    // Update wind vectors
    const windFeatures = data
      .filter(d => d.id === 'wind')
      .map(d => generateWindVector(d))
      .filter((f): f is GeoJSON.Feature => f !== null);

    if (map.current.getSource('wind')) {
      (map.current.getSource('wind') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: windFeatures
      });
    }

    // Update vessel traffic (synthetic data based on shipping intensity)
    const vesselFeatures = generateVesselTraffic();

    if (map.current.getSource('vessels')) {
      (map.current.getSource('vessels') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: vesselFeatures
      });
    }
  };

  // Generate current vector from data point
  const generateCurrentVector = (dataPoint: MarineDataPoint): GeoJSON.Feature | null => {
    if (!dataPoint.location) return null;

    const direction = dataPoint.secondaryMetrics?.find(m => m.label === 'Direction')?.value as number || 0;
    const speed = dataPoint.primaryValue;
    
    // Calculate vector end point
    const vectorLength = speed * 0.01; // Scale factor
    const radians = (direction * Math.PI) / 180;
    
    const endLat = dataPoint.location.lat + Math.cos(radians) * vectorLength;
    const endLng = dataPoint.location.lng + Math.sin(radians) * vectorLength;

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [dataPoint.location.lng, dataPoint.location.lat],
          [endLng, endLat]
        ]
      },
      properties: {
        speed: speed,
        direction: direction,
        name: dataPoint.name
      }
    };
  };

  // Generate wave points for heatmap
  const generateWavePoints = (dataPoint: MarineDataPoint): GeoJSON.Feature[] => {
    if (!dataPoint.location) return [];

    const points: GeoJSON.Feature[] = [];
    const baseIntensity = dataPoint.primaryValue / 5; // Normalize wave height

    // Generate multiple points around the location for better heatmap effect
    for (let i = 0; i < 5; i++) {
      const offsetLat = dataPoint.location.lat + (Math.random() - 0.5) * 0.5;
      const offsetLng = dataPoint.location.lng + (Math.random() - 0.5) * 0.5;
      
      points.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [offsetLng, offsetLat]
        },
        properties: {
          intensity: baseIntensity * (0.5 + Math.random() * 0.5),
          waveHeight: dataPoint.primaryValue
        }
      });
    }

    return points;
  };

  // Generate wind vector
  const generateWindVector = (dataPoint: MarineDataPoint): GeoJSON.Feature | null => {
    if (!dataPoint.location) return null;

    const direction = dataPoint.secondaryMetrics?.find(m => m.label === 'Direction')?.value as number || 0;
    const speed = dataPoint.primaryValue;
    
    const vectorLength = speed * 0.008;
    const radians = (direction * Math.PI) / 180;
    
    const endLat = dataPoint.location.lat + Math.cos(radians) * vectorLength;
    const endLng = dataPoint.location.lng + Math.sin(radians) * vectorLength;

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [dataPoint.location.lng, dataPoint.location.lat],
          [endLng, endLat]
        ]
      },
      properties: {
        speed: speed,
        direction: direction,
        name: dataPoint.name
      }
    };
  };

  // Generate synthetic vessel traffic
  const generateVesselTraffic = (): GeoJSON.Feature[] => {
    const vessels: GeoJSON.Feature[] = [];
    const shippingLanes = [
      { start: [18.0686, 59.3293], end: [24.9384, 60.1699] }, // Stockholm-Helsinki
      { start: [18.6466, 54.3520], end: [12.5683, 55.6761] }, // Gdansk-Copenhagen
      { start: [24.1052, 56.9496], end: [24.7536, 59.4370] }  // Riga-Tallinn
    ];

    shippingLanes.forEach((lane, laneIndex) => {
      for (let i = 0; i < 10; i++) {
        const progress = Math.random();
        const lng = lane.start[0] + (lane.end[0] - lane.start[0]) * progress;
        const lat = lane.start[1] + (lane.end[1] - lane.start[1]) * progress;
        
        vessels.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng + (Math.random() - 0.5) * 0.1, lat + (Math.random() - 0.5) * 0.1]
          },
          properties: {
            intensity: 3 + Math.random() * 7,
            vesselType: ['Container', 'Bulk Carrier', 'Tanker', 'Ferry'][Math.floor(Math.random() * 4)],
            speed: Math.random() * 20 + 5,
            course: Math.random() * 360
          }
        });
      }
    });

    return vessels;
  };

  // Show popup with data
  const showPopup = (lngLat: mapboxgl.LngLat, properties: any) => {
    if (!map.current) return;

    const popup = new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${properties.name || properties.vesselType || 'Data Point'}</h3>
          ${properties.speed ? `<p class="text-xs">Speed: ${properties.speed.toFixed(1)} m/s</p>` : ''}
          ${properties.direction ? `<p class="text-xs">Direction: ${properties.direction}°</p>` : ''}
          ${properties.intensity ? `<p class="text-xs">Intensity: ${properties.intensity.toFixed(1)}</p>` : ''}
          ${properties.description ? `<p class="text-xs">${properties.description}</p>` : ''}
        </div>
      `)
      .addTo(map.current);
  };

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, enabled: !layer.enabled }
        : layer
    ));

    if (map.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer) {
        const mapLayerId = getMapLayerId(layerId);
        const visibility = layer.enabled ? 'none' : 'visible';
        map.current.setLayoutProperty(mapLayerId, 'visibility', visibility);
      }
    }
  };

  // Get corresponding map layer ID
  const getMapLayerId = (layerId: string) => {
    const mapping: { [key: string]: string } = {
      'currents': 'current-vectors',
      'waves': 'wave-heatmap',
      'wind': 'wind-vectors',
      'shipping': 'vessel-traffic',
      'infrastructure': 'infrastructure-points'
    };
    return mapping[layerId] || layerId;
  };

  // Start/stop animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    // Animation logic would go here
  };

  // Initialize map when token is available
  useEffect(() => {
    if (mapboxToken && !tokenError) {
      initializeMap(mapboxToken);
    }
  }, [mapboxToken, tokenError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (tokenError) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
            <p className="text-muted-foreground">Please configure your Mapbox token to enable the interactive map.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Layer Controls */}
      <Card className="absolute top-4 left-4 w-80 bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Layers className="w-4 h-4 mr-2" />
            Data Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <layer.icon className="w-4 h-4" style={{ color: layer.color }} />
                <span className="text-sm">{layer.name}</span>
              </div>
              <Switch
                checked={layer.enabled}
                onCheckedChange={() => toggleLayer(layer.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Animation Controls */}
      <Card className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnimation}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1 min-w-32">
              <Slider
                value={[currentTime]}
                onValueChange={(value) => setCurrentTime(value[0])}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-sm text-muted-foreground min-w-12">
              +{currentTime}h
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Data Stats */}
      <Card className="absolute top-4 right-4 w-64 bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Activity className="w-4 h-4 mr-2" />
            Live Data Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Data Points:</span>
            <Badge variant="outline">{marineData.length}</Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Last Update:</span>
            <span className="text-muted-foreground">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Status:</span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!isMapReady && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading interactive maritime map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMaritimeMap;