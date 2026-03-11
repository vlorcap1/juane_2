# Models module

# Import all models to register them with SQLAlchemy
from .user import User
from .seremi import Seremi
from .visita import Visita
from .visita_autoridad import VisitaAutoridad
from .contacto import Contacto
from .prensa import Prensa
from .proyecto import Proyecto
from .nudo import Nudo
from .tema import Tema
from .agenda import Agenda
from .contratacion import Contratacion
from .kpi import KPI
from .comentario import Comentario
from .archivo import Archivo
from .notificacion import Notificacion
from .foro import ForoTema, ForoPost
from .audit import AuditLog
from .alerta import Alerta
from .noticia_alerta import FuenteRSS, NoticiaAlerta

__all__ = [
    "User",
    "Seremi", 
    "Visita",
    "VisitaAutoridad",
    "Contacto",
    "Prensa",
    "Proyecto",
    "Nudo",
    "Tema",
    "Agenda",
    "Contratacion",
    "KPI",
    "Comentario",
    "Archivo",
    "Notificacion",
    "ForoTema",
    "ForoPost",
    "AuditLog",
    "Alerta",
    "FuenteRSS",
    "NoticiaAlerta",
]
