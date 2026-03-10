"""Modelo Contratacion"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Contratacion(Base):
    __tablename__ = "contrataciones"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    nombre = Column(String)
    rut = Column(String)
    cargo = Column(String)
    grado = Column(String)
    tipo = Column(String)
    esNuevo = Column(String, default="Nuevo")
    inicio = Column(String)
    termino = Column(String)
    monto = Column(String)
    financ = Column(String)
    just = Column(String)
    estado = Column(String, default="Pendiente")
    vbQuien = Column(String)
    vbFecha = Column(String)
    motivoRechazo = Column(String)  # Nuevo campo para comentarios de rechazo
    creadoPor = Column(String)
    creadoEn = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="contrataciones")
