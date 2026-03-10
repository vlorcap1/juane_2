/**
 * Tipos para componentes UI reutilizables
 */

// ============================================
// BADGES
// ============================================
export type BadgeVariant = 
  | 'admin' 
  | 'seremi' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'positivo'
  | 'neutro'
  | 'negativo'
  | 'alta'
  | 'media'
  | 'baja'
  | 'pendiente'
  | 'aprobada';

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// ============================================
// TOAST
// ============================================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

// ============================================
// MODAL
// ============================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOutsideClick?: boolean;
}

// ============================================
// FILTER CHIPS
// ============================================
export interface FilterChip {
  key: string;
  label: string;
  count?: number;
}

export interface FilterChipsProps {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}

// ============================================
// EMPTY STATE
// ============================================
export interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================
// LOADING
// ============================================
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

// ============================================
// SELECTORES
// ============================================
export interface Option {
  value: string;
  label: string;
}

export interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface UrgenciaSelectorProps {
  value: 'Alta' | 'Media' | 'Baja';
  onChange: (value: 'Alta' | 'Media' | 'Baja') => void;
}

export interface TonoSelectorProps {
  value: 'Positivo' | 'Neutro' | 'Negativo';
  onChange: (value: 'Positivo' | 'Neutro' | 'Negativo') => void;
}

// ============================================
// TABLA
// ============================================
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}
