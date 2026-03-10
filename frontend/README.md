# Frontend - Sistema SEREMIS Maule

Sistema de Reportería Sectorial para las 19 Secretarías Regionales Ministeriales (SEREMIs) de la Región del Maule, Chile.

## 🎨 Descripción

Frontend SPA (Single Page Application) completamente vanilla - sin frameworks ni librerías externas. Todo el código HTML, CSS y JavaScript está contenido en un único archivo `index.html` para máxima simplicidad y portabilidad.

## 🏗️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Variables CSS, Flexbox, Grid
- **JavaScript ES6+** - Fetch API, Async/Await, Modules
- **jsPDF** - Generación de PDFs (CDN)
- **xlsx.js** - Exportación a Excel (CDN)
- **Google Fonts** - Tipografías DM Sans, DM Serif Display, JetBrains Mono

## 📂 Estructura

```
frontend/
├── public/
│   └── index.html        # Aplicación completa (HTML + CSS + JS)
└── README.md             # Este archivo
```

## 🎯 Características

### ✨ Diseño UI/UX

- **Tema oscuro premium** con gradientes sutiles
- **Tipografías profesionales**: DM Sans (cuerpo), DM Serif Display (títulos), JetBrains Mono (datos)
- **Paleta de colores**: Azul (#3a7bd5), Naranja (#e8a03a), Verde (#2ec4a5), Rojo (#e85454)
- **Animaciones suaves** en hover y transiciones
- **Responsive design** para desktop, tablet y móvil
- **Cards interactivas** con shadow y efectos 3D
- **Loading states** y feedback visual instantáneo

### 🔐 Autenticación

- **Login screen** con credenciales precargadas
- **JWT tokens** almacenados en memoria (no localStorage por seguridad)
- **Auto-logout** por inactividad (30 minutos)
- **Validación de sesión** en cada request

### 🎭 Roles y Vistas

#### Administrador Regional
- Vista global de las 19 SEREMIs
- Dashboard con KPIs agregados
- Filtros por sector (Salud, Educación, MOP, etc.)
- Filtros por período (1 mes, 3 meses, 6 meses, 1 año)
- Exportación global: PDF y Excel
- Gestión de usuarios y permisos
- Aprobación de contrataciones (Visto Bueno)
- Acceso a todas las funcionalidades

#### SEREMI
- Vista focalizada en su propia SEREMI
- Panel "Mi SEREMI" para gestión directa
- Creación de registros (visitas, proyectos, nudos, etc.)
- Solicitud de contrataciones
- Participación en foro interno
- Visualización de KPIs propios

### 📊 Módulos Principales

#### 1. Dashboard
- **KPIs destacados**: SEREMIs activas, Visitas, Personas, Prensa, Proyectos, Nudos críticos
- **Grid de tarjetas** por SEREMI con métricas (Visitas, Personas, Prensa, Nudos)
- **Panel de detalle expandible** con información completa
- **Últimas apariciones en prensa**
- **Propuestas de temas** destacadas
- **Agenda de hitos relevantes** (próximos eventos)
- **Barra de período** para filtrar por tiempo
- **Barra de exportación** (PDF individual, PDF global, Excel)

#### 2. Visitas de Autoridades 🎖️
- **Registro de visitas** de Ministros, Subsecretarios y Directores Nacionales
- **Estadísticas** por tipo de autoridad
- **Tabla dinámica** con filtros
- **Archivos adjuntos**: Agenda, fotos, reportes
- **Drag & drop** para carga de archivos
- **Exportación a Excel**
- **Campos detallados**: Agenda, acompañantes, objetivos, resultados, impacto en medios

#### 3. Contrataciones 📋
- **Solicitudes de contratación** con flujo de aprobación
- **Estados**: Pendiente VB, Aprobada
- **Estadísticas**: Total, Pendientes, Aprobadas, Históricos, Suma pesos
- **Filtros** por estado
- **Búsqueda** por nombre, RUT, cargo
- **Tabla detallada** con toda la información
- **Modal de detalle** con flujo de Visto Bueno visual
- **Archivos adjuntos** (CV, certificados, resoluciones)
- **Comentarios** de seguimiento
- **Badge de notificación** de pendientes

#### 4. Usuarios y SEREMIs (solo admin) 👥
- **Grid de usuarios** con foto de perfil generada
- **Roles**: Admin, SEREMI
- **Gestión completa**: Crear, editar, eliminar
- **Asociación** usuario ↔ SEREMI
- **Credenciales** seguras (bcrypt en backend)

#### 5. KPIs / Indicadores 📈
- **Lista de KPIs** por SEREMI
- **Indicadores personalizados**: Meta, Real, Unidad, Período
- **% de avance automático** con colores (rojo < 70%, amarillo 70-90%, verde ≥ 90%)
- **Filtro por SEREMI** (admin) o vista propia (seremi)
- **Crear, editar, eliminar** indicadores

#### 6. Foro Interno 💬
- **Temas de discusión** con respuestas
- **Menciones @username** con autocompletado
- **Notificaciones** cuando te mencionan
- **Panel lateral** para ver tema completo
- **Eliminar posts** (dueño o admin)
- **Vista de actividad reciente**

#### 7. Mi SEREMI (solo vista seremi) 📋
Panel integrado para gestión directa:
- **Visitas a comunas** (tabla CRUD)
- **Proyectos** (tabla CRUD)
- **Nudos críticos** (tabla CRUD)
- **Temas propuestos** (tabla CRUD)
- **Agenda de hitos** (tabla CRUD)
- **Apariciones en prensa** (tabla CRUD)
- **Eventos y contactos** (tabla CRUD)

#### 8. SEIA - Búsqueda de Proyectos 🌿
- **iframe integrado** del Sistema de Evaluación de Impacto Ambiental
- Búsqueda de proyectos ingresados al SEIA
- Acceso directo sin salir del sistema

### 🔔 Sistema de Notificaciones

- **Badge en tiempo real** con contador de no leídas
- **Panel desplegable** con últimas notificaciones
- **Tipos de notificaciones**:
  - Mención en foro
  - Contratación aprobada
  - Comentario en registro
- **Marcar como leída** individual o todas
- **Eliminar** notificaciones
- **Click para navegar** al contenido relacionado
- **Polling automático** cada 30 segundos

### 📤 Exportación de Datos

#### PDF
- **PDF individual** por SEREMI (desde tarjeta o detalle)
- **PDF global** con todas las SEREMIs
- **Diseño profesional** con fondo oscuro
- **Secciones**: KPIs, Comunas, Proyectos, Nudos, Temas, Agenda, Prensa
- **Metadata**: Fecha de generación, período, SEREMI

#### Excel
- **Excel completo** con 6 hojas:
  1. Resumen General
  2. Proyectos
  3. Nudos Críticos
  4. Prensa
  5. Agenda
  6. Temas Propuestos
- **Excel individual** por SEREMI
- **Excel de prensa** standalone
- **Excel de agenda** standalone
- **Excel de contrataciones**
- **Excel de visitas de autoridades**
- **Formato profesional** con anchos de columna optimizados

### 🎨 Componentes Reutilizables

#### Modales
- **Modal de nuevo registro** con selector de tipo (Visita, Contacto, Prensa, Proyecto, Nudo, Tema, Agenda)
- **Modal de usuario** (crear/editar)
- **Modal de KPI** (crear/editar)
- **Modal de contratación** con validación de campos obligatorios
- **Modal de detalle** de contratación con flujo VB
- **Modal de visita de autoridad** con drag & drop
- **Modal de colaboración** con tabs (Comentarios, Archivos, Historial)
- **Cierre con Esc** o click outside

#### Tarjetas
- **Tarjeta SEREMI** con stripe de color, métricas y acciones
- **Tarjeta usuario** con avatar generado y acciones
- **Tarjeta KPI** con % de avance visual
- **Tarjeta de tema foro** con contador de respuestas
- **Tarjeta de notificación** con badge de no leída

#### Formularios
- **Inputs validados** con estados focus y error
- **Selects personalizados** con estilos consistentes
- **Textareas** con resize vertical
- **Upload zones** con drag & drop visual
- **Grupos de urgencia** (Alta/Media/Baja) como botones
- **Grupos de tono** (Positivo/Neutro/Negativo) como botones

#### Tablas
- **Tablas responsivas** con scroll horizontal
- **Headers fijos** con ordenamiento
- **Filas hover** con highlight
- **Acciones inline** (ver, editar, eliminar)
- **Paginación** (implementada en backend, lista en frontend)
- **Búsqueda dinámica** con filtro en tiempo real

#### Badges
- **Estado badges**: Pendiente (naranja), Aprobada (verde)
- **Tipo badges**: Plaza nueva/Cambio de plaza
- **Urgencia badges**: Alta (rojo), Media (amarillo), Baja (verde)
- **Tono badges**: Positivo (verde), Neutro (gris), Negativo (rojo)
- **SEREMI tags** con color del sector

### 🌐 Navegación

- **Tab navigation** para admin con 7 tabs:
  - Dashboard
  - Visitas Autoridades
  - Contrataciones
  - Usuarios y SEREMIs
  - KPIs/Indicadores
  - Foro
  - SEIA Proyectos

- **Tab navigation** para seremi con 7 tabs:
  - Dashboard
  - Mi SEREMI
  - Visitas Autoridades
  - Mis KPIs
  - Mis Contrataciones
  - Foro
  - SEIA Proyectos

- **Sin recarga de página** (SPA pura)
- **Estado persistente** en memoria
- **Breadcrumbs visuales** con títulos dinámicos

### ⚡ Performance

- **Carga bajo demanda** de datos
- **Filtrado en memoria** para respuesta instantánea
- **Debounce en búsquedas** (300ms)
- **Caché de usuarios** y SEREMIs
- **Virtual scrolling** listo para implementar en listas largas
- **Compresión de imágenes** antes de subir (futuro)

### 🔒 Seguridad Frontend

- **No almacenamiento de tokens** en localStorage (memoria volátil)
- **Auto-logout por inactividad** (30 min)
- **Validación de roles** en UI (además del backend)
- **Sanitización de inputs** antes de enviar
- **Prevención de XSS** con textContent en lugar de innerHTML cuando es posible
- **CSRF protection** con tokens JWT

### 📱 Responsive Design

#### Desktop (≥ 1100px)
- Grid de 6 columnas para KPIs
- Grid de 3 columnas para detalle panel
- Grid auto-fill para tarjetas SEREMI (min 290px)

#### Tablet (768px - 1100px)
- Grid de 3 columnas para KPIs
- Grid de 2 columnas para detalle panel
- Ajuste de padding y tamaños

#### Mobile (< 768px)
- Grid de 2 columnas para KPIs
- Grid de 1 columna para tarjetas
- Stack vertical para modales
- Menú hamburger (próximo)
- Touch-friendly buttons (44px mínimo)

### 🎭 Estados de Usuario

#### Sin sesión
- Pantalla de login visible
- Todos los datos ocultos
- Hints de credenciales de prueba

#### Admin logueado
- Vista completa del dashboard
- Acceso a gestión de usuarios
- Filtros de sector y período
- Exportación global
- Aprobación de contrataciones

#### SEREMI logueado
- Banner con info de su SEREMI
- Dashboard filtrado solo a su SEREMI
- Tab "Mi SEREMI" para gestión directa
- Sin acceso a gestión de usuarios
- Sin filtro de sectores (solo ve el suyo)

### 🎨 Paleta de Colores

```css
--bg: #0b0f1a          /* Fondo principal */
--bg2: #111827         /* Fondo secundario */
--bg3: #1a2234         /* Fondo terciario */
--card: #151e2e        /* Fondo de tarjetas */
--border: #1e2d45      /* Bordes */
--accent: #e8a03a      /* Naranja (acciones primarias) */
--accent2: #3a7bd5     /* Azul (enlaces, íconos) */
--accent3: #2ec4a5     /* Verde (éxito, positivo) */
--danger: #e85454      /* Rojo (errores, nudos) */
--text: #e8edf5        /* Texto principal */
--text2: #8fa3bf       /* Texto secundario */
--text3: #4e6480       /* Texto terciario */
```

### 📝 Tipografías

```css
/* Títulos y énfasis */
font-family: 'DM Serif Display', serif;

/* Cuerpo general */
font-family: 'DM Sans', sans-serif;

/* Datos, fechas, montos */
font-family: 'JetBrains Mono', monospace;
```

## 🚀 Uso

### 1. Servir los archivos estáticos

El backend ya sirve automáticamente el archivo `public/index.html` en la ruta raíz `/`.

### 2. Acceder al sistema

Abrir navegador en:
```
http://localhost:3000
```

### 3. Iniciar sesión

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**SEREMIs:**
- Usuario: `salud`, `educacion`, `obras`, etc.
- Contraseña: `seremi123` (todos comparten la misma por defecto)

### 4. Navegación

- Usar las pestañas superiores para cambiar de módulo
- Hacer clic en tarjetas SEREMI para expandir detalle
- Usar filtros de período y sector (admin)
- Exportar datos desde botones de descarga
- Crear registros desde botones "+ Nuevo"

## 🎯 Flujos Principales

### Crear una nueva visita

1. Click en "+ Nuevo Registro" (admin) o botón en tarjeta SEREMI
2. Seleccionar tipo "Visita a Comuna"
3. Rellenar formulario: fecha, comuna, lugar, personas, descripción
4. Click en "Guardar Registro"
5. Ver confirmación en toast verde
6. Datos actualizados instantáneamente en dashboard

### Solicitar una contratación (SEREMI)

1. Ir a tab "Mis Contrataciones"
2. Click en "+ Nueva Contratación"
3. Rellenar formulario obligatorio
4. Click en "Enviar al Administrador"
5. Estado: "Pendiente VB"
6. Esperar aprobación del admin

### Aprobar una contratación (Admin)

1. Ir a tab "Contrataciones"
2. Ver badge naranja con # pendientes
3. Filtrar por "⏳ Pendiente VB"
4. Click en "Ver" de la contratación
5. Revisar detalles completos
6. Click en "✅ Dar Visto Bueno"
7. Estado cambia a "Aprobada" (verde)

### Mencionar usuario en foro

1. Ir a tab "Foro"
2. Click en "+ Nuevo Tema" o abrir tema existente
3. Escribir mensaje con `@username`
4. Aparece dropdown de autocompletado
5. Seleccionar usuario
6. Click en "Publicar" o "Responder"
7. Usuario mencionado recibe notificación

### Ver notificaciones

1. Hacer click en 🔔 en header
2. Panel desplegable se abre
3. Ver lista de notificaciones
4. Click en notificación para ir al contenido
5. Marcar como leída automáticamente
6. Badge se actualiza

### Registrar visita de autoridad

1. Ir a tab "Visitas Autoridades"
2. Click en "+ Nueva Visita"
3. Rellenar datos de la autoridad
4. Arrastrar archivos (agenda, fotos) a la zona de drop
5. Ver preview de archivos adjuntados
6. Click en "Guardar Visita"
7. Ver en tabla principal

## 🐛 Solución de Problemas

### Error: No se cargan los datos

**Causa:** Backend no está corriendo o puerto incorrecto  
**Solución:**
```bash
cd backend
npm start
```

### Error: "Token requerido" o "Token inválido"

**Causa:** Sesión expirada o backend reiniciado  
**Solución:** Refrescar página y volver a iniciar sesión

### Los filtros no funcionan

**Causa:** JavaScript deshabilitado o error en consola  
**Solución:** Abrir DevTools (F12), revisar errores en consola

### Exportación PDF/Excel no funciona

**Causa:** CDN bloqueado o navegador antiguo  
**Solución:** Verificar conexión a internet, usar navegador moderno (Chrome, Firefox, Edge)

### Las notificaciones no aparecen

**Causa:** Polling no iniciado o sesión sin permisos  
**Solución:** Logout y login nuevamente

### Drag & drop no funciona para archivos

**Causa:** Navegador antiguo o permisos de archivo  
**Solución:** Usar Chrome/Firefox actualizado, click en "seleccionar" como alternativa

### Los colores no se ven bien

**Causa:** Modo claro del OS o extensión de tema del navegador  
**Solución:** Desactivar extensiones de tema, el sistema es dark-only

## 📖 Convenciones de Código

### JavaScript
- Variables: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE`
- Funciones: `camelCase` descriptivo
- Async/await preferido sobre Promises
- No usar `var`, solo `let` y `const`
- Comentarios en español
- Funciones documentadas con su propósito

### CSS
- Variables CSS para colores y tamaños
- BEM-like naming: `.component-element--modifier`
- Mobile-first en media queries
- Prefijos vendor automáticos (no necesario manualmente)
- Unidades: `rem` para tipografía, `px` para bordes/sombras

### HTML
- IDs para JavaScript, classes para CSS
- Atributos `data-*` para datos dinámicos
- Semántica HTML5 (`<section>`, `<article>`, `<nav>`)
- Accesibilidad: `aria-*` labels en botones de ícono

## 🎨 Personalización

### Cambiar colores

Editar variables CSS al inicio del `<style>`:
```css
:root{
  --accent: #ff6b6b;  /* Cambiar naranja por rojo */
  --accent2: #4ecdc4; /* Cambiar azul por turquesa */
}
```

### Cambiar tipografías

Editar el `<link>` de Google Fonts y las propiedades `font-family`.

### Agregar un nuevo módulo

1. Crear tab button en `.tab-nav`
2. Crear `<div class="tab-content" id="tab-nuevo">`
3. Agregar función `switchTab('nuevo', this)` al botón
4. Implementar lógica de carga de datos
5. Agregar a `setupForUser()` si requiere permisos

## 📦 Dependencias Externas (CDN)

```html
<!-- Tipografías -->
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

<!-- PDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>

<!-- Excel -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

## 🚀 Mejoras Futuras

### Corto plazo
- [ ] Soporte offline con Service Workers
- [ ] PDF/Excel con logo oficial GORE
- [ ] Gráficos con Chart.js (tendencias, comparativas)
- [ ] Modo de impresión optimizado
- [ ] Drag & drop para reordenar tablas

### Mediano plazo
- [ ] PWA completa (instalable)
- [ ] Push notifications del navegador
- [ ] Dashboard personalizable (widgetización)
- [ ] Temas de color (claro/oscuro/automático)
- [ ] Firma digital en contrataciones

### Largo plazo
- [ ] Migrar a React/Vue para escalabilidad
- [ ] Editor WYSIWYG para descripciones
- [ ] Geolocalización en visitas
- [ ] Integración con API del SEIA
- [ ] Módulo de mensajería interna

## 📞 Soporte

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026  
**Navegadores soportados:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

**© 2026 Gobierno Regional del Maule - Uso interno**
