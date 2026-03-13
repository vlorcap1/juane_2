import React from 'react';
import { ClipboardList } from 'lucide-react';
import { EmptyStateProps } from '../../types/ui';
import './EmptyState.css';

/**
 * Componente para mostrar estados vacíos de manera consistente
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <ClipboardList size={32} />,
  title,
  message,
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};
