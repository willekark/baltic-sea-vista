import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Download } from 'lucide-react';

const ScenarioStudio = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Scenario Studio</h2>
          <p className="text-muted-foreground mt-1">
            Interactive scenario modeling with adjustable assumptions
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Scenario Report
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Scenario Builder
          </CardTitle>
          <CardDescription>Adjust assumptions and see recomputed score deltas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Scenario studio coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioStudio;