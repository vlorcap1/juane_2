import React from 'react';
import './PeriodBar.css';

interface PeriodBarProps {
  selectedPeriod: number;
  onPeriodChange: (months: number) => void;
  startDate?: Date;
  endDate?: Date;
}

export const PeriodBar: React.FC<PeriodBarProps> = ({
  selectedPeriod,
  onPeriodChange,
  startDate,
  endDate
}) => {
  const periods = [
    { months: 1, label: '1 mes' },
    { months: 3, label: '3 meses' },
    { months: 6, label: '6 meses' },
    { months: 12, label: '1 año' },
    { months: 24, label: '2 años' }
  ];

  const getPeriodRangeDisplay = () => {
    const end = endDate || new Date();
    const start = startDate || (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - selectedPeriod);
      return d;
    })();

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        year: 'numeric' 
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="period-bar">
      <span className="period-bar-label">Período</span>
      <div className="period-chips">
        {periods.map(period => (
          <div
            key={period.months}
            className={`p-chip ${selectedPeriod === period.months ? 'active' : ''}`}
            onClick={() => onPeriodChange(period.months)}
          >
            {period.label}
          </div>
        ))}
      </div>
      <div className="period-range-display">{getPeriodRangeDisplay()}</div>
    </div>
  );
};
