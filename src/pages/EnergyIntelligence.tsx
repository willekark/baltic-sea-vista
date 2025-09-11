import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Wind, 
  Plug, 
  Fuel, 
  Building, 
  Activity,
  Download,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import EnergyPriceCard from '@/components/energy/EnergyPriceCard';
import FlowMapLayer from '@/components/energy/FlowMapLayer';
import OPSCoverageBar from '@/components/energy/OPSCoverageBar';
import OffshoreWindTimeline from '@/components/energy/OffshoreWindTimeline';

const EnergyIntelligence = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Energy Intelligence Hub
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Grid prices, renewable output, OPS adoption, and green fuel infrastructure analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">€72.1</div>
                  <div className="text-sm text-muted-foreground">Average Price/MWh</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Wind className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">4,287 MW</div>
                  <div className="text-sm text-muted-foreground">Offshore Wind</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Plug className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-sm text-muted-foreground">OPS Coverage</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Fuel className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Green Fuel Ports</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Grid Prices
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Energy Flows
            </TabsTrigger>
            <TabsTrigger value="wind" className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Offshore Wind
            </TabsTrigger>
            <TabsTrigger value="ops" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              OPS Coverage
            </TabsTrigger>
            <TabsTrigger value="bunkering" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Green Bunkering
            </TabsTrigger>
            <TabsTrigger value="municipal" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Municipal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergyPriceCard />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Price Forecast
                  </CardTitle>
                  <CardDescription>24-hour price predictions by zone</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['SE1', 'SE3', 'DK1', 'FI'].map((zone) => (
                      <div key={zone} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{zone}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Peak: €78.2</Badge>
                          <Badge variant="secondary">Avg: €65.5</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="flows" className="space-y-6">
            <FlowMapLayer />
          </TabsContent>

          <TabsContent value="wind" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OffshoreWindTimeline />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-blue-600" />
                    Wind Generation Forecast
                  </CardTitle>
                  <CardDescription>Next 48 hours wind power output</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">2,847 MW</div>
                      <div className="text-sm text-muted-foreground">Current Generation</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="font-bold text-green-600">89%</div>
                        <div className="text-muted-foreground">Capacity Factor</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="font-bold text-blue-600">15.2 m/s</div>
                        <div className="text-muted-foreground">Avg Wind Speed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ops" className="space-y-6">
            <OPSCoverageBar />
          </TabsContent>

          <TabsContent value="bunkering" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-orange-600" />
                  Green Fuel Infrastructure
                </CardTitle>
                <CardDescription>LNG, methanol, and hydrogen bunkering facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">18</div>
                    <div className="text-sm text-blue-600">LNG Terminals</div>
                    <div className="text-xs text-muted-foreground mt-1">2.4M m³ capacity</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">7</div>
                    <div className="text-sm text-green-600">Methanol Facilities</div>
                    <div className="text-xs text-muted-foreground mt-1">450k tons/year</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">3</div>
                    <div className="text-sm text-purple-600">Hydrogen Hubs</div>
                    <div className="text-xs text-muted-foreground mt-1">150 tons/day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="municipal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  Municipal Energy Demand
                </CardTitle>
                <CardDescription>District heating, industrial, and household consumption patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">District Heating Share</h4>
                    {[
                      { city: 'Helsinki', share: 92 },
                      { city: 'Stockholm', share: 88 },
                      { city: 'Copenhagen', share: 85 },
                      { city: 'Riga', share: 78 }
                    ].map((city, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{city.city}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${city.share}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{city.share}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Consumption Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Industrial</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Residential</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Commercial</span>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnergyIntelligence;