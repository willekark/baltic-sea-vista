import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, AlertTriangle, MapPin, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EutrophicationMapProps {
  areas?: any[];
}

const EutrophicationMap: React.FC<EutrophicationMapProps> = ({ areas = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const { toast } = useToast();

  // Generate day/night polygon data based on current time
  const generateDayNightData = (date: Date) => {
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const timeDecimal = hour + minute / 60;
    
    // Calculate solar position for Baltic Sea region
    // Simplified calculation for demonstration
    const features: any[] = [];
    
    // Determine night areas based on solar position
    if (timeDecimal < 5 || timeDecimal > 19) { // Deep night
      features.push({
        type: 'Feature' as const,
        properties: { type: 'night' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [10, 67],
            [31, 67],
            [31, 53],
            [10, 53],
            [10, 67]
          ]]
        }
      });
    } else if (timeDecimal < 7 || timeDecimal > 17) {
      // Twilight hours - environmental monitoring is affected by light levels
      features.push({
        type: 'Feature' as const,
        properties: { type: 'twilight' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [10, 67],
            [31, 67],
            [31, 53],
            [10, 53],
            [10, 67]
          ]]
        }
      });
    }
    
    return {
      type: 'FeatureCollection' as const,
      features
    };
  };

  // Mock data for demonstration
  const mockAreas = [
    { 
      id: 1, 
      location: "Stockholm Archipelago", 
      lat: 59.3293, 
      lng: 18.0686, 
      severity: "high",
      nitrogen: 2.8,
      phosphorus: 0.15,
      chlorophyll: 12.5,
      oxygen: 5.2
    },
    { 
      id: 2, 
      location: "Helsinki Bay", 
      lat: 60.1699, 
      lng: 24.9384, 
      severity: "severe",
      nitrogen: 3.2,
      phosphorus: 0.22,
      chlorophyll: 18.7,
      oxygen: 4.1
    },
    { 
      id: 3, 
      location: "Gdansk Bay", 
      lat: 54.3520, 
      lng: 18.6466, 
      severity: "moderate",
      nitrogen: 2.1,
      phosphorus: 0.08,
      chlorophyll: 8.3,
      oxygen: 6.8
    },
    { 
      id: 4, 
      location: "Gotland Deep", 
      lat: 57.3000, 
      lng: 18.2000, 
      severity: "high",
      nitrogen: 2.6,
      phosphorus: 0.13,
      chlorophyll: 11.2,
      oxygen: 5.5
    },
    { 
      id: 5, 
      location: "Gulf of Finland", 
      lat: 59.9500, 
      lng: 25.5000, 
      severity: "severe",
      nitrogen: 3.5,
      phosphorus: 0.25,
      chlorophyll: 21.3,
      oxygen: 3.8
    }
  ];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [19.0, 58.5], // Baltic Sea center
        zoom: 5.5,
        pitch: 0,
        bearing: 0
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Add day/night overlay for environmental monitoring
        const now = new Date();
        const dayNightSource = {
          type: 'geojson' as const,
          data: generateDayNightData(now)
        };

        map.current.addSource('day-night', dayNightSource);
        
        map.current.addLayer({
          id: 'night-overlay',
          type: 'fill',
          source: 'day-night',
          paint: {
            'fill-color': '#1a1a2e',
            'fill-opacity': 0.25
          }
        });

        // Update day/night overlay every minute
        setInterval(() => {
          if (map.current && map.current.getSource('day-night')) {
            const updatedData = generateDayNightData(new Date());
            (map.current.getSource('day-night') as any).setData(updatedData);
          }
        }, 60000);

        // Add eutrophication areas
        (areas.length > 0 ? areas : mockAreas).forEach(area => {
          const severityColor = area.severity === 'severe' ? '#dc2626' : 
                               area.severity === 'high' ? '#ea580c' :
                               area.severity === 'moderate' ? '#d97706' : '#10b981';

          const severityRadius = area.severity === 'severe' ? 20 : 
                                 area.severity === 'high' ? 15 :
                                 area.severity === 'moderate' ? 12 : 8;

          // Add circle layer for affected area
          map.current!.addSource(`area-${area.id}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [area.lng, area.lat]
              },
              properties: {}
            }
          });

          map.current!.addLayer({
            id: `area-circle-${area.id}`,
            type: 'circle',
            source: `area-${area.id}`,
            paint: {
              'circle-radius': severityRadius,
              'circle-color': severityColor,
              'circle-opacity': 0.4,
              'circle-stroke-color': severityColor,
              'circle-stroke-width': 2,
              'circle-stroke-opacity': 0.8
            }
          });

          // Add marker for the area
          const el = document.createElement('div');
          el.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${severityColor};
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `;
          
          const severityIcon = area.severity === 'severe' ? '🔴' : 
                              area.severity === 'high' ? '🟠' :
                              area.severity === 'moderate' ? '🟡' : '🟢';
          el.innerHTML = severityIcon;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 12px; min-width: 220px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${severityColor};">${area.location}</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Severity:</strong> 
                <span style="color: ${severityColor}; font-weight: bold; text-transform: uppercase;">${area.severity}</span>
              </p>
              <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <p style="margin: 2px 0; font-size: 11px;"><strong>Nitrogen:</strong> ${area.nitrogen} mg/L</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Phosphorus:</strong> ${area.phosphorus} mg/L</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Chlorophyll-a:</strong> ${area.chlorophyll} μg/L</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Dissolved O₂:</strong> ${area.oxygen} mg/L</p>
              </div>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Position:</strong> ${area.lat.toFixed(4)}°N, ${area.lng.toFixed(4)}°E</p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([area.lng, area.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        setIsMapReady(true);
        toast({
          title: "Eutrophication Map Loaded",
          description: "Environmental monitoring data is now visible",
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        toast({
          title: "Map Error",
          description: "Failed to load the map. Please check your token.",
          variant: "destructive",
        });
      });
    } catch (error) {
      console.error('Error creating map instance:', error);
      throw error;
    }
  };

  const handleTokenSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!mapboxToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token",
        variant: "destructive",
      });
      return;
    }

    if (!mapboxToken.startsWith('pk.')) {
      toast({
        title: "Invalid Token Format",
        description: "Mapbox tokens should start with 'pk.'",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('mapbox_token', mapboxToken);
    console.log('EutrophicationMap - Token saved to localStorage');
    
    try {
      initializeMap(mapboxToken);
    } catch (error) {
      console.error('EutrophicationMap - Map initialization error:', error);
      toast({
        title: "Map Initialization Failed",
        description: "Please check your Mapbox token and try again",
        variant: "destructive",
      });
    }
  };

  // Load token from localStorage and auto-initialize map
  useEffect(() => {
    console.log('EutrophicationMap - Component mounted, checking for saved token...');
    
    // Add a small delay to ensure localStorage is ready
    setTimeout(() => {
      try {
        const savedToken = localStorage.getItem('mapbox_token');
        console.log('EutrophicationMap - localStorage check result:', savedToken ? `Token found: ${savedToken.substring(0, 10)}...` : 'No token found');
        
        if (savedToken && savedToken.startsWith('pk.')) {
          console.log('EutrophicationMap - Valid token found, setting state and initializing map...');
          setMapboxToken(savedToken);
          
          // Only initialize if map hasn't been created yet
          if (!map.current && !isMapReady) {
            console.log('EutrophicationMap - Map not yet created, initializing now...');
            initializeMap(savedToken);
          } else {
            console.log('EutrophicationMap - Map already exists or ready:', { mapCurrent: !!map.current, isMapReady });
          }
        } else {
          console.log('EutrophicationMap - No valid token found in localStorage');
        }
      } catch (error) {
        console.error('EutrophicationMap - Error accessing localStorage:', error);
      }
    }, 100);
  }, []);

  // Auto-load map when token changes
  useEffect(() => {
    if (mapboxToken && mapboxToken.startsWith('pk.') && !map.current && !isMapReady) {
      console.log('EutrophicationMap - Auto-loading map with token change');
      initializeMap(mapboxToken);
    }
  }, [mapboxToken, isMapReady]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const getSeverityStats = () => {
    const dataToUse = areas.length > 0 ? areas : mockAreas;
    return {
      severe: dataToUse.filter(a => a.severity === 'severe').length,
      high: dataToUse.filter(a => a.severity === 'high').length,
      moderate: dataToUse.filter(a => a.severity === 'moderate').length,
      low: dataToUse.filter(a => a.severity === 'low').length,
    };
  };

  const stats = getSeverityStats();

  return (
    <Card className="shadow-depth border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Eutrophication Impact Map
          {isMapReady && (
            <Badge variant="secondary" className="ml-auto">
              {(areas.length > 0 ? areas : mockAreas).length} Areas Monitored
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMapReady && (
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-3 text-blue-900">🗺️ Environmental Map Setup</h3>
              <p className="text-sm text-blue-700 mb-4">
                To view eutrophication areas and environmental data, enter your Mapbox token:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbG..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1 bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTokenSubmit();
                    }
                  }}
                />
                <Button onClick={handleTokenSubmit} className="bg-blue-600 hover:bg-blue-700">
                  🚀 Load Map
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <div className="w-6 h-6 mx-auto mb-2 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                <p className="text-xs font-medium">Severe</p>
                <p className="text-lg font-bold text-red-600">{stats.severe}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                <div className="w-6 h-6 mx-auto mb-2 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                <p className="text-xs font-medium">High</p>
                <p className="text-lg font-bold text-orange-600">{stats.high}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-xs font-medium">Moderate</p>
                <p className="text-lg font-bold text-yellow-600">{stats.moderate}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <Activity className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-medium">Low</p>
                <p className="text-lg font-bold text-green-600">{stats.low}</p>
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className={`h-96 rounded-lg overflow-hidden relative ${!isMapReady ? 'bg-blue-100' : ''}`}
          style={{
            width: '100%',
            height: '400px',
            position: 'relative'
          }}
        />
        
        {isMapReady && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span>Severe Eutrophication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                <span>High Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                <span>Moderate Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <span>Low Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-800 rounded opacity-25"></div>
                <span>Night Areas</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click markers to view detailed nutrient levels and environmental data. Larger circles indicate more severe conditions.
              </p>
              <div className="text-xs text-muted-foreground">
                🌗 Light Conditions: {new Date().toLocaleTimeString()} UTC
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EutrophicationMap;