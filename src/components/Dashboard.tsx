import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Waves, Ship, Fish, Thermometer, Wind } from "lucide-react";
import AIInsights from "./AIInsights";
import DataSourceStatus from "./DataSourceStatus";
import StrategicReports from "./StrategicReports";
import BalticSeaMap from "./BalticSeaMap";
import ShippingInsights from "./ShippingInsights";
import InteractiveMetricCard from "./InteractiveMetricCard";
import InteractiveDataViz from "./InteractiveDataViz";
import DataExplorer from "./DataExplorer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [indicators, setIndicators] = useState([
    {
      title: "Oxygen Levels",
      value: "7.2 mg/L",
      change: -2.1,
      trend: "down" as const,
      icon: Activity,
      color: "text-destructive",
      status: "critical" as const
    },
    {
      title: "Sea Temperature",
      value: "14.8°C",
      change: +1.3,
      trend: "up" as const,
      icon: Thermometer,
      color: "text-secondary",
      status: "good" as const
    },
    {
      title: "Shipping Intensity",
      value: "2,847",
      change: +12.5,
      trend: "up" as const,
      icon: Ship,
      color: "text-primary",
      status: "warning" as const
    },
    {
      title: "Fish Stock Index",
      value: "0.67",
      change: -8.3,
      trend: "down" as const,
      icon: Fish,
      color: "text-accent",
      status: "warning" as const
    },
    {
      title: "Wave Height",
      value: "1.2m",
      change: +0.3,
      trend: "up" as const,
      icon: Waves,
      color: "text-secondary",
      status: "good" as const
    },
    {
      title: "Wind Speed",
      value: "8.5 m/s",
      change: -1.2,
      trend: "down" as const,
      icon: Wind,
      color: "text-muted-foreground",
      status: "excellent" as const
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-dashboard-data');
        
        if (error) throw error;
        
        if (data && data.indicators) {
          const formattedIndicators = data.indicators.map((item: any) => ({
            title: item.title,
            value: item.value,
            change: item.change,
            trend: item.trend,
            icon: getIconComponent(item.icon),
            color: item.color,
            status: item.status
          }));
          
          setIndicators(formattedIndicators);
          
          if (data.dataSource === 'realtime') {
            toast({
              title: "Data Updated",
              description: "Real-time Baltic Sea data loaded successfully",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Using Mock Data",
          description: "Real-time data unavailable, showing sample data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Activity,
      Thermometer,
      Ship,
      Fish,
      Waves,
      Wind
    };
    return iconMap[iconName] || Activity;
  };

  return (
    <section id="dashboard-section" className="py-24 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {isLoading ? 'Loading Data...' : 'Live Dashboard'}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Baltic Sea <span className="text-primary">Key Indicators</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Real-time monitoring of critical marine parameters from Copernicus, HELCOM, SMHI, AIS, and ICES data sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {indicators.map((indicator, index) => (
            <InteractiveMetricCard
              key={index}
              metric={indicator}
              onExplore={() => console.log('Exploring', indicator.title)}
            />
          ))}
        </div>

        {/* Interactive Map */}
        <div className="mb-12">
          <BalticSeaMap />
        </div>

        {/* Interactive Data Flow Visualization */}
        <div className="mb-12">
          <InteractiveDataViz marineData={indicators} />
        </div>

        {/* Data Explorer */}
        <div className="mb-12">
          <DataExplorer marineData={indicators} />
        </div>

        {/* Integrated Maritime Intelligence */}
        <div className="mt-12">
          <ShippingInsights />
        </div>

        {/* AI Insights Section */}
        <div className="mt-12">
          <AIInsights marineData={indicators} />
        </div>

        {/* Data Sources Status */}
        <div className="mt-12">
          <DataSourceStatus />
        </div>

        {/* Strategic Reports */}
        <div className="mt-12">
          <StrategicReports />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
