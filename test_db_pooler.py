import urllib.parse
password = urllib.parse.quote_plus("Jaguatirica12#%")
urls = [
    f"postgresql://postgres.vyaonmcdufkerixnybiz:{password}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    f"postgresql://postgres.vyaonmcdufkerixnybiz:{password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres",
    f"postgresql://postgres:{password}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    f"postgresql://postgres:{password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres",
]

import os
from execution.backend.database import engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

for i, db_url in enumerate(urls):
    try:
        engine = create_engine(db_url)
        conn = engine.connect()
        print(f"[{i}] SUCCESS: {db_url}")
        conn.close()
    except Exception as e:
        print(f"[{i}] FAIL: {e.__class__.__name__}")
