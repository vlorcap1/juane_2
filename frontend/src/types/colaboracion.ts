/**
 * Tipos para el sistema de colaboración (comentarios, archivos, historial)
 */

// ============================================
// COMENTARIOS
// ============================================
export interface Comentario {
  id: number;
  seremiId: string;
  tabla: string;
  registroId: number;
  texto: string;
  autorId: string;
  autorNombre: string;
  fecha: string;
  creadoEn?: string;
}

export interface ComentarioCreate {
  seremiId: string;
  tabla: string;
  registroId: number;
  texto: string;
}

// ============================================
// ARCHIVOS
// ============================================
export interface Archivo {
  id: number;
  seremiId: string;
  tabla: string;
  registroId: number;
  nombre: string;
  nombreDisco: string;
  ruta: string;
  tamano: number;
  subidoPor: string;
  subidoEn: string;
}

export interface ArchivoUpload {
  seremiId: string;
  tabla: string;
  registroId: number;
  file: File;
}

// ============================================
// HISTORIAL / AUDITORÍA
// ============================================
export interface AuditLog {
  id: number;
  tabla: string;
  registroId: number;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'VB';
  userName: string;
  fecha: string;
  detalles?: string;
}

// ============================================
// PROPS PARA MODAL DE COLABORACIÓN
// ============================================
export interface ColaboracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  seremiId: string;
  tabla: string;
  registroId: number;
  titulo: string;
}

export type ColaboracionTab = 'comentarios' | 'archivos' | 'historial';
