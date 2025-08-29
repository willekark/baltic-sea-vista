import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  Ship, 
  Navigation2,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Activity,
  Zap,
  Anchor,
  Globe,
  Thermometer,
  Eye,
  Shield,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ArbitrageOpportunity {
  id?: string;
  opportunity_type: string;
  title: string;
  description: string;
  potential_savings_eur: number;
  potential_revenue_eur: number;
  probability_score: number;
  time_sensitivity: 'urgent' | 'high' | 'medium' | 'low';
  implementation_complexity: 'simple' | 'moderate' | 'complex';
  origin_port?: string;
  destination_port?: string;
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  risk_factors: string[];
  mitigation_strategies: string[];
  confidence_level: number;
  valid_until: string;
}

const ArbitrageOpportunities = () => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [summary, setSummary] = useState<any>({});

  const opportunityTypes = {
    'all': { label: 'All Opportunities', icon: BarChart3 },
    'freight_rate_arbitrage': { label: 'Freight Rate', icon: TrendingUp },
    'backhaul_cargo_arbitrage': { label: 'Backhaul Cargo', icon: Ship },
    'fuel_bunkering_arbitrage': { label: 'Fuel Bunkering', icon: Fuel },
    'carbon_credit_arbitrage': { label: 'Carbon/ETS', icon: Globe },
    'commodity_flow_arbitrage': { label: 'Commodity Flow', icon: Activity },
    'ice_season_arbitrage': { label: 'Ice Season', icon: Thermometer },
    'port_congestion_arbitrage': { label: 'Port Congestion', icon: Anchor },
    'regulatory_arbitrage': { label: 'Regulatory', icon: Shield },
    'storage_floating_arbitrage': { label: 'Floating Storage', icon: Navigation2 }
  };

  const analyzeArbitrageOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('arbitrage-analyzer', {
        body: {
          analysisType: 'full',
          vesselSpecs: {
            type: 'handysize',
            dwt: 35000,
            iceClass: false
          }
        }
      });

      if (error) throw error;
      
      setOpportunities(data.opportunities || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Error analyzing arbitrage opportunities:', error);
      // Generate fallback data for demo
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = () => {
    const fallbackOpportunities = [
      {
        opportunity_type: 'freight_rate_arbitrage',
        title: 'Baltic-Med vs Baltic-Turkey Rate Differential',
        description: 'Redeploy handysize vessels from Baltic-Med route (€14k/day) to Baltic-Turkey route (€19k/day) for immediate revenue increase',
        potential_savings_eur: 0,
        potential_revenue_eur: 150000,
        probability_score: 85,
        time_sensitivity: 'high' as const,
        implementation_complexity: 'simple' as const,
        origin_port: 'Stockholm',
        destination_port: 'Istanbul',
        risk_level: 'medium' as const,
        risk_factors: ['Market volatility', 'Vessel availability', 'Charter agreements'],
        mitigation_strategies: ['Flexible chartering', 'Real-time rate monitoring'],
        confidence_level: 82,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        opportunity_type: 'fuel_bunkering_arbitrage',
        title: 'Riga vs Helsinki Bunker Price Advantage',
        description: 'Refuel in Riga (€485/ton) instead of Helsinki (€530/ton) - save €45/tonne on VLSFO bunker fuel',
        potential_savings_eur: 67500,
        potential_revenue_eur: 0,
        probability_score: 90,
        time_sensitivity: 'urgent' as const,
        implementation_complexity: 'simple' as const,
        origin_port: 'Riga',
        destination_port: 'Various',
        risk_level: 'low' as const,
        risk_factors: ['Price volatility', 'Fuel availability'],
        mitigation_strategies: ['Price hedging', 'Multiple supplier contracts'],
        confidence_level: 88,
        valid_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        opportunity_type: 'backhaul_cargo_arbitrage',
        title: 'Fertilizer Backhaul from Baltic Ports',
        description: 'Secure fertilizer cargo at €35/ton for return voyage instead of sailing in ballast - pure profit opportunity',
        potential_savings_eur: 0,
        potential_revenue_eur: 175000,
        probability_score: 75,
        time_sensitivity: 'medium' as const,
        implementation_complexity: 'moderate' as const,
        origin_port: 'Gdańsk',
        destination_port: 'Hamburg',
        risk_level: 'low' as const,
        risk_factors: ['Cargo availability', 'Loading delays'],
        mitigation_strategies: ['Multiple cargo options', 'Pre-booking'],
        confidence_level: 78,
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        opportunity_type: 'carbon_credit_arbitrage',
        title: 'ETS Cost Reduction through Route Optimization',
        description: 'Optimize routing and speed to reduce CO2 emissions by 15% and save €95/ton CO2 in EU ETS costs',
        potential_savings_eur: 85000,
        potential_revenue_eur: 0,
        probability_score: 80,
        time_sensitivity: 'medium' as const,
        implementation_complexity: 'moderate' as const,
        risk_level: 'low' as const,
        risk_factors: ['ETS price volatility', 'Weather conditions'],
        mitigation_strategies: ['Weather routing', 'Speed optimization', 'Green corridors'],
        confidence_level: 75,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        opportunity_type: 'port_congestion_arbitrage',
        title: 'Avoid Hamburg Congestion via Gdańsk',
        description: 'Route to Gdańsk instead of Hamburg to avoid 36-hour delays - save €25k/day in vessel costs',
        potential_savings_eur: 37500,
        potential_revenue_eur: 0,
        probability_score: 95,
        time_sensitivity: 'urgent' as const,
        implementation_complexity: 'simple' as const,
        origin_port: 'Gdańsk',
        destination_port: 'Alternative to Hamburg',
        risk_level: 'low' as const,
        risk_factors: ['Alternative port capacity'],
        mitigation_strategies: ['Real-time port monitoring', 'Pre-booking berths'],
        confidence_level: 92,
        valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        opportunity_type: 'commodity_flow_arbitrage',
        title: 'Grain Export Season Premium',
        description: 'Position vessels early for Baltic grain harvest season - 40% premium rates expected in September-October',
        potential_savings_eur: 0,
        potential_revenue_eur: 280000,
        probability_score: 85,
        time_sensitivity: 'high' as const,
        implementation_complexity: 'moderate' as const,
        risk_level: 'medium' as const,
        risk_factors: ['Harvest timing', 'Weather delays', 'Competition'],
        mitigation_strategies: ['Early positioning', 'Flexible contracts', 'Multiple origins'],
        confidence_level: 80,
        valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setOpportunities(fallbackOpportunities);
    setSummary({
      totalOpportunities: fallbackOpportunities.length,
      totalPotentialValue: fallbackOpportunities.reduce((sum, o) => sum + o.potential_savings_eur + o.potential_revenue_eur, 0),
      urgentOpportunities: fallbackOpportunities.filter(o => o.time_sensitivity === 'urgent').length,
      highValueOpportunities: fallbackOpportunities.filter(o => (o.potential_savings_eur + o.potential_revenue_eur) > 100000).length
    });
  };

  useEffect(() => {
    generateFallbackData(); // Load demo data on mount
  }, []);

  const filteredOpportunities = selectedType === 'all' 
    ? opportunities 
    : opportunities.filter(o => o.opportunity_type === selectedType);

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'very_high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'moderate': return <Clock className="w-4 h-4 text-warning" />;
      case 'complex': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Baltic Arbitrage Opportunities</CardTitle>
                <p className="text-muted-foreground">AI-powered profit optimization for shipping operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Real-time Analysis</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.totalOpportunities || 0}</div>
              <div className="text-sm text-muted-foreground">Total Opportunities</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-success">€{((summary.totalPotentialValue || 0) / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted-foreground">Potential Value</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{summary.urgentOpportunities || 0}</div>
              <div className="text-sm text-muted-foreground">Urgent Actions</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-warning">{summary.highValueOpportunities || 0}</div>
              <div className="text-sm text-muted-foreground">High Value (&gt;€100K)</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {Object.entries(opportunityTypes).map(([type, config]) => {
                const Icon = config.icon;
                const count = type === 'all' ? opportunities.length : opportunities.filter(o => o.opportunity_type === type).length;
                return (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="flex items-center space-x-1"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{config.label}</span>
                    {count > 0 && <Badge variant="secondary" className="ml-1">{count}</Badge>}
                  </Button>
                );
              })}
            </div>
            <Button onClick={analyzeArbitrageOpportunities} disabled={loading} className="bg-primary">
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="grid gap-6">
        {filteredOpportunities.map((opportunity, index) => {
          const totalValue = opportunity.potential_savings_eur + opportunity.potential_revenue_eur;
          const daysUntilExpiry = Math.ceil((new Date(opportunity.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getSensitivityColor(opportunity.time_sensitivity)}>
                        {opportunity.time_sensitivity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {opportunityTypes[opportunity.opportunity_type as keyof typeof opportunityTypes]?.label || 'Unknown'}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getComplexityIcon(opportunity.implementation_complexity)}
                        <span className="text-sm text-muted-foreground">{opportunity.implementation_complexity}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{opportunity.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-success">€{(totalValue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Financial Breakdown */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="font-semibold text-success">€{(opportunity.potential_savings_eur / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground">Cost Savings</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="font-semibold text-primary">€{(opportunity.potential_revenue_eur / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground">Revenue Opportunity</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="font-semibold">{opportunity.probability_score}%</div>
                    <div className="text-xs text-muted-foreground">Success Probability</div>
                  </div>
                </div>

                {/* Route Information */}
                {(opportunity.origin_port || opportunity.destination_port) && (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Navigation2 className="w-4 h-4 text-primary" />
                      <span className="font-medium">Route:</span>
                      <span>{opportunity.origin_port || 'Various'} to {opportunity.destination_port || 'Various'}</span>
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${getRiskColor(opportunity.risk_level)}`} />
                      <span className="font-medium text-sm">Risk Factors:</span>
                    </div>
                    <ul className="space-y-1">
                      {opportunity.risk_factors.map((factor, i) => (
                        <li key={i} className="text-xs flex items-start">
                          <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 mr-2 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-success" />
                      <span className="font-medium text-sm">Mitigation:</span>
                    </div>
                    <ul className="space-y-1">
                      {opportunity.mitigation_strategies.map((strategy, i) => (
                        <li key={i} className="text-xs flex items-start">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 mr-2 flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Level</span>
                      <span>{opportunity.confidence_level}%</span>
                    </div>
                    <Progress value={opportunity.confidence_level} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Valid for {daysUntilExpiry} more days</span>
                    </div>
                    <Button size="sm" className="bg-primary">
                      Implement Strategy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card className="text-center p-8">
          <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Opportunities Found</h3>
          <p className="text-muted-foreground mb-4">
            {selectedType === 'all' 
              ? 'No arbitrage opportunities available at this time.' 
              : `No ${opportunityTypes[selectedType as keyof typeof opportunityTypes]?.label} opportunities found.`}
          </p>
          <Button onClick={analyzeArbitrageOpportunities} variant="outline">
            Run New Analysis
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ArbitrageOpportunities;