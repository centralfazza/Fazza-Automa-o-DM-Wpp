import React from 'react';
import { Platform } from '../types';

interface ChannelBadgeProps {
  platform: Platform;
  className?: string;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ platform, className = '' }) => {
  const isIG = platform === 'instagram';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors ${
      isIG 
        ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' 
        : 'bg-green-500/10 text-green-500 border-green-500/20'
    } ${className}`}>
      <span className="text-xs">{isIG ? '📸' : '🟢'}</span>
      {isIG ? 'Instagram' : 'WhatsApp'}
    </span>
  );
};