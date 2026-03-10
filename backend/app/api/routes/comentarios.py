"""Rutas para Comentarios"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import ComentarioCreate, ComentarioResponse
from app.schemas.auth import TokenData
from app.models.comentario import Comentario

router = APIRouter(prefix="/api/comentarios", tags=["comentarios"])


@router.get("", response_model=List[ComentarioResponse])
def get_comentarios(
    tabla: str = None,
    registroId: int = None,
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener comentarios, filtrados opcionalmente por tabla, registroId o seremiId"""
    query = db.query(Comentario)
    
    if tabla:
        query = query.filter(Comentario.tabla == tabla)
    if registroId:
        query = query.filter(Comentario.registroId == registroId)
    if seremiId:
        query = query.filter(Comentario.seremiId == seremiId)
    elif current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Comentario.seremiId == current_user.seremiId)
    
    return query.order_by(Comentario.fecha.desc()).all()


@router.get("/{comentario_id}", response_model=ComentarioResponse)
def get_comentario(
    comentario_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un comentario por ID"""
    comentario = db.query(Comentario).filter(Comentario.id == comentario_id).first()
    if not comentario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comentario no encontrado"
        )
    return comentario


@router.post("", response_model=ComentarioResponse, status_code=status.HTTP_201_CREATED)
def create_comentario(
    comentario: ComentarioCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo comentario"""
    # Asignar autor automáticamente del usuario actual
    comentario_data = comentario.model_dump()
    comentario_data["autorId"] = current_user.id
    comentario_data["autorNombre"] = current_user.username
    comentario_data["fecha"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Si el usuario es seremi, usar su seremiId
    if current_user.rol == "seremi" and current_user.seremiId:
        comentario_data["seremiId"] = current_user.seremiId
    
    db_comentario = Comentario(**comentario_data)
    db.add(db_comentario)
    db.commit()
    db.refresh(db_comentario)
    
    return db_comentario


@router.delete("/{comentario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comentario(
    comentario_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un comentario"""
    db_comentario = db.query(Comentario).filter(Comentario.id == comentario_id).first()
    if not db_comentario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comentario no encontrado"
        )
    
    # Solo admin o el autor pueden eliminar
    if current_user.rol != "admin" and db_comentario.autorId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este comentario"
        )
    
    db.delete(db_comentario)
    db.commit()
    
    return None
