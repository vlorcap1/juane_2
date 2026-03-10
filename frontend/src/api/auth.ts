/**
 * APIs de autenticación
 */
import apiClient from './client';
import { LoginRequest, LoginResponse } from '../types/index';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/login', credentials);
    return response.data;
  },
};
