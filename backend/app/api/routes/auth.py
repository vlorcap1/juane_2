"""Rutas de autenticación"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse
from app.models.user import User
from app.models.audit import AuditLog
import json

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login - autenticar usuario"""
    # Buscar usuario
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verificar contraseña
    if not verify_password(request.password, user.pass_):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Crear token
    token = create_access_token(
        data={"id": user.id, "username": user.username, "rol": user.rol, "seremiId": user.seremiId}
    )
    
    # Audit log
    try:
        audit = AuditLog(
            userId=user.id,
            userName=user.nombre,
            accion="LOGIN",
            tabla="users",
            registroId=user.id,
            detalles=None,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(audit)
        db.commit()
    except:
        pass  # Silencioso como en original
    
    return TokenResponse(
        id=user.id,
        username=user.username,
        rol=user.rol,
        seremiId=user.seremiId,
        nombre=user.nombre,
        cargo=user.cargo,
        email=user.email,
        tel=user.tel,
        token=token
    )
