import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, User, Calendar, Zap } from 'lucide-react';
import apiClient from '../api/client';
import { Modal } from './ui/Modal';
import './ForoPage.css';

interface ForoTema {
  id: number;
  titulo: string;
  cuerpo: string;
  autorId: string;
  autorNombre: string;
  creadoEn: string;
  ultimaActividad: string;
  respuestas: number;
}

interface ForoPost {
  id: number;
  temaId: number;
  texto: string;
  autorId: string;
  autorNombre: string;
  creadoEn: string;
}

interface User {
  id: string;
  username: string;
  nombre: string;
  rol: string;
}

interface ForoPageProps {
  user: User;
}

export const ForoPage: React.FC<ForoPageProps> = ({ user }) => {
  const [temas, setTemas] = useState<ForoTema[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTemaModal, setShowTemaModal] = useState(false);
  const [selectedTema, setSelectedTema] = useState<ForoTema | null>(null);
  const [temaPosts, setTemaPosts] = useState<ForoPost[]>([]);
  const [temaLoading, setTemaLoading] = useState(false);
  const [nuevoPost, setNuevoPost] = useState('');
  const [sendingPost, setSendingPost] = useState(false);
  const [nuevoTema, setNuevoTema] = useState({
    titulo: '',
    cuerpo: ''
  });

  useEffect(() => {
    loadTemas();
  }, []);

  const loadTemas = async () => {
    try {
      const response = await apiClient.get('/api/foro/temas');
      setTemas(response.data);
    } catch (error) {
      console.error('Error cargando temas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTema = async () => {
    if (!nuevoTema.titulo.trim() || !nuevoTema.cuerpo.trim()) {
      alert('Por favor completa título y mensaje');
      return;
    }

    try {
      await apiClient.post('/api/foro/temas', nuevoTema);
      setShowModal(false);
      setNuevoTema({ titulo: '', cuerpo: '' });
      loadTemas();
    } catch (error) {
      console.error('Error creando tema:', error);
      alert('Error al crear tema');
    }
  };

  const handleDeleteTema = async (temaId: number) => {
    if (!window.confirm('¿Eliminar este tema?')) return;

    try {
      await apiClient.delete(`/api/foro/temas/${temaId}`);
      loadTemas();
    } catch (error) {
      console.error('Error eliminando tema:', error);
      alert('Error al eliminar tema');
    }
  };

  const handleOpenTema = async (tema: ForoTema) => {
    setSelectedTema(tema);
    setShowTemaModal(true);
    setTemaLoading(true);
    setTemaPosts([]);
    try {
      const response = await apiClient.get(`/api/foro/temas/${tema.id}/posts`);
      setTemaPosts(response.data.posts || []);
      if (response.data.tema) {
        setSelectedTema({ ...tema, ...response.data.tema });
      }
    } catch (error) {
      console.error('Error cargando conversación del tema:', error);
      alert('Error al cargar la conversación del tema');
    } finally {
      setTemaLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!selectedTema) return;
    if (!nuevoPost.trim()) {
      alert('Escribe un mensaje antes de responder');
      return;
    }

    setSendingPost(true);
    try {
      await apiClient.post(`/api/foro/temas/${selectedTema.id}/posts`, { texto: nuevoPost.trim() });
      setNuevoPost('');
      await handleOpenTema(selectedTema);
      await loadTemas();
    } catch (error) {
      console.error('Error publicando respuesta:', error);
      alert('Error al publicar respuesta');
    } finally {
      setSendingPost(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!selectedTema) return;
    if (!window.confirm('¿Eliminar esta respuesta?')) return;

    try {
      await apiClient.delete(`/api/foro/posts/${postId}`);
      await handleOpenTema(selectedTema);
      await loadTemas();
    } catch (error) {
      console.error('Error eliminando respuesta:', error);
      alert('Error al eliminar respuesta');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        Cargando...
      </div>
    );
  }

  return (
    <div className="container foro-interno">
      {/* Header */}
      <div className="foro-header">
        <div>
          <div className="section-title"><MessageSquare size={18} /> Foro Interno</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
            Comunícate y resuelve consultas con @menciones
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo Tema
        </button>
      </div>

      {/* Lista de Temas */}
      <div className="temas-list">
        {temas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
            No hay temas publicados
          </div>
        ) : (
          temas.map((tema) => (
            <div key={tema.id} className="tema-card tema-card-clickable" onClick={() => handleOpenTema(tema)}>
              <div className="tema-header">
                <div className="tema-title">{tema.titulo}</div>
                {(user.id === tema.autorId || user.rol === 'admin') && (
                  <button 
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTema(tema.id);
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="tema-meta">
                <span className="tema-author">
                  <User size={13} /> {tema.autorNombre || 'Anónimo'}
                </span>
                <span className="tema-date">
                  <Calendar size={13} /> {formatDate(tema.creadoEn)}
                </span>
                {tema.ultimaActividad !== tema.creadoEn && (
                  <span className="tema-activity">
                    <Zap size={13} /> última actividad {formatDate(tema.ultimaActividad)}
                  </span>
                )}
              </div>
              <div className="tema-body">
                {tema.cuerpo.length > 200 ? tema.cuerpo.substring(0, 200) + '...' : tema.cuerpo}
              </div>
              <div className="tema-footer">
                <span className="tema-respuestas">
                  <MessageSquare size={13} /> {tema.respuestas} respuesta{tema.respuestas !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nuevo Tema */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Tema"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreateTema}>Publicar</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Título</label>
            <input
              type="text"
              className="form-input"
              placeholder="Título del tema..."
              value={nuevoTema.titulo}
              onChange={(e) => setNuevoTema({ ...nuevoTema, titulo: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mensaje (usa @ para mencionar usuarios)</label>
            <textarea
              className="form-textarea"
              placeholder="Escribe tu mensaje... usa @nombre para mencionar"
              value={nuevoTema.cuerpo}
              onChange={(e) => setNuevoTema({ ...nuevoTema, cuerpo: e.target.value })}
              rows={6}
              style={{ minHeight: '140px' }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTemaModal}
        onClose={() => {
          setShowTemaModal(false);
          setSelectedTema(null);
          setTemaPosts([]);
          setNuevoPost('');
        }}
        title={selectedTema ? `Tema: ${selectedTema.titulo}` : 'Conversación'}
        size="lg"
        footer={
          <div className="foro-chat-footer">
            <textarea
              className="form-textarea foro-reply-input"
              placeholder="Escribe tu respuesta... (puedes mencionar con @usuario)"
              value={nuevoPost}
              onChange={(e) => setNuevoPost(e.target.value)}
              rows={3}
            />
            <div className="foro-chat-footer-actions">
              <button className="btn btn-secondary" onClick={() => setShowTemaModal(false)}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={handleCreatePost} disabled={sendingPost || !nuevoPost.trim()}>
                {sendingPost ? 'Publicando...' : 'Responder'}
              </button>
            </div>
          </div>
        }
      >
        {temaLoading ? (
          <div className="foro-chat-loading">Cargando conversación...</div>
        ) : selectedTema ? (
          <div className="foro-chat-content">
            <div className="foro-tema-op">
              <div className="foro-tema-op-titulo">{selectedTema.titulo}</div>
              <div className="foro-tema-op-cuerpo">{selectedTema.cuerpo}</div>
              <div className="foro-tema-op-meta">
                <span><User size={13} /> {selectedTema.autorNombre || 'Anónimo'}</span>
                <span><Calendar size={13} /> {formatDate(selectedTema.creadoEn)}</span>
              </div>
            </div>

            <div className="foro-sep">Respuestas ({temaPosts.length})</div>

            {temaPosts.length === 0 ? (
              <div className="foro-chat-empty">Aún no hay respuestas en este tema.</div>
            ) : (
              temaPosts.map((post) => (
                <div key={post.id} className="foro-post-card">
                  <div className="foro-post-header">
                    <div className="foro-post-autor">{post.autorNombre || 'Anónimo'}</div>
                    <div className="foro-post-actions">
                      <div className="foro-post-fecha">{formatDate(post.creadoEn)}</div>
                      {(user.id === post.autorId || user.rol === 'admin') && (
                        <button className="foro-post-delete" onClick={() => handleDeletePost(post.id)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="foro-post-texto">{post.texto}</div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
