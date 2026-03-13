"""Rutas para Agenda"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import AgendaCreate, AgendaUpdate, AgendaResponse
from app.schemas.auth import TokenData
from app.models.agenda import Agenda
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/agenda", tags=["agenda"])


def _validate_seremi_agenda_date(fecha_str: str):
    """Valida que la fecha de agenda para SEREMI sea al menos hoy + 3 días."""
    if not fecha_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de agenda es obligatoria"
        )

    try:
        fecha = datetime.strptime(fecha_str[:10], "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fecha inválido. Usa YYYY-MM-DD"
        )

    fecha_minima = (datetime.now().date() + timedelta(days=3))
    if fecha < fecha_minima:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Los SEREMI solo pueden agendar desde {fecha_minima.isoformat()} en adelante"
        )


@router.get("", response_model=List[AgendaResponse])
def get_agenda(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los eventos de agenda"""
    query = db.query(Agenda)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Agenda.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(Agenda.seremiId == seremiId)
    
    return query.all()


@router.get("/{agenda_id}", response_model=AgendaResponse)
def get_agenda_item(
    agenda_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un evento de agenda por ID"""
    agenda = db.query(Agenda).filter(Agenda.id == agenda_id).first()
    if not agenda:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de agenda no encontrado"
        )
    return agenda


@router.post("", response_model=AgendaResponse, status_code=status.HTTP_201_CREATED)
def create_agenda(
    agenda: AgendaCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo evento de agenda"""
    if current_user.rol == "seremi" and current_user.seremiId:
        _validate_seremi_agenda_date(agenda.fecha)
        agenda.seremiId = current_user.seremiId
    
    db_agenda = Agenda(**agenda.model_dump())
    db.add(db_agenda)
    db.commit()
    db.refresh(db_agenda)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="agenda",
            registroId=db_agenda.id,
            detalles=json.dumps(agenda.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_agenda


@router.put("/{agenda_id}", response_model=AgendaResponse)
def update_agenda(
    agenda_id: int,
    agenda_update: AgendaUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un evento de agenda"""
    db_agenda = db.query(Agenda).filter(Agenda.id == agenda_id).first()
    if not db_agenda:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de agenda no encontrado"
        )

    if current_user.rol == "seremi" and agenda_update.fecha is not None:
        _validate_seremi_agenda_date(agenda_update.fecha)
    
    update_data = agenda_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_agenda, key, value)
    
    db.commit()
    db.refresh(db_agenda)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="agenda",
            registroId=db_agenda.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_agenda


@router.delete("/{agenda_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agenda(
    agenda_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un evento de agenda"""
    db_agenda = db.query(Agenda).filter(Agenda.id == agenda_id).first()
    if not db_agenda:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de agenda no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="agenda",
            registroId=db_agenda.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_agenda)
    db.commit()
    
    return None
