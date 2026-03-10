import React, { useState } from 'react';
import './TemasAgendaBlocks.css';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const parts = iso.split('-').map(Number);
  return `${parts[2]} ${MESES[parts[1] - 1]}`;
}

function shortNombre(nombre: string): string {
  return nombre.replace('SEREMI de ', '').replace('SEREMI ', '');
}

interface TemasBlockProps {
  data: any[];
  limit?: number;
}

export const TemasBlock: React.FC<TemasBlockProps> = ({ data, limit = 10 }) => {
  // One leading tema per seremi, like reference HTML
  const items = data
    .flatMap(s => (s.temas || []).slice(0, 1).map((t: any) => ({
      tema: t.tema || t,
      prioridad: t.prioridad || '',
      seremi: shortNombre(s.nombre),
      color: s.c1 || 'var(--accent2)',
    })))
    .slice(0, limit);

  if (items.length === 0) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No hay temas propuestos</div>;
  }

  return (
    <div className="temas-list" style={{ padding: '14px 18px' }}>
      {items.map((t, idx) => (
        <div key={idx} className="item-row" style={{ marginBottom: '6px' }}>
          <div
            className="item-icon"
            style={{ background: `${t.color}22`, color: t.color, fontSize: '11px' }}
          >
            💡
          </div>
          <div className="item-content">
            <div className="item-title">{t.tema}</div>
            <div className="item-meta">
              {t.seremi}{t.prioridad ? ` · ${t.prioridad}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AgendaBlock: React.FC<{ data: any[]; limit?: number }> = ({ data, limit = 10 }) => {
  const hitos = data
    .flatMap(s => (s.agenda || []).map((a: any) => ({
      ...a,
      seremi: shortNombre(s.nombre),
    })))
    .sort((a: any, b: any) => (a.fecha || '').localeCompare(b.fecha || ''))
    .slice(0, limit);

  if (hitos.length === 0) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No hay hitos programados</div>;
  }

  return (
    <div className="agenda-list" style={{ padding: '14px 18px' }}>
      {hitos.map((hito: any, idx: number) => (
        <div key={hito.id ?? idx} className="hito">
          <div className="hito-date">{fmtDate(hito.fecha)}</div>
          <div style={{ flex: 1 }}>
            <div className="hito-text">{hito.texto || '—'}</div>
            <div className="hito-cat">{hito.seremi} · {hito.cat || ''}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MESES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function extractTime(hito: any): string {
  // Use dedicated hora field first, then fall back to parsing fecha
  if (hito.hora) return hito.hora.slice(0, 5);
  if (hito.fecha) {
    const match = hito.fecha.match(/(\d{2}:\d{2})/);
    return match ? match[1] : '';
  }
  return '';
}

function fmtDayFull(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS_SEMANA[date.getDay()]} ${d} de ${MESES_FULL[m - 1]} ${y}`;
}

export const AgendaCalendar: React.FC<{ data: any[] }> = ({ data }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const allHitos = data.flatMap(s =>
    (s.agenda || []).map((a: any) => ({
      ...a,
      seremi: shortNombre(s.nombre),
    }))
  );

  const hitosByDate: Record<string, any[]> = {};
  allHitos.forEach(h => {
    if (h.fecha) {
      const key = h.fecha.slice(0, 10);
      hitosByDate[key] = hitosByDate[key] || [];
      hitosByDate[key].push(h);
    }
  });

  const prevMonth = () => {
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleCellClick = (iso: string, events: any[]) => {
    if (events.length === 0) { setSelectedDay(null); return; }
    setSelectedDay(prev => prev === iso ? null : iso);
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const selectedEvents = selectedDay ? (hitosByDate[selectedDay] || []) : [];
  const hasConflict = selectedEvents.length > 1;

  // Sort selected events by time if available
  const sortedSelectedEvents = [...selectedEvents].sort((a, b) => {
    const ta = extractTime(a);
    const tb = extractTime(b);
    return ta.localeCompare(tb);
  });

  return (
    <div className="agenda-calendar">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
        <span className="cal-month-title">{MESES_FULL[month]} {year}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
      </div>
      <div className="cal-grid">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="cal-cell cal-cell--empty" />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const events = hitosByDate[iso] || [];
          const isToday = iso === todayStr;
          const isSelected = iso === selectedDay;
          const isConflict = events.length > 1;
          return (
            <div
              key={iso}
              onClick={() => handleCellClick(iso, events)}
              className={[
                'cal-cell',
                isToday ? 'cal-cell--today' : '',
                events.length ? 'cal-cell--has-events' : '',
                isSelected ? 'cal-cell--selected' : '',
                isConflict ? 'cal-cell--conflict' : '',
              ].filter(Boolean).join(' ')}
              style={{ cursor: events.length ? 'pointer' : 'default' }}
            >
              <div className="cal-cell-day">{day}</div>
              {events.length > 0 && (
                <div className="cal-badge">
                  {isConflict && <span className="cal-badge-conflict">!</span>}
                  {events.slice(0, 2).map((e, i) => (
                    <div key={i} className="cal-event">
                      <span className="cal-event-dot" style={isConflict ? { background: '#ef4444' } : undefined} />
                      <span className="cal-event-label">{e.texto}</span>
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="cal-event-more">+{events.length - 2} más</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="cal-day-panel">
          <div className="cal-day-panel-header">
            <div className="cal-day-panel-title">
              <span>📅</span>
              <span>{fmtDayFull(selectedDay)}</span>
              {hasConflict && (
                <span className="cal-conflict-badge">⚠ {selectedEvents.length} eventos — posible tope</span>
              )}
            </div>
            <button className="cal-panel-close" onClick={() => setSelectedDay(null)}>✕</button>
          </div>
          <div className="cal-day-panel-body">
            {sortedSelectedEvents.map((e, i) => {
              const time = extractTime(e);
              const prevTime = i > 0 ? extractTime(sortedSelectedEvents[i - 1]) : '';
              const topsWithPrev = time && prevTime && time === prevTime;
              return (
                <div key={e.id ?? i} className={`cal-day-event${topsWithPrev ? ' cal-day-event--tope' : ''}`}>
                  <div className="cal-day-event-time">
                    {time || <span className="cal-no-time">Sin hora</span>}
                  </div>
                  <div className="cal-day-event-body">
                    <div className="cal-day-event-title">{e.texto || '—'}</div>
                    <div className="cal-day-event-meta">
                      {e.seremi && <span className="cal-tag">{e.seremi}</span>}
                      {e.cat && <span className="cal-tag">{e.cat}</span>}
                      {e.lugar && <span className="cal-tag cal-tag--lugar">📍 {e.lugar}</span>}
                    </div>
                    {e.notas && <div className="cal-day-event-notas">{e.notas}</div>}
                    {topsWithPrev && (
                      <div className="cal-tope-warn">⚠ Mismo horario que el evento anterior</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
