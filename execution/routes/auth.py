"""
Rotas de autenticação OAuth Instagram.
"""
import secrets
import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from execution.backend.database import get_db
from execution.backend.models import Company
from execution.backend import oauth_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/instagram/login")
def instagram_login(db: Session = Depends(get_db)):
    """
    Inicia o fluxo OAuth do Instagram.
    Gera um state CSRF e redireciona para o Facebook.
    """
    state = secrets.token_urlsafe(32)

    # Salva o state em uma company temporária ou apenas como cookie/session.
    # Como não temos sessão server-side, o state é verificado no callback via query param.
    # Para multi-empresa: o state poderia ser associado a um company_id existente.
    url = oauth_service.generate_oauth_url(state)
    return RedirectResponse(url=url)


@router.get("/instagram/callback")
def instagram_callback(
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Callback OAuth do Facebook/Instagram.
    Troca o code por token de longa duração e salva no banco.
    """
    if error:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/#/auth/callback?error={error_description or error}")

    if not code:
        raise HTTPException(status_code=400, detail="Code não recebido")

    try:
        # 1. Troca code por short-lived token
        short = oauth_service.exchange_code_for_token(code)
        short_token = short["access_token"]

        # 2. Troca por long-lived token (60 dias)
        long = oauth_service.exchange_for_long_lived_token(short_token)
        long_token = long["access_token"]
        expires_in = long.get("expires_in", 5184000)  # 60 dias default

        # 3. Busca o Instagram Business Account
        ig_info = oauth_service.get_instagram_account_info(long_token)

        # 4. Salva no banco
        company = oauth_service.save_token_to_company(
            db=db,
            instagram_account_id=ig_info["instagram_account_id"],
            name=ig_info["name"],
            access_token=long_token,
            expires_in=expires_in,
        )

        logger.info(f"OAuth concluído para conta Instagram {ig_info['instagram_account_id']}")

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/#/auth/callback?company_id={company.id}")

    except ValueError as e:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/#/auth/callback?error={str(e)}")
    except Exception as e:
        logger.error(f"Erro no OAuth callback: {e}")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/#/auth/callback?error={str(e)}")


@router.get("/instagram/status")
def instagram_status(db: Session = Depends(get_db)):
    """Lista todas as contas conectadas e status dos tokens."""
    companies = db.query(Company).filter(Company.is_active == True).all()
    result = []
    for c in companies:
        result.append({
            "id": c.id,
            "name": c.name,
            "instagram_account_id": c.instagram_account_id,
            "token_expires": c.instagram_token_expires.isoformat() if c.instagram_token_expires else None,
            "has_token": bool(c.instagram_access_token),
        })
    return result


def _html_result(success: bool, message: str, company_id: str = None) -> str:
    color = "#22c55e" if success else "#ef4444"
    icon = "✅" if success else "❌"
    extra = f'<p style="font-size:13px;color:#888;">Company ID: <code>{company_id}</code></p>' if company_id else ""
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>OAuth Instagram</title>
<style>
  body {{font-family:system-ui,sans-serif;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}}
  .card {{background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:40px 48px;text-align:center;max-width:480px}}
  h2 {{color:{color};margin:0 0 12px}}
  p {{color:#ccc;line-height:1.6}}
  a {{display:inline-block;margin-top:24px;padding:10px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}}
</style>
</head>
<body>
<div class="card">
  <h2>{icon} {"Sucesso" if success else "Erro"}</h2>
  <p>{message}</p>
  {extra}
  <a href="/">Voltar ao Dashboard</a>
</div>
</body>
</html>"""
