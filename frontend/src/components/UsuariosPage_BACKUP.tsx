/**
 * Página de Gestión de Usuarios y SEREMIs
 */
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { EmptyState } from './ui/EmptyState';
import { Modal, ModalButtons } from './ui/Modal';
import { Badge } from './ui/Badge';
import { useToast } from './ui/Toast';
import { usersApi, seremisApi } from '../api/client';
import { User, Seremi } from '../types';
import './UsuariosPage.css';

interface UsuariosPageProps {
  user: any;
}

export const UsuariosPage: React.FC<UsuariosPageProps> = ({ user }) => {
  const isAdmin = user?.rol === 'admin';
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [seremis, setSeremis] = useState<Seremi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSeremiModal, setShowSeremiModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const [editingSeremi, setEditingSeremi] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [seremiFormData, setSeremiFormData] = useState<any>({});
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar usuarios desde API
      const data = await usersApi.getAll();
      setUsuarios(data);

      // Cargar SEREMIs
      const seremisData = await seremisApi.getAll();
      setSeremis(seremisData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUsuario(null);
    setFormData({
      username: '',
      nombre: '',
      email: '',
      password: '',
      rol: 'seremi',
      cargo: '',
      seremiId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (usuario: User) => {
    setEditingUsuario(usuario);
    setFormData({
      username: usuario.username,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      cargo: usuario.cargo,
      sector: usuario.seremiId
    });
    setShowModal(true);
  };

  const handleEditSeremi = (seremi: Seremi) => {
    setEditingSeremi(seremi);
    setSeremiFormData({
      nombre: seremi.nombre,
      sector: seremi.sector,
      // Aquí se pueden agregar más campos según la estructura de SEREMI
    });
    setShowSeremiModal(true);
  };

  const handleSubmitSeremi = async () => {
    if (!seremiFormData.nombre || !seremiFormData.sector) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    try {
      await seremisApi.update(editingSeremi.id, seremiFormData);
      showToast('SEREMI actualizada correctamente', 'success');
      setShowSeremiModal(false);
      loadData();
    } catch (error) {
      console.error('Error al actualizar SEREMI:', error);
      showToast('Error al actualizar SEREMI', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await usersApi.delete(id);
      showToast('Usuario eliminado exitosamente', 'success');
      loadData();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showToast('Error al eliminar usuario', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.nombre) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    if (!editingUsuario && !formData.password) {
      showToast('Por favor ingresa una contraseña', 'error');
      return;
    }

    try {
      if (editingUsuario) {
        await usersApi.update(editingUsuario.id, formData);
        showToast('Usuario actualizado exitosamente', 'success');
      } else {
        await usersApi.create(formData);
        showToast('Usuario creado exitosamente', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showToast('Error al guardar usuario', 'error');
    }
  };

  // Filtrado
  const filteredUsuarios = usuarios.filter(u => {
    return !selectedRole || u.rol === selectedRole;
  });

  // Estadísticas
  const stats = {
    total: usuarios.length,
    admins: usuarios.filter(u => u.rol === 'admin').length,
    seremis: usuarios.filter(u => u.rol === 'seremi').length,
    invitados: usuarios.filter(u => u.rol === 'guest').length
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (!isAdmin) {
    return (
      <div className="usuarios-page">
        <EmptyState icon="🔒" title="Acceso restringido" message="Solo administradores pueden gestionar usuarios" />
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administración de usuarios y asignación de SEREMIs</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nuevo Usuario</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-icon">👑</div>
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Administradores</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">🏛️</div>
          <div className="stat-value">{stats.seremis}</div>
          <div className="stat-label">SEREMIs</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{stats.invitados}</div>
          <div className="stat-label">Invitados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select
          className="filter-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="seremi">SEREMI</option>
          <option value="guest">Invitado</option>
        </select>
      </div>

      {/* Users Grid */}
      {filteredUsuarios.length === 0 ? (
        <EmptyState icon="👥" title="Sin usuarios" message={selectedRole ? 'No se encontraron usuarios con ese rol' : 'Comienza agregando tu primer usuario'} />
      ) : (
        <div className="users-grid">
          {filteredUsuarios.map((u) => (
            <div key={u.id} className="user-card">
              <div className="user-avatar">
                {u.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{u.nombre}</div>
                <div className="user-username">@{u.username}</div>
                {u.cargo && <div className="user-cargo">{u.cargo}</div>}
              </div>
              <div className="user-role">
                <Badge variant={u.rol === 'admin' ? 'danger' : u.rol === 'seremi' ? 'success' : 'info'}>
                  {u.rol === 'admin' ? '👑 Admin' : u.rol === 'seremi' ? '🏛️ SEREMI' : '👤 Invitado'}
                </Badge>
              </div>
              <div className="user-actions">
                <button className="btn-icon btn-edit" onClick={() => handleEdit(u)} title="Editar">✏️</button>
                {u.id !== user.id && (
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(u.id)} title="Eliminar">🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEREMIS Section */}
      <div style={{ marginTop: '48px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">🏛️ Información de SEREMIs</h2>
            <p className="section-subtitle">Editar datos de cada SEREMI regional</p>
          </div>
        </div>
        <div className="seremis-grid">
          {seremis.map((s) => (
            <div key={s.id} className="seremi-info-card">
              <div className="seremi-info-header">
                <div className="seremi-info-avatar">{s.nombre.charAt(0)}</div>
                <div>
                  <div className="seremi-info-name">{s.nombre}</div>
                  <div className="seremi-info-sector">{s.sector}</div>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => handleEditSeremi(s)}
                style={{ marginTop: '12px', width: '100%' }}
              >
                ✏️ Editar Info SEREMI
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'} size="md">
        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Usuario *</label>
              <input
                type="text"
                className="form-input"
                placeholder="username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingUsuario}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nombre completo"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="correo@ejemplo.cl"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {!editingUsuario && (
            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rol *</label>
              <select
                className="form-input"
                value={formData.rol || ''}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <option value="seremi">SEREMI</option>
                <option value="admin">Administrador</option>
                <option value="guest">Invitado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cargo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Cargo"
                value={formData.cargo || ''}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
          </div>

          {formData.rol === 'seremi' && (
            <div className="form-group">
              <label className="form-label">SEREMI Asignado</label>
              <select
                className="form-input"
                value={formData.seremiId || ''}
                onChange={(e) => setFormData({ ...formData, seremiId: e.target.value })}
              >
                <option value="">Seleccionar SEREMI...</option>
                {seremis.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre} - {s.sector}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <ModalButtons onCancel={() => setShowModal(false)} onConfirm={handleSubmit} confirmText={editingUsuario ? 'Actualizar' : 'Crear'} />
      </Modal>

      {/* Modal Editar SEREMI */}
      <Modal isOpen={showSeremiModal} onClose={() => setShowSeremiModal(false)} title="Editar Información SEREMI" size="md">
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre SEREMI *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nombre de la SEREMI"
              value={seremiFormData.nombre || ''}
              onChange={(e) => setSeremiFormData({ ...seremiFormData, nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sector *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Salud, Educación, Transportes"
              value={seremiFormData.sector || ''}
              onChange={(e) => setSeremiFormData({ ...seremiFormData, sector: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Región</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Metropolitana, Valparaíso"
              value={seremiFormData.region || ''}
              onChange={(e) => setSeremiFormData({ ...seremiFormData, region: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Datos Adicionales</label>
            <textarea
              className="form-input"
              placeholder="Información adicional de la SEREMI..."
              rows={4}
              value={seremiFormData.datos || ''}
              onChange={(e) => setSeremiFormData({ ...seremiFormData, datos: e.target.value })}
            />
          </div>
        </div>
        <ModalButtons onCancel={() => setShowSeremiModal(false)} onConfirm={handleSubmitSeremi} confirmText="Actualizar SEREMI" />
      </Modal>
    </div>
  );
};
