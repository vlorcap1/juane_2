"""Rutas para Prensa"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import PrensaCreate, PrensaUpdate, PrensaResponse
from app.schemas.auth import TokenData
from app.models.prensa import Prensa
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/prensa", tags=["prensa"])


@router.get("", response_model=List[PrensaResponse])
def get_prensa(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los registros de prensa"""
    query = db.query(Prensa)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Prensa.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Prensa.seremiId == seremiId)
    
    return query.all()


@router.get("/{prensa_id}", response_model=PrensaResponse)
def get_prensa_item(
    prensa_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un registro de prensa por ID"""
    prensa = db.query(Prensa).filter(Prensa.id == prensa_id).first()
    if not prensa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de prensa no encontrado"
        )
    return prensa


@router.post("", response_model=PrensaResponse, status_code=status.HTTP_201_CREATED)
def create_prensa(
    prensa: PrensaCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo registro de prensa"""
    if current_user.rol == "seremi" and current_user.seremiId:
        prensa.seremiId = current_user.seremiId
    
    db_prensa = Prensa(**prensa.model_dump())
    db.add(db_prensa)
    db.commit()
    db.refresh(db_prensa)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="prensa",
            registroId=db_prensa.id,
            detalles=json.dumps(prensa.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_prensa


@router.put("/{prensa_id}", response_model=PrensaResponse)
def update_prensa(
    prensa_id: int,
    prensa_update: PrensaUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un registro de prensa"""
    db_prensa = db.query(Prensa).filter(Prensa.id == prensa_id).first()
    if not db_prensa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de prensa no encontrado"
        )
    
    update_data = prensa_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_prensa, key, value)
    
    db.commit()
    db.refresh(db_prensa)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="prensa",
            registroId=db_prensa.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_prensa


@router.delete("/{prensa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prensa(
    prensa_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un registro de prensa"""
    db_prensa = db.query(Prensa).filter(Prensa.id == prensa_id).first()
    if not db_prensa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de prensa no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="prensa",
            registroId=db_prensa.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_prensa)
    db.commit()
    
    return None
