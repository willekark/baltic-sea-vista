import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Ship, 
  Zap, 
  Fish, 
  Factory, 
  TrendingUp, 
  TrendingDown, 
  Search,
  ExternalLink,
  MapPin,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface PublicStock {
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  marketCap: string;
  price: string;
  change: string;
  changePercent: string;
  trend: 'up' | 'down' | 'neutral';
  balticExposure: string;
  description: string;
  headquarters: string;
  tags: string[];
}

interface PrivateCompany {
  name: string;
  sector: string;
  headquarters: string;
  stage: string;
  valuation: string;
  balticOperations: string;
  description: string;
  investmentType: string;
  tags: string[];
}

const BalticSeaInvestments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  const publicStocks: PublicStock[] = [
    {
      ticker: 'MAERSK-B.CO',
      company: 'A.P. Møller-Mærsk',
      exchange: 'NASDAQ Copenhagen',
      sector: 'Shipping & Logistics',
      marketCap: '$47.2B',
      price: 'DKK 12,580',
      change: '+145',
      changePercent: '+1.17%',
      trend: 'up',
      balticExposure: 'High - Major Baltic routes',
      description: 'Global container shipping and port operations with significant Baltic Sea presence',
      headquarters: 'Copenhagen, Denmark',
      tags: ['Shipping', 'Logistics', 'Ports', 'Container']
    },
    {
      ticker: 'HHLA.DE',
      company: 'Hamburger Hafen und Logistik AG',
      exchange: 'XETRA',
      sector: 'Port Operations',
      marketCap: '€1.8B',
      price: '€16.25',
      change: '-0.35',
      changePercent: '-2.11%',
      trend: 'down',
      balticExposure: 'Very High - Hamburg port gateway',
      description: 'Leading European port and logistics company operating Hamburg port',
      headquarters: 'Hamburg, Germany',
      tags: ['Ports', 'Logistics', 'Container', 'Rail']
    },
    {
      ticker: 'ORSTED.CO',
      company: 'Ørsted A/S',
      exchange: 'NASDAQ Copenhagen',
      sector: 'Renewable Energy',
      marketCap: '$23.4B',
      price: 'DKK 358.60',
      change: '+2.80',
      changePercent: '+0.79%',
      trend: 'up',
      balticExposure: 'High - Baltic offshore wind farms',
      description: 'Leading offshore wind developer with multiple Baltic Sea projects',
      headquarters: 'Fredericia, Denmark',
      tags: ['Wind Energy', 'Renewable', 'Offshore', 'Green Energy']
    },
    {
      ticker: 'TORM.CO',
      company: 'TORM plc',
      exchange: 'NASDAQ Copenhagen',
      sector: 'Tanker Shipping',
      marketCap: '$2.1B',
      price: 'DKK 172.40',
      change: '-1.60',
      changePercent: '-0.92%',
      trend: 'down',
      balticExposure: 'Medium - Baltic/North Sea routes',
      description: 'Product tanker shipping company with Baltic operations',
      headquarters: 'Copenhagen, Denmark',
      tags: ['Tankers', 'Product Shipping', 'Maritime']
    },
    {
      ticker: 'HAPAG.DE',
      company: 'Hapag-Lloyd AG',
      exchange: 'XETRA',
      sector: 'Container Shipping',
      marketCap: '€24.8B',
      price: '€154.20',
      change: '+2.10',
      changePercent: '+1.38%',
      trend: 'up',
      balticExposure: 'Medium - Baltic service routes',
      description: 'Major container shipping line serving Baltic ports',
      headquarters: 'Hamburg, Germany',
      tags: ['Container', 'Shipping', 'Logistics']
    },
    {
      ticker: 'SALM.HE',
      company: 'Salmar ASA',
      exchange: 'Oslo Børs',
      sector: 'Aquaculture',
      marketCap: 'NOK 89.2B',
      price: 'NOK 734.50',
      change: '+8.50',
      changePercent: '+1.17%',
      trend: 'up',
      balticExposure: 'Low-Medium - Nordic operations',
      description: 'Major salmon farming company with Nordic operations',
      headquarters: 'Frøya, Norway',
      tags: ['Aquaculture', 'Salmon', 'Food Production']
    },
    {
      ticker: 'TELUS.HE',
      company: 'Telia Company AB',
      exchange: 'NASDAQ Stockholm',
      sector: 'Telecommunications',
      marketCap: 'SEK 172B',
      price: 'SEK 24.16',
      change: '-0.08',
      changePercent: '-0.33%',
      trend: 'down',
      balticExposure: 'Very High - Baltic states coverage',
      description: 'Major telecom operator in Nordic and Baltic countries',
      headquarters: 'Solna, Sweden',
      tags: ['Telecom', '5G', 'Infrastructure']
    },
    {
      ticker: 'KONE.HE',
      company: 'KONE Corporation',
      exchange: 'NASDAQ Helsinki',
      sector: 'Industrial Equipment',
      marketCap: '€42.1B',
      price: '€40.88',
      change: '+0.22',
      changePercent: '+0.54%',
      trend: 'up',
      balticExposure: 'Medium - Baltic infrastructure projects',
      description: 'Global elevator and escalator manufacturer with Baltic presence',
      headquarters: 'Helsinki, Finland',
      tags: ['Elevators', 'Infrastructure', 'Industrial']
    }
  ];

  const privateCompanies: PrivateCompany[] = [
    {
      name: 'Port of Göteborg AB',
      sector: 'Port Operations',
      headquarters: 'Göteborg, Sweden',
      stage: 'Established',
      valuation: '~€2.5B',
      balticOperations: 'Primary Scandinavian gateway port',
      description: 'Largest port in Scandinavia, key Baltic trade hub',
      investmentType: 'Municipal/Infrastructure Fund',
      tags: ['Ports', 'Infrastructure', 'Trade Gateway']
    },
    {
      name: 'Tallink Group',
      sector: 'Ferry Operations',
      headquarters: 'Tallinn, Estonia',
      stage: 'Public (TLG1T.TL)',
      valuation: '€420M',
      balticOperations: 'Dominant Baltic Sea ferry operator',
      description: 'Leading passenger and cargo ferry company in Baltic Sea region',
      investmentType: 'Public Equity',
      tags: ['Ferries', 'Passenger Transport', 'Tourism']
    },
    {
      name: 'Stena Line',
      sector: 'Ferry Operations',
      headquarters: 'Gothenburg, Sweden',
      stage: 'Private',
      valuation: '~€3.2B',
      balticOperations: 'Major Baltic routes to Poland, Germany',
      description: 'One of largest ferry operators in Europe with key Baltic routes',
      investmentType: 'Private Equity/Family Owned',
      tags: ['Ferries', 'RoRo', 'Transport Infrastructure']
    },
    {
      name: 'Nordic Aquafarms',
      sector: 'Aquaculture',
      headquarters: 'Bergen, Norway',
      stage: 'Growth',
      valuation: '~€500M',
      balticOperations: 'Land-based salmon farming facilities',
      description: 'Revolutionary land-based salmon farming technology',
      investmentType: 'Growth Capital',
      tags: ['Salmon', 'Sustainable Aquaculture', 'Innovation']
    },
    {
      name: 'Ellevio AB',
      sector: 'Utilities',
      headquarters: 'Stockholm, Sweden',
      stage: 'Established',
      valuation: '~€4.8B',
      balticOperations: 'Swedish electricity distribution network',
      description: 'Major Swedish electricity distribution company',
      investmentType: 'Infrastructure Fund',
      tags: ['Electricity', 'Grid Infrastructure', 'Utilities']
    },
    {
      name: 'Baltic Workboats AS',
      sector: 'Maritime Services',
      headquarters: 'Tallinn, Estonia',
      stage: 'Mid-stage',
      valuation: '~€75M',
      balticOperations: 'Offshore wind support vessels',
      description: 'Specialized workboat operator for offshore wind projects',
      investmentType: 'Private Equity',
      tags: ['Offshore Support', 'Wind Energy', 'Marine Services']
    },
    {
      name: 'Gasum',
      sector: 'Energy',
      headquarters: 'Espoo, Finland',
      stage: 'Established',
      valuation: '~€2.1B',
      balticOperations: 'LNG terminals and gas supply network',
      description: 'Leading Nordic gas company with LNG infrastructure',
      investmentType: 'State Owned/Infrastructure',
      tags: ['LNG', 'Gas Infrastructure', 'Energy Transition']
    },
    {
      name: 'Baltic Sea Properties',
      sector: 'Real Estate',
      headquarters: 'Stockholm, Sweden',
      stage: 'Growth',
      valuation: '~€850M',
      balticOperations: 'Logistics and industrial properties',
      description: 'Specialized in Baltic logistics and port-adjacent real estate',
      investmentType: 'Real Estate Fund',
      tags: ['Logistics Real Estate', 'Industrial Properties', 'Port Infrastructure']
    }
  ];

  const sectors = [
    { id: 'all', name: 'All Sectors', icon: BarChart3 },
    { id: 'shipping', name: 'Shipping & Logistics', icon: Ship },
    { id: 'energy', name: 'Energy & Renewables', icon: Zap },
    { id: 'aquaculture', name: 'Aquaculture & Food', icon: Fish },
    { id: 'infrastructure', name: 'Infrastructure & Ports', icon: Factory },
    { id: 'industrial', name: 'Industrial & Manufacturing', icon: Building2 }
  ];

  const filteredPublicStocks = publicStocks.filter(stock => {
    const matchesSearch = stock.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || 
                         stock.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchesSearch && matchesSector;
  });

  const filteredPrivateCompanies = privateCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || 
                         company.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchesSearch && matchesSector;
  });

  const getSectorIcon = (sector: string) => {
    if (sector.includes('Shipping') || sector.includes('Ferry')) return Ship;
    if (sector.includes('Energy') || sector.includes('Renewable')) return Zap;
    if (sector.includes('Aquaculture') || sector.includes('Food')) return Fish;
    if (sector.includes('Port') || sector.includes('Infrastructure')) return Factory;
    return Building2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Baltic Sea Investment Universe</h2>
        <p className="text-muted-foreground mt-1">
          Comprehensive list of investment opportunities in the Baltic Sea region
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies or tickers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => {
                const Icon = sector.icon;
                return (
                  <Button
                    key={sector.id}
                    variant={selectedSector === sector.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSector(sector.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {sector.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="public" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">Public Companies ({filteredPublicStocks.length})</TabsTrigger>
          <TabsTrigger value="private">Private Companies & Opportunities ({filteredPrivateCompanies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          <div className="grid gap-4">
            {filteredPublicStocks.map((stock, index) => {
              const SectorIcon = getSectorIcon(stock.sector);
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <SectorIcon className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{stock.company}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-mono font-medium">{stock.ticker}</span>
                              <span>•</span>
                              <span>{stock.exchange}</span>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              <span>{stock.headquarters}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{stock.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">{stock.price}</div>
                        <div className={`flex items-center gap-1 text-sm ${
                          stock.trend === 'up' ? 'text-green-600' : 
                          stock.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stock.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{stock.change} ({stock.changePercent})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Market Cap: </span>
                        <span className="font-medium">{stock.marketCap}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sector: </span>
                        <span className="font-medium">{stock.sector}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Baltic Exposure: </span>
                        <span className="font-medium">{stock.balticExposure}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {stock.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Chart
                      </Button>
                      <Button size="sm" variant="outline">
                        Investment Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <div className="grid gap-4">
            {filteredPrivateCompanies.map((company, index) => {
              const SectorIcon = getSectorIcon(company.sector);
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <SectorIcon className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{company.headquarters}</span>
                              <span>•</span>
                              <span>{company.stage}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-bold">{company.valuation}</div>
                        <Badge variant="outline">{company.investmentType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sector: </span>
                        <span className="font-medium">{company.sector}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Baltic Operations: </span>
                        <span className="font-medium">{company.balticOperations}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {company.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Investment Opportunity
                      </Button>
                      <Button size="sm" variant="outline">
                        Company Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{publicStocks.length}</div>
            <div className="text-xs text-muted-foreground">Public Companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{privateCompanies.length}</div>
            <div className="text-xs text-muted-foreground">Private Opportunities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">~€150B</div>
            <div className="text-xs text-muted-foreground">Combined Market Cap</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">8</div>
            <div className="text-xs text-muted-foreground">Key Sectors</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalticSeaInvestments;