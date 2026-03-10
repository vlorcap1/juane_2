import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import './TabStyles.css';

interface AgendaTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const AgendaTab: React.FC<AgendaTabProps> = () => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Agenda de Eventos</div>
          <div className="tab-subtitle">0 registro(s)</div>
        </div>
        <button className="btn btn-primary">
          + Nuevo Evento
        </button>
      </div>

      <EmptyState
        icon="📅"
        title="Funcionalidad en desarrollo"
        message="El módulo de Agenda estará disponible próximamente"
      />
    </div>
  );
};
