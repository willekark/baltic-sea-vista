
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const BalticSeaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const { toast } = useToast();

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
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [18.5, 59.0], // Center on Baltic Sea
      zoom: 5,
      pitch: 0,
      bearing: 0
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add monitoring stations
      monitoringStations.forEach(station => {
        const el = document.createElement('div');
        el.className = 'monitoring-station';
        el.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          background-color: ${
            station.status === 'active' ? '#10b981' :
            station.status === 'warning' ? '#f59e0b' : '#ef4444'
          };
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${station.name}</h3>
            <p style="margin: 4px 0; font-size: 12px;">Status: <span style="color: ${
              station.status === 'active' ? '#10b981' :
              station.status === 'warning' ? '#f59e0b' : '#ef4444'
            }; font-weight: bold;">${station.status.toUpperCase()}</span></p>
            <p style="margin: 4px 0; font-size: 12px;">Oxygen: ${station.oxygenLevel} mg/L</p>
            <p style="margin: 4px 0; font-size: 12px;">Temperature: ${station.temperature}°C</p>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([station.lng, station.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });

      setIsMapReady(true);
      toast({
        title: "Map Loaded",
        description: "Baltic Sea monitoring stations are now visible",
      });
    });
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token",
        variant: "destructive",
      });
      return;
    }

    try {
      initializeMap(mapboxToken);
    } catch (error) {
      toast({
        title: "Invalid Token",
        description: "Please check your Mapbox token and try again",
        variant: "destructive",
      });
    }
  };

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

  if (!isMapReady) {
    return (
      <Card className="shadow-depth border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Baltic Sea Monitoring Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-3 text-blue-900">🗺️ Interactive Map Setup</h3>
              <p className="text-sm text-blue-700 mb-4">
                To view the interactive Baltic Sea monitoring stations map, you need a free Mapbox token:
              </p>
              <ol className="text-sm text-blue-700 mb-4 ml-4 list-decimal space-y-1">
                <li>Visit <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">mapbox.com</a> and create a free account</li>
                <li>Go to your Account → Access Tokens</li>
                <li>Copy your "Default public token" (starts with pk.ey...)</li>
                <li>Paste it below and click "Load Map"</li>
              </ol>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbG..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1 bg-white"
                />
                <Button onClick={handleTokenSubmit} className="whitespace-nowrap">
                  🚀 Load Map
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 Your token is only stored locally in your browser and never sent to our servers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Monitoring Stations</h4>
                <div className="space-y-2">
                  {monitoringStations.slice(0, 4).map(station => (
                    <div key={station.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(station.status)}
                        <span className="text-sm font-medium">{station.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {station.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Network Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Stations:</span>
                    <span className="font-medium text-green-600">
                      {monitoringStations.filter(s => s.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Warning Status:</span>
                    <span className="font-medium text-yellow-600">
                      {monitoringStations.filter(s => s.status === 'warning').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Critical Status:</span>
                    <span className="font-medium text-red-600">
                      {monitoringStations.filter(s => s.status === 'critical').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-depth border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Baltic Sea Monitoring Network
          <Badge variant="secondary" className="ml-auto">
            {monitoringStations.length} Stations
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainer} className="h-96 rounded-lg overflow-hidden" />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Click on station markers for detailed information. Use controls to navigate the map.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalticSeaMap;
