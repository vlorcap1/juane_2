/**
 * APIs de SEREMIs
 */
import apiClient from './client';
import { Seremi } from '../types/index';

export const seremisApi = {
  getAll: async (): Promise<Seremi[]> => {
    const response = await apiClient.get<Seremi[]>('/api/seremis');
    return response.data;
  },
  
  getById: async (id: string): Promise<Seremi> => {
    const response = await apiClient.get<Seremi>(`/api/seremis/${id}`);
    return response.data;
  },
};
