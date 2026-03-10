# SEREMIS Maule - Documentación Completa del Sistema Migrado

## 🎯 Resumen de la Migración

Este proyecto fue migrado desde una arquitectura Node.js + Express + Vanilla JavaScript a una arquitectura moderna con Python FastAPI + React TypeScript.

### Stack Original
- **Backend:** Node.js + Express + better-sqlite3
- **Frontend:** Vanilla HTML/CSS/JavaScript (SPA de 4314 líneas)
- **Base de Datos:** SQLite

### Stack Nuevo
- **Backend:** Python 3.10+ + FastAPI + SQLAlchemy
- **Frontend:** React 18 + TypeScript + Vite
- **Base de Datos:** SQLite (mismo esquema)

## 🗂️ Estructura Completa del Backend

### Modelos SQLAlchemy (app/models/)

Todos los modelos están completamente implementados:

1. **seremi.py** - 19 SEREMIs del gobierno regional
2. **user.py** - Usuarios con roles (admin/seremi)
3. **visita.py** - Visitas a comunas
4. **contacto.py** - Contactos y reuniones
5. **prensa.py** - Apariciones en prensa
6. **proyecto.py** - Proyectos sectoriales
7. **nudo.py** - Nudos críticos
8. **tema.py** - Temas relevantes
9. **agenda.py** - Agenda de hitos
10. **contratacion.py** - Contrataciones con VB
11. **kpi.py** - KPIs e indicadores
12. **archivo.py** - Archivos adjuntos
13. **comentario.py** - Comentarios en registros
14. **foro.py** - ForoTema y ForoPost
15. **notificacion.py** - Notificaciones
16. **audit.py** - Log de auditoría

### Schemas Pydantic (app/schemas/)

Schemas completos para validación de datos:

1. **auth.py** - LoginRequest, TokenResponse, TokenData
2. **user.py** - UserBase, UserCreate, UserUpdate, UserResponse
3. **seremi.py** - SeremiBase, SeremiResponse
4. **foro.py** - ForoTemaCreate, ForoPostCreate, NotificacionResponse
5. **records.py** - Todos los schemas de registros:
   - Visita (Create, Update, Response)
   - Contacto (Create, Update, Response)
   - Prensa (Create, Update, Response)
   - Proyecto (Create, Update, Response)
   - Nudo (Create, Update, Response)
   - Tema (Create, Update, Response)
   - Agenda (Create, Update, Response)
   - Contratacion (Create, Update, Response)
   - Archivo (Create, Response)
   - Comentario (Create, Response)
   - KPI (Create, Update, Response)
   - AuditLog (Response)

### Rutas API (app/api/routes/)

Todas las rutas están completamente implementadas:

#### 1. **auth.py** - Autenticación
- `POST /api/login` - Login con JWT

#### 2. **seremis.py** - SEREMIs
- `GET /api/seremis` - Listar todas las SEREMIs
- `GET /api/seremis/{id}` - Obtener SEREMI específica con datos agregados

#### 3. **users.py** - Usuarios (solo admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

#### 4. **visitas.py** - Visitas a Comunas
- `GET /api/visitas` - Listar (filtrado por SEREMI si rol=seremi)
- `GET /api/visitas/{id}` - Obtener una visita
- `POST /api/visitas` - Crear visita
- `PUT /api/visitas/{id}` - Actualizar visita
- `DELETE /api/visitas/{id}` - Eliminar visita
- ✅ Audit log en CREATE/UPDATE/DELETE

#### 5. **contactos.py** - Contactos y Reuniones
- `GET /api/contactos` - Listar contactos
- `GET /api/contactos/{id}` - Obtener contacto
- `POST /api/contactos` - Crear contacto
- `PUT /api/contactos/{id}` - Actualizar contacto
- `DELETE /api/contactos/{id}` - Eliminar contacto
- ✅ Audit log implementado

#### 6. **prensa.py** - Apariciones en Prensa
- `GET /api/prensa` - Listar prensa
- `GET /api/prensa/{id}` - Obtener registro de prensa
- `POST /api/prensa` - Crear registro
- `PUT /api/prensa/{id}` - Actualizar registro
- `DELETE /api/prensa/{id}` - Eliminar registro
- ✅ Audit log implementado

#### 7. **proyectos.py** - Proyectos Sectoriales
- `GET /api/proyectos` - Listar proyectos
- `GET /api/proyectos/{id}` - Obtener proyecto
- `POST /api/proyectos` - Crear proyecto
- `PUT /api/proyectos/{id}` - Actualizar proyecto
- `DELETE /api/proyectos/{id}` - Eliminar proyecto
- ✅ Audit log implementado

#### 8. **nudos.py** - Nudos Críticos
- `GET /api/nudos` - Listar nudos
- `GET /api/nudos/{id}` - Obtener nudo
- `POST /api/nudos` - Crear nudo
- `PUT /api/nudos/{id}` - Actualizar nudo
- `DELETE /api/nudos/{id}` - Eliminar nudo
- ✅ Audit log implementado

#### 9. **temas.py** - Temas Relevantes
- `GET /api/temas` - Listar temas
- `GET /api/temas/{id}` - Obtener tema
- `POST /api/temas` - Crear tema
- `PUT /api/temas/{id}` - Actualizar tema
- `DELETE /api/temas/{id}` - Eliminar tema
- ✅ Audit log implementado

#### 10. **agenda.py** - Agenda de Hitos
- `GET /api/agenda` - Listar eventos
- `GET /api/agenda/{id}` - Obtener evento
- `POST /api/agenda` - Crear evento
- `PUT /api/agenda/{id}` - Actualizar evento
- `DELETE /api/agenda/{id}` - Eliminar evento
- ✅ Audit log implementado

#### 11. **contrataciones.py** - Contrataciones con VB
- `GET /api/contrataciones` - Listar contrataciones
- `GET /api/contrataciones/{id}` - Obtener contratación
- `POST /api/contrataciones` - Crear contratación
- `PUT /api/contrataciones/{id}` - Actualizar contratación
- `DELETE /api/contrataciones/{id}` - Eliminar contratación
- ✅ Audit log implementado

#### 12. **kpis.py** - KPIs e Indicadores
- `GET /api/kpis` - Listar KPIs
- `GET /api/kpis/{id}` - Obtener KPI
- `POST /api/kpis` - Crear KPI
- `PUT /api/kpis/{id}` - Actualizar KPI
- `DELETE /api/kpis/{id}` - Eliminar KPI
- ✅ Audit log implementado

#### 13. **archivos.py** - Sistema de Archivos
- `GET /api/archivos` - Listar archivos (filtrado por tabla/registro)
- `GET /api/archivos/{id}` - Info de archivo
- `GET /api/archivos/{id}/download` - Descargar archivo
- `POST /api/archivos` - Subir archivo (multipart/form-data)
- `DELETE /api/archivos/{id}` - Eliminar archivo (solo admin)
- ✅ Validación de tamaño máximo (20MB)
- ✅ Nombres únicos con UUID
- ✅ Almacenamiento en carpeta uploads/

#### 14. **comentarios.py** - Sistema de Comentarios
- `GET /api/comentarios` - Listar comentarios (filtrado por tabla/registro)
- `GET /api/comentarios/{id}` - Obtener comentario
- `POST /api/comentarios` - Crear comentario (autor automático)
- `DELETE /api/comentarios/{id}` - Eliminar (autor o admin)

#### 15. **foro.py** - Sistema de Foro
- `GET /api/foro/temas` - Listar temas del foro
- `POST /api/foro/temas` - Crear tema
- `GET /api/foro/temas/{id}` - Ver tema con posts
- `POST /api/foro/temas/{id}/posts` - Responder en tema
- `DELETE /api/foro/posts/{id}` - Eliminar post
- ✅ Creación automática de notificaciones en menciones
- ✅ Sistema de menciones con @usuario

#### 16. **notificaciones.py** - Sistema de Notificaciones
- `GET /api/notificaciones` - Listar notificaciones del usuario
- `GET /api/notificaciones/count` - Contador de no leídas
- `PUT /api/notificaciones/{id}/read` - Marcar como leída
- `PUT /api/notificaciones/read-all` - Marcar todas como leídas
- `DELETE /api/notificaciones/{id}` - Eliminar notificación

### Core (app/core/)

#### config.py
- Configuración con Pydantic Settings
- Variables de entorno
- Configuración de JWT, CORS, uploads

#### database.py
- Engine SQLAlchemy
- SessionLocal
- Base declarativa
- Dependency `get_db()`

#### security.py
- `verify_password()` - Verificación con bcrypt
- `get_password_hash()` - Hash de contraseñas
- `create_access_token()` - Generación JWT
- `decode_access_token()` - Validación JWT

### Dependencies (app/api/dependencies.py)

- `get_current_user()` - Extrae usuario del token JWT
- `require_admin()` - Valida rol de administrador

## 🎨 Frontend Completo

### Estructura React

```
src/
├── api/
│   ├── client.ts          # Cliente Axios configurado
│   ├── auth.ts            # Funciones de autenticación
│   ├── foro.ts            # API del foro
│   ├── notificaciones.ts  # API de notificaciones
│   └── seremis.ts         # API de SEREMIs
├── components/
│   ├── Login.tsx          # Pantalla de login
│   ├── Header.tsx         # Header con usuario y notificaciones
│   ├── TabNavigation.tsx  # Navegación de tabs
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── MiSeremi.tsx       # Vista de SEREMI individual
│   ├── ContratacionesPage.tsx  # Gestión de contrataciones
│   ├── UsuariosPage.tsx   # Gestión de usuarios (admin)
│   ├── IndicadoresPage.tsx # KPIs e indicadores
│   ├── ForoPage.tsx       # Sistema de foro
│   ├── dashboard/         # Componentes del dashboard
│   ├── miseremi/          # Componentes de Mi SEREMI
│   ├── modals/            # Modales de formularios
│   └── ui/                # Componentes UI reutilizables
├── context/
│   ├── FilterContext.tsx       # Contexto de filtros globales
│   └── NuevoRegistroContext.tsx # Contexto de nuevo registro
├── hooks/
│   ├── useApi.tsx         # Hook genérico de API
│   ├── useSessionTimeout.ts # Auto-logout
│   ├── useVisitas.ts      # Hook de visitas
│   ├── useContactos.ts    # Hook de contactos
│   ├── usePrensa.ts       # Hook de prensa
│   ├── useProyectos.ts    # Hook de proyectos
│   └── ... (más hooks)
├── types/
│   ├── index.ts           # Tipos principales
│   ├── records.ts         # Tipos de registros
│   ├── foro.ts            # Tipos del foro
│   └── dashboard.ts       # Tipos del dashboard
├── utils/
│   └── dateUtils.ts       # Utilidades de fechas
├── App.tsx                # Componente principal
├── main.tsx               # Entry point
└── index.css              # Estilos globales (completo)
```

### Estilos CSS

✅ **Todos los estilos del HTML original están implementados:**

- Login screen completo
- Header con navegación
- Tabs de navegación (admin/seremi)
- KPIs cards
- Period bar y filtros
- SEREMI cards grid
- Detail panel expandible
- Tablas de datos
- Modales de formularios
- Sistema de foro
- Panel de notificaciones
- Cards de usuarios
- Animaciones y transiciones
- Diseño responsive

### Paleta de Colores (CSS Variables)

```css
:root {
  --bg: #0b0f1a;
  --bg2: #111827;
  --bg3: #1a2234;
  --card: #151e2e;
  --border: #1e2d45;
  --accent: #e8a03a;    /* naranja */
  --accent2: #3a7bd5;   /* azul */
  --accent3: #2ec4a5;   /* verde */
  --danger: #e85454;    /* rojo */
  --text: #e8edf5;
  --text2: #8fa3bf;
  --text3: #4e6480;
}
```

### Tipografías

- **DM Sans** - Texto general
- **DM Serif Display** - Títulos
- **JetBrains Mono** - Números y código

## 🔐 Sistema de Autenticación

### Backend
1. Usuario envía credenciales a `/api/login`
2. Backend valida con bcrypt
3. Si válido, genera JWT con:
   - `id`: ID del usuario
   - `username`: Nombre de usuario
   - `rol`: admin o seremi
   - `exp`: Expiración (8 horas)
4. Devuelve token + datos de usuario

### Frontend
1. Guarda token en `localStorage`
2. Axios interceptor agrega header `Authorization: Bearer <token>`
3. Si respuesta 401, redirige a login

### Middleware de Seguridad
- `get_current_user()` - Valida token en cada request protegido
- `require_admin()` - Valida rol de administrador
- Filtrado automático por `seremiId` si rol=seremi

## 📊 Base de Datos

### Tablas Principales

1. **seremis** - 19 SEREMIs
   - id, sector, nombre, c1 (color1), c2 (color2)

2. **users** - Usuarios del sistema
   - id, username, pass, rol, seremiId, nombre, cargo, email, tel

3. **visitas** - Visitas a comunas
   - id, seremiId, fecha, comuna, lugar, personas, descripcion

4. **contactos** - Contactos y reuniones
   - id, seremiId, nombre, fecha, lugar, personas, tipo, instituciones, descripcion

5. **prensa** - Apariciones en prensa
   - id, seremiId, titular, medio, fecha, tipoMedio, tono, url, resumen

6. **proyectos** - Proyectos sectoriales
   - id, seremiId, title, meta, estado, presupuesto, descripcion, comunas

7. **nudos** - Nudos críticos
   - id, seremiId, title, desc, urgencia, solucion

8. **temas** - Temas relevantes
   - id, seremiId, tema, ambito, prioridad, descripcion

9. **agenda** - Agenda de hitos
   - id, seremiId, fecha, texto, cat, lugar, notas

10. **contrataciones** - Contrataciones con VB
    - id, seremiId, nombre, rut, cargo, grado, tipo, esNuevo, inicio, termino, monto, financ, just, estado, vbQuien, vbFecha, creadoPor, creadoEn

11. **kpi_indicadores** - KPIs
    - id, seremiId, nombre, meta, real, unidad, periodo, descripcion

12. **archivos** - Archivos adjuntos
    - id, seremiId, tabla, registroId, nombre, nombreDisco, ruta, tipo, tamano, subidoPor, subidoEn

13. **comentarios** - Comentarios
    - id, seremiId, tabla, registroId, texto, autorId, autorNombre, fecha

14. **foro_temas** - Temas del foro
    - id, titulo, cuerpo, autorId, autorNombre, creadoEn, ultimaActividad

15. **foro_posts** - Posts del foro
    - id, temaId, texto, autorId, autorNombre, creadoEn

16. **notificaciones** - Notificaciones
    - id, userId, tipo, titulo, mensaje, url, leida, creadoEn, autorId, autorNombre

17. **audit_log** - Log de auditoría
    - id, userId, userName, accion, tabla, registroId, detalles, fecha

## 🎯 Funcionalidades Implementadas

### ✅ Backend Completo
- [x] 17 modelos SQLAlchemy
- [x] Todos los schemas Pydantic
- [x] 16 módulos de rutas API
- [x] Autenticación JWT
- [x] Autorización por roles
- [x] Audit log automático
- [x] Sistema de archivos
- [x] Sistema de comentarios
- [x] Foro con menciones
- [x] Notificaciones
- [x] Validación de datos
- [x] Manejo de errores
- [x] CORS configurado

### ✅ Frontend Completo
- [x] Sistema de autenticación
- [x] Dashboard con KPIs
- [x] Gestión de SEREMIs
- [x] Vista individual de SEREMI
- [x] Gestión de contrataciones
- [x] Panel de usuarios (admin)
- [x] Panel de indicadores
- [x] Sistema de foro
- [x] Sistema de notificaciones
- [x] Filtros y período
- [x] Modales de formularios
- [x] Diseño completo responsive
- [x] Todos los estilos CSS
- [x] Custom hooks
- [x] Contextos globales

## 🚀 Instrucciones de Despliegue

### Backend

1. **Instalar dependencias:**
\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

2. **Configurar variables de entorno:** (opcional, crear `.env`)
\`\`\`env
DATABASE_URL=sqlite:///./seremis.db
JWT_SECRET=tu_secreto_seguro_aqui
JWT_EXPIRATION_HOURS=8
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
\`\`\`

3. **Iniciar servidor:**
\`\`\`bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

### Frontend

1. **Instalar dependencias:**
\`\`\`bash
cd frontend
npm install
\`\`\`

2. **Configurar API:** (crear `.env`)
\`\`\`env
VITE_API_BASE_URL=http://localhost:8000
\`\`\`

3. **Iniciar servidor de desarrollo:**
\`\`\`bash
npm run dev
\`\`\`

4. **Build para producción:**
\`\`\`bash
npm run build
\`\`\`

## 📝 Notas de Migración

### Cambios Principales

1. **Express → FastAPI**
   - Rutas con decoradores `@router.get`, `@router.post`, etc.
   - Validación automática con Pydantic
   - Documentación automática Swagger

2. **better-sqlite3 → SQLAlchemy**
   - ORM completo
   - Relaciones declarativas
   - Session management

3. **Vanilla JS → React + TypeScript**
   - Componentización
   - Type safety
   - State management con hooks
   - React Query para datos servidor

4. **bcryptjs → bcrypt (Python)**
   - Misma funcionalidad, diferente implementación

5. **Multer → FastAPI UploadFile**
   - API similar, validación integrada

### Compatibilidad de Base de Datos

✅ La estructura de la base de datos es 100% compatible con el sistema original.
La migración NO requiere cambios en los datos existentes.

## 🐛 Troubleshooting

### Backend no inicia
- Verificar que Python 3.10+ esté instalado
- Verificar que todas las dependencias estén instaladas
- Revisar logs de Uvicorn

### Frontend no conecta al backend
- Verificar que VITE_API_BASE_URL esté configurado
- Verificar que backend esté corriendo en el puerto correcto
- Revisar consola del navegador para errores CORS

### Errores de autenticación
- Verificar que el token se esté guardando en localStorage
- Revisar que el header Authorization se esté enviando
- Verificar que JWT_SECRET no haya cambiado

## 📞 Soporte

Para soporte técnico o consultas sobre la migración, contactar al equipo de desarrollo.

---

**Migración completada el 10 de Marzo, 2026**
**Sistema 100% funcional y listo para producción**
