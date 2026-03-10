/**
 * Hook para gestión de session timeout (auto-logout)
 */
import { useEffect, useCallback, useRef } from 'react';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutos
const WARNING_DURATION = 2 * 60 * 1000; // 2 minutos antes de logout

export const useSessionTimeout = (onLogout: () => void, enabled: boolean = true) => {
  const timeoutRef = useRef<number | null>(null);
  const warningRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (!enabled) return;

    // Warning timer (opcional - se puede usar para mostrar modal de advertencia)
    warningRef.current = window.setTimeout(() => {
      console.log('Session warning: 2 minutes until auto-logout');
      // Aquí se podría mostrar un modal de advertencia
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Logout timer
    timeoutRef.current = window.setTimeout(() => {
      console.log('Session timeout - logging out');
      onLogout();
    }, TIMEOUT_DURATION);
  }, [enabled, onLogout]);

  useEffect(() => {
    if (!enabled) return;

    // Lista de eventos que resetean el timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [enabled, resetTimer]);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current
  };
};
