import React from 'react';
import { EmptyState } from '../ui/EmptyState';
import './TabStyles.css';

interface ContactosTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const ContactosTab: React.FC<ContactosTabProps> = () => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Contactos en Eventos</div>
          <div className="tab-subtitle">0 registro(s)</div>
        </div>
        <button className="btn btn-primary">
          + Nuevo Contacto
        </button>
      </div>

      <EmptyState
        icon="👤"
        title="Funcionalidad en desarrollo"
        message="El módulo de Contactos estará disponible próximamente"
      />
    </div>
  );
};
