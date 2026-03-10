import os
import re
import json
import shutil
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext

from .database import init_db, db_conn

# ── Configuration ─────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "seremis_maule_jwt_secret_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 8
SALT_ROUNDS = 12

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
PUBLIC_DIR = BASE_DIR / "public"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="SEREMIS Maule API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database init ──────────────────────────────────────────
@app.on_event("startup")
def startup():
    init_db()
    _migrate_passwords()


def _migrate_passwords():
    """Hash plain-text passwords left over from initial seeding."""
    with db_conn() as conn:
        users = conn.execute("SELECT id, pass FROM users").fetchall()
        for u in users:
            if not u["pass"].startswith("$2"):
                hashed = pwd_ctx.hash(u["pass"])
                conn.execute("UPDATE users SET pass = ? WHERE id = ?", (hashed, u["id"]))
        conn.commit()


# ── Helpers ────────────────────────────────────────────────
def row_to_dict(row) -> dict:
    return dict(row) if row else {}


def rows_to_list(rows) -> list:
    return [dict(r) for r in rows]


def now_str() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def audit(conn, user_id, user_name, accion, tabla=None, registro_id=None, detalles=None):
    try:
        conn.execute(
            "INSERT INTO audit_log (userId,userName,accion,tabla,registroId,detalles,fecha) VALUES (?,?,?,?,?,?,?)",
            (
                user_id,
                user_name,
                accion,
                tabla,
                str(registro_id) if registro_id is not None else None,
                json.dumps(detalles) if detalles else None,
                now_str(),
            ),
        )
    except Exception:
        pass


def detect_mentions(conn, texto: str, autor_id: str, autor_nombre: str, tema_id: int):
    try:
        pattern = re.compile(r"@(\w+)")
        matches = pattern.findall(texto)
        if not matches:
            return
        usernames = list(set(matches))
        now = now_str()
        for username in usernames:
            user = conn.execute("SELECT id, username FROM users WHERE username = ?", (username,)).fetchone()
            if user and user["id"] != autor_id:
                titulo = f"{autor_nombre} te mencionó en el foro"
                mensaje = texto[:100] + "..." if len(texto) > 100 else texto
                url = f"/foro/tema/{tema_id}"
                conn.execute(
                    "INSERT INTO notificaciones (userId,tipo,titulo,mensaje,url,leida,creadoEn,autorId,autorNombre) VALUES (?,?,?,?,?,0,?,?,?)",
                    (user["id"], "mencion", titulo, mensaje, url, now, autor_id, autor_nombre),
                )
    except Exception as e:
        print(f"Error detecting mentions: {e}")


# ── JWT Auth ───────────────────────────────────────────────
def create_token(data: dict) -> str:
    payload = {**data, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


# ── SEREMI helper ──────────────────────────────────────────
def seremi_data(conn, sid: str) -> Optional[dict]:
    s = conn.execute("SELECT * FROM seremis WHERE id = ?", (sid,)).fetchone()
    if not s:
        return None
    s = dict(s)
    visitas_arr = rows_to_list(conn.execute("SELECT * FROM visitas WHERE seremiId = ? ORDER BY fecha DESC", (sid,)).fetchall())
    contactos_arr = rows_to_list(conn.execute("SELECT * FROM contactos WHERE seremiId = ? ORDER BY fecha DESC", (sid,)).fetchall())
    prensa_arr = rows_to_list(conn.execute("SELECT * FROM prensa WHERE seremiId = ? ORDER BY fecha DESC", (sid,)).fetchall())
    proyectos_arr = rows_to_list(conn.execute("SELECT * FROM proyectos WHERE seremiId = ?", (sid,)).fetchall())
    nudos_arr = rows_to_list(conn.execute("SELECT * FROM nudos WHERE seremiId = ?", (sid,)).fetchall())
    temas_arr = rows_to_list(conn.execute("SELECT * FROM temas WHERE seremiId = ?", (sid,)).fetchall())
    agenda_arr = rows_to_list(conn.execute("SELECT * FROM agenda WHERE seremiId = ? ORDER BY fecha ASC", (sid,)).fetchall())

    s["visitasArray"] = visitas_arr
    s["contactosArray"] = contactos_arr
    s["prensaItems"] = prensa_arr
    s["descripProyectos"] = proyectos_arr
    s["nudos"] = nudos_arr
    s["temas"] = temas_arr
    s["agenda"] = agenda_arr

    visitas_count = len(visitas_arr)
    contactos_count = sum(v.get("personas", 0) or 0 for v in visitas_arr) + sum(c.get("personas", 0) or 0 for c in contactos_arr)

    s["visitasCount"] = visitas_count
    s["contactosCount"] = contactos_count
    s["prensaCount"] = len(prensa_arr)
    s["proyectosCount"] = len(proyectos_arr)

    s["visitas"] = visitas_count
    s["contactos"] = contactos_count
    s["prensa"] = len(prensa_arr)
    s["proyectos"] = len(proyectos_arr)

    comunas = list(set(v["comuna"] for v in visitas_arr if v.get("comuna")))
    s["comunas"] = comunas
    return s


# ═══════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════
class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/login")
def login(body: LoginRequest):
    with db_conn() as conn:
        u = conn.execute("SELECT * FROM users WHERE username = ?", (body.username,)).fetchone()
        if not u:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        u = dict(u)
        valid = pwd_ctx.verify(body.password, u["pass"]) if u["pass"].startswith("$2") else u["pass"] == body.password
        if not valid:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        token = create_token({"id": u["id"], "username": u["username"], "rol": u["rol"]})
        audit(conn, u["id"], u["nombre"], "LOGIN", "users", u["id"])
        conn.commit()
        safe = {k: v for k, v in u.items() if k != "pass"}
        return {**safe, "token": token}


# ═══════════════════════════════════════════════════════════
#  SEREMIs
# ═══════════════════════════════════════════════════════════
@app.get("/api/seremis")
def get_seremis(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute("SELECT * FROM seremis").fetchall()
        return [seremi_data(conn, r["id"]) for r in rows]


@app.get("/api/seremis/{sid}")
def get_seremi(sid: str, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        d = seremi_data(conn, sid)
        if not d:
            raise HTTPException(status_code=404, detail="SEREMI no encontrada")
        return d


# ═══════════════════════════════════════════════════════════
#  VISITAS
# ═══════════════════════════════════════════════════════════
class VisitaCreate(BaseModel):
    seremiId: str
    fecha: Optional[str] = None
    comuna: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = 0
    descripcion: Optional[str] = None


class VisitaUpdate(BaseModel):
    fecha: Optional[str] = None
    comuna: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = 0
    descripcion: Optional[str] = None


@app.get("/api/visitas")
def get_visitas(seremiId: Optional[str] = None, page: int = 1, limit: int = 200, jwt_user=Depends(get_current_user)):
    lim = limit
    off = (page - 1) * lim
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM visitas WHERE seremiId = ? ORDER BY fecha DESC LIMIT ? OFFSET ?", (seremiId, lim, off)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM visitas ORDER BY fecha DESC LIMIT ? OFFSET ?", (lim, off)).fetchall()
        return rows_to_list(rows)


@app.get("/api/visitas/{vid}")
def get_visita(vid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM visitas WHERE id = ?", (vid,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No encontrado")
        return row_to_dict(row)


@app.post("/api/visitas")
def create_visita(body: VisitaCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO visitas (seremiId,fecha,comuna,lugar,personas,descripcion) VALUES (?,?,?,?,?,?)",
            (body.seremiId, body.fecha, body.comuna, body.lugar, body.personas or 0, body.descripcion),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "CREATE", "visitas", cur.lastrowid, {"seremiId": body.seremiId, "comuna": body.comuna})
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/visitas/{vid}")
def update_visita(vid: int, body: VisitaUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE visitas SET fecha=?,comuna=?,lugar=?,personas=?,descripcion=? WHERE id=?",
            (body.fecha, body.comuna, body.lugar, body.personas or 0, body.descripcion, vid),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "UPDATE", "visitas", vid, {"comuna": body.comuna})
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  CONTACTOS
# ═══════════════════════════════════════════════════════════
class ContactoCreate(BaseModel):
    seremiId: str
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = 0
    tipo: Optional[str] = None
    instituciones: Optional[str] = None
    descripcion: Optional[str] = None


class ContactoUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    personas: Optional[int] = 0
    tipo: Optional[str] = None
    instituciones: Optional[str] = None
    descripcion: Optional[str] = None


@app.get("/api/contactos")
def get_contactos(seremiId: Optional[str] = None, page: int = 1, limit: int = 200, jwt_user=Depends(get_current_user)):
    lim = limit
    off = (page - 1) * lim
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM contactos WHERE seremiId = ? ORDER BY fecha DESC LIMIT ? OFFSET ?", (seremiId, lim, off)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM contactos ORDER BY fecha DESC LIMIT ? OFFSET ?", (lim, off)).fetchall()
        return rows_to_list(rows)


@app.get("/api/contactos/{cid}")
def get_contacto(cid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        row = conn.execute("SELECT * FROM contactos WHERE id = ?", (cid,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No encontrado")
        return row_to_dict(row)


@app.post("/api/contactos")
def create_contacto(body: ContactoCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO contactos (seremiId,nombre,fecha,lugar,personas,tipo,instituciones,descripcion) VALUES (?,?,?,?,?,?,?,?)",
            (body.seremiId, body.nombre, body.fecha, body.lugar, body.personas or 0, body.tipo, body.instituciones, body.descripcion),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "CREATE", "contactos", cur.lastrowid, {"seremiId": body.seremiId})
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/contactos/{cid}")
def update_contacto(cid: int, body: ContactoUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE contactos SET nombre=?,fecha=?,lugar=?,personas=?,tipo=?,instituciones=?,descripcion=? WHERE id=?",
            (body.nombre, body.fecha, body.lugar, body.personas or 0, body.tipo, body.instituciones, body.descripcion, cid),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "UPDATE", "contactos", cid, None)
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  PRENSA
# ═══════════════════════════════════════════════════════════
class PrensaCreate(BaseModel):
    seremiId: str
    titular: Optional[str] = None
    medio: Optional[str] = None
    fecha: Optional[str] = None
    tipoMedio: Optional[str] = None
    tono: Optional[str] = None
    url: Optional[str] = None
    resumen: Optional[str] = None


class PrensaUpdate(BaseModel):
    titular: Optional[str] = None
    medio: Optional[str] = None
    fecha: Optional[str] = None
    tipoMedio: Optional[str] = None
    tono: Optional[str] = None
    url: Optional[str] = None
    resumen: Optional[str] = None


@app.get("/api/prensa")
def get_prensa(seremiId: Optional[str] = None, page: int = 1, limit: int = 200, jwt_user=Depends(get_current_user)):
    lim = limit
    off = (page - 1) * lim
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM prensa WHERE seremiId = ? ORDER BY fecha DESC LIMIT ? OFFSET ?", (seremiId, lim, off)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM prensa ORDER BY fecha DESC LIMIT ? OFFSET ?", (lim, off)).fetchall()
        return rows_to_list(rows)


@app.post("/api/prensa")
def create_prensa(body: PrensaCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO prensa (seremiId,titular,medio,fecha,tipoMedio,tono,url,resumen) VALUES (?,?,?,?,?,?,?,?)",
            (body.seremiId, body.titular, body.medio, body.fecha, body.tipoMedio, body.tono, body.url, body.resumen),
        )
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/prensa/{pid}")
def update_prensa(pid: int, body: PrensaUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE prensa SET titular=?,medio=?,fecha=?,tipoMedio=?,tono=?,url=?,resumen=? WHERE id=?",
            (body.titular, body.medio, body.fecha, body.tipoMedio, body.tono, body.url, body.resumen, pid),
        )
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  PROYECTOS
# ═══════════════════════════════════════════════════════════
class ProyectoCreate(BaseModel):
    seremiId: str
    title: Optional[str] = None
    meta: Optional[str] = None
    estado: Optional[str] = None
    presupuesto: Optional[str] = None
    descripcion: Optional[str] = None
    comunas: Optional[str] = None


class ProyectoUpdate(BaseModel):
    title: Optional[str] = None
    meta: Optional[str] = None
    estado: Optional[str] = None
    presupuesto: Optional[str] = None
    descripcion: Optional[str] = None
    comunas: Optional[str] = None


@app.get("/api/proyectos")
def get_proyectos(seremiId: Optional[str] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM proyectos WHERE seremiId = ? ORDER BY id DESC", (seremiId,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM proyectos ORDER BY id DESC").fetchall()
        return rows_to_list(rows)


@app.post("/api/proyectos")
def create_proyecto(body: ProyectoCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO proyectos (seremiId,title,meta,estado,presupuesto,descripcion,comunas) VALUES (?,?,?,?,?,?,?)",
            (body.seremiId, body.title, body.meta, body.estado, body.presupuesto, body.descripcion, body.comunas),
        )
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/proyectos/{pid}")
def update_proyecto(pid: int, body: ProyectoUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE proyectos SET title=?,meta=?,estado=?,presupuesto=?,descripcion=?,comunas=? WHERE id=?",
            (body.title, body.meta, body.estado, body.presupuesto, body.descripcion, body.comunas, pid),
        )
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  NUDOS
# ═══════════════════════════════════════════════════════════
class NudoCreate(BaseModel):
    seremiId: str
    title: Optional[str] = None
    desc: Optional[str] = None
    urgencia: Optional[str] = None
    solucion: Optional[str] = None


class NudoUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    urgencia: Optional[str] = None
    solucion: Optional[str] = None


@app.get("/api/nudos")
def get_nudos(seremiId: Optional[str] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM nudos WHERE seremiId = ? ORDER BY id DESC", (seremiId,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM nudos ORDER BY id DESC").fetchall()
        return rows_to_list(rows)


@app.post("/api/nudos")
def create_nudo(body: NudoCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO nudos (seremiId,title,`desc`,urgencia,solucion) VALUES (?,?,?,?,?)",
            (body.seremiId, body.title, body.desc, body.urgencia, body.solucion),
        )
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/nudos/{nid}")
def update_nudo(nid: int, body: NudoUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE nudos SET title=?,`desc`=?,urgencia=?,solucion=? WHERE id=?",
            (body.title, body.desc, body.urgencia, body.solucion, nid),
        )
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  TEMAS
# ═══════════════════════════════════════════════════════════
class TemaCreate(BaseModel):
    seremiId: str
    tema: Optional[str] = None
    ambito: Optional[str] = None
    prioridad: Optional[str] = None
    descripcion: Optional[str] = None


class TemaUpdate(BaseModel):
    tema: Optional[str] = None
    ambito: Optional[str] = None
    prioridad: Optional[str] = None
    descripcion: Optional[str] = None


@app.get("/api/temas")
def get_temas(seremiId: Optional[str] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM temas WHERE seremiId = ? ORDER BY id DESC", (seremiId,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM temas ORDER BY id DESC").fetchall()
        return rows_to_list(rows)


@app.post("/api/temas")
def create_tema(body: TemaCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO temas (seremiId,tema,ambito,prioridad,descripcion) VALUES (?,?,?,?,?)",
            (body.seremiId, body.tema, body.ambito, body.prioridad, body.descripcion),
        )
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/temas/{tid}")
def update_tema(tid: int, body: TemaUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE temas SET tema=?,ambito=?,prioridad=?,descripcion=? WHERE id=?",
            (body.tema, body.ambito, body.prioridad, body.descripcion, tid),
        )
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  AGENDA
# ═══════════════════════════════════════════════════════════
class AgendaCreate(BaseModel):
    seremiId: str
    fecha: Optional[str] = None
    texto: Optional[str] = None
    cat: Optional[str] = None
    lugar: Optional[str] = None
    notas: Optional[str] = None


class AgendaUpdate(BaseModel):
    fecha: Optional[str] = None
    texto: Optional[str] = None
    cat: Optional[str] = None
    lugar: Optional[str] = None
    notas: Optional[str] = None


@app.get("/api/agenda")
def get_agenda(seremiId: Optional[str] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM agenda WHERE seremiId = ? ORDER BY id DESC", (seremiId,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM agenda ORDER BY id DESC").fetchall()
        return rows_to_list(rows)


@app.post("/api/agenda")
def create_agenda(body: AgendaCreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId:
        raise HTTPException(status_code=400, detail="seremiId requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO agenda (seremiId,fecha,texto,cat,lugar,notas) VALUES (?,?,?,?,?,?)",
            (body.seremiId, body.fecha, body.texto, body.cat, body.lugar, body.notas),
        )
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/agenda/{aid}")
def update_agenda(aid: int, body: AgendaUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE agenda SET fecha=?,texto=?,cat=?,lugar=?,notas=? WHERE id=?",
            (body.fecha, body.texto, body.cat, body.lugar, body.notas, aid),
        )
        conn.commit()
        return {"ok": True}


# ── Generic delete ─────────────────────────────────────────
DELETABLE_TABLES = {"visitas", "contactos", "prensa", "proyectos", "nudos", "temas", "agenda"}


@app.delete("/api/{table}/{rid}")
def generic_delete(table: str, rid: int, jwt_user=Depends(get_current_user)):
    if table not in DELETABLE_TABLES:
        raise HTTPException(status_code=400, detail="Tabla no válida")
    with db_conn() as conn:
        conn.execute(f"DELETE FROM `{table}` WHERE id = ?", (rid,))
        audit(conn, jwt_user["id"], jwt_user["username"], "DELETE", table, rid, None)
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  CONTRATACIONES
# ═══════════════════════════════════════════════════════════
class ContratCreate(BaseModel):
    seremiId: str
    nombre: str
    rut: str
    cargo: str
    grado: Optional[str] = ""
    tipo: Optional[str] = "Honorarios"
    esNuevo: Optional[str] = "Nuevo"
    inicio: str
    termino: str
    monto: str
    financ: Optional[str] = ""
    just: str
    creadoPor: Optional[str] = ""
    creadoEn: Optional[str] = None


class ContratUpdate(BaseModel):
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


class VBRequest(BaseModel):
    vbQuien: Optional[str] = "Administrador Regional"


@app.get("/api/contrataciones")
def get_contrataciones(seremiId: Optional[str] = None, page: int = 1, limit: int = 200, jwt_user=Depends(get_current_user)):
    lim = limit
    off = (page - 1) * lim
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM contrataciones WHERE seremiId = ? ORDER BY id DESC LIMIT ? OFFSET ?", (seremiId, lim, off)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM contrataciones ORDER BY id DESC LIMIT ? OFFSET ?", (lim, off)).fetchall()
        return rows_to_list(rows)


@app.post("/api/contrataciones")
def create_contratacion(body: ContratCreate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        created_en = body.creadoEn or datetime.now().strftime("%Y-%m-%d")
        cur = conn.execute(
            "INSERT INTO contrataciones (seremiId,nombre,rut,cargo,grado,tipo,esNuevo,inicio,termino,monto,financ,just,estado,vbQuien,vbFecha,creadoPor,creadoEn) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (body.seremiId, body.nombre, body.rut, body.cargo, body.grado or "", body.tipo or "Honorarios",
             body.esNuevo or "Nuevo", body.inicio, body.termino, body.monto, body.financ or "",
             body.just, "Pendiente", "", "", body.creadoPor or "", created_en),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "CREATE", "contrataciones", cur.lastrowid, {"nombre": body.nombre})
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/contrataciones/{cid}")
def update_contratacion(cid: int, body: ContratUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE contrataciones SET nombre=?,rut=?,cargo=?,grado=?,tipo=?,esNuevo=?,inicio=?,termino=?,monto=?,financ=?,just=? WHERE id=?",
            (body.nombre, body.rut, body.cargo, body.grado, body.tipo, body.esNuevo, body.inicio, body.termino, body.monto, body.financ, body.just, cid),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "UPDATE", "contrataciones", cid, None)
        conn.commit()
        return {"ok": True}


@app.put("/api/contrataciones/{cid}/vb")
def vb_contratacion(cid: int, body: VBRequest, jwt_user=Depends(get_current_user)):
    fecha = datetime.now().strftime("%Y-%m-%d")
    with db_conn() as conn:
        conn.execute(
            "UPDATE contrataciones SET estado=?,vbQuien=?,vbFecha=? WHERE id=?",
            ("Aprobada", body.vbQuien or "Administrador Regional", fecha, cid),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "APPROVE", "contrataciones", cid, {"vbQuien": body.vbQuien})
        conn.commit()
        return {"ok": True, "vbFecha": fecha}


@app.delete("/api/contrataciones/{cid}")
def delete_contratacion(cid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute("DELETE FROM contrataciones WHERE id = ?", (cid,))
        audit(conn, jwt_user["id"], jwt_user["username"], "DELETE", "contrataciones", cid, None)
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  ARCHIVOS
# ═══════════════════════════════════════════════════════════
@app.post("/api/archivos")
async def upload_archivo(
    archivo: UploadFile = File(...),
    seremiId: Optional[str] = Form(None),
    tabla: Optional[str] = Form(None),
    registroId: Optional[str] = Form(None),
    authorization: Optional[str] = Header(default=None),
):
    jwt_user = get_current_user(authorization)
    allowed_exts = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".gif", ".webp"}
    ext = Path(archivo.filename).suffix.lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    sid = seremiId or "general"
    dest_dir = UPLOADS_DIR / sid
    dest_dir.mkdir(parents=True, exist_ok=True)

    import time
    safe_name = re.sub(r"[^a-zA-Z0-9_\-]", "_", Path(archivo.filename).stem)
    filename = f"{int(time.time() * 1000)}_{safe_name}{ext}"
    dest_path = dest_dir / filename

    content = await archivo.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo demasiado grande (máx 20 MB)")

    dest_path.write_bytes(content)
    ruta_rel = f"/uploads/{sid}/{filename}"

    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO archivos (seremiId,tabla,registroId,nombre,nombreDisco,ruta,tipo,tamano,subidoPor,subidoEn) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (sid, tabla, registroId, archivo.filename, filename, ruta_rel, archivo.content_type, len(content), jwt_user["username"], datetime.now().strftime("%Y-%m-%d")),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "UPLOAD", "archivos", cur.lastrowid, {"nombre": archivo.filename})
        conn.commit()
        return {"id": cur.lastrowid, "ruta": ruta_rel, "nombre": archivo.filename, "tipo": archivo.content_type, "tamano": len(content)}


@app.get("/api/archivos")
def get_archivos(seremiId: Optional[str] = None, tabla: Optional[str] = None, registroId: Optional[str] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        q = "SELECT * FROM archivos WHERE 1=1"
        params: list = []
        if seremiId:
            q += " AND seremiId = ?"
            params.append(seremiId)
        if tabla:
            q += " AND tabla = ?"
            params.append(tabla)
        if registroId:
            q += " AND registroId = ?"
            params.append(registroId)
        q += " ORDER BY id DESC"
        return rows_to_list(conn.execute(q, params).fetchall())


@app.delete("/api/archivos/{aid}")
def delete_archivo(aid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        f = conn.execute("SELECT * FROM archivos WHERE id = ?", (aid,)).fetchone()
        if not f:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        f = dict(f)
        full_path = BASE_DIR / f["ruta"].lstrip("/")
        try:
            if full_path.exists():
                full_path.unlink()
        except Exception:
            pass
        conn.execute("DELETE FROM archivos WHERE id = ?", (aid,))
        audit(conn, jwt_user["id"], jwt_user["username"], "DELETE", "archivos", aid, {"nombre": f["nombre"]})
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  COMENTARIOS
# ═══════════════════════════════════════════════════════════
class ComentarioCreate(BaseModel):
    seremiId: Optional[str] = None
    tabla: Optional[str] = None
    registroId: Optional[int] = None
    texto: str


@app.get("/api/comentarios")
def get_comentarios(seremiId: Optional[str] = None, tabla: Optional[str] = None, registroId: Optional[int] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM comentarios WHERE seremiId=? AND tabla=? AND registroId=? ORDER BY id ASC",
            (seremiId or "", tabla or "", registroId or 0),
        ).fetchall()
        return rows_to_list(rows)


@app.post("/api/comentarios")
def create_comentario(body: ComentarioCreate, jwt_user=Depends(get_current_user)):
    if not body.texto or not body.texto.strip():
        raise HTTPException(status_code=400, detail="Texto requerido")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO comentarios (seremiId,tabla,registroId,texto,autorId,autorNombre,fecha) VALUES (?,?,?,?,?,?,?)",
            (body.seremiId, body.tabla, body.registroId, body.texto.strip(),
             jwt_user["id"], jwt_user["username"],
             datetime.now().strftime("%Y-%m-%d %H:%M")),
        )
        conn.commit()
        return {"id": cur.lastrowid}


@app.delete("/api/comentarios/{cid}")
def delete_comentario(cid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        c = conn.execute("SELECT * FROM comentarios WHERE id = ?", (cid,)).fetchone()
        if not c:
            raise HTTPException(status_code=404, detail="Comentario no encontrado")
        c = dict(c)
        if c["autorId"] != jwt_user["id"] and jwt_user.get("rol") != "admin":
            raise HTTPException(status_code=403, detail="Sin permiso")
        conn.execute("DELETE FROM comentarios WHERE id = ?", (cid,))
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  KPIs
# ═══════════════════════════════════════════════════════════
class KPICreate(BaseModel):
    seremiId: str
    nombre: str
    meta: Optional[float] = 0
    real: Optional[float] = 0
    unidad: Optional[str] = None
    periodo: Optional[str] = None
    descripcion: Optional[str] = None


class KPIUpdate(BaseModel):
    nombre: Optional[str] = None
    meta: Optional[float] = 0
    real: Optional[float] = 0
    unidad: Optional[str] = None
    periodo: Optional[str] = None
    descripcion: Optional[str] = None


@app.get("/api/kpis")
def get_kpis(seremiId: Optional[str] = None, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        if seremiId:
            rows = conn.execute("SELECT * FROM kpi_indicadores WHERE seremiId = ? ORDER BY id", (seremiId,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM kpi_indicadores ORDER BY seremiId, id").fetchall()
        return rows_to_list(rows)


@app.post("/api/kpis")
def create_kpi(body: KPICreate, jwt_user=Depends(get_current_user)):
    if not body.seremiId or not body.nombre:
        raise HTTPException(status_code=400, detail="seremiId y nombre requeridos")
    with db_conn() as conn:
        cur = conn.execute(
            "INSERT INTO kpi_indicadores (seremiId,nombre,meta,real,unidad,periodo,descripcion) VALUES (?,?,?,?,?,?,?)",
            (body.seremiId, body.nombre, body.meta or 0, body.real or 0, body.unidad, body.periodo, body.descripcion),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "CREATE", "kpis", cur.lastrowid, {"seremiId": body.seremiId, "nombre": body.nombre})
        conn.commit()
        return {"id": cur.lastrowid}


@app.put("/api/kpis/{kid}")
def update_kpi(kid: int, body: KPIUpdate, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute(
            "UPDATE kpi_indicadores SET nombre=?,meta=?,real=?,unidad=?,periodo=?,descripcion=? WHERE id=?",
            (body.nombre, body.meta or 0, body.real or 0, body.unidad, body.periodo, body.descripcion, kid),
        )
        audit(conn, jwt_user["id"], jwt_user["username"], "UPDATE", "kpis", kid, None)
        conn.commit()
        return {"ok": True}


@app.delete("/api/kpis/{kid}")
def delete_kpi(kid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute("DELETE FROM kpi_indicadores WHERE id = ?", (kid,))
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  USERS
# ═══════════════════════════════════════════════════════════
class UserCreate(BaseModel):
    nombre: str
    username: str
    rol: Optional[str] = "seremi"
    seremiId: Optional[str] = None
    cargo: Optional[str] = ""
    email: Optional[str] = ""
    tel: Optional[str] = ""


class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    cargo: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    tel: Optional[str] = None
    rol: Optional[str] = None
    seremiId: Optional[str] = None


@app.get("/api/users")
def get_users(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute("SELECT id,username,rol,seremiId,nombre,cargo,email,tel FROM users").fetchall()
        return rows_to_list(rows)


@app.post("/api/users")
def create_user(request: Request, body: dict, jwt_user=Depends(get_current_user)):
    nombre = body.get("nombre")
    username = body.get("username")
    password = body.get("pass")
    if not nombre or not username or not password:
        raise HTTPException(status_code=400, detail="Campos obligatorios faltantes")
    hashed = pwd_ctx.hash(password)
    uid = f"{username}_{int(datetime.now().timestamp() * 1000)}"
    with db_conn() as conn:
        try:
            conn.execute(
                "INSERT INTO users (id,username,pass,rol,seremiId,nombre,cargo,email,tel) VALUES (?,?,?,?,?,?,?,?,?)",
                (uid, username, hashed, body.get("rol", "seremi"), body.get("seremiId"), nombre, body.get("cargo", ""), body.get("email", ""), body.get("tel", "")),
            )
            audit(conn, jwt_user["id"], jwt_user["username"], "CREATE_USER", "users", uid, {"username": username})
            conn.commit()
            return {"id": uid}
        except Exception:
            raise HTTPException(status_code=409, detail="Usuario ya existe")


@app.put("/api/users/{uid}")
def update_user(uid: str, body: dict, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        if body.get("pass"):
            hashed = pwd_ctx.hash(body["pass"])
            conn.execute(
                "UPDATE users SET nombre=?,cargo=?,username=?,pass=?,email=?,tel=?,rol=?,seremiId=? WHERE id=?",
                (body.get("nombre"), body.get("cargo", ""), body.get("username"), hashed, body.get("email", ""), body.get("tel", ""), body.get("rol", "seremi"), body.get("seremiId"), uid),
            )
        else:
            conn.execute(
                "UPDATE users SET nombre=?,cargo=?,username=?,email=?,tel=?,rol=?,seremiId=? WHERE id=?",
                (body.get("nombre"), body.get("cargo", ""), body.get("username"), body.get("email", ""), body.get("tel", ""), body.get("rol", "seremi"), body.get("seremiId"), uid),
            )
        audit(conn, jwt_user["id"], jwt_user["username"], "UPDATE_USER", "users", uid, None)
        conn.commit()
        return {"ok": True}


@app.delete("/api/users/{uid}")
def delete_user(uid: str, jwt_user=Depends(get_current_user)):
    if uid == "admin":
        raise HTTPException(status_code=403, detail="No se puede eliminar al admin")
    with db_conn() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (uid,))
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  AUDIT
# ═══════════════════════════════════════════════════════════
@app.get("/api/audit/{tabla}/{rid}")
def get_audit_record(tabla: str, rid: str, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute("SELECT * FROM audit_log WHERE tabla = ? AND registroId = ? ORDER BY id DESC LIMIT 100", (tabla, rid)).fetchall()
        return rows_to_list(rows)


@app.get("/api/audit")
def get_audit(jwt_user=Depends(get_current_user)):
    if jwt_user.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Solo admin")
    with db_conn() as conn:
        rows = conn.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 200").fetchall()
        return rows_to_list(rows)


# ═══════════════════════════════════════════════════════════
#  FORO
# ═══════════════════════════════════════════════════════════
class ForoTemaCreate(BaseModel):
    titulo: str
    cuerpo: str


class ForoPostCreate(BaseModel):
    texto: str


@app.get("/api/foro/users")
def foro_users(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute("SELECT id, username, nombre, cargo FROM users ORDER BY nombre").fetchall()
        return rows_to_list(rows)


@app.get("/api/foro/temas")
def foro_temas(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute("""
            SELECT t.*,
                   (SELECT COUNT(*) FROM foro_posts p WHERE p.temaId = t.id) AS respuestas
            FROM foro_temas t
            ORDER BY t.ultimaActividad DESC
        """).fetchall()
        return rows_to_list(rows)


@app.post("/api/foro/temas")
def create_foro_tema(body: ForoTemaCreate, jwt_user=Depends(get_current_user)):
    if not body.titulo.strip() or not body.cuerpo.strip():
        raise HTTPException(status_code=400, detail="Título y cuerpo son obligatorios")
    with db_conn() as conn:
        u = conn.execute("SELECT nombre FROM users WHERE id = ?", (jwt_user["id"],)).fetchone()
        autor_nombre = u["nombre"] if u else jwt_user["username"]
        now = now_str()
        cur = conn.execute(
            "INSERT INTO foro_temas (titulo, cuerpo, autorId, autorNombre, creadoEn, ultimaActividad) VALUES (?,?,?,?,?,?)",
            (body.titulo.strip(), body.cuerpo.strip(), jwt_user["id"], autor_nombre, now, now),
        )
        detect_mentions(conn, body.cuerpo.strip(), jwt_user["id"], autor_nombre, cur.lastrowid)
        conn.commit()
        return {"id": cur.lastrowid}


@app.delete("/api/foro/temas/{tid}")
def delete_foro_tema(tid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        tema = conn.execute("SELECT * FROM foro_temas WHERE id = ?", (tid,)).fetchone()
        if not tema:
            raise HTTPException(status_code=404, detail="Tema no encontrado")
        tema = dict(tema)
        if jwt_user.get("rol") != "admin" and jwt_user["id"] != tema["autorId"]:
            raise HTTPException(status_code=403, detail="Sin permiso")
        conn.execute("DELETE FROM foro_temas WHERE id = ?", (tid,))
        conn.commit()
        return {"ok": True}


@app.get("/api/foro/temas/{tid}/posts")
def foro_posts(tid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        tema = conn.execute("SELECT * FROM foro_temas WHERE id = ?", (tid,)).fetchone()
        if not tema:
            raise HTTPException(status_code=404, detail="Tema no encontrado")
        posts = conn.execute("SELECT * FROM foro_posts WHERE temaId = ? ORDER BY id ASC", (tid,)).fetchall()
        return {"tema": row_to_dict(tema), "posts": rows_to_list(posts)}


@app.post("/api/foro/temas/{tid}/posts")
def create_foro_post(tid: int, body: ForoPostCreate, jwt_user=Depends(get_current_user)):
    if not body.texto.strip():
        raise HTTPException(status_code=400, detail="Texto vacío")
    with db_conn() as conn:
        tema = conn.execute("SELECT id FROM foro_temas WHERE id = ?", (tid,)).fetchone()
        if not tema:
            raise HTTPException(status_code=404, detail="Tema no encontrado")
        u = conn.execute("SELECT nombre FROM users WHERE id = ?", (jwt_user["id"],)).fetchone()
        autor_nombre = u["nombre"] if u else jwt_user["username"]
        now = now_str()
        cur = conn.execute(
            "INSERT INTO foro_posts (temaId, texto, autorId, autorNombre, creadoEn) VALUES (?,?,?,?,?)",
            (tid, body.texto.strip(), jwt_user["id"], autor_nombre, now),
        )
        conn.execute("UPDATE foro_temas SET ultimaActividad = ? WHERE id = ?", (now, tid))
        detect_mentions(conn, body.texto.strip(), jwt_user["id"], autor_nombre, tid)
        conn.commit()
        return {"id": cur.lastrowid}


@app.delete("/api/foro/posts/{pid}")
def delete_foro_post(pid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        post = conn.execute("SELECT * FROM foro_posts WHERE id = ?", (pid,)).fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        post = dict(post)
        if jwt_user.get("rol") != "admin" and jwt_user["id"] != post["autorId"]:
            raise HTTPException(status_code=403, detail="Sin permiso")
        conn.execute("DELETE FROM foro_posts WHERE id = ?", (pid,))
        conn.commit()
        return {"ok": True}


# ═══════════════════════════════════════════════════════════
#  NOTIFICACIONES
# ═══════════════════════════════════════════════════════════
@app.get("/api/notificaciones")
def get_notificaciones(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM notificaciones WHERE userId = ? ORDER BY creadoEn DESC LIMIT 50",
            (jwt_user["id"],),
        ).fetchall()
        return rows_to_list(rows)


@app.get("/api/notificaciones/count")
def count_notificaciones(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        result = conn.execute(
            "SELECT COUNT(*) as count FROM notificaciones WHERE userId = ? AND leida = 0",
            (jwt_user["id"],),
        ).fetchone()
        return {"count": result["count"]}


@app.put("/api/notificaciones/leer-todas")
def leer_todas_notificaciones(jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        conn.execute("UPDATE notificaciones SET leida = 1 WHERE userId = ? AND leida = 0", (jwt_user["id"],))
        conn.commit()
        return {"ok": True}


@app.put("/api/notificaciones/{nid}/leer")
def leer_notificacion(nid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        notif = conn.execute("SELECT * FROM notificaciones WHERE id = ?", (nid,)).fetchone()
        if not notif:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        notif = dict(notif)
        if notif["userId"] != jwt_user["id"]:
            raise HTTPException(status_code=403, detail="Sin permiso")
        conn.execute("UPDATE notificaciones SET leida = 1 WHERE id = ?", (nid,))
        conn.commit()
        return {"ok": True}


@app.delete("/api/notificaciones/{nid}")
def delete_notificacion(nid: int, jwt_user=Depends(get_current_user)):
    with db_conn() as conn:
        notif = conn.execute("SELECT * FROM notificaciones WHERE id = ?", (nid,)).fetchone()
        if not notif:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        notif = dict(notif)
        if notif["userId"] != jwt_user["id"]:
            raise HTTPException(status_code=403, detail="Sin permiso")
        conn.execute("DELETE FROM notificaciones WHERE id = ?", (nid,))
        conn.commit()
        return {"ok": True}


# ── Static files (serve public dir and uploads) ────────────
if PUBLIC_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
    app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")
