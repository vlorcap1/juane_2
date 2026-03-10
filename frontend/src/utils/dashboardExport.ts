/**
 * Exportación client-side del Dashboard (PDF + Excel)
 * Replica la lógica del index.html de referencia usando jsPDF y SheetJS.
 */
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// ─── Helpers de fecha ────────────────────────────────────────────────────────
const MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parts = iso.split('-').map(Number);
  const [y, m, d] = parts;
  return `${d} ${MESES_ES[m - 1]} ${y}`;
}

function getPeriodoLabel(): string {
  const now = new Date();
  return `${MESES_ES[now.getMonth()]} ${now.getFullYear()}`;
}

function getPeriodoFile(): string {
  const now = new Date();
  return `${MESES_ES[now.getMonth()]}${now.getFullYear()}`;
}

// ─── buildPDF: genera una página por SEREMI ──────────────────────────────────
function buildPDF(doc: jsPDF, s: any): void {
  const W = doc.internal.pageSize.getWidth();
  const m = 18;
  const cw = W - m * 2;
  const periodo = getPeriodoLabel();

  // Fondo oscuro
  doc.setFillColor(11, 15, 26);
  doc.rect(0, 0, W, 297, 'F');

  // Cabecera
  doc.setFillColor(21, 30, 46);
  doc.rect(0, 0, W, 26, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(232, 237, 245);
  doc.text(s.nombre, m, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(143, 163, 191);
  doc.text(`Período: ${periodo}  ·  Región del Maule`, m, 19);

  let y = 34;

  // KPI boxes
  const nudosLen = (s.nudosArray || []).length || s.nudos || 0;
  const kpis = [
    { l: 'Visitas',           v: s.visitas   || 0 },
    { l: 'Personas/Eventos',  v: s.contactos || 0 },
    { l: 'Prensa',            v: s.prensa    || 0 },
    { l: 'Proyectos',         v: s.proyectos || 0 },
    { l: 'Nudos',             v: nudosLen        },
  ];
  const bw = (cw - 8 * 4) / 5;
  kpis.forEach((k, i) => {
    const bx = m + i * (bw + 8);
    doc.setFillColor(21, 30, 46);
    doc.roundedRect(bx, y, bw, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(232, 237, 245);
    doc.text(String(k.v), bx + bw / 2, y + 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(78, 100, 128);
    doc.text(k.l, bx + bw / 2, y + 15, { align: 'center' });
  });
  y += 26;

  // Helper sección
  const sec = (title: string, yy: number): number => {
    doc.setFillColor(21, 30, 46);
    doc.rect(m, yy, cw, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(58, 123, 213);
    doc.text(title.toUpperCase(), m + 3, yy + 5);
    return yy + 11;
  };

  // Comunas Visitadas
  y = sec('Comunas Visitadas', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(143, 163, 191);
  const comunasText = (s.comunas || []).join(' · ') || '—';
  doc.text(comunasText, m, y);
  y += 9;

  // Proyectos Principales
  y = sec('Proyectos Principales', y);
  const proyectos: any[] = s.descripProyectos || [];
  if (proyectos.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(143, 163, 191);
    doc.text('Sin proyectos registrados', m + 2, y);
    y += 12;
  } else {
    proyectos.slice(0, 4).forEach(p => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(232, 237, 245);
      doc.text(`• ${p.title || ''}`, m + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(143, 163, 191);
      doc.text(`  Meta: ${p.meta || '—'} · ${p.estado || '—'}`, m + 2, y + 5);
      y += 12;
    });
  }
  y += 3;

  // Nudos Críticos
  y = sec('Nudos Críticos', y);
  const nudos: any[] = s.nudosArray || [];
  if (nudos.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(143, 163, 191);
    doc.text('Sin nudos críticos registrados', m + 2, y);
    y += 12;
  } else {
    nudos.slice(0, 3).forEach(n => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(232, 84, 84);
      doc.text(`! ${n.title || ''}  [${n.urgencia || ''}]`, m + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(143, 163, 191);
      const ls: string[] = doc.splitTextToSize(n.desc || '', cw - 6);
      ls.slice(0, 2).forEach((l: string) => { doc.text(l, m + 4, y + 5); y += 5; });
      y += 8;
    });
  }

  // Propuesta de Temas
  y = sec('Propuesta de Temas', y);
  const temas: any[] = s.temas || [];
  if (temas.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(143, 163, 191);
    doc.text('Sin temas propuestos', m + 2, y);
    y += 7;
  } else {
    temas.slice(0, 4).forEach(t => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(232, 160, 58);
      const prio = t.prioridad ? ` [${t.prioridad}]` : '';
      doc.text(`-> ${t.tema || ''}${prio}`, m + 2, y);
      y += 7;
    });
  }
  y += 3;

  // Agenda de Hitos
  y = sec('Agenda de Hitos', y);
  const agenda: any[] = s.agenda || [];
  if (agenda.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(143, 163, 191);
    doc.text('Sin hitos registrados', m + 2, y);
    y += 12;
  } else {
    agenda.slice(0, 3).forEach(a => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(232, 160, 58);
      doc.text(fmtDate(a.fecha), m + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(232, 237, 245);
      doc.text(a.texto || '', m + 30, y);
      doc.setFontSize(8);
      doc.setTextColor(78, 100, 128);
      doc.text(a.cat || '', m + 30, y + 5);
      y += 12;
    });
  }
  y += 3;

  // Prensa Reciente
  y = sec('Prensa Reciente', y);
  const prensa: any[] = s.prensaItems || [];
  if (prensa.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(143, 163, 191);
    doc.text('Sin apariciones en prensa', m + 2, y);
  } else {
    prensa.slice(0, 4).forEach(p => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(232, 237, 245);
      doc.text(`• ${p.titular || ''}`, m + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(143, 163, 191);
      const tono = p.tono === 'pos' ? 'Positivo' : p.tono === 'neg' ? 'Negativo' : 'Neutro';
      doc.text(`  ${p.medio || ''}  ·  ${fmtDate(p.fecha)}  ·  ${tono}`, m + 2, y + 5);
      y += 12;
    });
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(78, 100, 128);
  doc.text(
    `Gobierno Regional del Maule  ·  Generado el ${new Date().toLocaleDateString('es-CL')}  ·  Uso interno`,
    m, 289
  );
}

// ─── buildWorkbook: Excel multi-hoja ─────────────────────────────────────────
function buildWorkbook(data: any[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen General
  const ws1 = XLSX.utils.json_to_sheet(data.map(s => ({
    'SEREMI':            s.nombre,
    'Sector':            s.sector,
    'Visitas':           s.visitas      || 0,
    'Personas/Eventos':  s.contactos    || 0,
    'Prensa':            s.prensa       || 0,
    'Proyectos':         s.proyectos    || 0,
    'Nudos':             (s.nudosArray || []).length || s.nudos || 0,
    'Comunas':           (s.comunas || []).join(', '),
    'Período':           getPeriodoLabel(),
  })));
  ws1['!cols'] = [
    { wch: 35 }, { wch: 20 }, { wch: 9 }, { wch: 16 },
    { wch: 9 }, { wch: 11 }, { wch: 9 }, { wch: 45 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen General');

  // Hoja 2: Proyectos
  const ws2 = XLSX.utils.json_to_sheet(
    data.flatMap(s => (s.descripProyectos || []).map((p: any) => ({
      'SEREMI':    s.nombre,
      'Proyecto':  p.title    || '',
      'Meta':      p.meta     || '',
      'Estado':    p.estado   || '',
      'Descripcion': p.descripcion || '',
    })))
  );
  ws2['!cols'] = [{ wch: 30 }, { wch: 45 }, { wch: 25 }, { wch: 15 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Proyectos');

  // Hoja 3: Nudos Críticos
  const ws3 = XLSX.utils.json_to_sheet(
    data.flatMap(s => (s.nudosArray || []).map((n: any) => ({
      'SEREMI':          s.nombre,
      'Nudo Crítico':    n.title      || '',
      'Descripción':     n.desc       || '',
      'Urgencia':        n.urgencia   || '',
      'Solución':        n.solucion   || '',
    })))
  );
  ws3['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 80 }, { wch: 12 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Nudos Críticos');

  // Hoja 4: Prensa
  const ws4 = XLSX.utils.json_to_sheet(
    data.flatMap(s => (s.prensaItems || []).map((p: any) => ({
      'SEREMI':    s.nombre,
      'Titular':   p.titular  || '',
      'Medio':     p.medio    || '',
      'Fecha':     fmtDate(p.fecha),
      'Tono':      p.tono === 'pos' ? 'Positivo' : p.tono === 'neg' ? 'Negativo' : 'Neutro',
      'URL':       p.url      || '',
    })))
  );
  ws4['!cols'] = [{ wch: 30 }, { wch: 70 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Prensa');

  // Hoja 5: Agenda
  const ws5 = XLSX.utils.json_to_sheet(
    data.flatMap(s => (s.agenda || []).map((a: any) => ({
      'SEREMI':    s.nombre,
      'Fecha':     fmtDate(a.fecha),
      'Hito':      a.texto    || '',
      'Categoría': a.cat      || '',
      'Lugar':     a.lugar    || '',
    })))
  );
  ws5['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 60 }, { wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws5, 'Agenda');

  // Hoja 6: Temas Propuestos
  const ws6 = XLSX.utils.json_to_sheet(
    data.flatMap(s => (s.temas || []).map((t: any) => ({
      'SEREMI':     s.nombre,
      'Tema':       t.tema       || '',
      'Prioridad':  t.prioridad  || '',
      'Ámbito':     t.ambito     || '',
      'Descripción': t.descripcion || '',
    })))
  );
  ws6['!cols'] = [{ wch: 30 }, { wch: 60 }, { wch: 12 }, { wch: 20 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws6, 'Temas Propuestos');

  return wb;
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

/** PDF de un SEREMI individual */
export function exportSinglePDFDashboard(s: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  buildPDF(doc, s);
  const safe = s.nombre.replace(/[\s/]+/g, '_');
  doc.save(`Informe_${safe}_${getPeriodoFile()}.pdf`);
}

/** PDF global (portada + una página por SEREMI) */
export function exportAllPDFDashboard(data: any[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Portada
  doc.setFillColor(11, 15, 26);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(21, 30, 46);
  doc.rect(0, 95, 210, 85, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(232, 237, 245);
  doc.text('Informe de Reportería SEREMIs', 105, 120, { align: 'center' });
  doc.text('Región del Maule', 105, 133, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(143, 163, 191);
  doc.text(`Período: ${getPeriodoLabel()}`, 105, 146, { align: 'center' });
  doc.text(`${data.length} SEREMIs incluidas`, 105, 154, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(78, 100, 128);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, 105, 285, { align: 'center' });

  // Una página por SEREMI
  data.forEach(s => {
    doc.addPage();
    buildPDF(doc, s);
  });

  doc.save(`Informe_Global_SEREMIs_Maule_${getPeriodoFile()}.pdf`);
}

/** Excel global (6 hojas) */
export function exportAllExcelDashboard(data: any[]): void {
  const wb = buildWorkbook(data);
  XLSX.writeFile(wb, `Reporte_SEREMIs_Maule_${getPeriodoFile()}.xlsx`);
}

/** Excel de un SEREMI individual */
export function exportSingleExcelDashboard(s: any): void {
  const wb = buildWorkbook([s]);
  const safe = s.nombre.replace(/[\s/]+/g, '_');
  XLSX.writeFile(wb, `Informe_${safe}_${getPeriodoFile()}.xlsx`);
}

/** Excel solo Prensa */
export function exportPrensaExcelDashboard(data: any[]): void {
  const rows = data.flatMap(s => (s.prensaItems || []).map((p: any) => ({
    'SEREMI':   s.nombre,
    'Titular':  p.titular || '',
    'Medio':    p.medio   || '',
    'Fecha':    fmtDate(p.fecha),
    'Tono':     p.tono === 'pos' ? 'Positivo' : p.tono === 'neg' ? 'Negativo' : 'Neutro',
    'URL':      p.url     || '',
  })));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 70 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Prensa');
  XLSX.writeFile(wb, `Prensa_SEREMIs_Maule_${getPeriodoFile()}.xlsx`);
}

/** Excel solo Agenda */
export function exportAgendaExcelDashboard(data: any[]): void {
  const rows = data.flatMap(s => (s.agenda || []).map((a: any) => ({
    'SEREMI':    s.nombre,
    'Fecha':     fmtDate(a.fecha),
    'Hito':      a.texto  || '',
    'Categoría': a.cat    || '',
    'Lugar':     a.lugar  || '',
  })));
  rows.sort((a, b) => a['Fecha'].localeCompare(b['Fecha']));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 60 }, { wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Agenda');
  XLSX.writeFile(wb, `Agenda_SEREMIs_Maule_${getPeriodoFile()}.xlsx`);
}
