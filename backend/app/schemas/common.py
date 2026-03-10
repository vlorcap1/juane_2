"""Schemas genéricos para entidades"""
from pydantic import BaseModel
from typing import Optional


# ======= VISITA =======
class VisitaBase(BaseModel):
    seremiId: str
    fecha: Optional[str] = None
    comuna: Optional[str] = None
    lugar: Optional[str] = None
    personas: int = 0
    descripcion: Optional[str] = None


class VisitaCreate(VisitaBase):
    pass


class VisitaUpdate(BaseModel):
    fecha: Optional[str] = None
    comuna: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = None
    descripcion: Optional[str] = None


class VisitaResponse(VisitaBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= CONTACTO =======
class ContactoBase(BaseModel):
    seremiId: str
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    personas: int = 0
    tipo: Optional[str] = None
    instituciones: Optional[str] = None
    descripcion: Optional[str] = None


class ContactoCreate(ContactoBase):
    pass


class ContactoUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = None
    tipo: Optional[str] = None
    instituciones: Optional[str] = None
    descripcion: Optional[str] = None


class ContactoResponse(ContactoBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= PRENSA =======
class PrensaBase(BaseModel):
    seremiId: str
    titular: Optional[str] = None
    medio: Optional[str] = None
    fecha: Optional[str] = None
    tipoMedio: Optional[str] = None
    tono: Optional[str] = None
    url: Optional[str] = None
    resumen: Optional[str] = None


class PrensaCreate(PrensaBase):
    pass


class PrensaUpdate(BaseModel):
    titular: Optional[str] = None
    medio: Optional[str] = None
    fecha: Optional[str] = None
    tipoMedio: Optional[str] = None
    tono: Optional[str] = None
    url: Optional[str] = None
    resumen: Optional[str] = None


class PrensaResponse(PrensaBase):
    id: int
    
    class Config:
        from_attributes = True
