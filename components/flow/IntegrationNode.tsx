import { Handle, Position } from 'reactflow';
import { Bot, Table2, Database } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

const icons: any = {
    chatgpt: Bot,
    notion: Database,
    sheets: Table2,
};

const colors: any = {
    chatgpt: { border: 'border-teal-500', bg: 'bg-teal-600', shadow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]', text: 'text-teal-100' },
    notion: { border: 'border-neutral-500', bg: 'bg-neutral-600', shadow: 'shadow-[0_0_20px_rgba(115,115,115,0.3)]', text: 'text-neutral-100' },
    sheets: { border: 'border-emerald-500', bg: 'bg-emerald-600', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', text: 'text-emerald-100' },
};

export const IntegrationNode = ({ data, selected }: any) => {
    const service = data.service || 'chatgpt';
    const Icon = icons[service] || Bot;
    const style = colors[service] || colors.chatgpt;

    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[260px] overflow-hidden transition-all duration-200",
            selected ? `${style.border} ${style.shadow}` : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className={`${style.bg} p-3 flex items-center gap-3`}>
                <div className="bg-white/20 p-1.5 rounded-lg text-white">
                    <Icon size={16} fill="currentColor" />
                </div>
                <div>
                    <span className={`text-[10px] uppercase font-bold ${style.text} tracking-wider`}>Integração</span>
                    <h3 className="text-sm font-bold text-white leading-tight capitalize">{service}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900">
                <p className="text-xs text-zinc-400">
                    {data.label || `Conectar com ${service}`}
                </p>
                {service === 'chatgpt' && (
                    <div className="mt-2 text-[10px] text-zinc-500 bg-zinc-950 p-2 rounded border border-zinc-800">
                        Model: GPT-4o
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className={`!w-4 !h-4 !bg-zinc-500 !border-4 !border-zinc-900`} />
        </div>
    );
};
