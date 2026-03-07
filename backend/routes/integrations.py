from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
import models
import os
import httpx
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# --- SCHEMAS ---

class ChannelCreate(BaseModel):
    platform: str  # 'instagram' or 'whatsapp'
    provider_id: str  # Meta Page ID or WA Phone Number ID
    name: str  # Display name (@username or phone)
    access_token: str
    company_id: Optional[str] = None

class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    access_token: Optional[str] = None
    is_active: Optional[bool] = None

# --- CHANNEL CRUD (Real DB) ---

@router.get("/channels")
async def list_channels(platform: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Lists all connected channels, optionally filtered by platform."""
    query = select(models.Channel)
    if platform:
        query = query.where(models.Channel.platform == platform)
    result = await db.execute(query)
    channels = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "platform": c.platform,
            "provider_id": c.provider_id,
            "name": c.name,
            "is_active": c.is_active,
            "company_id": c.company_id,
            "created_at": str(c.created_at) if c.created_at else None,
        }
        for c in channels
    ]

@router.post("/channels")
async def create_channel(channel: ChannelCreate, db: AsyncSession = Depends(get_db)):
    """Manually register a channel (useful for WhatsApp or manual token setup)."""
    # Check for duplicates
    existing = await db.execute(
        select(models.Channel).where(
            models.Channel.platform == channel.platform,
            models.Channel.provider_id == channel.provider_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Channel with this provider_id already exists")

    db_channel = models.Channel(**channel.model_dump())
    db.add(db_channel)
    await db.commit()
    await db.refresh(db_channel)
    return {"id": str(db_channel.id), "status": "created"}

@router.put("/channels/{channel_id}")
async def update_channel(channel_id: str, update: ChannelUpdate, db: AsyncSession = Depends(get_db)):
    """Update a channel's token, name, or active status."""
    from uuid import UUID
    result = await db.execute(select(models.Channel).where(models.Channel.id == UUID(channel_id)))
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(channel, key, value)

    await db.commit()
    await db.refresh(channel)
    return {"id": str(channel.id), "status": "updated"}

@router.delete("/channels/{channel_id}")
async def delete_channel(channel_id: str, db: AsyncSession = Depends(get_db)):
    """Remove a channel."""
    from uuid import UUID
    result = await db.execute(select(models.Channel).where(models.Channel.id == UUID(channel_id)))
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    await db.delete(channel)
    await db.commit()
    return {"status": "deleted"}

# --- INSTAGRAM OAuth FLOW ---

INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_REDIRECT_URI = os.getenv("INSTAGRAM_REDIRECT_URI", "")

@router.get("/instagram/connect")
async def instagram_connect():
    """Step 1: Redirect client to Meta's OAuth consent screen."""
    if not INSTAGRAM_APP_ID or not INSTAGRAM_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Instagram OAuth not configured. Set INSTAGRAM_APP_ID and INSTAGRAM_REDIRECT_URI.")

    auth_url = (
        f"https://www.facebook.com/v21.0/dialog/oauth"
        f"?client_id={INSTAGRAM_APP_ID}"
        f"&redirect_uri={INSTAGRAM_REDIRECT_URI}"
        f"&scope=instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging"
        f"&response_type=code"
    )
    return {"auth_url": auth_url}

@router.get("/instagram/callback")
async def instagram_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Step 2: Meta redirects here with a code. We exchange it for a long-lived token."""
    if not INSTAGRAM_APP_ID or not INSTAGRAM_APP_SECRET:
        raise HTTPException(status_code=500, detail="Instagram OAuth not configured.")

    async with httpx.AsyncClient() as client:
        # Exchange code for short-lived token
        token_resp = await client.get(
            "https://graph.facebook.com/v21.0/oauth/access_token",
            params={
                "client_id": INSTAGRAM_APP_ID,
                "client_secret": INSTAGRAM_APP_SECRET,
                "redirect_uri": INSTAGRAM_REDIRECT_URI,
                "code": code,
            }
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {token_resp.text}")

        short_token = token_resp.json().get("access_token")

        # Exchange short-lived for long-lived token (60 days)
        ll_resp = await client.get(
            "https://graph.facebook.com/v21.0/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": INSTAGRAM_APP_ID,
                "client_secret": INSTAGRAM_APP_SECRET,
                "fb_exchange_token": short_token,
            }
        )
        if ll_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Long-lived token exchange failed: {ll_resp.text}")

        long_lived_token = ll_resp.json().get("access_token")

        # Get the Page info (name, id) linked to this token
        pages_resp = await client.get(
            "https://graph.facebook.com/v21.0/me/accounts",
            params={"access_token": long_lived_token}
        )
        pages_data = pages_resp.json().get("data", [])

        created_channels = []
        for page in pages_data:
            page_id = page.get("id")
            page_name = page.get("name", "Unknown Page")
            page_token = page.get("access_token", long_lived_token)

            # Upsert: update token if channel exists, create if not
            existing = await db.execute(
                select(models.Channel).where(
                    models.Channel.platform == "instagram",
                    models.Channel.provider_id == page_id,
                )
            )
            channel = existing.scalar_one_or_none()

            if channel:
                channel.access_token = page_token
                channel.name = page_name
                channel.is_active = True
            else:
                channel = models.Channel(
                    platform="instagram",
                    provider_id=page_id,
                    name=page_name,
                    access_token=page_token,
                    is_active=True,
                )
                db.add(channel)

            created_channels.append({"page_id": page_id, "name": page_name})

        await db.commit()

        return {
            "status": "success",
            "message": f"{len(created_channels)} channel(s) connected",
            "channels": created_channels,
        }

# --- CONVENIENCE ENDPOINTS (backward compatible) ---

@router.get("/instagram")
async def get_instagram_accounts(db: AsyncSession = Depends(get_db)):
    """Lists connected Instagram channels."""
    result = await db.execute(
        select(models.Channel).where(models.Channel.platform == "instagram")
    )
    channels = result.scalars().all()
    return [
        {"id": str(c.id), "name": c.name, "provider_id": c.provider_id, "status": "active" if c.is_active else "disconnected"}
        for c in channels
    ]

@router.get("/whatsapp")
async def get_whatsapp_accounts(db: AsyncSession = Depends(get_db)):
    """Lists connected WhatsApp channels."""
    result = await db.execute(
        select(models.Channel).where(models.Channel.platform == "whatsapp")
    )
    channels = result.scalars().all()
    return [
        {"id": str(c.id), "name": c.name, "provider_id": c.provider_id, "status": "active" if c.is_active else "disconnected"}
        for c in channels
    ]
