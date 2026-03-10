import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export interface Alerta {
  id: number;
  userId: number;
  tipo: string; // contratacion_vence, kpi_no_cumplido, agenda_proxima, nudo_urgente
  nivel: string; // info, warning, danger
  titulo: string;
  mensaje?: string;
  url?: string;
  tablaOrigen?: string;
  registroId?: number;
  leida: boolean;
  descartada: boolean;
  creadoEn: string;
}

export function useAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Alerta[]>('/api/alertas');
      setAlertas(response.data);
      
      // Contar no leídas
      const noLeidas = response.data.filter(a => !a.leida).length;
      setCount(noLeidas);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCount = async () => {
    try {
      const response = await apiClient.get<{ count: number }>('/api/alertas/count');
      setCount(response.data.count);
    } catch (error) {
      console.error('Error al cargar contador de alertas:', error);
    }
  };

  const marcarLeida = async (alertaId: number) => {
    try {
      await apiClient.put(`/api/alertas/${alertaId}/leer`);
      await loadAlertas();
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await apiClient.put('/api/alertas/leer-todas');
      await loadAlertas();
    } catch (error) {
      console.error('Error al marcar todas las alertas:', error);
    }
  };

  const descartarAlerta = async (alertaId: number) => {
    try {
      await apiClient.delete(`/api/alertas/${alertaId}`);
      await loadAlertas();
    } catch (error) {
      console.error('Error al descartar alerta:', error);
    }
  };

  const limpiarLeidas = async () => {
    try {
      await apiClient.delete('/api/alertas/limpiar');
      await loadAlertas();
    } catch (error) {
      console.error('Error al limpiar alertas leídas:', error);
    }
  };

  useEffect(() => {
    loadAlertas();
    
    // Polling cada 2 minutos
    const interval = setInterval(() => {
      loadCount();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    alertas,
    count,
    loading,
    loadAlertas,
    marcarLeida,
    marcarTodasLeidas,
    descartarAlerta,
    limpiarLeidas
  };
}
