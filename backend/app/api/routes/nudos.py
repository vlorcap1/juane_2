"""Rutas para Nudos Críticos"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import NudoCreate, NudoUpdate, NudoResponse
from app.schemas.auth import TokenData
from app.models.nudo import Nudo
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/nudos", tags=["nudos"])


@router.get("", response_model=List[NudoResponse])
def get_nudos(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los nudos críticos"""
    query = db.query(Nudo)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Nudo.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Nudo.seremiId == seremiId)
    
    return query.all()


@router.get("/{nudo_id}", response_model=NudoResponse)
def get_nudo(
    nudo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un nudo crítico por ID"""
    nudo = db.query(Nudo).filter(Nudo.id == nudo_id).first()
    if not nudo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudo crítico no encontrado"
        )
    return nudo


@router.post("", response_model=NudoResponse, status_code=status.HTTP_201_CREATED)
def create_nudo(
    nudo: NudoCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo nudo crítico"""
    if current_user.rol == "seremi" and current_user.seremiId:
        nudo.seremiId = current_user.seremiId
    
    db_nudo = Nudo(**nudo.model_dump())
    db.add(db_nudo)
    db.commit()
    db.refresh(db_nudo)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="nudos",
            registroId=db_nudo.id,
            detalles=json.dumps(nudo.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_nudo


@router.put("/{nudo_id}", response_model=NudoResponse)
def update_nudo(
    nudo_id: int,
    nudo_update: NudoUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un nudo crítico"""
    db_nudo = db.query(Nudo).filter(Nudo.id == nudo_id).first()
    if not db_nudo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudo crítico no encontrado"
        )
    
    update_data = nudo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_nudo, key, value)
    
    db.commit()
    db.refresh(db_nudo)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="nudos",
            registroId=db_nudo.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_nudo


@router.delete("/{nudo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nudo(
    nudo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un nudo crítico"""
    db_nudo = db.query(Nudo).filter(Nudo.id == nudo_id).first()
    if not db_nudo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudo crítico no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="nudos",
            registroId=db_nudo.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_nudo)
    db.commit()
    
    return None
