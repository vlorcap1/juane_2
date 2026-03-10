import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import './TabStyles.css';

interface NudosTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const NudosTab: React.FC<NudosTabProps> = () => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Nudos Críticos</div>
          <div className="tab-subtitle">0 registro(s)</div>
        </div>
        <button className="btn btn-primary">
          + Nuevo Nudo
        </button>
      </div>

      <EmptyState
        icon="🚧"
        title="Funcionalidad en desarrollo"
        message="El módulo de Nudos estará disponible próximamente"
      />
    </div>
  );
};
