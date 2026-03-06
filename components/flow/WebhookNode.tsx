import { Handle, Position } from 'reactflow';
import { Network } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

export const WebhookNode = ({ data, selected }: any) => {
    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[260px] overflow-hidden transition-all duration-200",
            selected ? "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className="bg-orange-600 p-3 flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                    <Network size={16} />
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-orange-100 tracking-wider">Webhook</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{data.label || 'HTTP Request'}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">POST</span>
                    <span className="text-xs text-zinc-400 truncate w-32">https://api.exa...</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-orange-500 !border-4 !border-zinc-900" />
        </div>
    );
};
