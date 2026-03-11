"""
Scheduler RSS — Sincronización diaria de feeds de Google Alerts.

Corre todos los días a las 06:00 AM (hora del servidor).
También puede ejecutarse manualmente vía POST /api/noticias/sync
"""
import logging
import feedparser
from datetime import datetime
from typing import Dict, Any

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.noticia_alerta import FuenteRSS, NoticiaAlerta

logger = logging.getLogger(__name__)


def _parse_entry_date(entry: Any) -> str:
    """Extrae la fecha de un entry del feed como string ISO."""
    # feedparser puebla published_parsed o updated_parsed
    for attr in ("published_parsed", "updated_parsed"):
        t = getattr(entry, attr, None)
        if t:
            try:
                return datetime(*t[:6]).strftime("%Y-%m-%d")
            except Exception:
                pass
    return datetime.now().strftime("%Y-%m-%d")


def _parse_source(entry: Any) -> str:
    """Intenta extraer el nombre de la fuente/medio del entry."""
    # Google Alerts pone el medio en entry.source.title o en tags
    source = getattr(entry, "source", None)
    if source:
        title = getattr(source, "title", None)
        if title:
            return title
    # Fallback: dominio del enlace
    link = getattr(entry, "link", "") or ""
    try:
        from urllib.parse import urlparse
        domain = urlparse(link).netloc.replace("www.", "")
        return domain or "—"
    except Exception:
        return "—"


def fetch_all_feeds(db: Session) -> Dict[str, Any]:
    """
    Recorre todas las FuenteRSS activas, parsea su RSS
    y guarda las entradas nuevas en noticias_alertas.
    Retorna un dict con estadísticas.
    """
    fuentes = db.query(FuenteRSS).filter(FuenteRSS.activo == True).all()
    nuevas = 0
    errores = []

    for fuente in fuentes:
        try:
            feed = feedparser.parse(fuente.url)
            if feed.bozo and not feed.entries:
                errores.append(f"[{fuente.etiqueta}] Feed no válido o sin entradas")
                continue

            for entry in feed.entries:
                enlace = getattr(entry, "link", None)
                if not enlace:
                    continue

                # Deduplicar por enlace
                existe = db.query(NoticiaAlerta.id).filter(
                    NoticiaAlerta.enlace == enlace
                ).first()
                if existe:
                    continue

                titulo = getattr(entry, "title", "Sin título")
                # Google Alerts a veces incluye HTML en los títulos
                if "<" in titulo:
                    import re
                    titulo = re.sub(r"<[^>]+>", "", titulo).strip()

                nueva = NoticiaAlerta(
                    titulo=titulo,
                    enlace=enlace,
                    fecha=_parse_entry_date(entry),
                    fuente=_parse_source(entry),
                    fuenteRssId=fuente.id,
                    etiqueta=fuente.etiqueta,
                    guardadoEn=datetime.now().isoformat(),
                )
                db.add(nueva)
                nuevas += 1

            db.commit()

        except Exception as e:
            logger.error(f"Error procesando fuente '{fuente.etiqueta}': {e}")
            errores.append(f"[{fuente.etiqueta}] {str(e)}")

    logger.info(f"RSS sync completado: {nuevas} noticias nuevas de {len(fuentes)} fuentes")
    return {
        "nuevas": nuevas,
        "fuentes_procesadas": len(fuentes),
        "errores": errores,
    }


def scheduled_sync():
    """Función que llama el scheduler — abre su propia sesión de BD."""
    logger.info("⏰ Iniciando sincronización programada de feeds RSS...")
    db = SessionLocal()
    try:
        result = fetch_all_feeds(db)
        logger.info(f"✅ Sync completado: {result}")
    except Exception as e:
        logger.error(f"❌ Error en sync programado: {e}")
    finally:
        db.close()


def start_scheduler():
    """
    Inicia APScheduler con un CronTrigger a las 06:00 AM diarias.
    Llamado desde el lifespan de FastAPI en main.py.
    """
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger

        scheduler = BackgroundScheduler(timezone="America/Santiago")
        scheduler.add_job(
            scheduled_sync,
            trigger=CronTrigger(hour=6, minute=0),
            id="rss_daily_sync",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("✅ Scheduler RSS iniciado — sync diario a las 06:00 (Santiago)")
        return scheduler
    except Exception as e:
        logger.error(f"No se pudo iniciar el scheduler RSS: {e}")
        return None


# ─────────────────────────────────────────────────────────────
# PLACEHOLDER FEEDS — se insertan la primera vez que la tabla está vacía
# Reemplaza las URLs con las de tus Google Alerts reales:
#   1. Entra a https://alerts.google.com
#   2. Crea una alerta con tu búsqueda
#   3. En "Entregar en" elige "Feed RSS"
#   4. Copia la URL que aparece y reemplaza el placeholder correspondiente
# ─────────────────────────────────────────────────────────────

PLACEHOLDER_FEEDS = [
    {
        "etiqueta": "Región del Maule",
        "url": "https://www.google.com/alerts/feeds/REEMPLAZAR_USUARIO/REEMPLAZAR_ID_1",
    },
    {
        "etiqueta": "Delegación Presidencial Maule",
        "url": "https://www.google.com/alerts/feeds/REEMPLAZAR_USUARIO/REEMPLAZAR_ID_2",
    },
    {
        "etiqueta": "SEREMI Maule",
        "url": "https://www.google.com/alerts/feeds/REEMPLAZAR_USUARIO/REEMPLAZAR_ID_3",
    },
    {
        "etiqueta": "Municipalidad Maule",
        "url": "https://www.google.com/alerts/feeds/REEMPLAZAR_USUARIO/REEMPLAZAR_ID_4",
    },
    {
        "etiqueta": "Director de Servicio Maule",
        "url": "https://www.google.com/alerts/feeds/REEMPLAZAR_USUARIO/REEMPLAZAR_ID_5",
    },
    {
        "etiqueta": "Política Maule",
        "url": "https://www.google.com/alerts/feeds/REEMPLAZAR_USUARIO/REEMPLAZAR_ID_6",
    },
]


def _seed_placeholder_feeds():
    """Inserta las fuentes placeholder solo si la tabla fuentes_rss está vacía."""
    db = SessionLocal()
    try:
        count = db.query(FuenteRSS).count()
        if count == 0:
            now = datetime.now().isoformat()
            for item in PLACEHOLDER_FEEDS:
                db.add(FuenteRSS(
                    etiqueta=item["etiqueta"],
                    url=item["url"],
                    activo=True,
                    creadoEn=now,
                ))
            db.commit()
            logger.info(f"✅ {len(PLACEHOLDER_FEEDS)} fuentes RSS placeholder insertadas")
    except Exception as e:
        logger.error(f"Error insertando placeholders RSS: {e}")
    finally:
        db.close()
