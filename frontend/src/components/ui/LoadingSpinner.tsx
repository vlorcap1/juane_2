import React from 'react';
import { LoadingSpinnerProps } from '../../types/ui';
import './LoadingSpinner.css';

/**
 * Componente Loading Spinner
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false
}) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner spinner-${size}`}>
          <div className="spinner-circle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`spinner spinner-${size}`}>
        <div className="spinner-circle"></div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader para tablas
 */
export const SkeletonRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <div className="skeleton-row">
    {Array.from({ length: columns }).map((_, i) => (
      <div key={i} className="skeleton-cell"></div>
    ))}
  </div>
);

/**
 * Skeleton loader para cards
 */
export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-header"></div>
    <div className="skeleton-body">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  </div>
);
