import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

export const DelayNode = ({ data, selected }: any) => {
    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[200px] overflow-hidden transition-all duration-200",
            selected ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className="bg-yellow-600 p-3 flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                    <Clock size={16} />
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-yellow-100 tracking-wider">Delay</span>
                    <h3 className="text-sm font-bold text-white leading-tight">Wait {data.duration || '5'} {data.unit || 'm'}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-3 bg-zinc-900 flex items-center gap-2">
                <div className="w-full bg-zinc-950 rounded border border-zinc-800 p-2 text-center">
                    <span className="text-xs text-zinc-400">Aguardar {data.duration || '5'}{data.unit || 'm'} antes de prosseguir</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-yellow-500 !border-4 !border-zinc-900" />
        </div>
    );
};
