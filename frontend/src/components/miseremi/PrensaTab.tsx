import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import './TabStyles.css';

interface PrensaTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const PrensaTab: React.FC<PrensaTabProps> = () => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Apariciones en Prensa</div>
          <div className="tab-subtitle">0 registro(s)</div>
        </div>
        <button className="btn btn-primary">
          + Nueva Prensa
        </button>
      </div>

      <EmptyState
        icon="📰"
        title="Funcionalidad en desarrollo"
        message="El módulo de Prensa estará disponible próximamente"
      />
    </div>
  );
};
