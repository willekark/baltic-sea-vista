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
  Handle,
  Position,
} from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, Brain, BarChart3, Server } from 'lucide-react';
import '@xyflow/react/dist/style.css';

interface DataFlowProps {
  marineData: any[];
}

// Custom Node Components
const DataSourceNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg border-2 border-blue-300 min-w-[120px]">
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-300" />
    <div className="flex items-center space-x-2">
      <Database className="w-4 h-4" />
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs opacity-90">{data.description}</div>
      </div>
    </div>
  </div>
);

const ProcessorNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg border-2 border-green-300 min-w-[140px]">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-300" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-300" />
    <div className="flex items-center space-x-2">
      <Server className="w-5 h-5" />
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs opacity-90">{data.metrics} metrics</div>
      </div>
    </div>
  </div>
);

const MetricNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg border-2 border-orange-300 min-w-[100px]">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-300" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-300" />
    <div className="flex items-center space-x-2">
      <Activity className="w-4 h-4" />
      <div>
        <div className="font-semibold text-xs">{data.label}</div>
        <div className="text-xs opacity-90">{data.value}</div>
      </div>
    </div>
  </div>
);

const AINode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg border-2 border-purple-300 min-w-[120px]">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-300" />
    <div className="flex items-center space-x-2">
      <Brain className="w-5 h-5" />
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs opacity-90">{data.confidence} confidence</div>
      </div>
    </div>
  </div>
);

// Move nodeTypes outside component to prevent recreation on each render
const nodeTypes = {
  dataSource: DataSourceNode,
  processor: ProcessorNode,
  metric: MetricNode,
  ai: AINode,
};

const InteractiveDataViz: React.FC<DataFlowProps> = ({ marineData }) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Create comprehensive nodes reflecting our full data pipeline
  const initialNodes: Node[] = useMemo(() => [
    // Data Sources (Left column) - Expanded to show all our sources
    {
      id: 'copernicus',
      type: 'dataSource',
      position: { x: 50, y: 20 },
      data: { 
        label: 'Copernicus',
        description: 'Satellite imagery & marine data'
      }
    },
    {
      id: 'helcom',
      type: 'dataSource', 
      position: { x: 50, y: 90 },
      data: { 
        label: 'HELCOM',
        description: 'Baltic environmental monitoring'
      }
    },
    {
      id: 'ais',
      type: 'dataSource',
      position: { x: 50, y: 160 },
      data: { 
        label: 'AIS Network',
        description: 'Real-time vessel tracking'
      }
    },
    {
      id: 'satellite',
      type: 'dataSource',
      position: { x: 50, y: 230 },
      data: { 
        label: 'Satellite Intel',
        description: 'Shadow fleet detection'
      }
    },
    {
      id: 'ports',
      type: 'dataSource',
      position: { x: 50, y: 300 },
      data: { 
        label: 'Port Systems',
        description: 'Berth & congestion data'
      }
    },
    {
      id: 'market',
      type: 'dataSource',
      position: { x: 50, y: 370 },
      data: { 
        label: 'Market Data',
        description: 'Cargo flows & rates'
      }
    },

    // Processing Engines (Center column) - Multiple specialized processors
    {
      id: 'environmental-processor',
      type: 'processor',
      position: { x: 280, y: 80 },
      data: { 
        label: 'Environmental Engine',
        metrics: '12 metrics'
      }
    },
    {
      id: 'maritime-processor',
      type: 'processor',
      position: { x: 280, y: 180 },
      data: { 
        label: 'Maritime Intelligence',
        metrics: '8 analytics'
      }
    },
    {
      id: 'risk-processor',
      type: 'processor',
      position: { x: 280, y: 280 },
      data: { 
        label: 'Risk Assessment',
        metrics: '6 indicators'
      }
    },

    // Output Categories (Right column) - Comprehensive outputs
    {
      id: 'water-quality',
      type: 'metric',
      position: { x: 520, y: 20 },
      data: { 
        label: 'Water Quality',
        value: '7.2 mg/L O₂'
      }
    },
    {
      id: 'environmental',
      type: 'metric',
      position: { x: 520, y: 80 },
      data: { 
        label: 'Environmental',
        value: '14.8°C SST'
      }
    },
    {
      id: 'shipping-intel',
      type: 'metric',
      position: { x: 520, y: 140 },
      data: { 
        label: 'Shipping Intel',
        value: '2,847 vessels'
      }
    },
    {
      id: 'cargo-flows',
      type: 'metric',
      position: { x: 520, y: 200 },
      data: { 
        label: 'Cargo Flows',
        value: '€127M revenue'
      }
    },
    {
      id: 'shadow-fleet',
      type: 'metric',
      position: { x: 520, y: 260 },
      data: { 
        label: 'Shadow Fleet',
        value: '23 flagged'
      }
    },
    {
      id: 'port-efficiency',
      type: 'metric',
      position: { x: 520, y: 320 },
      data: { 
        label: 'Port Efficiency',
        value: '87% capacity'
      }
    },

    // AI & Premium Services (Far right)
    {
      id: 'ai-insights',
      type: 'ai',
      position: { x: 760, y: 120 },
      data: { 
        label: 'AI Predictions',
        confidence: '94%'
      }
    },
    {
      id: 'premium-reports',
      type: 'ai',
      position: { x: 760, y: 200 },
      data: { 
        label: 'Premium Reports',
        confidence: '€49/month'
      }
    },
    {
      id: 'alerts',
      type: 'ai',
      position: { x: 760, y: 280 },
      data: { 
        label: 'Real-time Alerts',
        confidence: 'Live'
      }
    }
  ], [marineData]);

  const initialEdges: Edge[] = [
    // Data sources to specialized processors
    { id: 'e1', source: 'copernicus', target: 'environmental-processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e2', source: 'helcom', target: 'environmental-processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e3', source: 'ais', target: 'maritime-processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e4', source: 'satellite', target: 'risk-processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e5', source: 'ports', target: 'maritime-processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e6', source: 'market', target: 'maritime-processor', animated: true, style: { stroke: '#3b82f6' } },
    
    // Cross-processor connections
    { id: 'e7', source: 'environmental-processor', target: 'risk-processor', style: { stroke: '#10b981', strokeDasharray: '5,5' } },
    { id: 'e8', source: 'maritime-processor', target: 'risk-processor', style: { stroke: '#10b981', strokeDasharray: '5,5' } },
    
    // Processors to specific outputs
    { id: 'e9', source: 'environmental-processor', target: 'water-quality', style: { stroke: '#10b981' } },
    { id: 'e10', source: 'environmental-processor', target: 'environmental', style: { stroke: '#10b981' } },
    { id: 'e11', source: 'maritime-processor', target: 'shipping-intel', style: { stroke: '#10b981' } },
    { id: 'e12', source: 'maritime-processor', target: 'cargo-flows', style: { stroke: '#10b981' } },
    { id: 'e13', source: 'maritime-processor', target: 'port-efficiency', style: { stroke: '#10b981' } },
    { id: 'e14', source: 'risk-processor', target: 'shadow-fleet', style: { stroke: '#10b981' } },
    
    // Outputs to AI/Premium services
    { id: 'e15', source: 'water-quality', target: 'ai-insights', style: { stroke: '#8b5cf6' } },
    { id: 'e16', source: 'environmental', target: 'ai-insights', style: { stroke: '#8b5cf6' } },
    { id: 'e17', source: 'shipping-intel', target: 'premium-reports', style: { stroke: '#f59e0b' } },
    { id: 'e18', source: 'cargo-flows', target: 'premium-reports', style: { stroke: '#f59e0b' } },
    { id: 'e19', source: 'shadow-fleet', target: 'alerts', style: { stroke: '#ef4444' } },
    { id: 'e20', source: 'port-efficiency', target: 'alerts', style: { stroke: '#ef4444' } },
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

  const selectedNode = nodes.find(n => n.id === selectedMetric);

  const getStatusColor = (status: string): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'good': return 'default';
      case 'excellent': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Data Flow Pipeline Visualization
        </CardTitle>
        <p className="text-sm text-gray-600">
          Our comprehensive maritime intelligence platform processes data from 6+ sources through specialized AI engines to deliver environmental monitoring, shipping intelligence, and risk assessment services.
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
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                attributionPosition="bottom-left"
                defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
                minZoom={0.4}
                maxZoom={2}
                key="maritime-intelligence-flow"
              >
                <MiniMap 
                  zoomable 
                  pannable 
                  nodeColor={(node) => {
                    switch (node.type) {
                      case 'dataSource': return '#3b82f6';
                      case 'processor': return '#10b981';
                      case 'metric': return '#f59e0b';
                      case 'ai': return '#8b5cf6';
                      default: return '#6b7280';
                    }
                  }}
                />
                <Controls />
                <Background />
              </ReactFlow>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Data Sources (6)
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                AI Processors (3)
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                Intelligence Outputs (6)
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Premium Services
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Revenue Streams
              </Badge>
              <Badge variant="outline">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Critical Alerts
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
                      <p className="text-2xl font-bold text-primary">{String(selectedNode.data.value || 'N/A')}</p>
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
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Click a Node to Explore</h3>
                <p>Select any node in the diagram above to see detailed information about that data source, processing step, or metric.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InteractiveDataViz;