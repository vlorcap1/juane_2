"""Schemas para registros de SEREMIs"""
from pydantic import BaseModel
from typing import Optional


# ========== ALERTA ==========
class AlertaBase(BaseModel):
    tipo: str  # contratacion_vence, kpi_no_cumplido, agenda_proxima, nudo_urgente
    nivel: str  # info, warning, danger
    titulo: str
    mensaje: Optional[str] = None
    url: Optional[str] = None
    tablaOrigen: Optional[str] = None
    registroId: Optional[int] = None


class AlertaResponse(AlertaBase):
    id: int
    userId: str
    leida: bool
    descartada: bool
    creadoEn: str
    
    class Config:
        from_attributes = True


# ======= VISITAS =======
class VisitaBase(BaseModel):
    seremiId: str
    fecha: Optional[str] = None
    comuna: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = 0
    descripcion: Optional[str] = None


class VisitaCreate(VisitaBase):
    pass


class VisitaUpdate(BaseModel):
    fecha: Optional[str] = None
    comuna: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = None
    descripcion: Optional[str] = None


class VisitaResponse(VisitaBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= CONTACTOS =======
class ContactoBase(BaseModel):
    seremiId: str
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = 0
    tipo: Optional[str] = None
    instituciones: Optional[str] = None
    descripcion: Optional[str] = None


class ContactoCreate(ContactoBase):
    pass


class ContactoUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = None
    tipo: Optional[str] = None
    instituciones: Optional[str] = None
    descripcion: Optional[str] = None


class ContactoResponse(ContactoBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= PRENSA =======
class PrensaBase(BaseModel):
    seremiId: str
    titular: Optional[str] = None
    medio: Optional[str] = None
    fecha: Optional[str] = None
    tipoMedio: Optional[str] = None
    tono: Optional[str] = None
    url: Optional[str] = None
    resumen: Optional[str] = None


class PrensaCreate(PrensaBase):
    pass


class PrensaUpdate(BaseModel):
    titular: Optional[str] = None
    medio: Optional[str] = None
    fecha: Optional[str] = None
    tipoMedio: Optional[str] = None
    tono: Optional[str] = None
    url: Optional[str] = None
    resumen: Optional[str] = None


class PrensaResponse(PrensaBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= PROYECTOS =======
class ProyectoBase(BaseModel):
    seremiId: str
    title: Optional[str] = None
    meta: Optional[str] = None
    estado: Optional[str] = None
    presupuesto: Optional[str] = None
    descripcion: Optional[str] = None
    comunas: Optional[str] = None


class ProyectoCreate(ProyectoBase):
    pass


class ProyectoUpdate(BaseModel):
    title: Optional[str] = None
    meta: Optional[str] = None
    estado: Optional[str] = None
    presupuesto: Optional[str] = None
    descripcion: Optional[str] = None
    comunas: Optional[str] = None


class ProyectoResponse(ProyectoBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= NUDOS =======
class NudoBase(BaseModel):
    seremiId: str
    title: Optional[str] = None
    desc: Optional[str] = None
    urgencia: Optional[str] = None
    solucion: Optional[str] = None


class NudoCreate(NudoBase):
    pass


class NudoUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    urgencia: Optional[str] = None
    solucion: Optional[str] = None


class NudoResponse(NudoBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= TEMAS =======
class TemaBase(BaseModel):
    seremiId: str
    tema: Optional[str] = None
    ambito: Optional[str] = None
    prioridad: Optional[str] = None
    descripcion: Optional[str] = None


class TemaCreate(TemaBase):
    pass


class TemaUpdate(BaseModel):
    tema: Optional[str] = None
    ambito: Optional[str] = None
    prioridad: Optional[str] = None
    descripcion: Optional[str] = None


class TemaResponse(TemaBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= AGENDA =======
class AgendaBase(BaseModel):
    seremiId: str
    fecha: Optional[str] = None
    hora: Optional[str] = None
    texto: Optional[str] = None
    cat: Optional[str] = None
    lugar: Optional[str] = None
    notas: Optional[str] = None
    minuta: Optional[str] = None


class AgendaCreate(AgendaBase):
    pass


class AgendaUpdate(BaseModel):
    fecha: Optional[str] = None
    hora: Optional[str] = None
    texto: Optional[str] = None
    cat: Optional[str] = None
    lugar: Optional[str] = None
    notas: Optional[str] = None
    minuta: Optional[str] = None


class AgendaResponse(AgendaBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= CONTRATACIONES =======
class ContratacionBase(BaseModel):
    seremiId: str
    nombre: Optional[str] = None
    rut: Optional[str] = None
    cargo: Optional[str] = None
    grado: Optional[str] = None
    tipo: Optional[str] = None
    esNuevo: Optional[str] = "Nuevo"
    inicio: Optional[str] = None
    termino: Optional[str] = None
    monto: Optional[str] = None
    financ: Optional[str] = None
    just: Optional[str] = None
    estado: Optional[str] = "Pendiente"
    vbQuien: Optional[str] = None
    vbFecha: Optional[str] = None
    motivoRechazo: Optional[str] = None
    subcategoria: Optional[str] = None
    creadoPor: Optional[str] = None
    creadoEn: Optional[str] = None


class ContratacionCreate(ContratacionBase):
    pass


class ContratacionUpdate(BaseModel):
    nombre: Optional[str] = None
    rut: Optional[str] = None
    cargo: Optional[str] = None
    grado: Optional[str] = None
    tipo: Optional[str] = None
    esNuevo: Optional[str] = None
    inicio: Optional[str] = None
    termino: Optional[str] = None
    monto: Optional[str] = None
    financ: Optional[str] = None
    just: Optional[str] = None
    estado: Optional[str] = None
    vbQuien: Optional[str] = None
    vbFecha: Optional[str] = None
    motivoRechazo: Optional[str] = None
    subcategoria: Optional[str] = None


class ContratacionResponse(ContratacionBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= ARCHIVOS =======
class ArchivoBase(BaseModel):
    seremiId: str
    tabla: Optional[str] = None
    registroId: Optional[int] = None
    nombre: str
    nombreDisco: str
    ruta: str
    tipo: Optional[str] = None
    tamano: Optional[int] = None
    subidoPor: Optional[str] = None
    subidoEn: Optional[str] = None


class ArchivoCreate(ArchivoBase):
    pass


class ArchivoResponse(ArchivoBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= COMENTARIOS =======
class ComentarioBase(BaseModel):
    seremiId: str
    tabla: str
    registroId: int
    texto: str
    autorId: Optional[str] = None
    autorNombre: Optional[str] = None
    fecha: Optional[str] = None


class ComentarioCreate(ComentarioBase):
    pass


class ComentarioResponse(ComentarioBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= KPIs =======
class KPIBase(BaseModel):
    seremiId: str
    nombre: str
    meta: Optional[float] = 0.0
    real: Optional[float] = 0.0
    unidad: Optional[str] = None
    periodo: Optional[str] = None
    descripcion: Optional[str] = None


class KPICreate(KPIBase):
    pass


class KPIUpdate(BaseModel):
    nombre: Optional[str] = None
    meta: Optional[float] = None
    real: Optional[float] = None
    unidad: Optional[str] = None
    periodo: Optional[str] = None
    descripcion: Optional[str] = None


class KPIResponse(KPIBase):
    id: int
    
    class Config:
        from_attributes = True


# ======= AUDIT LOG =======
class AuditLogResponse(BaseModel):
    id: int
    userId: Optional[str] = None
    userName: Optional[str] = None
    accion: str
    tabla: Optional[str] = None
    registroId: Optional[int] = None
    detalles: Optional[str] = None
    fecha: str
    
    class Config:
        from_attributes = True


# ========== VISITA AUTORIDAD ==========
class VisitaAutoridadBase(BaseModel):
    nombre: str
    cargo: Optional[str] = None
    tipoAutoridad: str  # ministro, subsecretario, director_nacional
    ministerio: Optional[str] = None
    fecha: str
    comunas: Optional[str] = None
    agenda: Optional[str] = None
    acompanantes: Optional[str] = None
    seremiId: Optional[str] = None
    objetivos: Optional[str] = None
    resultados: Optional[str] = None
    impactoMedios: Optional[str] = None


class VisitaAutoridadCreate(VisitaAutoridadBase):
    pass


class VisitaAutoridadUpdate(BaseModel):
    nombre: Optional[str] = None
    cargo: Optional[str] = None
    tipoAutoridad: Optional[str] = None
    ministerio: Optional[str] = None
    fecha: Optional[str] = None
    comunas: Optional[str] = None
    agenda: Optional[str] = None
    acompanantes: Optional[str] = None
    seremiId: Optional[str] = None
    objetivos: Optional[str] = None
    resultados: Optional[str] = None
    impactoMedios: Optional[str] = None


class VisitaAutoridadResponse(VisitaAutoridadBase):
    id: int
    seremiNombre: Optional[str] = None
    numArchivos: Optional[int] = 0

    class Config:
        from_attributes = True
