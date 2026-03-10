"""Rutas para Proyectos"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import ProyectoCreate, ProyectoUpdate, ProyectoResponse
from app.schemas.auth import TokenData
from app.models.proyecto import Proyecto
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/proyectos", tags=["proyectos"])


@router.get("", response_model=List[ProyectoResponse])
def get_proyectos(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los proyectos"""
    query = db.query(Proyecto)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Proyecto.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Proyecto.seremiId == seremiId)
    
    return query.all()


@router.get("/{proyecto_id}", response_model=ProyectoResponse)
def get_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un proyecto por ID"""
    proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    return proyecto


@router.post("", response_model=ProyectoResponse, status_code=status.HTTP_201_CREATED)
def create_proyecto(
    proyecto: ProyectoCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo proyecto"""
    if current_user.rol == "seremi" and current_user.seremiId:
        proyecto.seremiId = current_user.seremiId
    
    db_proyecto = Proyecto(**proyecto.model_dump())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="proyectos",
            registroId=db_proyecto.id,
            detalles=json.dumps(proyecto.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_proyecto


@router.put("/{proyecto_id}", response_model=ProyectoResponse)
def update_proyecto(
    proyecto_id: int,
    proyecto_update: ProyectoUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un proyecto"""
    db_proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not db_proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    update_data = proyecto_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_proyecto, key, value)
    
    db.commit()
    db.refresh(db_proyecto)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="proyectos",
            registroId=db_proyecto.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_proyecto


@router.delete("/{proyecto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un proyecto"""
    db_proyecto = db.query(Proyecto).filter(Proyecto.id == proyecto_id).first()
    if not db_proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="proyectos",
            registroId=db_proyecto.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_proyecto)
    db.commit()
    
    return None
