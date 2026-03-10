/**
 * Modal de Colaboración - Comentarios, Archivos, Historial
 */
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { EmptyState } from './ui/EmptyState';
import { useColaboracion } from '../hooks/useColaboracion';
import { formatRelativeTime } from '../utils/dateUtils';
import './ColaboracionModal.css';

interface ColaboracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabla: string;
  registroId: string;
  titulo?: string;
  userSector: string;
}

type TabType = 'comentarios' | 'archivos' | 'historial';

export const ColaboracionModal: React.FC<ColaboracionModalProps> = ({
  isOpen,
  onClose,
  tabla,
  registroId,
  titulo = 'Colaboración',
  userSector
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('comentarios');
  const {
    comentarios,
    archivos,
    loading,
    loadComentarios,
    loadArchivos,
    addComentario,
    uploadArchivo,
    deleteArchivo
  } = useColaboracion(userSector, tabla, parseInt(registroId));

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadComentarios();
      loadArchivos();
    }
  }, [isOpen, tabla, registroId, loadComentarios, loadArchivos]);

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim()) return;

    const success = await addComentario(nuevoComentario);
    if (success) {
      setNuevoComentario('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setUploading(true);
    await uploadArchivo(file);
    setUploading(false);

    // Clear input
    e.target.value = '';
  };

  const handleDeleteArchivo = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      await deleteArchivo(id);
    }
  };

  const renderComentarios = () => {
    if (loading) return <LoadingSpinner size="md" />;

    if (comentarios.length === 0) {
      return <EmptyState icon="💬" title="Sin comentarios" message="Sé el primero en comentar" />;
    }

    return (
      <div className="comentarios-list">
        {comentarios.map((c) => (
          <div key={c.id} className="comentario-item">
            <div className="comentario-header">
              <div className="comentario-autor">
                <span className="autor-avatar">{c.autorNombre.charAt(0).toUpperCase()}</span>
                <div>
                  <div className="autor-nombre">{c.autorNombre}</div>
                  <div className="comentario-fecha">{formatRelativeTime(c.fecha)}</div>
                </div>
              </div>
            </div>
            <div className="comentario-texto">{c.texto}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderArchivos = () => {
    if (loading) return <LoadingSpinner size="md" />;

    if (archivos.length === 0) {
      return <EmptyState icon="📎" title="Sin archivos" message="Arrastra archivos aquí o haz clic para subir" />;
    }

    return (
      <div className="archivos-list">
        {archivos.map((a) => (
          <div key={a.id} className="archivo-item">
            <div className="archivo-icon">📄</div>
            <div className="archivo-info">
              <div className="archivo-nombre">{a.originalName}</div>
              <div className="archivo-meta">
                {(a.tamaño / 1024).toFixed(1)} KB • {formatRelativeTime(a.fechaSubida)}
              </div>
            </div>
            <div className="archivo-actions">
              <a href={`/api/archivos/${a.id}/download`} className="btn-icon" title="Descargar">⬇️</a>
              <button className="btn-icon btn-delete" onClick={() => handleDeleteArchivo(a.id)} title="Eliminar">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHistorial = () => {
    return (
      <EmptyState icon="📜" title="Historial de auditoría" message="Funcionalidad próximamente" />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="lg">
      <div className="colaboracion-modal">
        {/* Tabs */}
        <div className="colaboracion-tabs">
          <button
            className={`tab-btn ${activeTab === 'comentarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('comentarios')}
          >
            <span className="tab-icon">💬</span>
            Comentarios
            {comentarios.length > 0 && <span className="tab-count">{comentarios.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'archivos' ? 'active' : ''}`}
            onClick={() => setActiveTab('archivos')}
          >
            <span className="tab-icon">📎</span>
            Archivos
            {archivos.length > 0 && <span className="tab-count">{archivos.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            <span className="tab-icon">📜</span>
            Historial
          </button>
        </div>

        {/* Content */}
        <div className="colaboracion-content">
          {activeTab === 'comentarios' && (
            <div className="comentarios-container">
              {renderComentarios()}
              
              {/* Nuevo comentario */}
              <div className="nuevo-comentario">
                <textarea
                  className="comentario-input"
                  placeholder="Escribe un comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  rows={3}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddComentario}
                  disabled={!nuevoComentario.trim()}
                >
                  Enviar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'archivos' && (
            <div className="archivos-container">
              {renderArchivos()}
              
              {/* Upload área */}
              <div className="upload-area">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-label">
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📤</span>
                      <span>Subir archivo</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="historial-container">
              {renderHistorial()}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
