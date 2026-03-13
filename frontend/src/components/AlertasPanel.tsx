import { useState } from 'react';
import { Bell, AlertOctagon, AlertTriangle, Info, Pin, Check, Trash2, CheckCircle } from 'lucide-react';
import { useAlertas } from '../hooks/useAlertas';
import './AlertasPanel.css';

export default function AlertasPanel() {
  const { alertas, count, loading, marcarLeida, marcarTodasLeidas, descartarAlerta, limpiarLeidas } = useAlertas();
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'danger': return <AlertOctagon size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'info': return <Info size={14} />;
      default: return <Pin size={14} />;
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--accent)';
      case 'info': return 'var(--accent2)';
      default: return 'var(--text3)';
    }
  };

  const handleAlertaClick = async (alerta: any) => {
    if (!alerta.leida) {
      await marcarLeida(alerta.id);
    }
    
    // Navegar a la URL si existe
    if (alerta.url) {
      // TODO: Implementar navegación
      console.log('Navegar a:', alerta.url);
    }
  };

  return (
    <>
      {/* Botón de alertas */}
      <div className="alertas-btn" onClick={togglePanel} title="Alertas del sistema">
        <Bell size={18} />
        {count > 0 && (
          <div className="alertas-badge">
            {count > 99 ? '99+' : count}
          </div>
        )}
      </div>

      {/* Panel de alertas */}
      {isOpen && (
        <div className="alertas-panel">
          <div className="alertas-panel-head">
            <div className="alertas-panel-title">
              <AlertOctagon size={15} /> Alertas del Sistema
            </div>
            <div className="alertas-panel-actions">
              <button className="alertas-panel-btn" onClick={marcarTodasLeidas} title="Marcar todas como leídas">
                <Check size={14} />
              </button>
              <button className="alertas-panel-btn" onClick={limpiarLeidas} title="Limpiar leídas">
                <Trash2 size={14} />
              </button>
              <button className="alertas-panel-btn" onClick={togglePanel}>
                ×
              </button>
            </div>
          </div>

          <div className="alertas-panel-body">
            {loading ? (
              <div className="alertas-empty">Cargando...</div>
            ) : alertas.length === 0 ? (
              <div className="alertas-empty">
                <CheckCircle size={16} /> No hay alertas pendientes
              </div>
            ) : (
              alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`alerta-item ${alerta.leida ? '' : 'unread'}`}
                  onClick={() => handleAlertaClick(alerta)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="alerta-item-header">
                    <div className="alerta-item-nivel" style={{ color: getNivelColor(alerta.nivel) }}>
                      {getNivelIcon(alerta.nivel)}
                    </div>
                    <div className="alerta-item-titulo" style={{ flex: 1 }}>
                      {alerta.titulo}
                    </div>
                    <button
                      className="alerta-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        descartarAlerta(alerta.id);
                      }}
                      title="Descartar"
                    >
                      ×
                    </button>
                  </div>
                  {alerta.mensaje && (
                    <div className="alerta-item-mensaje">
                      {alerta.mensaje}
                    </div>
                  )}
                  <div className="alerta-item-fecha">
                    {new Date(alerta.creadoEn).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
