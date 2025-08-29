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
    <section id="dashboard-section" className="py-24 bg-gradient-tech min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-gradient-investment text-black font-medium border-primary/20">
            {isLoading ? 'Loading Data...' : 'Live Dashboard'}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-investment bg-clip-text text-transparent">
            Baltic Sea Intelligence Hub
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Real-time monitoring and analytics from Copernicus, HELCOM, SMHI, AIS, and ICES data sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {indicators.map((indicator, index) => (
            <div key={index} className="transform transition-all duration-300 hover:scale-105">
              <InteractiveMetricCard
                metric={indicator}
                onExplore={() => console.log('Exploring', indicator.title)}
              />
            </div>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="mb-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <BalticSeaMap />
          </div>
        </div>

        {/* Interactive Data Flow Visualization */}
        <div className="mb-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <InteractiveDataViz marineData={indicators} />
          </div>
        </div>

        {/* Data Explorer */}
        <div className="mb-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <DataExplorer marineData={indicators} />
          </div>
        </div>

        {/* Integrated Maritime Intelligence */}
        <div className="mt-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <ShippingInsights />
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="mt-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <AIInsights marineData={indicators} />
          </div>
        </div>

        {/* Data Sources Status */}
        <div className="mt-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <DataSourceStatus />
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-6 shadow-panel border border-primary/20">
            <h3 className="text-xl font-bold mb-4 text-foreground">Platform Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => window.location.href = '/port-agent'}
                className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7 7V5" />
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">Port Agent Services</span>
                </div>
                <p className="text-sm text-muted-foreground">Comprehensive port operations management</p>
              </button>
              
              <button 
                onClick={() => window.location.href = '/intelligence'}
                className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">Intelligence Hub</span>
                </div>
                <p className="text-sm text-muted-foreground">AI-powered maritime intelligence and analytics</p>
              </button>
              
              <button 
                onClick={() => window.location.href = '/shadow-fleet'}
                className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">Security Monitoring</span>
                </div>
                <p className="text-sm text-muted-foreground">Shadow fleet detection and threat analysis</p>
              </button>
            </div>
          </div>
        </div>

        {/* Strategic Reports */}
        <div className="mt-12">
          <div className="bg-gradient-dark-panel rounded-2xl p-1 shadow-panel">
            <StrategicReports />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
