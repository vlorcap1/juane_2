"""Modelo Visita"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Visita(Base):
    __tablename__ = "visitas"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    fecha = Column(String)
    comuna = Column(String)
    lugar = Column(String)
    personas = Column(Integer, default=0)
    descripcion = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="visitas")
