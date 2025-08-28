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

const nodeTypes = {
  dataSource: DataSourceNode,
  processor: ProcessorNode,
  metric: MetricNode,
  ai: AINode,
};

const InteractiveDataViz: React.FC<DataFlowProps> = ({ marineData }) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Create nodes from marine data
  const initialNodes: Node[] = useMemo(() => [
    // Data Sources (Left column)
    {
      id: 'copernicus',
      type: 'dataSource',
      position: { x: 50, y: 50 },
      data: { 
        label: 'Copernicus',
        description: 'Satellite data'
      }
    },
    {
      id: 'helcom',
      type: 'dataSource', 
      position: { x: 50, y: 130 },
      data: { 
        label: 'HELCOM',
        description: 'Baltic monitoring'
      }
    },
    {
      id: 'ais',
      type: 'dataSource',
      position: { x: 50, y: 210 },
      data: { 
        label: 'AIS Shipping',
        description: 'Vessel tracking'
      }
    },

    // Processing Hub (Center)
    {
      id: 'processor',
      type: 'processor',
      position: { x: 300, y: 140 },
      data: { 
        label: 'Analytics Engine',
        metrics: marineData.length
      }
    },

    // Metrics (Right column)
    {
      id: 'oxygen',
      type: 'metric',
      position: { x: 550, y: 50 },
      data: { 
        label: 'Oxygen',
        value: marineData.find(m => m.title === 'Oxygen Levels')?.value || '7.2 mg/L'
      }
    },
    {
      id: 'temperature',
      type: 'metric',
      position: { x: 550, y: 120 },
      data: { 
        label: 'Temperature',
        value: marineData.find(m => m.title === 'Sea Temperature')?.value || '14.8°C'
      }
    },
    {
      id: 'shipping',
      type: 'metric',
      position: { x: 550, y: 190 },
      data: { 
        label: 'Shipping',
        value: marineData.find(m => m.title === 'Shipping Intensity')?.value || '2,847'
      }
    },
    {
      id: 'fish',
      type: 'metric',
      position: { x: 550, y: 260 },
      data: { 
        label: 'Fish Stock',
        value: marineData.find(m => m.title === 'Fish Stock Index')?.value || '0.67'
      }
    },

    // AI Analysis (Far right)
    {
      id: 'ai-analysis',
      type: 'ai',
      position: { x: 750, y: 155 },
      data: { 
        label: 'AI Insights',
        confidence: '94%'
      }
    }
  ], [marineData]);

  const initialEdges: Edge[] = [
    // Data sources to processor
    { id: 'e1', source: 'copernicus', target: 'processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e2', source: 'helcom', target: 'processor', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e3', source: 'ais', target: 'processor', animated: true, style: { stroke: '#3b82f6' } },
    
    // Processor to metrics
    { id: 'e4', source: 'processor', target: 'oxygen', style: { stroke: '#10b981' } },
    { id: 'e5', source: 'processor', target: 'temperature', style: { stroke: '#10b981' } },
    { id: 'e6', source: 'processor', target: 'shipping', style: { stroke: '#10b981' } },
    { id: 'e7', source: 'processor', target: 'fish', style: { stroke: '#10b981' } },
    
    // Metrics to AI
    { id: 'e8', source: 'oxygen', target: 'ai-analysis', style: { stroke: '#8b5cf6' } },
    { id: 'e9', source: 'temperature', target: 'ai-analysis', style: { stroke: '#8b5cf6' } },
    { id: 'e10', source: 'shipping', target: 'ai-analysis', style: { stroke: '#8b5cf6' } },
    { id: 'e11', source: 'fish', target: 'ai-analysis', style: { stroke: '#8b5cf6' } },
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
          This diagram shows how your Baltic Sea data flows from collection sources through processing to analysis. Click any node to see details.
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
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                minZoom={0.5}
                maxZoom={2}
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