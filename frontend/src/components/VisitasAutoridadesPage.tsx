import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Modal } from './ui/Modal';
import './VisitasAutoridadesPage.css';

interface VisitaAutoridad {
  id?: number;
  nombre: string;
  cargo?: string;
  tipoAutoridad: string;
  ministerio?: string;
  fecha: string;
  comunas?: string;
  agenda?: string;
  acompanantes?: string;
  seremiId?: string;
  objetivos?: string;
  resultados?: string;
  impactoMedios?: string;
  seremiNombre?: string;
  numArchivos?: number;
}

interface User {
  id: number;
  username: string;
  rol: string;
  seremiId?: string;
  nombre?: string;
}

interface Seremi {
  id: string;
  nombre: string;
}

interface ArchivoInfo {
  id: number;
  nombre: string;
  tipo?: string;
  tamano?: number;
  subidoPor?: string;
  subidoEn?: string;
}

export default function VisitasAutoridadesPage() {
  const [visitas, setVisitas] = useState<VisitaAutoridad[]>([]);
  const [filteredVisitas, setFilteredVisitas] = useState<VisitaAutoridad[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [seremis, setSeremis] = useState<Seremi[]>([]);
  const [archivos, setArchivos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailVisita, setDetailVisita] = useState<VisitaAutoridad | null>(null);
  const [detailArchivos, setDetailArchivos] = useState<ArchivoInfo[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  
  const [user] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const [formData, setFormData] = useState<VisitaAutoridad>({
    nombre: '',
    cargo: '',
    tipoAutoridad: '',
    ministerio: '',
    fecha: '',
    comunas: '',
    agenda: '',
    acompanantes: '',
    seremiId: '',
    objetivos: '',
    resultados: '',
    impactoMedios: ''
  });

  useEffect(() => {
    loadVisitas();
    loadSeremis();
  }, []);

  useEffect(() => {
    filterVisitas();
  }, [filtroTipo, visitas]);

  const loadSeremis = async () => {
    try {
      const response = await apiClient.get('/api/seremis');
      setSeremis(response.data);
    } catch (error) {
      console.error('Error al cargar seremis:', error);
    }
  };

  const loadVisitas = async () => {
    try {
      const response = await apiClient.get('/api/visitas-autoridades');
      setVisitas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar visitas de autoridades:', error);
      setLoading(false);
    }
  };

  const filterVisitas = () => {
    if (filtroTipo === 'todos') {
      setFilteredVisitas(visitas);
    } else {
      setFilteredVisitas(visitas.filter(v => v.tipoAutoridad === filtroTipo));
    }
  };

  const handleOpenDetail = async (visita: VisitaAutoridad) => {
    setDetailVisita(visita);
    setDetailArchivos([]);
    setShowDetail(true);
    setLoadingArchivos(true);
    try {
      const res = await apiClient.get(`/api/visitas-autoridades/${visita.id}/archivos`);
      setDetailArchivos(res.data);
    } catch (err) {
      console.error('Error al cargar archivos:', err);
    } finally {
      setLoadingArchivos(false);
    }
  };

  const handleDownloadFile = async (arch: ArchivoInfo, preview = false) => {
    try {
      const response = await apiClient.get(`/api/archivos/${arch.id}/download`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: arch.tipo || 'application/octet-stream' }));
      const a = document.createElement('a');
      a.href = url;
      if (preview && arch.tipo?.startsWith('image/')) {
        window.open(url, '_blank');
      } else if (preview && arch.tipo === 'application/pdf') {
        window.open(url, '_blank');
      } else {
        a.download = arch.nombre;
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      alert('Error al descargar el archivo');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      cargo: '',
      tipoAutoridad: '',
      ministerio: '',
      fecha: '',
      comunas: '',
      agenda: '',
      acompanantes: '',
      seremiId: '',
      objetivos: '',
      resultados: '',
      impactoMedios: ''
    });
    setArchivos([]);
    setShowModal(true);
  };

  const handleEditVisita = (visita: VisitaAutoridad) => {
    setEditingId(visita.id || null);
    setFormData({
      nombre: visita.nombre,
      cargo: visita.cargo || '',
      tipoAutoridad: visita.tipoAutoridad,
      ministerio: visita.ministerio || '',
      fecha: visita.fecha,
      comunas: visita.comunas || '',
      agenda: visita.agenda || '',
      acompanantes: visita.acompanantes || '',
      seremiId: visita.seremiId || '',
      objetivos: visita.objetivos || '',
      resultados: visita.resultados || '',
      impactoMedios: visita.impactoMedios || ''
    });
    setArchivos([]);
    setShowModal(true);
  };

  const handleFormChange = (field: keyof VisitaAutoridad, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      handleFiles(newFiles);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(f => {
      if (f.size > 20 * 1024 * 1024) {
        alert(`Archivo ${f.name} excede 20MB`);
        return false;
      }
      return true;
    });
    setArchivos(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.background = 'rgba(232,160,58,.08)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.background = 'var(--bg3)';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.background = 'var(--bg3)';
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (visitaId: number) => {
    if (archivos.length === 0) return;

    const formDataFiles = new FormData();
    archivos.forEach(file => {
      formDataFiles.append('archivos', file);
    });

    try {
      await apiClient.post(`/api/visitas-autoridades/${visitaId}/archivos`, formDataFiles, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error al subir archivos:', error);
      alert('Error al subir archivos');
    }
  };

  const handleSaveVisita = async () => {
    if (!formData.nombre.trim() || !formData.cargo?.trim() || !formData.tipoAutoridad || 
        !formData.ministerio?.trim() || !formData.fecha) {
      alert('Completa los campos obligatorios');
      return;
    }

    try {
      const url = editingId 
        ? `/api/visitas-autoridades/${editingId}` 
        : '/api/visitas-autoridades';
      const method = editingId ? 'put' : 'post';

      const response = await apiClient[method](url, formData);
      const savedId = response.data.autoridad?.id || response.data.id;

      // Subir archivos si hay
      if (archivos.length > 0 && savedId) {
        await uploadFiles(savedId);
      }

      alert('Visita guardada exitosamente');
      setShowModal(false);
      loadVisitas();
    } catch (error) {
      console.error('Error al guardar visita:', error);
      alert('Error al guardar visita');
    }
  };

  const handleDeleteVisita = async (id: number) => {
    if (!confirm('¿Eliminar esta visita?')) return;

    try {
      await apiClient.delete(`/api/visitas-autoridades/${id}`);
      alert('Visita eliminada');
      loadVisitas();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar');
    }
  };

  const renderStats = () => {
    const total = visitas.length;
    const ministros = visitas.filter(v => v.tipoAutoridad === 'ministro').length;
    const subsecretarios = visitas.filter(v => v.tipoAutoridad === 'subsecretario').length;
    const directores = visitas.filter(v => v.tipoAutoridad === 'director_nacional').length;

    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(58,123,213,.15)' }}>📊</div>
          <div>
            <div className="stat-val">{total}</div>
            <div className="stat-label">Total visitas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232,84,84,.15)' }}>👔</div>
          <div>
            <div className="stat-val" style={{ color: '#e85454' }}>{ministros}</div>
            <div className="stat-label">Ministros</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232,160,58,.15)' }}>📋</div>
          <div>
            <div className="stat-val" style={{ color: 'var(--accent)' }}>{subsecretarios}</div>
            <div className="stat-label">Subsecretarios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,196,165,.12)' }}>🎯</div>
          <div>
            <div className="stat-val" style={{ color: 'var(--accent3)' }}>{directores}</div>
            <div className="stat-label">Directores</div>
          </div>
        </div>
      </div>
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ministro': return '👔';
      case 'subsecretario': return '📋';
      case 'director_nacional': return '🎯';
      default: return '👤';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'ministro': return 'Ministro';
      case 'subsecretario': return 'Subsecretario';
      case 'director_nacional': return 'Director';
      default: return tipo;
    }
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export
    console.log('Exportar a Excel');
  };

  if (loading) {
    return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-title">🎖️ Visitas de Autoridades Nacionales</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
            Registro de visitas de Ministros, Subsecretarios y Directores Nacionales a la región
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-success" onClick={exportToExcel}>⬇ Excel</button>
          <button className="btn btn-primary" onClick={handleOpenModal}>+ Nueva Visita</button>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filtros */}
      <div className="filters-row">
        <div className="filter-chips">
          <div 
            className={`f-chip ${filtroTipo === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('todos')}
          >
            Todas
          </div>
          <div 
            className={`f-chip ${filtroTipo === 'ministro' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('ministro')}
          >
            👔 Ministros
          </div>
          <div 
            className={`f-chip ${filtroTipo === 'subsecretario' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('subsecretario')}
          >
            📋 Subsecretarios
          </div>
          <div 
            className={`f-chip ${filtroTipo === 'director_nacional' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('director_nacional')}
          >
            🎯 Directores
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <div className="table-head-bar">
          <div className="table-head-title">
            🎖️ Visitas de Autoridades
            <span className="table-count">{filteredVisitas.length} registro{filteredVisitas.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Autoridad</th>
                <th>Cargo</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Comunas</th>
                <th>SEREMI Anfitrión</th>
                <th>Archivos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitas.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                    No hay visitas registradas
                  </td>
                </tr>
              ) : (
                filteredVisitas.map((visita, index) => (
                  <tr
                    key={visita.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenDetail(visita)}
                  >
                    <td>{index + 1}</td>
                    <td><strong>{visita.nombre}</strong></td>
                    <td>{visita.cargo || '-'}</td>
                    <td>
                      {getTipoIcon(visita.tipoAutoridad)} {getTipoLabel(visita.tipoAutoridad)}
                    </td>
                    <td>{visita.fecha}</td>
                    <td style={{ fontSize: '11px' }}>
                      {visita.comunas ? (
                        visita.comunas.length > 30 ? visita.comunas.substring(0, 30) + '...' : visita.comunas
                      ) : '-'}
                    </td>
                    <td>{visita.seremiNombre || '-'}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--accent3)', color: '#fff' }}>
                        {visita.numArchivos || 0} 📎
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon" title="Editar" onClick={() => handleEditVisita(visita)}>✏️</button>
                      {user?.rol === 'admin' && (
                        <button className="btn-icon" title="Eliminar" onClick={() => handleDeleteVisita(visita.id!)}>🗑️</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle Visita */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={detailVisita ? `${getTipoIcon(detailVisita.tipoAutoridad)} ${detailVisita.nombre}` : ''}
        size="lg"
      >
        {detailVisita && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Info header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="detail-field">
                <span className="detail-label">Cargo</span>
                <span className="detail-value">{detailVisita.cargo || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Tipo</span>
                <span className="detail-value">{getTipoIcon(detailVisita.tipoAutoridad)} {getTipoLabel(detailVisita.tipoAutoridad)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Ministerio / Servicio</span>
                <span className="detail-value">{detailVisita.ministerio || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Fecha de Visita</span>
                <span className="detail-value">{detailVisita.fecha}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">SEREMI Anfitrión</span>
                <span className="detail-value">{detailVisita.seremiNombre || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Comunas Visitadas</span>
                <span className="detail-value">{detailVisita.comunas || '—'}</span>
              </div>
            </div>

            {detailVisita.agenda && (
              <div className="detail-section">
                <div className="detail-section-title">📅 Agenda de la Visita</div>
                <p className="detail-text">{detailVisita.agenda}</p>
              </div>
            )}
            {detailVisita.acompanantes && (
              <div className="detail-section">
                <div className="detail-section-title">👥 Acompañantes</div>
                <p className="detail-text">{detailVisita.acompanantes}</p>
              </div>
            )}
            {detailVisita.objetivos && (
              <div className="detail-section">
                <div className="detail-section-title">🎯 Objetivos de la Visita</div>
                <p className="detail-text">{detailVisita.objetivos}</p>
              </div>
            )}
            {detailVisita.resultados && (
              <div className="detail-section">
                <div className="detail-section-title">✅ Resultados / Compromisos</div>
                <p className="detail-text">{detailVisita.resultados}</p>
              </div>
            )}
            {detailVisita.impactoMedios && (
              <div className="detail-section">
                <div className="detail-section-title">📰 Impacto en Medios</div>
                <p className="detail-text">{detailVisita.impactoMedios}</p>
              </div>
            )}

            {/* Archivos adjuntos */}
            <div className="detail-section">
              <div className="detail-section-title">📎 Archivos Adjuntos</div>
              {loadingArchivos ? (
                <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Cargando archivos...</p>
              ) : detailArchivos.length === 0 ? (
                <p style={{ color: 'var(--text3)', fontSize: '13px' }}>No hay archivos adjuntos</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {detailArchivos.map((arch) => (
                    <div key={arch.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', background: 'var(--bg3)',
                      borderRadius: '10px', border: '1px solid var(--border)'
                    }}>
                      <span style={{ fontSize: '22px' }}>
                        {arch.tipo?.includes('image') ? '🖼️' : arch.tipo?.includes('pdf') ? '📕' : arch.tipo?.includes('sheet') || arch.tipo?.includes('excel') ? '📗' : '📄'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {arch.nombre}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                          {arch.tamano ? `${(arch.tamano / 1024).toFixed(1)} KB` : ''}
                          {arch.subidoPor ? ` · Subido por ${arch.subidoPor}` : ''}
                          {arch.subidoEn ? ` · ${arch.subidoEn}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {(arch.tipo?.startsWith('image/') || arch.tipo === 'application/pdf') && (
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            title="Ver"
                            onClick={() => handleDownloadFile(arch, true)}
                          >
                            👁 Ver
                          </button>
                        )}
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          title="Descargar"
                          onClick={() => handleDownloadFile(arch, false)}
                        >
                          ⬇ Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button className="btn-cancel" onClick={() => setShowDetail(false)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => { setShowDetail(false); handleEditVisita(detailVisita); }}>
                ✏️ Editar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nueva/Editar Visita */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Visita de Autoridad' : 'Nueva Visita de Autoridad'}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn-save" onClick={handleSaveVisita}>Guardar Visita</button>
          </div>
        }
      >
        <div style={{ overflowY: 'auto' }}>
              {/* Datos básicos */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Nombre de la Autoridad <span style={{ color: '#e85454' }}>*</span></label>
                  <input 
                    className="form-input" 
                    placeholder="Ej: Juan Pérez López"
                    value={formData.nombre}
                    onChange={(e) => handleFormChange('nombre', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cargo <span style={{ color: '#e85454' }}>*</span></label>
                  <input 
                    className="form-input" 
                    placeholder="Ej: Ministro de Obras Públicas"
                    value={formData.cargo}
                    onChange={(e) => handleFormChange('cargo', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Tipo de Autoridad <span style={{ color: '#e85454' }}>*</span></label>
                  <select 
                    className="form-select"
                    value={formData.tipoAutoridad}
                    onChange={(e) => handleFormChange('tipoAutoridad', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="ministro">👔 Ministro</option>
                    <option value="subsecretario">📋 Subsecretario</option>
                    <option value="director_nacional">🎯 Director Nacional</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ministerio / Servicio <span style={{ color: '#e85454' }}>*</span></label>
                  <input 
                    className="form-input" 
                    placeholder="Ej: Ministerio del Interior"
                    value={formData.ministerio}
                    onChange={(e) => handleFormChange('ministerio', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Fecha de Visita <span style={{ color: '#e85454' }}>*</span></label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.fecha}
                    onChange={(e) => handleFormChange('fecha', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SEREMI Anfitrión</label>
                  <select 
                    className="form-select"
                    value={formData.seremiId || ''}
                    onChange={(e) => handleFormChange('seremiId', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {seremis.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detalles */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Comunas Visitadas</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="Ej: Talca, Curicó, Linares (separadas por coma)"
                  value={formData.comunas}
                  onChange={(e) => handleFormChange('comunas', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Agenda de la Visita</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="Detalle la agenda o itinerario de la visita..."
                  value={formData.agenda}
                  onChange={(e) => handleFormChange('agenda', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Acompañantes</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="Nombres de autoridades o funcionarios que acompañaron la visita..."
                  value={formData.acompanantes}
                  onChange={(e) => handleFormChange('acompanantes', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Objetivos de la Visita</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="Describa los objetivos principales de la visita..."
                  value={formData.objetivos}
                  onChange={(e) => handleFormChange('objetivos', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Resultados / Compromisos</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="Resuma los resultados obtenidos y compromisos adquiridos..."
                  value={formData.resultados}
                  onChange={(e) => handleFormChange('resultados', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>Impacto en Medios</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="Cobertura de prensa, redes sociales, otros medios..."
                  value={formData.impactoMedios}
                  onChange={(e) => handleFormChange('impactoMedios', e.target.value)}
                />
              </div>

              {/* Archivos adjuntos */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text)' }}>
                  📎 Archivos Adjuntos (Agenda, propuestas, fotos, etc.)
                </label>
                <div 
                  style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: '12px', 
                    padding: '24px', 
                    textAlign: 'center', 
                    background: 'var(--bg3)', 
                    cursor: 'pointer', 
                    minHeight: '100px' 
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleFileSelect}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                    Arrastra archivos aquí o haz clic para seleccionar
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    PDF, Word, Excel, Imágenes (máx. 20MB)
                  </div>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFilesChange}
                />
                
                {archivos.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {archivos.map((file, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px', 
                        background: 'var(--bg3)', 
                        borderRadius: '8px' 
                      }}>
                        <div style={{ fontSize: '20px' }}>📄</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>{file.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button 
                          className="btn-icon" 
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
        </div>
      </Modal>
    </div>
  );
}
