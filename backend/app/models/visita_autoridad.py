"""Modelo VisitaAutoridad - Visitas de Ministros, Subsecretarios y Directores Nacionales"""
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class VisitaAutoridad(Base):
    __tablename__ = "visitas_autoridades"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Información de la autoridad
    nombre = Column(String, nullable=False)  # Nombre de la autoridad
    cargo = Column(String)  # Cargo oficial
    tipoAutoridad = Column(String, nullable=False)  # ministro, subsecretario, director_nacional
    ministerio = Column(String)  # Ministerio o institución
    
    # Información de la visita
    fecha = Column(String, nullable=False)  # Fecha de la visita
    comunas = Column(String)  # Comunas visitadas
    agenda = Column(Text)  # Agenda o actividades realizadas
    acompanantes = Column(Text)  # Personas que acompañaron
    
    # SEREMI anfitrión
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    
    # Resultados e impacto
    objetivos = Column(Text)  # Objetivos de la visita
    resultados = Column(Text)  # Resultados obtenidos
    impactoMedios = Column(Text)  # Impacto en medios de comunicación
    
    # Relaciones
    seremi = relationship("Seremi", backref="visitas_autoridades")
