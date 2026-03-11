/**
 * Hook para gestión de Nudos
 */
import { useState, useEffect, useCallback } from 'react';
import { Nudo, CreateNudo, UpdateNudo, NudoFilters } from '../types';
import { nudosApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useNudos = (filters?: NudoFilters) => {
  const [nudos, setNudos] = useState<Nudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadNudos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await nudosApi.getAll(filters?.seremiId);
      setNudos(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar nudos';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters?.seremiId, showToast]);

  useEffect(() => {
    loadNudos();
  }, [loadNudos]);

  const createNudo = async (data: CreateNudo): Promise<boolean> => {
    try {
      await nudosApi.create(data);
      showToast('Nudo creado exitosamente', 'success');
      await loadNudos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear nudo';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateNudo = async (id: number, data: UpdateNudo): Promise<boolean> => {
    try {
      await nudosApi.update(id, data);
      showToast('Nudo actualizado exitosamente', 'success');
      await loadNudos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar nudo';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteNudo = async (id: number): Promise<boolean> => {
    try {
      await nudosApi.delete(id);
      showToast('Nudo eliminado exitosamente', 'success');
      await loadNudos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar nudo';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    nudos,
    loading,
    error,
    refresh: loadNudos,
    createNudo,
    updateNudo,
    deleteNudo
  };
};
