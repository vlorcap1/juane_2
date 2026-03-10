import React, { useState, useEffect } from 'react';
import { seremisApi } from '../api/client';
import { useVisitas } from '../hooks/useVisitas';
import { useContactos } from '../hooks/useContactos';
import { usePrensa } from '../hooks/usePrensa';
import { useProyectos } from '../hooks/useProyectos';
import { useNudos } from '../hooks/useNudos';
import { useTemas } from '../hooks/useTemas';
import { useAgenda } from '../hooks/useAgenda';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { EmptyState } from './ui/EmptyState';
import { Modal, ModalButtons } from './ui/Modal';
import { formatRelativeTime } from '../utils/dateUtils';
import { useToast } from './ui/Toast';
import './MiSeremi.css';
import './miseremi/TabStyles.css';

interface MiSeremiProps {
  user: any;
}

interface SeremiData {
  id: string;
  nombre: string;
  sector: string;
  region: string;
  seremisNombre: string;
  seremisEmail: string;
  seremisTelefono: string;
}

const TABS = [
  { key: 'visitas', label: 'Visitas', icon: '📍' },
  { key: 'contactos', label: 'Contactos', icon: '👤' },
  { key: 'prensa', label: 'Prensa', icon: '📰' },
  { key: 'proyectos', label: 'Proyectos', icon: '🏗️' },
  { key: 'nudos', label: 'Nudos', icon: '🚧' },
  { key: 'temas', label: 'Temas', icon: '💡' },
  { key: 'agenda', label: 'Agenda', icon: '📅' }
];

// Inline Tab Components
interface TabProps {
  seremiId: string;
}

const VisitasTab: React.FC<TabProps> = ({ seremiId }) => {
  const { visitas, loading, createVisita, updateVisita, deleteVisita, refresh } = useVisitas({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingVisita, setEditingVisita] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingVisita(null);
    setFormData({
      seremiId,
      fecha: new Date().toISOString().split('T')[0],
      comuna: '',
      lugar: '',
      descripcion: '',
      personas: 0
    });
    setShowModal(true);
  };

  const handleEdit = (visita: any) => {
    setEditingVisita(visita);
    setFormData({
      fecha: visita.fecha,
      comuna: visita.comuna,
      lugar: visita.lugar,
      descripcion: visita.descripcion,
      personas: visita.personas
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta visita?')) {
      await deleteVisita(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fecha || !formData.comuna) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    if (editingVisita) {
      const success = await updateVisita(editingVisita.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createVisita(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Visitas a Comunas</div>
          <div className="tab-subtitle">{visitas.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nueva Visita</button>
      </div>

      {visitas.length === 0 ? (
        <EmptyState icon="📍" title="Sin visitas" message="Comienza agregando tu primera visita" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comuna</th>
                <th>Lugar</th>
                <th>Personas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visitas.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <div className="cell-date">{formatRelativeTime(v.fecha)}</div>
                    <div className="cell-date-full">{v.fecha}</div>
                  </td>
                  <td><span className="cell-comuna">{v.comuna}</span></td>
                  <td>
                    <div className="cell-title">{v.lugar || '-'}</div>
                    {v.descripcion && <div className="cell-description">{v.descripcion}</div>}
                  </td>
                  <td><span className="cell-badge">{v.personas || 0}</span></td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(v)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(v.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingVisita ? 'Editar Visita' : 'Nueva Visita'} size="md">
        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input type="date" className="form-input" value={formData.fecha || ''} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Comuna *</label>
              <input type="text" className="form-input" placeholder="Comuna" value={formData.comuna || ''} onChange={(e) => setFormData({ ...formData, comuna: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Lugar</label>
            <input type="text" className="form-input" placeholder="Lugar específico" value={formData.lugar || ''} onChange={(e) => setFormData({ ...formData, lugar: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" placeholder="Descripción" value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Personas</label>
            <input type="number" className="form-input" min="0" value={formData.personas || ''} onChange={(e) => setFormData({ ...formData, personas: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingVisita ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

const ContactosTab: React.FC<TabProps> = ({ seremiId }) => {
  const { contactos, loading, createContacto, updateContacto, deleteContacto, refresh } = useContactos({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingContacto, setEditingContacto] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingContacto(null);
    setFormData({
      seremiId,
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      lugar: '',
      personas: 0,
      tipo: '',
      instituciones: '',
      descripcion: ''
    });
    setShowModal(true);
  };

  const handleEdit = (contacto: any) => {
    setEditingContacto(contacto);
    setFormData({
      nombre: contacto.nombre,
      fecha: contacto.fecha,
      lugar: contacto.lugar,
      personas: contacto.personas,
      tipo: contacto.tipo,
      instituciones: contacto.instituciones,
      descripcion: contacto.descripcion
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este contacto?')) {
      await deleteContacto(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre) {
      showToast('Por favor ingresa un nombre', 'error');
      return;
    }

    if (editingContacto) {
      const success = await updateContacto(editingContacto.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createContacto(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Contactos</div>
          <div className="tab-subtitle">{contactos.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nuevo Contacto</button>
      </div>

      {contactos.length === 0 ? (
        <EmptyState icon="👤" title="Sin contactos" message="Comienza agregando tu primer contacto" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Institución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-title">{c.nombre || '-'}</div>
                    {c.descripcion && <div className="cell-description">{c.descripcion}</div>}
                  </td>
                  <td>
                    <div className="cell-date">{formatRelativeTime(c.fecha)}</div>
                    <div className="cell-date-full">{c.fecha}</div>
                  </td>
                  <td><span className="badge badge-info">{c.tipo || 'Sin tipo'}</span></td>
                  <td><span className="cell-comuna">{c.instituciones || '-'}</span></td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(c)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingContacto ? 'Editar Contacto' : 'Nuevo Contacto'} size="md">
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input type="text" className="form-input" placeholder="Nombre del contacto" value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={formData.fecha || ''} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <input type="text" className="form-input" placeholder="Tipo de contacto" value={formData.tipo || ''} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Lugar</label>
            <input type="text" className="form-input" placeholder="Lugar del contacto" value={formData.lugar || ''} onChange={(e) => setFormData({ ...formData, lugar: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Institución</label>
              <input type="text" className="form-input" placeholder="Institución" value={formData.instituciones || ''} onChange={(e) => setFormData({ ...formData, instituciones: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Personas</label>
              <input type="number" className="form-input" min="0" value={formData.personas || ''} onChange={(e) => setFormData({ ...formData, personas: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" placeholder="Descripción" value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingContacto ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

const PrensaTab: React.FC<TabProps> = ({ seremiId }) => {
  const { prensa, loading, createPrensa, updatePrensa, deletePrensa, refresh } = usePrensa({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingPrensa, setEditingPrensa] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingPrensa(null);
    setFormData({
      seremiId,
      titular: '',
      medio: '',
      fecha: new Date().toISOString().split('T')[0],
      tipoMedio: '',
      tono: '',
      url: '',
      resumen: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingPrensa(item);
    setFormData({
      titular: item.titular,
      medio: item.medio,
      fecha: item.fecha,
      tipoMedio: item.tipoMedio,
      tono: item.tono,
      url: item.url,
      resumen: item.resumen
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de prensa?')) {
      await deletePrensa(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.titular) {
      showToast('Por favor ingresa un titular', 'error');
      return;
    }

    if (editingPrensa) {
      const success = await updatePrensa(editingPrensa.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createPrensa(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Prensa</div>
          <div className="tab-subtitle">{prensa.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nueva Prensa</button>
      </div>

      {prensa.length === 0 ? (
        <EmptyState icon="📰" title="Sin registros de prensa" message="Comienza agregando tu primer registro" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titular</th>
                <th>Medio</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Tono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prensa.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-title">{p.titular || '-'}</div>
                    {p.resumen && <div className="cell-description">{p.resumen}</div>}
                  </td>
                  <td><span className="cell-comuna">{p.medio || '-'}</span></td>
                  <td>
                    <div className="cell-date">{formatRelativeTime(p.fecha)}</div>
                    <div className="cell-date-full">{p.fecha}</div>
                  </td>
                  <td><span className="badge badge-info">{p.tipoMedio || 'Sin tipo'}</span></td>
                  <td><span className={`badge badge-${p.tono === 'positivo' ? 'success' : p.tono === 'negativo' ? 'danger' : 'neutral'}`}>{p.tono || 'Neutral'}</span></td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(p)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPrensa ? 'Editar Prensa' : 'Nueva Prensa'} size="lg">
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Titular *</label>
            <input type="text" className="form-input" placeholder="Titular de la noticia" value={formData.titular || ''} onChange={(e) => setFormData({ ...formData, titular: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Medio</label>
              <input type="text" className="form-input" placeholder="Nombre del medio" value={formData.medio || ''} onChange={(e) => setFormData({ ...formData, medio: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={formData.fecha || ''} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Medio</label>
              <select className="form-input" value={formData.tipoMedio || ''} onChange={(e) => setFormData({ ...formData, tipoMedio: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="television">Televisión</option>
                <option value="radio">Radio</option>
                <option value="prensa">Prensa Escrita</option>
                <option value="digital">Digital</option>
                <option value="rrss">Redes Sociales</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tono</label>
              <select className="form-input" value={formData.tono || ''} onChange={(e) => setFormData({ ...formData, tono: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="positivo">Positivo</option>
                <option value="neutral">Neutral</option>
                <option value="negativo">Negativo</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">URL</label>
            <input type="url" className="form-input" placeholder="https://..." value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Resumen</label>
            <textarea className="form-textarea" placeholder="Resumen de la noticia" value={formData.resumen || ''} onChange={(e) => setFormData({ ...formData, resumen: e.target.value })} rows={3} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingPrensa ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

const ProyectosTab: React.FC<TabProps> = ({ seremiId }) => {
  const { proyectos, loading, createProyecto, updateProyecto, deleteProyecto, refresh } = useProyectos({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingProyecto(null);
    setFormData({
      seremiId,
      title: '',
      meta: '',
      estado: '',
      presupuesto: '',
      descripcion: '',
      comunas: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingProyecto(item);
    setFormData({
      title: item.title,
      meta: item.meta,
      estado: item.estado,
      presupuesto: item.presupuesto,
      descripcion: item.descripcion,
      comunas: item.comunas
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      await deleteProyecto(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      showToast('Por favor ingresa un título', 'error');
      return;
    }

    if (editingProyecto) {
      const success = await updateProyecto(editingProyecto.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createProyecto(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Proyectos</div>
          <div className="tab-subtitle">{proyectos.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nuevo Proyecto</button>
      </div>

      {proyectos.length === 0 ? (
        <EmptyState icon="🏗️" title="Sin proyectos" message="Comienza agregando tu primer proyecto" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Meta</th>
                <th>Presupuesto</th>
                <th>Comunas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-title">{p.title || '-'}</div>
                    {p.descripcion && <div className="cell-description">{p.descripcion}</div>}
                  </td>
                  <td><span className={`badge badge-${p.estado === 'completado' ? 'success' : p.estado === 'en_curso' ? 'warning' : 'info'}`}>{p.estado || 'Sin estado'}</span></td>
                  <td><span className="cell-comuna">{p.meta || '-'}</span></td>
                  <td><span className="cell-badge">{p.presupuesto || '-'}</span></td>
                  <td><span className="cell-comuna">{p.comunas || '-'}</span></td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(p)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'} size="lg">
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input type="text" className="form-input" placeholder="Título del proyecto" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-input" value={formData.estado || ''} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="planificacion">Planificación</option>
                <option value="en_curso">En Curso</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meta</label>
              <input type="text" className="form-input" placeholder="Meta del proyecto" value={formData.meta || ''} onChange={(e) => setFormData({ ...formData, meta: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Presupuesto</label>
              <input type="text" className="form-input" placeholder="Ej: $50.000.000" value={formData.presupuesto || ''} onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Comunas</label>
              <input type="text" className="form-input" placeholder="Ej: Santiago, Providencia" value={formData.comunas || ''} onChange={(e) => setFormData({ ...formData, comunas: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" placeholder="Descripción del proyecto" value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={4} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingProyecto ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

const NudosTab: React.FC<TabProps> = ({ seremiId }) => {
  const { nudos, loading, createNudo, updateNudo, deleteNudo, refresh } = useNudos({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingNudo, setEditingNudo] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingNudo(null);
    setFormData({
      seremiId,
      title: '',
      desc: '',
      urgencia: '',
      solucion: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingNudo(item);
    setFormData({
      title: item.title,
      desc: item.desc,
      urgencia: item.urgencia,
      solucion: item.solucion
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este nudo?')) {
      await deleteNudo(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      showToast('Por favor ingresa un título', 'error');
      return;
    }

    if (editingNudo) {
      const success = await updateNudo(editingNudo.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createNudo(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Nudos Críticos</div>
          <div className="tab-subtitle">{nudos.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nuevo Nudo</button>
      </div>

      {nudos.length === 0 ? (
        <EmptyState icon="🚧" title="Sin nudos críticos" message="Comienza agregando tu primer nudo" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Urgencia</th>
                <th>Solución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nudos.map((n: any) => (
                <tr key={n.id}>
                  <td>
                    <div className="cell-title">{n.title || '-'}</div>
                  </td>
                  <td>
                    <div className="cell-description">{n.desc || '-'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${n.urgencia === 'alta' ? 'danger' : n.urgencia === 'media' ? 'warning' : 'info'}`}>
                      {n.urgencia || 'Sin urgencia'}
                    </span>
                  </td>
                  <td>
                    <div className="cell-description">{n.solucion || '-'}</div>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(n)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(n.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingNudo ? 'Editar Nudo' : 'Nuevo Nudo'} size="lg">
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input type="text" className="form-input" placeholder="Título del nudo crítico" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Urgencia</label>
            <select className="form-input" value={formData.urgencia || ''} onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" placeholder="Descripción del nudo crítico" value={formData.desc || ''} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Solución Propuesta</label>
            <textarea className="form-textarea" placeholder="Solución propuesta para resolver el nudo" value={formData.solucion || ''} onChange={(e) => setFormData({ ...formData, solucion: e.target.value })} rows={3} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingNudo ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

const TemasTab: React.FC<TabProps> = ({ seremiId }) => {
  const { temas, loading, createTema, updateTema, deleteTema, refresh } = useTemas({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingTema, setEditingTema] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingTema(null);
    setFormData({
      seremiId,
      tema: '',
      ambito: '',
      prioridad: '',
      descripcion: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingTema(item);
    setFormData({
      tema: item.tema,
      ambito: item.ambito,
      prioridad: item.prioridad,
      descripcion: item.descripcion
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este tema?')) {
      await deleteTema(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.tema) {
      showToast('Por favor ingresa un tema', 'error');
      return;
    }

    if (editingTema) {
      const success = await updateTema(editingTema.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createTema(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Temas de Trabajo</div>
          <div className="tab-subtitle">{temas.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nuevo Tema</button>
      </div>

      {temas.length === 0 ? (
        <EmptyState icon="💡" title="Sin temas" message="Comienza agregando tu primer tema" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tema</th>
                <th>Ámbito</th>
                <th>Prioridad</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {temas.map((t: any) => (
                <tr key={t.id}>
                  <td>
                    <div className="cell-title">{t.tema || '-'}</div>
                  </td>
                  <td><span className="badge badge-info">{t.ambito || 'Sin ámbito'}</span></td>
                  <td>
                    <span className={`badge badge-${t.prioridad === 'alta' ? 'danger' : t.prioridad === 'media' ? 'warning' : 'info'}`}>
                      {t.prioridad || 'Sin prioridad'}
                    </span>
                  </td>
                  <td>
                    <div className="cell-description">{t.descripcion || '-'}</div>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(t)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTema ? 'Editar Tema' : 'Nuevo Tema'} size="md">
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Tema *</label>
            <input type="text" className="form-input" placeholder="Nombre del tema" value={formData.tema || ''} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ámbito</label>
              <input type="text" className="form-input" placeholder="Ámbito del tema" value={formData.ambito || ''} onChange={(e) => setFormData({ ...formData, ambito: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select className="form-input" value={formData.prioridad || ''} onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" placeholder="Descripción del tema" value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={4} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingTema ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

const AgendaTab: React.FC<TabProps> = ({ seremiId }) => {
  const { agenda, loading, createAgendaItem, updateAgendaItem, deleteAgendaItem, refresh } = useAgenda({ seremiId });
  const [showModal, setShowModal] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    refresh();
  }, [seremiId]);

  const handleCreate = () => {
    setEditingAgenda(null);
    setFormData({
      seremiId,
      fecha: new Date().toISOString().split('T')[0],
      texto: '',
      cat: '',
      lugar: '',
      notas: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingAgenda(item);
    setFormData({
      fecha: item.fecha,
      texto: item.texto,
      cat: item.cat,
      lugar: item.lugar,
      notas: item.notas
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este evento de agenda?')) {
      await deleteAgendaItem(id);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fecha || !formData.texto) {
      showToast('Por favor completa fecha y descripción', 'error');
      return;
    }

    if (editingAgenda) {
      const success = await updateAgendaItem(editingAgenda.id, formData);
      if (success) setShowModal(false);
    } else {
      const success = await createAgendaItem(formData);
      if (success) setShowModal(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="tab-container">
      <div className="tab-header">
        <div>
          <div className="tab-title">Agenda</div>
          <div className="tab-subtitle">{agenda.length} evento(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nuevo Evento</button>
      </div>

      {agenda.length === 0 ? (
        <EmptyState icon="📅" title="Sin eventos en agenda" message="Comienza agregando tu primer evento" />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Lugar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agenda.map((a: any) => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-date">{formatRelativeTime(a.fecha)}</div>
                    <div className="cell-date-full">{a.fecha}</div>
                  </td>
                  <td>
                    <div className="cell-title">{a.texto || '-'}</div>
                    {a.notas && <div className="cell-description">{a.notas}</div>}
                  </td>
                  <td><span className="badge badge-info">{a.cat || 'Sin categoría'}</span></td>
                  <td><span className="cell-comuna">{a.lugar || '-'}</span></td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(a)}>✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(a.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAgenda ? 'Editar Evento' : 'Nuevo Evento'} size="md">
        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input type="date" className="form-input" value={formData.fecha || ''} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-input" value={formData.cat || ''} onChange={(e) => setFormData({ ...formData, cat: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option value="reunion">Reunión</option>
                <option value="visita">Visita</option>
                <option value="evento">Evento</option>
                <option value="ceremonia">Ceremonia</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <input type="text" className="form-input" placeholder="Descripción del evento" value={formData.texto || ''} onChange={(e) => setFormData({ ...formData, texto: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Lugar</label>
            <input type="text" className="form-input" placeholder="Lugar del evento" value={formData.lugar || ''} onChange={(e) => setFormData({ ...formData, lugar: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notas</label>
            <textarea className="form-textarea" placeholder="Notas adicionales" value={formData.notas || ''} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={3} />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingAgenda ? 'Actualizar' : 'Crear'} />
      </Modal>
    </div>
  );
};

export const MiSeremi: React.FC<MiSeremiProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('visitas');
  const [seremiData, setSeremiData] = useState<SeremiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeremiData();
  }, [user]);

  const loadSeremiData = async () => {
    try {
      setLoading(true);
      // For SEREMI users, load their own data
      // For admin, this should allow selecting a SEREMI (TODO: add selector)
      const seremis = await seremisApi.getAll();
      
      // Find the user's SEREMI data
      const userSeremi = seremis.find((s: any) => 
        s.sector.toLowerCase() === user.sector?.toLowerCase()
      );
      
      if (userSeremi) {
        // Map API data to SeremiData interface
        setSeremiData({
          id: userSeremi.id,
          nombre: userSeremi.nombre,
          sector: userSeremi.sector,
          region: userSeremi.sector || 'Región no especificada',
          seremisNombre: userSeremi.seremiName || userSeremi.nombre || 'Sin asignar',
          seremisEmail: userSeremi.c1 || 'Sin asignar',
          seremisTelefono: userSeremi.c2 || 'Sin asignar'
        });
      }
    } catch (error) {
      console.error('Error loading SEREMI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSubTab = () => {
    if (!seremiData) return null;

    const props = {
      seremiId: seremiData.id,
      seremiNombre: seremiData.nombre,
      user
    };

    switch (activeSubTab) {
      case 'visitas':
        return <VisitasTab {...props} />;
      case 'contactos':
        return <ContactosTab {...props} />;
      case 'prensa':
        return <PrensaTab {...props} />;
      case 'proyectos':
        return <ProyectosTab {...props} />;
      case 'nudos':
        return <NudosTab {...props} />;
      case 'temas':
        return <TemasTab {...props} />;
      case 'agenda':
        return <AgendaTab {...props} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">Cargando datos...</div>
      </div>
    );
  }

  if (!seremiData) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <div className="empty-title">No se encontró SEREMI</div>
          <div className="empty-message">
            No hay datos de SEREMI asociados a este usuario.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mi-seremi-container">
      {/* SEREMI Header */}
      <div className="seremi-header-full">
        <div className="seremi-header-left">
          <div className="seremi-avatar-xl">
            {seremiData.sector.charAt(0).toUpperCase()}
          </div>
          <div className="seremi-header-info">
            <div className="seremi-header-name">{seremiData.nombre}</div>
            <div className="seremi-header-sector">{seremiData.sector}</div>
            <div className="seremi-header-region">{seremiData.region}</div>
          </div>
        </div>
        <div className="seremi-header-right">
          <div className="seremi-contact-item">
            <span className="contact-icon">👤</span>
            <span>{seremiData.seremisNombre}</span>
          </div>
          <div className="seremi-contact-item">
            <span className="contact-icon">📧</span>
            <span>{seremiData.seremisEmail}</span>
          </div>
          <div className="seremi-contact-item">
            <span className="contact-icon">📞</span>
            <span>{seremiData.seremisTelefono}</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="sub-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`sub-tab ${activeSubTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            <span className="sub-tab-icon">{tab.icon}</span>
            <span className="sub-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sub-tab-content">
        {renderSubTab()}
      </div>
    </div>
  );
};
