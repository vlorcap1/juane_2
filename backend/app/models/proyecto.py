"""Modelo Proyecto"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Proyecto(Base):
    __tablename__ = "proyectos"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    title = Column(String)
    meta = Column(String)
    estado = Column(String)
    presupuesto = Column(String)
    descripcion = Column(String)
    comunas = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="proyectos")
