import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, AlertTriangle, Eye, Fuel, Shield, Anchor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShadowFleetMapProps {
  vessels?: any[];
  alerts?: any[];
  stsTransfers?: any[];
  darkZones?: any[];
}

const ShadowFleetMap: React.FC<ShadowFleetMapProps> = ({ 
  vessels = [], 
  alerts = [], 
  stsTransfers = [], 
  darkZones = [] 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [isMapReady, setIsMapReady] = useState(false);
  const { toast } = useToast();

  // Generate day/night polygon data based on current time
  const generateDayNightData = (date: Date) => {
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const timeDecimal = hour + minute / 60;
    
    // Calculate solar terminator line (simplified)
    // For Baltic Sea region (roughly 54-66°N, 10-30°E)
    const features: any[] = [];
    
    // Create night polygon based on solar position
    if (timeDecimal < 6 || timeDecimal > 18) { // Approximate night hours
      // Add night overlay for areas not receiving sunlight
      features.push({
        type: 'Feature' as const,
        properties: { type: 'night' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [10, 66],
            [30, 66],
            [30, 54],
            [10, 54],
            [10, 66]
          ]]
        }
      });
    } else if (timeDecimal < 8 || timeDecimal > 16) {
      // Partial daylight (dawn/dusk) - create gradient effect
      const duskFactor = timeDecimal < 8 ? (8 - timeDecimal) / 2 : (timeDecimal - 16) / 2;
      features.push({
        type: 'Feature' as const,
        properties: { type: 'twilight', intensity: duskFactor },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [10, 66],
            [30, 66],
            [30, 54],
            [10, 54],
            [10, 66]
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
  const mockVessels = [
    { id: 1, name: "Northern Star", lat: 58.5, lng: 16.2, riskLevel: "high", mmsi: 123456789, type: "tanker" },
    { id: 2, name: "Baltic Express", lat: 59.2, lng: 19.8, riskLevel: "medium", mmsi: 987654321, type: "cargo" },
    { id: 3, name: "Sea Wolf", lat: 56.8, lng: 15.5, riskLevel: "critical", mmsi: 555666777, type: "tanker" },
    { id: 4, name: "Ocean Drift", lat: 60.1, lng: 24.9, riskLevel: "low", mmsi: 111222333, type: "container" },
  ];

  const mockDarkZones = [
    { id: 1, lat: 58.2, lng: 17.5, radius: 5000, duration: "4.5 hours" },
    { id: 2, lat: 59.8, lng: 23.1, radius: 3000, duration: "2.1 hours" },
  ];

  const mockSTSTransfers = [
    { id: 1, lat: 57.9, lng: 18.7, vessel1: "Oil Trader", vessel2: "Cargo Master", status: "active" },
    { id: 2, lat: 55.5, lng: 14.2, vessel1: "Baltic Wind", vessel2: "Sea Carrier", status: "completed" },
  ];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [18.5, 58.5], // Baltic Sea center
        zoom: 6,
        pitch: 0,
        bearing: 0
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Add day/night overlay
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
            'fill-color': '#000080',
            'fill-opacity': 0.3
          }
        });

        // Update day/night overlay every minute
        setInterval(() => {
          if (map.current && map.current.getSource('day-night')) {
            const updatedData = generateDayNightData(new Date());
            (map.current.getSource('day-night') as any).setData(updatedData);
          }
        }, 60000);

        // Add vessels
        (vessels.length > 0 ? vessels : mockVessels).forEach(vessel => {
          const riskColor = vessel.riskLevel === 'critical' ? '#ef4444' : 
                           vessel.riskLevel === 'high' ? '#f97316' :
                           vessel.riskLevel === 'medium' ? '#eab308' : '#10b981';

          const el = document.createElement('div');
          el.className = 'vessel-marker';
          el.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            border: 3px solid ${riskColor};
            background-color: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          `;
          el.innerHTML = '🚢';

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${riskColor};">${vessel.name}</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>MMSI:</strong> ${vessel.mmsi}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Type:</strong> ${vessel.type}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Risk Level:</strong> 
                <span style="color: ${riskColor}; font-weight: bold; text-transform: uppercase;">${vessel.riskLevel}</span>
              </p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Position:</strong> ${vessel.lat.toFixed(4)}°N, ${vessel.lng.toFixed(4)}°E</p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([vessel.lng, vessel.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Add dark zones
        (darkZones.length > 0 ? darkZones : mockDarkZones).forEach(zone => {
          // Add circle for dark zone
          map.current!.addSource(`dark-zone-${zone.id}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [zone.lng, zone.lat]
              },
              properties: {}
            }
          });

          map.current!.addLayer({
            id: `dark-zone-circle-${zone.id}`,
            type: 'circle',
            source: `dark-zone-${zone.id}`,
            paint: {
              'circle-radius': 15,
              'circle-color': '#ef4444',
              'circle-opacity': 0.3,
              'circle-stroke-color': '#ef4444',
              'circle-stroke-width': 2
            }
          });

          // Add marker for dark zone
          const el = document.createElement('div');
          el.style.cssText = `
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #ef4444;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          `;
          el.innerHTML = '👁️';

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #ef4444;">⚠️ AIS Dark Zone</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Duration:</strong> ${zone.duration}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Area:</strong> ${(zone.radius / 1000).toFixed(1)}km radius</p>
              <p style="margin: 4px 0; font-size: 12px; color: #ef4444;"><strong>Status:</strong> AIS Signal Lost</p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([zone.lng, zone.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Add STS transfers
        (stsTransfers.length > 0 ? stsTransfers : mockSTSTransfers).forEach(transfer => {
          const el = document.createElement('div');
          el.style.cssText = `
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #f97316;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          `;
          el.innerHTML = '⛽';

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #f97316;">🚢⚡🚢 Ship-to-Ship Transfer</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Vessel 1:</strong> ${transfer.vessel1}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Vessel 2:</strong> ${transfer.vessel2}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> 
                <span style="color: ${transfer.status === 'active' ? '#f97316' : '#10b981'}; font-weight: bold; text-transform: uppercase;">
                  ${transfer.status}
                </span>
              </p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([transfer.lng, transfer.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        setIsMapReady(true);
        toast({
          title: "Shadow Fleet Map Loaded",
          description: "Vessel tracking and threat detection active",
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
    
    try {
      initializeMap(mapboxToken);
    } catch (error) {
      console.error('Map initialization error:', error);
      toast({
        title: "Map Initialization Failed",
        description: "Please check your Mapbox token and try again",
        variant: "destructive",
      });
    }
  };

  // Auto-load map if token is already saved
  useEffect(() => {
    if (mapboxToken && mapboxToken.startsWith('pk.') && !isMapReady) {
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

  return (
    <Card className="shadow-depth border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-red-600" />
          Shadow Fleet Tracking Map
          {isMapReady && (
            <Badge variant="destructive" className="ml-auto">
              Live Tracking
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMapReady && (
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
              <h3 className="font-semibold text-lg mb-3 text-red-900">🗺️ Shadow Fleet Map Setup</h3>
              <p className="text-sm text-red-700 mb-4">
                To view real-time shadow fleet tracking, enter your Mapbox token:
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
                <Button onClick={handleTokenSubmit} className="bg-red-600 hover:bg-red-700">
                  🚀 Load Map
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <Ship className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-xs font-medium">High-Risk Vessels</p>
                <p className="text-lg font-bold text-red-600">{mockVessels.filter(v => v.riskLevel === 'high' || v.riskLevel === 'critical').length}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <Eye className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-xs font-medium">Dark Zones</p>
                <p className="text-lg font-bold text-yellow-600">{mockDarkZones.length}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <Fuel className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <p className="text-xs font-medium">STS Transfers</p>
                <p className="text-lg font-bold text-orange-600">{mockSTSTransfers.length}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-xs font-medium">Active Alerts</p>
                <p className="text-lg font-bold text-red-600">3</p>
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className={`h-96 rounded-lg overflow-hidden relative ${!isMapReady ? 'bg-gray-900' : ''}`}
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
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Critical Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-800 rounded opacity-30"></div>
                <span>Night Areas</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click markers for vessel details. 👁️ = Dark Zones, ⛽ = STS Transfers, 🚢 = Tracked Vessels
              </p>
              <div className="text-xs text-muted-foreground">
                🌓 Real-time Day/Night: {new Date().toLocaleTimeString()} UTC
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShadowFleetMap;