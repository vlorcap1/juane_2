"""Schemas User"""
from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    username: str
    nombre: str
    rol: str = "seremi"
    seremiId: Optional[str] = None
    cargo: Optional[str] = None
    email: Optional[str] = None
    tel: Optional[str] = None


class UserCreate(UserBase):
    pass_: str  # Password al crear
    

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    cargo: Optional[str] = None
    username: Optional[str] = None
    pass_: Optional[str] = None  # Password opcional al actualizar
    email: Optional[str] = None
    tel: Optional[str] = None
    rol: Optional[str] = None
    seremiId: Optional[str] = None


class UserResponse(UserBase):
    id: str
    
    class Config:
        from_attributes = True
