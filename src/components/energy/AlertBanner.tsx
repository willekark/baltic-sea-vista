import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  reason: string;
  entity: string;
  severity: 'low' | 'medium' | 'high';
  type: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Price-Flow Divergence',
    reason: 'SE3 price spike +15% while imports constrained',
    entity: 'SE3 Zone',
    severity: 'high',
    type: 'congestion_risk'
  },
  {
    id: '2',
    title: 'OPS Utilization Gap',
    reason: 'Helsinki OPS usage 40% below peer median',
    entity: 'Helsinki Port',
    severity: 'medium',
    type: 'operational_underuse'
  }
];

const AlertBanner = () => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (mockAlerts.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Intelligence Alerts
          </h3>
          <Badge variant="outline">{mockAlerts.length} alerts</Badge>
        </div>
        <div className="space-y-2">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getSeverityIcon(alert.severity)}
                <div>
                  <div className="font-medium text-sm">{alert.title}</div>
                  <div className="text-xs text-muted-foreground">{alert.reason}</div>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                  {alert.entity}
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                Explain
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertBanner;