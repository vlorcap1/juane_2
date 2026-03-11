import React, { useState, useEffect, useRef } from 'react';
import { proyectosApi, nudosApi, temasApi, agendaApi, prensaApi, visitasApi } from '../../api/client';
import './DetailPanel.css';

interface DetailPanelProps {
  seremiId: number;
  seremiNombre: string;
  sector: string;
  periodMonths: number;
  onClose: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmtDate(d?: string) {
  if (!d) return '—';
  if (d.includes('-')) {
    const [y, m, dd] = d.split('-').map(Number);
    const dt = new Date(y, m - 1, dd);
    return `${DIAS[dt.getDay()]} ${dt.getDate()} ${MESES[m - 1]} ${y}`;
  }
  return d;
}

function estadoBadge(estado?: string) {
  if (!estado) return 'badge-blue';
  if (['En ejecución','Activo','Construcción'].includes(estado)) return 'badge-green';
  if (['Licitación','Diseño'].includes(estado)) return 'badge-orange';
  return 'badge-blue';
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  seremiId, seremiNombre, sector, onClose, onExportPDF, onExportExcel
}) => {
  const [proyectos, setProyectos]   = useState<any[]>([]);
  const [nudos,     setNudos]       = useState<any[]>([]);
  const [temas,     setTemas]       = useState<any[]>([]);
  const [agenda,    setAgenda]      = useState<any[]>([]);
  const [prensa,    setPrensa]      = useState<any[]>([]);
  const [comunas,   setComunas]     = useState<string[]>([]);
  const [loading,   setLoading]     = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAll();
  }, [seremiId]);

  useEffect(() => {
    // scroll panel into view after render
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const sid = seremiId.toString();
      const [p, n, t, a, pr, vis] = await Promise.all([
        proyectosApi.getAll(sid),
        nudosApi.getAll(sid),
        temasApi.getAll(sid),
        agendaApi.getAll(sid),
        prensaApi.getAll({ seremiId: sid }),
        visitasApi.getAll({ seremiId: sid }),
      ]);
      setProyectos(p);
      setNudos(n);
      setTemas(t);
      setAgenda(a.sort((x: any, y: any) => (x.fecha || '').localeCompare(y.fecha || '')));
      setPrensa(pr);
      const uniqueComunas = [...new Set<string>(vis.filter((v: any) => v.comuna).map((v: any) => v.comuna as string))];
      setComunas(uniqueComunas.sort());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detail-panel open" ref={panelRef}>
      {/* Header */}
      <div className="detail-header">
        <div>
          <div className="detail-title">{seremiNombre}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{sector}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onExportPDF && (
            <button className="btn-sm dl" onClick={onExportPDF}>⬇ PDF</button>
          )}
          {onExportExcel && (
            <button className="btn-sm dlx" onClick={onExportExcel}>⬇ XLS</button>
          )}
          <button className="detail-close" onClick={onClose}>×</button>
        </div>
      </div>

      {/* Body — 3 columns */}
      {loading ? (
        <div style={{ padding: '28px 24px', color: 'var(--text3)', fontSize: 13 }}>Cargando...</div>
      ) : (
        <div className="detail-body">
          {/* Column 1: Proyectos + Comunas Visitadas */}
          <div className="detail-col">
            <div className="detail-col-title">Proyectos Principales</div>
            <div className="item-list">
              {proyectos.length === 0
                ? <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sin proyectos registrados</div>
                : proyectos.map(p => (
                  <div key={p.id} className="item-row">
                    <div className="item-icon" style={{ background: 'rgba(58,123,213,.1)', color: 'var(--accent2)' }}>📌</div>
                    <div className="item-content">
                      <div className="item-title">{p.title || p.nombre || '—'}</div>
                      <div className="item-meta">Meta: {p.meta || '—'}</div>
                    </div>
                    <span className={`item-badge ${estadoBadge(p.estado)}`}>{p.estado || '—'}</span>
                  </div>
                ))
              }
            </div>

            {/* Comunas Visitadas */}
            <div style={{ marginTop: 16 }}>
              <div className="detail-col-title" style={{ marginBottom: 8 }}>Comunas Visitadas</div>
              {comunas.length === 0
                ? <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sin comunas registradas</div>
                : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {comunas.map(comuna => (
                      <span key={comuna} style={{
                        fontSize: 10,
                        padding: '3px 8px',
                        borderRadius: 20,
                        background: 'rgba(46,196,165,.12)',
                        color: 'var(--accent3)',
                        border: '1px solid rgba(46,196,165,.25)',
                        fontWeight: 500,
                      }}>
                        📍 {comuna}
                      </span>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* Column 2: Nudos + Temas */}
          <div className="detail-col">
            <div className="detail-col-title">Nudos Críticos</div>
            {nudos.length === 0
              ? <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 13 }}>Sin nudos registrados</div>
              : nudos.map(n => (
                <div key={n.id} className="nodo">
                  <div className="nodo-title">⚠ {n.title || n.titulo || '—'} <span style={{ fontSize: 9, opacity: .7 }}>[{n.urgencia || ''}]</span></div>
                  <div className="nodo-desc">{n.desc || n.descripcion || ''}</div>
                </div>
              ))
            }
            <div style={{ marginTop: 13 }}>
              <div className="detail-col-title" style={{ marginBottom: 9 }}>Propuesta de Temas</div>
              <div className="item-list">
                {temas.length === 0
                  ? <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sin temas registrados</div>
                  : temas.map(t => (
                    <div key={t.id} className="item-row">
                      <div className="item-icon" style={{ background: 'rgba(232,160,58,.12)', color: 'var(--accent)' }}>💡</div>
                      <div className="item-content">
                        <div className="item-title">{t.tema || '—'}</div>
                        {t.prioridad && <div className="item-meta">Prioridad: {t.prioridad}</div>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Column 3: Agenda + Prensa */}
          <div className="detail-col">
            <div className="detail-col-title">Agenda de Hitos</div>
            {agenda.length === 0
              ? <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 13 }}>Sin hitos registrados</div>
              : agenda.slice(0, 6).map(a => (
                <div key={a.id} className="hito">
                  <div className="hito-date">{fmtDate(a.fecha)}{a.hora ? ` · ${a.hora}` : ''}</div>
                  <div className="hito-text">{a.texto || '—'}</div>
                  <div className="hito-cat">{a.cat || ''}</div>
                </div>
              ))
            }
            <div style={{ marginTop: 13 }}>
              <div className="detail-col-title" style={{ marginBottom: 9 }}>Prensa Reciente</div>
              {prensa.length === 0
                ? <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sin prensa registrada</div>
                : prensa.slice(0, 5).map(p => (
                  <div key={p.id} className="item-row" style={{ marginBottom: 5 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                      background: p.tono === 'pos' ? 'var(--accent3)' : p.tono === 'neg' ? 'var(--danger)' : 'var(--text3)'
                    }} />
                    <div className="item-content">
                      <div className="item-title" style={{ fontSize: 10 }}>{p.titular || '—'}</div>
                      <div className="item-meta">{p.medio || '—'} · {fmtDate(p.fecha)}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

