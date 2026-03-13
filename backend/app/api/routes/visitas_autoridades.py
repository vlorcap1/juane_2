"""API routes for Visitas de Autoridades (Ministros, Subsecretarios, Directores)"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pathlib import Path
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.visita_autoridad import VisitaAutoridad
from app.models.seremi import Seremi
from app.models.audit import AuditLog
from app.models.archivo import Archivo
from app.schemas.records import VisitaAutoridadCreate, VisitaAutoridadUpdate, VisitaAutoridadResponse
from app.core.config import settings


router = APIRouter(prefix="/api/visitas-autoridades", tags=["visitas_autoridades"])


@router.get("", response_model=List[VisitaAutoridadResponse])
def get_visitas_autoridades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todas las visitas de autoridades.
    Usuarios SEREMI solo ven las visitas donde son anfitriones.
    """
    query = db.query(VisitaAutoridad)
    
    # Filtrar por SEREMI si no es admin
    if current_user.rol != "admin":
        query = query.filter(VisitaAutoridad.seremiId == current_user.seremiId)
    
    visitas = query.all()
    
    # Enriquecer con nombre de SEREMI y contador de archivos
    result = []
    for v in visitas:
        seremi = db.query(Seremi).filter(Seremi.id == v.seremiId).first()
        # Contar archivos adjuntos
        from app.models.archivo import Archivo
        num_archivos = db.query(Archivo).filter(
            Archivo.tabla == "visitas_autoridades",
            Archivo.registroId == v.id
        ).count()
        
        visita_dict = {
            "id": v.id,
            "nombre": v.nombre,
            "cargo": v.cargo,
            "tipoAutoridad": v.tipoAutoridad,
            "ministerio": v.ministerio,
            "fecha": v.fecha,
            "comunas": v.comunas,
            "agenda": v.agenda,
            "acompanantes": v.acompanantes,
            "seremiId": v.seremiId,
            "objetivos": v.objetivos,
            "resultados": v.resultados,
            "impactoMedios": v.impactoMedios,
            "seremiNombre": seremi.nombre if seremi else None,
            "numArchivos": num_archivos
        }
        result.append(VisitaAutoridadResponse(**visita_dict))
    
    return result


@router.get("/{visita_id}", response_model=VisitaAutoridadResponse)
def get_visita_autoridad(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener una visita de autoridad por ID"""
    visita = db.query(VisitaAutoridad).filter(VisitaAutoridad.id == visita_id).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita de autoridad no encontrada"
        )
    
    # Verificar permisos
    if current_user.rol != "admin" and visita.seremiId != current_user.seremiId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta visita"
        )
    
    # Enriquecer
    seremi = db.query(Seremi).filter(Seremi.id == visita.seremiId).first()
    from app.models.archivo import Archivo
    num_archivos = db.query(Archivo).filter(
        Archivo.tabla == "visitas_autoridades",
        Archivo.registroId == visita.id
    ).count()
    
    visita_dict = {
        "id": visita.id,
        "nombre": visita.nombre,
        "cargo": visita.cargo,
        "tipoAutoridad": visita.tipoAutoridad,
        "ministerio": visita.ministerio,
        "fecha": visita.fecha,
        "comunas": visita.comunas,
        "agenda": visita.agenda,
        "acompanantes": visita.acompanantes,
        "seremiId": visita.seremiId,
        "objetivos": visita.objetivos,
        "resultados": visita.resultados,
        "impactoMedios": visita.impactoMedios,
        "seremiNombre": seremi.nombre if seremi else None,
        "numArchivos": num_archivos
    }
    
    return VisitaAutoridadResponse(**visita_dict)


@router.post("", response_model=VisitaAutoridadResponse, status_code=status.HTTP_201_CREATED)
def create_visita_autoridad(
    visita: VisitaAutoridadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear una nueva visita de autoridad"""
    
    # Si no es admin, forzar seremiId del usuario
    seremi_id = visita.seremiId
    if current_user.rol != "admin":
        seremi_id = current_user.seremiId
    
    nueva_visita = VisitaAutoridad(
        nombre=visita.nombre,
        cargo=visita.cargo,
        tipoAutoridad=visita.tipoAutoridad,
        ministerio=visita.ministerio,
        fecha=visita.fecha,
        comunas=visita.comunas,
        agenda=visita.agenda,
        acompanantes=visita.acompanantes,
        seremiId=seremi_id,
        objetivos=visita.objetivos,
        resultados=visita.resultados,
        impactoMedios=visita.impactoMedios
    )
    
    db.add(nueva_visita)
    db.commit()
    db.refresh(nueva_visita)
    
    # Audit log
    audit = AuditLog(
        userId=current_user.id,
        userName=current_user.username,
        accion="CREATE",
        tabla="visitas_autoridades",
        registroId=nueva_visita.id,
        detalles=f"Creada visita de {visita.nombre}",
        fecha=datetime.now().isoformat()
    )
    db.add(audit)
    db.commit()
    
    # Enriquecer respuesta
    seremi = db.query(Seremi).filter(Seremi.id == nueva_visita.seremiId).first()
    visita_dict = {
        "id": nueva_visita.id,
        "nombre": nueva_visita.nombre,
        "cargo": nueva_visita.cargo,
        "tipoAutoridad": nueva_visita.tipoAutoridad,
        "ministerio": nueva_visita.ministerio,
        "fecha": nueva_visita.fecha,
        "comunas": nueva_visita.comunas,
        "agenda": nueva_visita.agenda,
        "acompanantes": nueva_visita.acompanantes,
        "seremiId": nueva_visita.seremiId,
        "objetivos": nueva_visita.objetivos,
        "resultados": nueva_visita.resultados,
        "impactoMedios": nueva_visita.impactoMedios,
        "seremiNombre": seremi.nombre if seremi else None,
        "numArchivos": 0
    }
    
    return VisitaAutoridadResponse(**visita_dict)


@router.put("/{visita_id}", response_model=VisitaAutoridadResponse)
def update_visita_autoridad(
    visita_id: int,
    visita_update: VisitaAutoridadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar una visita de autoridad"""
    visita = db.query(VisitaAutoridad).filter(VisitaAutoridad.id == visita_id).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita de autoridad no encontrada"
        )
    
    # Verificar permisos
    if current_user.rol != "admin" and visita.seremiId != current_user.seremiId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar esta visita"
        )
    
    # Actualizar campos
    update_data = visita_update.dict(exclude_unset=True)
    
    # Si no es admin, no permitir cambiar seremiId
    if current_user.rol != "admin" and "seremiId" in update_data:
        update_data.pop("seremiId")
    
    for field, value in update_data.items():
        setattr(visita, field, value)
    
    db.commit()
    db.refresh(visita)
    
    # Audit log
    audit = AuditLog(
        userId=current_user.id,
        userName=current_user.username,
        accion="UPDATE",
        tabla="visitas_autoridades",
        registroId=visita.id,
        detalles=f"Actualizada visita de {visita.nombre}",
        fecha=datetime.now().isoformat()
    )
    db.add(audit)
    db.commit()
    
    # Enriquecer respuesta
    seremi = db.query(Seremi).filter(Seremi.id == visita.seremiId).first()
    from app.models.archivo import Archivo
    num_archivos = db.query(Archivo).filter(
        Archivo.tabla == "visitas_autoridades",
        Archivo.registroId == visita.id
    ).count()
    
    visita_dict = {
        "id": visita.id,
        "nombre": visita.nombre,
        "cargo": visita.cargo,
        "tipoAutoridad": visita.tipoAutoridad,
        "ministerio": visita.ministerio,
        "fecha": visita.fecha,
        "comunas": visita.comunas,
        "agenda": visita.agenda,
        "acompanantes": visita.acompanantes,
        "seremiId": visita.seremiId,
        "objetivos": visita.objetivos,
        "resultados": visita.resultados,
        "impactoMedios": visita.impactoMedios,
        "seremiNombre": seremi.nombre if seremi else None,
        "numArchivos": num_archivos
    }
    
    return VisitaAutoridadResponse(**visita_dict)


@router.delete("/{visita_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visita_autoridad(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar una visita de autoridad (solo admin)"""
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden eliminar visitas"
        )
    
    visita = db.query(VisitaAutoridad).filter(VisitaAutoridad.id == visita_id).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita de autoridad no encontrada"
        )
    
    # Audit log antes de eliminar
    audit = AuditLog(
        userId=current_user.id,
        userName=current_user.username,
        accion="DELETE",
        tabla="visitas_autoridades",
        registroId=visita.id,
        detalles=f"Eliminada visita de {visita.nombre}",
        fecha=datetime.now().isoformat()
    )
    db.add(audit)
    
    db.delete(visita)
    db.commit()
    
    return None


@router.post("/{visita_id}/archivos", status_code=status.HTTP_201_CREATED)
async def upload_archivos_visita(
    visita_id: int,
    archivos: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subir múltiples archivos para una visita de autoridad"""
    # Verificar que la visita existe
    visita = db.query(VisitaAutoridad).filter(VisitaAutoridad.id == visita_id).first()
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita de autoridad no encontrada"
        )
    
    # Verificar permisos
    if current_user.rol != "admin" and visita.seremiId != current_user.seremiId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para subir archivos a esta visita"
        )
    
    # Crear carpeta uploads si no existe
    uploads_dir = Path(__file__).parent.parent.parent.parent / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    
    archivos_guardados = []
    max_file_size = getattr(settings, 'MAX_FILE_SIZE', 20 * 1024 * 1024)  # 20MB default
    
    for file in archivos:
        # Validar tamaño
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Archivo {file.filename} demasiado grande. Máximo {max_file_size / (1024*1024)}MB"
            )
        
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
                detail=f"Error al guardar archivo {file.filename}: {str(e)}"
            )
        
        # Crear registro en BD
        db_archivo = Archivo(
            seremiId=visita.seremiId,
            tabla="visitas_autoridades",
            registroId=visita_id,
            nombre=file.filename,
            nombreDisco=unique_filename,
            ruta=str(file_path),
            tipo=file.content_type,
            tamano=file_size,
            subidoPor=current_user.username,
            subidoEn=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(db_archivo)
        archivos_guardados.append({
            "nombre": file.filename,
            "tamano": file_size
        })
    
    db.commit()
    
    return {
        "message": f"{len(archivos_guardados)} archivo(s) subido(s) exitosamente",
        "archivos": archivos_guardados
    }


@router.get("/{visita_id}/archivos")
def get_archivos_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener archivos adjuntos de una visita de autoridad"""
    visita = db.query(VisitaAutoridad).filter(VisitaAutoridad.id == visita_id).first()
    if not visita:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visita no encontrada")

    if current_user.rol != "admin" and visita.seremiId != current_user.seremiId:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permiso")

    archivos = db.query(Archivo).filter(
        Archivo.tabla == "visitas_autoridades",
        Archivo.registroId == visita_id
    ).all()

    return [
        {
            "id": a.id,
            "nombre": a.nombre,
            "tipo": a.tipo,
            "tamano": a.tamano,
            "subidoPor": a.subidoPor,
            "subidoEn": a.subidoEn,
        }
        for a in archivos
    ]
