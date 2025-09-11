import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMunicipalEnergy, useMunicipalSectorShare, useMunicipalPeaks } from '@/hooks/useMunicipalData';

const TabMunicipal = () => {
  const [selectedGeoId] = useState('SE0114'); // Upplands Väsby as default
  const [selectedCountry] = useState('SE'); // Sweden as default
  
  const { data: energyData, loading: energyLoading, error: energyError } = useMunicipalEnergy(selectedGeoId, '2019-2024');
  const { data: sectorData, loading: sectorLoading, error: sectorError } = useMunicipalSectorShare(selectedGeoId, '2019-2024');
  const { data: peakData, loading: peakLoading, error: peakError } = useMunicipalPeaks(selectedGeoId);

  // Process data for charts
  const latestYear = Math.max(...energyData.map(item => item.year));
  const latestYearData = energyData.filter(item => item.year === latestYear);
  
  // Sector colors
  const sectorColors = {
    households: '#8B5CF6',
    industry: '#EF4444',
    transport: '#10B981',
    services: '#3B82F6',
    dh_losses: '#F59E0B'
  };

  // Heat/Electricity share data
  const heatElecData = latestYearData.map(item => ({
    sector: item.sector,
    heat_share: item.heat_share_pct || 0,
    elec_share: item.elec_share_pct || 0,
    total_consumption: item.consumption_gwh
  }));

  // Peak clash badge color
  const getPeakClashVariant = (score: number) => {
    if (score < 0.4) return 'outline';
    if (score < 0.7) return 'secondary';
    return 'destructive';
  };

  const getPeakClashText = (score: number) => {
    if (score < 0.4) return 'Low Peak Clash';
    if (score < 0.7) return 'Medium Peak Clash';
    return 'High Peak Clash';
  };

  if (energyLoading || sectorLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">Loading municipal data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (energyError || sectorError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load municipal data: {energyError || sectorError}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Peak Clash Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                {selectedGeoId.startsWith('SE') ? 'Swedish Municipal Energy (Upplands Väsby)' : 'EU Regional Energy'}
              </CardTitle>
              <CardDescription>
                {selectedGeoId.startsWith('SE') ? 'SCB Open Data' : 'Eurostat SDMX'} - Municipal energy consumption by sector
              </CardDescription>
            </div>
            {peakData && !peakLoading && (
              <Badge 
                variant={getPeakClashVariant(peakData.clash_score)}
                className="flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                {getPeakClashText(peakData.clash_score)}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Consumption Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Energy Consumption by Sector ({latestYear})
            </CardTitle>
            <CardDescription>Annual consumption in GWh</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={latestYearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sector" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} GWh`, 'Consumption']}
                  labelFormatter={(label) => `Sector: ${label.charAt(0).toUpperCase() + label.slice(1)}`}
                />
                <Bar 
                  dataKey="consumption_gwh" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* District Heating vs Electricity Shares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Heat vs Electricity Share by Sector
            </CardTitle>
            <CardDescription>Distribution of energy sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heatElecData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{item.sector}</span>
                    <span className="text-sm text-muted-foreground">{item.total_consumption} GWh</span>
                  </div>
                  <div className="flex h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500" 
                      style={{ width: `${item.heat_share}%` }}
                      title={`District Heating: ${item.heat_share}%`}
                    />
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${item.elec_share}%` }}
                      title={`Electricity: ${item.elec_share}%`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Heat: {item.heat_share}%</span>
                    <span>Electricity: {item.elec_share}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span>District Heating</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Electricity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Share Trends */}
      {sectorData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sector Share Trends (2019-2024)</CardTitle>
            <CardDescription>Percentage distribution of energy consumption by sector over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectorData.slice(-3).map((yearData, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-medium text-center">{yearData.year}</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'households_pct', label: 'Households', color: sectorColors.households },
                      { key: 'industry_pct', label: 'Industry', color: sectorColors.industry },
                      { key: 'transport_pct', label: 'Transport', color: sectorColors.transport },
                      { key: 'services_pct', label: 'Services', color: sectorColors.services },
                      { key: 'dh_losses_pct', label: 'DH Losses', color: sectorColors.dh_losses }
                    ].map((sector) => (
                      <div key={sector.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: sector.color }}
                          />
                          <span className="text-sm">{sector.label}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {yearData[sector.key as keyof typeof yearData]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peak Hours Info */}
      {peakData && (
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
            <CardDescription>Municipal peak demand and potential OPS clash risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Peak Hours (Local Time)</h4>
                <div className="flex flex-wrap gap-2">
                  {peakData.peak_hours_local.map((hour, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {hour}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Clash Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Clash Score</span>
                    <span className="text-sm font-medium">{(peakData.clash_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Method</span>
                    <span className="text-sm font-medium capitalize">{peakData.method}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Based on typical Swedish municipal peak demand patterns (16:00-20:00 weekdays)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TabMunicipal;