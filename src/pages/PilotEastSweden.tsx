import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Leaf, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  BarChart3,
  Eye,
  FileText,
  Layers
} from "lucide-react";

interface PilotKPI {
  id: string;
  title: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'adequate' | 'warning' | 'alert';
  trend: 'improving' | 'stable' | 'declining';
  lastUpdate: string;
  dataSource: string;
  confidence: number;
}

interface EvidenceMetric {
  name: string;
  value: number;
  unit: string;
  trend: number[];
  source: string;
}

const PilotEastSweden = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState('stockholm');
  const [kpis, setKpis] = useState<PilotKPI[]>([]);
  const [evidenceMetrics, setEvidenceMetrics] = useState<EvidenceMetric[]>([]);
  const [mapLayers, setMapLayers] = useState({
    mpas: false,
    floodZones: false,
    bathingSites: true,
    stormwater: false
  });
  const [loading, setLoading] = useState(false);

  const municipalities = [
    { id: 'stockholm', name: 'Stockholm Municipality', population: '975,551' },
    { id: 'norrkoping', name: 'Norrköping Municipality', population: '143,171' },
    { id: 'nykoping', name: 'Nyköping Municipality', population: '58,411' }
  ];

  useEffect(() => {
    fetchPilotData();
  }, [selectedMunicipality]);

  const fetchPilotData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the data connectors
      // For now, we'll generate representative pilot data
      const mockKPIs = generatePilotKPIs(selectedMunicipality);
      const mockEvidence = generateEvidenceMetrics(selectedMunicipality);
      
      setKpis(mockKPIs);
      setEvidenceMetrics(mockEvidence);
    } catch (error) {
      console.error('Error fetching pilot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePilotKPIs = (municipalityId: string): PilotKPI[] => {
    const municipalityData = {
      stockholm: {
        bathing_performance: { value: 85, status: 'excellent' as const, trend: 'improving' as const },
        eutrophication_pressure: { value: 68, status: 'good' as const, trend: 'stable' as const },
        oxygen_stress: { value: 12, status: 'warning' as const, trend: 'declining' as const },
        wastewater_compliance: { value: 92, status: 'excellent' as const, trend: 'improving' as const },
        protected_waters: { value: 23, status: 'good' as const, trend: 'stable' as const },
        flood_resilience: { value: 75, status: 'good' as const, trend: 'improving' as const }
      },
      norrkoping: {
        bathing_performance: { value: 78, status: 'good' as const, trend: 'stable' as const },
        eutrophication_pressure: { value: 62, status: 'good' as const, trend: 'declining' as const },
        oxygen_stress: { value: 18, status: 'warning' as const, trend: 'stable' as const },
        wastewater_compliance: { value: 88, status: 'good' as const, trend: 'improving' as const },
        protected_waters: { value: 18, status: 'adequate' as const, trend: 'stable' as const },
        flood_resilience: { value: 65, status: 'warning' as const, trend: 'stable' as const }
      },
      nykoping: {
        bathing_performance: { value: 82, status: 'excellent' as const, trend: 'improving' as const },
        eutrophication_pressure: { value: 71, status: 'good' as const, trend: 'improving' as const },
        oxygen_stress: { value: 8, status: 'good' as const, trend: 'improving' as const },
        wastewater_compliance: { value: 90, status: 'excellent' as const, trend: 'stable' as const },
        protected_waters: { value: 15, status: 'adequate' as const, trend: 'stable' as const },
        flood_resilience: { value: 70, status: 'good' as const, trend: 'stable' as const }
      }
    };
    
    const selectedData = municipalityData[municipalityId as keyof typeof municipalityData] || municipalityData.stockholm;

    return [
      {
        id: 'bathing_performance',
        title: 'Bathing Water Quality',
        value: selectedData.bathing_performance.value,
        unit: '% excellent/good sites',
        status: selectedData.bathing_performance.status,
        trend: selectedData.bathing_performance.trend,
        lastUpdate: '2025-08-25',
        dataSource: 'EEA Bathing Water Database',
        confidence: 0.95
      },
      {
        id: 'eutrophication_pressure',
        title: 'Eutrophication Pressure',
        value: selectedData.eutrophication_pressure.value,
        unit: 'index (0-100)',
        status: selectedData.eutrophication_pressure.status,
        trend: selectedData.eutrophication_pressure.trend,
        lastUpdate: '2025-08-28',
        dataSource: 'SMHI SHARK + CMEMS',
        confidence: 0.82
      },
      {
        id: 'oxygen_stress',
        title: 'Hypoxia Risk Level',
        value: selectedData.oxygen_stress.value,
        unit: 'days/quarter DO<2mg/L',
        status: selectedData.oxygen_stress.status,
        trend: selectedData.oxygen_stress.trend,
        lastUpdate: '2025-08-20',
        dataSource: 'SMHI SHARKdata',
        confidence: 0.78
      },
      {
        id: 'wastewater_compliance',
        title: 'Wastewater Treatment',
        value: selectedData.wastewater_compliance.value,
        unit: '% UWWTD compliance',
        status: selectedData.wastewater_compliance.status,
        trend: selectedData.wastewater_compliance.trend,
        lastUpdate: '2025-06-01',
        dataSource: 'EEA UWWTD Database',
        confidence: 0.98
      },
      {
        id: 'protected_waters',
        title: 'Marine Protection',
        value: selectedData.protected_waters.value,
        unit: '% waters in MPAs',
        status: selectedData.protected_waters.status,
        trend: selectedData.protected_waters.trend,
        lastUpdate: '2025-01-15',
        dataSource: 'HELCOM MADS',
        confidence: 0.92
      },
      {
        id: 'flood_resilience',
        title: 'Coastal Flood Resilience',
        value: selectedData.flood_resilience.value,
        unit: 'resilience index',
        status: selectedData.flood_resilience.status,
        trend: selectedData.flood_resilience.trend,
        lastUpdate: '2025-03-01',
        dataSource: 'MSB Flood Portal',
        confidence: 0.85
      }
    ];
  };

  const generateEvidenceMetrics = (municipalityId: string): EvidenceMetric[] => {
    return [
      {
        name: 'Chlorophyll-a Concentration',
        value: 3.2,
        unit: 'μg/L',
        trend: [2.8, 3.1, 3.4, 3.2, 2.9],
        source: 'SMHI SHARK'
      },
      {
        name: 'Sea Surface Temperature Anomaly',
        value: 1.3,
        unit: '°C vs baseline',
        trend: [0.8, 1.1, 1.5, 1.3, 1.2],
        source: 'CMEMS Baltic'
      },
      {
        name: 'Cyanobacteria Bloom Days',
        value: 18,
        unit: 'days/season',
        trend: [15, 22, 19, 18, 16],
        source: 'SMHI Algae Portal'
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'adequate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'alert': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleDownload = (format: 'csv' | 'geojson') => {
    console.log(`Downloading ${format} for ${selectedMunicipality}`);
    // Implement download functionality
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Baltic Data Hub - Eastern Sweden Pilot</h1>
            <p className="text-xl text-muted-foreground">Automated ecological scorecards for Stockholm, Norrköping, and Nyköping</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select municipality" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{municipality.name}</span>
                      <span className="text-xs text-muted-foreground">Pop: {municipality.population}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Baltic Proper
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
            <TabsTrigger value="map">Map Overlays</TabsTrigger>
            <TabsTrigger value="evidence">Evidence Panel</TabsTrigger>
            <TabsTrigger value="provenance">Data Provenance</TabsTrigger>
          </TabsList>

          {/* KPI Dashboard */}
          <TabsContent value="kpis" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className={`border-2 ${getStatusColor(kpi.status)}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{kpi.title}</CardTitle>
                        {getTrendIcon(kpi.trend)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">{kpi.value}</span>
                          <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(kpi.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(kpi.status)}`}>
                            {kpi.status}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <div>Updated: {kpi.lastUpdate}</div>
                          <div>Source: {kpi.dataSource}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Map Overlays */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Interactive Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(mapLayers).map(([layer, enabled]) => (
                    <label key={layer} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setMapLayers(prev => ({ ...prev, [layer]: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{layer.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
                
                <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4" />
                    <p>Interactive map would be rendered here</p>
                    <p className="text-sm">Showing: {Object.entries(mapLayers).filter(([_, enabled]) => enabled).map(([layer]) => layer).join(', ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Panel */}
          <TabsContent value="evidence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Supporting Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evidenceMetrics.map((metric, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{metric.name}</h4>
                          <Badge variant="outline" className="text-xs">{metric.source}</Badge>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className="text-sm text-muted-foreground">{metric.unit}</span>
                        </div>
                        <div className="h-16 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">5-point trend line</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Data Exports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload('csv')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Download CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload('geojson')}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        Download GeoJSON
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Includes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All KPI values with timestamps</li>
                        <li>Data quality flags and confidence scores</li>
                        <li>Source attribution and licenses</li>
                        <li>Municipal boundary geometries (GeoJSON)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Provenance */}
          <TabsContent value="provenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Data Sources & Licenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'SMHI SHARKdata',
                      description: 'Marine monitoring data (nutrients, oxygen, chlorophyll)',
                      license: 'CC BY 4.0',
                      lastUpdate: '2025-08-28',
                      coverage: '95%',
                      url: 'https://sharkdata.smhi.se'
                    },
                    {
                      name: 'EEA Bathing Water Database',
                      description: 'EU Bathing Water Directive compliance data',
                      license: 'EEA Standard re-use policy',
                      lastUpdate: '2025-08-25',
                      coverage: '100%',
                      url: 'https://www.eea.europa.eu/data-and-maps/data/bathing-water-directive-status-waters-2021'
                    },
                    {
                      name: 'CMEMS Baltic Sea',
                      description: 'Copernicus Marine biogeochemical models',
                      license: 'Copernicus Marine Service',
                      lastUpdate: '2025-08-28',
                      coverage: '90%',
                      url: 'https://marine.copernicus.eu'
                    },
                    {
                      name: 'HELCOM Map & Data Service',
                      description: 'Protected areas and eutrophication indicators',
                      license: 'HELCOM',
                      lastUpdate: '2025-01-15',
                      coverage: '85%',
                      url: 'https://maps.helcom.fi'
                    }
                  ].map((source, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{source.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {source.coverage} coverage
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {source.license}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Last updated: {source.lastUpdate}</span>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View source →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PilotEastSweden;