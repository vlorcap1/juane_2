/**
 * Hook para gestión de Proyectos
 */
import { useState, useEffect, useCallback } from 'react';
import { Proyecto, CreateProyecto, UpdateProyecto, ProyectoFilters } from '../types';
import { proyectosApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useProyectos = (filters?: ProyectoFilters) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadProyectos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proyectosApi.getAll(filters?.seremiId);
      setProyectos(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar proyectos';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadProyectos();
  }, [loadProyectos]);

  const createProyecto = async (data: CreateProyecto): Promise<boolean> => {
    try {
      await proyectosApi.create(data);
      showToast('Proyecto creado exitosamente', 'success');
      await loadProyectos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear proyecto';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateProyecto = async (id: number, data: UpdateProyecto): Promise<boolean> => {
    try {
      await proyectosApi.update(id, data);
      showToast('Proyecto actualizado exitosamente', 'success');
      await loadProyectos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar proyecto';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteProyecto = async (id: number): Promise<boolean> => {
    try {
      await proyectosApi.delete(id);
      showToast('Proyecto eliminado exitosamente', 'success');
      await loadProyectos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar proyecto';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    proyectos,
    loading,
    error,
    refresh: loadProyectos,
    createProyecto,
    updateProyecto,
    deleteProyecto
  };
};
