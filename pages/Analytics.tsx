import React from 'react';
import { Card, StatPill } from '../components/ui/PremiumComponents';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, Download } from 'lucide-react';

const funnelData = [
  { name: 'Triggered', value: 4000, fill: '#3f3f46' },
  { name: 'Started', value: 3500, fill: '#71717a' },
  { name: 'Engaged', value: 2800, fill: '#a1a1aa' },
  { name: 'Completed', value: 2000, fill: '#00DC82' },
];

const dailyData = [
    { day: 'Mon', completed: 120, drop: 10 },
    { day: 'Tue', completed: 150, drop: 15 },
    { day: 'Wed', completed: 180, drop: 20 },
    { day: 'Thu', completed: 170, drop: 18 },
    { day: 'Fri', completed: 250, drop: 25 },
    { day: 'Sat', completed: 300, drop: 30 },
    { day: 'Sun', completed: 280, drop: 28 },
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <p className="text-zinc-400 text-sm">Deep dive into your automation performance.</p>
         </div>
         <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:border-zinc-700">
               <Calendar size={14} />
               <span>Last 30 Days</span>
            </button>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white">
               <Download size={18} />
            </button>
         </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="p-4 bg-zinc-900/30">
            <StatPill label="Total Runs" value="45.2k" trend="+12%" />
         </Card>
         <Card className="p-4 bg-zinc-900/30">
            <StatPill label="Completion Rate" value="68.4%" trend="+2.4%" />
         </Card>
         <Card className="p-4 bg-zinc-900/30">
            <StatPill label="Avg. Response" value="1.2s" trend="-0.1s" />
         </Card>
         <Card className="p-4 bg-zinc-900/30">
            <StatPill label="Click Through" value="12.5%" trend="+1.5%" />
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Completion Trend */}
         <Card className="p-6">
            <h3 className="font-bold text-white mb-6">Daily Completions</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                     <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                        itemStyle={{ color: '#fff' }}
                     />
                     <Line type="monotone" dataKey="completed" stroke="#00DC82" strokeWidth={3} dot={{r: 4, fill: '#18181b', strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Funnel */}
         <Card className="p-6">
            <h3 className="font-bold text-white mb-6">Automation Funnel</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                     <XAxis type="number" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                     <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                     />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>
    </div>
  );
};
