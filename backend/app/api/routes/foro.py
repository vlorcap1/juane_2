"""Rutas del Foro"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
import re
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.auth import TokenData
from app.schemas.foro import (
    ForoTemaCreate, ForoTemaResponse, ForoPostCreate, 
    ForoPostResponse, ForoTemaPostsResponse
)
from app.models.foro import ForoTema, ForoPost
from app.models.user import User
from app.models.notificacion import Notificacion

router = APIRouter(prefix="/api/foro", tags=["foro"])


def sqlalchemy_to_dict(obj):
    """Convertir objeto SQLAlchemy a diccionario sin InstanceState"""
    if not obj:
        return None
    
    result = {}
    for column in obj.__table__.columns:
        result[column.name] = getattr(obj, column.name)
    return result


def detect_mentions(texto: str, autor_id: str, autor_nombre: str, tema_id: int, db: Session):
    """Detecta menciones @username y crea notificaciones"""
    try:
        mention_regex = r"@(\w+)"
        matches = re.findall(mention_regex, texto)
        
        if not matches:
            return
        
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        usernames = list(set(matches))  # Eliminar duplicados
        
        for username in usernames:
            user = db.query(User).filter(User.username == username).first()
            if user and user.id != autor_id:  # No notificar al autor
                titulo = f"{autor_nombre} te mencionó en el foro"
                mensaje = texto[:100] + "..." if len(texto) > 100 else texto
                url = f"/foro/tema/{tema_id}"
                
                notif = Notificacion(
                    userId=user.id,
                    tipo="mencion",
                    titulo=titulo,
                    mensaje=mensaje,
                    url=url,
                    leida=0,
                    creadoEn=now,
                    autorId=autor_id,
                    autorNombre=autor_nombre
                )
                db.add(notif)
        
        db.commit()
    except Exception as e:
        print(f"Error detectando menciones: {e}")


@router.get("/users", response_model=List[dict])
def get_foro_users(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Lista de usuarios para @menciones"""
    users = db.query(User.id, User.username, User.nombre, User.cargo).order_by(User.nombre).all()
    return [{"id": u.id, "username": u.username, "nombre": u.nombre, "cargo": u.cargo} for u in users]


@router.get("/temas", response_model=List[dict])
def get_temas(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Listar temas con conteo de respuestas"""
    temas = db.query(
        ForoTema,
        func.count(ForoPost.id).label("respuestas")
    ).outerjoin(ForoPost).group_by(ForoTema.id).order_by(
        ForoTema.ultimaActividad.desc()
    ).all()
    
    result = []
    for tema, respuestas in temas:
        tema_dict = sqlalchemy_to_dict(tema)
        tema_dict["respuestas"] = respuestas
        result.append(tema_dict)
    
    return result


@router.post("/temas", response_model=dict)
def create_tema(
    data: ForoTemaCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Crear tema"""
    titulo = data.titulo.strip()
    cuerpo = data.cuerpo.strip()
    
    if not titulo or not cuerpo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Título y cuerpo son obligatorios"
        )
    
    # Obtener nombre del autor
    user = db.query(User).filter(User.id == current_user.id).first()
    autor_nombre = user.nombre if user else current_user.username
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    tema = ForoTema(
        titulo=titulo,
        cuerpo=cuerpo,
        autorId=current_user.id,
        autorNombre=autor_nombre,
        creadoEn=now,
        ultimaActividad=now
    )
    db.add(tema)
    db.commit()
    db.refresh(tema)
    
    # Detectar menciones
    detect_mentions(cuerpo, current_user.id, autor_nombre, tema.id, db)
    
    return {"id": tema.id}


@router.delete("/temas/{tema_id}")
def delete_tema(
    tema_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar tema (admin o dueño)"""
    tema = db.query(ForoTema).filter(ForoTema.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
    
    if current_user.rol != "admin" and current_user.id != tema.autorId:
        raise HTTPException(status_code=403, detail="Sin permiso")
    
    db.delete(tema)
    db.commit()
    return {"ok": True}


@router.get("/temas/{tema_id}/posts", response_model=dict)
def get_tema_posts(
    tema_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Listar posts de un tema"""
    tema = db.query(ForoTema).filter(ForoTema.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
    
    posts = db.query(ForoPost).filter(
        ForoPost.temaId == tema_id
    ).order_by(ForoPost.id.asc()).all()
    
    tema_dict = sqlalchemy_to_dict(tema)
    
    posts_list = [sqlalchemy_to_dict(post) for post in posts]
    
    return {"tema": tema_dict, "posts": posts_list}


@router.post("/temas/{tema_id}/posts", response_model=dict)
def create_post(
    tema_id: int,
    data: ForoPostCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Agregar post/respuesta"""
    texto = data.texto.strip()
    if not texto:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Texto vacío"
        )
    
    tema = db.query(ForoTema).filter(ForoTema.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
    
    user = db.query(User).filter(User.id == current_user.id).first()
    autor_nombre = user.nombre if user else current_user.username
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    post = ForoPost(
        temaId=tema_id,
        texto=texto,
        autorId=current_user.id,
        autorNombre=autor_nombre,
        creadoEn=now
    )
    db.add(post)
    
    # Actualizar última actividad del tema
    tema.ultimaActividad = now
    
    db.commit()
    db.refresh(post)
    
    # Detectar menciones
    detect_mentions(texto, current_user.id, autor_nombre, tema_id, db)
    
    return {"id": post.id}


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar post (admin o dueño)"""
    post = db.query(ForoPost).filter(ForoPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    
    if current_user.rol != "admin" and current_user.id != post.autorId:
        raise HTTPException(status_code=403, detail="Sin permiso")
    
    db.delete(post)
    db.commit()
    return {"ok": True}
