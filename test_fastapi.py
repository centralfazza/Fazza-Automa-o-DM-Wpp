import requests

try:
    resp = requests.get("https://automacao-jzxuxldbv-centralfazza-6228s-projects.vercel.app/api/webhooks/instagram")
    print(f"Status: {resp.status_code}")
    print(resp.text)
except Exception as e:
    print(f"Erro: {e}")
