import React, { useState } from 'react';
import { Ship, TrendingUp, AlertTriangle, DollarSign, Leaf, Navigation, Fuel, Shield, Globe, BarChart3, Zap, Anchor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ShippingInsights = () => {
  const [selectedRoute, setSelectedRoute] = useState('stockholm-gotland');
  const navigate = useNavigate();

  // Mock data that would come from integrated data sources
  const operationsData = {
    activeVessels: 2876,
    avgTurnaroundTime: '18.5 hours',
    fuelEfficiency: '12.3 kg/nm',
    portCongestion: 'Moderate',
    charterRates: '+8.2%'
  };

  const environmentData = {
    seaState: 'Calm (1.2m waves)',
    iceConditions: 'Ice-free',
    emissions: '2.1 tons CO₂/day',
    weatherRisk: 'Low',
    oxygenLevels: 'Variable (4.2-9.1 mg/L)'
  };

  const regulatoryData = {
    secaCompliance: '98.5%',
    euEtsCost: '€2,847/vessel/month',
    ballastCompliance: 'Required at 8 stations',
    geopoliticalRisk: 'Stable'
  };

  const marketData = {
    containerFlow: '+12.5%',
    energyTransport: 'High demand',
    commodityPrices: 'Volatile (+15% oil)',
    portInfrastructure: 'Good',
    competitorActivity: 'Intensifying'
  };

  const sustainabilityData = {
    greenCorridors: '3 active routes',
    lngAdoption: '23% of fleet',
    hydrogенPilots: '2 projects',
    esgScore: '72/100'
  };

  const routeRecommendations = {
    'stockholm-gotland': {
      name: 'Stockholm-Gotland Corridor',
      status: 'Optimal',
      fuelSavings: '15%',
      emissions: 'Low',
      congestion: 'Light',
      oxygen: '8.1 mg/L',
      profitability: 'High',
      risk: 'Low'
    },
    'kattegat': {
      name: 'Kattegat Route',
      status: 'Recommended',
      fuelSavings: '20%',
      emissions: 'Very Low',
      congestion: 'Moderate', 
      oxygen: '9.1 mg/L',
      profitability: 'High',
      risk: 'Low'
    },
    'gdansk-bay': {
      name: 'Gdansk Bay Area',
      status: 'Restricted',
      fuelSavings: '-5%',
      emissions: 'High Risk',
      congestion: 'Heavy',
      oxygen: '4.2 mg/L',
      profitability: 'Low',
      risk: 'High'
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-6 h-6 text-primary" />
            Integrated Maritime Intelligence Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive insights across operations, environment, regulations, markets, and sustainability for Baltic Sea shipping optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="backhaul">Backhaul</TabsTrigger>
              <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-muted-foreground">OPERATIONS</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{operationsData.activeVessels}</div>
                    <div className="text-xs text-muted-foreground">Active Vessels</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-muted-foreground">ENVIRONMENT</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">Low</div>
                    <div className="text-xs text-muted-foreground">Weather Risk</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-muted-foreground">REGULATORY</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">98.5%</div>
                    <div className="text-xs text-muted-foreground">SECA Compliance</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-muted-foreground">MARKET</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">+12.5%</div>
                    <div className="text-xs text-muted-foreground">Cargo Growth</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-muted-foreground">SUSTAINABILITY</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">72/100</div>
                    <div className="text-xs text-muted-foreground">ESG Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Route Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Smart Route Optimization</CardTitle>
                  <CardDescription>Real-time route recommendations based on integrated data analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {Object.entries(routeRecommendations).map(([key, route]) => (
                      <Card 
                        key={key} 
                        className={`cursor-pointer border-2 transition-all ${
                          selectedRoute === key ? 'border-primary' : 'border-muted'
                        } ${route.status === 'Restricted' ? 'bg-red-50' : route.status === 'Optimal' ? 'bg-green-50' : 'bg-blue-50'}`}
                        onClick={() => setSelectedRoute(key)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{route.name}</span>
                            <Badge variant={route.status === 'Optimal' ? 'default' : route.status === 'Recommended' ? 'secondary' : 'destructive'}>
                              {route.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Fuel Savings:</span>
                              <span className={route.fuelSavings.includes('-') ? 'text-red-600' : 'text-green-600'}>
                                {route.fuelSavings}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Oxygen Levels:</span>
                              <span className="font-medium">{route.oxygen}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Congestion:</span>
                              <span>{route.congestion}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Risk Level:</span>
                              <Badge variant={route.risk === 'Low' ? 'outline' : 'destructive'} className="text-xs">
                                {route.risk}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profitability Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Profit Optimization Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <div className="font-medium text-green-800">Fuel Efficiency Gains</div>
                          <div className="text-sm text-green-600">Optimal routing & weather patterns</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">+20%</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <div className="font-medium text-blue-800">Port Turnaround</div>
                          <div className="text-sm text-blue-600">Schedule optimization</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">-30%</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <div className="font-medium text-purple-800">Charter Premium</div>
                          <div className="text-sm text-purple-600">Green route certification</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">+15%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Mitigation Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Environmental Compliance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={98} className="w-20" />
                          <Badge variant="default" className="text-xs">98%</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weather Risk Exposure</span>
                        <div className="flex items-center gap-2">
                          <Progress value={15} className="w-20" />
                          <Badge variant="outline" className="text-xs">Low</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Regulatory Compliance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={92} className="w-20" />
                          <Badge variant="secondary" className="text-xs">Good</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Market Volatility Buffer</span>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="w-20" />
                          <Badge variant="outline" className="text-xs">Stable</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="w-5 h-5" />
                      Fleet Operations Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{operationsData.activeVessels}</div>
                        <div className="text-sm text-muted-foreground">Active Vessels</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{operationsData.avgTurnaroundTime}</div>
                        <div className="text-sm text-muted-foreground">Avg Turnaround</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fuel Consumption</span>
                        <span className="font-medium">{operationsData.fuelEfficiency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Port Congestion</span>
                        <Badge variant="secondary">{operationsData.portCongestion}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Charter Rates</span>
                        <span className="font-medium text-green-600">{operationsData.charterRates}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      AIS Traffic Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Helsinki Bay</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium">High Density</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Stockholm Archipelago</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Optimal</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Gdansk Approach</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium">Congested</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Environmental Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sea State</span>
                        <Badge variant="outline">{environmentData.seaState}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ice Conditions</span>
                        <Badge variant="default">{environmentData.iceConditions}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Weather Risk</span>
                        <Badge variant="outline">{environmentData.weatherRisk}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Oxygen Levels</span>
                        <span className="text-sm font-medium">{environmentData.oxygenLevels}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Fuel className="w-5 h-5" />
                      Emissions Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{environmentData.emissions}</div>
                      <div className="text-sm text-muted-foreground">Current Emissions Rate</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>SECA Zone Compliance</span>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>NOx Emission Control</span>
                        <Badge variant="secondary" className="text-xs">Tier III</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Regulatory Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">SECA Compliance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={98.5} className="w-16" />
                          <span className="text-sm font-medium">{regulatoryData.secaCompliance}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">EU ETS Monthly Cost</span>
                        <span className="font-medium text-orange-600">{regulatoryData.euEtsCost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ballast Water Treatment</span>
                        <Badge variant="secondary" className="text-xs">{regulatoryData.ballastCompliance}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Geopolitical Risk</span>
                        <Badge variant="outline">{regulatoryData.geopoliticalRisk}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Policy Updates & Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-yellow-800 text-sm">EU ETS Extension</div>
                      <div className="text-xs text-yellow-600">Maritime sector inclusion starts 2024</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-800 text-sm">HELCOM Updates</div>
                      <div className="text-xs text-blue-600">New discharge restrictions in force</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 text-sm">Green Corridor Incentives</div>
                      <div className="text-xs text-green-600">Port fee reductions for clean vessels</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Market Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Container Flow Growth</span>
                        <span className="font-medium text-green-600">{marketData.containerFlow}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Energy Transport Demand</span>
                        <Badge variant="default">{marketData.energyTransport}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Commodity Price Volatility</span>
                        <span className="font-medium text-orange-600">{marketData.commodityPrices}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Port Infrastructure</span>
                        <Badge variant="outline">{marketData.portInfrastructure}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Anchor className="w-5 h-5" />
                      Competitive Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">Intensifying</div>
                      <div className="text-sm text-muted-foreground">Competitor Activity</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>New Fleet Additions</span>
                        <span className="font-medium">+8 vessels/month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Route Competition</span>
                        <Badge variant="secondary" className="text-xs">High</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rate Pressure</span>
                        <Badge variant="destructive" className="text-xs">Increasing</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="backhaul" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="w-5 h-5" />
                      Mediterranean → Baltic Cargo Opportunities
                    </CardTitle>
                    <CardDescription>
                      Eliminate ballast legs with profitable return cargo from Mediterranean ports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                        <div className="text-lg font-bold text-green-600">€1.2M</div>
                        <div className="text-xs text-muted-foreground">Total Available</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">8</div>
                        <div className="text-xs text-muted-foreground">Active Routes</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                        <div className="text-lg font-bold text-purple-600">95%</div>
                        <div className="text-xs text-muted-foreground">Utilization Gain</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">High-Priority Backhaul Opportunities</h4>
                      
                      <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-red-800">Bentonite (Drilling Grade)</div>
                            <div className="text-xs text-red-600">Livorno → Kotka • 8,000 tons</div>
                          </div>
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Rate:</span>
                            <span className="font-medium text-green-600">€67.30/ton</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lead Time:</span>
                            <span className="font-medium">5 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Value:</span>
                            <span className="font-medium">€538K</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vessel Size:</span>
                            <span className="font-medium">6-15K DWT</span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-orange-800">Fertilizer (Potash)</div>
                            <div className="text-xs text-orange-600">Tarragona → Gdansk • 30,000 tons</div>
                          </div>
                          <Badge variant="secondary" className="text-xs">High</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Rate:</span>
                            <span className="font-medium text-green-600">€45.20/ton</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lead Time:</span>
                            <span className="font-medium">7 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Value:</span>
                            <span className="font-medium">€1.36M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vessel Size:</span>
                            <span className="font-medium">20-40K DWT</span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-blue-800">Kaolin (Industrial Clay)</div>
                            <div className="text-xs text-blue-600">Naples → Tallinn • 12,000 tons</div>
                          </div>
                          <Badge variant="outline" className="text-xs">High</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Rate:</span>
                            <span className="font-medium text-green-600">€52.10/ton</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lead Time:</span>
                            <span className="font-medium">12 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Value:</span>
                            <span className="font-medium">€625K</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vessel Size:</span>
                            <span className="font-medium">8-20K DWT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Backhaul Optimization Analytics
                    </CardTitle>
                    <CardDescription>
                      Route efficiency and ballast leg elimination analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Route Match Analysis</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                          <span className="text-sm">Barcelona → Stockholm</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">Salt • 25K tons</Badge>
                            <span className="text-xs font-medium text-green-600">€463K</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                          <span className="text-sm">Marseille → Riga</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Alumina • 22K tons</Badge>
                            <span className="text-xs font-medium text-green-600">€856K</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                          <span className="text-sm">Valencia → Helsinki</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Gypsum • 18K tons</Badge>
                            <span className="text-xs font-medium text-green-600">€410K</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Seasonal Patterns & Pricing</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                          <div className="text-lg font-bold text-orange-600">+30%</div>
                          <div className="text-xs text-muted-foreground">Winter Premium</div>
                          <div className="text-xs text-orange-600">Salt & De-icing</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                          <div className="text-lg font-bold text-green-600">+15%</div>
                          <div className="text-xs text-muted-foreground">Spring Demand</div>
                          <div className="text-xs text-green-600">Construction Materials</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Vessel Type Matching</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Bulk Carriers (15-35K DWT)</span>
                          <div className="flex items-center gap-2">
                            <Progress value={85} className="w-16" />
                            <span className="text-xs">6 matches</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Small Bulk (6-15K DWT)</span>
                          <div className="flex items-center gap-2">
                            <Progress value={60} className="w-16" />
                            <span className="text-xs">2 matches</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Large Bulk (25-50K DWT)</span>
                          <div className="flex items-center gap-2">
                            <Progress value={45} className="w-16" />
                            <span className="text-xs">1 match</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-medium text-purple-800 text-sm">Optimization Potential</div>
                      <div className="text-xs text-purple-600 mt-1">
                        Eliminate 95% of ballast legs with strategic backhaul booking, 
                        saving €125K per voyage in fuel and port costs
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Cargo Flow Intelligence Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time analysis of Mediterranean-Baltic bulk cargo opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">€42.8</div>
                      <div className="text-xs text-muted-foreground">Avg Rate/Ton</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">186K</div>
                      <div className="text-xs text-muted-foreground">Tons Available</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12.8</div>
                      <div className="text-xs text-muted-foreground">Avg Lead Days</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">74%</div>
                      <div className="text-xs text-muted-foreground">Spot vs Contract</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-sm mb-3">Market Demand Heat Map</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200">
                          <span className="text-sm">Drilling Grade Materials</span>
                          <Badge variant="destructive" className="text-xs">Critical Demand</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-orange-50 border border-orange-200">
                          <span className="text-sm">Industrial Chemicals</span>
                          <Badge variant="secondary" className="text-xs">High Demand</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-yellow-50 border border-yellow-200">
                          <span className="text-sm">Construction Materials</span>
                          <Badge variant="outline" className="text-xs">Medium Demand</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-200">
                          <span className="text-sm">Agricultural Products</span>
                          <Badge variant="outline" className="text-xs">Seasonal</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3">Port Pair Performance</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Tarragona → Gdansk</span>
                          <span className="font-medium text-green-600">€1.36M</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Marseille → Riga</span>
                          <span className="font-medium text-green-600">€856K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Naples → Tallinn</span>
                          <span className="font-medium text-green-600">€625K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Livorno → Kotka</span>
                          <span className="font-medium text-green-600">€538K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Barcelona → Stockholm</span>
                          <span className="font-medium text-green-600">€463K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sustainability" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5" />
                      Sustainability Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{sustainabilityData.esgScore}</div>
                      <div className="text-sm text-muted-foreground">ESG Score</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Green Corridors Active</span>
                        <Badge variant="default">{sustainabilityData.greenCorridors}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">LNG Fleet Adoption</span>
                        <span className="font-medium">{sustainabilityData.lngAdoption}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hydrogen Pilots</span>
                        <Badge variant="outline">{sustainabilityData.hydrogенPilots}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Fuel className="w-5 h-5" />
                      Alternative Fuel Transition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">LNG Infrastructure</span>
                          <Progress value={75} className="w-20" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Methanol Availability</span>
                          <Progress value={35} className="w-20" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Hydrogen Readiness</span>
                          <Progress value={15} className="w-20" />
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800 text-sm">Green Premium Opportunity</div>
                        <div className="text-xs text-blue-600">ESG-compliant vessels command 15-25% charter premium</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Immediate Action Recommendations</CardTitle>
          <CardDescription>High-impact opportunities based on current data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Route Optimization</span>
              </div>
              <p className="text-sm text-green-600 mb-3">Switch to Stockholm-Gotland corridor for 15% fuel savings and reduced environmental risk.</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => {
                  toast.success('Route optimization initiated! New Stockholm-Gotland route has been added to your fleet management system.');
                }}
              >
                Implement Route
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Emissions Compliance</span>
              </div>
              <p className="text-sm text-blue-600 mb-3">Upgrade to Tier III NOx compliance in preparation for stricter regulations.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast.info('Emissions compliance upgrade plan created. Check your maintenance schedule for implementation timeline.');
                }}
              >
                Plan Upgrade
              </Button>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Ship className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Backhaul Optimization</span>
              </div>
              <p className="text-sm text-orange-600 mb-3">Book Bentonite cargo (€538K value) from Livorno to eliminate ballast leg and maximize vessel utilization.</p>
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  navigate('/intelligence');
                  toast.success('Navigated to marketplace! Bentonite cargo opportunity is now available for booking.');
                }}
              >
                Book Cargo
              </Button>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Market Opportunity</span>
              </div>
              <p className="text-sm text-purple-600 mb-3">Capitalize on 12.5% cargo growth with optimized scheduling and capacity planning.</p>
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  toast.info('Capacity analysis report generated! Market growth opportunities have been analyzed and recommendations added to your dashboard.');
                }}
              >
                Analyze Capacity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingInsights;