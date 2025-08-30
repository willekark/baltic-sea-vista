import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Info, 
  Database, 
  Clock, 
  Shield, 
  ExternalLink,
  Satellite,
  Waves,
  Globe
} from 'lucide-react';

interface DataSource {
  name: string;
  type: 'satellite' | 'model' | 'gauge' | 'analysis';
  variables: string[];
  update_frequency: string;
  last_update: string;
  quality: 'good' | 'warning' | 'error';
  license: string;
  attribution: string;
  url?: string;
}

const IntelligenceProvenance: React.FC = () => {
  const dataSources: DataSource[] = [
    {
      name: 'CMEMS Baltic',
      type: 'model',
      variables: ['currents', 'waves', 'sst', 'sea_level', 'oxygen', 'chlorophyll'],
      update_frequency: 'Daily',
      last_update: '2h ago',
      quality: 'good',
      license: 'Free for research',
      attribution: 'Copernicus Marine Environment Monitoring Service',
      url: 'https://marine.copernicus.eu'
    },
    {
      name: 'SMHI Open Data',
      type: 'gauge',
      variables: ['wind', 'sea_level', 'waves'],
      update_frequency: 'Hourly',
      last_update: '1h ago',
      quality: 'good',
      license: 'CC BY 4.0',
      attribution: 'Swedish Meteorological and Hydrological Institute',
      url: 'https://opendata.smhi.se'
    },
    {
      name: 'Sentinel-3 OLCI',
      type: 'satellite',
      variables: ['chlorophyll', 'sst', 'water_clarity'],
      update_frequency: '3 days',
      last_update: '1d ago',
      quality: 'good',
      license: 'Free and open',
      attribution: 'European Space Agency / Copernicus',
      url: 'https://dataspace.copernicus.eu'
    },
    {
      name: 'EMODnet Physics',
      type: 'analysis',
      variables: ['temperature', 'salinity', 'currents'],
      update_frequency: 'Monthly',
      last_update: '5d ago',
      quality: 'good',
      license: 'Free for all uses',
      attribution: 'European Marine Observation and Data Network',
      url: 'https://emodnet.eu'
    },
    {
      name: 'HELCOM',
      type: 'analysis',
      variables: ['ecosystem_status', 'eutrophication'],
      update_frequency: 'Annual',
      last_update: '30d ago',
      quality: 'warning',
      license: 'Open data',
      attribution: 'Helsinki Commission',
      url: 'https://helcom.fi'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'satellite': return <Satellite className="h-4 w-4" />;
      case 'model': return <Globe className="h-4 w-4" />;
      case 'gauge': return <Waves className="h-4 w-4" />;
      case 'analysis': return <Database className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'satellite': return 'bg-primary/10 text-primary';
      case 'model': return 'bg-secondary/10 text-secondary-foreground';
      case 'gauge': return 'bg-success/10 text-success';
      case 'analysis': return 'bg-warning/10 text-warning';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Provenance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="p-4 space-y-4">
            {dataSources.map((source, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(source.type)}
                    <div>
                      <h4 className="font-medium text-sm text-foreground">
                        {source.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {source.attribution}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={getQualityColor(source.quality)} variant="secondary">
                      {source.quality}
                    </Badge>
                    {source.url && (
                      <ExternalLink 
                        className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() => window.open(source.url, '_blank')}
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(source.type)} variant="outline">
                    {source.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {source.license}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{source.update_frequency}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Updated: {source.last_update}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {source.variables.map((variable, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {variable.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                
                {index < dataSources.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Attribution Notice</p>
              <p>
                This dashboard uses open marine data. All data sources maintain their original 
                licenses and attributions. Processing includes regridding to 0.02° resolution 
                and anomaly calculation vs 2000-2020 climatology.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligenceProvenance;