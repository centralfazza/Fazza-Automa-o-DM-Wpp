
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Platform } from '../../types';
import { Instagram, MessageCircle } from 'lucide-react';

// Utility for merging tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. CARD
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn(
    "bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl hover:border-emerald-500/20 transition-all duration-300 group",
    className
  )}>
    {children}
  </div>
);

// 2. BADGE
export const Badge: React.FC<{ children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'outline', className?: string }> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    outline: "bg-transparent border border-zinc-700 text-zinc-400",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

// 3. CHANNEL ICON
export const ChannelIcon: React.FC<{ platform: Platform | 'all', size?: number }> = ({ platform, size = 16 }) => {
  if (platform === 'instagram') return <Instagram size={size} className="text-pink-500" />;
  if (platform === 'whatsapp') return <MessageCircle size={size} className="text-green-500" />;
  return null;
};

// 4. STAT CARD (Small)
export const StatPill: React.FC<{ label: string, value: string, trend?: string }> = ({ label, value, trend }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-bold text-white">{value}</span>
      {trend && (
        <span className={cn("text-[10px]", trend.startsWith('+') ? "text-green-400" : "text-red-400")}>
          {trend}
        </span>
      )}
    </div>
  </div>
);
