from sqlalchemy import Column, String, Integer, Boolean, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True)
    name = Column(String)
    instagram_account_id = Column(String, unique=True, index=True)
    instagram_access_token = Column(Text)       # token longa duração (60 dias)
    instagram_token_expires = Column(DateTime, nullable=True)
    whatsapp_number = Column(String)
    is_active = Column(Boolean, default=True)
    oauth_state = Column(String, nullable=True)  # CSRF para OAuth flow
    created_at = Column(DateTime, default=datetime.utcnow)

    automations = relationship("Automation", back_populates="company")
    contacts = relationship("Contact", back_populates="company")

class Automation(Base):
    __tablename__ = "automations"
    
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    name = Column(String)
    platform = Column(String, default="instagram") # instagram, whatsapp
    is_active = Column(Boolean, default=True)
    triggers = Column(JSON) # {type: "comment", keywords: ["quero", "valor"]}
    actions = Column(JSON) # [{order: 1, type: "reply_comment", content: "Olá!"}, {order: 2, type: "send_dm", content: "..."}]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="automations")
    logs = relationship("AnalyticsLog", back_populates="automation")

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(String, ForeignKey("companies.id"))
    platform = Column(String)
    external_id = Column(String, index=True) # ID do Instagram ou Telefone do WhatsApp
    username = Column(String)
    tags = Column(JSON, default=[])
    last_interaction = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="contacts")

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    automation_id = Column(String, ForeignKey("automations.id"))
    executed_at = Column(DateTime, default=datetime.utcnow)
    success = Column(Boolean)
    trigger_data = Column(JSON)
    error_message = Column(String, nullable=True)
    
    automation = relationship("Automation", back_populates="logs")
