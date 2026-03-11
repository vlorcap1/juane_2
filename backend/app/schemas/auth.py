"""Schemas de autenticación"""
from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    id: str
    username: str
    rol: str
    seremiId: Optional[str] = None
    nombre: str
    cargo: Optional[str] = None
    email: Optional[str] = None
    tel: Optional[str] = None
    token: str


class TokenData(BaseModel):
    id: str
    username: str
    rol: str
    seremiId: Optional[str] = None
