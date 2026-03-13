import React, { useState, useEffect } from 'react';
import './IndicadoresPage.css';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import apiClient from '../api/client';

interface User {
  nombre: string;
  sector: string;
  rol: string;
  seremiId?: string;
  id?: string | number;
}

interface IndicadoresPageProps {
  user: User;
}

interface KPI {
  id?: number;
  nombre: string;
  real?: number;
  meta: number;
  unidad?: string;
  categoria?: string;
  periodo?: string;
  descripcion?: string;
  seremiId?: string;
}

interface Seremi {
  id: string;
  nombre: string;
}

export const IndicadoresPage: React.FC<IndicadoresPageProps> = ({ user: _user }) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  
  const [stats, setStats] = useState({
    totalKPIs: 0,
    cumpliendo: 0,
    enRiesgo: 0,
    criticos: 0
  });

  const [selectedSeremi, setSelectedSeremi] = useState<string>('');
  const [seremis, setSeremis] = useState<Seremi[]>([]);
  const [showKPIModal, setShowKPIModal] = useState(false);
  
  // Formulario KPI
  const [formData, setFormData] = useState<KPI>({
    nombre: '',
    meta: 0,
    real: 0,
    unidad: '',
    periodo: '',
    descripcion: '',
    seremiId: ''
  });
  const [editingKPI, setEditingKPI] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    loadSeremis();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedSeremi]);

  const loadSeremis = async () => {
    try {
      const response = await apiClient.get('/api/seremis');
      setSeremis(response.data);
    } catch (error) {
      console.error('Error loading seremis:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedSeremi) params.seremiId = selectedSeremi;

      const kpisRes = await apiClient.get('/api/kpis', { params });
      const data = kpisRes.data;
      setKpis(data);

      const cumpliendo = data.filter((k: KPI) => ((k.real || 0) / k.meta) >= 0.9).length;
      const enRiesgo = data.filter((k: KPI) => {
        const prog = (k.real || 0) / k.meta;
        return prog >= 0.7 && prog < 0.9;
      }).length;
      const criticos = data.filter((k: KPI) => ((k.real || 0) / k.meta) < 0.7).length;

      setStats({ totalKPIs: data.length, cumpliendo, enRiesgo, criticos });
    } catch (error) {
      console.error('Error loading indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKPIModal = () => {
    setEditingKPI(null);
    setFormData({
      nombre: '',
      meta: 0,
      real: 0,
      unidad: '',
      periodo: '',
      descripcion: '',
      seremiId: _user.rol === 'seremi' ? _user.seremiId : ''
    });
    setShowKPIModal(true);
  };

  const handleEditKPI = (kpi: KPI) => {
    setEditingKPI(kpi.id || null);
    setFormData({
      nombre: kpi.nombre,
      meta: kpi.meta,
      real: kpi.real || 0,
      unidad: kpi.unidad || '',
      periodo: kpi.periodo || '',
      descripcion: kpi.descripcion || '',
      seremiId: kpi.seremiId || ''
    });
    setShowKPIModal(true);
  };

  const handleSaveKPI = async () => {
    if (!formData.nombre.trim() || !formData.meta) {
      alert('Nombre y meta son obligatorios');
      return;
    }

    let seremiId = formData.seremiId;
    
    // If user is SEREMI, use their seremiId
    if (_user.rol === 'seremi') {
      seremiId = _user.seremiId || '';
    }
    
    // If admin creating new, check selector
    if (!seremiId && !editingKPI) {
      alert('Selecciona una SEREMI destinataria');
      return;
    }

    const payload = {
      seremiId,
      nombre: formData.nombre.trim(),
      meta: formData.meta,
      real: formData.real || 0,
      unidad: formData.unidad?.trim() || '',
      periodo: formData.periodo?.trim() || '',
      descripcion: formData.descripcion?.trim() || ''
    };

    try {
      if (editingKPI) {
        await apiClient.put(`/api/kpis/${editingKPI}`, payload);
      } else {
        await apiClient.post('/api/kpis', payload);
      }
      setShowKPIModal(false);
      alert('✓ KPI guardado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error al guardar KPI:', error);
      alert('Error al guardar KPI');
    }
  };

  const handleDeleteKPI = async (id: number) => {
    if (!confirm('¿Eliminar este indicador KPI?')) return;
    try {
      await apiClient.delete(`/api/kpis/${id}`);
      alert('KPI eliminado');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  };

  const handleFormChange = (field: keyof KPI, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusFromProgress = (valor: number, meta: number): 'verde' | 'amarillo' | 'rojo' => {
    const progreso = (valor / meta) * 100;
    if (progreso >= 90) return 'verde';
    if (progreso >= 70) return 'amarillo';
    return 'rojo';
  };

  const filteredKPIs = kpis;

  const isAdmin = _user.rol === 'admin';

  if (loading) {
    return (
      <div className="indicadores-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="indicadores-page">
      <div className="page-header">
        <div>
          <h1>📈 Indicadores KPI</h1>
          <p className="page-subtitle">
            Seguimiento de metas e indicadores por SEREMI
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenKPIModal}>+ Nuevo KPI</button>
      </div>

      {/* SEREMI Filter (only admin) */}
      {isAdmin && (
        <div className="kpi-filter-bar">
          <select 
            className="form-select" 
            value={selectedSeremi}
            onChange={(e) => setSelectedSeremi(e.target.value)}
            style={{ maxWidth: '280px' }}
          >
            <option value="">— Todos los SEREMIs —</option>
            {seremis.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* KPI Summary Row */}
      <div className="kpi-summary-row">
        <div className="kpi-summary-card">
          <div className="kpi-summary-icon" style={{ background: 'rgba(46,196,165,.15)' }}>✅</div>
          <div>
            <div className="kpi-summary-val" style={{ color: 'var(--accent3)' }}>{stats.cumpliendo}</div>
            <div className="kpi-summary-label">Cumpliendo</div>
          </div>
        </div>
        <div className="kpi-summary-card">
          <div className="kpi-summary-icon" style={{ background: 'rgba(232,160,58,.15)' }}>⚠️</div>
          <div>
            <div className="kpi-summary-val" style={{ color: 'var(--accent)' }}>{stats.enRiesgo}</div>
            <div className="kpi-summary-label">En Riesgo</div>
          </div>
        </div>
        <div className="kpi-summary-card">
          <div className="kpi-summary-icon" style={{ background: 'rgba(232,84,84,.15)' }}>🚨</div>
          <div>
            <div className="kpi-summary-val" style={{ color: '#e85454' }}>{stats.criticos}</div>
            <div className="kpi-summary-label">Críticos</div>
          </div>
        </div>
        <div className="kpi-summary-card">
          <div className="kpi-summary-icon" style={{ background: 'rgba(58,123,213,.15)' }}>📊</div>
          <div>
            <div className="kpi-summary-val">{stats.totalKPIs}</div>
            <div className="kpi-summary-label">Total KPIs</div>
          </div>
        </div>
      </div>

      {/* KPI Table */}
      {filteredKPIs.length === 0 ? (
        <EmptyState icon="📊" title="Sin indicadores" message="Comienza agregando tu primer KPI" />
      ) : (
        <div className="table-wrap">
          <table className="prensa-table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Meta</th>
                <th>Real</th>
                <th>% Avance</th>
                <th>Estado</th>
                <th>Período</th>
                <th>Unidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredKPIs.map((kpi) => {
                const progreso = (((kpi.real || 0) / kpi.meta) * 100).toFixed(1);
                const estado = getStatusFromProgress(kpi.real || 0, kpi.meta);
                return (
                  <tr key={kpi.id}>
                    <td><strong>{kpi.nombre}</strong></td>
                    <td>{kpi.meta}</td>
                    <td>{kpi.real ?? '-'}</td>
                    <td><strong>{progreso}%</strong></td>
                    <td>
                      <Badge variant={estado === 'verde' ? 'success' : estado === 'amarillo' ? 'warning' : 'danger'}>
                        {estado === 'verde' ? '✅ Cumpliendo' : estado === 'amarillo' ? '⚠️ En Riesgo' : '🚨 Crítico'}
                      </Badge>
                    </td>
                    <td>{kpi.categoria || kpi.periodo || '-'}</td>
                    <td>{kpi.unidad}</td>
                    <td>
                      <button className="btn-icon" title="Editar" onClick={() => handleEditKPI(kpi)}>✏️</button>
                      {isAdmin && (
                        <button className="btn-icon" title="Eliminar" onClick={() => handleDeleteKPI(kpi.id!)}>🗑️</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo/Editar KPI */}
      <Modal 
        isOpen={showKPIModal} 
        onClose={() => setShowKPIModal(false)} 
        title={editingKPI ? 'Editar KPI' : 'Nuevo KPI'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selector de SEREMI: solo visible para admin al crear nuevo KPI */}
          {isAdmin && !editingKPI && (
            <div className="form-group">
              <label className="form-label">
                SEREMI destinataria <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select 
                className="form-select"
                value={formData.seremiId}
                onChange={(e) => handleFormChange('seremiId', e.target.value)}
              >
                <option value="">— Selecciona SEREMI —</option>
                {seremis.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nombre del indicador *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Visitas realizadas en terreno"
              value={formData.nombre}
              onChange={(e) => handleFormChange('nombre', e.target.value)}
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Meta *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ej: 100"
                value={formData.meta || ''}
                onChange={(e) => handleFormChange('meta', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Real (actual)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ej: 75"
                value={formData.real ?? ''}
                onChange={(e) => handleFormChange('real', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: visitas, %, consultas"
                value={formData.unidad || ''}
                onChange={(e) => handleFormChange('unidad', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Período</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: 2025-T1, Enero 2025"
                value={formData.periodo || ''}
                onChange={(e) => handleFormChange('periodo', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '60px' }}
              placeholder="Descripción del indicador..."
              value={formData.descripcion || ''}
              onChange={(e) => handleFormChange('descripcion', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn-cancel" onClick={() => setShowKPIModal(false)}>
              Cancelar
            </button>
            <button className="btn-save" onClick={handleSaveKPI}>
              Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
