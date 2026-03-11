import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './VisitasAutoridadesPage.css';

interface VisitaAutoridad {
  id: number;
  nombre: string;
  cargo?: string;
  tipoAutoridad: string;
  ministerio?: string;
  fecha: string;
  comunas?: string;
  agenda?: string;
  acompanantes?: string;
  seremiId: string;
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

export default function VisitasAutoridadesPage() {
  const [visitas, setVisitas] = useState<VisitaAutoridad[]>([]);
  const [filteredVisitas, setFilteredVisitas] = useState<VisitaAutoridad[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [user] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  useEffect(() => {
    loadVisitas();
  }, []);

  useEffect(() => {
    filterVisitas();
  }, [filtroTipo, visitas]);

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
          <button className="btn btn-primary" onClick={() => {/* TODO: Open modal */}}>+ Nueva Visita</button>
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
                  <tr key={visita.id}>
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
                    <td>
                      <button className="btn-icon" title="Editar">✏️</button>
                      {user?.rol === 'admin' && (
                        <button className="btn-icon" title="Eliminar">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
