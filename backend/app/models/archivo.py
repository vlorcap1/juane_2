"""Modelo Archivo"""
from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Archivo(Base):
    __tablename__ = "archivos"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, nullable=False)
    tabla = Column(String)
    registroId = Column(Integer)
    nombre = Column(String, nullable=False)
    nombreDisco = Column(String, nullable=False)
    ruta = Column(String, nullable=False)
    tipo = Column(String)
    tamano = Column(Integer)
    subidoPor = Column(String)
    subidoEn = Column(String)
