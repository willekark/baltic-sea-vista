import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Fish, Waves, Download } from 'lucide-react';

const BlueEconomyDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Blue Economy & Innovation Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Fisheries, aquaculture, tourism, and EU funding opportunities
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Blue Economy Report
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-blue-600" />
            Fisheries & Aquaculture
          </CardTitle>
          <CardDescription>Stock health, quotas, and sustainable fishing indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Blue economy analytics dashboard coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlueEconomyDashboard;