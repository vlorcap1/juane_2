import React from 'react';

interface TabNavigationProps {
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ user, activeTab, onTabChange }) => {
  if (user.rol === 'admin') {
    return (
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'autoridades' ? 'active' : ''}`}
          onClick={() => onTabChange('autoridades')}
        >
          🎖️ Visitas Autoridades
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
        <button
          className={`tab-btn ${activeTab === 'seia' ? 'active' : ''}`}
          onClick={() => onTabChange('seia')}
        >
          🌿 SEIA Proyectos
        </button>
      </div>
    );
  } else {
    return (
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
          className={`tab-btn ${activeTab === 'autoridades' ? 'active' : ''}`}
          onClick={() => onTabChange('autoridades')}
        >
          🎖️ Visitas Autoridades
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
        <button
          className={`tab-btn ${activeTab === 'seia' ? 'active' : ''}`}
          onClick={() => onTabChange('seia')}
        >
          🌿 SEIA Proyectos
        </button>
      </div>
    );
  }
};