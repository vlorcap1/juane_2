/**
 * Utilidades para validación de datos
 */

// ============================================
// VALIDACIÓN DE RUT CHILENO
// ============================================

/**
 * Validar RUT chileno
 */
export const validateRUT = (rut: string): boolean => {
  if (!rut) return false;
  
  // Limpiar RUT
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return false;
  
  // Separar cuerpo y dígito verificador
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  let calculatedDV: string;
  
  if (expectedDV === 11) {
    calculatedDV = '0';
  } else if (expectedDV === 10) {
    calculatedDV = 'K';
  } else {
    calculatedDV = expectedDV.toString();
  }
  
  return dv === calculatedDV;
};

/**
 * Calcular dígito verificador de RUT
 */
export const calculateRUTDV = (rut: string): string => {
  if (!rut) return '';
  
  const cleaned = rut.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  
  if (expectedDV === 11) return '0';
  if (expectedDV === 10) return 'K';
  return expectedDV.toString();
};

// ============================================
// VALIDACIÓN DE EMAIL
// ============================================

/**
 * Validar formato de email
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// VALIDACIÓN DE TELÉFONO
// ============================================

/**
 * Validar teléfono chileno (formato flexible)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Opcional
  
  // Limpiar formato
  const cleaned = phone.replace(/[^0-9+]/g, '');
  
  // Aceptar:
  // - 9 dígitos (móvil sin +56)
  // - 8 dígitos (fijo)
  // - 11 dígitos (+56 9 XXXXXXXX)
  // - 13 dígitos (+56 X XXXX XXXX)
  const length = cleaned.length;
  
  return length >= 8 && length <= 13;
};

/**
 * Formatear teléfono chileno
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  // Móvil: 9 XXXX XXXX
  if (cleaned.length === 9 && cleaned[0] === '9') {
    return `${cleaned[0]} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
  }
  
  // Fijo: XX XXXX XXXX
  if (cleaned.length === 9 && cleaned[0] !== '9') {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

// ============================================
// VALIDACIÓN DE FECHAS
// ============================================

/**
 * Validar que una fecha sea válida
 */
export const validateDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validar que fecha esté en rango
 */
export const validateDateRange = (
  dateStr: string,
  minDate?: string,
  maxDate?: string
): boolean => {
  if (!validateDate(dateStr)) return false;
  
  const date = new Date(dateStr);
  
  if (minDate) {
    const min = new Date(minDate);
    if (date < min) return false;
  }
  
  if (maxDate) {
    const max = new Date(maxDate);
    if (date > max) return false;
  }
  
  return true;
};

/**
 * Validar que fecha no sea futura
 */
export const validatePastDate = (dateStr: string): boolean => {
  if (!validateDate(dateStr)) return false;
  
  const date = new Date(dateStr);
  const now = new Date();
  
  return date <= now;
};

// ============================================
// VALIDACIÓN DE NÚMEROS
// ============================================

/**
 * Validar que sea un número positivo
 */
export const validatePositiveNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Validar rango numérico
 */
export const validateNumberRange = (
  value: string | number,
  min?: number,
  max?: number
): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return false;
  
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
};

// ============================================
// VALIDACIÓN DE STRINGS
// ============================================

/**
 * Validar longitud mínima
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  if (!value) return false;
  return value.trim().length >= minLength;
};

/**
 * Validar longitud máxima
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  if (!value) return true;
  return value.length <= maxLength;
};

/**
 * Validar que no esté vacío
 */
export const validateRequired = (value: string | number | boolean): boolean => {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return !isNaN(value);
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

// ============================================
// VALIDACIÓN DE ARCHIVOS
// ============================================

/**
 * Validar extensión de archivo
 */
export const validateFileExtension = (
  fileName: string,
  allowedExtensions: string[]
): boolean => {
  if (!fileName) return false;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return false;
  
  return allowedExtensions.map(e => e.toLowerCase()).includes(ext);
};

/**
 * Validar tamaño de archivo
 */
export const validateFileSize = (fileSize: number, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

/**
 * Extensiones comunes permitidas
 */
export const ALLOWED_FILE_EXTENSIONS = {
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  all: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar']
};

// ============================================
// VALIDACIÓN DE USERNAME
// ============================================

/**
 * Validar formato de username (solo letras, números, guiones y guiones bajos)
 */
export const validateUsername = (username: string): boolean => {
  if (!username) return false;
  
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

// ============================================
// VALIDACIÓN DE PASSWORD
// ============================================

/**
 * Validar fortaleza de contraseña
 */
export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('La contraseña es requerida');
    return { valid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('Debe tener al menos 6 caracteres');
  }
  
  // Estas reglas son opcionales, se pueden ajustar
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Debe tener al menos una mayúscula');
  // }
  
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Debe tener al menos un número');
  // }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ============================================
// VALIDACIÓN DE URL
// ============================================

/**
 * Validar formato de URL
 */
export const validateURL = (url: string): boolean => {
  if (!url) return true; // Opcional
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
