import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Download, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from "lucide-react";

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

interface CTA {
  title: string;
  description: string;
  priority: number;
  estimatedImpact: string;
  actions: string[];
  timeframe: string;
}

const EcologicalReporting = () => {
  const [selectedEntity, setSelectedEntity] = useState('stockholm');
  const [score, setScore] = useState<EcologicalScore | null>(null);
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [loading, setLoading] = useState(false);

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

      // Fetch CTAs
      const { data: ctaData } = await supabase.functions.invoke('ecological-ctas', {
        body: { entityType: 'municipality', entityId: selectedEntity }
      });

      if (ctaData?.success) {
        setCtas(ctaData.data);
      }
    } catch (error) {
      console.error('Error fetching ecological data:', error);
    } finally {
      setLoading(false);
    }
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

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1: return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 2: return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Ecological Reporting</h1>
            <p className="text-xl text-muted-foreground">Automated Baltic Sea ecological scorecards and sustainability reporting</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select municipality or site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stockholm">Stockholm Municipality</SelectItem>
                <SelectItem value="gothenburg">Gothenburg Municipality</SelectItem>
                <SelectItem value="malmo">Malmö Municipality</SelectItem>
                <SelectItem value="helsinki">Helsinki Municipality</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Main Scorecard */}
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

            {/* Call-to-Actions */}
            <section id="ctas">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ctas.slice(0, 3).map((cta, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(cta.priority)}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{cta.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{cta.description}</p>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="outline">Impact: {cta.estimatedImpact}</Badge>
                              <Badge variant="outline">{cta.timeframe}</Badge>
                            </div>
                            <ul className="text-sm space-y-1">
                              {cta.actions.slice(0, 2).map((action, i) => (
                                <li key={i} className="text-muted-foreground">• {action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Export Options */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default EcologicalReporting;