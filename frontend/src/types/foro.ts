/**
 * Tipos para el sistema de Foro
 */

// ============================================
// TEMAS
// ============================================
export interface ForoTema {
  id: number;
  titulo: string;
  autorId: string;
  autorNombre: string;
  creadoEn: string;
  ultimaActividad: string;
  cantidadRespuestas: number;
}

export interface ForoTemaDetalle extends ForoTema {
  mensaje: string;
  posts: ForoPost[];
}

export interface ForoTemaCreate {
  titulo: string;
  mensaje: string;
}

// ============================================
// POSTS / RESPUESTAS
// ============================================
export interface ForoPost {
  id: number;
  temaId: number;
  autorId: string;
  autorNombre: string;
  texto: string;
  creadoEn: string;
}

export interface ForoPostCreate {
  temaId: number;
  texto: string;
}

// ============================================
// USUARIOS (para @mentions)
// ============================================
export interface ForoUsuario {
  id: string;
  username: string;
  nombre: string;
}

// ============================================
// MENCIONES
// ============================================
export interface MentionMatch {
  user: ForoUsuario;
  index: number;
}

export interface MentionDropdownProps {
  isOpen: boolean;
  users: ForoUsuario[];
  filteredUsers: ForoUsuario[];
  position: { top: number; left: number };
  onSelect: (username: string) => void;
  onClose: () => void;
}
