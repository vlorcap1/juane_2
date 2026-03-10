"""Modelo de Alerta - Sistema de alertas automáticas"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Alerta(Base):
    __tablename__ = "alertas"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Usuario al que pertenece la alerta
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Información de la alerta
    tipo = Column(String, nullable=False)  # contratacion_vence, kpi_no_cumplido, agenda_proxima, nudo_urgente
    nivel = Column(String, nullable=False)  # info, warning, danger
    titulo = Column(String, nullable=False)
    mensaje = Column(Text)
    url = Column(String)  # URL para navegar al detalle
    
    # Referencia al registro origen
    tablaOrigen = Column(String)  # contrataciones, kpis, agenda, nudos
    registroId = Column(Integer)
    
    # Estado
    leida = Column(Boolean, default=False)
    descartada = Column(Boolean, default=False)
    
    # Metadata
    creadoEn = Column(String, nullable=False)
    
    # Relaciones
    user = relationship("User", backref="alertas")
