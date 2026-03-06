from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from execution.routes import automations, webhooks, companies, analytics
from execution.routes import auth, dashboard
from execution.backend.database import init_db
import os

app = FastAPI(title="Fazza Automation API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
@app.on_event("startup")
def on_startup():
    init_db()

# Serve arquivos estáticos (CSS, JS extras se houver)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# API Routes
app.include_router(automations.router, prefix="/api/automations", tags=["automations"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Dashboard (serve o index.html na raiz)
app.include_router(dashboard.router, tags=["dashboard"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
