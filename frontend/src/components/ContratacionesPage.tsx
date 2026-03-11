/**
 * Página de Gestión de Contrataciones - Diseño Profesional
 */
import React, { useState, useEffect } from 'react';
import { useContrataciones } from '../hooks/useContrataciones';
import { useSeremis } from '../hooks/useApi';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Modal } from './ui/Modal';
import { formatMoney } from '../utils/formatters';
import { useToast } from './ui/Toast';
import { useExport } from '../hooks/useExport';
import './ContratacionesPage.css';

const SUBCATEGORIAS_POR_SEREMI: Record<string, string[]> = {
  delegado:        ['Senda', 'Subdere', 'Migraciones', 'Segnapred', 'Servel'],
  economia:        ['Sercotec', 'Corfo', 'INE', 'Sernac', 'Sernatur', 'Sernapesca'],
  desarrollosocial:['Reinserción Social Juvenil', 'Fosis', 'Senama', 'Senadis', 'Conadi', 'Injuv'],
  educacion:       ['Director Provincial', 'Superintendente', 'Integra', 'Junji', 'Junaeb', 'Slep Maule Costa', 'Slep Los Alamos', 'Slep los cerezos', 'Slep Maule Valle'],
  justicia:        ['Registro civil', 'Servicio Medico legal', 'Defensoria penal publica', 'Gendarmeria'],
  trabajo:         ['Dirección regional', 'Sence', 'IPS'],
  obras:           ['Vialidad', 'DGA', 'DOH', 'DOP', 'DGAeropuerto', 'Arquitectura', 'SISS'],
  salud:           ['Servicio de salud', 'Compin', 'Fonasa'],
  vivienda:        ['Serviu'],
  agricultura:     ['Indap', 'Sag', 'Conaf', 'CNR', 'Inia'],
  energia:         ['Sec'],
  medioambiente:   ['Superintendencia medio ambiente', 'SEA'],
  deporte:         ['IND'],
  mineria:         ['Serneagomin'],
};

interface ContratacionesPageProps {
  user: any;
}

export const ContratacionesPage: React.FC<ContratacionesPageProps> = ({ user }) => {
  const isAdmin = user?.rol === 'admin';
  const seremiId = user?.sector;

  const { contrataciones, loading, createContratacion, updateContratacion, refresh } = useContrataciones(isAdmin ? undefined : seremiId);
  const { seremis } = useSeremis();
  const { exportData, exporting } = useExport();

  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [editingContratacion, setEditingContratacion] = useState<any>(null);
  const [selectedContratacion, setSelectedContratacion] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, []);

  // Estadísticas
  const stats = {
    total: contrataciones.length,
    pendientes: contrataciones.filter(c => 
      c.estado === 'Pendiente' || c.estado === 'pendiente' || c.estado === 'en_proceso'
    ).length,
    aprobadas: contrataciones.filter(c => 
      c.estado === 'Aprobada' || c.estado === 'aprobada' || c.estado === 'adjudicada'
    ).length,
    rechazadas: contrataciones.filter(c => 
      c.estado === 'Rechazada' || c.estado === 'rechazada'
    ).length,
    historicos: contrataciones.filter(c =>
      c.estado === 'Aprobada' || c.estado === 'aprobada' || c.estado === 'adjudicada' ||
      c.estado === 'Rechazada' || c.estado === 'rechazada'
    ).length,
    montoTotal: contrataciones.reduce((sum, c) => {
      const monto = typeof c.monto === 'string' ? parseFloat(c.monto.replace(/[^0-9.-]/g, '')) : (c.monto || 0);
      return sum + monto;
    }, 0),
    montoNuevos: contrataciones
      .filter(c => c.esNuevo === 'Nuevo')
      .reduce((sum, c) => {
        const monto = typeof c.monto === 'string' ? parseFloat(c.monto.replace(/[^0-9.-]/g, '')) : (c.monto || 0);
        return sum + monto;
      }, 0)
  };

  const handleExportExcel = async () => {
    await exportData({
      format: 'excel',
      type: 'contrataciones',
      seremiId: isAdmin ? undefined : seremiId
    });
  };

  // Filtrado
  const filteredContrataciones = contrataciones.filter(c => {
    const matchesEstado = !selectedEstado || c.estado === selectedEstado;
    const matchesSearch = !searchQuery || 
      c.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cargo?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesEstado && matchesSearch;
  });

  const handleCreate = () => {
    setEditingContratacion(null);
    setFormData({
      seremiId: seremiId,
      nombre: '',
      rut: '',
      cargo: '',
      grado: '',
      tipo: 'Honorarios',
      esNuevo: 'Nuevo',
      inicio: new Date().toISOString().split('T')[0],
      termino: '',
      monto: '',
      financ: 'Presupuesto SEREMI',
      just: '',
      estado: 'Pendiente',
      subcategoria: ''
    });
    setShowModal(true);
  };

  // Removed handleEdit - use handleVerDetalle instead

  const handleVerDetalle = (c: any) => {
    setSelectedContratacion(c);
    setShowDetalleModal(true);
  };

  const handleSubmit = async () => {
    if (isAdmin && !formData.seremiId) {
      showToast('Por favor selecciona una SEREMI', 'error');
      return;
    }
    if (!formData.nombre || !formData.rut || !formData.cargo) {
      showToast('Por favor completa los campos obligatorios (Nombre, RUT, Cargo)', 'error');
      return;
    }

    if (editingContratacion) {
      const success = await updateContratacion(editingContratacion.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createContratacion(formData);
      if (success) setShowModal(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedContratacion) return;

    try {
      await updateContratacion(selectedContratacion.id, { 
        estado: 'Aprobada',
        vbQuien: user.nombre,
        vbFecha: new Date().toISOString()
      } as any);
      showToast('Contratación aprobada exitosamente', 'success');
      setShowDetalleModal(false);
      refresh();
    } catch (error) {
      console.error('Error al aprobar:', error);
      showToast('Error al aprobar contratación', 'error');
    }
  };

  const handleAprobarDirecto = async (c: any) => {
    try {
      await updateContratacion(c.id, { 
        estado: 'Aprobada',
        vbQuien: user.nombre,
        vbFecha: new Date().toISOString()
      } as any);
      showToast(`✅ Visto Bueno otorgado a ${c.nombre}`, 'success');
      refresh();
    } catch (error) {
      console.error('Error al aprobar:', error);
      showToast('Error al aprobar contratación', 'error');
    }
  };

  const handleRechazar = () => {
    setShowDetalleModal(false);
    setShowRechazoModal(true);
  };

  const handleConfirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      showToast('Por favor ingresa el motivo del rechazo', 'error');
      return;
    }

    if (!selectedContratacion) return;

    try {
      await updateContratacion(selectedContratacion.id, { 
        estado: 'Rechazada',
        motivoRechazo: motivoRechazo,
        vbQuien: user.nombre,
        vbFecha: new Date().toISOString()
      } as any);
      showToast('Contratación rechazada', 'success');
      setShowRechazoModal(false);
      setMotivoRechazo('');
      refresh();
    } catch (error) {
      console.error('Error al rechazar:', error);
      showToast('Error al rechazar contratación', 'error');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const normalizedEstado = estado?.toLowerCase();
    if (normalizedEstado === 'pendiente' || normalizedEstado === 'en_proceso') {
      return <span className="badge badge-warning">⏳ Pendiente VB</span>;
    } else if (normalizedEstado === 'aprobada' || normalizedEstado === 'adjudicada') {
      return <span className="badge badge-success">✅ Aprobada</span>;
    } else if (normalizedEstado === 'rechazada') {
      return <span className="badge badge-danger">❌ Rechazada</span>;
    }
    return <span className="badge">{estado}</span>;
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-title">Contrataciones Nuevas</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
            Solicitudes de contratación · Requieren Visto Bueno del Delegado Presidencial
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-success" onClick={handleExportExcel} disabled={exporting}>{exporting ? 'Exportando...' : '⬇ Excel'}</button>
          <button className="btn btn-primary" onClick={handleCreate}>+ Nueva Contratación</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(58,123,213,.15)' }}>📋</div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Total solicitudes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232,160,58,.15)' }}>⏳</div>
          <div>
            <div className="stat-val" style={{ color: 'var(--accent)' }}>{stats.pendientes}</div>
            <div className="stat-label">Pendientes de VB</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,196,165,.12)' }}>✅</div>
          <div>
            <div className="stat-val" style={{ color: 'var(--accent3)' }}>{stats.aprobadas}</div>
            <div className="stat-label">Aprobadas</div>
          </div>
        </div>
        {isAdmin && (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(140,100,255,.15)' }}>📊</div>
              <div>
                <div className="stat-val">{stats.historicos}</div>
                <div className="stat-label">Contratos históricos</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(46,196,165,.15)' }}>💰</div>
              <div>
                <div className="stat-val" style={{ color: 'var(--accent3)' }}>{formatMoney(stats.montoTotal)}</div>
                <div className="stat-label">Suma pesos mensuales</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(58,123,213,.15)' }}>🆕</div>
              <div>
                <div className="stat-val" style={{ color: 'var(--accent2)' }}>{formatMoney(stats.montoNuevos)}</div>
                <div className="stat-label">Suma plazas nuevas</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="filter-chips">
          <div 
            className={`f-chip ${!selectedEstado ? 'active' : ''}`}
            onClick={() => setSelectedEstado('')}
          >
            Todas
          </div>
          <div 
            className={`f-chip pend-chip ${selectedEstado === 'Pendiente' ? 'active' : ''}`}
            onClick={() => setSelectedEstado('Pendiente')}
          >
            ⏳ Pendiente VB
          </div>
          <div 
            className={`f-chip ${selectedEstado === 'Aprobada' ? 'active' : ''}`}
            onClick={() => setSelectedEstado('Aprobada')}
          >
            ✅ Aprobadas
          </div>
          <div 
            className={`f-chip ${selectedEstado === 'Rechazada' ? 'active' : ''}`}
            onClick={() => setSelectedEstado('Rechazada')}
          >
            ❌ Rechazadas
          </div>
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar nombre, RUT, cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <div className="table-head-bar">
          <div className="table-head-title">
            📋 Solicitudes de Contratación
            <span className="table-count">{filteredContrataciones.length} registros</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre / RUT</th>
                <th>Cargo · Grado</th>
                <th>Tipo</th>
                <th>SEREMI</th>
                <th>Período</th>
                {isAdmin && <th>Monto mensual</th>}
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredContrataciones.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                    No se encontraron contrataciones
                  </td>
                </tr>
              ) : (
                filteredContrataciones.map((c, index) => (
                  <tr key={c.id} onClick={() => handleVerDetalle(c)}>
                    <td style={{ color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                      {index + 1}
                    </td>
                    <td>
                      <div className="td-name">{c.nombre}</div>
                      <div className="td-rut">{c.rut}</div>
                    </td>
                    <td>
                      <div className="td-cargo">{c.cargo}</div>
                      {c.grado && <div className="td-grado">{c.grado}</div>}
                    </td>
                    <td>{c.tipo}</td>
                    <td>{c.seremiId || '—'}</td>
                    <td>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>
                        {c.inicio} → {c.termino}
                      </div>
                    </td>
                    {isAdmin && (
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {formatMoney(c.monto)}
                      </td>
                    )}
                    <td>{getEstadoBadge(c.estado)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                          onClick={() => handleVerDetalle(c)}
                        >
                          👁 Ver
                        </button>
                        {isAdmin && (c.estado === 'Pendiente' || c.estado === 'pendiente') && (
                          <>
                            <button 
                              className="btn btn-success"
                              style={{ fontSize: '10px', padding: '4px 8px', fontWeight: 700 }}
                              onClick={() => { setSelectedContratacion(c); handleAprobarDirecto(c); }}
                            >
                              ✅ VB
                            </button>
                            <button 
                              className="btn btn-danger2" 
                              style={{ fontSize: '10px', padding: '4px 8px' }}
                              onClick={() => { setSelectedContratacion(c); setShowRechazoModal(true); }}
                            >
                              ❌
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingContratacion ? 'Editar Contratación' : 'Nueva Solicitud de Contratación'}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">SEREMI SOLICITANTE *</label>
              <select
                className="form-select"
                value={formData.seremiId || ''}
                onChange={(e) => setFormData({ ...formData, seremiId: e.target.value })}
              >
                <option value="">Seleccionar SEREMI...</option>
                {seremis.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--accent2)', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
            👤 Persona a contratar
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">NOMBRE COMPLETO *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nombre y apellidos"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">RUT *</label>
              <input
                type="text"
                className="form-input"
                placeholder="12.345.678-9"
                value={formData.rut || ''}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">CARGO / FUNCIÓN *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Profesional Sectorial..."
                value={formData.cargo || ''}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GRADO / NIVEL</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Grado 10, Nivel 3..."
                value={formData.grado || ''}
                onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
              />
            </div>
          </div>

          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--accent2)', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)', marginTop: '8px' }}>
            📄 Datos del contrato
          </div>

          <div className="form-group">
            <label className="form-label">¿ES PLAZA NUEVA O CAMBIO DE PLAZA ACTUAL? *</label>
            <select
              className="form-select"
              value={formData.esNuevo || 'Nuevo'}
              onChange={(e) => setFormData({ ...formData, esNuevo: e.target.value })}
            >
              <option value="Nuevo">Plaza nueva</option>
              <option value="Cambio">Cambio de plaza actual</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">TIPO *</label>
              <select
                className="form-select"
                value={formData.tipo || 'Honorarios'}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option>Honorarios</option>
                <option>Contrata</option>
                <option>Planta</option>
                <option>Código del Trabajo</option>
                <option>Reemplazo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">FECHA INICIO *</label>
              <input
                type="date"
                className="form-input"
                value={formData.inicio || ''}
                onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">FECHA TÉRMINO *</label>
              <input
                type="date"
                className="form-input"
                value={formData.termino || ''}
                onChange={(e) => setFormData({ ...formData, termino: e.target.value })}
              />
            </div>
          </div>

          {(() => {
            const activeSeremiId = (isAdmin ? formData.seremiId : seremiId) || '';
            const opciones = SUBCATEGORIAS_POR_SEREMI[activeSeremiId] || [];
            if (opciones.length === 0) return null;
            return (
              <div className="form-group">
                <label className="form-label">SUBCATEGORÍA / SERVICIO</label>
                <select
                  className="form-select"
                  value={formData.subcategoria || ''}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                >
                  <option value="">Sin subcategoría</option>
                  {opciones.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">MONTO MENSUAL BRUTO ($) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: 1.500.000"
                value={formData.monto || ''}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">FINANCIAMIENTO</label>
              <select
                className="form-select"
                value={formData.financ || 'Presupuesto SEREMI'}
                onChange={(e) => setFormData({ ...formData, financ: e.target.value })}
              >
                <option>Presupuesto SEREMI</option>
                <option>Transferencia GORE</option>
                <option>Programa sectorial</option>
                <option>Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">JUSTIFICACIÓN / DESCRIPCIÓN DE FUNCIONES *</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '72px' }}
              placeholder="Describe las funciones y por qué se requiere esta contratación..."
              value={formData.just || ''}
              onChange={(e) => setFormData({ ...formData, just: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingContratacion ? 'Actualizar' : '📤 Enviar al Delegado Presidencial'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal 
        isOpen={showDetalleModal} 
        onClose={() => setShowDetalleModal(false)} 
        title="Detalle de Contratación"
        size="lg"
      >
        {selectedContratacion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header del detalle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '19px', color: 'var(--text)' }}>
                  {selectedContratacion.nombre}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {selectedContratacion.cargo}{selectedContratacion.grado ? ` · ${selectedContratacion.grado}` : ''} · {selectedContratacion.tipo} · {selectedContratacion.seremiId || '—'}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {(selectedContratacion.estado === 'Pendiente' || selectedContratacion.estado === 'pendiente') && (
                  <span className="badge badge-warning">⏳ Pendiente VB</span>
                )}
                {(selectedContratacion.estado === 'Aprobada' || selectedContratacion.estado === 'aprobada') && (
                  <span className="badge badge-success">✅ Aprobada</span>
                )}
                {(selectedContratacion.estado === 'Rechazada' || selectedContratacion.estado === 'rechazada') && (
                  <span className="badge badge-danger">❌ Rechazada</span>
                )}
              </div>
            </div>

            {/* Campos como tarjetas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>RUT</div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{selectedContratacion.rut}</div>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Tipo de contrato</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.tipo}</div>
              </div>
              {selectedContratacion.subcategoria && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Subcategoría / Servicio</div>
                  <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.subcategoria}</div>
                </div>
              )}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Tipo de plaza</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.esNuevo === 'Nuevo' ? '🆕 Plaza nueva' : '🔄 Cambio de plaza actual'}</div>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Fecha inicio</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.inicio}</div>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Fecha término</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.termino}</div>
              </div>
              {isAdmin && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Monto mensual</div>
                  <div style={{ fontSize: '16px', color: 'var(--accent3)', fontFamily: 'JetBrains Mono, monospace' }}>{formatMoney(selectedContratacion.monto)}</div>
                </div>
              )}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Financiamiento</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.financ || '—'}</div>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Justificación</div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.65' }}>{selectedContratacion.just || '—'}</div>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Solicitado por</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.creadoPor || '—'}</div>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '9px', padding: '11px 15px' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: '3px' }}>Fecha solicitud</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{selectedContratacion.creadoEn || '—'}</div>
              </div>
            </div>

            {/* Flujo de Visto Bueno */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>✅ Flujo de Visto Bueno</div>
              
              {/* SEREMI Solicitante */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--accent3)', background: 'rgba(46,196,165,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  📤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>SEREMI solicitante</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                    {selectedContratacion.seremiId || 'SEREMI'} · Solicitud enviada
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--accent3)', whiteSpace: 'nowrap' }}>
                  {selectedContratacion.creadoEn ? new Date(selectedContratacion.creadoEn).toLocaleDateString() : '—'}
                </div>
              </div>

              {/* Delegado Presidencial */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0' }}>
                <div style={{ 
                  width: '34px', 
                  height: '34px', 
                  borderRadius: '50%', 
                  border: `2px solid ${
                    selectedContratacion.estado === 'Aprobada' || selectedContratacion.estado === 'aprobada' ? 'var(--accent3)' :
                    selectedContratacion.estado === 'Rechazada' || selectedContratacion.estado === 'rechazada' ? 'var(--danger)' :
                    'var(--accent)'
                  }`, 
                  background: selectedContratacion.estado === 'Aprobada' || selectedContratacion.estado === 'aprobada' ? 'rgba(46,196,165,.12)' :
                              selectedContratacion.estado === 'Rechazada' || selectedContratacion.estado === 'rechazada' ? 'rgba(232,84,84,.12)' :
                              'rgba(232,160,58,.12)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '16px', 
                  flexShrink: 0,
                  transition: 'all .3s'
                }}>
                  {selectedContratacion.estado === 'Aprobada' || selectedContratacion.estado === 'aprobada' ? '✅' :
                   selectedContratacion.estado === 'Rechazada' || selectedContratacion.estado === 'rechazada' ? '❌' :
                   '⏳'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Delegado Presidencial</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                    {selectedContratacion.estado === 'Aprobada' || selectedContratacion.estado === 'aprobada' ? 
                      `Aprobado por ${selectedContratacion.vbQuien || 'Delegado'}` :
                     selectedContratacion.estado === 'Rechazada' || selectedContratacion.estado === 'rechazada' ?
                      `Rechazado por ${selectedContratacion.vbQuien || 'Delegado'}` :
                      'Pendiente de Visto Bueno'}
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', whiteSpace: 'nowrap', color: 'var(--text3)' }}>
                  {selectedContratacion.vbFecha ? new Date(selectedContratacion.vbFecha).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>

            {selectedContratacion.motivoRechazo && (
              <div style={{ background: 'rgba(232, 84, 84, 0.08)', border: '1px solid rgba(232, 84, 84, 0.2)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px' }}>❌ Motivo del Rechazo</div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.5' }}>
                  {selectedContratacion.motivoRechazo}
                </div>
              </div>
            )}

            {isAdmin && (selectedContratacion.estado === 'Pendiente' || selectedContratacion.estado === 'pendiente') && (
              <div style={{ background: 'rgba(46, 196, 165, 0.05)', border: '1px solid rgba(46, 196, 165, 0.2)', borderRadius: '11px', padding: '18px 20px', marginTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent3)', marginBottom: '14px' }}>
                  ⏳ Esta solicitud requiere tu Visto Bueno
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleAprobar}
                    style={{ padding: '12px 28px', background: 'var(--accent3)', border: 'none', borderRadius: '10px', color: '#0b0f1a', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all .2s', letterSpacing: '.01em' }}
                  >
                    ✅ Dar Visto Bueno — Aprobar contratación
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>El estado cambiará a <strong style={{ color: 'var(--accent3)' }}>Aprobada</strong></span>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <button 
                    onClick={handleRechazar}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--danger)', borderRadius: '9px', color: 'var(--danger)', fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                  >
                    ❌ Rechazar solicitud
                  </button>
                </div>
              </div>
            )}

            {(!isAdmin || (selectedContratacion.estado !== 'Pendiente' && selectedContratacion.estado !== 'pendiente')) && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button className="btn" onClick={() => setShowDetalleModal(false)}>Cerrar</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Rechazo */}
      <Modal 
        isOpen={showRechazoModal} 
        onClose={() => setShowRechazoModal(false)} 
        title="Rechazar Solicitud de Contratación"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(232, 84, 84, 0.08)', border: '1px solid rgba(232, 84, 84, 0.2)', borderRadius: '10px', padding: '14px', fontSize: '11px', color: 'var(--text2)', lineHeight: '1.5' }}>
            ⚠️ Esta acción rechazará la solicitud de contratación de <strong>{selectedContratacion?.nombre}</strong>. 
            Por favor, indica el motivo del rechazo para que el solicitante pueda comprender la decisión.
          </div>

          <div className="form-group">
            <label className="form-label">MOTIVO DEL RECHAZO *</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '120px' }}
              placeholder="Explica por qué se rechaza esta solicitud (presupuesto insuficiente, funciones duplicadas, requisitos no cumplidos, etc.)"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn" onClick={() => { setShowRechazoModal(false); setMotivoRechazo(''); }}>
              Cancelar
            </button>
            <button 
              className="btn btn-danger2" 
              onClick={handleConfirmarRechazo}
              style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
            >
              ❌ Confirmar Rechazo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
