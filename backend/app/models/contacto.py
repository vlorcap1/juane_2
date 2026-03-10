"""Modelo Contacto"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Contacto(Base):
    __tablename__ = "contactos"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    nombre = Column(String)
    fecha = Column(String)
    lugar = Column(String)
    personas = Column(Integer, default=0)
    tipo = Column(String)
    instituciones = Column(String)
    descripcion = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="contactos")
