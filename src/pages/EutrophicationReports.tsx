import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Droplets, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  RefreshCw,
  Leaf,
  Fish,
  Waves,
  Cloud,
  Navigation,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EutrophicationMap from '@/components/EutrophicationMap';

interface EutrophicationArea {
  location: string;
  lat: number;
  lng: number;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  nitrogen: number;
  phosphorus: number;
  chlorophyll: number;
  oxygen: number;
  trend: 'improving' | 'stable' | 'worsening';
  causes: string[];
  forecast: string;
}

interface EutrophicationReport {
  timestamp: string;
  summary: {
    totalAreas: number;
    severeAreas: number;
    highRiskAreas: number;
    trendingWorse: number;
  };
  areas: EutrophicationArea[];
  aiAnalysis: string;
  metadata: {
    dataPoints: number;
    lastUpdated: string;
  };
}

const EutrophicationReports = () => {
  const [report, setReport] = useState<EutrophicationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('eutrophication-reports');
      
      if (functionError) throw functionError;
      
      setReport(data);
    } catch (err) {
      console.error('Error fetching eutrophication report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'destructive';
      case 'high': return 'secondary';
      case 'moderate': return 'default';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'worsening': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'improving': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-600">Generating eutrophication analysis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-6 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading eutrophication report: {error}
              <Button onClick={fetchReport} variant="outline" size="sm" className="ml-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Eutrophication Analysis Report
              </h1>
              <p className="text-lg text-gray-600">
                Real-time monitoring and forecasting of nutrient pollution in Baltic Sea waters
              </p>
            </div>
            <Button onClick={fetchReport} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Areas</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.summary.totalAreas}</div>
                  <p className="text-xs text-muted-foreground">Monitored locations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Severe Areas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{report.summary.severeAreas}</div>
                  <p className="text-xs text-muted-foreground">Critical conditions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <Droplets className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{report.summary.highRiskAreas}</div>
                  <p className="text-xs text-muted-foreground">Elevated concern</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Worsening</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{report.summary.trendingWorse}</div>
                  <p className="text-xs text-muted-foreground">Deteriorating trends</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="map" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="map">Impact Map</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="areas">Affected Areas</TabsTrigger>
                <TabsTrigger value="forecast">Forecast & Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-6">
                <div className="mb-6">
                  <EutrophicationMap areas={report.areas} />
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Leaf className="w-5 h-5 mr-2 text-green-600" />
                      Expert Environmental Analysis
                    </CardTitle>
                    <CardDescription>
                      AI-powered analysis of current eutrophication conditions and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {report.aiAnalysis}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="areas" className="space-y-6">
                <div className="grid gap-6">
                  {report.areas.map((area, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            {area.location}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityColor(area.severity)}>
                              {area.severity.toUpperCase()}
                            </Badge>
                            {getTrendIcon(area.trend)}
                          </div>
                        </div>
                        <CardDescription>
                          {area.lat.toFixed(4)}°N, {area.lng.toFixed(4)}°E
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Nitrogen</p>
                            <p className="text-lg font-semibold">{area.nitrogen.toFixed(2)} mg/L</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Phosphorus</p>
                            <p className="text-lg font-semibold">{area.phosphorus.toFixed(2)} mg/L</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Chlorophyll-a</p>
                            <p className="text-lg font-semibold">{area.chlorophyll.toFixed(1)} μg/L</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Dissolved O₂</p>
                            <p className="text-lg font-semibold">{area.oxygen.toFixed(1)} mg/L</p>
                          </div>
                        </div>
                        
                        {area.causes.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Contributing Factors:</p>
                            <div className="flex flex-wrap gap-2">
                              {area.causes.map((cause, causeIndex) => (
                                <Badge key={causeIndex} variant="outline" className="text-xs">
                                  {cause}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">Forecast:</p>
                          <p className="text-sm text-blue-700">{area.forecast}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Cloud className="w-5 h-5 mr-2 text-gray-600" />
                        Weather Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Temperature Effect</span>
                          <Progress value={75} className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rainfall Runoff</span>
                          <Progress value={60} className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Wind Mixing</span>
                          <Progress value={40} className="w-24" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Warm temperatures and recent rainfall are contributing to nutrient loading and algae growth.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Waves className="w-5 h-5 mr-2 text-blue-600" />
                        Current Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Northward Flow</span>
                          <Badge variant="outline">Moderate</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Coastal Circulation</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Deep Water Exchange</span>
                          <Badge variant="outline">Limited</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Current patterns may transport nutrients and algae along coastal areas over the next 3-5 days.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Metadata */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-sm">Report Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <div className="flex flex-wrap gap-6">
                  <span>Generated: {new Date(report.timestamp).toLocaleString()}</span>
                  <span>Data Points: {report.metadata.dataPoints}</span>
                  <span>Last Updated: {new Date(report.metadata.lastUpdated).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EutrophicationReports;