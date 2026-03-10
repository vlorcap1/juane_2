import { useState, useEffect } from 'react';
import { 
  seremisApi, usersApi, foroApi, notificacionesApi,
  handleApiError 
} from '../api/client';
import { 
  User, Seremi, ForoTema, Notificacion 
} from '../types/index';

// Hook para SEREMIs
export const useSeremis = () => {
  const [seremis, setSeremis] = useState<Seremi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeremis = async () => {
    try {
      setLoading(true);
      const data = await seremisApi.getAll();
      setSeremis(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeremis();
  }, []);

  const createSeremi = async (seremiData: Omit<Seremi, 'id'>) => {
    try {
      const response = await seremisApi.create(seremiData);
      await fetchSeremis(); // Refetch to get updated list
      return response;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const updateSeremi = async (id: string, seremiData: Partial<Seremi>) => {
    try {
      await seremisApi.update(id, seremiData);
      await fetchSeremis(); // Refetch to get updated list
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const deleteSeremi = async (id: string) => {
    try {
      await seremisApi.delete(id);
      setSeremis(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    seremis,
    loading,
    error,
    refetch: fetchSeremis,
    createSeremi,
    updateSeremi,
    deleteSeremi
  };
};

// Hook para Usuarios
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsuarios(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const createUsuario = async (userData: Omit<User, 'id'>) => {
    try {
      const response = await usersApi.create(userData);
      await fetchUsuarios(); // Refetch to get updated list
      return response;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const updateUsuario = async (id: string, userData: Partial<User>) => {
    try {
      await usersApi.update(id, userData);
      await fetchUsuarios(); // Refetch to get updated list
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      await usersApi.delete(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
  };
};

// Hook para Foro
export const useForo = () => {
  const [temas, setTemas] = useState<ForoTema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemas = async () => {
    try {
      setLoading(true);
      const data = await foroApi.getTemas();
      setTemas(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      // Note: foroApi doesn't have getPosts, only getTemas and createPost for specific tema
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  useEffect(() => {
    fetchTemas();
    fetchPosts();
  }, []);

  const createTema = async (temaData: { titulo: string; descripcion: string }) => {
    try {
      const response = await foroApi.createTema({ 
        titulo: temaData.titulo, 
        cuerpo: temaData.descripcion 
      });
      await fetchTemas(); // Refetch to get updated list
      return response;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const createPost = async (postData: { temaId: number; contenido: string }) => {
    try {
      const response = await foroApi.createPost(postData.temaId, { texto: postData.contenido });
      // Update posts would require fetching tema details
      return response;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    temas,
    loading,
    error,
    refetch: fetchTemas,
    createTema,
    createPost
  };
};

// Hook para Notificaciones
export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionesApi.getAll();
      setNotificaciones(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificacionesApi.markRead(id);
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificacionesApi.markAllRead();
      setNotificaciones(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificacionesApi.delete(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return {
    notificaciones,
    loading,
    error,
    unreadCount,
    count: unreadCount, // Alias for compatibility
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotificaciones
  };
};

// Re-exportar useAuth para conveniencia
export { useAuth } from '../components/AuthProvider';