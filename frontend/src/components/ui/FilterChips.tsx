import React from 'react';
import { FilterChipsProps } from '../../types/ui';
import './FilterChips.css';

/**
 * Componente Filter Chips para tabs y filtros
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  activeKey,
  onChange
}) => {
  return (
    <div className="filter-chips">
      {chips.map(chip => (
        <button
          key={chip.key}
          className={`filter-chip ${activeKey === chip.key ? 'active' : ''}`}
          onClick={() => onChange(chip.key)}
        >
          {chip.label}
          {chip.count !== undefined && (
            <span className="filter-chip-count">{chip.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};
