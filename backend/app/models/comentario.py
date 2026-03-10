"""Modelo Comentario"""
from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Comentario(Base):
    __tablename__ = "comentarios"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, nullable=False)
    tabla = Column(String, nullable=False)
    registroId = Column(Integer, nullable=False)
    texto = Column(String, nullable=False)
    autorId = Column(String)
    autorNombre = Column(String)
    fecha = Column(String)
