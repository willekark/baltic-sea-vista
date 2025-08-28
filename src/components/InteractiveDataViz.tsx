import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@xyflow/react/dist/style.css';

interface DataFlowProps {
  marineData: any[];
}

const InteractiveDataViz: React.FC<DataFlowProps> = ({ marineData }) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Create nodes from marine data
  const initialNodes: Node[] = useMemo(() => [
    // Environmental Data Sources
    {
      id: 'copernicus',
      type: 'input',
      position: { x: 50, y: 50 },
      data: { 
        label: 'Copernicus Marine',
        description: 'Satellite oceanographic data',
        status: 'active'
      },
      className: 'data-source-node'
    },
    {
      id: 'helcom',
      type: 'input', 
      position: { x: 50, y: 150 },
      data: { 
        label: 'HELCOM',
        description: 'Baltic Sea monitoring',
        status: 'active'
      },
      className: 'data-source-node'
    },
    {
      id: 'smhi',
      type: 'input',
      position: { x: 50, y: 250 },
      data: { 
        label: 'SMHI Weather',
        description: 'Meteorological data',
        status: 'active'
      },
      className: 'data-source-node'
    },
    {
      id: 'ais',
      type: 'input',
      position: { x: 50, y: 350 },
      data: { 
        label: 'AIS Shipping',
        description: 'Vessel tracking data',
        status: 'active'
      },
      className: 'data-source-node'
    },

    // Processing Nodes
    {
      id: 'processor',
      type: 'default',
      position: { x: 300, y: 200 },
      data: { 
        label: 'Data Processing',
        description: 'Real-time analytics engine',
        metrics: marineData.length
      },
      className: 'processor-node'
    },

    // Output Metrics
    {
      id: 'oxygen',
      type: 'output',
      position: { x: 550, y: 50 },
      data: { 
        label: 'Oxygen Levels',
        value: marineData.find(m => m.title === 'Oxygen Levels')?.value || 'N/A',
        trend: marineData.find(m => m.title === 'Oxygen Levels')?.trend || 'stable',
        status: marineData.find(m => m.title === 'Oxygen Levels')?.status || 'unknown'
      },
      className: 'metric-node'
    },
    {
      id: 'temperature',
      type: 'output',
      position: { x: 550, y: 120 },
      data: { 
        label: 'Sea Temperature',
        value: marineData.find(m => m.title === 'Sea Temperature')?.value || 'N/A',
        trend: marineData.find(m => m.title === 'Sea Temperature')?.trend || 'stable',
        status: marineData.find(m => m.title === 'Sea Temperature')?.status || 'unknown'
      },
      className: 'metric-node'
    },
    {
      id: 'shipping',
      type: 'output',
      position: { x: 550, y: 190 },
      data: { 
        label: 'Shipping Intensity',
        value: marineData.find(m => m.title === 'Shipping Intensity')?.value || 'N/A',
        trend: marineData.find(m => m.title === 'Shipping Intensity')?.trend || 'stable',
        status: marineData.find(m => m.title === 'Shipping Intensity')?.status || 'unknown'
      },
      className: 'metric-node'
    },
    {
      id: 'fish',
      type: 'output',
      position: { x: 550, y: 260 },
      data: { 
        label: 'Fish Stock Index',
        value: marineData.find(m => m.title === 'Fish Stock Index')?.value || 'N/A',
        trend: marineData.find(m => m.title === 'Fish Stock Index')?.trend || 'stable',
        status: marineData.find(m => m.title === 'Fish Stock Index')?.status || 'unknown'
      },
      className: 'metric-node'
    },
    {
      id: 'waves',
      type: 'output',
      position: { x: 550, y: 330 },
      data: { 
        label: 'Wave Height',
        value: marineData.find(m => m.title === 'Wave Height')?.value || 'N/A',
        trend: marineData.find(m => m.title === 'Wave Height')?.trend || 'stable',
        status: marineData.find(m => m.title === 'Wave Height')?.status || 'unknown'
      },
      className: 'metric-node'
    },

    // AI Analysis Node
    {
      id: 'ai-analysis',
      type: 'default',
      position: { x: 800, y: 200 },
      data: { 
        label: 'AI Analysis',
        description: 'Predictive insights & recommendations',
        confidence: '94%'
      },
      className: 'ai-node'
    }
  ], [marineData]);

  const initialEdges: Edge[] = [
    // Data source to processor connections
    { id: 'e1', source: 'copernicus', target: 'processor', type: 'default' },
    { id: 'e2', source: 'helcom', target: 'processor', type: 'default' },
    { id: 'e3', source: 'smhi', target: 'processor', type: 'default' },
    { id: 'e4', source: 'ais', target: 'processor', type: 'default' },
    
    // Processor to metrics connections
    { id: 'e5', source: 'processor', target: 'oxygen', type: 'default' },
    { id: 'e6', source: 'processor', target: 'temperature', type: 'default' },
    { id: 'e7', source: 'processor', target: 'shipping', type: 'default' },
    { id: 'e8', source: 'processor', target: 'fish', type: 'default' },
    { id: 'e9', source: 'processor', target: 'waves', type: 'default' },
    
    // Metrics to AI analysis - simplified to avoid handle issues
    { id: 'e10', source: 'processor', target: 'ai-analysis', type: 'default', style: { stroke: '#8b5cf6' } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedMetric(node.id);
  }, []);

  const getStatusColor = (status: string): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (status) {
      case 'critical': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      case 'good': return 'default' as const;
      case 'excellent': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedMetric);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Data Flow Visualization</CardTitle>
        <p className="text-sm text-gray-600">
          Click on any node to see detailed information. This diagram shows how data flows through our system.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flow" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flow">Data Flow</TabsTrigger>
            <TabsTrigger value="details">Node Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flow" className="space-y-4">
            <div className="h-96 w-full border rounded-lg bg-gray-50">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-left"
              >
                <MiniMap zoomable pannable />
                <Controls />
                <Background />
              </ReactFlow>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Data Sources
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Processing
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                Metrics
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                AI Analysis
              </Badge>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {selectedNode ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {String(selectedNode.data.label || 'Unknown')}
                    {selectedNode.data.status && (
                      <Badge variant={getStatusColor(String(selectedNode.data.status))}>
                        {String(selectedNode.data.status)}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedNode.data.description && (
                    <p className="text-gray-600">{String(selectedNode.data.description)}</p>
                  )}
                  
                  {selectedNode.data.value && (
                    <div>
                      <h4 className="font-medium">Current Value</h4>
                      <p className="text-2xl font-bold text-primary">{String(selectedNode.data.value)}</p>
                    </div>
                  )}
                  
                  {selectedNode.data.trend && (
                    <div>
                      <h4 className="font-medium">Trend</h4>
                      <p className={`capitalize ${String(selectedNode.data.trend) === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {String(selectedNode.data.trend)}
                      </p>
                    </div>
                  )}
                  
                  {selectedNode.data.metrics && (
                    <div>
                      <h4 className="font-medium">Processing</h4>
                      <p>{String(selectedNode.data.metrics)} metrics being processed</p>
                    </div>
                  )}
                  
                  {selectedNode.data.confidence && (
                    <div>
                      <h4 className="font-medium">AI Confidence</h4>
                      <p className="text-green-600">{String(selectedNode.data.confidence)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click on a node in the flow diagram to see detailed information
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .data-source-node {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 8px;
          padding: 10px;
        }
        .processor-node {
          background: linear-gradient(135deg, #10b981, #047857);
          color: white;
          border-radius: 8px;
          padding: 10px;
        }
        .metric-node {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          border-radius: 8px;
          padding: 10px;
        }
        .ai-node {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          border-radius: 8px;
          padding: 10px;
        }
      ` }} />
    </Card>
  );
};

export default InteractiveDataViz;