"""Modelo Prensa"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Prensa(Base):
    __tablename__ = "prensa"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    titular = Column(String)
    medio = Column(String)
    fecha = Column(String)
    tipoMedio = Column(String)
    tono = Column(String)
    url = Column(String)
    resumen = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="prensas")
