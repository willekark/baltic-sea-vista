import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, Navigation, BarChart3, TrendingUp, Fuel, DollarSign } from "lucide-react";
import ShippingInsights from "@/components/ShippingInsights";
import RouteOptimizer from "@/components/RouteOptimizer";
import ArbitrageOpportunities from "@/components/ArbitrageOpportunities";
import ContractBidding from "@/components/ContractBidding";

const ShippingIntelligence = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ship className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Shipping Intelligence Hub
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive maritime intelligence platform for shipping operations, route optimization, market analysis, and contract opportunities
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
            <TabsTrigger 
              value="insights" 
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Shipping Insights</span>
            </TabsTrigger>
            <TabsTrigger 
              value="routes"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Route Optimizer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="arbitrage"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Market Arbitrage</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contracts"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Contract Bidding</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="insights">
            <ShippingInsights />
          </TabsContent>

          <TabsContent value="routes">
            <RouteOptimizer />
          </TabsContent>

          <TabsContent value="arbitrage">
            <ArbitrageOpportunities />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractBidding />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShippingIntelligence;