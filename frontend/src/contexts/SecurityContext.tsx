/**
 * Security Context Provider
 * Provee funcionalidades de seguridad para toda la app
 */
import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { sanitizeInput, escapeHtml, escapeAttribute } from '../utils/security';

interface SecurityContextType {
  sanitize: (input: string) => string;
  escapeHtml: (text: string) => string;
  escapeAttribute: (text: string) => string;
  isValidEmail: (email: string) => boolean;
  isValidUrl: (url: string) => boolean;
  checkCSRF: () => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const sanitize = useCallback((input: string): string => {
    return sanitizeInput(input);
  }, []);

  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }, []);

  const checkCSRF = useCallback((): boolean => {
    // Verificar que existe un token CSRF
    const token = localStorage.getItem('token');
    return !!token;
  }, []);

  const value: SecurityContextType = {
    sanitize,
    escapeHtml,
    escapeAttribute,
    isValidEmail,
    isValidUrl,
    checkCSRF
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
