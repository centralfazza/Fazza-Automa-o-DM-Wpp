import { Handle, Position } from 'reactflow';
import { MessageSquare, Image as ImageIcon, Video, User } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

const VariablePill = ({ name }: { name: string }) => (
    <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-500/30 mx-0.5">
        <User size={10} />
        {name}
    </span>
);

const renderContent = (content: string) => {
    if (!content) return <span className="text-zinc-600 italic">Digite sua mensagem aqui...</span>;

    // Basic variable parsing {name} -> Pill
    const parts = content.split(/(\{[^{}]+\})/g);
    return parts.map((part, i) => {
        if (part.startsWith('{') && part.endsWith('}')) {
            return <VariablePill key={i} name={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
    });
};

export const MessageNode = ({ data, selected }: any) => {
    const type = data.messageType || 'text';

    return (
        <div className={cn(
            "shadow-lg rounded-xl bg-zinc-900 border-2 min-w-[280px] max-w-[320px] overflow-hidden transition-all duration-200",
            selected ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "border-transparent hover:border-zinc-700"
        )}>
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-zinc-600 !border-4 !border-zinc-900" />

            {/* Header */}
            <div className="bg-blue-600 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-100" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">Enviar Mensagem</span>
                </div>
                <div className="bg-blue-700/50 px-2 py-0.5 rounded text-[10px] text-blue-100 font-mono uppercase">{type}</div>
            </div>

            {/* Body */}
            <div className="p-4 bg-zinc-900">
                {type === 'text' ? (
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                            {renderContent(data.content)}
                        </p>
                    </div>
                ) : (
                    <div className="bg-zinc-950 aspect-video rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2">
                        {type === 'image' ? <ImageIcon size={24} className="text-zinc-700" /> : <Video size={24} className="text-zinc-700" />}
                        <span className="text-[10px] text-zinc-600 font-bold uppercase">No {type} selected</span>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-blue-500 !border-4 !border-zinc-900" />
        </div>
    );
};
