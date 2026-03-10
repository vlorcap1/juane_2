"""Modelo Nudo"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Nudo(Base):
    __tablename__ = "nudos"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    title = Column(String)
    desc = Column(String)
    urgencia = Column(String)
    solucion = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="nudos")
