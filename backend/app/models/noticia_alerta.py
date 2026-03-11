"""Modelos para noticias RSS y fuentes de alerta"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class FuenteRSS(Base):
    __tablename__ = "fuentes_rss"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    etiqueta = Column(String, nullable=False)   # Ej: "Región del Maule"
    url = Column(String, nullable=False)         # URL del feed RSS de Google Alerts
    activo = Column(Boolean, default=True)
    creadoEn = Column(String)

    noticias = relationship("NoticiaAlerta", back_populates="fuente_rss")


class NoticiaAlerta(Base):
    __tablename__ = "noticias_alertas"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    titulo = Column(String, nullable=False)
    enlace = Column(String, unique=True, nullable=False)   # Evita duplicados
    fecha = Column(String)                                  # Fecha de publicación del feed
    fuente = Column(String)                                 # Ej: "Maule Noticias", "La Tercera"
    fuenteRssId = Column(Integer, ForeignKey("fuentes_rss.id"), nullable=True)
    etiqueta = Column(String)                               # Copiado de FuenteRSS al guardar
    guardadoEn = Column(String)                             # Cuándo lo guardamos en BD

    fuente_rss = relationship("FuenteRSS", back_populates="noticias")
