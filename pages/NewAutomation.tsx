import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Sidebar } from '../components/flow/Sidebar';
import { TriggerNode } from '../components/flow/TriggerNode';
import { MessageNode } from '../components/flow/MessageNode';
import { ActionNode } from '../components/flow/ActionNode';
import { IntegrationNode } from '../components/flow/IntegrationNode';
import { WebhookNode } from '../components/flow/WebhookNode';
import { DelayNode } from '../components/flow/DelayNode';
import { LogicNode } from '../components/flow/LogicNode';
import { RandomSplitNode } from '../components/flow/RandomSplitNode';
import { PropertyPanel } from '../components/flow/PropertyPanel';
import { useToast } from '../components/ui/ToastContext';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../components/ui/PremiumComponents';

const nodeTypes = {
  trigger: TriggerNode,
  message: MessageNode,
  action: ActionNode,
  integration: IntegrationNode,
  webhook: WebhookNode,
  delay: DelayNode,
  logic: LogicNode,
  randomSplit: RandomSplitNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'Inbound Message' },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const NewAutomation = () => {
  const { id } = useParams();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [automationName, setAutomationName] = useState('Nova Automação');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const fetchAutomation = async () => {
        try {
          setLoading(true);
          const res = await fetch(`http://localhost:8000/api/automations/${id}`);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();

          setAutomationName(data.name);
          setSelectedPlatform(data.platform);

          if (data.actions && data.actions.nodes) {
            setNodes(data.actions.nodes);
            setEdges(data.actions.edges || []);
          }
        } catch (err) {
          console.error(err);
          toast('Erro ao carregar automação', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchAutomation();
    }
  }, [id, setNodes, setEdges, toast]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow/label');
      const service = event.dataTransfer.getData('application/reactflow/service');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: {
          label: label || `${type} node`,
          service: service || undefined
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSave = async () => {
    try {
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const flowData = {
        name: automationName,
        platform: selectedPlatform,
        is_active: true,
        triggers: triggerNode?.data || { type: 'keyword', keywords: [] },
        actions: { nodes, edges }
      };

      const url = id
        ? `http://localhost:8000/api/automations/${id}`
        : 'http://localhost:8000/api/automations/';

      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData),
      });

      if (response.ok) {
        toast(id ? 'Automação atualizada!' : 'Automação salva!', 'success');
        setTimeout(() => navigate('/automations'), 1000);
      } else {
        const err = await response.json();
        toast(`Erro ao salvar: ${err.detail || 'Erro desconhecido'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving automation:', error);
      toast('Erro de conexão com o servidor.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-bold text-lg">Carregando Fluxo...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden">
      <ReactFlowProvider>
        <Sidebar />

        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <div className="absolute top-6 left-6 z-10 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
            <button
              onClick={() => navigate('/automations')}
              className="p-3 bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col bg-zinc-900/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-2xl">
              <input
                type="text"
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                className="bg-transparent text-white font-black text-xl outline-none border-b-2 border-transparent focus:border-primary transition-all w-72 placeholder:text-zinc-700"
                placeholder="Nome da Automação..."
              />
              <div className="flex gap-6 mt-2">
                {['instagram', 'whatsapp'].map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-1",
                      selectedPlatform === p
                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#09090b]"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#27272a" />
            <Controls className="bg-zinc-800 border-zinc-700 text-zinc-400 fill-zinc-400" />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === 'trigger') return '#10b981';
                if (n.type === 'message') return '#3b82f6';
                if (n.type === 'action') return '#a855f7';
                return '#71717a';
              }}
              nodeColor="#18181b"
              maskColor="#09090b"
              className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl"
            />
          </ReactFlow>

          <button
            onClick={handleSave}
            className="absolute top-6 right-6 z-10 bg-primary hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-black shadow-[0_0_40px_rgba(16,185,129,0.25)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Save size={20} strokeWidth={3} />
            SALVAR FLUXO
          </button>
        </div>

        {selectedNode && (
          <PropertyPanel
            node={selectedNode}
            setNodes={setNodes}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default NewAutomation;