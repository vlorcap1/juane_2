import React from 'react';
import { BadgeProps } from '../../types/ui';
import './Badge.css';

/**
 * Componente Badge reutilizable con múltiples variantes
 */
export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

// Variantes específicas para uso común
export const AdminBadge: React.FC<{ className?: string }> = ({ className }) => (
  <Badge variant="admin" className={className}>Admin</Badge>
);

export const SeremiBadge: React.FC<{ className?: string }> = ({ className }) => (
  <Badge variant="seremi" className={className}>SEREMI</Badge>
);

export const UrgenciaBadge: React.FC<{ urgencia: 'Alta' | 'Media' | 'Baja'; className?: string }> = 
  ({ urgencia, className }) => (
    <Badge variant={urgencia.toLowerCase() as any} className={className}>
      {urgencia}
    </Badge>
  );

export const TonoBadge: React.FC<{ tono: 'Positivo' | 'Neutro' | 'Negativo'; className?: string }> = 
  ({ tono, className }) => (
    <Badge variant={tono.toLowerCase() as any} className={className}>
      {tono}
    </Badge>
  );

export const EstadoContratacionBadge: React.FC<{ estado: 'Pendiente' | 'Aprobada'; className?: string }> = 
  ({ estado, className }) => (
    <Badge variant={estado.toLowerCase() as any} className={className}>
      {estado}
    </Badge>
  );
