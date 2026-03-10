# Sistema SEREMIS - FastAPI + React

Sistema de reportería sectorial para SEREMIs (Secretarías Regionales Ministeriales) del Gobierno Regional del Maule, migrado desde monolítico HTML+JS a arquitectura moderna FastAPI + React TypeScript.

## 🏗️ Arquitectura

### Backend (FastAPI)
- **Framework**: FastAPI con SQLAlchemy (sync)
- **Base de datos**: SQLite (seremis.db)
- **Autenticación**: JWT tokens
- **Patrón**: Clean Architecture con Repository pattern
- **APIs**: REST completas para todas las entidades

### Frontend (React + TypeScript)
- **Framework**: React 18+ con TypeScript
- **Build**: Vite
- **Estado**: React Query + Context API
- **HTTP Client**: Axios
- **Estilos**: CSS custom variables

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py              # Entrada principal FastAPI
│   ├── database.py          # Configuración base de datos
│   ├── auth.py              # Sistema de autenticación JWT
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── seremi.py
│   │   └── ...
│   ├── schemas/             # Schemas Pydantic
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── seremi.py
│   │   └── ...
│   ├── repositories/        # Capa de acceso a datos
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── seremi_repository.py
│   │   └── ...
│   ├── services/            # Lógica de negocio
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── seremi_service.py
│   │   └── ...
│   └── routes/              # Endpoints API
│       ├── __init__.py
│       ├── auth.py
│       ├── seremis.py
│       ├── users.py
│       ├── foro.py
│       └── ...
├── seremis.db               # Base de datos SQLite
└── requirements.txt         # Dependencias Python

frontend/
├── src/
│   ├── main.tsx             # Entrada principal React
│   ├── App.tsx              # Componente raíz con navegación
│   ├── types/               # Types TypeScript
│   │   └── index.ts
│   ├── api/                 # Cliente HTTP y APIs
│   │   └── client.ts
│   ├── components/          # Componentes React
│   │   ├── AuthProvider.tsx
│   │   └── Header.tsx
│   ├── hooks/               # React hooks personalizados
│   │   └── useApi.tsx
│   ├── pages/               # Páginas principales
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ForoPage.tsx
│   ├── styles/              # Estilos CSS
│   │   └── globals.css
│   └── utils/               # Utilidades
│       └── dateUtils.ts
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración TypeScript
├── vite.config.ts           # Configuración Vite
└── index.html               # HTML base
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.9+
- Node.js 18+
- NPM o Yarn

### Backend Setup

1. **Crear entorno virtual**:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Copiar base de datos**:
```bash
# Copiar seremis.db al directorio backend/
cp ../seremis.db ./seremis.db
```

4. **Ejecutar servidor**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Ejecutar desarrollo**:
```bash
npm run dev
```

3. **Build para producción**:
```bash
npm run build
```

## 🔐 Autenticación

El sistema mantiene los usuarios originales de la base de datos:

### Usuarios Admin
- **Email**: admin@example.com
- **Password**: admin123

### Usuarios SEREMI
Los usuarios SEREMI existentes en la base de datos pueden acceder con sus credenciales originales.

## 📊 Funcionalidades

### Dashboard Principal
- **KPIs generales**: Contador de SEREMIs, visitas, contactos, prensa, proyectos
- **Filtros**: Por período temporal y sector ministerial
- **Vista adaptiva**: Diferente para admin vs usuarios SEREMI

### Sistema de SEREMIs
- Gestión completa de SEREMIs ministeriales
- Visualización de métricas por SEREMI
- Códigos de colores personalizables

### Foro de Discusión
- Creación de temas de discusión
- Sistema de posts con menciones (@usuario)
- Notificaciones en tiempo real
- Diferenciación visual por tipo de usuario

### Sistema de Notificaciones
- Notificaciones automáticas por menciones
- Panel de notificaciones con contador
- Marcar como leídas individual o masivamente

### Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles (admin/seremi)
- Vinculación con SEREMís específicos

## 🔗 APIs Disponibles

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener usuario actual

### SEREMís
- `GET /seremis` - Listar SEREMís
- `POST /seremis` - Crear SEREMI
- `GET /seremis/{id}` - Obtener SEREMI
- `PUT /seremis/{id}` - Actualizar SEREMI
- `DELETE /seremis/{id}` - Eliminar SEREMI

### Usuarios
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `GET /users/{id}` - Obtener usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

### Foro
- `GET /foro/temas` - Listar temas del foro
- `POST /foro/temas` - Crear tema
- `GET /foro/posts` - Listar posts
- `POST /foro/posts` - Crear post
- `GET /foro/temas/{id}/posts` - Posts de un tema

### Notificaciones
- `GET /notificaciones/user/{user_id}` - Notificaciones del usuario
- `PUT /notificaciones/{id}/read` - Marcar como leída
- `PUT /notificaciones/user/{user_id}/read-all` - Marcar todas como leídas

## 🎨 Sistema de Temas

El frontend utiliza CSS custom properties para el theming:

```css
:root {
  --bg: #0b0f1a;              /* Background principal */
  --bg2: #111827;             /* Background secundario */
  --bg3: #1f2937;             /* Background terciario */
  --card: #1a1e2e;            /* Background de cards */
  --border: #374151;          /* Color de bordes */
  --text: #e8edf5;            /* Texto principal */
  --text2: #9ca3af;           /* Texto secundario */
  --text3: #6b7280;           /* Texto terciario */
  --accent: #3a7bd5;          /* Color de acento principal */
  --accent2: #2563eb;         /* Color de acento secundario */
  --accent3: #8b5cf6;         /* Color de acento terciario */
}
```

## 🔄 Estado de Migración

### ✅ Completado
- [x] Estructuras completas backend y frontend
- [x] Autenticación JWT funcional
- [x] Modelos de datos completos (15+ entidades)
- [x] APIs principales (SEREMís, usuarios, foro, notificaciones)
- [x] Dashboard con KPIs y filtros
- [x] Sistema de foro completo
- [x] Sistema de notificaciones
- [x] Header con navegación y notificaciones
- [x] Estilos CSS completos

### 📋 Por Implementar
- [ ] APIs restantes (visitas, contactos, prensa, proyectos, etc.)
- [ ] Páginas adicionales (KPIs, contrataciones, gestión usuarios)
- [ ] Sistema de archivos/uploads
- [ ] Gráficos y estadísticas avanzadas
- [ ] Búsquedas y filtros avanzados
- [ ] Tests unitarios e integración
- [ ] Documentación API con Swagger
- [ ] Scripts de deployment

## 🐛 Conocidos Issues

1. **APIs faltantes**: Muchas APIs del backend están definidas pero no implementadas
2. **Validación**: Sistema de validación básico, necesita robustecimiento
3. **Errores de red**: Manejo de errores de red básico
4. **Performance**: No hay optimización de queries ni caching

## 📝 Notas de Desarrollo

### Patrón de Arquitectura
El proyecto sigue principios de Clean Architecture:

1. **Capa de Modelos**: Define entidades de dominio
2. **Capa de Repositorios**: Abstrae acceso a datos
3. **Capa de Servicios**: Contiene lógica de negocio
4. **Capa de Controladores**: Maneja requests HTTP

### TypeScript Types
Todas las entidades tienen types TypeScript correspondientes que reflejan exactamente la estructura de la base de datos.

### Manejo de Estado
- **Global**: React Context para autenticación
- **Server State**: React Query para datos del servidor
- **Local State**: useState para estado local de componentes

## 🤝 Contribuciones

Para continuar el desarrollo:

1. Implementar APIs faltantes siguiendo el patrón establecido
2. Crear componentes de páginas faltantes siguiendo el diseño
3. Agregar tests usando pytest (backend) y Jest (frontend)
4. Optimizar queries y agregar caching donde sea necesario

## 📞 Soporte

Para dudas sobre el funcionamiento del sistema original o decisiones de diseño, consultar el código HTML original en `index.html` del directorio raíz.