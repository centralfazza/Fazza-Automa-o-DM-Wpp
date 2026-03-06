<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aCZBqInVhJmoIYM846LVfpSIpIP0jrpL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:

## 🚀 N8N Deployment

We use a Python script to automate the deployment of workflows to the Fazza N8N instance.

### Prerequisites
- Python 3.x
- `requests` library: `pip install requests`

### Environment Variables
Configure these in your terminal or `.env`:
```bash
export N8N_API_URL="https://n8n.fazza.com/api/v1"
export N8N_API_KEY="your_api_key"
```

### Usage
To deploy the master workflow:
```bash
python execution/scripts/deploy_to_n8n.py --workflow n8n_workflow/automation_master.json --activate
```

