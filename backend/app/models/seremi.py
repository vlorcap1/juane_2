"""Modelo Seremi"""
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Seremi(Base):
    __tablename__ = "seremis"
    
    id = Column(String, primary_key=True, index=True)
    sector = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    c1 = Column(String)  # Color 1
    c2 = Column(String)  # Color 2
    
    # Relationships
    users = relationship("User", back_populates="seremi")
    visitas = relationship("Visita", back_populates="seremi")
    contactos = relationship("Contacto", back_populates="seremi")
    prensas = relationship("Prensa", back_populates="seremi")
    proyectos = relationship("Proyecto", back_populates="seremi")
    nudos = relationship("Nudo", back_populates="seremi")
    temas = relationship("Tema", back_populates="seremi")
    agendas = relationship("Agenda", back_populates="seremi")
    contrataciones = relationship("Contratacion", back_populates="seremi")
    kpis = relationship("KPI", back_populates="seremi")
