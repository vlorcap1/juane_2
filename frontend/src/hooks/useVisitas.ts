/**
 * Hook para gestión de Visitas
 */
import { useState, useEffect, useCallback } from 'react';
import { Visita, CreateVisita, UpdateVisita, VisitaFilters } from '../types';
import { visitasApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useVisitas = (filters?: VisitaFilters) => {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadVisitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await visitasApi.getAll(filters);
      setVisitas(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar visitas';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadVisitas();
  }, [loadVisitas]);

  const createVisita = async (data: CreateVisita): Promise<boolean> => {
    try {
      await visitasApi.create(data);
      showToast('Visita creada exitosamente', 'success');
      await loadVisitas();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear visita';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateVisita = async (id: number, data: UpdateVisita): Promise<boolean> => {
    try {
      await visitasApi.update(id, data);
      showToast('Visita actualizada exitosamente', 'success');
      await loadVisitas();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar visita';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteVisita = async (id: number): Promise<boolean> => {
    try {
      await visitasApi.delete(id);
      showToast('Visita eliminada exitosamente', 'success');
      await loadVisitas();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar visita';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    visitas,
    loading,
    error,
    refresh: loadVisitas,
    createVisita,
    updateVisita,
    deleteVisita
  };
};
