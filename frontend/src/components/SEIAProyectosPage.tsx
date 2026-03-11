import './SEIAProyectosPage.css';

export default function SEIAProyectosPage() {
  return (
    <div className="container">
      <div className="section-title">🌿 Sistema de Evaluación de Impacto Ambiental</div>
      <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '16px' }}>
        Búsqueda de proyectos ingresados al SEIA - Servicio de Evaluación Ambiental
      </div>
      
      <div className="seia-iframe-container">
        <iframe 
          src="https://seia.sea.gob.cl/busqueda/buscarProyecto.php" 
          title="SEIA - Búsqueda de Proyectos"
          className="seia-iframe"
        />
      </div>
    </div>
  );
}
