/**
 * APIs de Notificaciones
 */
import apiClient from './client';
import { Notificacion } from '../types/index';

export const notificacionesApi = {
  getAll: async (): Promise<Notificacion[]> => {
    const response = await apiClient.get<Notificacion[]>('/api/notificaciones');
    return response.data;
  },
  
  getCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/api/notificaciones/count');
    return response.data;
  },
  
  markAsRead: async (notifId: number): Promise<void> => {
    await apiClient.put(`/api/notificaciones/${notifId}/leer`);
  },
  
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/api/notificaciones/leer-todas');
  },
  
  delete: async (notifId: number): Promise<void> => {
    await apiClient.delete(`/api/notificaciones/${notifId}`);
  },
};
