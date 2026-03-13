import React from 'react';
import { BarChart2, Award, ClipboardList, Users, MessageSquare, Leaf, Newspaper } from 'lucide-react';

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
          <BarChart2 size={15} /> Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'autoridades' ? 'active' : ''}`}
          onClick={() => onTabChange('autoridades')}
        >
          <Award size={15} /> Visitas Autoridades
        </button>
        <button
          className={`tab-btn ${activeTab === 'contrataciones' ? 'active' : ''}`}
          onClick={() => onTabChange('contrataciones')}
        >
          <ClipboardList size={15} /> Contrataciones
        </button>
        <button
          className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => onTabChange('usuarios')}
        >
          <Users size={15} /> Usuarios y SEREMIs
        </button>
        <button
          className={`tab-btn ${activeTab === 'foro' ? 'active' : ''}`}
          onClick={() => onTabChange('foro')}
        >
          <MessageSquare size={15} /> Foro
        </button>
        <button
          className={`tab-btn ${activeTab === 'seia' ? 'active' : ''}`}
          onClick={() => onTabChange('seia')}
        >
          <Leaf size={15} /> SEIA Proyectos
        </button>
        <button
          className={`tab-btn ${activeTab === 'noticias' ? 'active' : ''}`}
          onClick={() => onTabChange('noticias')}
        >
          <Newspaper size={15} /> Noticias RSS
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
          <BarChart2 size={15} /> Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'miseremi' ? 'active' : ''}`}
          onClick={() => onTabChange('miseremi')}
        >
          <ClipboardList size={15} /> Mi SEREMI
        </button>
        <button
          className={`tab-btn ${activeTab === 'autoridades' ? 'active' : ''}`}
          onClick={() => onTabChange('autoridades')}
        >
          <Award size={15} /> Visitas Autoridades
        </button>
        <button
          className={`tab-btn ${activeTab === 'contrataciones' ? 'active' : ''}`}
          onClick={() => onTabChange('contrataciones')}
        >
          <ClipboardList size={15} /> Mis Contrataciones
        </button>
        <button
          className={`tab-btn ${activeTab === 'foro' ? 'active' : ''}`}
          onClick={() => onTabChange('foro')}
        >
          <MessageSquare size={15} /> Foro
        </button>
        <button
          className={`tab-btn ${activeTab === 'seia' ? 'active' : ''}`}
          onClick={() => onTabChange('seia')}
        >
          <Leaf size={15} /> SEIA Proyectos
        </button>
      </div>
    );
  }
};
