import { useState } from 'react';
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
      case 'danger': return '🔴';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📌';
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
        🔔
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
              🚨 Alertas del Sistema
            </div>
            <div className="alertas-panel-actions">
              <button className="alertas-panel-btn" onClick={marcarTodasLeidas} title="Marcar todas como leídas">
                ✓
              </button>
              <button className="alertas-panel-btn" onClick={limpiarLeidas} title="Limpiar leídas">
                🗑️
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
                ✅ No hay alertas pendientes
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
