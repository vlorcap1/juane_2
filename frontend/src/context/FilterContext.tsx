/**
 * Context Provider para filtros del Dashboard (período y sector)
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardFilters } from '../types/dashboard';

interface FilterContextType {
  filters: DashboardFilters;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  period: number;
  setPeriod: (months: number) => void;
  sector: string;
  setSector: (sector: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};

const DEFAULT_FILTERS: DashboardFilters = {
  period: 12,
  sector: 'all'
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFiltersState] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const setFilters = (partial: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...partial
    }));
  };

  const setPeriod = (months: number) => {
    setFilters({ period: months });
  };

  const setSector = (sector: string) => {
    setFilters({ sector });
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  const value: FilterContextType = {
    filters,
    setFilters,
    period: filters.period,
    setPeriod,
    sector: filters.sector,
    setSector,
    resetFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
