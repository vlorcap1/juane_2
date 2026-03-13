import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ModalProps } from '../../types/ui';
import './Modal.css';

/**
 * Componente Modal reutilizable
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div ref={modalRef} className={`modal-container modal-${size}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Botones estándar para modales
interface ModalButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  loading?: boolean;
}

export const ModalButtons: React.FC<ModalButtonsProps> = ({
  onCancel,
  onConfirm,
  confirmText = 'Guardar',
  cancelText = 'Cancelar',
  confirmDisabled = false,
  loading = false
}) => (
  <div className="modal-buttons">
    <button 
      type="button"
      className="btn-secondary" 
      onClick={onCancel}
      disabled={loading}
    >
      {cancelText}
    </button>
    <button 
      type="button"
      className="btn-primary" 
      onClick={onConfirm}
      disabled={confirmDisabled || loading}
    >
      {loading ? 'Guardando...' : confirmText}
    </button>
  </div>
);
