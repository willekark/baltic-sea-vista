import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
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
  Ship
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

const RouteOptimizer = () => {
  const [optimization, setOptimization] = useState<RouteOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');

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
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              <Compass className="w-4 h-4 mr-2" />
              Optimize Route
            </Button>
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
    </div>
  );
};

export default RouteOptimizer;