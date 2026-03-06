import React from 'react';
import { Platform } from '../types';
import { ChannelTabs } from '../components/ChannelTabs';
import { Card } from '../components/ui/PremiumComponents';
import { mockActivities, mainChartData } from '../lib/mock-data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users,
  MessageCircle,
  Zap,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '../components/ui/ToastContext';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.stroke }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | Platform>('all');
  const { toast } = useToast();

  // Filter data based on activeTab
  const chartData = React.useMemo(() => {
    if (activeTab === 'all') return mainChartData;
    return mainChartData.map(d => ({
      name: d.name,
      // If instagram is selected, zero out whatsapp, and vice-versa for visual effect
      instagram: activeTab === 'instagram' ? d.instagram : 0,
      whatsapp: activeTab === 'whatsapp' ? d.whatsapp : 0,
    }));
  }, [activeTab]);

  const handleAction = (action: string) => {
    toast(`${action} functionality coming soon!`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-zinc-400 text-sm">Visão geral da performance do seu workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <ChannelTabs activeTab={activeTab} onChange={setActiveTab} />
          <button onClick={() => handleAction('More options')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Leads" value="12,540" trend="+12.5%" color="blue" />
        <KpiCard icon={MessageCircle} label="Conversas" value="8,234" trend="+5.2%" color="green" />
        <KpiCard icon={Zap} label="Automações" value="45.2k" trend="+24%" color="purple" />
        <KpiCard icon={TrendingUp} label="Conversão" value="4.8%" trend="-1.2%" color="orange" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart */}
        <Card className="lg:col-span-2 p-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-lg">Performance de Envios</h3>
              <p className="text-zinc-500 text-xs">Mensagens enviadas nos últimos 7 dias</p>
            </div>
            <div className="flex gap-2">
              {(activeTab === 'all' || activeTab === 'instagram') && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span> Instagram
                </div>
              )}
              {(activeTab === 'all' || activeTab === 'whatsapp') && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> WhatsApp
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `${value}`} />
                <Tooltip content={<CustomTooltip />} />
                {(activeTab === 'all' || activeTab === 'instagram') && (
                  <Area
                    type="monotone"
                    dataKey="instagram"
                    name="Instagram"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIg)"
                  />
                )}
                {(activeTab === 'all' || activeTab === 'whatsapp') && (
                  <Area
                    type="monotone"
                    dataKey="whatsapp"
                    name="WhatsApp"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWa)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="p-0 flex flex-col h-full">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white">Atividade Recente</h3>
            <button onClick={() => handleAction('Full history')} className="text-xs text-primary hover:underline">Ver tudo</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockActivities.filter(a => activeTab === 'all' || a.platform === activeTab).map((activity) => (
              <div key={activity.id} className="flex gap-3 items-start group animate-fade-in">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${activity.platform === 'instagram' ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 group-hover:text-white transition-colors">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500 font-mono">{activity.time}</span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-500 truncate">{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
            {mockActivities.filter(a => activeTab === 'all' || a.platform === activeTab).length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">No activities found for this channel.</div>
            )}
          </div>
          <div className="p-4 border-t border-white/5">
            <div className="w-full bg-zinc-900 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs">
                  <Zap size={12} fill="currentColor" />
                </div>
                <span className="text-xs font-medium text-zinc-300">Automações Ativas</span>
              </div>
              <span className="text-sm font-bold text-white">
                {activeTab === 'all' ? 12 : activeTab === 'instagram' ? 8 : 4}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const KpiCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <Card className="p-5 flex items-start justify-between group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">{label}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
        <span>{trend}</span>
        <span className="text-zinc-600">vs last week</span>
      </div>
    </div>
    <div className={`p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-${color}-500/30 transition-all`}>
      <Icon size={20} />
    </div>
  </Card>
);
