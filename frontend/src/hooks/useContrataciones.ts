/**
 * Hook para gestión de Contrataciones
 */
import { useState, useEffect, useCallback } from 'react';
import { Contratacion, CreateContratacion, UpdateContratacion, ContratacionStats } from '../types';
import { contratacionesApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useContrataciones = (seremiId?: string) => {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [stats, _setStats] = useState<ContratacionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadContrataciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratacionesApi.getAll(seremiId);
      setContrataciones(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar contrataciones';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [seremiId, showToast]);

  // Disabled until backend implements stats endpoint
  // const loadStats = useCallback(async () => {
  //   // Stats endpoint not available in backend, calculate locally
  //   try {
  //     // Calculate stats from contrataciones data when needed
  //     // For now, set empty stats
  //     setStats(null);
  //   } catch (err: any) {
  //     console.error('Error loading stats:', err);
  //   }
  // }, []);

  useEffect(() => {
    loadContrataciones();
    // loadStats(); // Disabled until backend implements stats endpoint
  }, [loadContrataciones]);

  const createContratacion = async (data: CreateContratacion): Promise<boolean> => {
    try {
      await contratacionesApi.create(data);
      showToast('Contratación creada exitosamente', 'success');
      await loadContrataciones();
      // await loadStats();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear contratación';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateContratacion = async (id: number, data: UpdateContratacion): Promise<boolean> => {
    try {
      await contratacionesApi.update(id, data);
      showToast('Contratación actualizada exitosamente', 'success');
      await loadContrataciones();
      // await loadStats();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar contratación';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteContratacion = async (id: number): Promise<boolean> => {
    try {
      await contratacionesApi.delete(id);
      showToast('Contratación eliminada exitosamente', 'success');
      await loadContrataciones();
      // await loadStats();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar contratación';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const darVistoBueno = async (_id: number): Promise<boolean> => {
    try {
      // await contratacionesApi.darVB(id); // VB endpoint not implemented yet
      showToast('Función Visto Bueno no implementada aún', 'warning');
      // await loadContrataciones();
      // await loadStats();
      return false;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al dar Visto Bueno';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    contrataciones,
    stats,
    loading,
    error,
    refresh: loadContrataciones,
    createContratacion,
    updateContratacion,
    deleteContratacion,
    darVistoBueno
  };
};
