"""Rutas de SEREMIs"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.auth import TokenData
from app.schemas.seremi import SeremiResponse
from app.models.seremi import Seremi
from app.models.visita import Visita
from app.models.contacto import Contacto
from app.models.prensa import Prensa
from app.models.proyecto import Proyecto
from app.models.nudo import Nudo
from app.models.tema import Tema
from app.models.agenda import Agenda

router = APIRouter(prefix="/api/seremis", tags=["seremis"])


def sqlalchemy_to_dict(obj):
    """Convertir objeto SQLAlchemy a diccionario sin InstanceState"""
    if not obj:
        return None
    
    result = {}
    for column in obj.__table__.columns:
        result[column.name] = getattr(obj, column.name)
    return result


def get_seremi_data(seremi_id: str, db: Session) -> dict:
    """Replica la función seremiData del original"""
    seremi = db.query(Seremi).filter(Seremi.id == seremi_id).first()
    if not seremi:
        return None
    
    # Obtener todos los datos relacionados
    visitas_arr = db.query(Visita).filter(
        Visita.seremiId == seremi_id
    ).order_by(Visita.fecha.desc()).all()
    
    contactos_arr = db.query(Contacto).filter(
        Contacto.seremiId == seremi_id
    ).order_by(Contacto.fecha.desc()).all()
    
    prensa_arr = db.query(Prensa).filter(
        Prensa.seremiId == seremi_id
    ).order_by(Prensa.fecha.desc()).all()
    
    proyectos_arr = db.query(Proyecto).filter(Proyecto.seremiId == seremi_id).all()
    nudos_arr = db.query(Nudo).filter(Nudo.seremiId == seremi_id).all()
    temas_arr = db.query(Tema).filter(Tema.seremiId == seremi_id).all()
    agenda_arr = db.query(Agenda).filter(
        Agenda.seremiId == seremi_id
    ).order_by(Agenda.fecha.asc()).all()
    
    # Calcular contadores
    visitas_count = len(visitas_arr)
    contactos_count = sum((v.personas or 0) for v in visitas_arr) + \
                     sum((c.personas or 0) for c in contactos_arr)
    prensa_count = len(prensa_arr)
    proyectos_count = len(proyectos_arr)
    
    # Obtener comunas únicas
    comunas = list(set([v.comuna for v in visitas_arr if v.comuna]))
    
    return {
        "id": seremi.id,
        "sector": seremi.sector,
        "nombre": seremi.nombre,
        "c1": seremi.c1,
        "c2": seremi.c2,
        "visitasArray": [sqlalchemy_to_dict(v) for v in visitas_arr],
        "contactosArray": [sqlalchemy_to_dict(c) for c in contactos_arr],
        "prensaItems": [sqlalchemy_to_dict(p) for p in prensa_arr],
        "descripProyectos": [sqlalchemy_to_dict(p) for p in proyectos_arr],
        "nudos": [sqlalchemy_to_dict(n) for n in nudos_arr],
        "temas": [sqlalchemy_to_dict(t) for t in temas_arr],
        "agenda": [sqlalchemy_to_dict(a) for a in agenda_arr],
        "visitasCount": visitas_count,
        "contactosCount": contactos_count,
        "prensaCount": prensa_count,
        "proyectosCount": proyectos_count,
        "visitas": visitas_count,
        "contactos": contactos_count,
        "prensa": prensa_count,
        "proyectos": proyectos_count,
        "comunas": comunas
    }


@router.get("", response_model=List[dict])
def get_all_seremis(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todas las SEREMIs con sus datos"""
    seremis = db.query(Seremi).all()
    result = []
    for s in seremis:
        data = get_seremi_data(s.id, db)
        if data:
            result.append(data)
    return result


@router.get("/{seremi_id}", response_model=dict)
def get_seremi(
    seremi_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener una SEREMI específica con sus datos"""
    data = get_seremi_data(seremi_id, db)
    if not data:
        raise HTTPException(status_code=404, detail="SEREMI no encontrada")
    return data
