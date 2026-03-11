"""Rutas para Noticias RSS y gestión de Fuentes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.auth import TokenData
from app.schemas.noticias import (
    FuenteRSSCreate, FuenteRSSUpdate, FuenteRSSResponse,
    NoticiaAlertaResponse, SyncResult
)
from app.models.noticia_alerta import FuenteRSS, NoticiaAlerta

router = APIRouter(prefix="/api/noticias", tags=["noticias"])
fuentes_router = APIRouter(prefix="/api/fuentes-rss", tags=["fuentes-rss"])


# ─────────────────────────────────────────────────────────────
# NOTICIAS
# ─────────────────────────────────────────────────────────────

@router.get("", response_model=List[NoticiaAlertaResponse])
def get_noticias(
    etiqueta: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener noticias guardadas, ordenadas por fecha descendente"""
    query = db.query(NoticiaAlerta)
    if etiqueta:
        query = query.filter(NoticiaAlerta.etiqueta == etiqueta)
    return (
        query
        .order_by(NoticiaAlerta.fecha.desc(), NoticiaAlerta.guardadoEn.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/etiquetas", response_model=List[str])
def get_etiquetas(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Devuelve todas las etiquetas únicas de noticias guardadas"""
    rows = db.query(NoticiaAlerta.etiqueta).distinct().all()
    return sorted([r[0] for r in rows if r[0]])


@router.post("/sync", response_model=SyncResult)
def sync_noticias(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Forzar sincronización manual de feeds RSS (solo admin)"""
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores")
    from app.services.rss_scheduler import fetch_all_feeds
    result = fetch_all_feeds(db)
    return result


# ─────────────────────────────────────────────────────────────
# FUENTES RSS
# ─────────────────────────────────────────────────────────────

@fuentes_router.get("", response_model=List[FuenteRSSResponse])
def get_fuentes(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todas las fuentes RSS configuradas"""
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores")
    return db.query(FuenteRSS).order_by(FuenteRSS.etiqueta).all()


@fuentes_router.post("", response_model=FuenteRSSResponse, status_code=status.HTTP_201_CREATED)
def create_fuente(
    fuente: FuenteRSSCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Agregar nueva fuente RSS"""
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores")
    nueva = FuenteRSS(
        **fuente.model_dump(),
        creadoEn=datetime.now().isoformat()
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@fuentes_router.put("/{fuente_id}", response_model=FuenteRSSResponse)
def update_fuente(
    fuente_id: int,
    fuente_update: FuenteRSSUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar fuente RSS (etiqueta, url o activar/desactivar)"""
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores")
    fuente = db.query(FuenteRSS).filter(FuenteRSS.id == fuente_id).first()
    if not fuente:
        raise HTTPException(status_code=404, detail="Fuente no encontrada")
    for field, value in fuente_update.model_dump(exclude_unset=True).items():
        setattr(fuente, field, value)
    db.commit()
    db.refresh(fuente)
    return fuente


@fuentes_router.delete("/{fuente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuente(
    fuente_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar fuente RSS (no elimina noticias ya guardadas)"""
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores")
    fuente = db.query(FuenteRSS).filter(FuenteRSS.id == fuente_id).first()
    if not fuente:
        raise HTTPException(status_code=404, detail="Fuente no encontrada")
    db.delete(fuente)
    db.commit()
