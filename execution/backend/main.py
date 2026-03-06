from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import automations, crm, auth, webhooks, integrations, analytics
import uvicorn

app = FastAPI(
    title="Fazza CRM Automation API",
    description="Backend API for Instagram and WhatsApp automations",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(automations.router)
app.include_router(crm.router)
app.include_router(webhooks.router)
app.include_router(integrations.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {"message": "Fazza CRM Automation API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("execution.backend.main:app", host="0.0.0.0", port=port, reload=True)
