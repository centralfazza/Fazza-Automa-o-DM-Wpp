# 🤖 N8N Setup Guide

This guide explains how to configure the Master Automation workflow in your N8N instance.

## 📋 Steps

1. **Import Workflow**: Import `execution/n8n_workflow/automation_master.json`.
2. **Setup Global Variables**:
   - `BACKEND_API_URL`: Your FastAPI backend URL.
   - `BACKEND_API_KEY`: The key defined in backend `.env`.
3. **Configure Meta Credentials**:
   - Create a **Meta App** in developers.facebook.com.
   - Add **Instagram Graph API** and **WhatsApp Business API**.
   - Configure the **Webhook Callback URL** to point to your N8N Webhook node path.
4. **Deploy using Script**:
   ```bash
   python execution/scripts/deploy_to_n8n.py --workflow execution/n8n_workflow/automation_master.json --activate
   ```

## 🔄 The interpreter Logic
The workflow normalization node detects if the payload is from IG or WA and extracts the `sender_id`. It then queries the backend `/api/automations/match` and loops through the resulting `actions`.
