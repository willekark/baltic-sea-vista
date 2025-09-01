import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download } from 'lucide-react';

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
    </div>
  );
};

export default InvestmentAnalyticsDashboard;