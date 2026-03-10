/**
 * Tipos para el Dashboard
 */

// ============================================
// KPIs
// ============================================
export interface KPIData {
  label: string;
  value: number;
  icon: string;
  color?: string;
}

// ============================================
// PERÍODO
// ============================================
export interface Period {
  months: number;
  label: string;
}

export interface PeriodRange {
  desde: string;
  hasta: string;
  label: string;
}

// ============================================
// FILTROS
// ============================================
export interface SectorFilter {
  key: string;
  label: string;
}

export interface DashboardFilters {
  period: number;
  sector: string;
}

// ============================================
// DETALLE DE SEREMI
// ============================================
export interface SeremiDetalle {
  id: string;
  nombre: string;
  sector: string;
  proyectosDestacados: any[];
  nudosCriticos: any[];
  agendaProxima: any[];
  prensaReciente: any[];
  comunasVisitadas: string[];
}

// ============================================
// EXPORTACIÓN
// ============================================
export interface ExportOptions {
  type: 'pdf' | 'excel';
  scope: 'single' | 'all' | 'prensa' | 'agenda' | 'contrataciones';
  seremiId?: string;
}
