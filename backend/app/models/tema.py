"""Modelo Tema"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Tema(Base):
    __tablename__ = "temas"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    tema = Column(String)
    ambito = Column(String)
    prioridad = Column(String)
    descripcion = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="temas")
