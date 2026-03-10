"""Modelo Agenda"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Agenda(Base):
    __tablename__ = "agenda"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    fecha = Column(String)
    hora = Column(String)
    texto = Column(String)
    cat = Column(String)
    lugar = Column(String)
    notas = Column(String)
    minuta = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="agendas")
