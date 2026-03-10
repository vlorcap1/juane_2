"""Modelo Notificacion"""
from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    userId = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String, nullable=False)
    titulo = Column(String, nullable=False)
    mensaje = Column(String)
    url = Column(String)
    leida = Column(Integer, default=0)
    creadoEn = Column(String, nullable=False)
    autorId = Column(String)
    autorNombre = Column(String)
