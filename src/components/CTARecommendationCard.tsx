import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Euro, 
  Calendar, 
  Target, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Shield,
  Scale,
  Building
} from "lucide-react";

interface CTARecommendation {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  actions: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  estimated_impact: {
    kpi_improvement: string;
    co2_reduction_tonnes: number;
    cost_estimate_eur: string;
    roi_timeline: string;
  };
  implementation: {
    stakeholders: string[];
    timeline_months: number;
    budget_sources: string[];
    success_metrics: string[];
  };
  evidence: {
    data_sources: string[];
    baseline_values: { [key: string]: number };
    benchmarks: string;
  };
  regulatory_framework: {
    eu_directives: string[];
    national_legislation: string[];
    local_permits: string[];
  };
  co_benefits: string[];
  risks: string[];
}

interface CTARecommendationCardProps {
  recommendation: CTARecommendation;
}

const CTARecommendationCard: React.FC<CTARecommendationCardProps> = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Clock className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {recommendation.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getPriorityColor(recommendation.priority)} flex items-center gap-1`}>
                {getPriorityIcon(recommendation.priority)}
                {recommendation.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {recommendation.implementation.timeline_months} months
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Euro className="w-3 h-3" />
                {recommendation.estimated_impact.cost_estimate_eur}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {recommendation.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {recommendation.estimated_impact.kpi_improvement}
            </div>
            <div className="text-xs text-muted-foreground">KPI Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendation.estimated_impact.co2_reduction_tonnes}t
            </div>
            <div className="text-xs text-muted-foreground">CO₂ Reduction/year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recommendation.estimated_impact.roi_timeline}
            </div>
            <div className="text-xs text-muted-foreground">ROI Timeline</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {recommendation.implementation.stakeholders.length}
            </div>
            <div className="text-xs text-muted-foreground">Stakeholders</div>
          </div>
        </div>

        {/* Expandable Detailed Information */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'Hide Details' : 'View Implementation Plan'}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-6">
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="actions">Action Plan</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="evidence">Evidence Base</TabsTrigger>
                <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Short-term Actions (0-6 months)
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.actions.short_term.map((action, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-1 text-green-600 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Medium-term Actions (6-18 months)
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.actions.medium_term.map((action, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Long-term Actions (18+ months)
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.actions.long_term.map((action, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-1 text-purple-600 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="implementation" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Key Stakeholders
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.implementation.stakeholders.map((stakeholder, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {stakeholder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        Budget Sources
                      </h4>
                      <ul className="space-y-1">
                        {recommendation.implementation.budget_sources.map((source, idx) => (
                          <li key={idx} className="text-sm">• {source}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Success Metrics
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.implementation.success_metrics.map((metric, idx) => (
                        <li key={idx} className="text-sm">• {metric}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Data Sources
                      </h4>
                      <ul className="space-y-1">
                        {recommendation.evidence.data_sources.map((source, idx) => (
                          <li key={idx} className="text-sm">• {source}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Benchmarks</h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.evidence.benchmarks}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Baseline Values</h4>
                    <div className="space-y-2">
                      {Object.entries(recommendation.evidence.baseline_values).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="regulatory" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      EU Directives
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.regulatory_framework.eu_directives.map((directive, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {directive}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      National Legislation
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.regulatory_framework.national_legislation.map((law, idx) => (
                        <li key={idx} className="text-sm">• {law}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Required Permits</h4>
                    <ul className="space-y-1">
                      {recommendation.regulatory_framework.local_permits.map((permit, idx) => (
                        <li key={idx} className="text-sm">• {permit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Co-benefits
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.co_benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-1 text-green-600 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700">
                      <Shield className="w-4 h-4" />
                      Risk Factors
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.risks.map((risk, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 mt-1 text-orange-600 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default CTARecommendationCard;