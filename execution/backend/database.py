import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from execution.backend.models import Base

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Supabase PostgreSQL em produção, SQLite local como fallback
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./automation.db"
    print("WARNING: DATABASE_URL not found, using SQLite fallback")
else:
    # Sanitização para o driver psycopg2 que não aceita certos parâmetros do pooler da Vercel
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Remove parâmetro supa=... que causa erro no psycopg2
    if "supa=" in DATABASE_URL:
        # Pega a parte antes do query parameter ou remove apenas o parâmetro problemático
        import urllib.parse as urlparse
        url_parts = list(urlparse.urlparse(DATABASE_URL))
        query = dict(urlparse.parse_qsl(url_parts[4]))
        query.pop('supa', None) # Remove 'supa' se existir
        url_parts[4] = urlparse.urlencode(query)
        DATABASE_URL = urlparse.urlunparse(url_parts)

print(f"INFO: Connecting to database (sanitized URL used)")

# PostgreSQL não usa check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    print("INFO: SQLAlchemy Engine created successfully")
except Exception as e:
    print(f"ERROR: Failed to create SQLAlchemy Engine: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
