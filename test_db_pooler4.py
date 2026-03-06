import urllib.parse
password = urllib.parse.quote_plus("Xv6qN0ojriDdlw9U")
# Variável exportada pela Vercel Integration
db_url = f"postgresql://postgres.eimnxiduouqdheimbhrq:{password}@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

import os
os.environ["DATABASE_URL"] = db_url

from execution.backend.database import init_db
try:
    print(f"Teste SQLAlchemy")
    init_db()
    print("TABELAS CRIADAS COM SUCESSO NO NOVO SUPABASE DA VERCEL!")
except Exception as e:
    print(f"ERRO: {e.__class__.__name__} - {str(e)[:150]}")
