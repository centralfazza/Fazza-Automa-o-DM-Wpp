import { Automation, ActivityItem, Conversation, Message } from '../types';

// Helper to generate sparkline data
const generateHistory = (base: number, days = 7) => {
  return Array.from({ length: days }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.max(0, Math.floor(base + (Math.random() * 20 - 10)))
  }));
};

export const mockAutomations: Automation[] = [
  { 
    id: '1', 
    name: 'Boas-vindas Novos Seguidores', 
    isActive: true, 
    triggersSummary: ['Follow'], 
    type: 'flow', 
    platforms: ['instagram'], 
    lastModified: '1h ago', 
    stats: { triggered: 1240, converted: 340, openRate: 85, ctr: 42, dropOffRate: 15, history: generateHistory(150) }, 
    nodes: [], edges: [] 
  },
  { 
    id: '2', 
    name: 'Resposta Keyword "PRECO"', 
    isActive: true, 
    triggersSummary: ['Keyword'], 
    type: 'rule', 
    platforms: ['instagram'], 
    lastModified: '2d ago', 
    stats: { triggered: 543, converted: 120, openRate: 92, ctr: 65, dropOffRate: 5, history: generateHistory(80) }, 
    nodes: [], edges: [] 
  },
  { 
    id: '4', 
    name: 'Agendamento VIP', 
    isActive: true, 
    triggersSummary: ['Keyword: VIP'], 
    type: 'flow', 
    platforms: ['whatsapp'], 
    lastModified: '1w ago', 
    stats: { triggered: 156, converted: 89, openRate: 98, ctr: 70, dropOffRate: 2, history: generateHistory(25) }, 
    nodes: [], edges: [] 
  },
  { 
    id: '6', 
    name: 'Suporte Nível 1', 
    isActive: true, 
    triggersSummary: ['Inbound Msg'], 
    type: 'flow', 
    platforms: ['whatsapp'], 
    lastModified: '3d ago', 
    stats: { triggered: 890, converted: 850, openRate: 99, ctr: 30, dropOffRate: 10, history: generateHistory(120) }, 
    nodes: [], edges: [] 
  },
  { 
    id: '7', 
    name: 'Sorteio Story Mention', 
    isActive: false, 
    triggersSummary: ['Story Mention'], 
    type: 'sequence', 
    platforms: ['instagram'], 
    lastModified: '5d ago', 
    stats: { triggered: 45, converted: 5, openRate: 80, ctr: 12, dropOffRate: 60, history: generateHistory(5) }, 
    nodes: [], edges: [] 
  },
];

export const mockActivities: ActivityItem[] = [
  { id: '1', type: 'conversion', platform: 'instagram', description: '@alice_design baixou o Ebook', time: '2 min ago', user: 'Alice Silva' },
  { id: '2', type: 'inbound_msg', platform: 'whatsapp', description: 'Nova mensagem sobre "Planos"', time: '15 min ago', user: '+55 11 99999-9999' },
  { id: '3', type: 'automation_start', platform: 'instagram', description: 'Iniciou fluxo "Boas-vindas"', time: '32 min ago', user: '@bob_builder' },
  { id: '4', type: 'error', platform: 'whatsapp', description: 'Falha ao enviar Template (24h window)', time: '1h ago', user: '+55 11 98888-8888' },
  { id: '5', type: 'handover', platform: 'whatsapp', description: 'Transferido para agente humano', time: '2h ago', user: '+55 11 97777-7777' },
];

export const mockConversations: Conversation[] = [
  { id: '1', contactId: 'c1', channelId: 'ch-1', platform: 'instagram', contactName: 'Alice Design', contactHandle: 'alice_design', contactAvatar: '👩‍🎨', lastMessage: 'Adorei os preços, como pago?', unread: 1, timestamp: '10:42', status: 'open', humanTakeover: false, tags: ['Lead', 'Hot'] },
  { id: '2', contactId: 'c2', channelId: 'ch-1', platform: 'instagram', contactName: 'Bob Builder', contactHandle: 'bob_builder', contactAvatar: '👷', lastMessage: 'Obrigado pela resposta!', unread: 0, timestamp: '09:15', status: 'done', humanTakeover: false, tags: ['Customer'] },
  { id: '3', contactId: 'c3', channelId: 'ch-2', platform: 'whatsapp', contactName: 'Carlos Chef', contactHandle: '+55 11 99999-0000', contactAvatar: '👨‍🍳', lastMessage: 'Tem desconto para atacado?', unread: 0, timestamp: 'Ontem', status: 'open', humanTakeover: true, tags: ['Wholesale'] },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'bot', content: 'Olá Alice! Obrigado por seguir.', time: '10:30', type: 'text', status: 'read' },
    { id: 'm2', sender: 'user', content: 'Oi! Vi seus stories sobre a mentoria.', time: '10:35', type: 'text', status: 'read' },
    { id: 'm3', sender: 'agent', content: 'Oi Alice, sou o João do suporte. Como posso ajudar?', time: '10:40', type: 'text', status: 'read' },
    { id: 'm4', sender: 'user', content: 'Adorei os preços, como pago?', time: '10:42', type: 'text', status: 'read' },
  ]
};

// Data for main dashboard chart
export const mainChartData = [
  { name: 'Mon', instagram: 400, whatsapp: 240 },
  { name: 'Tue', instagram: 300, whatsapp: 139 },
  { name: 'Wed', instagram: 200, whatsapp: 980 },
  { name: 'Thu', instagram: 278, whatsapp: 390 },
  { name: 'Fri', instagram: 189, whatsapp: 480 },
  { name: 'Sat', instagram: 239, whatsapp: 380 },
  { name: 'Sun', instagram: 349, whatsapp: 430 },
];
