"""
FastAPI Backend - SEREMIS Maule
Sistema de Reportería Sectorial
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routes import (
    auth, seremis, foro, notificaciones, users,
    visitas, contactos, prensa, proyectos,
    nudos, temas, agenda, contrataciones,
    archivos, comentarios, kpis, visitas_autoridades, alertas, export
)
import os

# Import models to register them with SQLAlchemy
import app.models  # This will import and register all models

# Crear aplicación FastAPI
app = FastAPI(
    title="SEREMIS Maule API",
    description="Sistema de Reportería Sectorial - Región del Maule",
    version="2.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar carpeta de uploads
uploads_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
if os.path.exists(uploads_path):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Registrar routers
app.include_router(auth.router)
app.include_router(seremis.router)
app.include_router(foro.router)
app.include_router(notificaciones.router)
app.include_router(users.router)
app.include_router(visitas.router)
app.include_router(contactos.router)
app.include_router(prensa.router)
app.include_router(proyectos.router)
app.include_router(nudos.router)
app.include_router(temas.router)
app.include_router(agenda.router)
app.include_router(contrataciones.router)
app.include_router(archivos.router)
app.include_router(comentarios.router)
app.include_router(kpis.router)
app.include_router(visitas_autoridades.router)
app.include_router(alertas.router)
app.include_router(export.router)


@app.get("/")
def read_root():
    """Health check"""
    return {
        "status": "ok",
        "app": "SEREMIS Maule Backend",
        "version": "2.0.0",
        "docs": "/docs"
    }


@app.get("/api/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
