"""Rutas para Visitas"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import VisitaCreate, VisitaUpdate, VisitaResponse
from app.schemas.auth import TokenData
from app.models.visita import Visita
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/visitas", tags=["visitas"])


@router.get("", response_model=List[VisitaResponse])
def get_visitas(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todas las visitas, opcionalmente filtradas por SEREMI"""
    query = db.query(Visita)
    
    # Si el usuario es seremi, filtrar por su seremiId
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Visita.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Visita.seremiId == seremiId)
    
    return query.all()


@router.get("/{visita_id}", response_model=VisitaResponse)
def get_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener una visita por ID"""
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita no encontrada"
        )
    return visita


@router.post("", response_model=VisitaResponse, status_code=status.HTTP_201_CREATED)
def create_visita(
    visita: VisitaCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear una nueva visita"""
    # Si el usuario es seremi, usar su seremiId
    if current_user.rol == "seremi" and current_user.seremiId:
        visita.seremiId = current_user.seremiId
    
    db_visita = Visita(**visita.model_dump())
    db.add(db_visita)
    db.commit()
    db.refresh(db_visita)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="visitas",
            registroId=db_visita.id,
            detalles=json.dumps(visita.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_visita


@router.put("/{visita_id}", response_model=VisitaResponse)
def update_visita(
    visita_id: int,
    visita_update: VisitaUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar una visita"""
    db_visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not db_visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita no encontrada"
        )
    
    # Actualizar campos
    update_data = visita_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_visita, key, value)
    
    db.commit()
    db.refresh(db_visita)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="visitas",
            registroId=db_visita.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_visita


@router.delete("/{visita_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar una visita"""
    db_visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not db_visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita no encontrada"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="visitas",
            registroId=db_visita.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_visita)
    db.commit()
    
    return None
