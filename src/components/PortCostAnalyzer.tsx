import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calculator, TrendingDown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PortCostAnalyzerProps {
  selectedPort?: string | null;
}

interface PortCostData {
  port: any;
  tariffs: any[];
  estimated_costs: {
    total: number;
    breakdown: any[];
  };
  recommendations: any[];
}

const PortCostAnalyzer: React.FC<PortCostAnalyzerProps> = ({ selectedPort }) => {
  const [ports, setPorts] = useState<any[]>([]);
  const [costData, setCostData] = useState<PortCostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [vesselSize, setVesselSize] = useState('medium');
  const [cargoType, setCargoType] = useState('containers');
  const [currentPortId, setCurrentPortId] = useState<string | null>(selectedPort);
  const { toast } = useToast();

  useEffect(() => {
    fetchPorts();
  }, []);

  useEffect(() => {
    if (selectedPort) {
      setCurrentPortId(selectedPort);
      analyzeCosts(selectedPort, vesselSize, cargoType);
    }
  }, [selectedPort]);

  const fetchPorts = async () => {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name');

      if (error) throw error;
      setPorts(data);
    } catch (error) {
      console.error('Error fetching ports:', error);
      toast({
        title: "Error",
        description: "Failed to load ports data",
        variant: "destructive",
      });
    }
  };

  const analyzeCosts = async (portId: string, vesselSize: string, cargoType: string) => {
    if (!portId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('port-agent-services', {
        body: { 
          action: 'get_port_costs',
          port_id: portId,
          vessel_size: vesselSize,
          cargo_type: cargoType
        }
      });

      if (error) throw error;
      setCostData(data);
    } catch (error) {
      console.error('Error analyzing port costs:', error);
      toast({
        title: "Error",
        description: "Failed to analyze port costs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (currentPortId) {
      analyzeCosts(currentPortId, vesselSize, cargoType);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Port Cost Analysis
          </CardTitle>
          <CardDescription>
            Calculate and compare port costs for different vessel types and cargo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="port-select">Select Port</Label>
              <Select 
                value={currentPortId || ''} 
                onValueChange={setCurrentPortId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name} ({port.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vessel-size">Vessel Size</Label>
              <Select value={vesselSize} onValueChange={setVesselSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (&lt;10k GT)</SelectItem>
                  <SelectItem value="medium">Medium (10k-30k GT)</SelectItem>
                  <SelectItem value="large">Large (&gt;30k GT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cargo-type">Cargo Type</Label>
              <Select value={cargoType} onValueChange={setCargoType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="containers">Containers</SelectItem>
                  <SelectItem value="bulk">Dry Bulk</SelectItem>
                  <SelectItem value="breakbulk">Breakbulk</SelectItem>
                  <SelectItem value="ro-ro">Ro-Ro</SelectItem>
                  <SelectItem value="liquid">Liquid Bulk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={!currentPortId || loading}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Analyze Costs'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis Results */}
      {costData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Breakdown
              </CardTitle>
              <CardDescription>
                Detailed port service charges for {costData.port.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Port Call Cost</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(costData.estimated_costs.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {costData.estimated_costs.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded border">
                      <div>
                        <p className="font-medium capitalize">
                          {item.service.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.rate)} {item.unit.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(item.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Cost Optimization
              </CardTitle>
              <CardDescription>
                Recommendations to reduce port expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costData.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {rec.type.replace('_', ' ')}
                      </Badge>
                      {rec.potential_savings && (
                        <span className="text-green-700 dark:text-green-400 font-semibold">
                          Save {formatCurrency(rec.potential_savings)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{rec.message}</p>
                  </div>
                ))}

                {/* Additional Insights */}
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">
                      Port Insights
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>• {(() => {
                      try {
                        const facilities = costData.port.facilities ? (typeof costData.port.facilities === 'string' ? JSON.parse(costData.port.facilities) : costData.port.facilities) : {};
                        return facilities.berths || 'N/A';
                      } catch { return 'N/A'; }
                    })()} berths available</p>
                    <p>• Maximum draft: {(() => {
                      try {
                        const facilities = costData.port.facilities ? (typeof costData.port.facilities === 'string' ? JSON.parse(costData.port.facilities) : costData.port.facilities) : {};
                        return facilities.max_draft || 'N/A';
                      } catch { return 'N/A'; }
                    })()}m</p>
                    <p>• Services: {(() => {
                      try {
                        const facilities = costData.port.facilities ? (typeof costData.port.facilities === 'string' ? JSON.parse(costData.port.facilities) : costData.port.facilities) : {};
                        return facilities.services?.join(', ') || 'Standard services';
                      } catch { return 'Standard services'; }
                    })()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Port Comparison */}
      {!costData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Port Cost Analysis</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Select a port and vessel specifications above to get detailed cost breakdown and optimization recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortCostAnalyzer;