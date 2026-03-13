import React, { useState, useEffect } from 'react';
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
          <div className="section-title">💬 Foro Interno</div>
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
            <div key={tema.id} className="tema-card">
              <div className="tema-header">
                <div className="tema-title">{tema.titulo}</div>
                {(user.id === tema.autorId || user.rol === 'admin') && (
                  <button 
                    className="btn-icon" 
                    onClick={() => handleDeleteTema(tema.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="tema-meta">
                <span className="tema-author">
                  👤 {tema.autorNombre || 'Anónimo'}
                </span>
                <span className="tema-date">
                  📅 {formatDate(tema.creadoEn)}
                </span>
                {tema.ultimaActividad !== tema.creadoEn && (
                  <span className="tema-activity">
                    ⚡ última actividad {formatDate(tema.ultimaActividad)}
                  </span>
                )}
              </div>
              <div className="tema-body">
                {tema.cuerpo.length > 200 ? tema.cuerpo.substring(0, 200) + '...' : tema.cuerpo}
              </div>
              <div className="tema-footer">
                <span className="tema-respuestas">
                  💬 {tema.respuestas} respuesta{tema.respuestas !== 1 ? 's' : ''}
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
        title="💬 Nuevo Tema"
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
    </div>
  );
};
