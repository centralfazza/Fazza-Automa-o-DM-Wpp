# 🚀 Fazza CRM - Automation Integration Guide

This guide explains how to integrate the new "Automations" module into the existing Fazza CRM.

## 1. Embedding the UI
The automation builder is a React-based component. To embed it:
- Use the `NewAutomation` page as a new route (e.g., `/automations/new`).
- The sidebar provides draggable nodes configured to interact with our backend.

## 2. Setting Up Webhooks
To receive messages and trigger automations, you must configure the following in the Meta Developer Portal:

### Instagram
- **Callback URL**: `https://<your-backend>/api/webhooks/instagram`
- **Verify Token**: `<META_VERIFY_TOKEN>` (defined in .env)

### WhatsApp
- **Callback URL**: `https://<your-backend>/api/webhooks/whatsapp`
- **Verify Token**: `<META_VERIFY_TOKEN>`

## 3. N8N Integration
Import the 5 JSON files from the `/n8n` directory into your N8N instance:
1. `instagram_automation_handler.json`: Main entry for IG.
2. `whatsapp_automation_handler.json`: Main entry for WA.
3. `send_instagram_message.json`: Handles Graph API calls.
4. `send_whatsapp_message.json`: Handles Cloud API calls.
5. `automation_sequence_manager.json`: Logic for delays and multi-step flows.

**Important**: Ensure the `BACKEND_API_KEY` environment variable in N8N matches the one in the FastAPI backend.

## 4. Authentication
The backend expects a Bearer token in the `Authorization` header. You can use the `/api/auth/login` endpoint to obtain this or pass your existing JWT if the secrets are synchronized.

## 5. Testing
1. Create a flow in the UI with a "Keyword" trigger (e.g., "Hello").
2. Set a "Send Message" action.
3. Save and togggle to "Active".
4. Send "Hello" to your integrated account.
