import { Handle, Position } from 'reactflow';
import { Shuffle } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

export const RandomSplitNode = ({ data, selected }: any) => {
    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[200px] overflow-hidden transition-all duration-200",
            selected ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                    <Shuffle size={16} />
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-pink-100 tracking-wider">A/B Testing</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{data.label || 'Random Split'}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900 flex flex-col gap-3">
                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400">Path A (50%)</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="a"
                        className="!w-3 !h-3 !bg-pink-500 !border-2 !border-zinc-900 !static translate-x-3.5"
                    />
                </div>
                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400">Path B (50%)</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="b"
                        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-zinc-900 !static translate-x-3.5"
                    />
                </div>
            </div>
        </div>
    );
};
