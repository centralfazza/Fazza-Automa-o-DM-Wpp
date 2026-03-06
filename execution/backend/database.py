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
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./automation.db")

# PostgreSQL não usa check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
