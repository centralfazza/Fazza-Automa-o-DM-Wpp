import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

export const TriggerNode = ({ data, selected }: any) => {
    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[280px] overflow-hidden transition-all duration-200",
            selected ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            {/* Header */}
            <div className="bg-green-600 p-3 flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                    <Zap size={16} fill="currentColor" />
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-green-100 tracking-wider">Gatilho Inicial</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{data.label}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900">
                <p className="text-xs text-zinc-400">Este fluxo inicia quando este evento ocorre.</p>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-4 !h-4 !bg-green-500 !border-4 !border-zinc-900"
            />
        </div>
    );
};
