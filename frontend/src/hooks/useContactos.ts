/**
 * Hook para gestión de Contactos
 */
import { useState, useEffect, useCallback } from 'react';
import { Contacto, CreateContacto, UpdateContacto, ContactoFilters } from '../types';
import { contactosApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useContactos = (filters?: ContactoFilters) => {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadContactos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactosApi.getAll(filters);
      setContactos(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al cargar contactos';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadContactos();
  }, [loadContactos]);

  const createContacto = async (data: CreateContacto): Promise<boolean> => {
    try {
      await contactosApi.create(data);
      showToast('Contacto creado exitosamente', 'success');
      await loadContactos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear contacto';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateContacto = async (id: number, data: UpdateContacto): Promise<boolean> => {
    try {
      await contactosApi.update(id, data);
      showToast('Contacto actualizado exitosamente', 'success');
      await loadContactos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar contacto';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const deleteContacto = async (id: number): Promise<boolean> => {
    try {
      await contactosApi.delete(id);
      showToast('Contacto eliminado exitosamente', 'success');
      await loadContactos();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al eliminar contacto';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return {
    contactos,
    loading,
    error,
    refresh: loadContactos,
    createContacto,
    updateContacto,
    deleteContacto
  };
};
