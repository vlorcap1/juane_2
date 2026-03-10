"""Rutas para Temas Relevantes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import TemaCreate, TemaUpdate, TemaResponse
from app.schemas.auth import TokenData
from app.models.tema import Tema
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/temas", tags=["temas"])


@router.get("", response_model=List[TemaResponse])
def get_temas(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los temas relevantes"""
    query = db.query(Tema)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Tema.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Tema.seremiId == seremiId)
    
    return query.all()


@router.get("/{tema_id}", response_model=TemaResponse)
def get_tema(
    tema_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un tema relevante por ID"""
    tema = db.query(Tema).filter(Tema.id == tema_id).first()
    if not tema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tema relevante no encontrado"
        )
    return tema


@router.post("", response_model=TemaResponse, status_code=status.HTTP_201_CREATED)
def create_tema(
    tema: TemaCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo tema relevante"""
    if current_user.rol == "seremi" and current_user.seremiId:
        tema.seremiId = current_user.seremiId
    
    db_tema = Tema(**tema.model_dump())
    db.add(db_tema)
    db.commit()
    db.refresh(db_tema)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="temas",
            registroId=db_tema.id,
            detalles=json.dumps(tema.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_tema


@router.put("/{tema_id}", response_model=TemaResponse)
def update_tema(
    tema_id: int,
    tema_update: TemaUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un tema relevante"""
    db_tema = db.query(Tema).filter(Tema.id == tema_id).first()
    if not db_tema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tema relevante no encontrado"
        )
    
    update_data = tema_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tema, key, value)
    
    db.commit()
    db.refresh(db_tema)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="temas",
            registroId=db_tema.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_tema


@router.delete("/{tema_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tema(
    tema_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un tema relevante"""
    db_tema = db.query(Tema).filter(Tema.id == tema_id).first()
    if not db_tema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tema relevante no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="temas",
            registroId=db_tema.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_tema)
    db.commit()
    
    return None
