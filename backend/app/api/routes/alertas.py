"""API routes for Sistema de Alertas Automáticas"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.alerta import Alerta
from app.models.contratacion import Contratacion
from app.models.kpi import KPI
from app.models.agenda import Agenda
from app.models.nudo import Nudo
from app.schemas.records import AlertaResponse


router = APIRouter(prefix="/api/alertas", tags=["alertas"])


def generar_alertas_automaticas(db: Session, user: User):
    """
    Genera alertas automáticas para el usuario basadas en:
    - Contrataciones próximas a vencer (30 días)
    - KPIs no cumplidos (real < meta)
    - Agenda de hitos próximos (7 días)
    - Nudos críticos con urgencia Alta
    """
    alertas_nuevas = []
    ahora = datetime.now()
    fecha_hoy = ahora.date()
    
    # Determinar qué SEREMIs monitorear
    if user.rol == "admin":
        seremi_filter = None  # Ver todas
    else:
        seremi_filter = user.seremiId
    
    # 1. CONTRATACIONES PRÓXIMAS A VENCER (30 días)
    query_c = db.query(Contratacion).filter(Contratacion.termino.isnot(None))
    if seremi_filter:
        query_c = query_c.filter(Contratacion.seremiId == seremi_filter)
    
    contrataciones = query_c.all()
    for c in contrataciones:
        try:
            fecha_termino = datetime.strptime(c.termino, "%Y-%m-%d").date()
            dias_restantes = (fecha_termino - fecha_hoy).days
            
            if 0 < dias_restantes <= 30:
                # Verificar si ya existe una alerta similar
                existe = db.query(Alerta).filter(
                    Alerta.userId == user.id,
                    Alerta.tipo == "contratacion_vence",
                    Alerta.registroId == c.id,
                    Alerta.descartada == False
                ).first()
                
                if not existe:
                    nivel = "danger" if dias_restantes <= 7 else "warning"
                    alerta = Alerta(
                        userId=user.id,
                        tipo="contratacion_vence",
                        nivel=nivel,
                        titulo=f"Contratación vence en {dias_restantes} días",
                        mensaje=f"{c.nombre} termina el {c.termino}",
                        url=f"/contrataciones/{c.id}",
                        tablaOrigen="contrataciones",
                        registroId=c.id,
                        creadoEn=ahora.isoformat()
                    )
                    db.add(alerta)
                    alertas_nuevas.append(alerta)
        except:
            continue
    
    # 2. KPIs NO CUMPLIDOS (real < meta)
    query_k = db.query(KPI)
    if seremi_filter:
        query_k = query_k.filter(KPI.seremiId == seremi_filter)
    
    kpis = query_k.all()
    for k in kpis:
        if k.meta and k.real is not None:
            if k.real < k.meta:
                # Verificar si ya existe
                existe = db.query(Alerta).filter(
                    Alerta.userId == user.id,
                    Alerta.tipo == "kpi_no_cumplido",
                    Alerta.registroId == k.id,
                    Alerta.descartada == False
                ).first()
                
                if not existe:
                    porcentaje = (k.real / k.meta * 100) if k.meta > 0 else 0
                    alerta = Alerta(
                        userId=user.id,
                        tipo="kpi_no_cumplido",
                        nivel="warning",
                        titulo=f"KPI no cumplido: {k.nombre}",
                        mensaje=f"Avance: {porcentaje:.1f}% ({k.real}/{k.meta} {k.unidad or ''})",
                        url=f"/kpis/{k.id}",
                        tablaOrigen="kpis",
                        registroId=k.id,
                        creadoEn=ahora.isoformat()
                    )
                    db.add(alerta)
                    alertas_nuevas.append(alerta)
    
    # 3. AGENDA PRÓXIMA (7 días)
    query_a = db.query(Agenda).filter(Agenda.fecha.isnot(None))
    if seremi_filter:
        query_a = query_a.filter(Agenda.seremiId == seremi_filter)
    
    agenda_items = query_a.all()
    for a in agenda_items:
        try:
            fecha_evento = datetime.strptime(a.fecha, "%Y-%m-%d").date()
            dias_restantes = (fecha_evento - fecha_hoy).days
            
            if 0 <= dias_restantes <= 7:
                # Verificar si ya existe
                existe = db.query(Alerta).filter(
                    Alerta.userId == user.id,
                    Alerta.tipo == "agenda_proxima",
                    Alerta.registroId == a.id,
                    Alerta.descartada == False
                ).first()
                
                if not existe:
                    nivel = "info" if dias_restantes > 3 else "warning"
                    texto_dias = "hoy" if dias_restantes == 0 else f"en {dias_restantes} días"
                    alerta = Alerta(
                        userId=user.id,
                        tipo="agenda_proxima",
                        nivel=nivel,
                        titulo=f"Evento {texto_dias}: {a.texto}",
                        mensaje=f"{a.cat or 'Evento'} programado para {a.fecha}",
                        url=f"/agenda/{a.id}",
                        tablaOrigen="agenda",
                        registroId=a.id,
                        creadoEn=ahora.isoformat()
                    )
                    db.add(alerta)
                    alertas_nuevas.append(alerta)
        except:
            continue
    
    # 4. NUDOS CRÍTICOS URGENTES
    query_n = db.query(Nudo).filter(Nudo.urgencia == "Alta")
    if seremi_filter:
        query_n = query_n.filter(Nudo.seremiId == seremi_filter)
    
    nudos = query_n.all()
    for n in nudos:
        # Verificar si ya existe
        existe = db.query(Alerta).filter(
            Alerta.userId == user.id,
            Alerta.tipo == "nudo_urgente",
            Alerta.registroId == n.id,
            Alerta.descartada == False
        ).first()
        
        if not existe:
            alerta = Alerta(
                userId=user.id,
                tipo="nudo_urgente",
                nivel="danger",
                titulo=f"Nudo crítico urgente: {n.title}",
                mensaje=n.desc[:100] if n.desc else "Requiere atención inmediata",
                url=f"/nudos/{n.id}",
                tablaOrigen="nudos",
                registroId=n.id,
                creadoEn=ahora.isoformat()
            )
            db.add(alerta)
            alertas_nuevas.append(alerta)
    
    if alertas_nuevas:
        db.commit()
    
    return len(alertas_nuevas)


@router.get("", response_model=List[AlertaResponse])
def get_alertas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todas las alertas activas del usuario.
    Genera automáticamente nuevas alertas antes de devolver la lista.
    """
    # Generar alertas automáticas
    generar_alertas_automaticas(db, current_user)
    
    # Obtener alertas NO descartadas
    alertas = db.query(Alerta).filter(
        Alerta.userId == current_user.id,
        Alerta.descartada == False
    ).order_by(Alerta.leida.asc(), Alerta.creadoEn.desc()).all()
    
    return alertas


@router.get("/count")
def get_alertas_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener contador de alertas no leídas"""
    # Generar alertas primero
    generar_alertas_automaticas(db, current_user)
    
    count = db.query(Alerta).filter(
        Alerta.userId == current_user.id,
        Alerta.leida == False,
        Alerta.descartada == False
    ).count()
    
    return {"count": count}


@router.put("/{alerta_id}/leer")
def marcar_alerta_leida(
    alerta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marcar una alerta como leída"""
    alerta = db.query(Alerta).filter(
        Alerta.id == alerta_id,
        Alerta.userId == current_user.id
    ).first()
    
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )
    
    alerta.leida = True
    db.commit()
    
    return {"message": "Alerta marcada como leída"}


@router.put("/leer-todas")
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marcar todas las alertas como leídas"""
    db.query(Alerta).filter(
        Alerta.userId == current_user.id,
        Alerta.leida == False
    ).update({"leida": True})
    db.commit()
    
    return {"message": "Todas las alertas marcadas como leídas"}


@router.delete("/{alerta_id}")
def descartar_alerta(
    alerta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Descartar una alerta (soft delete)"""
    alerta = db.query(Alerta).filter(
        Alerta.id == alerta_id,
        Alerta.userId == current_user.id
    ).first()
    
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )
    
    alerta.descartada = True
    db.commit()
    
    return {"message": "Alerta descartada"}


@router.delete("/limpiar")
def limpiar_alertas_leidas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Descartar todas las alertas leídas"""
    db.query(Alerta).filter(
        Alerta.userId == current_user.id,
        Alerta.leida == True
    ).update({"descartada": True})
    db.commit()
    
    return {"message": "Alertas leídas descartadas"}
