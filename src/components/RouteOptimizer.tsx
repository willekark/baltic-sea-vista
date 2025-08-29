import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Navigation,
  TrendingUp,
  Fuel,
  DollarSign,
  MapPin,
  Clock,
  RefreshCw,
  Target,
  Anchor,
  Compass,
  BarChart3,
  Ship,
  Download,
  AlertTriangle,
  TrendingDown,
  Calculator,
  Award,
  Activity
} from 'lucide-react';

interface RouteOptimization {
  timestamp: string;
  marketConditions: any;
  ballastOptimization: any;
  routeRecommendations: string[];
  profitOptimization: string[];
  fuelEfficiency: string[];
  weatherConsiderations: string[];
  portOptimization: string[];
  summary: string;
}

interface ComprehensiveReportData {
  operationalData: {
    vesselBreakdown: Array<{
      imo: string;
      vesselClass: string;
      fuelType: string;
      historicalRoute: { distance: number; time: number; speed: number };
      optimizedRoute: { distance: number; time: number; speed: number };
      fuelConsumption: { historical: number; optimized: number; savings: number };
    }>;
    portCongestion: Array<{ port: string; dwellTime: number; congestionLevel: string }>;
    weatherImpact: { iceConditions: string; seasonalVariations: string[] };
  };
  fuelEmissionsEconomics: {
    fuelTypes: Array<{ type: string; price: number; usage: number }>;
    estimatedSavings: { tonnes: number; cost: number };
    emissions: { co2Reduction: number; noxReduction: number; soxReduction: number };
    euEtsCosts: { current: number; projected: number; savings: number };
  };
  marketCommercialContext: {
    freightRates: Array<{ route: string; rate: number; cargoType: string }>;
    cargoSensitivity: { timeCritical: number; bulkFlexible: number };
    industryBenchmarks: { averageSavings: number; peerComparison: number };
  };
  strategicRisk: {
    riskAlerts: Array<{ type: string; severity: string; description: string }>;
    sensitivityAnalysis: Array<{ scenario: string; impact: number }>;
    scenarioModeling: { slowSteaming: number; justInTime: number };
  };
  financialImpact: {
    costBenefit: Array<{ vessel: string; route: string; savings: number; roi: number }>;
    roiCalculation: { investment: number; paybackMonths: number; ebitdaImpact: number };
    operatingMargin: { current: number; projected: number; improvement: number };
  };
  actionableRecommendations: {
    departureWindows: Array<{ port: string; window: string; savings: string }>;
    portSlots: Array<{ port: string; priority: string; recommendation: string }>;
    speedOptimization: { slowSteaming: string; dynamicProfiles: string };
    seasonalRouting: { summer: string; winter: string; recommendations: string[] };
  };
  benchmarkingKpis: {
    vesselEfficiency: { current: number; fleetAverage: number; industryBenchmark: number };
    kpis: {
      fuelPerNauticalMile: number;
      emissionsPerTonneMile: number;
      routeEfficiency: number;
      onTimePerformance: number;
    };
  };
}

const RouteOptimizer = () => {
  const [optimization, setOptimization] = useState<RouteOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [reportData, setReportData] = useState<ComprehensiveReportData | null>(null);

  const fetchOptimization = async (customRequest = {}) => {
    try {
      setLoading(true);
      console.log('RouteOptimizer - Starting optimization fetch...');
      
      const requestData = {
        origin,
        destination,
        cargoType,
        ...customRequest
      };

      console.log('RouteOptimizer - Request data:', requestData);

      const { data, error } = await supabase.functions.invoke('shipping-route-optimizer', {
        body: requestData
      });
      
      console.log('RouteOptimizer - Response:', { data, error });
      
      if (error) {
        console.error('RouteOptimizer - Supabase function error:', error);
        throw error;
      }
      
      console.log('RouteOptimizer - Setting optimization data:', data);
      setOptimization(data);
    } catch (err) {
      console.error('RouteOptimizer - Error fetching route optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('RouteOptimizer - Component mounted, fetching initial optimization...');
    // Load general optimization on component mount
    fetchOptimization();
  }, []);

  const handleCustomOptimization = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOptimization();
  };

  const generateComprehensiveReportData = (): ComprehensiveReportData => {
    // Generate comprehensive data structure for export
    return {
      operationalData: {
        vesselBreakdown: [
          {
            imo: "9234567",
            vesselClass: "Container",
            fuelType: "VLSFO",
            historicalRoute: { distance: 1245, time: 48, speed: 12.5 },
            optimizedRoute: { distance: 1180, time: 45, speed: 13.2 },
            fuelConsumption: { historical: 145, optimized: 128, savings: 17 }
          },
          {
            imo: "9345678",
            vesselClass: "Bulk Carrier",
            fuelType: "MGO",
            historicalRoute: { distance: 890, time: 36, speed: 11.8 },
            optimizedRoute: { distance: 845, time: 33, speed: 12.4 },
            fuelConsumption: { historical: 98, optimized: 85, savings: 13 }
          }
        ],
        portCongestion: [
          { port: "Hamburg", dwellTime: 18.5, congestionLevel: "Medium" },
          { port: "Gdansk", dwellTime: 24.2, congestionLevel: "High" },
          { port: "Stockholm", dwellTime: 12.1, congestionLevel: "Low" }
        ],
        weatherImpact: {
          iceConditions: "Light ice conditions expected in northern Baltic",
          seasonalVariations: ["Winter: +15% transit time", "Summer: -8% fuel consumption", "Spring: Optimal routing window"]
        }
      },
      fuelEmissionsEconomics: {
        fuelTypes: [
          { type: "VLSFO", price: 580, usage: 45 },
          { type: "MGO", price: 720, usage: 25 },
          { type: "LNG", price: 420, usage: 15 },
          { type: "Biofuels", price: 890, usage: 15 }
        ],
        estimatedSavings: { tonnes: 89, cost: 52400 },
        emissions: { co2Reduction: 245, noxReduction: 12, soxReduction: 8 },
        euEtsCosts: { current: 15800, projected: 12200, savings: 3600 }
      },
      marketCommercialContext: {
        freightRates: [
          { route: "Hamburg-Stockholm", rate: 185, cargoType: "Container" },
          { route: "Gdansk-Helsinki", rate: 142, cargoType: "Bulk" },
          { route: "Copenhagen-Riga", rate: 198, cargoType: "RoRo" }
        ],
        cargoSensitivity: { timeCritical: 75, bulkFlexible: 25 },
        industryBenchmarks: { averageSavings: 12.5, peerComparison: 18.3 }
      },
      strategicRisk: {
        riskAlerts: [
          { type: "Port Congestion", severity: "Medium", description: "Hamburg experiencing 15% above normal delays" },
          { type: "Weather", severity: "Low", description: "Favorable conditions for next 72 hours" },
          { type: "Sanctions", severity: "High", description: "Monitor vessels flagged to high-risk jurisdictions" }
        ],
        sensitivityAnalysis: [
          { scenario: "Fuel price +20%", impact: -8.5 },
          { scenario: "Port delays +50%", impact: -12.3 },
          { scenario: "Carbon tax +€30", impact: -5.8 }
        ],
        scenarioModeling: { slowSteaming: 15.2, justInTime: 8.7 }
      },
      financialImpact: {
        costBenefit: [
          { vessel: "MV Baltic Star", route: "Hamburg-Stockholm", savings: 28500, roi: 245 },
          { vessel: "MV Nordic Wind", route: "Gdansk-Helsinki", savings: 18200, roi: 189 }
        ],
        roiCalculation: { investment: 125000, paybackMonths: 8, ebitdaImpact: 3.2 },
        operatingMargin: { current: 12.8, projected: 15.4, improvement: 2.6 }
      },
      actionableRecommendations: {
        departureWindows: [
          { port: "Helsinki", window: "Depart 12-18h later", savings: "5% fuel reduction" },
          { port: "Hamburg", window: "Early morning departure", savings: "Avoid peak congestion" }
        ],
        portSlots: [
          { port: "Gdansk", priority: "High", recommendation: "Book priority slots during peak season" },
          { port: "Stockholm", priority: "Medium", recommendation: "Flexible timing available" }
        ],
        speedOptimization: {
          slowSteaming: "Reduce speed by 2 knots for 15% fuel savings",
          dynamicProfiles: "Variable speed based on weather and port availability"
        },
        seasonalRouting: {
          summer: "Northern corridor via Åland Islands",
          winter: "Southern route avoiding ice zones",
          recommendations: ["Monitor ice reports daily", "Adjust routing 48h in advance", "Consider icebreaker escort for time-critical cargo"]
        }
      },
      benchmarkingKpis: {
        vesselEfficiency: { current: 87, fleetAverage: 82, industryBenchmark: 79 },
        kpis: {
          fuelPerNauticalMile: 2.45,
          emissionsPerTonneMile: 0.032,
          routeEfficiency: 94.2,
          onTimePerformance: 91.5
        }
      }
    };
  };

  const exportComprehensiveReport = async () => {
    setExporting(true);
    try {
      const comprehensive = generateComprehensiveReportData();
      setReportData(comprehensive);
      
      // Wait for the report to render
      setTimeout(async () => {
        const reportElement = document.getElementById('comprehensive-report');
        if (reportElement) {
          const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#0a0f1c'
          });
          
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          const filename = `route-optimization-report-${new Date().toISOString().split('T')[0]}.pdf`;
          pdf.save(filename);
        }
        setExporting(false);
        setReportData(null);
      }, 1000);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      setExporting(false);
      setReportData(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
          <CardContent className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing shipping routes and market conditions...</p>
            <Progress value={65} className="mt-4 max-w-md mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!optimization) {
    return (
      <Card className="bg-gradient-dark-panel shadow-panel border-destructive/20">
        <CardContent className="text-center py-8">
          <Target className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">Failed to load route optimization data</p>
          <Button onClick={() => fetchOptimization()} variant="outline" className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Input Form */}
      <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Navigation className="w-5 h-5 mr-2" />
            Custom Route Optimization
          </CardTitle>
          <CardDescription>
            Enter specific route details for personalized optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCustomOptimization} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Origin Port</label>
                <Input
                  placeholder="e.g., Hamburg"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="bg-background/50 border-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Destination Port</label>
                <Input
                  placeholder="e.g., Stockholm"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-background/50 border-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cargo Type</label>
                <Input
                  placeholder="e.g., Container"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="bg-background/50 border-primary/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                <Compass className="w-4 h-4 mr-2" />
                Optimize Route
              </Button>
              <Button 
                type="button" 
                onClick={exportComprehensiveReport}
                disabled={exporting || !optimization}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Report'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-dark-panel shadow-panel border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-accent">
              <BarChart3 className="w-4 h-4 mr-2" />
              Active Flows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{optimization.marketConditions.totalFlows}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-primary">
              <DollarSign className="w-4 h-4 mr-2" />
              Avg Rate/Ton
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              €{optimization.marketConditions.avgRatePerTon.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-dark-panel shadow-panel border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-warning">
              <Anchor className="w-4 h-4 mr-2" />
              Backhaul Ops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {optimization.ballastOptimization.availableBackhauls}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-dark-panel shadow-panel border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-success">
              <Fuel className="w-4 h-4 mr-2" />
              Fuel Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              €{optimization.ballastOptimization.ballastReduction.fuelSavings.toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="routes">Route Optimization</TabsTrigger>
          <TabsTrigger value="profit">Profit Maximization</TabsTrigger>
          <TabsTrigger value="ballast">Ballast Management</TabsTrigger>
          <TabsTrigger value="efficiency">Fuel Efficiency</TabsTrigger>
          <TabsTrigger value="ports">Port Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Navigation className="w-5 h-5 mr-2" />
                AI-Powered Route Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.routeRecommendations.length > 0 ? (
                optimization.routeRecommendations.map((recommendation, index) => (
                  <div key={index} className="bg-gradient-subtle p-4 rounded border border-primary/20">
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No specific route recommendations available</p>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-medium text-primary mb-3">Hot Routes (High Profit Potential)</h4>
                <div className="space-y-2">
                  {optimization.marketConditions.hotRoutes.map((route: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded">
                      <div>
                        <span className="font-medium">{route.route}</span>
                        <p className="text-sm text-muted-foreground">
                          {route.totalVolume.toLocaleString()} tons • €{route.avgRate.toFixed(0)}/ton
                        </p>
                      </div>
                      <Badge variant="outline" className="border-primary text-primary">
                        Score: {route.profitScore.toFixed(0)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card className="bg-gradient-dark-panel shadow-panel border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center text-success">
                <TrendingUp className="w-5 h-5 mr-2" />
                Profit Maximization Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.profitOptimization.length > 0 ? (
                optimization.profitOptimization.map((strategy, index) => (
                  <div key={index} className="bg-gradient-subtle p-4 rounded border border-success/20">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-success mt-0.5" />
                      <p className="text-sm">{strategy}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading profit optimization strategies...</p>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-medium text-success mb-3">Most Profitable Cargo Types</h4>
                <div className="space-y-2">
                  {optimization.marketConditions.profitableCargoTypes.map((cargo: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded">
                      <div>
                        <span className="font-medium">{cargo.type}</span>
                        <p className="text-sm text-muted-foreground">
                          {cargo.totalVolume.toLocaleString()} tons total
                        </p>
                      </div>
                      <Badge variant="outline" className="border-success text-success">
                        €{cargo.avgRate.toFixed(0)}/ton
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ballast" className="space-y-4">
          <Card className="bg-gradient-dark-panel shadow-panel border-warning/20">
            <CardHeader>
              <CardTitle className="flex items-center text-warning">
                <Anchor className="w-5 h-5 mr-2" />
                Ballast & Backhaul Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-warning">Reduction Potential</h4>
                  <div className="bg-gradient-subtle p-4 rounded border border-warning/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Ballast Reduction</span>
                      <span className="font-bold text-warning">
                        {optimization.ballastOptimization.ballastReduction.potential}%
                      </span>
                    </div>
                    <Progress 
                      value={optimization.ballastOptimization.ballastReduction.potential} 
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Potential fuel savings: €{optimization.ballastOptimization.ballastReduction.fuelSavings.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-warning">Optimization Strategies</h4>
                  <div className="space-y-2">
                    {optimization.ballastOptimization.ballastReduction.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="bg-gradient-subtle p-3 rounded text-sm border border-warning/20">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-warning mb-3">Top Backhaul Opportunities</h4>
                <div className="space-y-3">
                  {optimization.ballastOptimization.topOpportunities.map((opp: any, index: number) => (
                    <div key={index} className="bg-background/30 p-4 rounded border border-warning/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{opp.route}</span>
                        <Badge variant="outline" className="border-warning text-warning">
                          Score: {opp.score}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="block font-medium">Cargo</span>
                          {opp.cargoType}
                        </div>
                        <div>
                          <span className="block font-medium">Volume</span>
                          {opp.volume?.toLocaleString()} tons
                        </div>
                        <div>
                          <span className="block font-medium">Rate</span>
                          €{opp.rate}/ton
                        </div>
                        <div>
                          <span className="block font-medium">Value</span>
                          €{opp.value?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Fuel className="w-5 h-5 mr-2" />
                Fuel Efficiency Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.fuelEfficiency.length > 0 ? (
                optimization.fuelEfficiency.map((tip, index) => (
                  <div key={index} className="bg-gradient-subtle p-4 rounded border border-primary/20">
                    <div className="flex items-start space-x-3">
                      <Fuel className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Fuel className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading fuel efficiency recommendations...</p>
                </div>
              )}

              {optimization.weatherConsiderations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-primary mb-3">Weather & Seasonal Considerations</h4>
                  <div className="space-y-2">
                    {optimization.weatherConsiderations.map((weather, index) => (
                      <div key={index} className="bg-background/30 p-3 rounded text-sm">
                        {weather}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ports" className="space-y-4">
          <Card className="bg-gradient-dark-panel shadow-panel border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <MapPin className="w-5 h-5 mr-2" />
                Port Optimization Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.portOptimization.length > 0 ? (
                optimization.portOptimization.map((strategy, index) => (
                  <div key={index} className="bg-gradient-subtle p-4 rounded border border-accent/20">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-accent mt-0.5" />
                      <p className="text-sm">{strategy}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading port optimization strategies...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Ship className="w-5 h-5 mr-2" />
            Optimization Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{optimization.summary}</p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Last updated: {new Date(optimization.timestamp).toLocaleString()}
            </div>
            <Button onClick={() => fetchOptimization()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Comprehensive Report for Export */}
      {reportData && (
        <div id="comprehensive-report" className="fixed -top-[10000px] w-[210mm] bg-background p-8 space-y-6 text-sm">
          <div className="text-center border-b border-primary/20 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Route Optimization Report</h1>
            <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">€{reportData.fuelEmissionsEconomics.estimatedSavings.cost.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{reportData.fuelEmissionsEconomics.estimatedSavings.tonnes}</div>
                <div className="text-xs text-muted-foreground">Tonnes Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{reportData.benchmarkingKpis.kpis.routeEfficiency}%</div>
                <div className="text-xs text-muted-foreground">Route Efficiency</div>
              </div>
            </div>
          </div>

          {/* 1. Operational & Route Data */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">1. Operational & Route Data</h2>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-accent">Vessel-Specific Breakdown</h3>
              <div className="grid grid-cols-1 gap-3">
                {reportData.operationalData.vesselBreakdown.map((vessel, i) => (
                  <div key={i} className="bg-background/50 p-3 rounded border border-primary/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">IMO: {vessel.imo} ({vessel.vesselClass})</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{vessel.fuelType}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Historical:</span> {vessel.historicalRoute.distance}nm, {vessel.historicalRoute.time}h
                      </div>
                      <div>
                        <span className="text-muted-foreground">Optimized:</span> {vessel.optimizedRoute.distance}nm, {vessel.optimizedRoute.time}h
                      </div>
                      <div>
                        <span className="text-success">Fuel Savings:</span> {vessel.fuelConsumption.savings}t
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-accent">Port Congestion Analysis</h3>
              <div className="grid grid-cols-3 gap-2">
                {reportData.operationalData.portCongestion.map((port, i) => (
                  <div key={i} className="bg-background/50 p-2 rounded text-xs">
                    <div className="font-medium">{port.port}</div>
                    <div className="text-muted-foreground">Dwell: {port.dwellTime}h</div>
                    <div className={`text-xs ${port.congestionLevel === 'High' ? 'text-destructive' : port.congestionLevel === 'Medium' ? 'text-warning' : 'text-success'}`}>
                      {port.congestionLevel}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-accent">Weather & Ice Impact</h3>
              <div className="bg-background/50 p-3 rounded">
                <p className="text-xs mb-2">{reportData.operationalData.weatherImpact.iceConditions}</p>
                <ul className="text-xs space-y-1">
                  {reportData.operationalData.weatherImpact.seasonalVariations.map((variation, i) => (
                    <li key={i} className="text-muted-foreground">• {variation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Fuel & Emissions Economics */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">2. Fuel & Emissions Economics</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-accent mb-2">Fuel Type Breakdown</h3>
                <div className="space-y-2">
                  {reportData.fuelEmissionsEconomics.fuelTypes.map((fuel, i) => (
                    <div key={i} className="bg-background/50 p-2 rounded text-xs">
                      <div className="flex justify-between">
                        <span>{fuel.type}</span>
                        <span className="text-success">€{fuel.price}/t</span>
                      </div>
                      <div className="text-muted-foreground">Usage: {fuel.usage}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-2">Emission Reductions</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>CO₂ Reduction:</span>
                      <span className="text-success">{reportData.fuelEmissionsEconomics.emissions.co2Reduction}t</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>NOx Reduction:</span>
                      <span className="text-success">{reportData.fuelEmissionsEconomics.emissions.noxReduction}t</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>EU ETS Savings:</span>
                      <span className="text-success">€{reportData.fuelEmissionsEconomics.euEtsCosts.savings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Market & Commercial Context */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">3. Market & Commercial Context</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-accent mb-2">Freight Rates Analysis</h3>
                <div className="space-y-2">
                  {reportData.marketCommercialContext.freightRates.map((rate, i) => (
                    <div key={i} className="bg-background/50 p-2 rounded text-xs">
                      <div className="font-medium">{rate.route}</div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{rate.cargoType}</span>
                        <span className="text-success">€{rate.rate}/t</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-2">Industry Benchmarks</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Industry Average Savings:</span>
                      <span>{reportData.marketCommercialContext.industryBenchmarks.averageSavings}%</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Our Performance:</span>
                      <span className="text-success">{reportData.marketCommercialContext.industryBenchmarks.peerComparison}%</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Time-Critical Cargo:</span>
                      <span>{reportData.marketCommercialContext.cargoSensitivity.timeCritical}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Strategic Risk & Scenario Insights */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">4. Strategic Risk & Scenario Analysis</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-accent mb-2">Risk Alerts</h3>
                <div className="space-y-2">
                  {reportData.strategicRisk.riskAlerts.map((alert, i) => (
                    <div key={i} className="bg-background/50 p-2 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{alert.type}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.severity === 'High' ? 'bg-destructive/20 text-destructive' :
                          alert.severity === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-2">Sensitivity Analysis</h3>
                <div className="space-y-2">
                  {reportData.strategicRisk.sensitivityAnalysis.map((scenario, i) => (
                    <div key={i} className="bg-background/50 p-2 rounded text-xs">
                      <div className="flex justify-between">
                        <span>{scenario.scenario}</span>
                        <span className="text-destructive">{scenario.impact}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 5. Financial Impact & ROI */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">5. Financial Impact & ROI</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-accent mb-2">Cost-Benefit Analysis</h3>
                <div className="space-y-2">
                  {reportData.financialImpact.costBenefit.map((item, i) => (
                    <div key={i} className="bg-background/50 p-2 rounded text-xs">
                      <div className="font-medium">{item.vessel}</div>
                      <div className="text-muted-foreground">{item.route}</div>
                      <div className="flex justify-between">
                        <span>Savings:</span>
                        <span className="text-success">€{item.savings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className="text-success">{item.roi}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-2">Overall ROI Calculation</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Investment Required:</span>
                      <span>€{reportData.financialImpact.roiCalculation.investment.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Payback Period:</span>
                      <span className="text-success">{reportData.financialImpact.roiCalculation.paybackMonths} months</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>EBITDA Impact:</span>
                      <span className="text-success">+{reportData.financialImpact.roiCalculation.ebitdaImpact}%</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Operating Margin Improvement:</span>
                      <span className="text-success">+{reportData.financialImpact.operatingMargin.improvement}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Actionable Recommendations */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">6. Actionable Recommendations</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-accent mb-2">Departure Windows</h3>
                  <div className="space-y-2">
                    {reportData.actionableRecommendations.departureWindows.map((window, i) => (
                      <div key={i} className="bg-background/50 p-2 rounded text-xs">
                        <div className="font-medium">{window.port}</div>
                        <div className="text-muted-foreground">{window.window}</div>
                        <div className="text-success">{window.savings}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-accent mb-2">Port Slot Strategy</h3>
                  <div className="space-y-2">
                    {reportData.actionableRecommendations.portSlots.map((slot, i) => (
                      <div key={i} className="bg-background/50 p-2 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{slot.port}</span>
                          <span className={`px-1 rounded text-xs ${
                            slot.priority === 'High' ? 'bg-destructive/20 text-destructive' : 
                            slot.priority === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                          }`}>
                            {slot.priority}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{slot.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-accent mb-2">Speed Optimization</h3>
                  <div className="bg-background/50 p-2 rounded text-xs space-y-1">
                    <p><strong>Slow Steaming:</strong> {reportData.actionableRecommendations.speedOptimization.slowSteaming}</p>
                    <p><strong>Dynamic Profiles:</strong> {reportData.actionableRecommendations.speedOptimization.dynamicProfiles}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-accent mb-2">Seasonal Routing</h3>
                  <div className="bg-background/50 p-2 rounded text-xs space-y-2">
                    <div><strong>Summer:</strong> {reportData.actionableRecommendations.seasonalRouting.summer}</div>
                    <div><strong>Winter:</strong> {reportData.actionableRecommendations.seasonalRouting.winter}</div>
                    <div>
                      <strong>Key Recommendations:</strong>
                      <ul className="mt-1 space-y-1">
                        {reportData.actionableRecommendations.seasonalRouting.recommendations.map((rec, i) => (
                          <li key={i} className="text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Benchmarking & KPIs */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">7. Benchmarking & KPIs</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-accent mb-2">Vessel Efficiency Comparison</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Current Performance:</span>
                      <span className="text-success">{reportData.benchmarkingKpis.vesselEfficiency.current}%</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Fleet Average:</span>
                      <span>{reportData.benchmarkingKpis.vesselEfficiency.fleetAverage}%</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Industry Benchmark:</span>
                      <span>{reportData.benchmarkingKpis.vesselEfficiency.industryBenchmark}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-2">Key Performance Indicators</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Fuel per Nautical Mile:</span>
                      <span>{reportData.benchmarkingKpis.kpis.fuelPerNauticalMile} t/nm</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Emissions per Tonne-Mile:</span>
                      <span>{reportData.benchmarkingKpis.kpis.emissionsPerTonneMile} t CO₂/t·nm</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Route Efficiency:</span>
                      <span className="text-success">{reportData.benchmarkingKpis.kpis.routeEfficiency}%</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>On-Time Performance:</span>
                      <span className="text-success">{reportData.benchmarkingKpis.kpis.onTimePerformance}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="text-center text-xs text-muted-foreground border-t border-primary/20 pt-4 mt-8">
            <p>This report was generated using advanced AI analytics and real-time Baltic Sea shipping data.</p>
            <p>For questions or detailed analysis, contact your optimization team.</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer;