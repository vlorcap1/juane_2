/**
 * Tipos para todos los registros del sistema SEREMIS
 */

// ============================================
// VISITAS
// ============================================
export interface Visita {
  id: number;
  seremiId: string;
  fecha: string;
  comuna: string;
  lugar?: string;
  personas: number;
  descripcion?: string;
  urgencia?: 'Alta' | 'Media' | 'Baja';
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface VisitaFilters {
  seremiId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  comuna?: string;
  urgencia?: string;
}

// ============================================
// CONTACTOS
// ============================================
export interface Contacto {
  id: number;
  seremiId: string;
  nombre: string;
  fecha: string;
  lugar?: string;
  personas: number;
  tipo: string;
  instituciones?: string;
  descripcion?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ContactoFilters {
  seremiId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
}

export const TIPOS_CONTACTO = [
  'Reunión técnica',
  'Ceremonia',
  'Encuentro ciudadano',
  'Actividad comunitaria',
  'Inauguración',
  'Firma de convenio',
  'Otro'
] as const;

// ============================================
// PRENSA
// ============================================
export interface Prensa {
  id: number;
  seremiId: string;
  titular: string;
  medio: string;
  fecha: string;
  tipo: string;
  tono: 'Positivo' | 'Neutro' | 'Negativo';
  enlace?: string;
  resumen?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface PrensaFilters {
  seremiId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  medio?: string;
  tono?: string;
}

export const TIPOS_MEDIO = [
  'Televisión',
  'Radio',
  'Prensa escrita',
  'Digital',
  'Redes sociales'
] as const;

export const TONOS_PRENSA = ['Positivo', 'Neutro', 'Negativo'] as const;

// ============================================
// PROYECTOS
// ============================================
export interface Proyecto {
  id: number;
  seremiId: string;
  nombre: string;
  meta?: string;
  estado: string;
  presupuesto?: string;
  descripcion?: string;
  comunas?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ProyectoFilters {
  seremiId?: string;
  estado?: string;
}

export const ESTADOS_PROYECTO = [
  'En ejecución',
  'Licitación',
  'Diseño',
  'Planificación',
  'Finalizado',
  'Suspendido',
  'Otro'
] as const;

// ============================================
// NUDOS CRÍTICOS
// ============================================
export interface Nudo {
  id: number;
  seremiId: string;
  titulo: string;
  descripcion: string;
  urgencia: 'Alta' | 'Media' | 'Baja';
  solucion?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface NudoFilters {
  seremiId?: string;
  urgencia?: string;
}

export const NIVELES_URGENCIA = ['Alta', 'Media', 'Baja'] as const;

// ============================================
// TEMAS PROPUESTOS
// ============================================
export interface Tema {
  id: number;
  seremiId: string;
  tema: string;
  ambito: string;
  prioridad: string;
  contexto?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface TemaFilters {
  seremiId?: string;
  ambito?: string;
  prioridad?: string;
}

export const AMBITOS_TEMA = [
  'Comunicaciones',
  'Agenda política',
  'Gestión interna',
  'Emergencias',
  'Otro'
] as const;

export const PRIORIDADES_TEMA = ['Alta', 'Media', 'Normal'] as const;

// ============================================
// AGENDA DE HITOS
// ============================================
export interface Agenda {
  id: number;
  seremiId: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  lugar?: string;
  notas?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface AgendaFilters {
  seremiId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  categoria?: string;
}

export const CATEGORIAS_AGENDA = [
  'Inauguración',
  'Campaña',
  'Licitación',
  'Firma convenio',
  'Reunión de trabajo',
  'Ceremonia protocolar',
  'Evento ciudadano',
  'Acto gubernamental',
  'Hito de proyecto',
  'Otro'
] as const;

// ============================================
// CONTRATACIONES
// ============================================
export interface Contratacion {
  id: number;
  seremiId: string;
  nombre: string;
  rut: string;
  cargo: string;
  grado?: string;
  tipo: string;
  esNuevo?: string;
  inicio: string;
  termino?: string;
  monto: string | number;
  financ?: string;
  just?: string;
  estado: string;
  vbQuien?: string;
  vbFecha?: string;
  creadoPor?: string;
  creadoEn?: string;
  seremiNombre?: string;
}

export interface ContratacionFilters {
  seremiId?: string;
  estado?: string;
  tipo?: string;
  search?: string;
}

export interface ContratacionStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  historico?: number;
  sumaMensual?: number;
  plazasNuevas?: number;
}

export const TIPOS_CONTRATACION = [
  'Honorarios',
  'Contrata',
  'Planta',
  'Código del Trabajo',
  'Otro'
] as const;

export const TIPOS_FINANCIAMIENTO = [
  'Presupuesto regular',
  'Presupuesto especial',
  'Transferencia',
  'Convenio',
  'Otro'
] as const;

// ============================================
// INDICADORES / KPIs
// ============================================
export interface Indicador {
  id: number;
  seremiId: string;
  nombre: string;
  meta: number;
  real: number;
  porcentaje?: number;
  estado?: 'meta' | 'riesgo' | 'bajo';
  unidad?: string;
  periodo?: string;
  descripcion?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface IndicadorFilters {
  seremiId?: string;
  estado?: string;
}

export interface IndicadorStats {
  total: number;
  enMeta: number;
  enRiesgo: number;
  bajoMeta: number;
}

// ============================================
// TIPOS AUXILIARES
// ============================================
export type RecordType = 'visitas' | 'contactos' | 'prensa' | 'proyectos' | 'nudos' | 'temas' | 'agenda';

export interface RecordCounts {
  visitas: number;
  contactos: number;
  prensa: number;
  proyectos: number;
  nudos: number;
  temas: number;
  agenda: number;
}
