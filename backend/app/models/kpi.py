"""Modelo KPI"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class KPI(Base):
    __tablename__ = "kpi_indicadores"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    seremiId = Column(String, ForeignKey("seremis.id"), nullable=False)
    nombre = Column(String, nullable=False)
    meta = Column(Float, default=0.0)
    real = Column(Float, default=0.0)
    unidad = Column(String)
    periodo = Column(String)
    descripcion = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="kpis")
