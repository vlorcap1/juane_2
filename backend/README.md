# Backend - Sistema SEREMIS Maule

Sistema de Reportería Sectorial para las 19 Secretarías Regionales Ministeriales (SEREMIs) de la Región del Maule, Chile.

## 🏗️ Tecnologías

- **Node.js** v16+ (recomendado v18+)
- **Express** 4.x - Framework web
- **better-sqlite3** - Base de datos SQLite embebida
- **JWT (jsonwebtoken)** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **multer** - Manejo de carga de archivos
- **CORS** habilitado para desarrollo

## 📂 Estructura del Proyecto

```
backend/
├── server.js          # Servidor principal y rutas API
├── database.js        # Configuración y schema de la BD
├── seremis.db         # Base de datos SQLite (generada automáticamente)
├── uploads/           # Archivos subidos por usuarios
├── package.json       # Dependencias del proyecto
└── README.md          # Este archivo
```

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno (opcional)

Crear un archivo `.env` en la raíz del backend:

```env
PORT=3000
JWT_SECRET=seremis_maule_jwt_secret_2026
NODE_ENV=development
```

Si no se configuran, se usarán los valores por defecto.

## 🚀 Ejecución

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente al iniciar el servidor por primera vez. Incluye:

### Tablas principales:

- **seremis**: 19 SEREMIs con sus sectores y colores
- **users**: Usuarios del sistema (admin y usuarios seremi)
- **visitas**: Registro de visitas a comunas
- **contactos**: Eventos y contactos con personas
- **prensa**: Apariciones en medios de comunicación
- **proyectos**: Proyectos sectoriales
- **nudos**: Nudos críticos por SEREMI
- **temas**: Propuestas de temas
- **agenda**: Hitos relevantes
- **contrataciones**: Solicitudes de contratación con flujo VB
- **visitas_autoridades**: Registro de visitas de autoridades nacionales
- **archivos**: Gestión de archivos adjuntos
- **comentarios**: Comentarios y notas de seguimiento
- **kpi_indicadores**: Indicadores KPI por SEREMI
- **foro_temas** y **foro_posts**: Sistema de foro interno
- **notificaciones**: Notificaciones para usuarios
- **audit_log**: Registro de auditoría completo

### Datos de prueba:

El sistema incluye **datos de demostración** precargados:
- 1 usuario admin: `admin` / `admin123`
- 19 usuarios SEREMI: `salud` / `seremi123`, `educacion` / `seremi123`, etc.
- Registros de ejemplo en todas las tablas

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación:

### Login:
```bash
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "id": "admin",
  "username": "admin",
  "rol": "admin",
  "nombre": "Administrador Regional",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Uso del token:

Todas las rutas API (excepto `/api/login`) requieren el header:

```
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión

### SEREMIs
- `GET /api/seremis` - Listar todas las SEREMIs con estadísticas
- `GET /api/seremis/:id` - Obtener SEREMI específica

### Visitas
- `GET /api/visitas` - Listar visitas (query: `seremiId`, `page`, `limit`)
- `GET /api/visitas/:id` - Obtener visita específica
- `POST /api/visitas` - Crear nueva visita
- `PUT /api/visitas/:id` - Actualizar visita
- `DELETE /api/visitas/:id` - Eliminar visita

### Contactos/Eventos
- `GET /api/contactos` - Listar eventos
- `GET /api/contactos/:id` - Obtener evento específico
- `POST /api/contactos` - Crear evento
- `PUT /api/contactos/:id` - Actualizar evento
- `DELETE /api/contactos/:id` - Eliminar evento

### Prensa
- `GET /api/prensa` - Listar apariciones en prensa
- `POST /api/prensa` - Crear registro de prensa
- `PUT /api/prensa/:id` - Actualizar prensa
- `DELETE /api/prensa/:id` - Eliminar prensa

### Proyectos
- `GET /api/proyectos` - Listar proyectos
- `POST /api/proyectos` - Crear proyecto
- `PUT /api/proyectos/:id` - Actualizar proyecto
- `DELETE /api/proyectos/:id` - Eliminar proyecto

### Nudos críticos
- `GET /api/nudos` - Listar nudos
- `POST /api/nudos` - Crear nudo
- `PUT /api/nudos/:id` - Actualizar nudo
- `DELETE /api/nudos/:id` - Eliminar nudo

### Temas propuestos
- `GET /api/temas` - Listar temas
- `POST /api/temas` - Crear tema
- `PUT /api/temas/:id` - Actualizar tema
- `DELETE /api/temas/:id` - Eliminar tema

### Agenda
- `GET /api/agenda` - Listar hitos de agenda
- `POST /api/agenda` - Crear hito
- `PUT /api/agenda/:id` - Actualizar hito
- `DELETE /api/agenda/:id` - Eliminar hito

### Contrataciones
- `GET /api/contrataciones` - Listar contrataciones
- `POST /api/contrataciones` - Crear solicitud de contratación
- `PUT /api/contrataciones/:id` - Actualizar contratación
- `PUT /api/contrataciones/:id/vb` - Dar visto bueno (admin)
- `DELETE /api/contrataciones/:id` - Eliminar contratación

### Visitas de Autoridades (Ministros/Subsecretarios)
- `GET /api/visitas-autoridades` - Listar visitas de autoridades
- `GET /api/visitas-autoridades/:id` - Obtener visita específica
- `POST /api/visitas-autoridades` - Crear registro de visita
- `PUT /api/visitas-autoridades/:id` - Actualizar visita
- `DELETE /api/visitas-autoridades/:id` - Eliminar visita (solo admin)

### Archivos
- `POST /api/archivos` - Subir archivo
- `POST /api/archivos/upload` - Subir archivo con multer
- `GET /api/archivos` - Listar archivos (query: `seremiId`, `tabla`, `registroId`)
- `GET /api/archivos/:id/download` - Descargar archivo
- `DELETE /api/archivos/:id` - Eliminar archivo

### Comentarios
- `GET /api/comentarios` - Listar comentarios (query: `seremiId`, `tabla`, `registroId`)
- `POST /api/comentarios` - Crear comentario
- `DELETE /api/comentarios/:id` - Eliminar comentario

### KPIs / Indicadores
- `GET /api/kpis` - Listar KPIs (query: `seremiId`)
- `POST /api/kpis` - Crear KPI
- `PUT /api/kpis/:id` - Actualizar KPI
- `DELETE /api/kpis/:id` - Eliminar KPI

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Foro
- `GET /api/foro/users` - Listar usuarios para menciones
- `GET /api/foro/temas` - Listar temas del foro
- `POST /api/foro/temas` - Crear tema nuevo
- `DELETE /api/foro/temas/:id` - Eliminar tema
- `GET /api/foro/temas/:id/posts` - Obtener tema con posts
- `POST /api/foro/temas/:id/posts` - Agregar respuesta
- `DELETE /api/foro/posts/:id` - Eliminar post

### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones del usuario
- `GET /api/notificaciones/count` - Obtener conteo de no leídas
- `PUT /api/notificaciones/:id/leer` - Marcar como leída
- `PUT /api/notificaciones/leer-todas` - Marcar todas como leídas
- `DELETE /api/notificaciones/:id` - Eliminar notificación

### Auditoría
- `GET /api/audit` - Obtener log global (solo admin)
- `GET /api/audit/:tabla/:id` - Obtener historial de un registro

## 👥 Roles de Usuario

### Administrador (`admin`)
**Permisos completos:**
- Ver todas las SEREMIs y sus datos
- Exportar reportes globales (PDF/Excel)
- Gestionar usuarios (crear/editar/eliminar)
- Aprobar contrataciones (Visto Bueno)
- Acceso a módulo de auditoría completo
- Gestionar visitas de autoridades
- Eliminar cualquier contenido

### SEREMI (`seremi`)
**Permisos restringidos a su SEREMI:**
- Ver y editar solo datos de su SEREMI
- Crear registros (visitas, proyectos, nudos, etc.)
- Solicitar contrataciones
- Participar en el foro
- Ver sus propios KPIs
- Subir archivos adjuntos
- Agregar comentarios

## 📊 Características Destacadas

### 1. Sistema de Contrataciones con Visto Bueno
- Flujo de aprobación: SEREMI solicita → Admin aprueba
- Estados: Pendiente / Aprobada
- Archivos adjuntos y comentarios de seguimiento
- Cálculo automático de estadísticas

### 2. Foro Interno con Menciones
- Crear temas de discusión
- Responder con soporte de menciones `@username`
- Notificaciones automáticas al ser mencionado
- Vista de posts en tiempo real

### 3. Sistema de Notificaciones
- Notificaciones push al ser mencionado en el foro
- Badge de contador de no leídas
- Panel desplegable de notificaciones
- Marcar como leídas individual o masivo

### 4. Gestión de Archivos
- Carga de archivos (PDF, Word, Excel, imágenes)
- Límite de 20MB por archivo
- Organización por SEREMI, tabla y registro
- Descarga y eliminación con permisos

### 5. KPIs / Indicadores
- Indicadores personalizados por SEREMI
- Cálculo automático de % de avance
- Estados: En riesgo / En progreso / Completado
- Filtros por SEREMI (admin) o propios (seremi)

### 6. Auditoría Completa
- Registro de todas las operaciones (CREATE, UPDATE, DELETE, LOGIN)
- Historial por registro específico
- Acceso global para administradores
- Información de usuario, fecha y detalles

### 7. Visitas de Autoridades Nacionales
- Registro de Ministros, Subsecretarios y Directores Nacionales
- Agenda, acompañantes, objetivos y resultados
- Archivos adjuntables (fotos, documentos)
- Exportación a Excel
- Estadísticas por tipo de autoridad

## 🔒 Seguridad

### Encriptación de contraseñas
- Todas las contraseñas se encriptan con **bcrypt** (10 rounds)
- Migración automática de contraseñas en texto plano al iniciar

### Tokens JWT
- Expiración: 8 horas
- Secret key configurable vía variable de entorno
- Validación en todas las rutas protegidas

### Validación de permisos
- Middleware `authRequired` en todas las rutas API
- Validación de roles (admin vs seremi)
- Validación de pertenencia a SEREMI en operaciones

### Prevención de inyección SQL
- Uso de **prepared statements** en todas las consultas
- Sanitización de entradas
- Validación de tipos de dato

### Archivos
- Validación de tipos de archivo permitidos
- Límite de tamaño (20MB)
- Nombres de archivo sanitizados
- Organización en carpetas por SEREMI

## 📈 Estadísticas y Reportes

El sistema genera automáticamente:
- **Conteo de visitas** por SEREMI y período
- **Total de personas** en eventos (suma de asistentes)
- **Apariciones en prensa** con análisis de tono
- **Proyectos activos** por estado
- **Nudos críticos** por urgencia
- **Agenda de hitos** ordenada por fecha
- **Estadísticas de contrataciones** (pendientes/aprobadas)
- **Estadísticas de visitas de autoridades** por tipo

## 🐛 Troubleshooting

### Error: `Cannot find module 'better-sqlite3'`
```bash
npm install better-sqlite3 --build-from-source
```

### Error de permisos en archivo `seremis.db`
Verificar permisos de escritura en la carpeta `backend/`:
```bash
chmod 755 backend/
chmod 644 backend/seremis.db
```

### Puerto 3000 ya en uso
Cambiar el puerto en `.env`:
```env
PORT=3001
```

O matar el proceso existente:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### La base de datos no se crea
Verificar que el usuario tenga permisos de escritura y que no haya errores en `database.js`.

## 📝 Logs y Debugging

El servidor muestra en consola:
- Confirmación de inicio: `Servidor SEREMIS Maule corriendo en http://localhost:3000`
- Migración de contraseñas: `✓ Contraseñas migradas a bcrypt`
- Errores de DB, autenticación, archivos, etc.

## 🧪 Testing

Para probar la API manualmente, usar herramientas como:
- **Postman** o **Insomnia** (para requests HTTP)
- **curl** (línea de comandos)
- **Thunder Client** (extensión VSCode)

Ejemplo con curl:
```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Obtener SEREMIs (con token)
curl http://localhost:3000/api/seremis \
  -H "Authorization: Bearer <tu_token>"
```

## 📦 Dependencias del Proyecto

```json
{
  "express": "^4.18.2",
  "better-sqlite3": "^9.2.2",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5"
}
```

## 🚀 Despliegue en Producción

### Variables de entorno recomendadas:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<generar_secreto_seguro>
```

### Consideraciones:
- Usar **HTTPS** (certificado SSL/TLS)
- Configurar **reverse proxy** (Nginx o Apache)
- Habilitar **rate limiting** para prevenir DDoS
- Backup periódico de `seremis.db` y carpeta `uploads/`
- Considerar migrar a PostgreSQL o MySQL para producción a gran escala

## 📞 Soporte

Sistema desarrollado para el **Gobierno Regional del Maule**.

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026

---

**© 2026 Gobierno Regional del Maule - Uso interno**
