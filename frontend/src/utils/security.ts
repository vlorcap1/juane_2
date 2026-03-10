/**
 * Utilidades para seguridad y sanitización
 */

// ============================================
// PREVENCIÓN DE XSS
// ============================================

/**
 * Escapar HTML para prevenir XSS
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Escapar atributos HTML
 */
export const escapeAttribute = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Sanitizar input removiendo scripts
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remover tags de script
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remover event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remover javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remover data: URLs (pueden contener scripts)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  return sanitized;
};

/**
 * Validar y sanitizar URL
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  // Remover javascript: y data: URLs
  if (url.toLowerCase().startsWith('javascript:') || 
      url.toLowerCase().startsWith('data:')) {
    return '';
  }
  
  // Whitelist de protocolos seguros
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const parsed = new URL(url);
    if (!safeProtocols.includes(parsed.protocol)) {
      return '';
    }
    return url;
  } catch {
    // URL relativa o inválida
    return url.replace(/[<>"']/g, '');
  }
};

// ============================================
// SANITIZACIÓN DE DATOS DE FORMULARIO
// ============================================

/**
 * Sanitizar string de formulario
 */
export const sanitizeFormString = (value: string): string => {
  if (!value) return '';
  
  // Trim y normalizar espacios múltiples
  let sanitized = value.trim().replace(/\s+/g, ' ');
  
  // Remover caracteres de control (excepto saltos de línea y tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

/**
 * Sanitizar texto largo (con saltos de línea)
 */
export const sanitizeTextarea = (value: string): string => {
  if (!value) return '';
  
  // Normalizar saltos de línea
  let sanitized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Limitar saltos de línea consecutivos
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');
  
  // Trim inicio y fin
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Sanitizar número de formulario
 */
export const sanitizeNumber = (value: string): string => {
  if (!value) return '';
  
  // Remover todo excepto dígitos, punto y signo negativo
  return value.replace(/[^0-9.-]/g, '');
};

// ============================================
// VALIDACIÓN DE ARCHIVO SEGURO
// ============================================

/**
 * Validar que el nombre de archivo sea seguro
 */
export const validateSafeFileName = (fileName: string): boolean => {
  if (!fileName) return false;
  
  // No permitir path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }
  
  // No permitir caracteres especiales peligrosos
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    return false;
  }
  
  // No permitir nombres reservados de Windows
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = fileName.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return false;
  }
  
  return true;
};

/**
 * Sanitizar nombre de archivo
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return 'archivo';
  
  // Reemplazar caracteres peligrosos
  let safe = fileName
    .replace(/[<>:"|?*\x00-\x1f]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[/\\]/g, '_');
  
  // Limitar longitud
  const maxLength = 255;
  if (safe.length > maxLength) {
    const ext = safe.split('.').pop();
    const name = safe.substring(0, maxLength - (ext ? ext.length + 1 : 0));
    safe = ext ? `${name}.${ext}` : name;
  }
  
  return safe || 'archivo';
};

// ============================================
// TOKENS Y CSRF
// ============================================

/**
 * Generar un token aleatorio
 */
export const generateToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Usar crypto.getRandomValues si está disponible
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback a Math.random (menos seguro)
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return token;
};

/**
 * Generar UUID v4
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback manual
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ============================================
// DETECCIÓN DE CONTENIDO MALICIOSO
// ============================================

/**
 * Detectar posibles ataques SQL injection en string
 * (Nota: Esto es solo detección frontend, el backend debe validar apropiadamente)
 */
export const detectSQLInjection = (input: string): boolean => {
  if (!input) return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\|\||;|\/\*|\*\/)/,
    /(\bOR\b.*=.*\b|1=1|'=')/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Detectar posibles intentos de path traversal
 */
export const detectPathTraversal = (input: string): boolean => {
  if (!input) return false;
  
  const traversalPatterns = [
    /\.\./,
    /%2e%2e/i,
    /\.\.%2f/i,
    /%2e%2e%2f/i
  ];
  
  return traversalPatterns.some(pattern => pattern.test(input));
};

// ============================================
// RATE LIMITING (CLIENT-SIDE)
// ============================================

/**
 * Simple rate limiter para acciones del usuario
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minuto
  ) {}
  
  /**
   * Verificar si una acción está permitida
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar intentos dentro de la ventana
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Registrar nuevo intento
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  /**
   * Resetear intentos para una clave
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * Limpiar intentos antiguos
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, attempts] of this.attempts.entries()) {
      const recent = attempts.filter(time => now - time < this.windowMs);
      
      if (recent.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recent);
      }
    }
  }
}
