"""Rutas para Contactos"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import ContactoCreate, ContactoUpdate, ContactoResponse
from app.schemas.auth import TokenData
from app.models.contacto import Contacto
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/contactos", tags=["contactos"])


@router.get("", response_model=List[ContactoResponse])
def get_contactos(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los contactos, opcionalmente filtrados por SEREMI"""
    query = db.query(Contacto)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Contacto.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Contacto.seremiId == seremiId)
    
    return query.all()


@router.get("/{contacto_id}", response_model=ContactoResponse)
def get_contacto(
    contacto_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un contacto por ID"""
    contacto = db.query(Contacto).filter(Contacto.id == contacto_id).first()
    if not contacto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contacto no encontrado"
        )
    return contacto


@router.post("", response_model=ContactoResponse, status_code=status.HTTP_201_CREATED)
def create_contacto(
    contacto: ContactoCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo contacto"""
    if current_user.rol == "seremi" and current_user.seremiId:
        contacto.seremiId = current_user.seremiId
    
    db_contacto = Contacto(**contacto.model_dump())
    db.add(db_contacto)
    db.commit()
    db.refresh(db_contacto)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="contactos",
            registroId=db_contacto.id,
            detalles=json.dumps(contacto.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_contacto


@router.put("/{contacto_id}", response_model=ContactoResponse)
def update_contacto(
    contacto_id: int,
    contacto_update: ContactoUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un contacto"""
    db_contacto = db.query(Contacto).filter(Contacto.id == contacto_id).first()
    if not db_contacto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contacto no encontrado"
        )
    
    update_data = contacto_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contacto, key, value)
    
    db.commit()
    db.refresh(db_contacto)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="contactos",
            registroId=db_contacto.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_contacto


@router.delete("/{contacto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contacto(
    contacto_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un contacto"""
    db_contacto = db.query(Contacto).filter(Contacto.id == contacto_id).first()
    if not db_contacto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contacto no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="contactos",
            registroId=db_contacto.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_contacto)
    db.commit()
    
    return None
