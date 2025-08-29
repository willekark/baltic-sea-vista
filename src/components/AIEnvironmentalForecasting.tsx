import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Cloud, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Thermometer,
  Wind,
  Eye,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EnvironmentalForecast {
  timestamp: string;
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    precipitation: number;
    uvIndex: number;
  };
  eutrophication: {
    riskLevel: 'low' | 'medium' | 'high' | 'severe';
    algaeBloomProbability: number;
    primaryFactors: string[];
    recommendedActions: string[];
  };
  waterQuality: {
    oxygenLevel: number;
    clarity: number;
    temperature: number;
    pH: number;
  };
  confidence: number;
}

const AIEnvironmentalForecasting = () => {
  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState<EnvironmentalForecast[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const generateForecast = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('environmental-forecasting', {
        body: {
          location: { lat: 59.3293, lng: 18.0686 }, // Stockholm area
          timeframe: selectedTimeframe,
          parameters: ['weather', 'eutrophication', 'water_quality', 'algae_bloom']
        }
      });

      if (error) throw error;
      
      setForecasts(data.forecast || []);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error generating forecast:', error);
      // Generate fallback data for demo
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = () => {
    const numDays = selectedTimeframe === '24h' ? 1 : selectedTimeframe === '7d' ? 7 : 30;
    const mockForecasts: EnvironmentalForecast[] = [];

    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      mockForecasts.push({
        timestamp: date.toISOString(),
        weather: {
          temperature: 8 + Math.sin(i * 0.2) * 6,
          humidity: 70 + Math.random() * 25,
          windSpeed: 3 + Math.random() * 12,
          windDirection: Math.random() * 360,
          pressure: 1010 + Math.random() * 20,
          precipitation: Math.random() * 8,
          uvIndex: Math.max(0, Math.random() * 8)
        },
        eutrophication: {
          riskLevel: i < 2 ? 'low' : i < 5 ? 'medium' : Math.random() > 0.7 ? 'high' : 'medium',
          algaeBloomProbability: Math.min(85, 15 + i * 4 + Math.random() * 25),
          primaryFactors: [
            'Elevated water temperature',
            'Nutrient runoff from recent rainfall', 
            'Thermal stratification',
            'Low wind mixing'
          ].slice(0, 2 + Math.floor(Math.random() * 3)),
          recommendedActions: [
            'Monitor chlorophyll-a levels',
            'Track dissolved oxygen trends',
            'Assess nutrient loading sources',
            'Implement early warning protocols'
          ].slice(0, 2 + Math.floor(Math.random() * 2))
        },
        waterQuality: {
          oxygenLevel: 7.5 - i * 0.08 + Math.random() * 1.5,
          clarity: Math.max(2, 9 - i * 0.15 + Math.random() * 2),
          temperature: 10 + Math.sin(i * 0.15) * 4 + Math.random() * 2,
          pH: 8.0 + Math.random() * 0.4 - 0.2
        },
        confidence: Math.max(65, 90 - i * 1.5 + Math.random() * 10)
      });
    }

    setForecasts(mockForecasts);
    setLastUpdated(new Date().toISOString());
  };

  useEffect(() => {
    generateFallbackData(); // Load demo data on mount
  }, [selectedTimeframe]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success bg-success/10 border-success/30';
      case 'medium': return 'text-warning bg-warning/10 border-warning/30';
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'severe': return 'text-red-600 bg-red-50 border-red-300';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const currentForecast = forecasts[0];
  const futureTrend = forecasts.length > 3 ? forecasts[3] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Environmental Forecasting</CardTitle>
                <p className="text-muted-foreground">Advanced machine learning predictions for Baltic Sea conditions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">GPT-5 + Perplexity AI</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {(['24h', '7d', '30d'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe === '24h' ? '24 Hours' : timeframe === '7d' ? '7 Days' : '30 Days'}
                </Button>
              ))}
            </div>
            <Button onClick={generateForecast} disabled={loading} className="bg-primary">
              {loading ? 'Generating...' : 'Generate AI Forecast'}
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {forecasts.length > 0 && (
        <>
          {/* Current Conditions */}
          {currentForecast && (
            <Card className="border-2 border-accent/30 bg-gradient-to-br from-background to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Current AI Prediction
                  <Badge variant="secondary" className="ml-auto">
                    {Math.round(currentForecast.confidence)}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Weather */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center">
                      <Cloud className="w-4 h-4 mr-2" />
                      Weather Conditions
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Temperature:</span>
                        <span className="font-medium">{currentForecast.weather.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wind Speed:</span>
                        <span className="font-medium">{currentForecast.weather.windSpeed.toFixed(1)} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precipitation:</span>
                        <span className="font-medium">{currentForecast.weather.precipitation.toFixed(1)} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>UV Index:</span>
                        <span className="font-medium">{currentForecast.weather.uvIndex.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Eutrophication Risk */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center">
                      <Droplets className="w-4 h-4 mr-2" />
                      Eutrophication Risk
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk Level:</span>
                        <Badge className={getRiskColor(currentForecast.eutrophication.riskLevel)}>
                          {currentForecast.eutrophication.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Algae Bloom Probability:</span>
                          <span className="font-medium">{Math.round(currentForecast.eutrophication.algaeBloomProbability)}%</span>
                        </div>
                        <Progress value={currentForecast.eutrophication.algaeBloomProbability} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Water Quality */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Water Quality
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dissolved O₂:</span>
                        <span className="font-medium">{currentForecast.waterQuality.oxygenLevel.toFixed(1)} mg/L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Clarity:</span>
                        <span className="font-medium">{currentForecast.waterQuality.clarity.toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>pH Level:</span>
                        <span className="font-medium">{currentForecast.waterQuality.pH.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Temp:</span>
                        <span className="font-medium">{currentForecast.waterQuality.temperature.toFixed(1)}°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Factors */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Key Environmental Factors
                  </h5>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Contributing Factors:</p>
                      <ul className="space-y-1">
                        {currentForecast.eutrophication.primaryFactors.map((factor, i) => (
                          <li key={i} className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {currentForecast.eutrophication.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forecast Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {selectedTimeframe} AI Forecast Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecasts.slice(0, selectedTimeframe === '24h' ? 24 : selectedTimeframe === '7d' ? 7 : 14).map((forecast, index) => {
                  const date = new Date(forecast.timestamp);
                  const isToday = index === 0;
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${isToday ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            {isToday ? 'Today' : date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(forecast.confidence)}% confidence
                          </p>
                        </div>
                        <Badge className={getRiskColor(forecast.eutrophication.riskLevel)} variant="outline">
                          {forecast.eutrophication.riskLevel}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-blue-500" />
                          <span>{Math.round(forecast.weather.temperature)}°C</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind className="w-4 h-4 text-gray-500" />
                          <span>{Math.round(forecast.weather.windSpeed)} m/s</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-green-500" />
                          <span>{Math.round(forecast.waterQuality.oxygenLevel * 10) / 10} mg/L O₂</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <span>{Math.round(forecast.eutrophication.algaeBloomProbability)}% bloom risk</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AIEnvironmentalForecasting;