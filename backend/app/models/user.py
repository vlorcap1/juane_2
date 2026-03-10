"""Modelo User"""
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    pass_ = Column("pass", String, nullable=False)  # 'pass' es palabra reservada, usar 'pass_'
    rol = Column(String, nullable=False)
    seremiId = Column(String, ForeignKey("seremis.id"))
    nombre = Column(String, nullable=False)
    cargo = Column(String)
    email = Column(String)
    tel = Column(String)
    
    # Relationships
    seremi = relationship("Seremi", back_populates="users")
