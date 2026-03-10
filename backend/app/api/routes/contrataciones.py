"""Rutas para Contrataciones con VB"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import ContratacionCreate, ContratacionUpdate, ContratacionResponse
from app.schemas.auth import TokenData
from app.models.contratacion import Contratacion
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/contrataciones", tags=["contrataciones"])


@router.get("", response_model=List[ContratacionResponse])
def get_contrataciones(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todas las contrataciones"""
    query = db.query(Contratacion)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Contratacion.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Contratacion.seremiId == seremiId)
    
    return query.all()


@router.get("/{contratacion_id}", response_model=ContratacionResponse)
def get_contratacion(
    contratacion_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener una contratación por ID"""
    contratacion = db.query(Contratacion).filter(Contratacion.id == contratacion_id).first()
    if not contratacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contratación no encontrada"
        )
    return contratacion


@router.post("", response_model=ContratacionResponse, status_code=status.HTTP_201_CREATED)
def create_contratacion(
    contratacion: ContratacionCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear una nueva contratación"""
    if current_user.rol == "seremi" and current_user.seremiId:
        contratacion.seremiId = current_user.seremiId
    
    db_contratacion = Contratacion(**contratacion.model_dump())
    db.add(db_contratacion)
    db.commit()
    db.refresh(db_contratacion)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="contrataciones",
            registroId=db_contratacion.id,
            detalles=json.dumps(contratacion.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_contratacion


@router.put("/{contratacion_id}", response_model=ContratacionResponse)
def update_contratacion(
    contratacion_id: int,
    contratacion_update: ContratacionUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar una contratación"""
    db_contratacion = db.query(Contratacion).filter(Contratacion.id == contratacion_id).first()
    if not db_contratacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contratación no encontrada"
        )
    
    update_data = contratacion_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contratacion, key, value)
    
    db.commit()
    db.refresh(db_contratacion)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="contrataciones",
            registroId=db_contratacion.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_contratacion


@router.delete("/{contratacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contratacion(
    contratacion_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar una contratación"""
    db_contratacion = db.query(Contratacion).filter(Contratacion.id == contratacion_id).first()
    if not db_contratacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contratación no encontrada"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="contrataciones",
            registroId=db_contratacion.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_contratacion)
    db.commit()
    
    return None
