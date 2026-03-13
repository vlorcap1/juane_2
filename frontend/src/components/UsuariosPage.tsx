/**
 * Página de Gestión de Usuarios y SEREMís - Diseño profesional
 */
import React, { useState, useEffect } from 'react';
import { Lock, User as UserIcon, Mail, Phone, Pencil, Trash2, Plus } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Modal } from './ui/Modal';
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
  const [editingUsuario, setEditingUsuario] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, seremisData] = await Promise.all([
        usersApi.getAll(),
        seremisApi.getAll()
      ]);
      setUsuarios(usersData);
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
      cargo: '',
      password: '',
      email: '',
      tel: '',
      rol: 'seremi',
      seremiId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (usuario: User) => {
    setEditingUsuario(usuario);
    setFormData({
      username: usuario.username,
      nombre: usuario.nombre,
      cargo: usuario.cargo || '',
      email: usuario.email || '',
      tel: usuario.tel || '',
      rol: usuario.rol,
      seremiId: usuario.seremiId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;

    try {
      await usersApi.delete(id);
      showToast('Usuario eliminado', 'success');
      loadData();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showToast('Error al eliminar usuario', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.username) {
      showToast('Nombre y usuario son obligatorios', 'error');
      return;
    }

    if (!editingUsuario && !formData.password) {
      showToast('La contraseña es obligatoria para usuarios nuevos', 'error');
      return;
    }

    const rol = formData.rol;
    const seremiId = rol === 'seremi' ? formData.seremiId : '';

    if (rol === 'seremi' && !seremiId) {
      showToast('Selecciona la SEREMI asignada', 'error');
      return;
    }

    try {
      const payload: any = {
        nombre: formData.nombre,
        username: formData.username,
        rol,
        cargo: formData.cargo || '',
        email: formData.email || '',
        tel: formData.tel || '',
        seremiId: seremiId || undefined
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUsuario) {
        await usersApi.update(editingUsuario.id, payload);
        showToast('Usuario actualizado', 'success');
      } else {
        await usersApi.create(payload);
        showToast('Usuario creado', 'success');
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showToast('Error al guardar usuario', 'error');
    }
  };

  const getSeremiNombre = (seremiId: string | undefined) => {
    if (!seremiId) return '—';
    const seremi = seremis.find(s => s.sector === seremiId);
    return seremi ? seremi.nombre : '—';
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}><Lock size={48} /></div>
        <div style={{ fontSize: '18px', color: 'var(--text)' }}>Acceso restringido</div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px' }}>
          Solo administradores pueden gestionar usuarios
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div className="section-title">Gestión de Usuarios y SEREMís</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
            Administra los datos de cada SEREMI y sus credenciales de acceso
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Agregar Usuario</button>
      </div>

      {/* Users Grid */}
      <div className="admin-users-grid">
        {usuarios.map((u) => {
          const seremiNombre = getSeremiNombre(u.seremiId);
          return (
            <div key={u.id} className="user-card">
              <div className="user-card-top">
                <div 
                  className="user-card-avatar" 
                  style={{ background: u.rol === 'admin' ? 'linear-gradient(135deg,#e8a03a,#c97a20)' : 'var(--accent2)' }}
                >
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="user-card-name">
                      {u.cargo ? `${u.cargo} ` : ''}{u.nombre}
                    </div>
                    <span className={`user-card-role ${u.rol === 'admin' ? 'role-admin' : 'role-seremi'}`}>
                      {u.rol === 'admin' ? 'Admin' : 'SEREMI'}
                    </span>
                  </div>
                  <div className="user-card-seremi">
                    {seremiNombre !== '—' ? seremiNombre : u.rol === 'admin' ? 'Administrador del sistema' : ''}
                  </div>
                </div>
              </div>
              <div className="user-card-meta">
                <div className="user-meta-item"><UserIcon size={13} /> <strong>{u.username}</strong></div>
                {u.email && <div className="user-meta-item"><Mail size={13} /> <strong>{u.email}</strong></div>}
                {u.tel && <div className="user-meta-item"><Phone size={13} /> <strong>{u.tel}</strong></div>}
              </div>
              <div className="user-card-actions">
                <button 
                  className="btn btn-ghost" 
                  style={{ flex: 1, fontSize: '11px' }} 
                  onClick={() => handleEdit(u)}
                >
                  <Pencil size={13} /> Editar
                </button>
                {u.id !== 'admin' && (
                  <button 
                    className="btn btn-danger2" 
                    style={{ fontSize: '11px' }} 
                    onClick={() => handleDelete(u.id)}
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add User Card */}
        <div className="add-user-card" onClick={handleCreate}>
          <div className="add-user-card-icon"><Plus size={24} /></div>
          <div>Agregar usuario</div>
        </div>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingUsuario ? 'Editar Usuario' : 'Agregar Usuario'}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">NOMBRE COMPLETO *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nombre y apellidos"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">USUARIO *</label>
              <input
                type="text"
                className="form-input"
                placeholder="usuario"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingUsuario}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">CARGO</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: SEREMI de Salud"
              value={formData.cargo || ''}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">CONTRASEÑA {editingUsuario ? '(dejar vacío para mantener)' : '*'}</label>
            <input
              type="password"
              className="form-input"
              placeholder={editingUsuario ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input
                type="email"
                className="form-input"
                placeholder="correo@ejemplo.cl"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">TELÉFONO</label>
              <input
                type="text"
                className="form-input"
                placeholder="+56 9 1234 5678"
                value={formData.tel || ''}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ROL *</label>
            <select
              className="form-select"
              value={formData.rol || 'seremi'}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            >
              <option value="seremi">SEREMI</option>
              <option value="admin">Administrador</option>
              <option value="guest">Invitado</option>
            </select>
          </div>

          {formData.rol === 'seremi' && (
            <div className="form-group">
              <label className="form-label">SEREMI ASIGNADA *</label>
              <select
                className="form-select"
                value={formData.seremiId || ''}
                onChange={(e) => setFormData({ ...formData, seremiId: e.target.value })}
              >
                <option value="">Seleccionar SEREMI...</option>
                {seremis.map((s) => (
                  <option key={s.id} value={s.sector}>{s.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingUsuario ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
