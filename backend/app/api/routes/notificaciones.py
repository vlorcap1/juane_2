"""Rutas de Notificaciones"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.auth import TokenData
from app.schemas.foro import NotificacionResponse, NotificacionCountResponse
from app.models.notificacion import Notificacion

router = APIRouter(prefix="/api/notificaciones", tags=["notificaciones"])


def sqlalchemy_to_dict(obj):
    """Convertir objeto SQLAlchemy a diccionario sin InstanceState"""
    if not obj:
        return None
    
    result = {}
    for column in obj.__table__.columns:
        result[column.name] = getattr(obj, column.name)
    return result


@router.get("", response_model=List[dict])
def get_notificaciones(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todas las notificaciones del usuario"""
    notifs = db.query(Notificacion).filter(
        Notificacion.userId == current_user.id
    ).order_by(Notificacion.creadoEn.desc()).limit(50).all()
    
    return [sqlalchemy_to_dict(n) for n in notifs]


@router.get("/count", response_model=NotificacionCountResponse)
def get_notificaciones_count(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener conteo de notificaciones no leídas"""
    count = db.query(func.count(Notificacion.id)).filter(
        Notificacion.userId == current_user.id,
        Notificacion.leida == 0
    ).scalar()
    
    return {"count": count or 0}


@router.put("/{notif_id}/leer")
def mark_as_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Marcar una notificación como leída"""
    notif = db.query(Notificacion).filter(Notificacion.id == notif_id).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    if notif.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")
    
    notif.leida = 1
    db.commit()
    
    return {"ok": True}


@router.put("/leer-todas")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Marcar todas las notificaciones como leídas"""
    db.query(Notificacion).filter(
        Notificacion.userId == current_user.id,
        Notificacion.leida == 0
    ).update({"leida": 1})
    db.commit()
    
    return {"ok": True}


@router.delete("/{notif_id}")
def delete_notificacion(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar notificación"""
    notif = db.query(Notificacion).filter(Notificacion.id == notif_id).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    if notif.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")
    
    db.delete(notif)
    db.commit()
    
    return {"ok": True}
