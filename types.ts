
// --- CORE ENTITIES ---
export interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface User { 
  id: string; 
  name: string; 
  email: string; 
  workspaceId: string;
  role: 'admin' | 'member';
}

// --- CHANNELS & CONNECTIONS ---
export type Platform = 'instagram' | 'whatsapp';

export interface Channel {
  id: string;
  platform: Platform;
  name: string; 
  providerId: string; 
  status: 'active' | 'disconnected' | 'banned';
}

// --- CRM / AUDIENCE ---
export interface Contact {
  id: string;
  workspaceId: string;
  identifiers: {
    instagramId?: string;
    whatsappId?: string; 
    email?: string;
  };
  name: string;
  username?: string; 
  email?: string;    
  avatar?: string;
  status: 'subscribed' | 'unsubscribed';
  tags: Tag[];
  customFields: Record<string, any>;
  lastActive: string;
  joinedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// --- AUTOMATION ENGINE ---
export type NodeType = 'trigger' | 'message' | 'condition' | 'action' | 'smart_delay';

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface Automation { 
  id: string; 
  name: string; 
  isActive: boolean; 
  type: 'flow' | 'sequence' | 'rule';
  platforms: Platform[]; 
  nodes: FlowNode[] | any[];
  edges: FlowEdge[] | any[];
  triggersSummary: string[]; 
  stats?: {
    triggered: number;
    converted: number;
    openRate: number;
    ctr?: number;
    dropOffRate?: number;
    history?: { date: string; value: number }[]; // For Sparklines
  };
  lastModified: string;
}

// --- ANALYTICS & DASHBOARD ---
export interface ActivityItem {
  id: string;
  type: 'inbound_msg' | 'automation_start' | 'conversion' | 'error' | 'handover';
  platform: Platform;
  description: string;
  time: string;
  user?: string;
}

export interface DailyMetric {
  date: string;
  value: number;
  platform?: Platform;
}

// --- CONVERSATION ---
export interface Conversation { 
  id: string; 
  contactId: string;
  channelId: string;
  platform: Platform;
  contactName: string; 
  contactHandle?: string; 
  contactAvatar: string;
  lastMessage: string; 
  unread: number; 
  timestamp: string;
  status: 'open' | 'done';
  humanTakeover: boolean; 
  tags?: string[];
}

export interface Message { 
  id: string; 
  sender: 'bot' | 'user' | 'agent'; 
  content: string; 
  time: string; 
  type: 'text' | 'image' | 'template' | 'interactive';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface GrowthTool {
  id: string;
  name: string;
  type: 'comment' | 'url' | 'story' | 'whatsapp_link' | 'widget';
  status: 'active' | 'draft';
  metrics: {
    impressions: number;
    optins: number;
  }
}