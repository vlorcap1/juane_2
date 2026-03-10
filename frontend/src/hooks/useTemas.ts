/**
 * Hook para gestión de Temas
 */
import { useState, useEffect, useCallback } from 'react';
import { Tema, CreateTema, UpdateTema, TemaFilters } from '../types';
import { temasApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useTemas = (filters?: TemaFilters) => {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadTemas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await temasApi.getAll(filters?.seremiId);
      setTemas(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar temas';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadTemas();
  }, [loadTemas]);

  const createTema = async (data: CreateTema): Promise<boolean> => {
    try {
      await temasApi.create(data);
      showToast('Tema creado exitosamente', 'success');
      await loadTemas();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear tema';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateTema = async (id: number, data: UpdateTema): Promise<boolean> => {
    try {
      await temasApi.update(id, data);
      showToast('Tema actualizado exitosamente', 'success');
      await loadTemas();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar tema';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteTema = async (id: number): Promise<boolean> => {
    try {
      await temasApi.delete(id);
      showToast('Tema eliminado exitosamente', 'success');
      await loadTemas();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar tema';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    temas,
    loading,
    error,
    refresh: loadTemas,
    createTema,
    updateTema,
    deleteTema
  };
};
