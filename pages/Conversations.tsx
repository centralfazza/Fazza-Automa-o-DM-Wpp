
import React, { useState } from 'react';
import { ChannelIcon, Badge, cn } from '../components/ui/PremiumComponents';
import { mockConversations, mockMessages } from '../lib/mock-data';
import { Search, Send, Paperclip, MoreVertical, CheckCircle, MessageCircle } from 'lucide-react';

export const Conversations: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('1');
  const activeConversation = mockConversations.find(c => c.id === selectedId);
  const messages = mockMessages[selectedId] || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-[#0c0c0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">

      {/* Sidebar List */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-zinc-900/50">
        <div className="p-4 border-b border-white/5 space-y-3">
          <h2 data-testid="conversations-title" className="font-bold text-white text-lg px-1">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input type="text" placeholder="Search contacts..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mockConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "p-4 flex gap-3 cursor-pointer transition-all border-b border-white/5 relative group",
                selectedId === conv.id ? "bg-primary/5" : "hover:bg-zinc-800/50"
              )}
            >
              {selectedId === conv.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-lg shadow-sm">
                  {conv.contactAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-900">
                  <ChannelIcon platform={conv.platform} size={14} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={cn("font-semibold text-sm truncate", selectedId === conv.id ? "text-white" : "text-zinc-300")}>
                    {conv.contactName}
                  </span>
                  <span className="text-[10px] text-zinc-500">{conv.timestamp}</span>
                </div>
                <p className={cn("text-xs truncate", conv.unread > 0 ? "text-white font-medium" : "text-zinc-500")}>
                  {conv.lastMessage}
                </p>
                {conv.tags && conv.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {conv.tags.map((tag, i) => (
                      <Badge key={i} variant="default" className="text-[9px] py-0 px-1.5 h-4 bg-zinc-800/80 border border-zinc-700/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#09090b] relative">
        {activeConversation ? (
          <>
            {/* Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm border border-white/10">{activeConversation.contactAvatar}</div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">{activeConversation.contactName}</h3>
                  <p className="text-xs text-zinc-500">@{activeConversation.contactHandle}</p>
                </div>
              </div>
              <div className="flex gap-2 text-zinc-400">
                <button className="p-2 hover:bg-zinc-800 rounded-lg hover:text-white transition"><CheckCircle size={18} /></button>
                <button className="p-2 hover:bg-zinc-800 rounded-lg hover:text-white transition"><MoreVertical size={18} /></button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-start" : "justify-end")}>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mr-2 text-xs shrink-0 border border-white/5">{activeConversation.contactAvatar}</div>
                  )}

                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm",
                    msg.sender === 'bot'
                      ? "bg-zinc-800 text-zinc-300 border border-white/5 rounded-br-none"
                      : msg.sender === 'agent'
                        ? "bg-primary/10 text-primary border border-primary/20 rounded-br-none"
                        : "bg-white text-black rounded-bl-none"
                  )}>
                    <p>{msg.content}</p>
                    <p className={cn("text-[9px] mt-1 opacity-60 text-right uppercase tracking-wider font-bold", msg.sender === 'user' ? "text-zinc-500" : "text-current")}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900/30 border-t border-white/5">
              {activeConversation.humanTakeover && (
                <div className="mb-2 flex items-center gap-2 justify-center">
                  <Badge variant="warning">Human Takeover Active</Badge>
                </div>
              )}
              <div className="flex gap-2 items-end bg-zinc-900 border border-zinc-700/50 rounded-xl p-2 focus-within:border-zinc-500 transition-colors shadow-lg">
                <button className="p-2 text-zinc-500 hover:text-white transition rounded-lg hover:bg-zinc-800"><Paperclip size={18} /></button>
                <textarea
                  className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm py-2 max-h-32 resize-none placeholder-zinc-600"
                  placeholder="Type a message..."
                  rows={1}
                />
                <button className="p-2 bg-primary text-black rounded-lg hover:bg-emerald-400 transition shadow-lg shadow-primary/20">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <MessageCircle size={32} />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
