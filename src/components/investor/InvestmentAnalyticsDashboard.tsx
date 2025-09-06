import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, Building2, FileText } from 'lucide-react';
import BalticSeaInvestments from './BalticSeaInvestments';
import InstitutionalReport from './InstitutionalReport';

const InvestmentAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Investment Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Scenario modeling, CTAs, and investment performance analytics
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Analytics Report
        </Button>
      </div>
      
      <Tabs defaultValue="investments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Baltic Sea Investments
          </TabsTrigger>
          <TabsTrigger value="institutional" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Institutional Report
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Scenario Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="investments">
          <BalticSeaInvestments />
        </TabsContent>

        <TabsContent value="institutional">
          <InstitutionalReport />
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Scenario Studio
              </CardTitle>
              <CardDescription>Interactive scenario modeling and investment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Investment analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentAnalyticsDashboard;