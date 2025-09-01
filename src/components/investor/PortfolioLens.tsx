import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

const PortfolioLens = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Portfolio Lens</h2>
          <p className="text-muted-foreground mt-1">
            Portfolio context with relevant signals, scores, and alerts
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Portfolio Report
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Portfolio Context
          </CardTitle>
          <CardDescription>Add your assets/regions to highlight relevant signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Portfolio lens dashboard coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioLens;