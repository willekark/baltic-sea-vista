
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, XCircle, MapPin, Waves } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMapboxToken } from "@/hooks/useMapboxToken";

const BalticSeaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const { toast } = useToast();
  const { token, saveToken, isValidToken, isLoading } = useMapboxToken();

  // Mock monitoring stations data
  const monitoringStations = [
    { id: 1, name: "Helsinki Bay", lat: 60.1699, lng: 24.9384, status: "active", oxygenLevel: 7.2, temperature: 14.8 },
    { id: 2, name: "Stockholm Archipelago", lat: 59.3293, lng: 18.0686, status: "active", oxygenLevel: 8.1, temperature: 15.2 },
    { id: 3, name: "Gotland Deep", lat: 57.3000, lng: 18.2000, status: "warning", oxygenLevel: 5.8, temperature: 13.9 },
    { id: 4, name: "Gdansk Bay", lat: 54.3520, lng: 18.6466, status: "critical", oxygenLevel: 4.2, temperature: 16.1 },
    { id: 5, name: "Kattegat", lat: 57.7000, lng: 11.0000, status: "active", oxygenLevel: 9.1, temperature: 14.5 },
    { id: 6, name: "Bornholm Basin", lat: 55.1000, lng: 15.6000, status: "active", oxygenLevel: 6.9, temperature: 14.2 },
    { id: 7, name: "Gulf of Finland", lat: 59.9500, lng: 25.5000, status: "warning", oxygenLevel: 5.5, temperature: 15.8 },
    { id: 8, name: "Bothnian Bay", lat: 65.0000, lng: 21.0000, status: "active", oxygenLevel: 8.7, temperature: 12.3 }
  ];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [18.5, 59.0],
        zoom: 5.5,
        pitch: 45,
        bearing: -15
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add atmosphere for 3D effect
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        map.current.setFog({
          'color': 'rgb(50, 50, 70)',
          'high-color': 'rgb(30, 30, 50)',
          'horizon-blend': 0.4,
          'space-color': 'rgb(10, 10, 20)',
          'star-intensity': 0.8
        });
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add animated wave effect layer
        map.current.addSource('wave-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [10, 66], [30, 66], [30, 53], [10, 53], [10, 66]
                ]]
              },
              properties: {}
            }]
          }
        });

        map.current.addLayer({
          id: 'water-animation',
          type: 'fill',
          source: 'wave-source',
          paint: {
            'fill-color': ['interpolate', ['linear'], ['zoom'],
              4, 'rgba(0, 100, 200, 0.1)',
              8, 'rgba(0, 150, 255, 0.2)'
            ],
            'fill-opacity': 0.3
          }
        });

        // Add monitoring stations with enhanced markers
        monitoringStations.forEach((station, index) => {
          const statusColors = {
            active: '#00ff88',
            warning: '#ffaa00', 
            critical: '#ff3344'
          };
          
          const color = statusColors[station.status as keyof typeof statusColors];

          // Create pulsing animation element
          const el = document.createElement('div');
          el.className = 'monitoring-station-enhanced';
          el.innerHTML = `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              animation: pulse-${station.status} 2s infinite;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                cursor: pointer;
                z-index: 2;
              "></div>
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: ${color};
                border-radius: 50%;
                opacity: 0.3;
                animation: ripple 2s infinite;
              "></div>
            </div>
          `;

          // Add CSS animations
          if (!document.getElementById('map-animations')) {
            const style = document.createElement('style');
            style.id = 'map-animations';
            style.textContent = `
              @keyframes ripple {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
              }
              @keyframes pulse-active {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              @keyframes pulse-warning {
                0%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.5; }
              }
              @keyframes pulse-critical {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
            `;
            document.head.appendChild(style);
          }

          const popup = new mapboxgl.Popup({ 
            offset: 25,
            className: 'custom-popup'
          }).setHTML(`
            <div style="
              padding: 16px; 
              background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(30,30,30,0.9));
              border-radius: 12px;
              border: 2px solid ${color};
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              min-width: 280px;
              backdrop-filter: blur(10px);
            ">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="
                  width: 16px; 
                  height: 16px; 
                  background: ${color}; 
                  border-radius: 50%;
                  box-shadow: 0 0 8px ${color};
                "></div>
                <h3 style="margin: 0; font-weight: 700; font-size: 18px;">${station.name}</h3>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="
                  background: rgba(255,255,255,0.1); 
                  padding: 8px; 
                  border-radius: 8px;
                  text-align: center;
                ">
                  <div style="font-size: 12px; opacity: 0.8;">Oxygen Level</div>
                  <div style="font-size: 16px; font-weight: bold; color: ${color};">${station.oxygenLevel} mg/L</div>
                </div>
                <div style="
                  background: rgba(255,255,255,0.1); 
                  padding: 8px; 
                  border-radius: 8px;
                  text-align: center;
                ">
                  <div style="font-size: 12px; opacity: 0.8;">Temperature</div>
                  <div style="font-size: 16px; font-weight: bold; color: #00aaff;">${station.temperature}°C</div>
                </div>
              </div>
              <div style="
                padding: 8px; 
                background: rgba(${color === '#00ff88' ? '0,255,136' : color === '#ffaa00' ? '255,170,0' : '255,51,68'},0.2); 
                border-radius: 8px;
                text-align: center;
                border: 1px solid ${color};
              ">
                <div style="font-size: 14px; font-weight: bold; text-transform: uppercase;">${station.status}</div>
              </div>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([station.lng, station.lat])
            .setPopup(popup)
            .addTo(map.current!);

          // Add subtle station connection lines
          if (index > 0) {
            const prevStation = monitoringStations[index - 1];
            map.current!.addSource(`connection-${index}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [prevStation.lng, prevStation.lat],
                    [station.lng, station.lat]
                  ]
                },
                properties: {}
              }
            });

            map.current!.addLayer({
              id: `connection-line-${index}`,
              type: 'line',
              source: `connection-${index}`,
              paint: {
                'line-color': 'rgba(100, 200, 255, 0.3)',
                'line-width': 1,
                'line-dasharray': [2, 4]
              }
            });
          }
        });

        setIsMapReady(true);
        toast({
          title: "Baltic Sea Monitoring Active",
          description: "Enhanced 3D visualization loaded with real-time data",
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
    
    if (!inputToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token",
        variant: "destructive",
      });
      return;
    }

    if (!isValidToken(inputToken)) {
      toast({
        title: "Invalid Token Format",
        description: "Mapbox tokens should start with 'pk.' and be valid",
        variant: "destructive",
      });
      return;
    }

    if (saveToken(inputToken)) {
      toast({
        title: "Token Saved",
        description: "Your Mapbox token has been securely saved",
      });
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save your token. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-initialize map when token is available
  useEffect(() => {
    if (!isLoading && isValidToken(token) && !map.current && !isMapReady) {
      initializeMap(token);
    }
  }, [token, isLoading, isMapReady]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="shadow-depth border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Waves className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              Baltic Sea Monitoring Network
              {isMapReady && (
                <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                  <Activity className="w-3 h-3 mr-1" />
                  {monitoringStations.length} Stations Live
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Enhanced 3D Environmental Monitoring</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!isMapReady && !isValidToken(token) && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/20">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">🗺️ Enhanced Monitoring Setup</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Experience the Baltic Sea like never before with our 3D monitoring visualization. 
                Enter your Mapbox token to unlock the enhanced interface:
              </p>
              <ol className="text-sm text-muted-foreground mb-4 ml-4 list-decimal space-y-1">
                <li>Visit <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">mapbox.com</a> and create a free account</li>
                <li>Navigate to Account → Access Tokens</li>
                <li>Copy your "Default public token" (starts with pk.ey...)</li>
                <li>Paste it below to activate the enhanced visualization</li>
              </ol>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbG..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="flex-1 bg-background/50 border-primary/20 focus:border-primary/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTokenSubmit();
                    }
                  }}
                />
                <Button 
                  onClick={handleTokenSubmit}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-6"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                Your token is stored securely in your browser only
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Monitoring Stations
                </h4>
                <div className="space-y-3">
                  {monitoringStations.slice(0, 4).map(station => (
                    <div key={station.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          station.status === 'active' ? 'bg-success animate-pulse' :
                          station.status === 'warning' ? 'bg-warning animate-pulse' : 'bg-destructive animate-pulse'
                        }`}></div>
                        <div>
                          <span className="text-sm font-medium">{station.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {station.oxygenLevel} mg/L O₂ • {station.temperature}°C
                          </div>
                        </div>
                      </div>
                      <Badge variant={station.status === 'active' ? 'secondary' : station.status === 'warning' ? 'outline' : 'destructive'} className="text-xs">
                        {station.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Network Overview
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Active Stations', count: monitoringStations.filter(s => s.status === 'active').length, color: 'text-success', bg: 'bg-success/10' },
                    { label: 'Warning Status', count: monitoringStations.filter(s => s.status === 'warning').length, color: 'text-warning', bg: 'bg-warning/10' },
                    { label: 'Critical Status', count: monitoringStations.filter(s => s.status === 'critical').length, color: 'text-destructive', bg: 'bg-destructive/10' }
                  ].map(stat => (
                    <div key={stat.label} className={`flex items-center justify-between p-3 rounded-lg ${stat.bg} border border-border/30`}>
                      <span className="text-sm font-medium">{stat.label}</span>
                      <span className={`text-lg font-bold ${stat.color}`}>{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className={`${isMapReady ? 'h-[500px]' : 'h-64'} rounded-b-lg overflow-hidden relative ${!isMapReady ? 'bg-gradient-to-br from-muted/30 to-muted/60' : ''}`}
          style={{
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}
        >
          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <Waves className="w-16 h-16 text-primary/30 mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">
                  {isLoading ? 'Loading...' : 'Enter your Mapbox token to view the enhanced 3D monitoring network'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {isMapReady && (
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/50 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span>Active (Good)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                  <span>Critical</span>
                </div>
              </div>
              <span className="text-muted-foreground">Click markers for detailed analysis • Use controls to navigate</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BalticSeaMap;
