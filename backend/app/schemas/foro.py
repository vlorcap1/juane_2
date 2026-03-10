"""Schemas Foro y Notificaciones"""
from pydantic import BaseModel
from typing import Optional, List


# ======= FORO =======
class ForoTemaCreate(BaseModel):
    titulo: str
    cuerpo: str


class ForoTemaResponse(BaseModel):
    id: int
    titulo: str
    cuerpo: str
    autorId: str
    autorNombre: str
    creadoEn: str
    ultimaActividad: str
    respuestas: Optional[int] = 0
    
    class Config:
        from_attributes = True


class ForoPostCreate(BaseModel):
    texto: str


class ForoPostResponse(BaseModel):
    id: int
    temaId: int
    texto: str
    autorId: str
    autorNombre: str
    creadoEn: str
    
    class Config:
        from_attributes = True


class ForoTemaPostsResponse(BaseModel):
    tema: ForoTemaResponse
    posts: List[ForoPostResponse]


# ======= NOTIFICACIONES =======
class NotificacionResponse(BaseModel):
    id: int
    userId: str
    tipo: str
    titulo: str
    mensaje: Optional[str] = None
    url: Optional[str] = None
    leida: int
    creadoEn: str
    autorId: Optional[str] = None
    autorNombre: Optional[str] = None
    
    class Config:
        from_attributes = True


class NotificacionCountResponse(BaseModel):
    count: int
