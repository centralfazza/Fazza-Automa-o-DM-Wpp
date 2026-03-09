from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from execution.backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String)
    role = Column(String, default="member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Automation(Base):
    __tablename__ = "automations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    platform = Column(String, nullable=False)  # 'instagram', 'whatsapp'
    triggers = Column(JSONB, server_default='{}')
    actions = Column(JSONB, server_default='[]')
    is_active = Column(Boolean, default=True)
    stats_triggered = Column(Integer, default=0)
    stats_finished = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True)
    platform = Column(String) # 'instagram', 'whatsapp'
    external_id = Column(String)
    name = Column(String)
    phone = Column(String)
    avatar_url = Column(Text)
    tags = Column(JSON, server_default='[]')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    platform = Column(String, nullable=False)
    last_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    content = Column(Text)
    sender_type = Column(String) # 'user', 'bot', 'agent'
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False)
    access_token = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WhatsAppAccount(Base):
    __tablename__ = "whatsapp_accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String, nullable=False)
    api_token = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Company(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    instagram_account_id = Column(String, unique=True)
    instagram_access_token = Column(String)
    instagram_token_expires = Column(DateTime)
    whatsapp_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    automation_id = Column(UUID(as_uuid=True), ForeignKey("automations.id"))
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    success = Column(Boolean, default=True)
    error_message = Column(Text)
