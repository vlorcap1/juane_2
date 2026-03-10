/**
 * Hook para gestión de colaboración (comentarios, archivos, historial)
 */
import { useState, useCallback } from 'react';
import { Comentario, Archivo } from '../types';
import { AuditLog } from '../types/colaboracion';
import { comentariosApi, archivosApi, auditApi } from '../api/client';
import { useToast } from '../components/ui/Toast';

export const useColaboracion = (
  seremiId: string,
  tabla: string,
  registroId: number
) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [historial, setHistorial] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadComentarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await comentariosApi.getAll({
        seremiId,
        tabla,
        registroId: registroId.toString()
      });
      setComentarios(data);
    } catch (err: any) {
      showToast('Error al cargar comentarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [seremiId, tabla, registroId, showToast]);

  const loadArchivos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await archivosApi.getAll(tabla, registroId.toString());
      setArchivos(data);
    } catch (err: any) {
      showToast('Error al cargar archivos', 'error');
    } finally {
      setLoading(false);
    }
  }, [tabla, registroId, showToast]);

  const loadHistorial = useCallback(async () => {
    try {
      setLoading(true);
      const data = await auditApi.getHistory(tabla, registroId);
      setHistorial(data);
    } catch (err: any) {
      showToast('Error al cargar historial', 'error');
    } finally {
      setLoading(false);
    }
  }, [tabla, registroId, showToast]);

  const addComentario = async (texto: string): Promise<boolean> => {
    try {
      await comentariosApi.create({
        seremiId,
        tabla,
        registroId: registroId.toString(),
        texto
      });
      showToast('Comentario agregado', 'success');
      await loadComentarios();
      return true;
    } catch (err: any) {
      showToast('Error al agregar comentario', 'error');
      return false;
    }
  };

  const deleteComentario = async (id: number): Promise<boolean> => {
    try {
      await comentariosApi.delete(id);
      showToast('Comentario eliminado', 'success');
      await loadComentarios();
      return true;
    } catch (err: any) {
      showToast('Error al eliminar comentario', 'error');
      return false;
    }
  };

  const uploadArchivo = async (file: File): Promise<boolean> => {
    try {
      await archivosApi.upload(file, tabla, registroId.toString(), seremiId);
      showToast('Archivo subido exitosamente', 'success');
      await loadArchivos();
      return true;
    } catch (err: any) {
      showToast('Error al subir archivo', 'error');
      return false;
    }
  };

  const deleteArchivo = async (id: number): Promise<boolean> => {
    try {
      await archivosApi.delete(id);
      showToast('Archivo eliminado', 'success');
      await loadArchivos();
      return true;
    } catch (err: any) {
      showToast('Error al eliminar archivo', 'error');
      return false;
    }
  };

  return {
    comentarios,
    archivos,
    historial,
    loading,
    loadComentarios,
    loadArchivos,
    loadHistorial,
    addComentario,
    deleteComentario,
    uploadArchivo,
    deleteArchivo
  };
};
