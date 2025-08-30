import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import CTARecommendationCard from '../components/CTARecommendationCard';
import { generateCTARecommendations } from '../utils/ctaGenerator';
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
  Layers,
  Target,
  Users,
  Building,
  Zap,
  Shield,
  Droplets,
  Factory,
  TreePine,
  Waves,
  Calendar,
  Euro,
  Scale,
  BookOpen,
  Settings
} from "lucide-react";

interface EcologicalScore {
  overallScore: number;
  pillars: {
    eutrophication_pressure: number;
    ecosystem_health: number;
    bathing_wastewater: number;
    coastal_hazard: number;
    trend_compliance: number;
  };
  confidence: number;
  trend?: 'improving' | 'stable' | 'declining';
}

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

interface CTARecommendation {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  actions: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  estimated_impact: {
    kpi_improvement: string;
    co2_reduction_tonnes: number;
    cost_estimate_eur: string;
    roi_timeline: string;
  };
  implementation: {
    stakeholders: string[];
    timeline_months: number;
    budget_sources: string[];
    success_metrics: string[];
  };
  evidence: {
    data_sources: string[];
    baseline_values: { [key: string]: number };
    benchmarks: string;
  };
  regulatory_framework: {
    eu_directives: string[];
    national_legislation: string[];
    local_permits: string[];
  };
  co_benefits: string[];
  risks: string[];
}

const EcologicalReporting = () => {
  const [selectedEntity, setSelectedEntity] = useState('stockholm');
  const [score, setScore] = useState<EcologicalScore | null>(null);
  const [kpis, setKpis] = useState<PilotKPI[]>([]);
  const [evidenceMetrics, setEvidenceMetrics] = useState<EvidenceMetric[]>([]);
  const [ctas, setCtas] = useState<CTARecommendation[]>([]);
  const [mapLayers, setMapLayers] = useState({
    mpas: false,
    floodZones: false,
    bathingSites: true,
    stormwater: false
  });
  const [loading, setLoading] = useState(false);

  const municipalities = [
    { id: 'stockholm', name: 'Stockholm Municipality', population: '975,551', region: 'Eastern Sweden' },
    { id: 'norrkoping', name: 'Norrköping Municipality', population: '143,171', region: 'Eastern Sweden' },
    { id: 'nykoping', name: 'Nyköping Municipality', population: '58,411', region: 'Eastern Sweden' },
    { id: 'gothenburg', name: 'Gothenburg Municipality', population: '579,281', region: 'Western Sweden' },
    { id: 'malmo', name: 'Malmö Municipality', population: '347,949', region: 'Southern Sweden' },
    { id: 'helsinki', name: 'Helsinki Municipality', population: '658,457', region: 'Finland' }
  ];

  useEffect(() => {
    initializeData();
  }, [selectedEntity]);

  const initializeData = async () => {
    // First check if we have any data, if not seed it
    const { data: existingMunicipalities } = await supabase
      .from('municipalities')
      .select('id')
      .limit(1);

    if (!existingMunicipalities?.length) {
      console.log('No municipalities found, seeding data...');
      await supabase.functions.invoke('seed-ecological-data');
    }

    fetchEcologicalData();
  };

  const fetchEcologicalData = async () => {
    setLoading(true);
    try {
      // Fetch ecological score
      const { data: scoreData } = await supabase.functions.invoke('ecological-scoring', {
        body: { entityType: 'municipality', entityId: selectedEntity, period: 'quarter' }
      });

      if (scoreData?.success) {
        setScore(scoreData.data);
      }

      // Generate comprehensive pilot data
      const mockKPIs = generatePilotKPIs(selectedEntity);
      const mockEvidence = generateEvidenceMetrics(selectedEntity);
      const mockCTAs = generateCTARecommendationsLocal(selectedEntity, mockKPIs);
      
      setKpis(mockKPIs);
      setEvidenceMetrics(mockEvidence);
      setCtas(mockCTAs);
    } catch (error) {
      console.error('Error fetching ecological data:', error);
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
      },
      gothenburg: {
        bathing_performance: { value: 80, status: 'good' as const, trend: 'stable' as const },
        eutrophication_pressure: { value: 65, status: 'good' as const, trend: 'stable' as const },
        oxygen_stress: { value: 15, status: 'warning' as const, trend: 'stable' as const },
        wastewater_compliance: { value: 89, status: 'good' as const, trend: 'improving' as const },
        protected_waters: { value: 20, status: 'good' as const, trend: 'stable' as const },
        flood_resilience: { value: 72, status: 'good' as const, trend: 'improving' as const }
      },
      malmo: {
        bathing_performance: { value: 76, status: 'good' as const, trend: 'declining' as const },
        eutrophication_pressure: { value: 58, status: 'adequate' as const, trend: 'declining' as const },
        oxygen_stress: { value: 22, status: 'alert' as const, trend: 'declining' as const },
        wastewater_compliance: { value: 86, status: 'good' as const, trend: 'stable' as const },
        protected_waters: { value: 16, status: 'adequate' as const, trend: 'stable' as const },
        flood_resilience: { value: 68, status: 'good' as const, trend: 'stable' as const }
      },
      helsinki: {
        bathing_performance: { value: 88, status: 'excellent' as const, trend: 'improving' as const },
        eutrophication_pressure: { value: 72, status: 'good' as const, trend: 'improving' as const },
        oxygen_stress: { value: 6, status: 'excellent' as const, trend: 'improving' as const },
        wastewater_compliance: { value: 95, status: 'excellent' as const, trend: 'improving' as const },
        protected_waters: { value: 28, status: 'excellent' as const, trend: 'improving' as const },
        flood_resilience: { value: 78, status: 'good' as const, trend: 'improving' as const }
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

  const generateCTARecommendationsLocal = (municipalityId: string, kpis: PilotKPI[]): CTARecommendation[] => {
    return generateCTARecommendations(municipalityId, kpis);
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

  const handleExport = async (framework: string) => {
    try {
      const { data } = await supabase.functions.invoke('ecological-exports', {
        body: { 
          entityType: 'municipality', 
          entityId: selectedEntity, 
          framework,
          format: 'json'
        }
      });
      
      // Download the export
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${framework}-report-${selectedEntity}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  const handleDownload = (format: 'csv' | 'geojson') => {
    console.log(`Downloading ${format} for ${selectedEntity}`);
    // Implement download functionality
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Baltic Data Hub - Ecological Reporting</h1>
            <p className="text-xl text-muted-foreground">Automated Baltic Sea ecological scorecards and sustainability reporting</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select municipality" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{municipality.name}</span>
                      <span className="text-xs text-muted-foreground">{municipality.region} • Pop: {municipality.population}</span>
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

        <Tabs defaultValue="scorecard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="ctas">Action Plan</TabsTrigger>
            <TabsTrigger value="map">Map Layers</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="exports">Reports</TabsTrigger>
          </TabsList>

          {/* Main Scorecard */}
          <TabsContent value="scorecard" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <section id="scorecard">
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-6 h-6 text-primary" />
                      Ecological Performance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${getScoreColor(score?.overallScore || 0)} mb-2`}>
                          {score?.overallScore?.toFixed(1) || '0.0'}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          {getTrendIcon(score?.trend)}
                          <span>Overall Score</span>
                          <Badge variant="secondary">{Math.round((score?.confidence || 1) * 100)}% confidence</Badge>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="space-y-4">
                          {score?.pillars && Object.entries(score.pillars).map(([pillar, value]) => (
                            <div key={pillar} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium capitalize">
                                  {pillar.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm text-muted-foreground">{value.toFixed(1)}</span>
                              </div>
                              <Progress value={value} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </TabsContent>

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

          {/* Call-to-Actions */}
          <TabsContent value="ctas" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Action Plan & Recommendations</h2>
                <p className="text-muted-foreground mt-1">
                  Evidence-based interventions to improve ecological performance metrics
                </p>
              </div>
              <Badge variant="outline" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {ctas.length} Active Recommendations
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {ctas.map((recommendation) => (
                  <CTARecommendationCard 
                    key={recommendation.id} 
                    recommendation={recommendation} 
                  />
                ))}
                
                {ctas.length === 0 && (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No specific recommendations needed at this time.</p>
                      <p className="text-sm mt-2">All KPIs are performing within acceptable ranges.</p>
                    </div>
                  </Card>
                )}
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
                    <p className="text-sm">Showing: {Object.entries(mapLayers).filter(([_, enabled]) => Boolean(enabled)).map(([layer]) => layer).join(', ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Panel */}
          <TabsContent value="evidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Evidence & Time Series Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {evidenceMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{metric.name}</h3>
                        <div className="text-2xl font-bold text-primary">
                          {metric.value} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                        </div>
                        <Badge variant="outline" className="mt-2">{metric.source}</Badge>
                      </div>
                      
                      <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                        <div className="text-xs text-muted-foreground">
                          Trend: {metric.trend.join(' → ')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownload('csv')}>
                          <Download className="w-3 h-3 mr-1" />
                          CSV
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownload('geojson')}>
                          <Download className="w-3 h-3 mr-1" />
                          GeoJSON
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Options */}
          <TabsContent value="exports" className="space-y-6">
            <section id="exports">
              <Card>
                <CardHeader>
                  <CardTitle>Standards-Aligned Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { framework: 'cdp', label: 'CDP Cities', description: 'Climate disclosure' },
                      { framework: 'secap', label: 'SECAP', description: 'Climate action plan' },
                      { framework: 'gca', label: 'Green City Accord', description: 'EU sustainability' },
                      { framework: 'iso37120', label: 'ISO 37120', description: 'City indicators' },
                      { framework: 'blue-bond', label: 'Blue Bond', description: 'Finance readiness' }
                    ].map((export_option) => (
                      <Button
                        key={export_option.framework}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => handleExport(export_option.framework)}
                      >
                        <Download className="w-5 h-5" />
                        <div className="text-center">
                          <div className="font-semibold text-sm">{export_option.label}</div>
                          <div className="text-xs text-muted-foreground">{export_option.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EcologicalReporting;