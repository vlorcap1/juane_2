/**
 * Utilidades para formateo de datos
 */

// ============================================
// FORMATEO DE MONTOS
// ============================================

/**
 * Formatear monto a pesos chilenos "$1.500.000"
 */
export const formatMoney = (amount: number | string): string => {
  if (amount === null || amount === undefined) return '$0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0';
  
  return '$' + num.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Parsear string de monto a número
 */
export const parseMoney = (moneyStr: string): number => {
  if (!moneyStr) return 0;
  
  // Remover símbolos y espacios
  const cleaned = moneyStr.replace(/[$.\s]/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
};

// ============================================
// FORMATEO DE NÚMEROS
// ============================================

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (num: number | string): string => {
  if (num === null || num === undefined) return '0';
  
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  
  return n.toLocaleString('es-CL');
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  return value.toFixed(decimals) + '%';
};

// ============================================
// ICONOS DE ARCHIVOS
// ============================================

/**
 * Obtener emoji de icono según extensión de archivo
 */
export const getFileIcon = (fileName: string): string => {
  if (!fileName) return '📄';
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: { [key: string]: string } = {
    // Documentos
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'txt': '📄',
    'rtf': '📄',
    
    // Hojas de cálculo
    'xls': '📗',
    'xlsx': '📗',
    'csv': '📊',
    
    // Presentaciones
    'ppt': '📙',
    'pptx': '📙',
    
    // Imágenes
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'bmp': '🖼️',
    'svg': '🖼️',
    
    // Archivos comprimidos
    'zip': '🗜️',
    'rar': '🗜️',
    '7z': '🗜️',
    'tar': '🗜️',
    'gz': '🗜️',
    
    // Videos
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬',
    'wmv': '🎬',
    
    // Audio
    'mp3': '🎵',
    'wav': '🎵',
    'flac': '🎵',
    
    // Código
    'js': '📜',
    'ts': '📜',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'html': '🌐',
    'css': '🎨',
    
    // Otros
    'exe': '⚙️',
    'dll': '⚙️',
  };
  
  return iconMap[ext || ''] || '📎';
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (!bytes) return '';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// ============================================
// FORMATEO DE TEXTO
// ============================================

/**
 * Capitalizar primera letra
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncar texto con ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Pluralizar texto simple
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
};

// ============================================
// FORMATEO DE RUT
// ============================================

/**
 * Formatear RUT chileno "12.345.678-9"
 */
export const formatRUT = (rut: string): string => {
  if (!rut) return '';
  
  // Limpiar RUT
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return cleaned;
  
  // Separar dígito verificador
  const dv = cleaned.slice(-1);
  const nums = cleaned.slice(0, -1);
  
  // Agregar puntos cada 3 dígitos
  const formatted = nums.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted}-${dv}`;
};

/**
 * Limpiar RUT (remover formato)
 */
export const cleanRUT = (rut: string): string => {
  if (!rut) return '';
  return rut.replace(/[^0-9kK]/g, '');
};

// ============================================
// COLORES Y ESTILOS
// ============================================

/**
 * Obtener color según tono de prensa
 */
export const getTonoColor = (tono: string): string => {
  const colors: { [key: string]: string } = {
    'Positivo': '#4caf50',
    'Neutro': '#ff9800',
    'Negativo': '#f44336'
  };
  
  return colors[tono] || '#9e9e9e';
};

/**
 * Obtener color según urgencia
 */
export const getUrgenciaColor = (urgencia: string): string => {
  const colors: { [key: string]: string } = {
    'Alta': '#f44336',
    'Media': '#ff9800',
    'Baja': '#4caf50'
  };
  
  return colors[urgencia] || '#9e9e9e';
};

/**
 * Obtener color según estado indicador
 */
export const getIndicadorColor = (porcentaje: number): string => {
  if (porcentaje >= 90) return '#4caf50'; // Verde - En meta
  if (porcentaje >= 60) return '#ff9800'; // Amarillo - En riesgo
  return '#f44336'; // Rojo - Bajo meta
};

/**
 * Obtener color por sector
 */
export const getSectorColor = (sector: string | null | undefined): string => {
  if (!sector) return '#666666';
  
  const sectorColors: { [key: string]: string } = {
    'salud': '#ff4444',
    'educacion': '#0066cc',
    'obras': '#ff8800',
    'agricultura': '#00aa00',
    'vivienda': '#9933cc',
    'trabajo': '#cc6600',
    'desarrollo': '#0099cc',
    'transporte': '#cc0066',
    'energia': '#ffcc00',
    'mineria': '#666666',
    'economia': '#009900',
    'bienes': '#cc3366',
    'medio': '#33cc33',
    'justicia': '#000099',
    'interior': '#990000',
    'cultura': '#cc00cc',
    'ciencia': '#0066ff',
    'deporte': '#ff6600',
    'mujer': '#cc0099',
    'segpres': '#003366'
  };
  
  return sectorColors[sector.toLowerCase()] || '#666666';
};
