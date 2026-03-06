import os
import sys

# Corrige problema de caminhos no AWS Lambda (Vercel)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from execution.backend.app import app
except Exception as e:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import HTMLResponse
    
    app = FastAPI()
    error_trace = traceback.format_exc()
    
    @app.get("/debug-env")
    async def debug_env():
        import os
        app_id = os.getenv("INSTAGRAM_APP_ID", "")
        return {
            "app_id_len": len(app_id),
            "app_id_prefix": app_id[:4] if app_id else "NONE",
            "redirect_uri": os.getenv("INSTAGRAM_REDIRECT_URI", "NOT_SET"),
            "env_keys": list(os.environ.keys())
        }

    @app.get("/{full_path:path}")
    async def debug_error(full_path: str):
        return HTMLResponse(
            status_code=500,
            content=f"<html><body><h1>Vercel Startup Error</h1><pre>{error_trace}</pre></body></html>"
        )
