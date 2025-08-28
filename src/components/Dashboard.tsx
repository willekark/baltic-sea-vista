import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Waves, Ship, Fish, Thermometer, Wind } from "lucide-react";
import AIInsights from "./AIInsights";
import DataSourceStatus from "./DataSourceStatus";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
    <section className="py-24 bg-gradient-subtle">
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
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            const TrendIcon = indicator.trend === "up" ? TrendingUp : TrendingDown;
            
            return (
              <Card key={index} className="hover:shadow-surface transition-all duration-300 border-0 shadow-ocean">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {indicator.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${indicator.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-1">{indicator.value}</div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center text-sm ${
                          indicator.trend === "up" ? "text-secondary" : "text-destructive"
                        }`}>
                          <TrendIcon className="w-4 h-4 mr-1" />
                          {indicator.change > 0 ? '+' : ''}{indicator.change}%
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {indicator.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Map Preview */}
        <Card className="shadow-depth border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Baltic Sea Monitoring Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-ocean rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-medium">Interactive Map Visualization</p>
                <p className="text-sm opacity-80">Real-time monitoring stations and data points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        <div className="mt-12">
          <AIInsights marineData={indicators} />
        </div>

        {/* Data Sources Status */}
        <div className="mt-12">
          <DataSourceStatus />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;