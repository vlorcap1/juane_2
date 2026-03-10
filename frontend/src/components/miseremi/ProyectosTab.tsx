import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import './TabStyles.css';

interface ProyectosTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const ProyectosTab: React.FC<ProyectosTabProps> = () => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Proyectos Ministeriales</div>
          <div className="tab-subtitle">0 registro(s)</div>
        </div>
        <button className="btn btn-primary">
          + Nuevo Proyecto
        </button>
      </div>

      <EmptyState
        icon="🏗️"
        title="Funcionalidad en desarrollo"
        message="El módulo de Proyectos estará disponible próximamente"
      />
    </div>
  );
};
