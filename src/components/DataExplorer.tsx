import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MapPin,
  Layers,
  Search
} from 'lucide-react';

interface DataExplorerProps {
  marineData: any[];
}

const DataExplorer: React.FC<DataExplorerProps> = ({ marineData }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['all']);
  const [thresholdFilter, setThresholdFilter] = useState([0, 100]);
  const [showTrendOnly, setShowTrendOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('grid');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Filter and process data based on current filters
  const filteredData = useMemo(() => {
    let filtered = [...marineData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Metric selection filter
    if (!selectedMetrics.includes('all')) {
      filtered = filtered.filter(item => 
        selectedMetrics.some(metric => item.title.includes(metric))
      );
    }

    // Trend filter
    if (showTrendOnly) {
      filtered = filtered.filter(item => 
        Math.abs(item.change) > 5 // Only items with significant change
      );
    }

    return filtered;
  }, [marineData, searchQuery, selectedMetrics, showTrendOnly]);

  const metrics = ['Temperature', 'Oxygen', 'Shipping', 'Fish', 'Wave', 'Wind'];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateMockTimeSeries = (baseValue: number) => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h ago`,
      value: baseValue + (Math.random() - 0.5) * baseValue * 0.3
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Interactive Data Explorer
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Explore, filter, and analyze marine data with advanced tools
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="filter">Advanced Filter</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore" className="space-y-6">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Label htmlFor="search">Search:</Label>
                <Input
                  id="search"
                  placeholder="Search metrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label>Time Range:</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7d</SelectItem>
                    <SelectItem value="30d">30d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label>View:</Label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="trend-filter"
                  checked={showTrendOnly}
                  onCheckedChange={setShowTrendOnly}
                />
                <Label htmlFor="trend-filter">Significant Changes Only</Label>
              </div>
            </div>
            
            {/* Data Grid */}
            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-primary">
                          {item.value}
                        </div>
                        
                        <div className={`flex items-center text-sm ${
                          item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                          {item.change > 0 ? '+' : ''}{item.change}% ({timeRange})
                        </div>
                        
                        {/* Mini sparkline */}
                        <div className="h-8 bg-gray-100 rounded relative overflow-hidden">
                          <div className="absolute inset-0 flex items-end justify-between px-1">
                            {Array.from({ length: 12 }, (_, i) => (
                              <div 
                                key={i}
                                className={`w-1 ${item.trend === 'up' ? 'bg-green-400' : 'bg-red-400'} rounded-sm`}
                                style={{ 
                                  height: `${20 + Math.random() * 60}%`,
                                  opacity: 0.3 + (i / 12) * 0.7
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        
                         <div className="flex justify-between text-xs text-gray-500">
                           <span>Updated: 2m ago</span>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-6 px-2 hover:text-primary"
                             onClick={() => {
                               // For now, scroll to dashboard section for detailed analytics
                               const dashboardSection = document.getElementById('dashboard-section');
                               if (dashboardSection) {
                                 dashboardSection.scrollIntoView({ 
                                   behavior: 'smooth',
                                   block: 'start'
                                 });
                               }
                             }}
                           >
                             Details →
                           </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewType === 'list' && (
              <div className="space-y-2">
                {filteredData.map((item, index) => (
                  <Card key={index} className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold">{item.title}</div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-xl font-bold">{item.value}</div>
                          <div className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Chart View */}
            {viewType === 'chart' && (
              <div className="space-y-6">
                {filteredData.slice(0, 3).map((item, index) => {
                  const timeSeries = generateMockTimeSeries(parseFloat(item.value.replace(/[^0-9.-]/g, '')) || 0);
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {item.title}
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-gray-50 rounded p-4 mb-4">
                          <div className="flex items-end justify-between h-full">
                            {timeSeries.slice(-12).map((point, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div 
                                  className={`w-4 ${item.trend === 'up' ? 'bg-green-400' : 'bg-red-400'} rounded-sm mb-1`}
                                  style={{ 
                                    height: `${(point.value / Math.max(...timeSeries.map(p => p.value))) * 80}px` 
                                  }}
                                />
                                <span className="text-xs text-gray-500 -rotate-45">
                                  {i * 2}h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Current</p>
                            <p className="font-semibold">{item.value}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Change</p>
                            <p className={`font-semibold ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-semibold capitalize">{item.status}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="filter" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Metric Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['all', ...metrics].map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={metric}
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (metric === 'all') {
                              setSelectedMetrics(['all']);
                            } else {
                              setSelectedMetrics(prev => 
                                prev.filter(m => m !== 'all').concat(metric)
                              );
                            }
                          } else {
                            setSelectedMetrics(prev => prev.filter(m => m !== metric));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={metric} className="capitalize">
                        {metric} {metric === 'all' ? 'Metrics' : ''}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['critical', 'warning', 'good', 'excellent'].map((status) => (
                    <div key={status} className="flex items-center justify-between">
                      <Label className="capitalize">{status}</Label>
                      <Badge className={getStatusColor(status)}>
                        {filteredData.filter(item => item.status === status).length}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Threshold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Show items with change between {thresholdFilter[0]}% and {thresholdFilter[1]}%</Label>
                  <Slider
                    value={thresholdFilter}
                    onValueChange={setThresholdFilter}
                    max={100}
                    min={-100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>-100%</span>
                    <span>0%</span>
                    <span>+100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-6">
            <div className="text-center py-8">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Comparison Tools</h3>
              <p className="text-gray-600 mb-4">
                Compare multiple metrics side-by-side to identify correlations and patterns
              </p>
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Start Comparison
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="space-y-6">
            <div className="text-center py-8">
              <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Deep dive analysis with correlation matrices, regression analysis, and predictive modeling
              </p>
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Results Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                Showing {filteredData.length} of {marineData.length} metrics
              </h4>
              <p className="text-sm text-blue-700">
                Filtered by: {searchQuery ? `"${searchQuery}"` : 'No search'}, 
                {selectedMetrics.includes('all') ? 'All metrics' : `${selectedMetrics.length} selected`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('');
              setSelectedMetrics(['all']);
              setShowTrendOnly(false);
            }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExplorer;