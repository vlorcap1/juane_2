"""Script para reescribir NuevoRegistroModal.tsx con encoding UTF-8 correcto."""
import os

content = """\
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useNuevoRegistro } from '../../context/NuevoRegistroContext';
import { seremisApi, visitasApi, contactosApi, prensaApi, proyectosApi, nudosApi, temasApi, agendaApi } from '../../api/client';
import './NuevoRegistroModal.css';

const RECORD_TYPES = [
  { key: 'visita',   icon: '\u{1F5FA}\uFE0F', label: 'Visita a\\nComuna' },
  { key: 'contacto', icon: '\u{1F91D}',       label: 'Evento /\\nContacto' },
  { key: 'prensa',   icon: '\u{1F4F0}',        label: 'Aparici\\u00f3n\\nPrensa' },
  { key: 'proyecto', icon: '\u{1F4CC}',        label: 'Proyecto' },
  { key: 'nudo',     icon: '\u26A0\uFE0F',     label: 'Nudo\\nCr\\u00edtico' },
  { key: 'tema',     icon: '\u{1F4A1}',        label: 'Propuesta\\nde Tema' },
  { key: 'agenda',   icon: '\u{1F4C5}',        label: 'Hito\\nAgenda' },
];

interface SeremiSimple { id: string; nombre: string; sector: string; }

const INIT_VISITA   = { fecha:'', comuna:'', lugar:'', personas:'', descripcion:'' };
const INIT_CONTACTO = { nombre:'', fecha:'', lugar:'', personas:'', tipo:'Reuni\\u00f3n sectorial', instituciones:'', descripcion:'' };
const INIT_PRENSA   = { titular:'', medio:'', fecha:'', tipoMedio:'Diario impreso', url:'', resumen:'', tono:'pos' };
const INIT_PROYECTO = { title:'', meta:'', estado:'Activo', presupuesto:'', descripcion:'', comunas:'' };
const INIT_NUDO     = { title:'', urgencia:'Alta', desc:'', solucion:'' };
const INIT_TEMA     = { tema:'', ambito:'Comunicaciones / Prensa', prioridad:'Alta', descripcion:'' };
const INIT_AGENDA   = { fecha:'', hora:'', cat:'Inauguraci\\u00f3n', texto:'', lugar:'', notas:'', minuta:'' };

export const NuevoRegistroModal: React.FC = () => {
  const { isOpen, recordType, seremiId, closeModal } = useNuevoRegistro();
  const [selectedType, setSelectedType] = useState('visita');
  const [selectedSeremi, setSelectedSeremi] = useState('');
  const [seremis, setSeremis] = useState<SeremiSimple[]>([]);
  const [loadingSeremis, setLoadingSeremis] = useState(false);
  const [saving, setSaving] = useState(false);

  const [visita,   setVisita]   = useState({ ...INIT_VISITA });
  const [contacto, setContacto] = useState({ ...INIT_CONTACTO });
  const [prensa,   setPrensa]   = useState({ ...INIT_PRENSA });
  const [proyecto, setProyecto] = useState({ ...INIT_PROYECTO });
  const [nudo,     setNudo]     = useState({ ...INIT_NUDO });
  const [tema,     setTema]     = useState({ ...INIT_TEMA });
  const [agenda,   setAgenda]   = useState({ ...INIT_AGENDA });

  const setV  = (k: string, v: string) => setVisita(f => ({ ...f, [k]: v }));
  const setC  = (k: string, v: string) => setContacto(f => ({ ...f, [k]: v }));
  const setP  = (k: string, v: string) => setPrensa(f => ({ ...f, [k]: v }));
  const setPr = (k: string, v: string) => setProyecto(f => ({ ...f, [k]: v }));
  const setN  = (k: string, v: string) => setNudo(f => ({ ...f, [k]: v }));
  const setT  = (k: string, v: string) => setTema(f => ({ ...f, [k]: v }));
  const setA  = (k: string, v: string) => setAgenda(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (isOpen) {
      setSelectedType(recordType || 'visita');
      setSelectedSeremi(seremiId || '');
      setVisita({ ...INIT_VISITA });
      setContacto({ ...INIT_CONTACTO });
      setPrensa({ ...INIT_PRENSA });
      setProyecto({ ...INIT_PROYECTO });
      setNudo({ ...INIT_NUDO });
      setTema({ ...INIT_TEMA });
      setAgenda({ ...INIT_AGENDA });
      loadSeremis();
    }
  }, [isOpen]);

  const loadSeremis = async () => {
    try {
      setLoadingSeremis(true);
      const data = await seremisApi.getAll();
      setSeremis(data);
    } catch (e) { console.error(e); }
    finally { setLoadingSeremis(false); }
  };

  const handleClose = () => closeModal();

  const handleSave = async () => {
    if (!selectedSeremi) return alert('Selecciona una SEREMI primero.');
    setSaving(true);
    try {
      switch (selectedType) {
        case 'visita':
          await visitasApi.create({ seremiId: selectedSeremi, fecha: visita.fecha||undefined, comuna: visita.comuna||undefined, lugar: visita.lugar||undefined, personas: visita.personas ? Number(visita.personas) : undefined, descripcion: visita.descripcion||undefined });
          break;
        case 'contacto':
          await contactosApi.create({ seremiId: selectedSeremi, nombre: contacto.nombre||undefined, fecha: contacto.fecha||undefined, lugar: contacto.lugar||undefined, personas: contacto.personas ? Number(contacto.personas) : undefined, tipo: contacto.tipo||undefined, instituciones: contacto.instituciones||undefined, descripcion: contacto.descripcion||undefined });
          break;
        case 'prensa':
          await prensaApi.create({ seremiId: selectedSeremi, titular: prensa.titular||undefined, medio: prensa.medio||undefined, fecha: prensa.fecha||undefined, tipoMedio: prensa.tipoMedio||undefined, tono: prensa.tono||undefined, url: prensa.url||undefined, resumen: prensa.resumen||undefined });
          break;
        case 'proyecto':
          await proyectosApi.create({ seremiId: selectedSeremi, title: proyecto.title||undefined, meta: proyecto.meta||undefined, estado: proyecto.estado||undefined, presupuesto: proyecto.presupuesto||undefined, descripcion: proyecto.descripcion||undefined, comunas: proyecto.comunas||undefined });
          break;
        case 'nudo':
          await nudosApi.create({ seremiId: selectedSeremi, title: nudo.title||undefined, urgencia: nudo.urgencia||undefined, desc: nudo.desc||undefined, solucion: nudo.solucion||undefined });
          break;
        case 'tema':
          await temasApi.create({ seremiId: selectedSeremi, tema: tema.tema||undefined, ambito: tema.ambito||undefined, prioridad: tema.prioridad||undefined, descripcion: tema.descripcion||undefined });
          break;
        case 'agenda':
          await agendaApi.create({ seremiId: selectedSeremi, fecha: agenda.fecha||undefined, hora: agenda.hora||undefined, cat: agenda.cat||undefined, texto: agenda.texto||undefined, lugar: agenda.lugar||undefined, notas: agenda.notas||undefined, minuta: agenda.minuta||undefined });
          break;
      }
      handleClose();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Error al guardar registro');
    } finally { setSaving(false); }
  };

  const footer = (
    <>
      <button className="btn-cancel" onClick={handleClose}>Cancelar</button>
      <button className="btn-save" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar Registro'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Registro" size="lg" footer={footer}>
      <div className="nr-section-label">SEREMI (ADMIN)</div>
      <div className="form-group" style={{ marginBottom: 20 }}>
        <select className="form-select" value={selectedSeremi} onChange={e => setSelectedSeremi(e.target.value)} disabled={loadingSeremis}>
          <option value="">Seleccionar SEREMI...</option>
          {seremis.map(s => <option key={s.id} value={s.id}>{s.nombre} \u2014 {s.sector}</option>)}
        </select>
      </div>

      <div className="nr-section-label">TIPO DE REGISTRO</div>
      <div className="nr-type-selector">
        {RECORD_TYPES.map(t => (
          <div key={t.key} className={`nr-type-card${selectedType === t.key ? ' active' : ''}`} onClick={() => setSelectedType(t.key)}>
            <div className="nr-type-icon">{t.icon}</div>
            <div className="nr-type-label">{t.label}</div>
          </div>
        ))}
      </div>

      {selectedType === 'visita' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">FECHA DE VISITA</label><input type="date" className="form-input" value={visita.fecha} onChange={e => setV('fecha', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">COMUNA</label><input type="text" className="form-input" placeholder="Ej: Linares" value={visita.comuna} onChange={e => setV('comuna', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">LUGAR / INSTITUCI\\u00d3N</label><input type="text" className="form-input" placeholder="Ej: Municipalidad, Hospital..." value={visita.lugar} onChange={e => setV('lugar', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">N\\u00b0 PERSONAS REUNIDAS</label><input type="number" className="form-input" placeholder="0" min={0} value={visita.personas} onChange={e => setV('personas', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCI\\u00d3N / OBJETIVO</label><textarea className="form-textarea" placeholder="\\u00bfQu\\u00e9 se trat\\u00f3 en la visita?" value={visita.descripcion} onChange={e => setV('descripcion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'contacto' && (
        <>
          <div className="nr-info-box">\u{1F4CC} Registra un evento o actividad donde participaron personas. Se acumula el total de asistentes.</div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">NOMBRE DEL EVENTO</label><input type="text" className="form-input" placeholder="Ej: Reuni\\u00f3n Mesa T\\u00e9cnica, Taller..." value={contacto.nombre} onChange={e => setC('nombre', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">FECHA</label><input type="date" className="form-input" value={contacto.fecha} onChange={e => setC('fecha', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">LUGAR / COMUNA</label><input type="text" className="form-input" placeholder="Ej: Talca, Curic\\u00f3..." value={contacto.lugar} onChange={e => setC('lugar', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">N\\u00b0 DE PARTICIPANTES</label><input type="number" className="form-input" placeholder="0" min={0} value={contacto.personas} onChange={e => setC('personas', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">TIPO DE EVENTO</label>
              <select className="form-select" value={contacto.tipo} onChange={e => setC('tipo', e.target.value)}>
                {['Reuni\\u00f3n sectorial','Taller / Capacitaci\\u00f3n','Actividad comunitaria','Acto oficial','Mesa t\\u00e9cnica','Visita terreno','Otro'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">INSTITUCIONES PARTICIPANTES</label><input type="text" className="form-input" placeholder="Ej: Municipio, GORE, ONGs..." value={contacto.instituciones} onChange={e => setC('instituciones', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCI\\u00d3N / RESULTADOS</label><textarea className="form-textarea" placeholder="\\u00bfCu\\u00e1l fue el resultado o acuerdos?" value={contacto.descripcion} onChange={e => setC('descripcion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'prensa' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">TITULAR</label><input type="text" className="form-input" placeholder="T\\u00edtulo de la nota o art\\u00edculo" value={prensa.titular} onChange={e => setP('titular', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">MEDIO</label><input type="text" className="form-input" placeholder="Ej: El Centro, La Prensa..." value={prensa.medio} onChange={e => setP('medio', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">FECHA DE PUBLICACI\\u00d3N</label><input type="date" className="form-input" value={prensa.fecha} onChange={e => setP('fecha', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">TIPO DE MEDIO</label>
              <select className="form-select" value={prensa.tipoMedio} onChange={e => setP('tipoMedio', e.target.value)}>
                {['Diario impreso','Portal digital','Radio','Televisi\\u00f3n','Redes sociales'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">TONO DE LA NOTA</label>
            <div className="nr-urgencia-group">
              {[{k:'pos',l:'\\U0001f44d Positivo'},{k:'neu',l:'\\U0001f610 Neutro'},{k:'neg',l:'\\U0001f44e Negativo'}].map(t => (
                <button key={t.k} type="button" className={`nr-urgencia-btn${prensa.tono===t.k?' active':''}`} onClick={() => setP('tono', t.k)}>{t.l}</button>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">ENLACE (OPCIONAL)</label><input type="text" className="form-input" placeholder="https://..." value={prensa.url} onChange={e => setP('url', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">RESUMEN</label><textarea className="form-textarea" placeholder="Breve descripci\\u00f3n de la nota..." value={prensa.resumen} onChange={e => setP('resumen', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'proyecto' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">NOMBRE DEL PROYECTO</label><input type="text" className="form-input" placeholder="Nombre del proyecto" value={proyecto.title} onChange={e => setPr('title', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">META / FECHA OBJETIVO</label><input type="text" className="form-input" placeholder="Ej: Jun. 2025" value={proyecto.meta} onChange={e => setPr('meta', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">ESTADO</label>
              <select className="form-select" value={proyecto.estado} onChange={e => setPr('estado', e.target.value)}>
                {['Activo','En ejecuci\\u00f3n','Licitaci\\u00f3n','Dise\\u00f1o','Formulaci\\u00f3n','Construcci\\u00f3n','Finalizado'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">PRESUPUESTO ESTIMADO</label><input type="text" className="form-input" placeholder="Ej: $250.000.000" value={proyecto.presupuesto} onChange={e => setPr('presupuesto', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCI\\u00d3N</label><textarea className="form-textarea" placeholder="\\u00bfEn qu\\u00e9 consiste el proyecto?" value={proyecto.descripcion} onChange={e => setPr('descripcion', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">COMUNAS INVOLUCRADAS</label><input type="text" className="form-input" placeholder="Ej: Talca, Curic\\u00f3, Linares" value={proyecto.comunas} onChange={e => setPr('comunas', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'nudo' && (
        <>
          <div className="form-group"><label className="form-label">T\\u00cdTULO DEL NUDO CR\\u00cdTICO</label><input type="text" className="form-input" placeholder="Nombre corto del problema" value={nudo.title} onChange={e => setN('title', e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">NIVEL DE URGENCIA</label>
            <div className="nr-urgencia-group">
              {[{k:'Alta',l:'\\U0001f534 Alta'},{k:'Media',l:'\\U0001f7e1 Media'},{k:'Baja',l:'\\U0001f7e2 Baja'}].map(u => (
                <button key={u.k} type="button" className={`nr-urgencia-btn${nudo.urgencia===u.k?' active':''}`} onClick={() => setN('urgencia', u.k)}>{u.l}</button>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCI\\u00d3N DEL PROBLEMA</label><textarea className="form-textarea" placeholder="Describe el nudo cr\\u00edtico en detalle..." value={nudo.desc} onChange={e => setN('desc', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">SOLUCI\\u00d3N PROPUESTA (OPCIONAL)</label><textarea className="form-textarea" placeholder="\\u00bfQu\\u00e9 se necesita para resolverlo?" value={nudo.solucion} onChange={e => setN('solucion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'tema' && (
        <>
          <div className="form-group"><label className="form-label">TEMA PROPUESTO</label><input type="text" className="form-input" placeholder="Ej: Salud mental rural, Conectividad..." value={tema.tema} onChange={e => setT('tema', e.target.value)} /></div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">\\u00c1MBITO</label>
              <select className="form-select" value={tema.ambito} onChange={e => setT('ambito', e.target.value)}>
                {['Comunicaciones / Prensa','Agenda pol\\u00edtica','Propuesta legislativa','Investigaci\\u00f3n / Estudio','Otro'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">PRIORIDAD</label>
              <select className="form-select" value={tema.prioridad} onChange={e => setT('prioridad', e.target.value)}>
                {['Alta','Media','Normal'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">CONTEXTO / JUSTIFICACI\\u00d3N</label><textarea className="form-textarea" placeholder="\\u00bfPor qu\\u00e9 es relevante este tema?" value={tema.descripcion} onChange={e => setT('descripcion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'agenda' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">FECHA DEL HITO</label><input type="date" className="form-input" value={agenda.fecha} onChange={e => setA('fecha', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">HORA</label><input type="time" className="form-input" value={agenda.hora} onChange={e => setA('hora', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">CATEGOR\\u00cdA</label>
            <select className="form-select" value={agenda.cat} onChange={e => setA('cat', e.target.value)}>
              {['Inauguraci\\u00f3n','Entrega de beneficios','Campa\\u00f1a','Evento','Licitaci\\u00f3n','Fiscalizaci\\u00f3n','Reuni\\u00f3n oficial','Conmemoraci\\u00f3n','Ceremonia','Operativo','Inicio Obras','Regulaci\\u00f3n','Otro'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCI\\u00d3N DEL HITO</label><input type="text" className="form-input" placeholder="Ej: Lanzamiento programa X en Talca" value={agenda.texto} onChange={e => setA('texto', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">COMUNAS / LUGAR</label><input type="text" className="form-input" placeholder="Ej: Talca, toda la regi\\u00f3n..." value={agenda.lugar} onChange={e => setA('lugar', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">NOTAS ADICIONALES</label><textarea className="form-textarea" placeholder="Informaci\\u00f3n adicional relevante..." value={agenda.notas} onChange={e => setA('notas', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">MINUTA</label><textarea className="form-textarea" style={{ minHeight: 90 }} placeholder="Acta o minuta del evento / hito..." value={agenda.minuta} onChange={e => setA('minuta', e.target.value)} /></div>
        </>
      )}
    </Modal>
  );
};
"""

# Resolve real content from escape sequences
import codecs
# The content above uses Python string literals already — write directly
out_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'components', 'modals', 'NuevoRegistroModal.tsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Archivo escrito: {out_path}")
