# 🛠️ Directive 02: Backend API (FastAPI)

The backend provides the logic to match incoming messages to the correct automation flow and handles the storage of all CRM data.

## 📡 Core Endpoints

### 1. Match Engine
- **Endpoint**: `GET /api/automations/match`
- **Purpose**: Called by N8N when a message arrives.
- **Logic**:
  - Checks for active automations on the specific platform.
  - Matches keywords (regex or exact).
  - Matches "first_message" by checking if the sender exists in the `messages` table.
- **Response**: The full `actions` JSON array for N8N to loop over.

### 2. CRM Management
- **Contacts**: `GET /api/contacts/:id`, `POST /api/contacts/:id/tags`.
- **Conversations**: `GET /api/conversations` (Inbox) and message history.
- **Manual Send**: `POST /api/messages/send` to allow human handover.

### 3. Execution Logs
- **Endpoint**: `POST /api/analytics/log`
- **Purpose**: N8N reports the status of each action.
- **Data**: Tracks timestamp, automation_id, success status, and error messages.

## 🗄️ Database Changes
We need to extend the previous schema to explicitly support the `platform` column in automations and link `instagram_accounts` / `whatsapp_accounts` for token management.
