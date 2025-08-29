import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Clock, Ship, CalendarIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BerthAvailabilityProps {
  selectedPort?: string | null;
}

interface BerthData {
  berths: any[];
  summary: {
    available_count: number;
    reserved_count: number;
    next_available: string | null;
  };
}

const BerthAvailability: React.FC<BerthAvailabilityProps> = ({ selectedPort }) => {
  const [ports, setPorts] = useState<any[]>([]);
  const [berthData, setBerthData] = useState<BerthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPortId, setCurrentPortId] = useState<string | null>(selectedPort);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchPorts();
  }, []);

  useEffect(() => {
    if (selectedPort) {
      setCurrentPortId(selectedPort);
      fetchBerthAvailability(selectedPort);
    }
  }, [selectedPort]);

  const fetchPorts = async () => {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name');

      if (error) throw error;
      setPorts(data);
    } catch (error) {
      console.error('Error fetching ports:', error);
      toast({
        title: "Error",
        description: "Failed to load ports data",
        variant: "destructive",
      });
    }
  };

  const fetchBerthAvailability = async (portId: string) => {
    if (!portId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('port-agent-services', {
        body: { 
          action: 'get_berth_availability',
          port_id: portId
        }
      });

      if (error) throw error;
      setBerthData(data);
    } catch (error) {
      console.error('Error fetching berth availability:', error);
      
      // Fallback to generate mock berth data for demonstration
      const mockBerthData = generateMockBerthData(portId);
      setBerthData(mockBerthData);
      
      toast({
        title: "Using Mock Data",
        description: "Displaying simulated berth availability data",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockBerthData = (portId: string): BerthData => {
    const berths = [];
    const berthCount = Math.floor(Math.random() * 8) + 5; // 5-12 berths

    for (let i = 1; i <= berthCount; i++) {
      const isAvailable = Math.random() > 0.3; // 70% chance of being available
      const now = new Date();
      
      berths.push({
        id: `berth-${i}`,
        berth_number: `B${i.toString().padStart(2, '0')}`,
        berth_type: ['container', 'bulk', 'ro-ro', 'cruise'][Math.floor(Math.random() * 4)],
        max_length_m: 150 + Math.random() * 200,
        max_draft_m: 8 + Math.random() * 8,
        status: isAvailable ? 'available' : 'reserved',
        available_from: isAvailable ? now : new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        available_until: new Date(now.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000),
        reserved_vessel_id: isAvailable ? null : `vessel-${Math.floor(Math.random() * 1000)}`
      });
    }

    const availableCount = berths.filter(b => b.status === 'available').length;
    const reservedCount = berths.filter(b => b.status === 'reserved').length;
    const nextAvailable = berths.find(b => b.status === 'available')?.available_from;

    return {
      berths,
      summary: {
        available_count: availableCount,
        reserved_count: reservedCount,
        next_available: nextAvailable ? nextAvailable.toISOString() : null
      }
    };
  };

  const handlePortSelect = (portId: string) => {
    setCurrentPortId(portId);
    fetchBerthAvailability(portId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reserved':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'reserved': return 'destructive';
      case 'maintenance': return 'secondary';
      default: return 'outline';
    }
  };

  const currentPort = ports.find(p => p.id === currentPortId);

  return (
    <div className="space-y-6">
      {/* Port Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Berth Availability
          </CardTitle>
          <CardDescription>
            Real-time berth availability and scheduling for Baltic ports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={currentPortId || ''} onValueChange={handlePortSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name} ({port.code}) - {port.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={() => currentPortId && fetchBerthAvailability(currentPortId)} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Availability Summary */}
      {berthData && currentPort && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{berthData.summary.available_count}</p>
                  <p className="text-sm text-muted-foreground">Available Berths</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{berthData.summary.reserved_count}</p>
                  <p className="text-sm text-muted-foreground">Reserved Berths</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Next Available</p>
                  <p className="text-sm text-muted-foreground">
                    {berthData.summary.next_available
                      ? format(new Date(berthData.summary.next_available), 'MMM dd, HH:mm')
                      : 'No upcoming availability'
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Berth Details */}
      {berthData && (
        <Card>
          <CardHeader>
            <CardTitle>Berth Details - {currentPort?.name}</CardTitle>
            <CardDescription>
              Individual berth specifications and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {berthData.berths.map((berth) => (
                <Card key={berth.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Berth {berth.berth_number}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(berth.status)}
                        <Badge variant={getStatusColor(berth.status) as any}>
                          {berth.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize">{berth.berth_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Length:</span>
                        <span>{Math.round(berth.max_length_m)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Draft:</span>
                        <span>{berth.max_draft_m.toFixed(1)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available From:</span>
                        <span>
                          {format(new Date(berth.available_from), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      {berth.status === 'reserved' && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-red-600">
                            <Ship className="w-3 h-3" />
                            <span className="text-xs">Reserved until {format(new Date(berth.available_until), 'MMM dd')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!berthData && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Port</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Choose a Baltic Sea port from the dropdown above to view real-time berth availability and scheduling information
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BerthAvailability;