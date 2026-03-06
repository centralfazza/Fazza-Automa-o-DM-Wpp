# 🏗️ Directive 01: System Architecture

The Fazza CRM Automation System is a hybrid architecture where **FastAPI** acts as the "Brain" (Store & Match) and **N8N** acts as the "Engine" (Execution & Connectivity).

## 🔄 The Lifecycle of an automation

```mermaid
sequence_id
    participant User as "Instagram/WhatsApp User"
    participant Meta as "Meta (IG/WA API)"
    participant N8N as "N8N Master Workflow"
    participant API as "FastAPI Backend"
    participant DB as "PostgreSQL"

    User->>Meta: Sends Message ("Oi")
    Meta->>N8N: Webhook Trigger
    N8N->>API: GET /api/automations/match (msg="oi")
    API->>DB: Query Active Automations
    DB-->>API: Return Match (if exists)
    API-->>N8N: Return Automation JSON (Actions: [Text, Delay, Buttons])
    
    loop for each action in Actions
        N8N->>N8N: Process Action Type
        alt If Text Message
            N8N->>Meta: POST /messages (Graph API)
        else If Delay
            N8N->>N8N: Wait Node
        end
    end
    
    N8N->>API: POST /api/analytics/log (Success/Error)
```

## 🛠️ Key Components

### 1. N8N Master Workflow (`automation_master.json`)
- **Single Entry Point**: Handles both IG and WA webhooks.
- **Dynamic Execution**: It doesn't have hardcoded responses. It receives a list of tasks from the backend and iterates through them.
- **State Aware**: Uses the session context to handle variables like `{name}`.

### 2. FastAPI Backend
- **Match Logic**: Implements the regex and keyword matching to decide which automation should run.
- **Data Persistence**: Stores contacts, messages, and the results of every execution.
- **Management API**: Provided to the Fazza CRM frontend to create and toggle flows.

### 3. PostgreSQL Database
- **Relational Schema**: Holds the structural data for users, accounts, and complex JSONB fields for automation triggers/actions.

## 🔒 Security
- **Webhook Validation**: N8N and Backend verify Meta signatures.
- **API Auth**: N8N connects to Backend using a secure `X-API-KEY`.
