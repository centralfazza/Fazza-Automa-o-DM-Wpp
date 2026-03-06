import urllib.parse
password = urllib.parse.quote_plus("Jaguatirica12#%")
# Forçando uso do domain padrão db.vyaonmcdufkerixnybiz.supabase.co porta 5432
db_url = f"postgresql://postgres:{password}@db.vyaonmcdufkerixnybiz.supabase.co:5432/postgres"

import os
os.environ["DATABASE_URL"] = db_url

from execution.backend.database import init_db
try:
    print(f"Iniciando conexao porta 5432...")
    init_db()
    print("TABELAS CRIADAS COM SUCESSO NO SUPABASE!")
except Exception as e:
    print(f"ERRO: {e}")
