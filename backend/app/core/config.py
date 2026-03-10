"""Configuración de la aplicación"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'seremis.db'))}"
    
    # Security
    JWT_SECRET: str = "seremis_maule_jwt_secret_2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 8
    
    # Files
    UPLOADS_DIR: str = "../uploads"
    MAX_FILE_SIZE: int = 20 * 1024 * 1024  # 20MB
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS from environment if set
        cors_env = os.getenv('CORS_ORIGINS')
        if cors_env:
            self.CORS_ORIGINS = [origin.strip() for origin in cors_env.split(',')]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
