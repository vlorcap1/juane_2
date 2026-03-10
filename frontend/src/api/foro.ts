/**
 * APIs del Foro
 */
import apiClient from './client';
import { ForoTema, ForoPost, ForoUser } from '../types/index';

export const foroApi = {
  getUsers: async (): Promise<ForoUser[]> => {
    const response = await apiClient.get<ForoUser[]>('/api/foro/users');
    return response.data;
  },
  
  getTemas: async (): Promise<ForoTema[]> => {
    const response = await apiClient.get<ForoTema[]>('/api/foro/temas');
    return response.data;
  },
  
  createTema: async (data: { titulo: string; cuerpo: string }): Promise<{ id: number }> => {
    const response = await apiClient.post('/api/foro/temas', data);
    return response.data;
  },
  
  deleteTema: async (temaId: number): Promise<void> => {
    await apiClient.delete(`/api/foro/temas/${temaId}`);
  },
  
  getTemaPosts: async (temaId: number): Promise<{ tema: ForoTema; posts: ForoPost[] }> => {
    const response = await apiClient.get(`/api/foro/temas/${temaId}/posts`);
    return response.data;
  },
  
  createPost: async (temaId: number, texto: string): Promise<{ id: number }> => {
    const response = await apiClient.post(`/api/foro/temas/${temaId}/posts`, { texto });
    return response.data;
  },
  
  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/api/foro/posts/${postId}`);
  },
};
