import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Info, 
  AlertCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface MetricData {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  status: 'critical' | 'warning' | 'good' | 'excellent';
}

interface InteractiveMetricCardProps {
  metric: MetricData;
  historicalData?: number[];
  onExplore?: () => void;
}

const InteractiveMetricCard: React.FC<InteractiveMetricCardProps> = ({
  metric,
  historicalData = [],
  onExplore
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const Icon = metric.icon;
  const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

  // Generate mock historical data if not provided
  const mockHistoricalData = historicalData.length > 0 
    ? historicalData 
    : Array.from({ length: 24 }, (_, i) => {
        const baseValue = parseFloat(metric.value.replace(/[^0-9.-]/g, '')) || 0;
        return baseValue + (Math.random() - 0.5) * baseValue * 0.2;
      });

  const getStatusDetails = (status: string): {
    color: 'destructive' | 'secondary' | 'default' | 'outline';
    description: string;
    icon: any;
    bgColor: string;
  } => {
    switch (status) {
      case 'critical':
        return {
          color: 'destructive' as const,
          description: 'Immediate attention required',
          icon: AlertCircle,
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'warning':
        return {
          color: 'secondary' as const,
          description: 'Monitor closely',
          icon: Info,
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
      case 'good':
        return {
          color: 'default' as const,
          description: 'Within normal range',
          icon: Target,
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'excellent':
        return {
          color: 'outline' as const,
          description: 'Optimal conditions',
          icon: Zap,
          bgColor: 'bg-green-50 border-green-200'
        };
      default:
        return {
          color: 'outline' as const,
          description: 'Status unknown',
          icon: Info,
          bgColor: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const statusDetails = getStatusDetails(metric.status);
  const StatusIcon = statusDetails.icon;

  const chartPoints = mockHistoricalData.map((value, index) => ({
    x: (index / mockHistoricalData.length) * 100,
    y: 100 - ((value - Math.min(...mockHistoricalData)) / 
             (Math.max(...mockHistoricalData) - Math.min(...mockHistoricalData))) * 100
  }));

  const pathData = `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  if (!isExpanded) {
    return (
      <Card 
        className="hover:shadow-tech transition-all duration-300 border-primary/20 bg-gradient-dark-panel shadow-panel cursor-pointer group"
        onClick={() => setIsExpanded(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${metric.color === 'text-destructive' ? 'text-destructive' : 
                                       metric.color === 'text-secondary' ? 'text-secondary' :
                                       metric.color === 'text-primary' ? 'text-primary' :
                                       metric.color === 'text-accent' ? 'text-accent' : 'text-primary'}`} />
            <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1 text-foreground">{metric.value}</div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center text-sm ${
                  metric.trend === "up" ? "text-accent" : "text-destructive"
                }`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
                <Badge variant={statusDetails.color} className="text-xs capitalize">
                  {metric.status}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Mini chart preview */}
          <div className="mt-4 h-8 w-full bg-muted rounded overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d={pathData}
                fill="none"
                stroke={metric.trend === 'up' ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}
                strokeWidth="2"
                className="opacity-60"
              />
            </svg>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 group-hover:text-accent transition-colors">
            Click to explore detailed analytics →
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-investment transition-all duration-300 border-primary/20 bg-gradient-dark-panel shadow-panel">
      <CardHeader className={`${statusDetails.bgColor.includes('red') ? 'bg-gradient-danger' :
                                        statusDetails.bgColor.includes('yellow') ? 'bg-gradient-tech' :
                                        statusDetails.bgColor.includes('blue') ? 'bg-gradient-chart' :
                                        statusDetails.bgColor.includes('green') ? 'bg-gradient-success' :
                                        'bg-gradient-dark-panel'} rounded-t-lg border-b border-border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
              <Icon className={`h-6 w-6 ${metric.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{metric.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm text-gray-600">{statusDetails.description}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Current Value</h4>
                <p className="text-3xl font-bold text-primary">{metric.value}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">24h Change</h4>
                <div className={`flex items-center text-xl font-semibold ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendIcon className="w-5 h-5 mr-1" />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Status Health</h4>
              <div className="flex items-center space-x-2">
                <Progress value={
                  metric.status === 'excellent' ? 95 :
                  metric.status === 'good' ? 75 :
                  metric.status === 'warning' ? 50 : 25
                } className="flex-1" />
                <Badge variant={statusDetails.color}>{metric.status}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-600">Last Updated</p>
                <p className="text-sm font-medium">2 mins ago</p>
              </div>
              <div className="text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-600">Data Quality</p>
                <p className="text-sm font-medium">98.5%</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Historical Trends</h4>
              <div className="flex space-x-1">
                {['1h', '24h', '7d', '30d'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="h-48 w-full bg-gray-50 rounded-lg p-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={metric.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0.3"/>
                    <stop offset="100%" stopColor={metric.trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d={`${pathData} L 100 100 L 0 100 Z`}
                  fill="url(#chartGradient)"
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke={metric.trend === 'up' ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                />
                {chartPoints.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="1"
                    fill={metric.trend === 'up' ? '#10b981' : '#ef4444'}
                  />
                ))}
              </svg>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Min Value</p>
                <p className="font-medium">{Math.min(...mockHistoricalData).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Average</p>
                <p className="font-medium">{(mockHistoricalData.reduce((a, b) => a + b, 0) / mockHistoricalData.length).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Max Value</p>
                <p className="font-medium">{Math.max(...mockHistoricalData).toFixed(1)}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-1">Pattern Analysis</h5>
                <p className="text-sm text-blue-800">
                  {metric.trend === 'up' 
                    ? `${metric.title} shows an upward trend, indicating improving conditions or increased activity.`
                    : `${metric.title} shows a downward trend, which may require attention or indicate changing conditions.`
                  }
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-900 mb-1">AI Prediction</h5>
                <p className="text-sm text-purple-800">
                  Based on current trends and historical patterns, values are expected to {
                    metric.trend === 'up' ? 'continue rising' : 'stabilize'
                  } over the next 24-48 hours.
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-900 mb-1">Recommendations</h5>
                <p className="text-sm text-green-800">
                  {metric.status === 'critical' 
                    ? 'Immediate monitoring and intervention may be required.'
                    : metric.status === 'warning'
                    ? 'Continue monitoring and prepare response protocols if needed.'
                    : 'Current conditions are stable. Maintain regular monitoring schedule.'
                  }
                </p>
              </div>
            </div>
            
            {onExplore && (
              <Button onClick={onExplore} className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Explore Full Analytics
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InteractiveMetricCard;