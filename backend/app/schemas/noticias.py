"""Schemas Pydantic para Noticias RSS y Fuentes"""
from pydantic import BaseModel
from typing import Optional, List


# ======= FUENTE RSS =======

class FuenteRSSBase(BaseModel):
    etiqueta: str
    url: str
    activo: Optional[bool] = True


class FuenteRSSCreate(FuenteRSSBase):
    pass


class FuenteRSSUpdate(BaseModel):
    etiqueta: Optional[str] = None
    url: Optional[str] = None
    activo: Optional[bool] = None


class FuenteRSSResponse(FuenteRSSBase):
    id: int
    creadoEn: Optional[str] = None

    class Config:
        from_attributes = True


# ======= NOTICIA ALERTA =======

class NoticiaAlertaResponse(BaseModel):
    id: int
    titulo: str
    enlace: str
    fecha: Optional[str] = None
    fuente: Optional[str] = None
    fuenteRssId: Optional[int] = None
    etiqueta: Optional[str] = None
    guardadoEn: Optional[str] = None

    class Config:
        from_attributes = True


class SyncResult(BaseModel):
    nuevas: int
    fuentes_procesadas: int
    errores: List[str] = []
