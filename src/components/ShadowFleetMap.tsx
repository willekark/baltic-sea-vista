import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, AlertTriangle, Eye, Fuel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShadowFleetMapProps {
  vessels?: any[];
  alerts?: any[];
  stsTransfers?: any[];
  darkZones?: any[];
  allVessels?: any[]; // New prop for all vessels with risk assessments
}

const ShadowFleetMap: React.FC<ShadowFleetMapProps> = ({ 
  vessels = [], 
  alerts = [], 
  stsTransfers = [], 
  darkZones = [],
  allVessels = [] // New prop
}) => {
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

  // Enhanced mock data with shadow fleet probabilities
  const mockVessels = [
    { id: 1, name: "Northern Star", lat: 58.5, lng: 16.2, shadowFleetProbability: 85, mmsi: 123456789, type: "tanker" },
    { id: 2, name: "Baltic Express", lat: 59.2, lng: 19.8, shadowFleetProbability: 45, mmsi: 987654321, type: "cargo" },
    { id: 3, name: "Sea Wolf", lat: 56.8, lng: 15.5, shadowFleetProbability: 92, mmsi: 555666777, type: "tanker" },
    { id: 4, name: "Ocean Drift", lat: 60.1, lng: 24.9, shadowFleetProbability: 15, mmsi: 111222333, type: "container" },
    { id: 5, name: "Nordic Breeze", lat: 57.3, lng: 18.1, shadowFleetProbability: 8, mmsi: 444555666, type: "ferry" },
    { id: 6, name: "Baltic Trader", lat: 55.2, lng: 13.8, shadowFleetProbability: 35, mmsi: 777888999, type: "bulk_carrier" },
    { id: 7, name: "Freedom Spirit", lat: 59.8, lng: 22.4, shadowFleetProbability: 3, mmsi: 101202303, type: "passenger" },
    { id: 8, name: "Dark Shadow", lat: 58.9, lng: 20.1, shadowFleetProbability: 78, mmsi: 404505606, type: "tanker" }
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
    console.log('ShadowFleetMap - initializeMap called with token:', token.substring(0, 10) + '...');
    console.log('ShadowFleetMap - Vessels to display:', allVessels.length > 0 ? allVessels.length : 'Using mock data (' + mockVessels.length + ' vessels)');
    
    if (!mapContainer.current) {
      console.error('ShadowFleetMap - No map container found!');
      return;
    }
    
    if (map.current) {
      console.log('ShadowFleetMap - Map already exists, skipping initialization');
      return;
    }

    console.log('ShadowFleetMap - Setting mapbox access token...');
    mapboxgl.accessToken = token;
    
    try {
      console.log('ShadowFleetMap - Creating new map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [18.5, 58.5], // Baltic Sea center
        zoom: 6,
        pitch: 0,
        bearing: 0
      });

      console.log('ShadowFleetMap - Map instance created, adding controls...');
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

        // Add all vessels - combine real data with mock data for demonstration
        const realVessels = allVessels.length > 0 ? allVessels : [];
        const vesselsToDisplay = [...realVessels, ...mockVessels];
        console.log('ShadowFleetMap - Adding vessels to map:', vesselsToDisplay.length, 'vessels (', realVessels.length, 'real +', mockVessels.length, 'mock)');
        console.log('ShadowFleetMap - Vessel details:', vesselsToDisplay.map(v => `${v.name} at ${v.lat},${v.lng} (${v.shadowFleetProbability || 0}% risk)`));
        
        vesselsToDisplay.forEach(vessel => {
          const probability = vessel.shadowFleetProbability || 0;
          
          // Color coding based on shadow fleet probability
          let vesselColor = '#10b981'; // Green for normal vessels
          let vesselIcon = '🚢';
          let riskLabel = 'Normal';
          
          if (probability >= 70) {
            vesselColor = '#ef4444'; // Red for high-risk shadow fleet
            vesselIcon = '⚠️';
            riskLabel = 'High Risk Shadow Fleet';
          } else if (probability >= 50) {
            vesselColor = '#f97316'; // Orange for probable shadow fleet
            vesselIcon = '🚨';
            riskLabel = 'Probable Shadow Fleet';
          } else if (probability >= 30) {
            vesselColor = '#eab308'; // Yellow for suspicious vessels
            vesselIcon = '⚡';
            riskLabel = 'Suspicious Activity';
          }

          const el = document.createElement('div');
          el.className = 'vessel-marker';
          el.style.cssText = `
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            border: 3px solid ${vesselColor};
            background-color: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 3px 12px rgba(0,0,0,0.6);
            transition: all 0.3s ease;
          `;
          el.innerHTML = vesselIcon;
          
          // Add hover effect
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.2)';
            el.style.boxShadow = `0 6px 20px ${vesselColor}40`;
          });
          
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '0 3px 12px rgba(0,0,0,0.6)';
          });

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 14px; min-width: 240px; font-family: system-ui;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; font-weight: bold; color: ${vesselColor}; font-size: 16px;">
                  ${vesselIcon} ${vessel.name}
                </h3>
                <span style="margin-left: auto; background: ${vesselColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                  ${probability}%
                </span>
              </div>
              
              <div style="background: ${vesselColor}15; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: ${vesselColor};">
                  ${riskLabel}
                </p>
              </div>
              
              <div style="font-size: 12px; line-height: 1.4;">
                <p style="margin: 4px 0;"><strong>MMSI:</strong> ${vessel.mmsi}</p>
                <p style="margin: 4px 0;"><strong>Type:</strong> ${vessel.type}</p>
                <p style="margin: 4px 0;"><strong>Position:</strong> ${vessel.lat.toFixed(4)}°N, ${vessel.lng.toFixed(4)}°E</p>
                ${vessel.flagState ? `<p style="margin: 4px 0;"><strong>Flag:</strong> ${vessel.flagState}</p>` : ''}
                ${vessel.speed ? `<p style="margin: 4px 0;"><strong>Speed:</strong> ${vessel.speed} knots</p>` : ''}
                ${vessel.destination ? `<p style="margin: 4px 0;"><strong>Destination:</strong> ${vessel.destination}</p>` : ''}
              </div>
              
              ${vessel.alerts && vessel.alerts.length > 0 ? `
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e5e5;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: #ef4444;">
                    Active Alerts: ${vessel.alerts.length}
                  </p>
                  ${vessel.alerts.slice(0, 2).map((alert: any) => `
                    <p style="margin: 2px 0; font-size: 10px; color: #666;">
                      • ${alert.title}
                    </p>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([vessel.lng, vessel.lat])
            .setPopup(popup)
            .addTo(map.current!);
          
          console.log(`ShadowFleetMap - Added marker for ${vessel.name} at [${vessel.lng}, ${vessel.lat}] with ${probability}% risk`);
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
        console.log('ShadowFleetMap - Map fully loaded and ready');
        toast({
          title: "Shadow Fleet Map Loaded",
          description: `Vessel tracking active - ${vesselsToDisplay.length} vessels displayed`,
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
    
    console.log('ShadowFleetMap - Attempting to submit token:', mapboxToken.substring(0, 10) + '...');
    
    if (!mapboxToken.trim()) {
      console.log('ShadowFleetMap - No token provided');
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token",
        variant: "destructive",
      });
      return;
    }

    if (!mapboxToken.startsWith('pk.')) {
      console.log('ShadowFleetMap - Invalid token format');
      toast({
        title: "Invalid Token Format",
        description: "Mapbox tokens should start with 'pk.'",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem('mapbox_token', mapboxToken);
      console.log('ShadowFleetMap - Token saved to localStorage successfully');
      
      // Verify the token was saved
      const savedToken = localStorage.getItem('mapbox_token');
      console.log('ShadowFleetMap - Verification - Retrieved token from localStorage:', savedToken ? 'Token found' : 'Token NOT found');
      
      if (savedToken === mapboxToken) {
        console.log('ShadowFleetMap - Token verification successful, initializing map...');
        initializeMap(mapboxToken);
      } else {
        console.error('ShadowFleetMap - Token verification failed!');
        toast({
          title: "Storage Error",
          description: "Failed to save token to browser storage",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ShadowFleetMap - Map initialization error:', error);
      toast({
        title: "Map Initialization Failed",
        description: "Please check your Mapbox token and try again",
        variant: "destructive",
      });
    }
  };

  // Load token from localStorage and auto-initialize map
  useEffect(() => {
    console.log('ShadowFleetMap - Component mounted, checking for saved token...');
    
    // Add a small delay to ensure localStorage is ready
    setTimeout(() => {
      try {
        const savedToken = localStorage.getItem('mapbox_token');
        console.log('ShadowFleetMap - localStorage check result:', savedToken ? `Token found: ${savedToken.substring(0, 10)}...` : 'No token found');
        
        if (savedToken && savedToken.startsWith('pk.')) {
          console.log('ShadowFleetMap - Valid token found, setting state and initializing map...');
          setMapboxToken(savedToken);
          
          // Only initialize if map hasn't been created yet
          if (!map.current && !isMapReady) {
            console.log('ShadowFleetMap - Map not yet created, initializing now...');
            initializeMap(savedToken);
          } else {
            console.log('ShadowFleetMap - Map already exists or ready:', { mapCurrent: !!map.current, isMapReady });
          }
        } else {
          console.log('ShadowFleetMap - No valid token found in localStorage');
        }
      } catch (error) {
        console.error('ShadowFleetMap - Error accessing localStorage:', error);
      }
    }, 100);
  }, []);

  // Auto-load map when token changes
  useEffect(() => {
    console.log('ShadowFleetMap - Token changed:', { 
      hasToken: !!mapboxToken, 
      validToken: mapboxToken && mapboxToken.startsWith('pk.'), 
      mapExists: !!map.current, 
      isReady: isMapReady 
    });
    
    if (mapboxToken && mapboxToken.startsWith('pk.') && !map.current && !isMapReady) {
      console.log('ShadowFleetMap - Auto-loading map with token change');
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
            
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 to-red-50 p-4 rounded-lg border border-gray-200 mb-4">
              <h4 className="font-semibold text-sm mb-3">🎯 Vessel Classification Legend</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span><strong>Green:</strong> Normal vessels (&lt;30% risk)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span><strong>Yellow:</strong> Suspicious (30-70% risk)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span><strong>Orange:</strong> Probable shadow fleet (50-70%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span><strong>Red:</strong> High-risk shadow fleet (≥70%)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <Ship className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-medium">Normal Vessels</p>
                <p className="text-lg font-bold text-green-600">
                  {(allVessels.length > 0 ? allVessels : mockVessels).filter(v => (v.shadowFleetProbability || 0) < 30).length}
                </p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-xs font-medium">Suspicious Vessels</p>
                <p className="text-lg font-bold text-yellow-600">
                  {(allVessels.length > 0 ? allVessels : mockVessels).filter(v => {
                    const prob = v.shadowFleetProbability || 0;
                    return prob >= 30 && prob < 70;
                  }).length}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <Ship className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-xs font-medium">High-Risk Shadow Fleet</p>
                <p className="text-lg font-bold text-red-600">
                  {(allVessels.length > 0 ? allVessels : mockVessels).filter(v => (v.shadowFleetProbability || 0) >= 70).length}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <Eye className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-xs font-medium">Dark Zones</p>
                <p className="text-lg font-bold text-gray-600">{mockDarkZones.length}</p>
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
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Normal (&lt;30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Suspicious (30-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Probable (50-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>High Risk (≥70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-800 rounded opacity-30"></div>
                <span>Night Areas</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click markers for vessel details. 👁️ = Dark Zones, ⛽ = STS Transfers, Ships = Tracked Vessels
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