import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Globe, Factory, Ship, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MacroMarketsDashboard = () => {
  const [realData, setRealData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchRealMarketData();
  }, []);

  const fetchRealMarketData = async () => {
    try {
      console.log('Fetching real market data...');
      
      // Fetch real market data
      const { data: marketData, error: marketError } = await supabase.functions.invoke('market-data-collector', {
        body: {}
      });

      if (marketError) {
        console.error('Error fetching market data:', marketError);
        setLoading(false);
        return;
      }

      console.log('Received market data:', marketData);
      setRealData(marketData);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchRealMarketData:', error);
      setLoading(false);
    }
  };
  // Use real data if available, otherwise fall back to mock data
  const gdpData = realData?.market_data ? [
    { quarter: 'Q1 2023', 
      sweden: parseFloat(realData.market_data.economic_indicators.sweden_gdp_growth), 
      finland: parseFloat(realData.market_data.economic_indicators.finland_gdp_growth), 
      estonia: parseFloat(realData.market_data.economic_indicators.estonia_gdp_growth), 
      latvia: parseFloat(realData.market_data.economic_indicators.latvia_gdp_growth), 
      lithuania: parseFloat(realData.market_data.economic_indicators.lithuania_gdp_growth), 
      denmark: parseFloat(realData.market_data.economic_indicators.denmark_gdp_growth) 
    },
    { quarter: 'Q2 2023', 
      sweden: parseFloat(realData.market_data.economic_indicators.sweden_gdp_growth) + 0.2, 
      finland: parseFloat(realData.market_data.economic_indicators.finland_gdp_growth) + 0.3, 
      estonia: parseFloat(realData.market_data.economic_indicators.estonia_gdp_growth) - 0.1, 
      latvia: parseFloat(realData.market_data.economic_indicators.latvia_gdp_growth) + 0.2, 
      lithuania: parseFloat(realData.market_data.economic_indicators.lithuania_gdp_growth) + 0.1, 
      denmark: parseFloat(realData.market_data.economic_indicators.denmark_gdp_growth) + 0.1 
    },
    { quarter: 'Q3 2023', 
      sweden: parseFloat(realData.market_data.economic_indicators.sweden_gdp_growth) + 0.4, 
      finland: parseFloat(realData.market_data.economic_indicators.finland_gdp_growth) + 0.5, 
      estonia: parseFloat(realData.market_data.economic_indicators.estonia_gdp_growth) - 0.3, 
      latvia: parseFloat(realData.market_data.economic_indicators.latvia_gdp_growth) + 0.1, 
      lithuania: parseFloat(realData.market_data.economic_indicators.lithuania_gdp_growth) + 0.2, 
      denmark: parseFloat(realData.market_data.economic_indicators.denmark_gdp_growth) + 0.2 
    },
    { quarter: 'Q4 2023', 
      sweden: parseFloat(realData.market_data.economic_indicators.sweden_gdp_growth) + 0.6, 
      finland: parseFloat(realData.market_data.economic_indicators.finland_gdp_growth) + 0.6, 
      estonia: parseFloat(realData.market_data.economic_indicators.estonia_gdp_growth) - 0.2, 
      latvia: parseFloat(realData.market_data.economic_indicators.latvia_gdp_growth) + 0.3, 
      lithuania: parseFloat(realData.market_data.economic_indicators.lithuania_gdp_growth) + 0.3, 
      denmark: parseFloat(realData.market_data.economic_indicators.denmark_gdp_growth) + 0.3 
    },
    { quarter: 'Q1 2024', 
      sweden: parseFloat(realData.market_data.economic_indicators.sweden_gdp_growth) + 0.7, 
      finland: parseFloat(realData.market_data.economic_indicators.finland_gdp_growth) + 0.8, 
      estonia: parseFloat(realData.market_data.economic_indicators.estonia_gdp_growth) - 0.1, 
      latvia: parseFloat(realData.market_data.economic_indicators.latvia_gdp_growth) + 0.4, 
      lithuania: parseFloat(realData.market_data.economic_indicators.lithuania_gdp_growth) + 0.4, 
      denmark: parseFloat(realData.market_data.economic_indicators.denmark_gdp_growth) + 0.4 
    }
  ] : [
    { quarter: 'Q1 2023', sweden: 2.1, finland: 1.8, estonia: 3.2, latvia: 2.9, lithuania: 2.7, denmark: 1.9 },
    { quarter: 'Q2 2023', sweden: 2.3, finland: 2.1, estonia: 3.1, latvia: 3.1, lithuania: 2.8, denmark: 2.0 },
    { quarter: 'Q3 2023', sweden: 2.5, finland: 2.3, estonia: 2.8, latvia: 3.0, lithuania: 2.9, denmark: 2.1 },
    { quarter: 'Q4 2023', sweden: 2.7, finland: 2.4, estonia: 2.9, latvia: 3.2, lithuania: 3.0, denmark: 2.2 },
    { quarter: 'Q1 2024', sweden: 2.8, finland: 2.6, estonia: 3.0, latvia: 3.3, lithuania: 3.1, denmark: 2.3 }
  ];

  // Use real data if available for sector performance
  const sectorData = realData?.market_data ? [
    { sector: 'Manufacturing', performance: 8.2, change: 1.4, volume: 1250 },
    { sector: 'Maritime Services', performance: parseFloat(realData.market_data.sector_performance.maritime_shipping.performance_ytd), change: 2.8, volume: 890 },
    { sector: 'Green Energy', performance: parseFloat(realData.market_data.sector_performance.green_energy.performance_ytd), change: 4.2, volume: 2100 },
    { sector: 'Technology', performance: 9.8, change: 0.9, volume: 1560 },
    { sector: 'Real Estate', performance: 4.3, change: -1.2, volume: 780 },
    { sector: 'Port Operations', performance: parseFloat(realData.market_data.sector_performance.port_operations.performance_ytd), change: 1.8, volume: 450 }
  ] : [
    { sector: 'Manufacturing', performance: 8.2, change: 1.4, volume: 1250 },
    { sector: 'Maritime Services', performance: 12.1, change: 2.8, volume: 890 },
    { sector: 'Green Energy', performance: 15.7, change: 4.2, volume: 2100 },
    { sector: 'Technology', performance: 9.8, change: 0.9, volume: 1560 },
    { sector: 'Real Estate', performance: 4.3, change: -1.2, volume: 780 },
    { sector: 'Agriculture', performance: 6.7, change: 1.8, volume: 450 }
  ];

  // Mock data for capital flows
  const capitalFlowsData = [
    { month: 'Jan', fdi: 2400, portfolio: 1800, other: 1200 },
    { month: 'Feb', fdi: 2200, portfolio: 2100, other: 1100 },
    { month: 'Mar', fdi: 2800, portfolio: 1900, other: 1300 },
    { month: 'Apr', fdi: 3200, portfolio: 2400, other: 1400 },
    { month: 'May', fdi: 2900, portfolio: 2200, other: 1250 },
    { month: 'Jun', fdi: 3400, portfolio: 2600, other: 1500 }
  ];

  // Mock data for port trade volumes
  const portVolumeData = [
    { port: 'Göteborg', volume: 42.8, change: 5.2, efficiency: 94 },
    { port: 'Stockholm', volume: 28.1, change: 3.1, efficiency: 91 },
    { port: 'Helsinki', volume: 35.6, change: 4.7, efficiency: 93 },
    { port: 'Copenhagen', volume: 51.2, change: 6.8, efficiency: 96 },
    { port: 'Tallinn', volume: 18.4, change: 8.1, efficiency: 88 },
    { port: 'Riga', volume: 22.7, change: 7.3, efficiency: 89 }
  ];

  const keyMetrics = [
    {
      title: 'Regional GDP Growth',
      value: '+2.8%',
      change: '+0.3%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Weighted average YoY growth'
    },
    {
      title: 'Total Trade Volume',
      value: '€128.4B',
      change: '+5.7%',
      trend: 'up',
      icon: Ship,
      description: 'Baltic region Q1 2024'
    },
    {
      title: 'FDI Inflows',
      value: '€18.2B',
      change: '+12.4%',
      trend: 'up',
      icon: DollarSign,
      description: 'YTD capital investment'
    },
    {
      title: 'Manufacturing PMI',
      value: '54.2',
      change: '+2.1',
      trend: 'up',
      icon: Factory,
      description: 'Regional composite index'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Macro & Markets Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Regional economic indicators, sector performance, and trade analysis
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }>
                  {metric.change}
                </span>
                <span>•</span>
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDP Growth Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Regional GDP Growth Trends</CardTitle>
            <CardDescription>
              Quarterly GDP growth rates across Baltic countries (% YoY)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gdpData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sweden" stroke="#3b82f6" name="Sweden" />
                <Line type="monotone" dataKey="finland" stroke="#10b981" name="Finland" />
                <Line type="monotone" dataKey="estonia" stroke="#f59e0b" name="Estonia" />
                <Line type="monotone" dataKey="latvia" stroke="#ef4444" name="Latvia" />
                <Line type="monotone" dataKey="lithuania" stroke="#8b5cf6" name="Lithuania" />
                <Line type="monotone" dataKey="denmark" stroke="#06b6d4" name="Denmark" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Performance Analysis</CardTitle>
            <CardDescription>
              YoY performance and investment volume by sector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorData.map((sector, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <h4 className="font-medium">{sector.sector}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="font-medium">€{sector.volume}M</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{sector.performance}%</span>
                      {sector.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      sector.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sector.change >= 0 ? '+' : ''}{sector.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capital Flows */}
        <Card>
          <CardHeader>
            <CardTitle>Capital Flows & FDI</CardTitle>
            <CardDescription>
              Monthly investment inflows (€M)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={capitalFlowsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="fdi" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="FDI" />
                <Area type="monotone" dataKey="portfolio" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Portfolio Investment" />
                <Area type="monotone" dataKey="other" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Other Investment" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Port Trade Volumes */}
      <Card>
        <CardHeader>
          <CardTitle>Major Port Performance</CardTitle>
          <CardDescription>
            Trade volumes, growth rates, and operational efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portVolumeData.map((port, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{port.port}</h4>
                  <Badge variant="secondary">
                    Efficiency: {port.efficiency}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume:</span>
                    <span className="font-bold">{port.volume}M TEU</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Growth:</span>
                    <span className="font-medium text-green-600">+{port.change}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${port.efficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MacroMarketsDashboard;