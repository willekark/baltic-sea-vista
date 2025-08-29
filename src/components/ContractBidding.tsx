import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Ship, 
  Target,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Award,
  AlertCircle,
  CheckCircle2,
  Timer
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContractOpportunity {
  id: string;
  contract_title: string;
  contract_description: string;
  contract_type: string;
  issuing_organization: string;
  contract_value_eur: number;
  estimated_value_eur: number;
  bid_deadline: string;
  contract_start_date: string;
  contract_end_date: string;
  route_origin: string;
  route_destination: string;
  cargo_type: string;
  cargo_volume_tons: number;
  vessel_requirements: any;
  competitive_score: number;
  recommended_bid_strategy: string;
  win_probability: number;
  region: string;
  contract_status: string;
  contact_info: any;
  evaluation_criteria: any[];
}

const ContractBidding = () => {
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<ContractOpportunity[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [summary, setSummary] = useState<any>({});

  const contractTypes = {
    'all': { label: 'All Contracts', icon: FileText },
    'tender': { label: 'Public Tenders', icon: Building2 },
    'rfq': { label: 'RFQ/RFP', icon: Target },
    'spot_market': { label: 'Spot Market', icon: TrendingUp },
    'project_cargo': { label: 'Project Cargo', icon: Ship },
    'framework': { label: 'Framework Agreements', icon: Award }
  };

  const analyzeContractOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('contract-bidding-analyzer', {
        body: {
          region: 'baltic',
          maxDeadlineDays: 60,
          contractTypes: selectedType === 'all' ? undefined : [selectedType]
        }
      });

      if (error) throw error;
      
      setContracts(data.contracts || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Error analyzing contract opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeContractOpportunities();
  }, []);

  const filteredContracts = selectedType === 'all' 
    ? contracts 
    : contracts.filter(c => c.contract_type === selectedType);

  const getDeadlineColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 3) return 'text-destructive';
    if (daysLeft <= 7) return 'text-warning';
    if (daysLeft <= 14) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getDeadlineBadgeColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 3) return 'bg-destructive text-destructive-foreground';
    if (daysLeft <= 7) return 'bg-warning text-warning-foreground';
    if (daysLeft <= 14) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getCompetitiveColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const formatDaysLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return '1 day';
    return `${daysLeft} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Baltic Contract Bidding Opportunities</CardTitle>
                <p className="text-muted-foreground">Open sourced contracts available for bidding in the Baltic region</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Live Opportunities</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.totalContracts || 0}</div>
              <div className="text-sm text-muted-foreground">Active Contracts</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-success">€{((summary.totalValue || 0) / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{summary.urgentDeadlines || 0}</div>
              <div className="text-sm text-muted-foreground">Urgent (≤7 days)</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-warning">{summary.highValueContracts || 0}</div>
              <div className="text-sm text-muted-foreground">High Value (&gt;€2M)</div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <div className="text-2xl font-bold text-accent">{summary.avgWinProbability || 0}%</div>
              <div className="text-sm text-muted-foreground">Avg Win Rate</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {Object.entries(contractTypes).map(([type, config]) => {
                const Icon = config.icon;
                const count = type === 'all' ? contracts.length : contracts.filter(c => c.contract_type === type).length;
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
            <Button onClick={analyzeContractOpportunities} disabled={loading} className="bg-primary">
              {loading ? 'Loading...' : 'Refresh Contracts'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-6">
        {filteredContracts.map((contract, index) => {
          const daysLeft = formatDaysLeft(contract.bid_deadline);
          
          return (
            <Card key={contract.id || index} className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getDeadlineBadgeColor(contract.bid_deadline)}>
                        {daysLeft} left
                      </Badge>
                      <Badge variant="outline">
                        {contractTypes[contract.contract_type as keyof typeof contractTypes]?.label || contract.contract_type}
                      </Badge>
                      <Badge variant="secondary">
                        {contract.region.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-2">{contract.contract_title}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-3">{contract.contract_description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-4 h-4" />
                        <span>{contract.issuing_organization}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{contract.route_origin} → {contract.route_destination}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-success">
                      €{((contract.estimated_value_eur || contract.contract_value_eur) / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-muted-foreground">Contract Value</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Deadline</span>
                    </div>
                    <div className={`font-semibold ${getDeadlineColor(contract.bid_deadline)}`}>
                      {new Date(contract.bid_deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Ship className="w-4 h-4" />
                      <span className="text-xs font-medium">Cargo</span>
                    </div>
                    <div className="font-semibold">{contract.cargo_volume_tons?.toLocaleString() || 'N/A'} tons</div>
                    <div className="text-xs text-muted-foreground">{contract.cargo_type}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-medium">Win Probability</span>
                    </div>
                    <div className="font-semibold text-primary">{contract.win_probability || 0}%</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Competition</span>
                    </div>
                    <div className={`font-semibold ${getCompetitiveColor(contract.competitive_score || 0)}`}>
                      {contract.competitive_score || 0}/100
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Ship className="w-4 h-4 mr-2" />
                      Vessel Requirements
                    </h4>
                    <div className="space-y-1 text-sm">
                      {contract.vessel_requirements?.minDWT && (
                        <div>Min DWT: {contract.vessel_requirements.minDWT.toLocaleString()}</div>
                      )}
                      {contract.vessel_requirements?.maxDWT && (
                        <div>Max DWT: {contract.vessel_requirements.maxDWT.toLocaleString()}</div>
                      )}
                      {contract.vessel_requirements?.cargoHandling && (
                        <div>Cargo Handling: {contract.vessel_requirements.cargoHandling.join(', ')}</div>
                      )}
                      {contract.vessel_requirements?.iceClass && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          <span>Ice Class Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Bid Strategy
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{contract.recommended_bid_strategy}</p>
                    
                    {contract.evaluation_criteria && contract.evaluation_criteria.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">Evaluation Criteria:</div>
                        <div className="space-y-1">
                          {contract.evaluation_criteria.slice(0, 3).map((criteria, i) => (
                            <div key={i} className="text-xs text-muted-foreground flex items-start">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {criteria}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {contract.contact_info && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Information
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {contract.contact_info.company && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{contract.contact_info.company}</span>
                        </div>
                      )}
                      {contract.contact_info.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{contract.contact_info.email}</span>
                        </div>
                      )}
                      {contract.contact_info.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{contract.contact_info.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {filteredContracts.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Contract Opportunities Found</h3>
              <p className="text-muted-foreground mb-4">
                No contracts match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={analyzeContractOpportunities} variant="outline">
                Refresh Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContractBidding;