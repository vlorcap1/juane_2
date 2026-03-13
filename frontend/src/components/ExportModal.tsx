import React, { useState } from 'react';
import './ExportModal.css';
import { Modal } from './ui/Modal';
import { useExport, ExportFormat, ExportType } from '../hooks/useExport';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { FileText, BarChart2, Info } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  seremiId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exportType,
  seremiId
}) => {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { exporting, exportData } = useExport();

  const handleExport = async () => {
    const options = {
      format,
      type: exportType,
      seremiId,
      ...(useDateRange && dateFrom && dateTo && {
        dateRange: { from: dateFrom, to: dateTo }
      })
    };

    const success = await exportData(options);
    if (success) {
      onClose();
    }
  };

  const getTypeLabel = () => {
    const labels: Record<ExportType, string> = {
      visitas: 'Visitas',
      contactos: 'Contactos',
      prensa: 'Prensa',
      proyectos: 'Proyectos',
      contrataciones: 'Contrataciones',
      indicadores: 'Indicadores',
      foro: 'Mensajes del Foro'
    };
    return labels[exportType];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Exportar ${getTypeLabel()}`}
      size="md"
    >
      <div className="export-modal-content">
        {exporting ? (
          <div className="export-loading">
            <LoadingSpinner />
            <p>Generando archivo...</p>
          </div>
        ) : (
          <>
            <div className="export-section">
              <h3>Formato de archivo</h3>
              <div className="format-options">
                <label className={`format-option ${format === 'pdf' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={format === 'pdf'}
                    onChange={() => setFormat('pdf')}
                  />
                  <div className="format-card">
                    <div className="format-icon"><FileText size={28} /></div>
                    <div className="format-name">PDF</div>
                    <div className="format-desc">Documento portable</div>
                  </div>
                </label>

                <label className={`format-option ${format === 'excel' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={format === 'excel'}
                    onChange={() => setFormat('excel')}
                  />
                  <div className="format-card">
                    <div className="format-icon"><BarChart2 size={28} /></div>
                    <div className="format-name">Excel</div>
                    <div className="format-desc">Hoja de cálculo</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="export-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useDateRange}
                  onChange={(e) => setUseDateRange(e.target.checked)}
                />
                <span>Filtrar por rango de fechas</span>
              </label>

              {useDateRange && (
                <div className="date-range">
                  <div className="date-field">
                    <label>Desde:</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="date-field">
                    <label>Hasta:</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="export-info">
              <span className="info-icon"><Info size={14} /></span>
              <span>
                Se exportarán todos los registros 
                {useDateRange && ' del rango seleccionado'}
                {seremiId && ' de la SEREMI seleccionada'}
              </span>
            </div>

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleExport}
                disabled={useDateRange && (!dateFrom || !dateTo)}
              >
                Exportar
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
