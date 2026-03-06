print("Script iniciado...")
import json
import os
import requests
import argparse
from typing import Optional
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class N8NDeployer:
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url.rstrip('/')
        self.headers = {
            "X-N8N-API-KEY": api_key,
            "Content-Type": "application/json"
        }

    def deploy_workflow(self, workflow_path: str, activate: bool = False) -> Optional[str]:
        if not os.path.exists(workflow_path):
            print(f"Error: Arquivo {workflow_path} nao encontrado.")
            return None

        with open(workflow_path, 'r', encoding='utf-8') as f:
            full_data = json.load(f)

        # Filter only necessary fields for API v1
        workflow_data = {
            "name": full_data.get("name", "Unnamed Workflow"),
            "nodes": full_data.get("nodes", []),
            "connections": full_data.get("connections", {}),
            "settings": full_data.get("settings", {}),
            "staticData": full_data.get("staticData", {})
        }

        print(f"Buscando workflows em {self.api_url}...")
        try:
            search_res = requests.get(f"{self.api_url}/workflows", headers=self.headers, timeout=10, verify=False)
            search_res.raise_for_status()
        except Exception as e:
            print(f"Error ao buscar workflows: {e}")
            return None

        workflows = search_res.json().get('data', [])
        
        workflow_id = None
        for w in workflows:
            if w['name'] == workflow_data['name']:
                workflow_id = w['id']
                break

        if workflow_id:
            print(f"Atualizando workflow existente: {workflow_id}")
            res = requests.put(f"{self.api_url}/workflows/{workflow_id}", 
                             json=workflow_data, headers=self.headers, timeout=30, verify=False)
        else:
            print(f"Criando novo workflow: {workflow_data['name']}")
            res = requests.post(f"{self.api_url}/workflows", 
                              json=workflow_data, headers=self.headers, timeout=30, verify=False)

        if res.status_code >= 400:
            print(f"Erro na API (Status {res.status_code})")
            with open("error_body.json", "w", encoding="utf-8") as ef:
                ef.write(res.text)
            print("Corpo do erro salvo em error_body.json")
        res.raise_for_status()
        deployed_wf = res.json()
        wf_id = deployed_wf.get('id')
        
        if activate:
            print(f"Ativando workflow {wf_id}...")
            try:
                activate_res = requests.post(f"{self.api_url}/workflows/{wf_id}/activate", headers=self.headers, timeout=30, verify=False)
                if activate_res.status_code != 200:
                    print("Ativacao via endpoint falhou, tentando via PUT active: True...")
                    workflow_data['active'] = True
                    requests.put(f"{self.api_url}/workflows/{wf_id}", json=workflow_data, headers=self.headers, timeout=30, verify=False)
            except Exception as e:
                print(f"Error ao ativar: {e}")

        return wf_id

    def get_webhook_url(self, workflow_id: str) -> Optional[str]:
        res = requests.get(f"{self.api_url}/workflows/{workflow_id}", headers=self.headers)
        res.raise_for_status()
        wf = res.json()
        
        # Search for a webhook node
        for node in wf.get('nodes', []):
            if node.get('type') == 'n8n-nodes-base.webhook':
                path = node.get('parameters', {}).get('path', 'webhook')
                # Construct URL (simplified, ideally gets host from N8N settings)
                base_host = self.api_url.replace('/api/v1', '')
                return f"{base_host}/webhook/{path}"
        return None

def main():
    parser = argparse.ArgumentParser(description="Deploy n8n workflow via API")
    parser.add_argument("--workflow", required=True, help="Path to the JSON workflow file")
    parser.add_argument("--activate", action="store_true", help="Activate the workflow after deploy")
    
    args = parser.parse_args()
    
    api_url = os.getenv("N8N_API_URL")
    api_key = os.getenv("N8N_API_KEY")

    if not api_url or not api_key:
        print("Erro: N8N_API_URL e N8N_API_KEY devem estar definidas no ambiente.")
        return

    deployer = N8NDeployer(api_url, api_key)
    
    wf_id = deployer.deploy_workflow(args.workflow, args.activate)
    
    if wf_id:
        print(f"Workflow processado: ID {wf_id}")
        webhook_url = deployer.get_webhook_url(wf_id)
        if webhook_url:
            print(f"Webhook URL: {webhook_url}")
        else:
            print("Nenhum no de webhook encontrado no workflow.")

if __name__ == "__main__":
    main()
