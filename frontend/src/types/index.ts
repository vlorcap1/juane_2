// User and authentication types
export interface User {
  id: string;
  username: string;
  nombre: string;
  email: string;
  tel?: string;
  rol: 'admin' | 'seremi' | 'guest';
  cargo?: string;
  seremiId?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends User {
  token: string;
}

export interface Seremi {
  id: string;
  sector: string;
  nombre: string;
  c1: string;
  c2: string;
  seremiName?: string;
  visitasArray?: Visita[];
  contactosArray?: Contacto[];
  prensaItems?: Prensa[];
  descripProyectos?: Proyecto[];
  nudos?: Nudo[];
  temas?: Tema[];
  agenda?: AgendaItem[];
  visitasCount?: number;
  contactosCount?: number;
  prensaCount?: number;
  proyectosCount?: number;
  visitas?: number;
  contactos?: number;
  prensa?: number;
  proyectos?: number;
  comunas?: string[];
}

export interface Visita {
  id: number;
  seremiId: string;
  fecha?: string;
  comuna?: string;
  lugar?: string;
  personas?: number;
  descripcion?: string;
}

export interface Contacto {
  id: number;
  seremiId: string;
  nombre?: string;
  fecha?: string;
  lugar?: string;
  personas?: number;
  tipo?: string;
  instituciones?: string;
  descripcion?: string;
}

export interface Prensa {
  id: number;
  seremiId: string;
  titular?: string;
  medio?: string;
  fecha?: string;
  tipoMedio?: string;
  tono?: string;
  url?: string;
  resumen?: string;
}

export interface Proyecto {
  id: number;
  seremiId: string;
  title?: string;
  meta?: string;
  estado?: string;
  presupuesto?: string;
  descripcion?: string;
  comunas?: string;
}

export interface Nudo {
  id: number;
  seremiId: string;
  title?: string;
  desc?: string;
  urgencia?: string;
  solucion?: string;
}

export interface Tema {
  id: number;
  seremiId: string;
  tema?: string;
  ambito?: string;
  prioridad?: string;
  descripcion?: string;
}

export interface AgendaItem {
  id: number;
  seremiId: string;
  fecha?: string;
  hora?: string;
  texto?: string;
  cat?: string;
  lugar?: string;
  notas?: string;
  minuta?: string;
}

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

export interface KpiIndicador {
  id: number;
  seremiId: string;
  nombre: string;
  valor: number;
  meta?: number;
  unidad?: string;
  periodo?: string;
  fecha?: string;
  categoria?: string;
  descripcion?: string;
}

export interface Archivo {
  id: number;
  tabla: string;
  registroId: string;
  filename: string;
  originalName: string;
  fechaSubida: string;
  tamaño: number;
}

export interface Comentario {
  id: number;
  seremiId: string;
  tabla: string;
  registroId: string;
  texto: string;
  autorId: string;
  autorNombre: string;
  fecha: string;
}

// Forum types
export interface ForoTema {
  id: number;
  titulo: string;
  descripcion: string;
  cuerpo: string;
  autorId: string;
  autorNombre: string;
  fechaCreacion: string;
  creadoEn: string;
  ultimaActividad: string;
  respuestas?: number;
}

export interface ForoPost {
  id: number;
  temaId: number;
  contenido: string;
  texto: string;
  autorId: string;
  autorNombre: string;
  fechaCreacion: string;
  creadoEn: string;
}

export interface ForoUser {
  id: string;
  username: string;
  nombre: string;
  cargo?: string;
}

export interface ForoTemaDetalle {
  tema: ForoTema;
  posts: ForoPost[];
}

// Notification types
export interface Notificacion {
  id: number;
  userId: string;
  tipo: string;
  titulo: string;
  mensaje?: string;
  url?: string;
  leida: boolean;
  creadoEn: string;
  autorId?: string;
  autorNombre?: string;
}

export interface NotificacionCount {
  count: number;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading?: boolean;
}

// API Response types
export interface ApiError {
  error: string;
  detail?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
}

export interface LoginApiResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  sector?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

// ===== CREATE/UPDATE INTERFACES =====

// Create request types
export interface CreateVisita {
  seremiId: string;
  fecha?: string;
  comuna?: string;
  lugar?: string;
  personas?: number;
  descripcion?: string;
}

export interface CreateContacto {
  seremiId: string;
  nombre?: string;
  fecha?: string;
  lugar?: string;
  personas?: number;
  tipo?: string;
  instituciones?: string;
  descripcion?: string;
}

export interface CreatePrensa {
  seremiId: string;
  titular?: string;
  medio?: string;
  fecha?: string;
  tipoMedio?: string;
  tono?: string;
  url?: string;
  resumen?: string;
}

export interface CreateProyecto {
  seremiId: string;
  title?: string;
  meta?: string;
  estado?: string;
  presupuesto?: string;
  descripcion?: string;
  comunas?: string;
}

export interface CreateNudo {
  seremiId: string;
  title?: string;
  desc?: string;
  urgencia?: string;
  solucion?: string;
}

export interface CreateTema {
  seremiId: string;
  tema?: string;
  ambito?: string;
  prioridad?: string;
  descripcion?: string;
}

export interface CreateAgendaItem {
  seremiId: string;
  fecha?: string;
  hora?: string;
  texto?: string;
  cat?: string;
  lugar?: string;
  notas?: string;
  minuta?: string;
}

export interface CreateContratacion {
  seremiId: string;
  numero?: string;  
  proveedor?: string;
  monto?: number;
  fecha?: string;
  estado?: string;
  descripcion?: string;
  categoria?: string;
  plazo?: string;
  modalidad?: string;
}

export interface CreateKpiIndicador {
  seremiId: string;
  nombre: string;
  valor: number;
  meta?: number;
  unidad?: string;
  periodo?: string;
  fecha?: string;
  categoria?: string;
  descripcion?: string;
}

export interface CreateComentario {
  seremiId: string;
  tabla: string;
  registroId: string;
  texto: string;
}

export interface CreateForoTema {
  titulo: string;
  cuerpo: string;
}

export interface CreateForoPost {
  texto: string;
}

// Update types (partial versions)
export interface UpdateVisita extends Partial<CreateVisita> {}
export interface UpdateContacto extends Partial<CreateContacto> {}
export interface UpdatePrensa extends Partial<CreatePrensa> {}
export interface UpdateProyecto extends Partial<CreateProyecto> {}
export interface UpdateNudo extends Partial<CreateNudo> {}
export interface UpdateTema extends Partial<CreateTema> {}
export interface UpdateAgendaItem extends Partial<CreateAgendaItem> {}
export interface UpdateContratacion extends Partial<CreateContratacion> {}
export interface UpdateKpiIndicador extends Partial<CreateKpiIndicador> {}

// Filter and pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface VisitaFilters extends PaginationParams {
  seremiId?: string;
}

export interface ContactoFilters extends PaginationParams {
  seremiId?: string;
}

export interface PrensaFilters extends PaginationParams {
  seremiId?: string;
}

export interface ComentarioFilters {
  seremiId: string;
  tabla: string;
  registroId: string;
}

// ============================================
// RE-EXPORTS DE MÓDULOS ESPECIALIZADOS
// ============================================
export * from './records';
export * from './colaboracion';
export * from './foro';
export * from './ui';
export * from './dashboard';