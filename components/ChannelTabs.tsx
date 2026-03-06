import React from 'react';
import { Platform } from '../types';

interface ChannelTabsProps {
  activeTab: 'all' | Platform;
  onChange: (tab: 'all' | Platform) => void;
  className?: string;
}

export const ChannelTabs: React.FC<ChannelTabsProps> = ({ activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit ${className}`}>
      {(['all', 'instagram', 'whatsapp'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === tab 
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700 shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          {tab === 'all' && 'Todos'}
          {tab === 'instagram' && (
             <>
               <span className="text-pink-500">📸</span>
               <span>Instagram</span>
             </>
          )}
          {tab === 'whatsapp' && (
             <>
               <span className="text-green-500">🟢</span>
               <span>WhatsApp</span>
             </>
          )}
        </button>
      ))}
    </div>
  );
};