-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES & USERS
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}', -- timezone, language, currency
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CHANNELS (Unified: IG & WA)
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'whatsapp'
    
    -- Identifiers
    provider_id VARCHAR(255) NOT NULL, -- IG Business ID or WA Phone Number ID
    name VARCHAR(255) NOT NULL, -- Handle or Phone Number
    
    -- Auth & Config
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    config JSONB DEFAULT '{}', -- WA WABA ID, IG Page ID, Webhook Secrets
    
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'disconnected', 'banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workspace_id, platform, provider_id)
);

-- 3. WHATSAPP TEMPLATES (Required for WA Outbound)
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    channel_id UUID REFERENCES channels(id),
    
    name VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'pt_BR',
    category VARCHAR(50), -- 'MARKETING', 'UTILITY', 'AUTHENTICATION'
    
    structure_json JSONB NOT NULL, -- Components (Header, Body, Footer, Buttons)
    status VARCHAR(50) DEFAULT 'pending', -- 'approved', 'rejected', 'pending'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. UNIFIED AUDIENCE (CRM)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    
    -- Channel Identifiers (One contact can have multiple)
    instagram_id VARCHAR(255),
    whatsapp_id VARCHAR(255), -- Clean phone number (e.g. 5511999999999)
    email VARCHAR(255),
    
    name VARCHAR(255),
    avatar_url TEXT,
    
    -- CRM Data
    custom_fields JSONB DEFAULT '{}', 
    tags TEXT[] DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'subscribed',
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AUTOMATION ENGINE
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Engine Contract
    flow_json JSONB NOT NULL DEFAULT '{}',
    
    -- Triggers (Entry Points)
    triggers JSONB DEFAULT '[]', -- [{type: 'keyword', platform: 'whatsapp', value: 'oi'}, ...]
    
    stats_triggered INT DEFAULT 0,
    stats_finished INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONVERSATIONS & INBOX
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    channel_id UUID REFERENCES channels(id),
    contact_id UUID REFERENCES contacts(id),
    
    platform VARCHAR(50) NOT NULL, -- Denormalized for query speed
    status VARCHAR(50) DEFAULT 'open',
    
    -- Human Handover Logic
    human_takeover BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES users(id),
    
    -- Session Window (Critical for WA)
    last_user_message_at TIMESTAMP WITH TIME ZONE,
    window_expires_at TIMESTAMP WITH TIME ZONE, -- 24h after last user msg
    
    unread_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(channel_id, contact_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    
    direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
    type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'audio', 'interactive', 'template'
    
    content TEXT, -- Fallback text
    payload_json JSONB, -- Full structure (WA Interactive Button, List, Template Params)
    
    -- Delivery Status (WA specific)
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EXECUTION STATE MACHINE
CREATE TABLE IF NOT EXISTS execution_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES automations(id),
    contact_id UUID REFERENCES contacts(id),
    channel_id UUID REFERENCES channels(id),
    conversation_id UUID REFERENCES conversations(id),
    
    current_node_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    
    context_variables JSONB DEFAULT '{}', -- Temporary vars
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. OBSERVABILITY & LOGS (P1)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    external_event_id VARCHAR(255) NOT NULL, -- Idempotency Key
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_log TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(platform, external_event_id)
);

CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    session_id UUID REFERENCES execution_sessions(id),
    node_id VARCHAR(255),
    
    event_type VARCHAR(50), -- 'node_entry', 'action_executed', 'message_sent', 'error'
    details_json JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ANALYTICS AGGREGATES
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    date DATE NOT NULL,
    platform VARCHAR(50),
    metric_key VARCHAR(100), -- 'messages_sent', 'sessions_started', 'template_cost'
    metric_value NUMERIC DEFAULT 0,
    
    UNIQUE(workspace_id, date, platform, metric_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON execution_sessions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_logs_session ON execution_logs(session_id);
