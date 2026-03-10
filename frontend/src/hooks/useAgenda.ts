/**
 * Hook para gestión de Agenda
 */
import { useState, useEffect, useCallback } from 'react';
import { AgendaItem, CreateAgendaItem, UpdateAgendaItem, AgendaFilters } from '../types';
import { agendaApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useAgenda = (filters?: AgendaFilters) => {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadAgenda = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agendaApi.getAll(filters?.seremiId);
      setAgenda(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar agenda';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  const createAgendaItem = async (data: CreateAgendaItem): Promise<boolean> => {
    try {
      await agendaApi.create(data);
      showToast('Item de agenda creado exitosamente', 'success');
      await loadAgenda();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear item de agenda';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateAgendaItem = async (id: number, data: UpdateAgendaItem): Promise<boolean> => {
    try {
      await agendaApi.update(id, data);
      showToast('Item de agenda actualizado exitosamente', 'success');
      await loadAgenda();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar item de agenda';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteAgendaItem = async (id: number): Promise<boolean> => {
    try {
      await agendaApi.delete(id);
      showToast('Item de agenda eliminado exitosamente', 'success');
      await loadAgenda();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar item de agenda';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    agenda,
    loading,
    error,
    refresh: loadAgenda,
    createAgendaItem,
    updateAgendaItem,
    deleteAgendaItem
  };
};
