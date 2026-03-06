"""
Serviço OAuth Instagram/Facebook
Troca authorization code por access token de longa duração e salva no banco.
"""
import os
import secrets
import requests
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from execution.backend.models import Company

logger = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.facebook.com/v19.0"

APP_ID = os.getenv("INSTAGRAM_APP_ID", "").strip()
APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "").strip()
REDIRECT_URI = os.getenv(
    "INSTAGRAM_REDIRECT_URI",
    "https://automacao-dm.vercel.app/api/auth/instagram/callback"
).strip()

logger.info(f"Oauth config loaded: APP_ID prefix={APP_ID[:4]}, ID length={len(APP_ID)}, REDIRECT_URI={REDIRECT_URI}")

SCOPES = ",".join([
    "instagram_basic",
    "instagram_manage_messages",
    "instagram_manage_comments",
    "pages_manage_metadata",
    "pages_read_engagement",
])


def generate_oauth_url(state: str) -> str:
    """Gera URL de autorização do Facebook OAuth."""
    url = (
        f"https://www.facebook.com/dialog/oauth"
        f"?client_id={APP_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope={SCOPES}"
        f"&state={state}"
        f"&response_type=code"
    )
    logger.info(f"Generated OAuth URL: {url}")
    return url


def exchange_code_for_token(code: str) -> dict:
    """Troca authorization code por short-lived token."""
    resp = requests.get(f"{GRAPH_BASE}/oauth/access_token", params={
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "redirect_uri": REDIRECT_URI,
        "code": code,
    })
    resp.raise_for_status()
    return resp.json()  # {access_token, token_type}


def exchange_for_long_lived_token(short_token: str) -> dict:
    """Troca short-lived token por long-lived token (60 dias)."""
    resp = requests.get(f"{GRAPH_BASE}/oauth/access_token", params={
        "grant_type": "fb_exchange_token",
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "fb_exchange_token": short_token,
    })
    resp.raise_for_status()
    return resp.json()  # {access_token, token_type, expires_in}


def get_instagram_account_info(access_token: str) -> dict:
    """
    Busca o Instagram Business Account vinculado ao token.
    Retorna {instagram_account_id, name}.
    """
    # Primeiro: pega as páginas do usuário
    pages_resp = requests.get(f"{GRAPH_BASE}/me/accounts", params={
        "access_token": access_token,
        "fields": "id,name,instagram_business_account",
    })
    pages_resp.raise_for_status()
    pages = pages_resp.json().get("data", [])

    for page in pages:
        ig = page.get("instagram_business_account")
        if ig:
            ig_id = ig["id"]
            # Busca nome do Instagram
            ig_resp = requests.get(f"{GRAPH_BASE}/{ig_id}", params={
                "access_token": access_token,
                "fields": "id,name,username",
            })
            ig_resp.raise_for_status()
            ig_data = ig_resp.json()
            return {
                "instagram_account_id": ig_id,
                "name": ig_data.get("name") or ig_data.get("username", "Conta Instagram"),
            }

    raise ValueError("Nenhum Instagram Business Account encontrado. Certifique-se de que sua conta do Instagram está vinculada como Business a uma Página do Facebook.")


def save_token_to_company(db: Session, instagram_account_id: str, name: str, access_token: str, expires_in: int):
    """Salva ou atualiza a empresa no banco com o token OAuth."""
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None

    company = db.query(Company).filter(
        Company.instagram_account_id == instagram_account_id
    ).first()

    if company:
        company.instagram_access_token = access_token
        company.instagram_token_expires = expires_at
        company.oauth_state = None
    else:
        import uuid
        company = Company(
            id=str(uuid.uuid4()),
            name=name,
            instagram_account_id=instagram_account_id,
            instagram_access_token=access_token,
            instagram_token_expires=expires_at,
            is_active=True,
        )
        db.add(company)

    db.commit()
    db.refresh(company)
    return company
