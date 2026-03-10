"""Rutas para Archivos (Upload/Download)"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pathlib import Path
import os
import uuid
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.core.config import settings
from app.schemas.records import ArchivoResponse
from app.schemas.auth import TokenData
from app.models.archivo import Archivo

router = APIRouter(prefix="/api/archivos", tags=["archivos"])


@router.get("", response_model=List[ArchivoResponse])
def get_archivos(
    tabla: str = None,
    registroId: int = None,
    seremiId: str = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener archivos, filtrados opcionalmente"""
    query = db.query(Archivo)
    
    if tabla:
        query = query.filter(Archivo.tabla == tabla)
    if registroId:
        query = query.filter(Archivo.registroId == registroId)
    if seremiId:
        query = query.filter(Archivo.seremiId == seremiId)
    elif current_user.rol == "seremi" and current_user.seremiId:
        query = query.filter(Archivo.seremiId == current_user.seremiId)
    
    return query.order_by(Archivo.subidoEn.desc()).all()


@router.get("/{archivo_id}", response_model=ArchivoResponse)
def get_archivo(
    archivo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener información de un archivo por ID"""
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado"
        )
    return archivo


@router.get("/{archivo_id}/download")
def download_archivo(
    archivo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Descargar un archivo"""
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado"
        )
    
    # Construir ruta completa
    file_path = Path(archivo.ruta)
    if not file_path.is_absolute():
        # Si es relativo, construir desde directorio de uploads
        file_path = Path(__file__).parent.parent.parent.parent / "uploads" / archivo.nombreDisco
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo físico no encontrado"
        )
    
    return FileResponse(
        path=str(file_path),
        filename=archivo.nombre,
        media_type=archivo.tipo or "application/octet-stream"
    )


@router.post("", response_model=ArchivoResponse, status_code=status.HTTP_201_CREATED)
async def upload_archivo(
    file: UploadFile = File(...),
    seremiId: str = None,
    tabla: str = None,
    registroId: int = None,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Subir un nuevo archivo"""
    # Validar tamaño
    file.file.seek(0, 2)  # Ir al final
    file_size = file.file.tell()
    file.file.seek(0)  # Volver al inicio
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Archivo demasiado grande. Máximo {settings.MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Determinar seremiId
    if not seremiId:
        if current_user.rol == "seremi" and current_user.seremiId:
            seremiId = current_user.seremiId
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="seremiId es requerido"
            )
    
    # Crear carpeta uploads si no existe
    uploads_dir = Path(__file__).parent.parent.parent.parent / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    
    # Generar nombre único
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = uploads_dir / unique_filename
    
    # Guardar archivo
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar archivo: {str(e)}"
        )
    
    # Crear registro en BD
    db_archivo = Archivo(
        seremiId=seremiId,
        tabla=tabla,
        registroId=registroId,
        nombre=file.filename,
        nombreDisco=unique_filename,
        ruta=str(file_path),
        tipo=file.content_type,
        tamano=file_size,
        subidoPor=current_user.username,
        subidoEn=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(db_archivo)
    db.commit()
    db.refresh(db_archivo)
    
    return db_archivo


@router.delete("/{archivo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_archivo(
    archivo_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Eliminar un archivo"""
    db_archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    if not db_archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado"
        )
    
    # Solo admin puede eliminar archivos
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar archivos"
        )
    
    # Intentar eliminar archivo físico
    try:
        file_path = Path(db_archivo.ruta)
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass  # Silencioso si falla
    
    # Eliminar registro de BD
    db.delete(db_archivo)
    db.commit()
    
    return None
