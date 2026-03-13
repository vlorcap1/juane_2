"""
Endpoint público para el feed RSS de Google Alerts en el Login.
Sin autenticación requerida.

Para cambiar la URL del feed RSS, edita la variable RSS_FEED_URL abajo:
"""
import asyncio
import re
import feedparser
from fastapi import APIRouter

router = APIRouter(tags=["public"])

# ──────────────────────────────────────────────
# EDITA ESTA URL PARA CAMBIAR EL FEED RSS
RSS_FEED_URL = "https://www.google.cl/alerts/feeds/17775337390589654905/11838511893443788704"
# ──────────────────────────────────────────────


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def _parse_feed_sync(url: str) -> dict:
    # Google Alerts bloquea requests sin User-Agent de navegador (especialmente desde IPs de servidor)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
    }
    feed = feedparser.parse(url, request_headers=headers)
    items = []
    for entry in feed.entries[:10]:
        title = _strip_html(entry.get("title", "Sin título"))
        summary = _strip_html(entry.get("summary", ""))
        if len(summary) > 180:
            summary = summary[:180] + "..."
        link = entry.get("link", "")
        published = entry.get("published", "")
        items.append(
            {"title": title, "link": link, "published": published, "summary": summary}
        )
    feed_title = _strip_html(feed.feed.get("title", "Alertas Google"))
    return {"items": items, "feed_title": feed_title, "feed_url": url}


@router.get("/api/public/rss-feed")
async def get_public_rss_feed():
    """Feed RSS público para mostrar en pantalla de login."""
    try:
        result = await asyncio.to_thread(_parse_feed_sync, RSS_FEED_URL)
        return result
    except Exception as exc:
        return {"items": [], "feed_title": "Alertas", "feed_url": RSS_FEED_URL, "error": str(exc)}


@router.get("/api/public/rss-feed/url")
async def get_rss_feed_url():
    """Retorna la URL configurada del feed RSS."""
    return {"feed_url": RSS_FEED_URL}
