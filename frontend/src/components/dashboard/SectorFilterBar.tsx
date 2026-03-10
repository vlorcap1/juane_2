import React from 'react';
import './SectorFilterBar.css';

interface SectorFilterBarProps {
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  counts?: { [key: string]: number };
}

const SECTORS = [
  { key: 'all', label: 'Todos' },
  { key: 'salud', label: 'Salud' },
  { key: 'educacion', label: 'Educación' },
  { key: 'obras', label: 'MOP' },
  { key: 'agricultura', label: 'Agricultura' },
  { key: 'vivienda', label: 'Vivienda' },
  { key: 'transporte', label: 'Transporte' },
  { key: 'bienes', label: 'Bienes Nacionales' },
  { key: 'trabajo', label: 'Trabajo' },
  { key: 'medioambiente', label: 'Medio Ambiente' },
  { key: 'energia', label: 'Energía' },
  { key: 'economia', label: 'Economía' },
  { key: 'mineria', label: 'Minería' },
  { key: 'desarrollosocial', label: 'Des. Social' },
  { key: 'justicia', label: 'Justicia' },
  { key: 'interior', label: 'Interior' },
  { key: 'cultura', label: 'Cultura' },
  { key: 'ciencia', label: 'Ciencia' },
  { key: 'deporte', label: 'Deporte' },
  { key: 'mujer', label: 'Mujer' }
];

export const SectorFilterBar: React.FC<SectorFilterBarProps> = ({
  selectedSector,
  onSectorChange,
  counts
}) => {
  return (
    <div className="sector-filter-bar">
      <span className="filter-label">Sector</span>
      <div className="filter-group">
        {SECTORS.map(sector => {
          const count = counts?.[sector.key];
          const hasCount = count !== undefined && sector.key !== 'all';

          return (
            <div
              key={sector.key}
              className={`f-chip ${selectedSector === sector.key ? 'active' : ''}`}
              onClick={() => onSectorChange(sector.key)}
            >
              {sector.label}
              {hasCount && <span className="f-chip-count">{count}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SECTORS };
