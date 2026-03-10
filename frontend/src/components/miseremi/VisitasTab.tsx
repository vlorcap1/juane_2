import React, { useState, useEffect } from 'react';
import { useVisitas } from '../../hooks/useVisitas';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { Modal, ModalButtons } from '../ui/Modal';
import { formatRelativeTime } from '../../utils/dateUtils';
import { CreateVisita, UpdateVisita } from '../../types';
import { useToast } from '../ui/Toast';
import './TabStyles.css';

interface VisitasTabProps {
  seremiId: string;
  seremiNombre: string;
  user: any;
}

export const VisitasTab: React.FC<VisitasTabProps> = ({ seremiId }) => {
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
    const requiredFields = ['fecha', 'comuna'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    if (editingVisita) {
      const success = await updateVisita(editingVisita.id, formData as UpdateVisita);
      if (success) setShowModal(false);
    } else {
      const success = await createVisita(formData as CreateVisita);
      if (success) setShowModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="tab-container">
      {/* Header */}
      <div className="tab-header">
        <div>
          <div className="tab-title">Visitas a Comunas</div>
          <div className="tab-subtitle">{visitas.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Nueva Visita
        </button>
      </div>

      {/* Table */}
      {visitas.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Sin visitas registradas"
          message="Comienza agregando tu primera visita"
        />
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
              {visitas.map((visita: any) => (
                <tr key={visita.id}>
                  <td>
                    <div className="cell-date">{formatRelativeTime(visita.fecha)}</div>
                    <div className="cell-date-full">{visita.fecha}</div>
                  </td>
                  <td>
                    <span className="cell-comuna">{visita.comuna}</span>
                  </td>
                  <td>
                    <div className="cell-title">{visita.lugar || '-'}</div>
                    {visita.descripcion && (
                      <div className="cell-description">{visita.descripcion}</div>
                    )}
                  </td>
                  <td>
                    <span className="cell-badge">{visita.personas || 0}</span>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(visita)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(visita.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVisita ? 'Editar Visita' : 'Nueva Visita'}
        size="md"
      >
        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha || ''}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comuna *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nombre de la comuna"
                value={formData.comuna || ''}
                onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lugar</label>
            <input
              type="text"
              className="form-input"
              placeholder="Lugar específico de la visita"
              value={formData.lugar || ''}
              onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              placeholder="Descripción de la actividad realizada"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Personas</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                value={formData.personas || ''}
                onChange={(e) => setFormData({ ...formData, personas: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <ModalButtons
          onCancel={() => setShowModal(false)}
          onConfirm={handleSubmit}
          confirmText={editingVisita ? 'Actualizar' : 'Crear'}
        />
      </Modal>
    </div>
  );
};
