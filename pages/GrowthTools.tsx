import React from 'react';
import { GrowthTool } from '../types';

const tools: GrowthTool[] = [
    { id: '1', name: 'Post: "GIVEAWAY"', type: 'comment', status: 'active', metrics: { impressions: 12000, optins: 450 } },
    { id: '2', name: 'Instagram Bio Link', type: 'url', status: 'active', metrics: { impressions: 500, optins: 120 } },
    { id: '3', name: 'Story Mention Reply', type: 'story', status: 'draft', metrics: { impressions: 0, optins: 0 } },
];

export const GrowthTools: React.FC = () => {
  return (
     <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Growth Tools</h2>
            <p className="text-zinc-500 text-sm">Entry points to start conversations automatically.</p>
          </div>
          <button className="px-4 py-2 bg-primary text-black font-bold rounded-lg text-sm hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,220,130,0.2)]">
            + New Growth Tool
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {tools.map(tool => (
              <div key={tool.id} className="bg-surface border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all cursor-pointer group">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-zinc-900 rounded-lg text-2xl border border-zinc-800">
                       {tool.type === 'comment' && '💬'}
                       {tool.type === 'url' && '🔗'}
                       {tool.type === 'story' && '📸'}
                       {tool.type === 'widget' && '🧩'}
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${tool.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                       {tool.status}
                    </span>
                 </div>
                 
                 <h3 className="text-white font-bold mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                 <p className="text-xs text-zinc-500 uppercase tracking-wide mb-6">
                    {tool.type === 'comment' && 'Instagram Comments'}
                    {tool.type === 'url' && 'Ref URL'}
                    {tool.type === 'story' && 'Story Mention'}
                 </p>

                 <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                    <div>
                       <p className="text-zinc-500 text-[10px] uppercase">Impressions</p>
                       <p className="text-white font-mono">{tool.metrics.impressions}</p>
                    </div>
                    <div>
                       <p className="text-zinc-500 text-[10px] uppercase">Opt-ins</p>
                       <p className="text-white font-mono">{tool.metrics.optins}</p>
                    </div>
                    <div className="ml-auto">
                        <p className="text-zinc-500 text-[10px] uppercase">Conv %</p>
                        <p className="text-primary font-mono">{tool.metrics.impressions > 0 ? ((tool.metrics.optins / tool.metrics.impressions) * 100).toFixed(1) : 0}%</p>
                    </div>
                 </div>
              </div>
           ))}
           
           {/* Add New Card */}
           <div className="border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:border-primary hover:text-primary hover:bg-zinc-900/50 transition-all cursor-pointer min-h-[200px]">
              <span className="text-3xl mb-2">+</span>
              <span className="font-medium text-sm">Create Widget</span>
           </div>
        </div>
     </div>
  );
};