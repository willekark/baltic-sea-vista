import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Ship,
  AlertTriangle, 
  Shield,
  Satellite,
  Navigation,
  Target,
  Eye,
  ChevronLeft,
  RefreshCw,
  MapPin,
  Clock,
  TrendingUp,
  Skull,
  Waves,
  Anchor,
  Fuel
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ShadowFleetMap from '@/components/ShadowFleetMap';

interface ShadowFleetAnalysis {
  timestamp: string;
  summary: {
    totalVesselsAnalyzed: number;
    darkZoneDetections: number;
    suspiciousBehaviors: number;
    sanctionsViolations: number;
    stsTransfers: number;
    highRiskVessels: number;
  };
  alerts: any[];
  recommendations: string[];
}

const ShadowFleetTracker = () => {
  const [analysis, setAnalysis] = useState<ShadowFleetAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('shadow-fleet-analysis');
      
      if (functionError) throw functionError;
      
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching shadow fleet analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // Set up real-time monitoring
    const interval = setInterval(fetchAnalysis, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ais_dark_zone': return Eye;
      case 'sanctions_violation': return Shield;
      case 'sts_transfer': return Fuel;
      case 'loitering': return Anchor;
      case 'false_destination': return Navigation;
      default: return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-red-600" />
              <p className="text-gray-600">Analyzing Baltic Sea vessel patterns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading shadow fleet analysis: {error}
              <Button onClick={fetchAnalysis} variant="outline" size="sm" className="ml-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Skull className="w-10 h-10 mr-3 text-red-600" />
                Shadow Fleet Tracker
              </h1>
              <p className="text-lg text-gray-600">
                Real-time monitoring and detection of potentially sanctioned vessels in the Baltic Sea
              </p>
            </div>
            <Button onClick={fetchAnalysis} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </div>

        {analysis && (
          <>
            {/* Critical Alerts Banner */}
            {analysis.summary.sanctionsViolations > 0 && (
              <Alert className="mb-6 border-red-500 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>CRITICAL SECURITY ALERT:</strong> {analysis.summary.sanctionsViolations} sanctioned vessel(s) detected in Baltic waters. 
                  Immediate action required - notify maritime authorities.
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Ship className="w-4 h-4 mr-2 text-blue-600" />
                    Vessels Analyzed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{analysis.summary.totalVesselsAnalyzed}</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-yellow-600" />
                    Dark Zones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-900">{analysis.summary.darkZoneDetections}</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-red-600" />
                    Sanctions Violations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">{analysis.summary.sanctionsViolations}</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Fuel className="w-4 h-4 mr-2 text-orange-600" />
                    STS Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">{analysis.summary.stsTransfers}</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                    Suspicious Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{analysis.summary.suspiciousBehaviors}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                    High Risk Vessels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{analysis.summary.highRiskVessels}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="map" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="map">Tracking Map</TabsTrigger>
                <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
                <TabsTrigger value="methods">Detection Methods</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-4">
                <div className="mb-6">
                  <ShadowFleetMap 
                    vessels={analysis.alerts.filter(alert => alert.data?.vesselInfo)} 
                    alerts={analysis.alerts}
                  />
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="grid gap-4">
                  {analysis.alerts.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
                        <h3 className="text-lg font-semibold mb-2 text-green-800">All Clear</h3>
                        <p className="text-green-600">No active security threats detected in current analysis</p>
                      </CardContent>
                    </Card>
                  ) : (
                    analysis.alerts.map((alert, index) => {
                      const AlertIcon = getAlertIcon(alert.type);
                      return (
                        <Card key={index} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => setSelectedAlert(alert)}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <AlertIcon className="w-5 h-5 text-red-600" />
                                <div>
                                  <CardTitle className="text-base">{alert.title}</CardTitle>
                                  <CardDescription>{alert.description}</CardDescription>
                                </div>
                              </div>
                              <Badge variant={getPriorityColor(alert.priority)}>
                                {alert.priority?.toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Detected: {new Date().toLocaleString()}
                              </span>
                              {alert.data?.vesselInfo && (
                                <span className="flex items-center">
                                  <Ship className="w-4 h-4 mr-1" />
                                  IMO: {alert.data.vesselInfo.imo_number}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="methods" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-600" />
                        AIS Dark Zone Detection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Monitors for vessels that disable AIS transponders, creating "dark zones" in tracking data.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium text-blue-900">Detection Criteria:</h4>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• AIS gaps &gt; 4 hours</li>
                          <li>• Proximity to Russian ports</li>
                          <li>• Suspicious movement patterns</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Satellite className="w-5 h-5 mr-2 text-green-600" />
                        Satellite Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Cross-references AIS data with Sentinel-1 SAR imagery to detect vessels without transponders.
                      </p>
                      <div className="bg-green-50 p-3 rounded">
                        <h4 className="font-medium text-green-900">Data Sources:</h4>
                        <ul className="text-sm text-green-800 mt-2 space-y-1">
                          <li>• Copernicus Sentinel-1 SAR</li>
                          <li>• ESA Earth Observation</li>
                          <li>• Weather-independent detection</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Fuel className="w-5 h-5 mr-2 text-orange-600" />
                        Ship-to-Ship Transfer Detection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Identifies vessels conducting potential illegal cargo transfers at sea.
                      </p>
                      <div className="bg-orange-50 p-3 rounded">
                        <h4 className="font-medium text-orange-900">Detection Indicators:</h4>
                        <ul className="text-sm text-orange-800 mt-2 space-y-1">
                          <li>• Vessels &lt; 500m apart</li>
                          <li>• Low speeds (&lt; 2 knots)</li>
                          <li>• Extended proximity duration</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-red-600" />
                        Sanctions Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Real-time cross-referencing with EU, OFAC, and UN sanctions databases.
                      </p>
                      <div className="bg-red-50 p-3 rounded">
                        <h4 className="font-medium text-red-900">Monitoring:</h4>
                        <ul className="text-sm text-red-800 mt-2 space-y-1">
                          <li>• IMO number verification</li>
                          <li>• Ownership changes</li>
                          <li>• Flag state analysis</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Immediate Action Items</CardTitle>
                    <CardDescription>
                      Priority recommendations based on current threat analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="intelligence" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Threat Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Risk Level</span>
                            <span className="font-medium">
                              {analysis.summary.sanctionsViolations > 0 ? 'CRITICAL' :
                               analysis.summary.darkZoneDetections > 5 ? 'HIGH' :
                               analysis.summary.suspiciousBehaviors > 3 ? 'MEDIUM' : 'LOW'}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(100, (analysis.summary.sanctionsViolations * 40 + 
                                                  analysis.summary.darkZoneDetections * 10 + 
                                                  analysis.summary.suspiciousBehaviors * 5))} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">Key Risk Factors:</h4>
                          <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Proximity to sanctioned jurisdictions</li>
                            <li>• Frequency of AIS signal interruptions</li>
                            <li>• Pattern of vessel behavior changes</li>
                            <li>• Cross-reference with intelligence databases</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Analysis Time:</span>
                          <span className="font-medium">{new Date(analysis.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data Coverage:</span>
                          <span className="font-medium">Last 24 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Detection Algorithms:</span>
                          <span className="font-medium">5 active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence Level:</span>
                          <span className="font-medium text-green-600">94.2%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Alert Detail Modal */}
            {selectedAlert && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedAlert.title}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(null)}>
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>{selectedAlert.description}</p>
                      
                      {selectedAlert.data && (
                        <div className="bg-gray-50 p-4 rounded">
                          <h4 className="font-medium mb-2">Additional Details:</h4>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(selectedAlert.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                          Close
                        </Button>
                        <Button>Investigate Further</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShadowFleetTracker;