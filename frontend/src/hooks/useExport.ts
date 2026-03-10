/**
 * Hook para exportación de datos a PDF y Excel
 */
import { useState } from 'react';
import { useToast } from '../components/ui/Toast';

export type ExportFormat = 'pdf' | 'excel';
export type ExportType = 'visitas' | 'contactos' | 'prensa' | 'proyectos' | 'contrataciones' | 'indicadores' | 'foro';

interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  seremiId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

const MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const TYPE_LABELS: Record<ExportType, string> = {
  visitas: 'Visitas',
  contactos: 'Contactos',
  prensa: 'Prensa',
  proyectos: 'Proyectos',
  contrataciones: 'Contrataciones',
  indicadores: 'Indicadores',
  foro: 'Foro',
};

function getPeriodoActual(): string {
  const now = new Date();
  return `${MESES_ES[now.getMonth()]}${now.getFullYear()}`;
}

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const exportData = async (options: ExportOptions): Promise<boolean> => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('format', options.format);
      params.append('type', options.type);
      if (options.seremiId) params.append('seremiId', options.seremiId);
      if (options.dateRange) {
        params.append('dateFrom', options.dateRange.from);
        params.append('dateTo', options.dateRange.to);
      }

      const response = await fetch(`http://localhost:8000/api/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const extension = options.format === 'pdf' ? 'pdf' : 'xlsx';
        const label = TYPE_LABELS[options.type];
        const periodo = getPeriodoActual();
        const filename = `Informe_${label}_Maule_${periodo}.${extension}`;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Exportación completada', 'success');
        return true;
      } else {
        const error = await response.json();
        showToast(error.message || 'Error al exportar', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error exporting:', error);
      showToast('Error al exportar datos', 'error');
      return false;
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportData
  };
};
