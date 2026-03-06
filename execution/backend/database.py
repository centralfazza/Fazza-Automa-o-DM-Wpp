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
DATABASE_URL = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./automation.db"
    print("WARNING: DATABASE_URL not found, using SQLite fallback")
else:
    # Garante prefixo postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Remove parâmetros problemáticos (como supa=...) que o psycopg2 não entende
    if "?" in DATABASE_URL:
        base_url = DATABASE_URL.split("?")[0]
        # Tentamos manter apenas o que é essencial ou apenas a base url se necessário
        # Para SQLAlchemy + PostgreSQL, a base URL funcional costuma ser suficiente
        DATABASE_URL = base_url

print(f"INFO: Connecting to database")

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
