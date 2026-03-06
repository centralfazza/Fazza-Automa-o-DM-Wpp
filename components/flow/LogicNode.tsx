import { Handle, Position } from 'reactflow';
import { Split } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

export const LogicNode = ({ data, selected }: any) => {
    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[220px] overflow-hidden transition-all duration-200",
            selected ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className="bg-pink-600 p-3 flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                    <Split size={16} />
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-pink-100 tracking-wider">Logic</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{data.label || 'Condition'}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900 space-y-3">
                <div className="text-[10px] text-zinc-500 font-medium">IF {data.condition || 'Condition...'}</div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800/50">
                        <span className="text-xs font-bold text-emerald-400">TRUE</span>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="true"
                            className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-zinc-900 !static translate-x-3.5"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800/50">
                        <span className="text-xs font-bold text-red-400">FALSE</span>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="false"
                            className="!w-3 !h-3 !bg-red-500 !border-2 !border-zinc-900 !static translate-x-3.5"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
