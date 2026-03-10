/**
 * Hook para gestión de Prensa
 */
import { useState, useEffect, useCallback } from 'react';
import { Prensa, CreatePrensa, UpdatePrensa, PrensaFilters } from '../types';
import { prensaApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const usePrensa = (filters?: PrensaFilters) => {
  const [prensa, setPrensa] = useState<Prensa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadPrensa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prensaApi.getAll(filters);
      setPrensa(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar prensa';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadPrensa();
  }, [loadPrensa]);

  const createPrensa = async (data: CreatePrensa): Promise<boolean> => {
    try {
      await prensaApi.create(data);
      showToast('Prensa creada exitosamente', 'success');
      await loadPrensa();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear prensa';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updatePrensa = async (id: number, data: UpdatePrensa): Promise<boolean> => {
    try {
      await prensaApi.update(id, data);
      showToast('Prensa actualizada exitosamente', 'success');
      await loadPrensa();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar prensa';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deletePrensa = async (id: number): Promise<boolean> => {
    try {
      await prensaApi.delete(id);
      showToast('Prensa eliminada exitosamente', 'success');
      await loadPrensa();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar prensa';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    prensa,
    loading,
    error,
    refresh: loadPrensa,
    createPrensa,
    updatePrensa,
    deletePrensa
  };
};
