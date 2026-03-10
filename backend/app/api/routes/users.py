"""Rutas de usuarios"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.auth import TokenData
from app.models.user import User

router = APIRouter(prefix="/api/users", tags=["users"])


def user_to_dict(user: User) -> dict:
    """Convertir objeto User a diccionario"""
    return {
        "id": user.id,
        "username": user.username,
        "rol": user.rol,
        "seremiId": user.seremiId,
        "nombre": user.nombre,
        "cargo": user.cargo,
        "email": user.email,
        "tel": user.tel
    }


@router.get("", response_model=List[dict])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener todos los usuarios"""
    users = db.query(User).all()
    return [user_to_dict(u) for u in users]


@router.get("/{user_id}", response_model=dict)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener un usuario específico"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user_to_dict(user)