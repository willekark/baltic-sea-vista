import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Wind, 
  Plug, 
  Fuel, 
  Building, 
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import EnergyKpis from '@/components/energy/EnergyKpis';
import AlertBanner from '@/components/energy/AlertBanner';
import TabGridPrices from '@/components/energy/TabGridPrices';
import TabEnergyFlows from '@/components/energy/TabEnergyFlows';
import TabOffshoreWind from '@/components/energy/TabOffshoreWind';
import TabOpsCoverage from '@/components/energy/TabOpsCoverage';
import TabGreenBunkering from '@/components/energy/TabGreenBunkering';
import TabMunicipal from '@/components/energy/TabMunicipal';

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
        <EnergyKpis />

        {/* Intelligence Alerts */}
        <AlertBanner />

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
            <TabGridPrices />
          </TabsContent>

          <TabsContent value="flows" className="space-y-6">
            <TabEnergyFlows />
          </TabsContent>

          <TabsContent value="wind" className="space-y-6">
            <TabOffshoreWind />
          </TabsContent>

          <TabsContent value="ops" className="space-y-6">
            <TabOpsCoverage />
          </TabsContent>

          <TabsContent value="bunkering" className="space-y-6">
            <TabGreenBunkering />
          </TabsContent>

          <TabsContent value="municipal" className="space-y-6">
            <TabMunicipal />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnergyIntelligence;