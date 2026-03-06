
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Platform } from '../types';
import { ChannelTabs } from '../components/ChannelTabs';
import { Card, Badge, ChannelIcon, StatPill, cn } from '../components/ui/PremiumComponents';
import {
   Plus,
   Search,
   Filter,
   MoreVertical,
   Play,
   Pause,
   BarChart2,
   Edit3
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useToast } from '../components/ui/ToastContext';

export const Automations: React.FC = () => {
   const navigate = useNavigate();
   const [searchParams, setSearchParams] = useSearchParams();
   const { toast } = useToast();
   const [searchTerm, setSearchTerm] = React.useState('');
   const [automations, setAutomations] = React.useState<any[]>([]);
   const [loading, setLoading] = React.useState(true);

   const activeTab = (searchParams.get('channel') as 'all' | Platform) || 'all';

   const fetchAutomations = React.useCallback(async () => {
      try {
         setLoading(true);
         const res = await fetch('http://localhost:8000/api/automations/');
         if (!res.ok) throw new Error('Failed to fetch');
         const data = await res.json();
         // Map backend schema to frontend expectation if needed
         const formatted = data.map((a: any) => ({
            ...a,
            isActive: a.is_active, // mapping backend 'is_active' to frontend 'isActive'
            platforms: [a.platform],
            triggersSummary: [a.triggers?.type === 'keyword' ? `Keyword: ${a.triggers.keywords?.[0] || ''}` : 'First Message'],
            stats: {
               triggered: a.stats_triggered || 0,
               converted: a.stats_finished || 0,
               openRate: 0, ctr: 0, dropOffRate: 0,
               history: []
            }
         }));
         setAutomations(formatted);
      } catch (err) {
         console.error(err);
         toast('Erro ao carregar automações', 'error');
      } finally {
         setLoading(false);
      }
   }, [toast]);

   React.useEffect(() => {
      fetchAutomations();
   }, [fetchAutomations]);

   const handleTabChange = (tab: 'all' | Platform) => setSearchParams({ channel: tab });

   const filtered = automations.filter(a => {
      const matchesTab = activeTab === 'all' || a.platforms.includes(activeTab);
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
   });

   const handleFilterClick = () => {
      toast('Advanced filters coming soon!', 'info');
   };

   return (
      <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-700">

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Automações <span className="text-primary italic font-serif">Nativas</span>
               </h2>
               <p className="text-zinc-400 text-sm mt-1">Gerencie seus fluxos inteligentes com execução de baixíssima latência.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                     <input
                        type="text"
                        placeholder="Buscar fluxos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#09090b] border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white w-full sm:w-72 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
                     />
                  </div>
               </div>
               <button
                  onClick={() => navigate('/automations/new')}
                  className="relative group bg-primary hover:bg-emerald-400 text-black px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Plus size={18} strokeWidth={3} />
                  NOVA AUTOMAÇÃO
               </button>
            </div>
         </div>

         {/* Tabs & Filters */}
         <div className="flex justify-between items-center bg-zinc-900/40 p-1.5 rounded-xl border border-white/5">
            <ChannelTabs activeTab={activeTab} onChange={handleTabChange} className="border-none bg-transparent p-0" />
            <button onClick={handleFilterClick} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all font-medium">
               <Filter size={14} />
               <span>Filtros Avançados</span>
            </button>
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
               <div className="col-span-full h-64 flex flex-col items-center justify-center border border-zinc-800 rounded-2xl bg-zinc-900/10">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-zinc-500 font-medium">Carregando automações...</p>
               </div>
            ) : filtered.length === 0 ? (
               <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                  <p className="text-zinc-400 font-medium mb-2">Nenhuma automação encontrada</p>
                  <p className="text-zinc-500 text-sm">Crie sua primeira automação para começar.</p>
               </div>
            ) : (
               filtered.map(auto => (
                  <AutomationCard key={auto.id} data={auto} onRefresh={fetchAutomations} />
               ))
            )}

            {/* New Ghost Card */}
            <div
               onClick={() => navigate('/automations/new')}
               className="border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-[280px] hover:bg-zinc-900/30 hover:border-primary/30 transition-all cursor-pointer group gap-4"
            >
               <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-primary/30">
                  <Plus size={24} className="text-zinc-600 group-hover:text-primary" />
               </div>
               <p className="text-zinc-500 font-medium group-hover:text-zinc-300">Criar Nova Automação</p>
            </div>
         </div>
      </div>
   );
};

const AutomationCard: React.FC<{ data: any, onRefresh: () => void }> = ({ data, onRefresh }) => {
   const { toast } = useToast();
   const navigate = useNavigate();

   const handleAction = async (action: string) => {
      if (action === 'Edit') {
         navigate(`/automations/edit/${data.id}`);
         return;
      }

      if (action === 'Delete') {
         if (!window.confirm('Tem certeza que deseja excluir esta automação?')) return;
         try {
            const res = await fetch(`http://localhost:8000/api/automations/${data.id}`, { method: 'DELETE' });
            if (res.ok) {
               toast('Automação excluída!', 'success');
               onRefresh();
            }
         } catch (err) {
            toast('Erro ao excluir', 'error');
         }
         return;
      }

      if (action === 'Pause' || action === 'Activate') {
         try {
            const res = await fetch(`http://localhost:8000/api/automations/${data.id}/toggle`, { method: 'POST' });
            if (res.ok) {
               toast(`Automação ${action === 'Pause' ? 'pausada' : 'ativada'}!`, 'success');
               onRefresh();
            }
         } catch (err) {
            toast('Erro ao alterar status', 'error');
         }
         return;
      }

      toast(`${action} function coming soon!`, 'info');
   };

   return (
      <Card className="flex flex-col group relative overflow-hidden h-full border-white/[0.03]">
         {/* Glow Effect on Hover */}
         <div className="absolute -inset-px bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

         <div className="p-6 flex-1 z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-zinc-800 transition-all duration-500">
                     <ChannelIcon platform={data.platforms[0]} size={24} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-primary transition-colors">{data.name}</h3>
                     <div className="flex items-center gap-2">
                        <Badge variant={data.isActive ? 'success' : 'default'} className="h-5">
                           {data.isActive ? 'Ativa' : 'Pausada'}
                        </Badge>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{data.type}</span>
                     </div>
                  </div>
               </div>
               <button onClick={() => handleAction('Options')} className="p-1 text-zinc-600 hover:text-white transition-colors">
                  <MoreVertical size={18} />
               </button>
            </div>

            {/* Sparkline & Metrics */}
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-3xl font-black text-white tracking-tight">{data.stats?.triggered.toLocaleString()}</p>
                     <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Execuções (7d)</p>
                  </div>
                  <div className="h-10 w-28 opacity-60 group-hover:opacity-100 transition-opacity">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.stats?.history || []}>
                           <Line type="monotone" dataKey="value" stroke={data.isActive ? "#10b981" : "#52525b"} strokeWidth={2.5} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/[0.03]">
                  <StatPill label="Abertura" value={`${data.stats?.openRate}%`} trend="+2%" />
                  <StatPill label="Cliques" value={`${data.stats?.ctr}%`} />
                  <StatPill label="Conversão" value={`${Math.round((data.stats?.converted / (data.stats?.triggered || 1)) * 100)}%`} trend="+0.5%" />
               </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="bg-zinc-900/30 p-4 border-t border-white/[0.03] flex justify-between items-center backdrop-blur-md z-10 transition-all group-hover:bg-zinc-900/50">
            <div className="flex flex-col">
               <span className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter">Trigger</span>
               <span className="text-xs text-zinc-200 font-medium truncate max-w-[120px]">{data.triggersSummary[0]}</span>
            </div>
            <div className="flex gap-1.5">
               <button onClick={() => handleAction('Analytics')} className="p-2.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all shadow-sm" title="Analytics">
                  <BarChart2 size={16} />
               </button>
               <button onClick={() => handleAction('Edit')} className="p-2.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all shadow-sm" title="Edit">
                  <Edit3 size={16} />
               </button>
               <button
                  onClick={() => handleAction(data.isActive ? 'Pause' : 'Activate')}
                  className={cn(
                     "p-2.5 rounded-xl transition-all shadow-sm",
                     data.isActive
                        ? "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        : "bg-primary/20 text-primary hover:bg-primary hover:text-black"
                  )}
                  title={data.isActive ? "Pausar" : "Ativar"}
               >
                  {data.isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
               </button>
            </div>
         </div>
      </Card>
   );
};
