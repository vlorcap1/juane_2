"""Modelos Foro"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ForoTema(Base):
    __tablename__ = "foro_temas"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    titulo = Column(String, nullable=False)
    cuerpo = Column(String, nullable=False)
    autorId = Column(String, nullable=False)
    autorNombre = Column(String, nullable=False)
    creadoEn = Column(String, nullable=False)
    ultimaActividad = Column(String, nullable=False)
    
    # Relationships
    posts = relationship("ForoPost", back_populates="tema", cascade="all, delete-orphan")


class ForoPost(Base):
    __tablename__ = "foro_posts"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    temaId = Column(Integer, ForeignKey("foro_temas.id", ondelete="CASCADE"), nullable=False)
    texto = Column(String, nullable=False)
    autorId = Column(String, nullable=False)
    autorNombre = Column(String, nullable=False)
    creadoEn = Column(String, nullable=False)
    
    # Relationships
    tema = relationship("ForoTema", back_populates="posts")
