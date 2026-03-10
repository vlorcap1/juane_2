import React, { useState, useEffect } from 'react';
import './IndicadoresPage.css';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';

interface User {
  nombre: string;
  sector: string;
  rol: string;
}

interface IndicadoresPageProps {
  user: User;
}

interface KPI {
  id: string;
  nombre: string;
  valor: number;
  meta: number;
  unidad: string;
  categoria: string;
  tendencia: 'up' | 'down' | 'stable';
  variacion: number;
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

  useEffect(() => {
    loadData();
  }, []);

  const [selectedSeremi, setSelectedSeremi] = useState<string>('');
  const [seremis, setSeremis] = useState<any[]>([]);
  const [showKPIModal, setShowKPIModal] = useState(false);

  useEffect(() => {
    loadSeremis();
  }, []);

  const loadSeremis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/seremis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSeremis(data);
      }
    } catch (error) {
      console.error('Error loading seremis:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load KPIs
      const kpisRes = await fetch('http://localhost:8000/api/kpis', { headers });
      if (kpisRes.ok) {
        const data = await kpisRes.json();
        setKpis(data);
        
        // Calculate stats
        const cumpliendo = data.filter((k: KPI) => (k.valor / k.meta) >= 0.9).length;
        const enRiesgo = data.filter((k: KPI) => (k.valor / k.meta) >= 0.7 && (k.valor / k.meta) < 0.9).length;
        const criticos = data.filter((k: KPI) => (k.valor / k.meta) < 0.7).length;
        
        setStats({
          totalKPIs: data.length,
          cumpliendo,
          enRiesgo,
          criticos
        });
      }

      // TODO: Load additional data when needed

    } catch (error) {
      console.error('Error loading indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromProgress = (valor: number, meta: number): 'verde' | 'amarillo' | 'rojo' => {
    const progreso = (valor / meta) * 100;
    if (progreso >= 90) return 'verde';
    if (progreso >= 70) return 'amarillo';
    return 'rojo';
  };

  const filteredKPIs = kpis;

  const isAdmin = _user.rol === 'admin';

  const handleOpenKPIModal = () => {
    setShowKPIModal(true);
  };

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
                const progreso = ((kpi.valor / kpi.meta) * 100).toFixed(1);
                const estado = getStatusFromProgress(kpi.valor, kpi.meta);
                return (
                  <tr key={kpi.id}>
                    <td><strong>{kpi.nombre}</strong></td>
                    <td>{kpi.meta}</td>
                    <td>{kpi.valor}</td>
                    <td><strong>{progreso}%</strong></td>
                    <td>
                      <Badge variant={estado === 'verde' ? 'success' : estado === 'amarillo' ? 'warning' : 'danger'}>
                        {estado === 'verde' ? '✅ Cumpliendo' : estado === 'amarillo' ? '⚠️ En Riesgo' : '🚨 Crítico'}
                      </Badge>
                    </td>
                    <td>{kpi.categoria}</td>
                    <td>{kpi.unidad}</td>
                    <td>
                      <button className="btn-icon" title="Editar">✏️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showKPIModal} onClose={() => setShowKPIModal(false)} title="Nuevo KPI">
        <p>Formulario de KPI próximamente.</p>
      </Modal>
    </div>
  );
};
