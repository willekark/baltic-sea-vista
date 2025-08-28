import React, { useState } from 'react';
import { RefreshCw, Database, Satellite, Ship, Fish, Waves, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DataSourceStatus: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { toast } = useToast();

  const dataSources = [
    {
      name: 'Copernicus Marine Service',
      description: 'Sea temperature, salinity, currents, oxygen levels',
      icon: Satellite,
      status: 'active',
      type: 'satellite'
    },
    {
      name: 'HELCOM',
      description: 'Eutrophication, emissions, biodiversity indicators',
      icon: Database,
      status: 'active',
      type: 'environmental'
    },
    {
      name: 'SMHI SHARKweb',
      description: 'Oxygen, nutrients, plankton, water clarity',
      icon: Waves,
      status: 'active',
      type: 'water_quality'
    },
    {
      name: 'AIS Shipping Data',
      description: 'Vessel movements, traffic intensity, routes',
      icon: Ship,
      status: 'active',
      type: 'shipping'
    },
    {
      name: 'ICES Data Portal',
      description: 'Fish stocks, catch statistics, biological surveys',
      icon: Fish,
      status: 'active',
      type: 'fisheries'
    },
    {
      name: 'Weather & Sea State',
      description: 'Wave height, wind speed, sea conditions',
      icon: Waves,
      status: 'active',
      type: 'weather'
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-baltic-data');
      
      if (error) throw error;
      
      setLastRefresh(new Date());
      toast({
        title: "Data Refreshed",
        description: `Successfully updated data from ${data.sources_fetched?.length || 6} sources`,
      });

      // Trigger a page refresh to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : 'Failed to refresh data sources',
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Sources
            </CardTitle>
            <CardDescription>
              Real-time monitoring from multiple Baltic Sea data providers
            </CardDescription>
          </div>
          <Button 
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {dataSources.map((source, index) => {
            const Icon = source.icon;
            const StatusIcon = source.status === 'active' ? CheckCircle : AlertCircle;
            
            return (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{source.name}</h4>
                    <StatusIcon className={`w-3 h-3 flex-shrink-0 ${
                      source.status === 'active' ? 'text-green-500' : 'text-orange-500'
                    }`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                  <Badge variant="secondary" className="text-xs mt-1 capitalize">
                    {source.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        
        {lastRefresh && (
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded-lg">
            Last updated: {lastRefresh.toLocaleString()}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Data Integration Status</p>
              <p className="text-xs opacity-80">
                Currently using simulated real-time data. Full API integration requires authentication credentials for production data sources.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourceStatus;