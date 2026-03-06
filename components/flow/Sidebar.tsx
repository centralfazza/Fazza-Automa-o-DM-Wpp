import React, { useState } from 'react';
import { MessageSquare, Zap, Settings2, Bot, Database, Network, ChevronDown, ChevronRight, Clock, Shuffle, Split } from 'lucide-react';
import { cn } from '../../components/ui/PremiumComponents';

type CategoryProps = {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

const Category = ({ title, isOpen, onToggle, children }: CategoryProps) => (
    <div className="border-b border-zinc-800 last:border-0">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full p-3 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors"
        >
            {title}
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && <div className="p-3 pt-0 flex flex-col gap-2">{children}</div>}
    </div>
);

const DraggableNode = ({ type, label, icon: Icon, colorClass, service }: any) => {
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string, nodeService?: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/label', nodeLabel);
        if (nodeService) {
            event.dataTransfer.setData('application/reactflow/service', nodeService);
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className={cn(
                "bg-zinc-800 p-3 rounded-lg border border-zinc-700 cursor-grab transition-colors flex items-center gap-3",
                "hover:border-zinc-600 hover:bg-zinc-800/80"
            )}
            onDragStart={(event) => onDragStart(event, type, label, service)}
            draggable
        >
            <div className={cn("p-2 rounded bg-opacity-20", colorClass)}>
                <Icon size={16} className={colorClass.replace('bg-', 'text-').replace('/20', '')} />
            </div>
            <span className="text-sm font-medium text-white">{label}</span>
        </div>
    );
};

export const Sidebar = () => {
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        triggers: true,
        actions: true,
        logic: true,
        integrations: true
    });

    const toggle = (key: string) => {
        setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800">
                <h2 className="text-sm font-bold text-white">Components</h2>
                <div className="mt-2 relative">
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">

                <Category title="Triggers" isOpen={openCategories.triggers} onToggle={() => toggle('triggers')}>
                    <DraggableNode type="trigger" label="Keyword" icon={Zap} colorClass="bg-emerald-500/20 text-emerald-500" />
                    <DraggableNode type="trigger" label="Inactivity" icon={Clock} colorClass="bg-emerald-500/20 text-emerald-500" />
                </Category>

                <Category title="Actions" isOpen={openCategories.actions} onToggle={() => toggle('actions')}>
                    <DraggableNode type="message" label="Send Message" icon={MessageSquare} colorClass="bg-blue-500/20 text-blue-500" />
                    <DraggableNode type="action" label="Add Tag" icon={Settings2} colorClass="bg-purple-500/20 text-purple-500" />
                </Category>

                <Category title="Logic" isOpen={openCategories.logic} onToggle={() => toggle('logic')}>
                    <DraggableNode type="webhook" label="Webhook" icon={Network} colorClass="bg-orange-500/20 text-orange-500" />
                    <DraggableNode type="logic" label="Condition (IF/ELSE)" icon={Split} colorClass="bg-pink-500/20 text-pink-500" />
                    <DraggableNode type="randomSplit" label="Random Split" icon={Shuffle} colorClass="bg-pink-500/20 text-pink-500" />
                    <DraggableNode type="delay" label="Delay" icon={Clock} colorClass="bg-yellow-500/20 text-yellow-500" />
                </Category>

                <Category title="Integrations" isOpen={openCategories.integrations} onToggle={() => toggle('integrations')}>
                    <DraggableNode type="integration" label="ChatGPT" icon={Bot} colorClass="bg-teal-500/20 text-teal-500" service="chatgpt" />
                    <DraggableNode type="integration" label="Notion" icon={Database} colorClass="bg-neutral-500/20 text-neutral-500" service="notion" />
                </Category>

            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <p className="text-[10px] text-zinc-500 text-center">
                    Drag components to the canvas
                </p>
            </div>
        </div>
    );
};
