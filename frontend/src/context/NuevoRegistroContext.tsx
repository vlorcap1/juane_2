/**
 * Context Provider para estado de modal Nuevo Registro
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RecordType } from '../types/records';

interface NuevoRegistroContextType {
  isOpen: boolean;
  recordType: RecordType | null;
  seremiId: string | null;
  openModal: (type?: RecordType, seremiId?: string) => void;
  closeModal: () => void;
  setRecordType: (type: RecordType) => void;
}

const NuevoRegistroContext = createContext<NuevoRegistroContextType | undefined>(undefined);

export const useNuevoRegistro = (): NuevoRegistroContextType => {
  const context = useContext(NuevoRegistroContext);
  if (!context) {
    throw new Error('useNuevoRegistro must be used within NuevoRegistroProvider');
  }
  return context;
};

interface NuevoRegistroProviderProps {
  children: ReactNode;
}

export const NuevoRegistroProvider: React.FC<NuevoRegistroProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recordType, setRecordType] = useState<RecordType | null>(null);
  const [seremiId, setSeremiId] = useState<string | null>(null);

  const openModal = (type?: RecordType, id?: string) => {
    setIsOpen(true);
    if (type) setRecordType(type);
    if (id) setSeremiId(id);
  };

  const closeModal = () => {
    setIsOpen(false);
    setRecordType(null);
    setSeremiId(null);
  };

  const value: NuevoRegistroContextType = {
    isOpen,
    recordType,
    seremiId,
    openModal,
    closeModal,
    setRecordType
  };

  return (
    <NuevoRegistroContext.Provider value={value}>
      {children}
    </NuevoRegistroContext.Provider>
  );
};
