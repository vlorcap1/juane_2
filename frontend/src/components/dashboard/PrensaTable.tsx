import React from 'react';
import './PrensaTable.css';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const parts = iso.split('-').map(Number);
  return `${parts[2]} ${MESES[parts[1] - 1]} ${parts[0]}`;
}

function shortNombre(nombre: string): string {
  return nombre.replace('SEREMI de ', '').replace('SEREMI ', '');
}

interface PrensaTableProps {
  data: any[];
  limit?: number;
}

export const PrensaTable: React.FC<PrensaTableProps> = ({ data, limit = 10 }) => {
  const items = data
    .flatMap(s => (s.prensaItems || []).map((p: any) => ({ ...p, seremiNombre: shortNombre(s.nombre) })))
    .slice(0, limit);

  if (items.length === 0) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No hay apariciones en prensa</div>;
  }

  const tonoColor = (tono?: string) => {
    if (tono === 'pos') return 'var(--accent3)';
    if (tono === 'neg') return 'var(--danger)';
    return 'var(--text3)';
  };

  const tonoLabel = (tono?: string) => {
    if (tono === 'pos') return 'Positivo';
    if (tono === 'neg') return 'Negativo';
    return 'Neutro';
  };

  return (
    <table className="prensa-table">
      <thead>
        <tr>
          <th>Titular</th>
          <th>Medio</th>
          <th>SEREMI</th>
          <th>Fecha</th>
          <th>Tono</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={item.id ?? idx}>
            <td className="prensa-title-cell">{item.titular || '—'}</td>
            <td>{item.medio || '—'}</td>
            <td><span className="seremi-tag">{item.seremiNombre}</span></td>
            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>{fmtDate(item.fecha)}</td>
            <td>
              <span className="sentiment" style={{ background: tonoColor(item.tono) }} />
              {tonoLabel(item.tono)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
