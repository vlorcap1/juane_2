import React, { useState, useEffect } from 'react';
import { Newspaper, Download, Lightbulb, Calendar } from 'lucide-react';
import { seremisApi } from '../api/client';
import { useFilters } from '../context/FilterContext';
import { useNuevoRegistro } from '../context/NuevoRegistroContext';
import {
  exportSinglePDFDashboard,
  exportAllPDFDashboard,
  exportSingleExcelDashboard,
  exportAllExcelDashboard,
  exportPrensaExcelDashboard,
  exportAgendaExcelDashboard,
} from '../utils/dashboardExport';
import { PeriodBar } from './dashboard/PeriodBar';
import { SectorFilterBar } from './dashboard/SectorFilterBar';
import { ExportBar } from './dashboard/ExportBar';
import { DetailPanel } from './dashboard/DetailPanel';
import { PrensaTable } from './dashboard/PrensaTable';
import { TemasBlock, AgendaCalendar } from './dashboard/TemasAgendaBlocks';
import { getSectorColor } from '../utils/formatters';

interface DashboardProps {
  user: any;
}

interface SeremisData {
  id: number;
  nombre: string;
  sector: string;
  seremisNombre: string;
  visitas: number;
  contactos: number;
  prensa: number;
  proyectos: number;
  nudos: number;
}

interface KPI {
  value: string;
  name: string;
  delta: string;
  color: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [seremisData, setSeremisData] = useState<SeremisData[]>([]);
  const [filteredData, setFilteredData] = useState<SeremisData[]>([]);
  const [selectedSeremi, setSelectedSeremi] = useState<number | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  // Use global filter context
  const { period, sector, setPeriod, setSector } = useFilters();
  
  // Use nuevo registro context
  const { openModal } = useNuevoRegistro();

  useEffect(() => {
    loadData();
  }, [period]);

  useEffect(() => {
    filtering();
  }, [seremisData, sector]);

  const loadData = async () => {
    try {
      console.log('Loading SEREMIS data...');
      const data = await seremisApi.getSeremisData();
      console.log('Data loaded:', data);
      setSeremisData(data);
      const kpiData = user.rol !== 'admin'
        ? data.filter((s: any) => String(s.id) === String(user.seremiId))
        : data;
      calculateKPIs(kpiData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (data: SeremisData[]) => {
    const totalVisitas = data.reduce((sum, s) => sum + (s.visitas || 0), 0);
    const totalContactos = data.reduce((sum, s) => sum + (s.contactos || 0), 0);
    const totalPrensa = data.reduce((sum, s) => sum + (s.prensa || 0), 0);
    const totalProyectos = data.reduce((sum, s) => sum + (s.proyectos || 0), 0);
    const totalNudos = data.reduce((sum, s) => sum + (s.nudos || 0), 0);

    setKpis([
      { value: data.length.toString(), name: 'SEREMIs activas', delta: '↑ 100% cobertura', color: 'rgba(58,123,213,.1)' },
      { value: totalVisitas.toString(), name: 'Visitas a comunas', delta: 'Total período', color: 'rgba(232,160,58,.1)' },
      { value: totalContactos.toString(), name: 'Personas en eventos', delta: 'Total período', color: 'rgba(46,196,165,.1)' },
      { value: totalPrensa.toString(), name: 'Apariciones prensa', delta: 'Total período', color: 'rgba(232,84,84,.08)' },
      { value: totalProyectos.toString(), name: 'Proyectos activos', delta: 'Total región', color: 'rgba(58,123,213,.08)' },
      { value: totalNudos.toString(), name: 'Nudos críticos', delta: 'Requieren atención', color: 'rgba(232,84,84,.1)' }
    ]);
  };

  const filtering = () => {
    if (user.rol !== 'admin') {
      setFilteredData(seremisData.filter(s => String(s.id) === String(user.seremiId)));
    } else if (sector === 'all') {
      setFilteredData(seremisData);
    } else {
      setFilteredData(seremisData.filter(s => s.sector === sector));
    }
  };

  const handleExportPDF = () => {
    exportAllPDFDashboard(filteredData);
  };

  const handleExportExcel = () => {
    exportAllExcelDashboard(filteredData);
  };

  const handleExportSeremiPDF = (seremiId: number) => {
    const seremi = seremisData.find(s => s.id === seremiId);
    if (seremi) exportSinglePDFDashboard(seremi);
  };

  const handleExportSeremiExcel = (seremiId: number) => {
    const seremi = seremisData.find(s => s.id === seremiId);
    if (seremi) exportSingleExcelDashboard(seremi);
  };

  const handleExportPrensa = () => {
    exportPrensaExcelDashboard(seremisData);
  };

  const handleExportAgenda = () => {
    exportAgendaExcelDashboard(seremisData);
  };

  const handleNuevoRegistro = () => {
    if (user.rol === 'admin') {
      openModal();
      return;
    }

    const userSeremiId = user.seremiId || user.sector;
    openModal(undefined, userSeremiId);
  };

  const selectSeremi = (id: number) => {
    setSelectedSeremi(selectedSeremi === id ? null : id);
  };

  if (loading) {
    return <div className="container">Cargando...</div>;
  }

  const selectedSeremiData = selectedSeremi 
    ? filteredData.find(s => s.id === selectedSeremi)
    : null;

  return (
    <div className="container">
      {/* SEREMI BANNER (solo vista seremi) */}
      {user.rol !== 'admin' && (
        <div className="seremi-banner">
          <div className="seremi-banner-info">
            <div className="seremi-avatar-lg" style={{ background: getSectorColor(user.sector) }}>
              {user.sector?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="seremi-banner-name">{user.nombre}</div>
              <div className="seremi-banner-meta">{user.cargo} • {user.sector}</div>
            </div>
          </div>
          <div className="seremi-banner-actions">
            <button className="btn btn-primary" onClick={handleNuevoRegistro}>
              + Nuevo Registro
            </button>
          </div>
        </div>
      )}

      {/* EXPORT BAR (solo admin) */}
      {user.rol === 'admin' && (
        <ExportBar
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onNuevoRegistro={handleNuevoRegistro}
        />
      )}

      {/* PERIOD BAR */}
      <PeriodBar
        selectedPeriod={period}
        onPeriodChange={setPeriod}
      />

      {/* FILTERS (solo admin) */}
      {user.rol === 'admin' && (
        <SectorFilterBar
          selectedSector={sector}
          onSectorChange={setSector}
        />
      )}

      {/* KPIs */}
      <div className="kpi-row">
        {kpis.map((kpi, index) => (
          <div key={index} className="kpi-card" style={{ '--kpi-c': kpi.color } as React.CSSProperties}>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-name">{kpi.name}</div>
            <div className="kpi-delta" style={{ color: kpi.name.includes('críticos') ? 'var(--danger)' : 'var(--accent3)' }}>
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="seremis-header">
        <div className="section-title">Reportes por SEREMI</div>
        <div className="section-count">{filteredData.length} registros</div>
      </div>
      <div className="seremis-grid">
        {filteredData.map(seremi => (
          <div
            key={seremi.id}
            className={`seremi-card ${selectedSeremi === seremi.id ? 'selected' : ''}`}
            onClick={() => selectSeremi(seremi.id)}
          >
            <div className="card-stripe" style={{ background: getSectorColor(seremi.sector) }}></div>
            <div className="card-head">
              <div>
                <div className="card-sector">{seremi.sector}</div>
                <div className="card-name">{seremi.nombre}</div>
                <div className="card-seremi-name">{seremi.seremisNombre}</div>
              </div>
              <div className="card-period">{period}M</div>
            </div>
            <div className="card-metrics">
              <div className="metric">
                <div className="metric-val orange">{seremi.visitas || 0}</div>
                <div className="metric-label">Visitas</div>
              </div>
              <div className="metric">
                <div className="metric-val blue">{seremi.contactos || 0}</div>
                <div className="metric-label">Contactos</div>
              </div>
              <div className="metric">
                <div className="metric-val green">{seremi.prensa || 0}</div>
                <div className="metric-label">Prensa</div>
              </div>
              <div className="metric">
                <div className="metric-val red">{seremi.nudos || 0}</div>
                <div className="metric-label">Nudos</div>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn-sm" onClick={(e) => { e.stopPropagation(); selectSeremi(seremi.id); }}>Ver detalle</button>
              <button 
                className="btn-sm dl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportSeremiPDF(seremi.id);
                }}
              >
                PDF
              </button>
              <button 
                className="btn-sm dlx"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportSeremiExcel(seremi.id);
                }}
              >
                Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL PANEL */}
      {selectedSeremi && selectedSeremiData && (
        <DetailPanel
          seremiId={selectedSeremi}
          seremiNombre={selectedSeremiData.nombre}
          sector={selectedSeremiData.sector}
          periodMonths={period}
          onClose={() => setSelectedSeremi(null)}
          onExportPDF={() => handleExportSeremiPDF(selectedSeremi)}
          onExportExcel={() => handleExportSeremiExcel(selectedSeremi)}
        />
      )}

      {/* PRENSA TABLE */}
      <div className="section-block" style={{ marginTop: '28px' }}>
        <div className="section-block-header">
          <div className="section-block-title">
            <span><Newspaper size={16} /></span> Últimas Apariciones en Prensa
          </div>
          <button className="btn btn-success" onClick={handleExportPrensa}>
            <Download size={14} /> Excel Prensa
          </button>
        </div>
        <PrensaTable data={filteredData} limit={10} />
      </div>

      {/* TEMAS + AGENDA (2 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
        <div className="section-block">
          <div className="section-block-header">
            <div className="section-block-title">
              <span><Lightbulb size={16} /></span> Propuesta de Temas
            </div>
          </div>
          <TemasBlock data={filteredData} limit={10} />
        </div>
        
        <div className="section-block">
          <div className="section-block-header">
            <div className="section-block-title">
              <span><Calendar size={16} /></span> Agenda de Hitos Relevantes
            </div>
            <button className="btn btn-warning" onClick={handleExportAgenda}>
              <Download size={14} /> Excel
            </button>
          </div>
          <AgendaCalendar data={filteredData} />
        </div>
      </div>
    </div>
  );
};