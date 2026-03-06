from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class AutomationBase(BaseModel):
    name: str
    platform: str
    triggers: dict = {}
    actions: List[Any] = []
    is_active: Optional[bool] = True

class AutomationCreate(AutomationBase):
    pass

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    platform: Optional[str] = None
    triggers: Optional[dict] = None
    actions: Optional[List[Any]] = None
    is_active: Optional[bool] = None

class Automation(AutomationBase):
    id: UUID
    stats_triggered: int
    stats_finished: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ContactBase(BaseModel):
    platform: str
    external_id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    tags: List[Any] = []

class Contact(ContactBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MessageBase(BaseModel):
    content: str
    sender_type: str = "user"

class MessageCreate(MessageBase):
    conversation_id: UUID

class Message(MessageBase):
    id: UUID
    conversation_id: UUID
    sent_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalyticsLogBase(BaseModel):
    automation_id: UUID
    success: bool = True
    error_message: Optional[str] = None

class AnalyticsLog(AnalyticsLogBase):
    id: UUID
    executed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AccountBase(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    access_token: str
    api_token: Optional[str] = None
