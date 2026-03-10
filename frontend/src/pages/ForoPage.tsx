import { useState, FC } from 'react';
import { useForo, useAuth } from '../hooks/useApi';
import Header from '../components/Header';
import { formatDate, formatDateTime } from '../utils/dateUtils';

interface ForoPageProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ForoPage: FC<ForoPageProps> = ({ activeTab, onTabChange }) => {
  const { user, logout, isAdmin } = useAuth();
  const { temas, loading: foroLoading, createTema, createPost } = useForo();
  const [selectedTema, setSelectedTema] = useState<number | null>(null);
  const [showNewTemaForm, setShowNewTemaForm] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newTemaData, setNewTemaData] = useState({
    titulo: '',
    descripcion: ''
  });
  const [newPostContent, setNewPostContent] = useState('');

  const handleLogout = () => {
    logout();
  };

  const selectedTemaData = selectedTema 
    ? temas.find(t => t.id === selectedTema) 
    : null;

  const temaPosts: any[] = []; // Empty for now since posts is not available in hook

  const handleCreateTema = async () => {
    if (!newTemaData.titulo.trim() || !newTemaData.descripcion.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      await createTema({
        titulo: newTemaData.titulo.trim(),
        descripcion: newTemaData.descripcion.trim()
      });
      setNewTemaData({ titulo: '', descripcion: '' });
      setShowNewTemaForm(false);
    } catch (error) {
      alert('Error al crear el tema');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedTema) {
      alert('Por favor escriba un mensaje');
      return;
    }

    try {
      await createPost({
        temaId: selectedTema,
        contenido: newPostContent.trim()
      });
      setNewPostContent('');
      setShowNewPostForm(false);
    } catch (error) {
      alert('Error al crear el post');
    }
  };

  const detectMentions = (texto: string) => {
    if (!texto) return texto;
    
    // Detectar menciones con @usuario
    return texto.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  };

  return (
    <div className="main-app">
      <Header currentPeriod="2024" onLogout={handleLogout} user={user} />
      
      {/* Tab Navigation */}
      {isAdmin ? (
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'contrataciones' ? 'active' : ''}`}
            onClick={() => onTabChange('contrataciones')}
          >
            📋 Contrataciones
          </button>
          <button
            className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => onTabChange('usuarios')}
          >
            👥 Usuarios y SEREMIs
          </button>
          <button
            className={`tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
            onClick={() => onTabChange('kpis')}
          >
            📈 KPIs / Indicadores
          </button>
          <button
            className={`tab-btn ${activeTab === 'foro' ? 'active' : ''}`}
            onClick={() => onTabChange('foro')}
          >
            💬 Foro
          </button>
        </div>
      ) : (
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'miseremi' ? 'active' : ''}`}
            onClick={() => onTabChange('miseremi')}
          >
            📋 Mi SEREMI
          </button>
          <button
            className={`tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
            onClick={() => onTabChange('kpis')}
          >
            📈 Mis KPIs
          </button>
          <button
            className={`tab-btn ${activeTab === 'contrataciones' ? 'active' : ''}`}
            onClick={() => onTabChange('contrataciones')}
          >
            📋 Mis Contrataciones
          </button>
          <button
            className={`tab-btn ${activeTab === 'foro' ? 'active' : ''}`}
            onClick={() => onTabChange('foro')}
          >
            💬 Foro
          </button>
        </div>
      )}

      <div className="container">
        {foroLoading ? (
          <div className="loading">Cargando foro...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Panel izquierdo - Lista de Temas */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h2 style={{ 
                  fontSize: '18px', 
                  color: 'var(--text)',
                  fontFamily: '"DM Serif Display", serif'
                }}>
                  Temas del Foro ({temas.length})
                </h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewTemaForm(true)}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  + Nuevo Tema
                </button>
              </div>

              {/* Formulario Nuevo Tema */}
              {showNewTemaForm && (
                <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text)' }}>
                    Crear Nuevo Tema
                  </h3>
                  <input
                    type="text"
                    placeholder="Título del tema"
                    value={newTemaData.titulo}
                    onChange={(e) => setNewTemaData({...newTemaData, titulo: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      marginBottom: '8px',
                      fontSize: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--bg2)'
                    }}
                  />
                  <textarea
                    placeholder="Descripción del tema"
                    value={newTemaData.descripcion}
                    onChange={(e) => setNewTemaData({...newTemaData, descripcion: e.target.value})}
                    rows={3}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      marginBottom: '12px',
                      fontSize: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--bg2)',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn"
                      onClick={() => setShowNewTemaForm(false)}
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateTema}
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Crear Tema
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Temas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {temas.map(tema => (
                  <div
                    key={tema.id}
                    className={`card ${selectedTema === tema.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTema(tema.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      border: selectedTema === tema.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'border-color 0.15s'
                    }}
                  >
                    <h3 style={{ 
                      fontSize: '13px', 
                      color: 'var(--text)', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>
                      {tema.titulo}
                    </h3>
                    <p style={{ 
                      fontSize: '11px', 
                      color: 'var(--text3)', 
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {tema.descripcion.length > 100 
                        ? tema.descripcion.substring(0, 97) + '...'
                        : tema.descripcion
                      }
                    </p>
                    <div style={{ 
                      fontSize: '10px', 
                      color: 'var(--text3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Por {tema.autorNombre || 'Usuario'}</span>
                      <span>{formatDate(tema.fechaCreacion)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel derecho - Posts del Tema */}
            <div>
              {selectedTemaData ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ 
                      fontSize: '18px', 
                      color: 'var(--text)',
                      fontFamily: '"DM Serif Display", serif',
                      marginBottom: '8px'
                    }}>
                      {selectedTemaData.titulo}
                    </h2>
                    <p style={{ 
                      fontSize: '12px', 
                      color: 'var(--text2)',
                      lineHeight: '1.5'
                    }}>
                      {selectedTemaData.descripcion}
                    </p>
                    <div style={{ 
                      fontSize: '10px', 
                      color: 'var(--text3)',
                      marginTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Creado por {selectedTemaData.autorNombre || 'Usuario'}</span>
                      <span>{formatDate(selectedTemaData.fechaCreacion)}</span>
                    </div>
                  </div>

                  {/* Formulario Nuevo Post */}
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowNewPostForm(!showNewPostForm)}
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      {showNewPostForm ? 'Cancelar' : 'Responder'}
                    </button>
                  </div>

                  {showNewPostForm && (
                    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                      <textarea
                        placeholder="Escriba su respuesta... (Puede mencionar a otros usuarios con @username)"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={4}
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          marginBottom: '12px',
                          fontSize: '12px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          background: 'var(--bg2)',
                          resize: 'vertical'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn"
                          onClick={() => setShowNewPostForm(false)}
                          style={{ fontSize: '11px', padding: '6px 12px' }}
                        >
                          Cancelar
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreatePost}
                          style={{ fontSize: '11px', padding: '6px 12px' }}
                        >
                          Enviar Respuesta
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Posts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {temaPosts.map((post: any) => (
                      <div key={post.id} className="card" style={{ padding: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px' 
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: post.autorRol === 'admin' ? 'var(--accent)' : 'var(--accent2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#fff'
                            }}>
                              {(post.autorNombre || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '600' }}>
                                {post.autorNombre || 'Usuario'}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text3)' }}>
                                {post.autorRol === 'admin' ? 'Administrador' : 'SEREMI'}
                              </div>
                            </div>
                          </div>
                          <time style={{ fontSize: '10px', color: 'var(--text3)' }}>
                            {formatDateTime(post.fechaCreacion)}
                          </time>
                        </div>
                        <div 
                          style={{ 
                            fontSize: '12px', 
                            color: 'var(--text2)',
                            lineHeight: '1.5'
                          }}
                          dangerouslySetInnerHTML={{
                            __html: detectMentions(post.contenido)
                          }}
                        />
                      </div>
                    ))}
                    
                    {temaPosts.length === 0 && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        color: 'var(--text3)',
                        fontSize: '12px'
                      }}>
                        No hay respuestas en este tema aún.
                        <br />
                        ¡Sé el primero en responder!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: 'var(--text3)',
                  fontSize: '14px'
                }}>
                  Selecciona un tema para ver las discusiones
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForoPage;