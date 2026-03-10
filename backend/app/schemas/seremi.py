"""Schemas Seremi"""
from pydantic import BaseModel
from typing import Optional, List, Any


class SeremiBase(BaseModel):
    id: str
    sector: str
    nombre: str
    c1: Optional[str] = None
    c2: Optional[str] = None


class SeremiResponse(SeremiBase):
    # Campos adicionales que se agregan dinámicamente en el servicio
    visitasArray: Optional[List[Any]] = []
    contactosArray: Optional[List[Any]] = []
    prensaItems: Optional[List[Any]] = []
    descripProyectos: Optional[List[Any]] = []
    nudos: Optional[List[Any]] = []
    temas: Optional[List[Any]] = []
    agenda: Optional[List[Any]] = []
    visitasCount: int = 0
    contactosCount: int = 0
    prensaCount: int = 0
    proyectosCount: int = 0
    visitas: int = 0
    contactos: int = 0
    prensa: int = 0
    proyectos: int = 0
    comunas: List[str] = []
    
    class Config:
        from_attributes = True
