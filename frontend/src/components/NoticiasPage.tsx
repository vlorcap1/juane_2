import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, Settings, Pencil, Trash2, Check, Clock, AlertTriangle, Inbox } from 'lucide-react';
import './NoticiasPage.css';

/* ─── Types ─────────────────────────────────────────────── */
interface NoticiaAlerta {
  id: number;
  titulo: string;
  enlace: string;
  fecha: string;
  fuente: string;
  etiqueta: string;
  guardadoEn: string;
}

interface FuenteRSS {
  id: number;
  etiqueta: string;
  url: string;
  activo: boolean;
  creadoEn: string;
}

interface NoticiasPageProps {
  user: any;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/* ─── Helpers ───────────────────────────────────────────── */
function formatDate(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPlaceholderUrl(url: string): boolean {
  return url.includes('REEMPLAZAR');
}

/* ─── Component ─────────────────────────────────────────── */
const NoticiasPage: React.FC<NoticiasPageProps> = ({ user }) => {
  const isAdmin = user?.rol === 'admin';

  // Noticias state
  const [noticias, setNoticias] = useState<NoticiaAlerta[]>([]);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [activeEtiqueta, setActiveEtiqueta] = useState<string>('todas');
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [noticiaError, setNoticiaError] = useState('');

  // Fuentes state
  const [fuentes, setFuentes] = useState<FuenteRSS[]>([]);
  const [loadingFuentes, setLoadingFuentes] = useState(false);
  const [showFuentes, setShowFuentes] = useState(false);
  const [newEtiqueta, setNewEtiqueta] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [savingFuente, setSavingFuente] = useState(false);
  const [fuenteError, setFuenteError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ etiqueta: '', url: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  /* ── Fetch noticias ─────────────────────────────────── */
  const fetchNoticias = useCallback(async (etiqueta?: string) => {
    setLoadingNoticias(true);
    setNoticiaError('');
    try {
      const params = etiqueta && etiqueta !== 'todas' ? `?etiqueta=${encodeURIComponent(etiqueta)}&limit=80` : '?limit=80';
      const res = await fetch(`${API_BASE}/api/noticias${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setNoticias(data);
    } catch (e: any) {
      setNoticiaError('No se pudo cargar las noticias.');
    } finally {
      setLoadingNoticias(false);
    }
  }, []);

  const fetchEtiquetas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/noticias/etiquetas`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setEtiquetas(data);
    } catch { /* silently fail */ }
  }, []);

  /* ── Fetch fuentes ──────────────────────────────────── */
  const fetchFuentes = useCallback(async () => {
    setLoadingFuentes(true);
    try {
      const res = await fetch(`${API_BASE}/api/fuentes-rss`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFuentes(data);
    } catch {
      setFuenteError('No se pudo cargar las fuentes RSS.');
    } finally {
      setLoadingFuentes(false);
    }
  }, []);

  useEffect(() => {
    fetchNoticias('todas');
    fetchEtiquetas();
  }, [fetchNoticias, fetchEtiquetas]);

  useEffect(() => {
    if (showFuentes && isAdmin) fetchFuentes();
  }, [showFuentes, isAdmin, fetchFuentes]);

  /* ── Sync manual ────────────────────────────────────── */
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/noticias/sync`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setSyncMsg(`${data.nuevas} nuevas noticias agregadas`);
      fetchNoticias(activeEtiqueta);
      fetchEtiquetas();
    } catch (e: any) {
      setSyncMsg('Error al sincronizar. Revise las URLs de las fuentes.');
    } finally {
      setSyncing(false);
    }
  };

  /* ── Cambiar etiqueta filter ────────────────────────── */
  const handleEtiqueta = (et: string) => {
    setActiveEtiqueta(et);
    fetchNoticias(et);
  };

  /* ── Toggle fuente activo ───────────────────────────── */
  const toggleActivo = async (fuente: FuenteRSS) => {
    try {
      await fetch(`${API_BASE}/api/fuentes-rss/${fuente.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ etiqueta: fuente.etiqueta, url: fuente.url, activo: !fuente.activo }),
      });
      setFuentes(prev => prev.map(f => f.id === fuente.id ? { ...f, activo: !f.activo } : f));
    } catch { /* ignore */ }
  };

  /* ── Delete fuente ──────────────────────────────────── */
  const deleteFuente = async (id: number) => {
    if (!window.confirm('¿Eliminar esta fuente RSS?')) return;
    try {
      await fetch(`${API_BASE}/api/fuentes-rss/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      setFuentes(prev => prev.filter(f => f.id !== id));
    } catch { /* ignore */ }
  };

  /* ── Edit fuente ────────────────────────────────────── */
  const startEdit = (f: FuenteRSS) => {
    setEditingId(f.id);
    setEditDraft({ etiqueta: f.etiqueta, url: f.url });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const saveEdit = async (fuente: FuenteRSS) => {
    if (!editDraft.etiqueta.trim() || !editDraft.url.trim()) return;
    setSavingEdit(true);
    setEditError('');
    try {
      const res = await fetch(`${API_BASE}/api/fuentes-rss/${fuente.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          etiqueta: editDraft.etiqueta.trim(),
          url: editDraft.url.trim(),
          activo: fuente.activo,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const updated = await res.json();
      setFuentes(prev => prev.map(f => f.id === fuente.id ? updated : f));
      setEditingId(null);
    } catch (e: any) {
      setEditError(e.message || 'Error al guardar.');
    } finally {
      setSavingEdit(false);
    }
  };

  /* ── Add fuente ─────────────────────────────────────── */
  const addFuente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEtiqueta.trim() || !newUrl.trim()) return;
    setSavingFuente(true);
    setFuenteError('');
    try {
      const res = await fetch(`${API_BASE}/api/fuentes-rss`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ etiqueta: newEtiqueta.trim(), url: newUrl.trim(), activo: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const created = await res.json();
      setFuentes(prev => [...prev, created]);
      setNewEtiqueta('');
      setNewUrl('');
    } catch (e: any) {
      setFuenteError(e.message || 'Error al guardar la fuente.');
    } finally {
      setSavingFuente(false);
    }
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="noticias-page">

      {/* ── Header ─────────────────────────────────── */}
      <div className="noticias-header">
        <div>
          <div className="noticias-title"><Newspaper size={18} /> Noticias RSS</div>
          <div className="noticias-subtitle">Alertas automáticas · sincronización diaria 06:00</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            {syncing ? <><Clock size={14} /> Sincronizando...</> : <><RefreshCw size={14} /> Sincronizar ahora</>}
          </button>
        )}
      </div>

      {/* ── Mensaje sync ───────────────────────────── */}
      {syncMsg && (
        <div className="sync-bar">
          <span>{syncMsg}</span>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '12px' }}
            onClick={() => setSyncMsg('')}
          >✕</button>
        </div>
      )}

      {/* ── Fuentes RSS (admin, arriba) ─────────────── */}
      {isAdmin && (
        <div className="fuentes-section">
          <button className="fuentes-toggle" onClick={() => setShowFuentes(v => !v)}>
            <span>{showFuentes ? '▾' : '▸'}</span>
            <span><Settings size={14} /> Gestionar fuentes RSS</span>
            <span style={{ marginLeft: 'auto', fontWeight: 400, color: 'var(--text3)' }}>
              {fuentes.length} fuentes configuradas
            </span>
          </button>

          {showFuentes && (
            <div className="fuentes-panel">
              <div className="fuentes-panel-header">
                <span className="fuentes-panel-title">Fuentes RSS</span>
                {loadingFuentes && <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Cargando...</span>}
              </div>

              {fuentes.map(f => (
                <div key={f.id} className="fuente-row" style={{ flexWrap: 'wrap' }}>
                  {editingId === f.id ? (
                    /* ── Modo edición ── */
                    <>
                      <div className="fuente-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          className="noticias-input"
                          type="text"
                          placeholder="Etiqueta"
                          value={editDraft.etiqueta}
                          onChange={e => setEditDraft(d => ({ ...d, etiqueta: e.target.value }))}
                          autoFocus
                        />
                        <input
                          className="noticias-input"
                          type="url"
                          placeholder="https://www.google.com/alerts/feeds/…"
                          value={editDraft.url}
                          onChange={e => setEditDraft(d => ({ ...d, url: e.target.value }))}
                        />
                        {editError && <span style={{ fontSize: '10px', color: 'var(--danger)' }}>{editError}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '11px', padding: '5px 14px' }}
                          onClick={() => saveEdit(f)}
                          disabled={savingEdit || !editDraft.etiqueta.trim() || !editDraft.url.trim()}
                        >
                          {savingEdit ? '...' : 'Guardar'}
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={cancelEdit}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    /* ── Modo vista ── */
                    <>
                      <div
                        className="fuente-indicator"
                        style={{ background: f.activo ? 'var(--accent3, #4ade80)' : 'var(--text3)' }}
                      />
                      <div className="fuente-info">
                        <div className="fuente-etiqueta">{f.etiqueta}</div>
                        <div className={`fuente-url ${isPlaceholderUrl(f.url) ? 'fuente-placeholder' : ''}`}>
                          {isPlaceholderUrl(f.url) ? <><AlertTriangle size={12} /> URL placeholder — reemplazar con URL real de Google Alerts</> : f.url}
                        </div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={() => startEdit(f)}>
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        className={`btn ${f.activo ? 'btn-success' : 'btn-ghost'}`}
                        style={{ fontSize: '11px', padding: '5px 12px' }}
                        onClick={() => toggleActivo(f)}
                        title={f.activo ? 'Desactivar' : 'Activar'}
                      >
                        {f.activo ? <><Check size={12} /> Activa</> : 'Inactiva'}
                      </button>
                      <button
                        className="btn btn-danger2"
                        style={{ fontSize: '11px', padding: '5px 10px' }}
                        onClick={() => deleteFuente(f.id)}
                        title="Eliminar fuente"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {fuentes.length === 0 && !loadingFuentes && (
                <div style={{ padding: '16px 18px', fontSize: '12px', color: 'var(--text3)' }}>
                  No hay fuentes configuradas.
                </div>
              )}

              {/* ── Agregar nueva fuente ── */}
              <form className="add-fuente-form" onSubmit={addFuente}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label>Etiqueta</label>
                  <input
                    className="noticias-input"
                    type="text"
                    placeholder="Ej: Región del Maule"
                    value={newEtiqueta}
                    onChange={e => setNewEtiqueta(e.target.value)}
                    style={{ minWidth: '160px' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label>URL del feed RSS</label>
                  <input
                    className="noticias-input"
                    type="url"
                    placeholder="https://www.google.com/alerts/feeds/…"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingFuente || !newEtiqueta.trim() || !newUrl.trim()}
                  style={{ alignSelf: 'flex-end' }}
                >
                  {savingFuente ? 'Guardando...' : '+ Agregar'}
                </button>
              </form>

              {fuenteError && (
                <div style={{ padding: '8px 18px', fontSize: '11px', color: 'var(--danger)' }}>
                  {fuenteError}
                </div>
              )}

              <div style={{ padding: '12px 18px', fontSize: '11px', color: 'var(--text3)', borderTop: '1px solid var(--border)', lineHeight: 1.6 }}>
                <strong>¿Cómo obtener la URL RSS de Google Alerts?</strong><br />
                1. Ve a <strong>google.com/alerts</strong> → crea o abre una alerta.<br />
                2. Haz clic en el icono de RSS (feed) → copia la URL del feed.<br />
                3. Pega esa URL aquí y asígnale una etiqueta descriptiva.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filtros por etiqueta ────────────────────── */}
      <div className="noticias-filters">
        <button
          className={`etiqueta-btn ${activeEtiqueta === 'todas' ? 'active' : ''}`}
          onClick={() => handleEtiqueta('todas')}
        >
          Todas
        </button>
        {etiquetas.map(et => (
          <button
            key={et}
            className={`etiqueta-btn ${activeEtiqueta === et ? 'active' : ''}`}
            onClick={() => handleEtiqueta(et)}
          >
            {et}
          </button>
        ))}
      </div>

      {/* ── Lista de noticias ──────────────────────── */}
      {loadingNoticias ? (
        <div className="noticias-empty">
          <div className="noticias-empty-icon"><Clock size={32} /></div>
          Cargando noticias...
        </div>
      ) : noticiaError ? (
        <div className="noticias-empty" style={{ color: 'var(--danger)' }}>
          <div className="noticias-empty-icon"><AlertTriangle size={32} /></div>
          {noticiaError}
        </div>
      ) : noticias.length === 0 ? (
        <div className="noticias-empty">
          <div className="noticias-empty-icon"><Inbox size={32} /></div>
          <div>No hay noticias aún.</div>
          {isAdmin && (
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Haz clic en <strong>"Sincronizar ahora"</strong> o espera la sincronización automática a las 06:00.
            </div>
          )}
        </div>
      ) : (
        <div className="noticias-list">
          {noticias.map(n => (
            <div key={n.id} className="noticia-card">
              <div className="noticia-etiqueta-dot" />
              <div className="noticia-content">
                <div className="noticia-titulo">
                  <a href={n.enlace} target="_blank" rel="noopener noreferrer">
                    {n.titulo}
                  </a>
                </div>
                <div className="noticia-meta">
                  <span className="noticia-badge">{n.etiqueta}</span>
                  {n.fuente && <span className="noticia-fuente">{n.fuente}</span>}
                  <span className="noticia-fecha">{formatDate(n.fecha)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default NoticiasPage;
