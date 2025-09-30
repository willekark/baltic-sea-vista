import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Ship, Eye, Activity, Filter, Play, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useShadowFleetAlerts,
  useVesselTrack,
  useSARDetections,
  useRunCorrelation,
  useCalculateScores
} from '@/hooks/useShadowFleetData';

/**
 * Enhanced Shadow Fleet Tracker V2
 * Production-grade geospatial analysis with AIS-SAR correlation
 */

const ShadowFleetTrackerV2: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedMMSI, setSelectedMMSI] = useState<number | null>(null);
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  // Fetch data using hooks
  const { data: alerts, refetch: refetchAlerts } = useShadowFleetAlerts({
    minScore: minScore,
    type: alertFilter === 'all' ? undefined : alertFilter,
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  const { data: sarDetections, refetch: refetchSAR } = useSARDetections({
    since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  });

  const { data: vesselTrack } = useVesselTrack(selectedMMSI);
  const runCorrelation = useRunCorrelation();
  const calculateScores = useCalculateScores();

  // Initialize map
  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [18.5, 58.5], // Baltic Sea
      zoom: 6,
      pitch: 45,
      bearing: 0
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

    map.current.on('load', () => {
      setIsMapReady(true);
      console.log('Map loaded successfully');
      
      toast({
        title: "Map Ready",
        description: alerts && alerts.length === 0 ? "Click 'Seed Demo Data' to populate the database" : `Displaying ${alerts?.length || 0} alerts`,
      });
    });
  };

  // Add alerts to map
  useEffect(() => {
    if (!map.current || !isMapReady || !alerts) return;

    // Remove existing alert markers
    const existingMarkers = document.querySelectorAll('.alert-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add alert markers
    alerts.forEach(alert => {
      if (!alert.lat || !alert.lon) return;

      const el = document.createElement('div');
      el.className = 'alert-marker';
      
      let color = '#10b981'; // green
      let icon = '📍';
      
      if (alert.type === 'dark_detection') {
        color = '#ef4444'; // red
        icon = '🔴';
      } else if (alert.type === 'spoofing_suspected') {
        color = '#f97316'; // orange
        icon = '⚠️';
      } else if (alert.type === 'loitering') {
        color = '#eab308'; // yellow
        icon = '⏱️';
      } else if (alert.type === 'rendezvous') {
        color = '#8b5cf6'; // purple
        icon = '🤝';
      }

      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid ${color};
        background-color: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.6);
        transition: all 0.2s ease;
      `;
      el.innerHTML = icon;

      el.addEventListener('click', () => {
        setSelectedAlert(alert);
        if (alert.mmsi) {
          setSelectedMMSI(alert.mmsi);
        }
      });

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${color};">
            ${icon} ${alert.type.replace('_', ' ').toUpperCase()}
          </h3>
          <div style="background: ${color}20; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600;">
              Score: ${alert.score}/100
            </p>
          </div>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Summary:</strong> ${alert.summary}</p>
          ${alert.mmsi ? `<p style="margin: 4px 0; font-size: 12px;"><strong>MMSI:</strong> ${alert.mmsi}</p>` : ''}
          <p style="margin: 4px 0; font-size: 11px; color: #888;">
            ${new Date(alert.alert_time).toLocaleString()}
          </p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([alert.lon, alert.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [alerts, isMapReady]);

  // Add SAR detections to map
  useEffect(() => {
    if (!map.current || !isMapReady || !sarDetections) return;

    // Remove existing SAR markers
    const existingSARMarkers = document.querySelectorAll('.sar-marker');
    existingSARMarkers.forEach(marker => marker.remove());

    // Add SAR detection markers
    sarDetections.forEach(detection => {
      const el = document.createElement('div');
      el.className = 'sar-marker';
      
      const isMatched = detection.matched_mmsi !== null;
      const color = isMatched ? '#10b981' : '#ef4444';
      
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid ${color};
        background-color: ${color}40;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      `;
      el.innerHTML = '📡';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 6px 0; font-weight: bold; color: ${color};">
            📡 SAR Detection
          </h3>
          <p style="margin: 4px 0; font-size: 11px;"><strong>Scene:</strong> ${detection.scene_id}</p>
          <p style="margin: 4px 0; font-size: 11px;"><strong>Length:</strong> ${detection.est_length_m.toFixed(0)}m</p>
          <p style="margin: 4px 0; font-size: 11px;"><strong>Confidence:</strong> ${(detection.confidence * 100).toFixed(0)}%</p>
          ${isMatched ? `
            <p style="margin: 4px 0; font-size: 11px; color: ${color};">
              <strong>Matched:</strong> MMSI ${detection.matched_mmsi}
            </p>
          ` : `
            <p style="margin: 4px 0; font-size: 11px; color: ${color}; font-weight: bold;">
              UNMATCHED (Dark Detection)
            </p>
          `}
          <p style="margin: 4px 0; font-size: 10px; color: #888;">
            ${new Date(detection.acq_time).toLocaleString()}
          </p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([detection.lon, detection.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [sarDetections, isMapReady]);

  // Add vessel track to map
  useEffect(() => {
    if (!map.current || !isMapReady || !vesselTrack) return;

    const sourceId = 'vessel-track';
    const layerId = 'vessel-track-line';

    // Remove existing track
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add new track
    const coordinates = vesselTrack.points.map(p => [p.lon, p.lat]);

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 3,
        'line-opacity': 0.8
      }
    });

    // Fit map to track
    if (coordinates.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => {
        bounds.extend(coord as mapboxgl.LngLatLike);
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [vesselTrack, isMapReady]);

  // Token handling
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mapboxToken.startsWith('pk.')) {
      toast({
        title: "Invalid Token",
        description: "Mapbox tokens should start with 'pk.'",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('mapbox_token', mapboxToken);
    initializeMap(mapboxToken);
    
    toast({
      title: "Token Saved",
      description: "Initializing map...",
    });
  };

  // Load token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      initializeMap(savedToken);
    }
  }, []);

  // Seed demo data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      toast({ title: "Seeding Demo Data", description: "This may take a moment..." });
      
      const { data, error } = await supabase.functions.invoke('seed-shadow-fleet-data');
      
      if (error) throw error;
      
      // Refetch all data
      refetchAlerts();
      refetchSAR();
      
      toast({
        title: "Demo Data Seeded",
        description: `Created ${data.data.ais_positions_created} AIS positions and ${data.data.sar_detections_created} SAR detections`,
      });
    } catch (error: any) {
      toast({
        title: "Seeding Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Run correlation
  const handleRunCorrelation = async () => {
    try {
      toast({ title: "Running Correlation", description: "This may take a moment..." });
      const result = await runCorrelation();
      refetchAlerts();
      refetchSAR();
      toast({
        title: "Correlation Complete",
        description: `Processed ${result.processed} detections, found ${result.alerts_created} anomalies`,
      });
    } catch (error: any) {
      toast({
        title: "Correlation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate scores
  const handleCalculateScores = async () => {
    try {
      toast({ title: "Calculating Scores", description: "Analyzing vessel behavior..." });
      const result = await calculateScores();
      toast({
        title: "Scoring Complete",
        description: `Scored ${result.scored} vessels`,
      });
    } catch (error: any) {
      toast({
        title: "Scoring Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const alertTypeCounts = {
    all: alerts?.length || 0,
    dark_detection: alerts?.filter(a => a.type === 'dark_detection').length || 0,
    spoofing_suspected: alerts?.filter(a => a.type === 'spoofing_suspected').length || 0,
    loitering: alerts?.filter(a => a.type === 'loitering').length || 0,
    rendezvous: alerts?.filter(a => a.type === 'rendezvous').length || 0,
  };

  const hasData = (alerts && alerts.length > 0) || (sarDetections && sarDetections.length > 0);

  if (!isMapReady && !mapboxToken) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>🗺️ Shadow Fleet Tracker V2</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mapbox Public Token
                </label>
                <Input
                  type="text"
                  placeholder="pk.eyJ1Ij..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Get your token at{' '}
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
              <Button type="submit" className="w-full">
                Initialize Map
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🛰️ Shadow Fleet Tracker V2</h1>
            <p className="text-sm text-muted-foreground">
              Production-grade AIS-SAR correlation with ML-based anomaly detection
            </p>
          </div>
          <div className="flex gap-2">
            {!hasData && (
              <Button
                onClick={handleSeedData}
                disabled={isSeeding}
                variant="default"
                size="sm"
              >
                <Database className="w-4 h-4 mr-2" />
                {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
              </Button>
            )}
            <Button
              onClick={handleRunCorrelation}
              variant="outline"
              size="sm"
              disabled={!hasData}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Correlation
            </Button>
            <Button
              onClick={handleCalculateScores}
              variant="outline"
              size="sm"
              disabled={!hasData}
            >
              <Activity className="w-4 h-4 mr-2" />
              Calculate Scores
            </Button>
            <Button
              onClick={() => {
                refetchAlerts();
                refetchSAR();
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 bg-background border-r overflow-y-auto">
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="alerts" className="flex-1">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alerts ({alertTypeCounts.all})
              </TabsTrigger>
              <TabsTrigger value="sar" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                SAR ({sarDetections?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="p-4 space-y-4">
              {!hasData ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      No data available. Click "Seed Demo Data" to populate the database.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-2">
                    <Select value={alertFilter} onValueChange={setAlertFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Alerts ({alertTypeCounts.all})</SelectItem>
                        <SelectItem value="dark_detection">🔴 Dark Detection ({alertTypeCounts.dark_detection})</SelectItem>
                        <SelectItem value="spoofing_suspected">⚠️ Spoofing ({alertTypeCounts.spoofing_suspected})</SelectItem>
                        <SelectItem value="loitering">⏱️ Loitering ({alertTypeCounts.loitering})</SelectItem>
                        <SelectItem value="rendezvous">🤝 Rendezvous ({alertTypeCounts.rendezvous})</SelectItem>
                      </SelectContent>
                    </Select>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Min Score: {minScore}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {alerts?.map(alert => (
                      <Card
                        key={alert.id}
                        className={`cursor-pointer hover:bg-accent transition-colors ${
                          selectedAlert?.id === alert.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedAlert(alert);
                          if (alert.mmsi) setSelectedMMSI(alert.mmsi);
                          if (map.current && alert.lat && alert.lon) {
                            map.current.flyTo({ center: [alert.lon, alert.lat], zoom: 10 });
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={alert.score >= 70 ? "destructive" : "secondary"}>
                              Score: {alert.score}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.alert_time).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </h4>
                          <p className="text-xs text-muted-foreground">{alert.summary}</p>
                          {alert.mmsi && (
                            <p className="text-xs mt-2">MMSI: {alert.mmsi}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sar" className="p-4 space-y-2">
              {!hasData ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      No SAR detections available. Click "Seed Demo Data" first.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sarDetections?.map(detection => (
                  <Card key={detection.id} className="cursor-pointer hover:bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={detection.matched_mmsi ? "default" : "destructive"}>
                          {detection.matched_mmsi ? 'Matched' : 'Dark'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(detection.acq_time).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {detection.scene_id}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Length: {detection.est_length_m.toFixed(0)}m | 
                        Conf: {(detection.confidence * 100).toFixed(0)}%
                      </p>
                      {detection.matched_mmsi && (
                        <p className="text-xs mt-2">MMSI: {detection.matched_mmsi}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Legend */}
          <Card className="absolute top-4 left-4 w-64 bg-background/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span>Dark Detection (No AIS)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span>Spoofing Suspected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span>Loitering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <span>Rendezvous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span>SAR Matched</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShadowFleetTrackerV2;
