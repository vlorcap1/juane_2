"""Rutas para KPIs (Indicadores)"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.records import KPICreate, KPIUpdate, KPIResponse
from app.schemas.auth import TokenData
from app.models.kpi import KPI
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api/kpis", tags=["kpis"])


@router.get("", response_model=List[KPIResponse])
def get_kpis(
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los KPIs"""
    query = db.query(KPI)
    
    if current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(KPI.seremiId == current_user.seremiId)
    elif seremiId:
        query = query.filter(KPI.seremiId == seremiId)
    
    return query.all()


@router.get("/{kpi_id}", response_model=KPIResponse)
def get_kpi(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un KPI por ID"""
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI no encontrado"
        )
    return kpi


@router.post("", response_model=KPIResponse, status_code=status.HTTP_201_CREATED)
def create_kpi(
    kpi: KPICreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear un nuevo KPI"""
    if current_user.rol == "seremi" and current_user.seremiId:
        kpi.seremiId = current_user.seremiId
    
    db_kpi = KPI(**kpi.model_dump())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="CREATE",
            tabla="kpi_indicadores",
            registroId=db_kpi.id,
            detalles=json.dumps(kpi.model_dump(), ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_kpi


@router.put("/{kpi_id}", response_model=KPIResponse)
def update_kpi(
    kpi_id: int,
    kpi_update: KPIUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Actualizar un KPI"""
    db_kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not db_kpi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI no encontrado"
        )
    
    update_data = kpi_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_kpi, key, value)
    
    db.commit()
    db.refresh(db_kpi)
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="UPDATE",
            tabla="kpi_indicadores",
            registroId=db_kpi.id,
            detalles=json.dumps(update_data, ensure_ascii=False),
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass
    
    return db_kpi


@router.delete("/{kpi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un KPI"""
    db_kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not db_kpi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI no encontrado"
        )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=current_user.id,
            userName=current_user.username,
            accion="DELETE",
            tabla="kpi_indicadores",
            registroId=db_kpi.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
    except:
        pass
    
    db.delete(db_kpi)
    db.commit()
    
    return None
