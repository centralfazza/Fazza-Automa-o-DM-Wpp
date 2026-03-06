import { Handle, Position } from 'reactflow';
import { Settings2, Tag, Bell, Mail, Plus, Minus } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

const ActionIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'add_tag': return <Plus size={14} className="text-emerald-400" />;
        case 'remove_tag': return <Minus size={14} className="text-red-400" />;
        case 'notify_admin': return <Bell size={14} className="text-orange-400" />;
        case 'send_email': return <Mail size={14} className="text-blue-400" />;
        default: return <Settings2 size={14} className="text-purple-100" />;
    }
};

export const ActionNode = ({ data, selected }: any) => {
    const isButtons = data.actionType === 'buttons';

    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[240px] overflow-hidden transition-all duration-200",
            selected ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className="bg-purple-600 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ActionIcon type={data.actionType} />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {isButtons ? 'Menu Interativo' : 'Ação do Sistema'}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900">
                <h4 className="text-xs font-bold text-white mb-2">{data.label || 'Sem título'}</h4>

                {isButtons ? (
                    <div className="flex flex-col gap-1.5">
                        {(data.buttons || []).map((btn: any, i: number) => (
                            <div key={i} className="bg-zinc-800/80 border border-zinc-700 py-1.5 px-3 rounded text-[10px] text-zinc-300 font-bold text-center">
                                {btn.text || `Botão ${i + 1}`}
                            </div>
                        ))}
                        <div className="text-[10px] text-zinc-600 text-center italic mt-1">Quick Replies</div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded border border-zinc-800">
                        <Tag size={12} className="text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                            {data.actionType || 'GENERIC'}
                        </span>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-purple-500 !border-4 !border-zinc-900" />
        </div>
    );
};
