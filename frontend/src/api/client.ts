import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  User,
  LoginRequest,
  LoginResponse,
  Seremi,
  Visita,
  Contacto,
  Prensa,
  Proyecto,
  Nudo,
  Tema,
  AgendaItem,
  Contratacion,
  KpiIndicador,
  Archivo,
  Comentario,
  ForoTema,
  ForoTemaDetalle,
  ForoUser,
  Notificacion,
  NotificacionCount,
  CreateVisita,
  CreateContacto,
  CreatePrensa,
  CreateProyecto,
  CreateNudo,
  CreateTema,
  CreateAgendaItem,
  CreateContratacion,
  CreateKpiIndicador,
  CreateComentario,
  CreateForoTema,
  CreateForoPost,
  UpdateVisita,
  UpdateContacto,
  UpdatePrensa,
  UpdateProyecto,
  UpdateNudo,
  UpdateTema,
  UpdateAgendaItem,
  UpdateContratacion,
  UpdateKpiIndicador,
  VisitaFilters,
  ContactoFilters,
  PrensaFilters,
  ComentarioFilters,
} from '../types/index';

// Configuración base de Axios
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('Axios interceptor - token:', token ? 'EXISTS' : 'MISSING');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set');
  }
  return config;
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función helper para manejar respuestas
const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/login', credentials);
    return handleResponse(response);
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/users');
    return handleResponse(response);
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return handleResponse(response);
  },

  create: async (userData: Partial<User>): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>('/api/users', userData);
    return handleResponse(response);
  },

  update: async (id: string, userData: Partial<User>): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/users/${id}`, userData);
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/users/${id}`);
    return handleResponse(response);
  },
};

// SEREMIs API
export const seremisApi = {
  getAll: async (): Promise<Seremi[]> => {
    const response = await apiClient.get<Seremi[]>('/api/seremis');
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Seremi> => {
    const response = await apiClient.get<Seremi>(`/api/seremis/${id}`);
    return handleResponse(response);
  },

  getSeremisData: async (): Promise<any[]> => {
    try {
      console.log('Fetching seremis data from API...');
      const response = await apiClient.get<any[]>('/api/seremis');
      const seremis = handleResponse(response);
      console.log('Seremis data received:', seremis);
      
      // Transform data for dashboard - use real counts from backend
      return seremis.map((seremi: any) => ({
        id: seremi.id,
        nombre: seremi.nombre,
        sector: seremi.sector,
        seremisNombre: seremi.nombre,
        visitas: seremi.visitasCount || 0,
        contactos: seremi.contactosCount || 0,
        prensa: seremi.prensaCount || 0,
        proyectos: seremi.proyectosCount || 0,
        nudos: seremi.nudos?.length || 0,
        // Preserve arrays for detailed views
        visitasArray: seremi.visitasArray || [],
        contactosArray: seremi.contactosArray || [],
        prensaItems: seremi.prensaItems || [],
        descripProyectos: seremi.descripProyectos || [],
        nudosArray: seremi.nudos || [],
        temas: seremi.temas || [],
        agenda: seremi.agenda || [],
        comunas: seremi.comunas || []
      }));
    } catch (error) {
      console.error('Error fetching seremis data:', error);
      return [];
    }
  },

  create: async (data: Partial<Seremi>): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>('/api/seremis', data);
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Seremi>): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/seremis/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/seremis/${id}`);
    return handleResponse(response);
  },
};

// Visitas API
export const visitasApi = {
  getAll: async (filters?: VisitaFilters): Promise<Visita[]> => {
    const response = await apiClient.get<Visita[]>('/api/visitas', { params: filters });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Visita> => {
    const response = await apiClient.get<Visita>(`/api/visitas/${id}`);
    return handleResponse(response);
  },

  create: async (data: CreateVisita): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/visitas', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateVisita): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/visitas/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/visitas/${id}`);
    return handleResponse(response);
  },
};

// Contactos API
export const contactosApi = {
  getAll: async (filters?: ContactoFilters): Promise<Contacto[]> => {
    const response = await apiClient.get<Contacto[]>('/api/contactos', { params: filters });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Contacto> => {
    const response = await apiClient.get<Contacto>(`/api/contactos/${id}`);
    return handleResponse(response);
  },

  create: async (data: CreateContacto): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/contactos', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateContacto): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/contactos/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/contactos/${id}`);
    return handleResponse(response);
  },
};

// Prensa API
export const prensaApi = {
  getAll: async (filters?: PrensaFilters): Promise<Prensa[]> => {
    const response = await apiClient.get<Prensa[]>('/api/prensa', { params: filters });
    return handleResponse(response);
  },

  create: async (data: CreatePrensa): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/prensa', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdatePrensa): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/prensa/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/prensa/${id}`);
    return handleResponse(response);
  },
};

// Proyectos API
export const proyectosApi = {
  getAll: async (seremiId?: string): Promise<Proyecto[]> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get<Proyecto[]>('/api/proyectos', { params });
    return handleResponse(response);
  },

  create: async (data: CreateProyecto): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/proyectos', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateProyecto): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/proyectos/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/proyectos/${id}`);
    return handleResponse(response);
  },
};

// Nudos API
export const nudosApi = {
  getAll: async (seremiId?: string): Promise<Nudo[]> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get<Nudo[]>('/api/nudos', { params });
    return handleResponse(response);
  },

  create: async (data: CreateNudo): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/nudos', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateNudo): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/nudos/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/nudos/${id}`);
    return handleResponse(response);
  },
};

// Temas API
export const temasApi = {
  getAll: async (seremiId?: string): Promise<Tema[]> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get<Tema[]>('/api/temas', { params });
    return handleResponse(response);
  },

  create: async (data: CreateTema): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/temas', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateTema): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/temas/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/temas/${id}`);
    return handleResponse(response);
  },
};

// Agenda API
export const agendaApi = {
  getAll: async (seremiId?: string): Promise<AgendaItem[]> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get<AgendaItem[]>('/api/agenda', { params });
    return handleResponse(response);
  },

  create: async (data: CreateAgendaItem): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/agenda', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateAgendaItem): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/agenda/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/agenda/${id}`);
    return handleResponse(response);
  },
};

// Contrataciones API
export const contratacionesApi = {
  getAll: async (seremiId?: string): Promise<Contratacion[]> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get<Contratacion[]>('/api/contrataciones', { params });
    return handleResponse(response);
  },

  create: async (data: CreateContratacion): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/contrataciones', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateContratacion): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/contrataciones/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/contrataciones/${id}`);
    return handleResponse(response);
  },

  // Note: VB and stats endpoints not implemented in backend yet
  // darVB: async (id: number): Promise<{ ok: boolean }> => {
  //   const response = await apiClient.put<{ ok: boolean }>(`/api/contrataciones/${id}/vb`);
  //   return handleResponse(response);
  // },

  // getStats: async (): Promise<any> => {
  //   const response = await apiClient.get('/api/contrataciones/stats');
  //   return handleResponse(response);
  // },
};

// KPIs API
export const kpisApi = {
  getAll: async (seremiId?: string): Promise<KpiIndicador[]> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get<KpiIndicador[]>('/api/kpi-indicadores', { params });
    return handleResponse(response);
  },

  create: async (data: CreateKpiIndicador): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/kpi-indicadores', data);
    return handleResponse(response);
  },

  update: async (id: number, data: UpdateKpiIndicador): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/kpi-indicadores/${id}`, data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/kpi-indicadores/${id}`);
    return handleResponse(response);
  },

  getStats: async (seremiId?: string): Promise<any> => {
    const params = seremiId ? { seremiId } : {};
    const response = await apiClient.get('/api/kpi-indicadores/stats', { params });
    return handleResponse(response);
  },
};

// Archivos API
export const archivosApi = {
  upload: async (file: File, tabla: string, registroId: string, seremiId?: string): Promise<{ id: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tabla', tabla);
    formData.append('registroId', registroId);
    if (seremiId) formData.append('seremiId', seremiId);

    const response = await apiClient.post<{ id: number }>('/api/archivos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleResponse(response);
  },

  getAll: async (tabla: string, registroId: string): Promise<Archivo[]> => {
    const response = await apiClient.get<Archivo[]>(`/api/archivos`, {
      params: { tabla, registroId },
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/archivos/${id}`);
    return handleResponse(response);
  },
};

// Comentarios API
export const comentariosApi = {
  getAll: async (filters: ComentarioFilters): Promise<Comentario[]> => {
    const response = await apiClient.get<Comentario[]>('/api/comentarios', { params: filters });
    return handleResponse(response);
  },

  create: async (data: CreateComentario): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/comentarios', data);
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/comentarios/${id}`);
    return handleResponse(response);
  },
};

// Foro API
export const foroApi = {
  getUsers: async (): Promise<ForoUser[]> => {
    const response = await apiClient.get<ForoUser[]>('/api/foro/users');
    return handleResponse(response);
  },

  getTemas: async (): Promise<ForoTema[]> => {
    const response = await apiClient.get<ForoTema[]>('/api/foro/temas');
    return handleResponse(response);
  },

  createTema: async (data: CreateForoTema): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>('/api/foro/temas', data);
    return handleResponse(response);
  },

  deleteTema: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/foro/temas/${id}`);
    return handleResponse(response);
  },

  getTemaDetail: async (id: number): Promise<ForoTemaDetalle> => {
    const response = await apiClient.get<ForoTemaDetalle>(`/api/foro/temas/${id}/posts`);
    return handleResponse(response);
  },

  createPost: async (temaId: number, data: CreateForoPost): Promise<{ id: number }> => {
    const response = await apiClient.post<{ id: number }>(`/api/foro/temas/${temaId}/posts`, data);
    return handleResponse(response);
  },

  deletePost: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/foro/posts/${id}`);
    return handleResponse(response);
  },
};

// Notificaciones API
export const notificacionesApi = {
  getAll: async (): Promise<Notificacion[]> => {
    const response = await apiClient.get<Notificacion[]>('/api/notificaciones');
    return handleResponse(response);
  },

  getCount: async (): Promise<NotificacionCount> => {
    const response = await apiClient.get<NotificacionCount>('/api/notificaciones/count');
    return handleResponse(response);
  },

  markRead: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>(`/api/notificaciones/${id}/leer`);
    return handleResponse(response);
  },

  markAllRead: async (): Promise<{ ok: boolean }> => {
    const response = await apiClient.put<{ ok: boolean }>('/api/notificaciones/leer-todas');
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>(`/api/notificaciones/${id}`);
    return handleResponse(response);
  },
};

// Auditoría/Historial API
export const auditApi = {
  getHistory: async (tabla: string, registroId: number): Promise<any[]> => {
    const response = await apiClient.get(`/api/audit/${tabla}/${registroId}`);
    return handleResponse(response);
  },
};

// Helper para manejar errores de API
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message || 'Error desconocido';
};

// Export default client for custom requests
export default apiClient;
