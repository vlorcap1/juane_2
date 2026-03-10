import { useState, FC } from 'react';
import { useAuth, useSeremis } from '../hooks/useApi';
import Header from '../components/Header';

interface DashboardPageProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardPage: FC<DashboardPageProps> = ({ activeTab, onTabChange }) => {
  const { user, logout, isAdmin } = useAuth();
  const { seremis, loading: seremisLoading } = useSeremis();
  const [activePeriod, setActivePeriod] = useState<number>(12);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Calcular KPIs generales
  const totalSeremis = seremis.length;
  const totalVisitas = seremis.reduce((sum, s) => sum + (s.visitas || 0), 0);
  const totalContactos = seremis.reduce((sum, s) => sum + (s.contactos || 0), 0);
  const totalPrensa = seremis.reduce((sum, s) => sum + (s.prensa || 0), 0);
  const totalProyectos = seremis.reduce((sum, s) => sum + (s.proyectos || 0), 0);

  // Filtrar SEREMIs por filtro activo
  const filteredSeremis = activeFilter === 'all' 
    ? seremis 
    : seremis.filter(s => s.sector === activeFilter);

  const periods = [
    { months: 3, label: '3 meses' },
    { months: 6, label: '6 meses' },
    { months: 12, label: '1 año' },
  ];

  const sectors = [
    { key: 'all', label: 'Todas' },
    { key: 'salud', label: 'Salud' },
    { key: 'educacion', label: 'Educación' },
    { key: 'obras', label: 'Obras Públicas' },
    { key: 'agricultura', label: 'Agricultura' },
    { key: 'vivienda', label: 'Vivienda' },
    { key: 'transporte', label: 'Transportes' },
    { key: 'bienes', label: 'Bienes Nacionales' },
    { key: 'trabajo', label: 'Trabajo' },
    { key: 'medioambiente', label: 'Medio Ambiente' },
    { key: 'energia', label: 'Energía' },
    { key: 'economia', label: 'Economía' },
    { key: 'mineria', label: 'Minería' },
    { key: 'desarrollosocial', label: 'Desarrollo Social' },
    { key: 'justicia', label: 'Justicia' },
    { key: 'interior', label: 'Interior' },
    { key: 'cultura', label: 'Cultura' },
    { key: 'ciencia', label: 'Ciencia' },
    { key: 'deporte', label: 'Deporte' },
    { key: 'mujer', label: 'Mujer' },
  ];

  const currentPeriodLabel = periods.find(p => p.months === activePeriod)?.label || '1 año';

  const handleLogout = () => {
    logout();
  };

  // Mostrar banner de SEREMI si el usuario es SEREMI
  const seremiData = user?.rol === 'seremi' 
    ? seremis.find(s => s.id === user.seremiId) 
    : null;

  return (
    <div className="main-app">
      <Header currentPeriod={currentPeriodLabel} onLogout={handleLogout} user={user} />
      
      {/* Tab Navigation */}
      {isAdmin ? (
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'contrataciones' ? 'active' : ''}`}
            onClick={() => onTabChange('contrataciones')}
          >
            📋 Contrataciones
          </button>
          <button
            className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => onTabChange('usuarios')}
          >
            👥 Usuarios y SEREMIs
          </button>
          <button
            className={`tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
            onClick={() => onTabChange('kpis')}
          >
            📈 KPIs / Indicadores
          </button>
          <button
            className={`tab-btn ${activeTab === 'foro' ? 'active' : ''}`}
            onClick={() => onTabChange('foro')}
          >
            💬 Foro
          </button>
        </div>
      ) : (
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'miseremi' ? 'active' : ''}`}
            onClick={() => onTabChange('miseremi')}
          >
            📋 Mi SEREMI
          </button>
          <button
            className={`tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
            onClick={() => onTabChange('kpis')}
          >
            📈 Mis KPIs
          </button>
          <button
            className={`tab-btn ${activeTab === 'contrataciones' ? 'active' : ''}`}
            onClick={() => onTabChange('contrataciones')}
          >
            📋 Mis Contrataciones
          </button>
          <button
            className={`tab-btn ${activeTab === 'foro' ? 'active' : ''}`}
            onClick={() => onTabChange('foro')}
          >
            💬 Foro
          </button>
        </div>
      )}

      <div className="container">
        {/* SEREMI Banner para usuarios no-admin */}
        {seremiData && (
          <div 
            className="card"
            style={{ 
              padding: '20px 24px',
              marginBottom: '24px',
              background: `linear-gradient(135deg, ${seremiData.c1}, ${seremiData.c2})`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700'
              }}
            >
              {seremiData.nombre.charAt(7) || 'S'}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>
                {seremiData.nombre}
              </h2>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>
                Responsable: {user?.cargo} {user?.nombre} · {user?.email}
              </p>
            </div>
          </div>
        )}

        {/* Period & Filter Controls */}
        {isAdmin && (
          <>
            {/* Period Selector */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text2)' }}>
                PERÍODO
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {periods.map(period => (
                  <button
                    key={period.months}
                    className={`btn ${activePeriod === period.months ? 'btn-primary' : ''}`}
                    onClick={() => setActivePeriod(period.months)}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector Filter */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text2)' }}>
                FILTRO POR SECTOR
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '6px',
                maxWidth: '800px'
              }}>
                {sectors.map(sector => (
                  <button
                    key={sector.key}
                    className={`btn ${activeFilter === sector.key ? 'btn-primary' : ''}`}
                    onClick={() => setActiveFilter(sector.key)}
                    style={{ fontSize: '10px', padding: '4px 8px' }}
                  >
                    {sector.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* KPIs Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '14px', 
          marginBottom: '26px' 
        }}>
          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                background: 'var(--accent2)', 
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                🏛️
              </div>
              <div>
                <div style={{ 
                  fontFamily: '"DM Serif Display", serif', 
                  fontSize: '32px', 
                  lineHeight: '1' 
                }}>
                  {totalSeremis}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'var(--text3)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.07em', 
                  marginTop: '3px' 
                }}>
                  SEREMIs
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                background: 'var(--accent)', 
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                🏢
              </div>
              <div>
                <div style={{ 
                  fontFamily: '"DM Serif Display", serif', 
                  fontSize: '32px', 
                  lineHeight: '1' 
                }}>
                  {totalVisitas.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'var(--text3)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.07em', 
                  marginTop: '3px' 
                }}>
                  Visitas
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                background: 'var(--accent3)', 
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                👥
              </div>
              <div>
                <div style={{ 
                  fontFamily: '"DM Serif Display", serif', 
                  fontSize: '32px', 
                  lineHeight: '1' 
                }}>
                  {totalContactos.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'var(--text3)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.07em', 
                  marginTop: '3px' 
                }}>
                  Contactos
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                background: '#e85454', 
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                📰
              </div>
              <div>
                <div style={{ 
                  fontFamily: '"DM Serif Display", serif', 
                  fontSize: '32px', 
                  lineHeight: '1' 
                }}>
                  {totalPrensa.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'var(--text3)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.07em', 
                  marginTop: '3px' 
                }}>
                  Prensa
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                background: '#2ec4a5', 
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                📊
              </div>
              <div>
                <div style={{ 
                  fontFamily: '"DM Serif Display", serif', 
                  fontSize: '32px', 
                  lineHeight: '1' 
                }}>
                  {totalProyectos.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: 'var(--text3)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.07em', 
                  marginTop: '3px' 
                }}>
                  Proyectos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEREMIs Grid */}
        {seremisLoading ? (
          <div className="loading">Cargando SEREMIs...</div>
        ) : (
          <>
            <h2 style={{ 
              fontSize: '18px', 
              marginBottom: '16px', 
              color: 'var(--text)',
              fontFamily: '"DM Serif Display", serif'
            }}>
              {isAdmin ? `SEREMIs (${filteredSeremis.length})` : 'Información General'}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {filteredSeremis.map(seremi => (
                <div key={seremi.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: `linear-gradient(135deg, ${seremi.c1}, ${seremi.c2})`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#fff'
                      }}
                    >
                      {seremi.nombre.charAt(7) || 'S'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                        {seremi.nombre}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text3)' }}>
                        {seremi.seremiName || seremi.sector}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '8px',
                    fontSize: '11px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text3)' }}>Visitas:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: '600' }}>
                        {(seremi.visitas || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text3)' }}>Contactos:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: '600' }}>
                        {(seremi.contactos || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text3)' }}>Prensa:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: '600' }}>
                        {(seremi.prensa || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text3)' }}>Proyectos:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: '600' }}>
                        {(seremi.proyectos || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
