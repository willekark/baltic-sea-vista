import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, Anchor, MapPin, TrendingUp, AlertTriangle, DollarSign, Clock, BarChart3 } from "lucide-react";
import PortAgentDashboard from "@/components/PortAgentDashboard";
import PortCostAnalyzer from "@/components/PortCostAnalyzer";
import BerthAvailability from "@/components/BerthAvailability";
import PortPerformance from "@/components/PortPerformance";
import RouteOptimizer from "@/components/RouteOptimizer";

const PortAgent = () => {
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Anchor className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Baltic Port Agency Services
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive port management, cost optimization, and operational intelligence for Baltic maritime operations
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="costs"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Cost Analysis</span>
            </TabsTrigger>
            <TabsTrigger 
              value="berths"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Berth Availability</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="optimizer"
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Ship className="w-4 h-4" />
              <span className="hidden sm:inline">Route Optimizer</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="dashboard">
            <PortAgentDashboard onPortSelect={setSelectedPort} />
          </TabsContent>

          <TabsContent value="costs">
            <PortCostAnalyzer selectedPort={selectedPort} />
          </TabsContent>

          <TabsContent value="berths">
            <BerthAvailability selectedPort={selectedPort} />
          </TabsContent>

          <TabsContent value="performance">
            <PortPerformance selectedPort={selectedPort} />
          </TabsContent>

          <TabsContent value="optimizer">
            <RouteOptimizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortAgent;