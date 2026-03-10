/**
 * Utilidades para manejo de fechas
 */

// Formatear tiempo relativo como en el original
export const formatRelativeTime = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr.replace(' ', 'T'));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('es-CL', { 
    day: '2-digit', 
    month: 'short' 
  });
};

// Formatear fecha para mostrar
export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Formatear fecha y hora
export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Obtener fecha actual en formato YYYY-MM-DD
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Convertir fecha para input HTML
export const formatDateForInput = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Obtener primera fecha del período (usada en filtros)
export const getFirstDateOfPeriod = (months: number): string => {
  const now = new Date();
  const firstDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  return firstDate.toISOString().split('T')[0];
};

// Formatear fecha completa estilo "Lun 15 Ene 2025"
export const fmtDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dia = dias[date.getDay()];
    const dd = date.getDate();
    const mes = meses[date.getMonth()];
    const yyyy = date.getFullYear();
    
    return `${dia} ${dd} ${mes} ${yyyy}`;
  } catch {
    return dateStr;
  }
};

// Formatear fecha corta "15 Ene 2025"
export const fmtDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dd = date.getDate();
    const mes = meses[date.getMonth()];
    const yyyy = date.getFullYear();
    
    return `${dd} ${mes} ${yyyy}`;
  } catch {
    return dateStr;
  }
};

// Calcular rango de período para mostrar en UI
export const calculatePeriodRange = (months: number): { desde: string; hasta: string } => {
  const now = new Date();
  const hasta = now;
  const desde = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  
  return {
    desde: fmtDateShort(desde.toISOString()),
    hasta: fmtDateShort(hasta.toISOString())
  };
};

// Obtener fecha límite para proyectos/agenda (permite fechas futuras)
export const getFutureDate = (months: number = 12): string => {
  const now = new Date();
  const futureDate = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
  return futureDate.toISOString().split('T')[0];
};

// Formatear fecha ISO a formato display "DD/MM/YYYY"
export const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
};