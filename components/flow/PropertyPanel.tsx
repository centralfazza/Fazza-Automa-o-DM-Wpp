import { X, Clock, MessageSquare, Split, Zap, Settings2, Bot, Network, Image as ImageIcon, Video, Plus, Minus, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../components/ui/PremiumComponents';

const VariablePicker = ({ onSelect }: { onSelect: (v: string) => void }) => {
    const vars = ['firstName', 'lastName', 'email', 'phone', 'currentTime'];
    return (
        <div className="flex flex-wrap gap-1 mt-2">
            {vars.map(v => (
                <button
                    key={v}
                    onClick={() => onSelect(`{${v}}`)}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-1 rounded border border-zinc-700 transition-colors"
                >
                    {v}
                </button>
            ))}
        </div>
    );
};

export const PropertyPanel = ({ node, setNodes, onClose }: any) => {
    const [data, setData] = useState(node?.data || {});

    useEffect(() => {
        setData(node?.data || {});
    }, [node]);

    const updateNodeData = (newData: any) => {
        const updatedData = { ...data, ...newData };
        setData(updatedData);
        setNodes((nds: any[]) =>
            nds.map((n) => (n.id === node.id ? { ...n, data: updatedData } : n))
        );
    };

    if (!node) return null;

    return (
        <div className="w-80 border-l border-zinc-800 bg-zinc-900 absolute right-0 top-0 h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-zinc-800 text-zinc-400">
                        {node.type === 'trigger' && <Zap size={14} />}
                        {node.type === 'message' && <MessageSquare size={14} />}
                        {node.type === 'action' && <Settings2 size={14} />}
                        {node.type === 'delay' && <Clock size={14} />}
                        {node.type === 'logic' && <Split size={14} />}
                        {node.type === 'integration' && <Bot size={14} />}
                        {node.type === 'webhook' && <Network size={14} />}
                    </div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-tight">Edit {node.type}</h3>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Common: Label */}
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">Node Label</label>
                    <input
                        type="text"
                        value={data.label || ''}
                        onChange={(e) => updateNodeData({ label: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
                        placeholder="Ex: Enviar Boas-vindas"
                    />
                </div>

                {/* Type Specific Fields */}
                {node.type === 'trigger' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trigger Type</label>
                            <div className="flex gap-2">
                                {['keyword', 'first_message'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => updateNodeData({ type: t })}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded border text-[10px] font-bold transition-all",
                                            (data.type || 'keyword') === t
                                                ? "bg-green-500/20 border-green-500 text-green-400"
                                                : "bg-zinc-950 border-zinc-800 text-zinc-600"
                                        )}
                                    >
                                        {t === 'keyword' ? 'Palavra-chave' : 'Primeira Mensagem'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(data.type || 'keyword') === 'keyword' && (
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Keywords (separated by comma)</label>
                                <textarea
                                    value={(data.keywords || []).join(', ')}
                                    onChange={(e) => {
                                        const kws = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                        updateNodeData({ keywords: kws });
                                    }}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none resize-none"
                                    placeholder="Ex: preço, valor, info"
                                    rows={3}
                                />
                                <p className="text-[10px] text-zinc-500">Dica: Use '!' na frente para correspondência exata. Ex: !valor</p>
                            </div>
                        )}
                    </div>
                )}

                {node.type === 'message' && (
                    <>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Message Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['text', 'image', 'video'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => updateNodeData({ messageType: t })}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-2 rounded border text-[10px] font-bold transition-all",
                                            (data.messageType || 'text') === t
                                                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                                        )}
                                    >
                                        {t === 'text' && <MessageSquare size={14} />}
                                        {t === 'image' && <ImageIcon size={14} />}
                                        {t === 'video' && <Video size={14} />}
                                        <span className="capitalize">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(data.messageType || 'text') === 'text' ? (
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">Text Content</label>
                                <textarea
                                    rows={6}
                                    value={data.content || ''}
                                    onChange={(e) => updateNodeData({ content: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none resize-none transition-colors font-sans"
                                    placeholder="Escreva sua mensagem... Use {name} para variáveis."
                                />
                                <div className="mt-2">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Dynamic Variables</span>
                                    <VariablePicker onSelect={(v) => updateNodeData({ content: (data.content || '') + v })} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">Media URL</label>
                                <input
                                    type="text"
                                    value={data.mediaUrl || ''}
                                    onChange={(e) => updateNodeData({ mediaUrl: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
                                    placeholder="https://exemplo.com/media.png"
                                />
                            </div>
                        )}
                    </>
                )}

                {node.type === 'delay' && (
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Wait Duration</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={data.duration || 5}
                                onChange={(e) => updateNodeData({ duration: e.target.value })}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                            />
                            <select
                                value={data.unit || 'm'}
                                onChange={(e) => updateNodeData({ unit: e.target.value })}
                                className="bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-sm text-white focus:border-primary outline-none"
                            >
                                <option value="s">Seconds</option>
                                <option value="m">Minutes</option>
                                <option value="h">Hours</option>
                                <option value="d">Days</option>
                            </select>
                        </div>
                    </div>
                )}

                {node.type === 'logic' && (
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Condition (IF/ELSE)</label>
                        <textarea
                            rows={3}
                            value={data.condition || ''}
                            onChange={(e) => updateNodeData({ condition: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none resize-none transition-colors"
                            placeholder="Ex: tag contém 'cliente_vip'..."
                        />
                        <div className="p-3 rounded bg-blue-500/5 border border-blue-500/10">
                            <p className="text-[10px] text-blue-400 leading-relaxed font-medium">
                                Se a condição for verdadeira, o fluxo seguirá pelo handle verde (TRUE). Caso contrário, pelo vermelho (FALSE).
                            </p>
                        </div>
                    </div>
                )}
                {node.type === 'action' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Action Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'add_tag', label: 'Add Tag', icon: Plus },
                                    { id: 'remove_tag', label: 'Remove Tag', icon: Minus },
                                    { id: 'notify_admin', label: 'Notify Admin', icon: Bell },
                                    { id: 'buttons', label: 'Send Buttons', icon: MessageSquare }
                                ].map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => updateNodeData({ actionType: a.id })}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded border text-[10px] font-bold transition-all",
                                            (data.actionType || 'add_tag') === a.id
                                                ? "bg-purple-500/20 border-purple-500 text-purple-400"
                                                : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                                        )}
                                    >
                                        <a.icon size={12} />
                                        <span>{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {data.actionType === 'buttons' ? (
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Interactive Buttons</label>
                                <div className="space-y-2">
                                    {(data.buttons || [{ text: '' }]).map((btn: any, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={btn.text}
                                                onChange={(e) => {
                                                    const newBtns = [...(data.buttons || [{ text: '' }])];
                                                    newBtns[i] = { ...newBtns[i], text: e.target.value };
                                                    updateNodeData({ buttons: newBtns });
                                                }}
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white outline-none"
                                                placeholder={`Botão ${i + 1}`}
                                            />
                                            {i > 0 && (
                                                <button
                                                    onClick={() => {
                                                        const newBtns = (data.buttons || []).filter((_: any, idx: number) => idx !== i);
                                                        updateNodeData({ buttons: newBtns });
                                                    }}
                                                    className="text-red-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {(data.buttons || []).length < 3 && (
                                        <button
                                            onClick={() => updateNodeData({ buttons: [...(data.buttons || [{ text: '' }]), { text: '' }] })}
                                            className="w-full py-1.5 border-2 border-dashed border-zinc-800 rounded text-[10px] font-bold text-zinc-600 hover:border-zinc-700 hover:text-zinc-500 transition-all mt-2"
                                        >
                                            + Add Button
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">Value / Tag Name</label>
                                <input
                                    type="text"
                                    value={data.value || ''}
                                    onChange={(e) => updateNodeData({ value: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                    placeholder="Ex: cliente_vip"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <button
                    onClick={onClose}
                    className="w-full bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg transition shadow-lg shadow-emerald-500/10"
                >
                    Confirm Changes
                </button>
            </div>
        </div>
    );
};
