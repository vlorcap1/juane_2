import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import './TabStyles.css';

interface TemasTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const TemasTab: React.FC<TemasTabProps> = () => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Temas de Agenda</div>
          <div className="tab-subtitle">0 registro(s)</div>
        </div>
        <button className="btn btn-primary">
          + Nuevo Tema
        </button>
      </div>

      <EmptyState
        icon="💡"
        title="Funcionalidad en desarrollo"
        message="El módulo de Temas estará disponible próximamente"
      />
    </div>
  );
};
