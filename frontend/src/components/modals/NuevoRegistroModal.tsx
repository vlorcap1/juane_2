import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useNuevoRegistro } from '../../context/NuevoRegistroContext';
import { seremisApi, visitasApi, contactosApi, prensaApi, proyectosApi, nudosApi, temasApi, agendaApi } from '../../api/client';
import './NuevoRegistroModal.css';
import { MapPin, Users, Newspaper, Pin, AlertTriangle, Lightbulb, Calendar, ThumbsUp, Minus, ThumbsDown, AlertOctagon, CheckCircle } from 'lucide-react';

const RECORD_TYPES = [
  { key: 'visita',   icon: <MapPin size={24} />, label: 'Visita a\nComuna' },
  { key: 'contacto', icon: <Users size={24} />, label: 'Evento /\nContacto' },
  { key: 'prensa',   icon: <Newspaper size={24} />, label: 'Aparición\nPrensa' },
  { key: 'proyecto', icon: <Pin size={24} />, label: 'Proyecto' },
  { key: 'nudo',     icon: <AlertTriangle size={24} />, label: 'Nudo\nCrítico' },
  { key: 'tema',     icon: <Lightbulb size={24} />, label: 'Propuesta\nde Tema' },
  { key: 'agenda',   icon: <Calendar size={24} />, label: 'Hito\nAgenda' },
];

interface SeremiSimple { id: string; nombre: string; sector: string; }

const INIT_VISITA   = { fecha:'', comuna:'', lugar:'', personas:'', descripcion:'' };
const INIT_CONTACTO = { nombre:'', fecha:'', lugar:'', personas:'', tipo:'Reunión sectorial', instituciones:'', descripcion:'' };
const INIT_PRENSA   = { titular:'', medio:'', fecha:'', tipoMedio:'Diario impreso', url:'', resumen:'', tono:'pos' };
const INIT_PROYECTO = { title:'', meta:'', estado:'Activo', presupuesto:'', descripcion:'', comunas:'' };
const INIT_NUDO     = { title:'', urgencia:'Alta', desc:'', solucion:'' };
const INIT_TEMA     = { tema:'', ambito:'Comunicaciones / Prensa', prioridad:'Alta', descripcion:'' };
const INIT_AGENDA   = { fecha:'', hora:'', cat:'Inauguración', texto:'', lugar:'', notas:'', minuta:'' };

export const NuevoRegistroModal: React.FC = () => {
  const { isOpen, recordType, seremiId, closeModal } = useNuevoRegistro();
  const [selectedType, setSelectedType] = useState('visita');
  const [selectedSeremi, setSelectedSeremi] = useState('');
  const [seremis, setSeremis] = useState<SeremiSimple[]>([]);
  const [loadingSeremis, setLoadingSeremis] = useState(false);
  const [saving, setSaving] = useState(false);

  // Per-type form state
  const [visita,   setVisita]   = useState({ ...INIT_VISITA });
  const [contacto, setContacto] = useState({ ...INIT_CONTACTO });
  const [prensa,   setPrensa]   = useState({ ...INIT_PRENSA });
  const [proyecto, setProyecto] = useState({ ...INIT_PROYECTO });
  const [nudo,     setNudo]     = useState({ ...INIT_NUDO });
  const [tema,     setTema]     = useState({ ...INIT_TEMA });
  const [agenda,   setAgenda]   = useState({ ...INIT_AGENDA });

  // Helpers
  const setV = (k: string, v: string) => setVisita(f => ({ ...f, [k]: v }));
  const setC = (k: string, v: string) => setContacto(f => ({ ...f, [k]: v }));
  const setP = (k: string, v: string) => setPrensa(f => ({ ...f, [k]: v }));
  const setPr = (k: string, v: string) => setProyecto(f => ({ ...f, [k]: v }));
  const setN = (k: string, v: string) => setNudo(f => ({ ...f, [k]: v }));
  const setT = (k: string, v: string) => setTema(f => ({ ...f, [k]: v }));
  const setA = (k: string, v: string) => setAgenda(f => ({ ...f, [k]: v }));

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSeremis(false);
    }
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
    } finally {
      setSaving(false);
    }
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
      {/* SEREMI selector */}
      <div className="nr-section-label">SEREMI (ADMIN)</div>
      <div className="form-group" style={{ marginBottom: 20 }}>
        <select
          className="form-select"
          value={selectedSeremi}
          onChange={e => setSelectedSeremi(e.target.value)}
          disabled={loadingSeremis}
        >
          <option value="">Seleccionar SEREMI...</option>
          {seremis.map(s => (
            <option key={s.id} value={s.id}>{s.nombre} â€” {s.sector}</option>
          ))}
        </select>
      </div>

      {/* Tipo de registro */}
      <div className="nr-section-label">TIPO DE REGISTRO</div>
      <div className="nr-type-selector">
        {RECORD_TYPES.map(t => (
          <div
            key={t.key}
            className={`nr-type-card${selectedType === t.key ? ' active' : ''}`}
            onClick={() => setSelectedType(t.key)}
          >
            <div className="nr-type-icon">{t.icon}</div>
            <div className="nr-type-label">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Form fields */}
      {selectedType === 'visita' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">FECHA DE VISITA</label><input type="date" className="form-input" value={visita.fecha} onChange={e => setV('fecha', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">COMUNA</label><input type="text" className="form-input" placeholder="Ej: Linares" value={visita.comuna} onChange={e => setV('comuna', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">LUGAR / INSTITUCIÓN</label><input type="text" className="form-input" placeholder="Ej: Municipalidad, Hospital..." value={visita.lugar} onChange={e => setV('lugar', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">N° PERSONAS REUNIDAS</label><input type="number" className="form-input" placeholder="0" min={0} value={visita.personas} onChange={e => setV('personas', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCIÓN / OBJETIVO</label><textarea className="form-textarea" placeholder="¿Qué se trató en la visita?" value={visita.descripcion} onChange={e => setV('descripcion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'contacto' && (
        <>
          <div className="nr-info-box">Registra un evento o actividad donde participaron personas. Se acumula el total de asistentes.</div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">NOMBRE DEL EVENTO</label><input type="text" className="form-input" placeholder="Ej: ReuniÃ³n Mesa TÃ©cnica, Taller..." value={contacto.nombre} onChange={e => setC('nombre', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">FECHA</label><input type="date" className="form-input" value={contacto.fecha} onChange={e => setC('fecha', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">LUGAR / COMUNA</label><input type="text" className="form-input" placeholder="Ej: Talca, Curicó..." value={contacto.lugar} onChange={e => setC('lugar', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">N° DE PARTICIPANTES</label><input type="number" className="form-input" placeholder="0" min={0} value={contacto.personas} onChange={e => setC('personas', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">TIPO DE EVENTO</label>
              <select className="form-select" value={contacto.tipo} onChange={e => setC('tipo', e.target.value)}>
                {['ReuniÃ³n sectorial','Taller / CapacitaciÃ³n','Actividad comunitaria','Acto oficial','Mesa tÃ©cnica','Visita terreno','Otro'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">INSTITUCIONES PARTICIPANTES</label><input type="text" className="form-input" placeholder="Ej: Municipio, GORE, ONGs..." value={contacto.instituciones} onChange={e => setC('instituciones', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCIÓN / RESULTADOS</label><textarea className="form-textarea" placeholder="¿Cuál fue el resultado o acuerdos?" value={contacto.descripcion} onChange={e => setC('descripcion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'prensa' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">TITULAR</label><input type="text" className="form-input" placeholder="Título de la nota o artículo" value={prensa.titular} onChange={e => setP('titular', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">MEDIO</label><input type="text" className="form-input" placeholder="Ej: El Centro, La Prensa..." value={prensa.medio} onChange={e => setP('medio', e.target.value)} /></div>
          </div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">FECHA DE PUBLICACIÓN</label><input type="date" className="form-input" value={prensa.fecha} onChange={e => setP('fecha', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">TIPO DE MEDIO</label>
              <select className="form-select" value={prensa.tipoMedio} onChange={e => setP('tipoMedio', e.target.value)}>
                {['Diario impreso','Portal digital','Radio','TelevisiÃ³n','Redes sociales'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">TONO DE LA NOTA</label>
            <div className="nr-urgencia-group">
              {[{k:'pos',icon:<ThumbsUp size={13}/>,l:'Positivo'},{k:'neu',icon:<Minus size={13}/>,l:'Neutro'},{k:'neg',icon:<ThumbsDown size={13}/>,l:'Negativo'}].map(t => (
                <button key={t.k} type="button" className={`nr-urgencia-btn${prensa.tono===t.k?' active':''}`} onClick={() => setP('tono', t.k)}>{t.icon} {t.l}</button>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">ENLACE (OPCIONAL)</label><input type="text" className="form-input" placeholder="https://..." value={prensa.url} onChange={e => setP('url', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">RESUMEN</label><textarea className="form-textarea" placeholder="Breve descripciÃ³n de la nota..." value={prensa.resumen} onChange={e => setP('resumen', e.target.value)} /></div>
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
                {['Activo','En ejecuciÃ³n','LicitaciÃ³n','DiseÃ±o','FormulaciÃ³n','ConstrucciÃ³n','Finalizado'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">PRESUPUESTO ESTIMADO</label><input type="text" className="form-input" placeholder="Ej: $250.000.000" value={proyecto.presupuesto} onChange={e => setPr('presupuesto', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCIÓN</label><textarea className="form-textarea" placeholder="¿En qué consiste el proyecto?" value={proyecto.descripcion} onChange={e => setPr('descripcion', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">COMUNAS INVOLUCRADAS</label><input type="text" className="form-input" placeholder="Ej: Talca, Curicó, Linares" value={proyecto.comunas} onChange={e => setPr('comunas', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'nudo' && (
        <>
          <div className="form-group"><label className="form-label">TÍTULO DEL NUDO CRÍTICO</label><input type="text" className="form-input" placeholder="Nombre corto del problema" value={nudo.title} onChange={e => setN('title', e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">NIVEL DE URGENCIA</label>
            <div className="nr-urgencia-group">
              {[{k:'Alta',icon:<AlertOctagon size={13}/>,l:'Alta'},{k:'Media',icon:<AlertTriangle size={13}/>,l:'Media'},{k:'Baja',icon:<CheckCircle size={13}/>,l:'Baja'}].map(u => (
                <button key={u.k} type="button" className={`nr-urgencia-btn${nudo.urgencia===u.k?' active':''}`} onClick={() => setN('urgencia', u.k)}>{u.icon} {u.l}</button>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCIÓN DEL PROBLEMA</label><textarea className="form-textarea" placeholder="Describe el nudo crítico en detalle..." value={nudo.desc} onChange={e => setN('desc', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">SOLUCIÓN PROPUESTA (OPCIONAL)</label><textarea className="form-textarea" placeholder="¿Qué se necesita para resolverlo?" value={nudo.solucion} onChange={e => setN('solucion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'tema' && (
        <>
          <div className="form-group"><label className="form-label">TEMA PROPUESTO</label><input type="text" className="form-input" placeholder="Ej: Salud mental rural, Conectividad..." value={tema.tema} onChange={e => setT('tema', e.target.value)} /></div>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">ÁMBITO</label>
              <select className="form-select" value={tema.ambito} onChange={e => setT('ambito', e.target.value)}>
                {['Comunicaciones / Prensa','Agenda política','Propuesta legislativa','Investigación / Estudio','Otro'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">PRIORIDAD</label>
              <select className="form-select" value={tema.prioridad} onChange={e => setT('prioridad', e.target.value)}>
                {['Alta','Media','Normal'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">CONTEXTO / JUSTIFICACIÓN</label><textarea className="form-textarea" placeholder="¿Por qué es relevante este tema?" value={tema.descripcion} onChange={e => setT('descripcion', e.target.value)} /></div>
        </>
      )}

      {selectedType === 'agenda' && (
        <>
          <div className="nr-form-row">
            <div className="form-group"><label className="form-label">FECHA DEL HITO</label><input type="date" className="form-input" value={agenda.fecha} onChange={e => setA('fecha', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">HORA</label><input type="time" className="form-input" value={agenda.hora} onChange={e => setA('hora', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">CATEGORÍA</label>
            <select className="form-select" value={agenda.cat} onChange={e => setA('cat', e.target.value)}>
              {['Inauguración','Entrega de beneficios','Campaña','Evento','Licitación','Fiscalización','Reunión oficial','Conmemoración','Ceremonia','Operativo','Inicio Obras','Regulación','Otro'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">DESCRIPCIÓN DEL HITO</label><input type="text" className="form-input" placeholder="Ej: Lanzamiento programa X en Talca" value={agenda.texto} onChange={e => setA('texto', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">COMUNAS / LUGAR</label><input type="text" className="form-input" placeholder="Ej: Talca, toda la región..." value={agenda.lugar} onChange={e => setA('lugar', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">NOTAS ADICIONALES</label><textarea className="form-textarea" placeholder="Información adicional relevante..." value={agenda.notas} onChange={e => setA('notas', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">MINUTA</label><textarea className="form-textarea" style={{ minHeight: 90 }} placeholder="Acta o minuta del evento / hito..." value={agenda.minuta} onChange={e => setA('minuta', e.target.value)} /></div>
        </>
      )}
    </Modal>
  );
};

