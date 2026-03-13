import React from 'react';
import { Download } from 'lucide-react';
import './ExportBar.css';

interface ExportBarProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onNuevoRegistro?: () => void;
  showNuevoRegistro?: boolean;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  onExportPDF,
  onExportExcel,
  onNuevoRegistro,
  showNuevoRegistro = true
}) => {
  return (
    <div className="export-bar">
      <span className="export-label">Exportar</span>
      <button 
        className="btn btn-danger2"
        onClick={onExportPDF}
      >
        <Download size={14} /> PDF Global
      </button>
      <button 
        className="btn btn-success"
        onClick={onExportExcel}
      >
        <Download size={14} /> Excel Completo
      </button>
      {showNuevoRegistro && (
        <>
          <div className="vdivider"></div>
          <button 
            className="btn btn-primary"
            onClick={onNuevoRegistro}
          >
            + Nuevo Registro
          </button>
        </>
      )}
      <div className="vdivider"></div>
      <span className="export-hint">
        PDF individual disponible en cada tarjeta
      </span>
    </div>
  );
};
