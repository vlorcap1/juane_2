import React from 'react';
import { UrgenciaSelectorProps, TonoSelectorProps } from '../../types/ui';
import './Selectors.css';

/**
 * Selector de Urgencia (Alta/Media/Baja)
 */
export const UrgenciaSelector: React.FC<UrgenciaSelectorProps> = ({ value, onChange }) => {
  const options: Array<'Alta' | 'Media' | 'Baja'> = ['Alta', 'Media', 'Baja'];
  
  return (
    <div className="selector-group">
      {options.map(option => (
        <button
          key={option}
          type="button"
          className={`selector-btn urgencia-${option.toLowerCase()} ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

/**
 * Selector de Tono (Positivo/Neutro/Negativo)
 */
export const TonoSelector: React.FC<TonoSelectorProps> = ({ value, onChange }) => {
  const options: Array<'Positivo' | 'Neutro' | 'Negativo'> = ['Positivo', 'Neutro', 'Negativo'];
  
  return (
    <div className="selector-group">
      {options.map(option => (
        <button
          key={option}
          type="button"
          className={`selector-btn tono-${option.toLowerCase()} ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

/**
 * Selector genérico de opciones
 */
interface GenericSelectorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const GenericSelector: React.FC<GenericSelectorProps> = ({
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`selector-group ${className}`}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          className={`selector-btn ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
