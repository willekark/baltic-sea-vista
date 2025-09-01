import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ship, Route, DollarSign, Clock, Target } from "lucide-react";

const RouteOptimizer: React.FC = () => {
  const [vesselSize, setVesselSize] = useState('medium');
  const [cargoType, setCargoType] = useState('containers');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Route Optimization
          </CardTitle>
          <CardDescription>
            Find optimal port routing for cost and time efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={vesselSize} onValueChange={setVesselSize}>
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="Select vessel size" className="text-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="small" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">Small Vessel</SelectItem>
                <SelectItem value="medium" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">Medium Vessel</SelectItem>
                <SelectItem value="large" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">Large Vessel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cargoType} onValueChange={setCargoType}>
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="Select cargo type" className="text-foreground" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="containers" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">Containers</SelectItem>
                <SelectItem value="bulk" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">Bulk Cargo</SelectItem>
                <SelectItem value="ro-ro" className="text-card-foreground hover:bg-accent hover:text-accent-foreground">Ro-Ro</SelectItem>
              </SelectContent>
            </Select>

            <Button>Optimize Route</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteOptimizer;