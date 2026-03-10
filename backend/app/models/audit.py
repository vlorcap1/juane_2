"""Modelo AuditLog"""
from sqlalchemy import Column, Integer, String
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    userId = Column(String)
    userName = Column(String)
    accion = Column(String, nullable=False)
    tabla = Column(String)
    registroId = Column(String)
    detalles = Column(String)
    fecha = Column(String)
