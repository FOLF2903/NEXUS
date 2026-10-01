import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  Sword,
  Shield,
  Sparkles,
  HelpCircle,
  MapPin,
  User,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';
import { Objeto, TipoObjeto, Campana, PJ } from '../types';
import { TagSelector } from './TagSelector';
import { ETIQUETAS_SUGERIDAS_OBJETOS } from '../lib/tags';
import { TIPO_OBJETO_CONFIG } from './ObjetoCard';

interface ObjetoModalProps {
  isOpen: boolean;
  campana?: Campana;
  pjs?: PJ[];
  objetoToEdit?: Objeto | null;
  campanaObjetos?: Objeto[];
  onClose: () => void;
  onSave: (objetoData: {
    nombre: string;
    nombre_conocido: boolean;
    tipo: TipoObjeto;
    descripcion: string;
    efecto_conocido: string;
    efecto_sospechado: string;
    donde_lo_conseguimos: string;
    quien_lo_lleva: string | null;
    notas: string;
    etiquetas: string[];
  }) => void;
}

const TIPOS_DISPONIBLES: TipoObjeto[] = [
  'arma',
  'armadura',
  'pocion',
  'pergamino',
  'anillo',
  'varita',
  'vara',
  'tesoro',
  'miscelaneo',
  'otro',
];

export const ObjetoModal: React.FC<ObjetoModalProps> = ({
  isOpen,
  campana,
  pjs = [],
  objetoToEdit,
  campanaObjetos = [],
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [nombreConocido, setNombreConocido] = useState(true);
  const [tipo, setTipo] = useState<TipoObjeto>('miscelaneo');
  const [descripcion, setDescripcion] = useState('');
  const [efectoConocido, setEfectoConocido] = useState('');
  const [efectoSospechado, setEfectoSospechado] = useState('');
  const [dondeLoConseguimos, setDondeLoConseguimos] = useState('');
  const [quienLoLleva, setQuienLoLleva] = useState<string>('__sin_asignar__');
  const [customPortador, setCustomPortador] = useState('');
  const [isAddingCustomPortador, setIsAddingCustomPortador] = useState(false);
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [errorNombre, setErrorNombre] = useState(false);

  // Recopilar lista de portadores conocidos
  const portadoresDisponibles = React.useMemo(() => {
    const list = new Map<string, string>();
    if (pjs && Array.isArray(pjs) && pjs.length > 0) {
      pjs.forEach((pj) => {
        if (pj && pj.nombre && pj.nombre.trim()) {
          const detail = `${pj.nombre} (${pj.clase} Nvl ${pj.nivel})`;
          list.set(pj.nombre.trim(), detail);
        }
      });
    } else if (campana?.pj_ids && Array.isArray(campana.pj_ids)) {
      campana.pj_ids.forEach((pj) => {
        if (pj && pj.trim()) list.set(pj.trim(), pj.trim());
      });
    }
    campanaObjetos.forEach((obj) => {
      if (obj.quien_lo_lleva && obj.quien_lo_lleva.trim() && !list.has(obj.quien_lo_lleva.trim())) {
        list.set(obj.quien_lo_lleva.trim(), obj.quien_lo_lleva.trim());
      }
    });
    return Array.from(list.entries());
  }, [pjs, campana, campanaObjetos]);

  useEffect(() => {
    if (objetoToEdit) {
      setNombre(objetoToEdit.nombre || '');
      setNombreConocido(objetoToEdit.nombre_conocido !== false);
      setTipo(objetoToEdit.tipo || 'miscelaneo');
      setDescripcion(objetoToEdit.descripcion || '');
      setEfectoConocido(objetoToEdit.efecto_conocido || '');
      setEfectoSospechado(objetoToEdit.efecto_sospechado || '');
      setDondeLoConseguimos(objetoToEdit.donde_lo_conseguimos || '');
      if (objetoToEdit.quien_lo_lleva) {
        setQuienLoLleva(objetoToEdit.quien_lo_lleva);
        setIsAddingCustomPortador(false);
      } else {
        setQuienLoLleva('__sin_asignar__');
        setIsAddingCustomPortador(false);
      }
      setCustomPortador('');
      setNotas(objetoToEdit.notas || '');
      setEtiquetas(objetoToEdit.etiquetas || []);
    } else {
      setNombre('');
      setNombreConocido(true);
      setTipo('miscelaneo');
      setDescripcion('');
      setEfectoConocido('');
      setEfectoSospechado('');
      setDondeLoConseguimos('');
      setQuienLoLleva('__sin_asignar__');
      setCustomPortador('');
      setIsAddingCustomPortador(false);
      setNotas('');
      setEtiquetas([]);
    }
    setErrorNombre(false);
  }, [objetoToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorNombre(true);
      return;
    }

    let finalPortador: string | null = null;
    if (isAddingCustomPortador) {
      finalPortador = customPortador.trim() || null;
    } else if (quienLoLleva !== '__sin_asignar__' && quienLoLleva.trim()) {
      finalPortador = quienLoLleva.trim();
    }

    onSave({
      nombre: nombre.trim(),
      nombre_conocido: nombreConocido,
      tipo,
      descripcion: descripcion.trim(),
      efecto_conocido: efectoConocido.trim(),
      efecto_sospechado: efectoSospechado.trim(),
      donde_lo_conseguimos: dondeLoConseguimos.trim(),
      quien_lo_lleva: finalPortador,
      notas: notas.trim(),
      etiquetas,
    });

    onClose();
  };

  const handlePortadorSelectChange = (val: string) => {
    if (val === '__custom__') {
      setIsAddingCustomPortador(true);
      setCustomPortador('');
    } else {
      setIsAddingCustomPortador(false);
      setQuienLoLleva(val);
    }
  };

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const isDirty = Boolean(
    objetoToEdit
      ? (nombre.trim() !== (objetoToEdit.nombre || '') ||
         descripcion.trim() !== (objetoToEdit.descripcion || '') ||
         efectoConocido.trim() !== (objetoToEdit.efecto_conocido || '') ||
         dondeLoConseguimos.trim() !== (objetoToEdit.donde_lo_conseguimos || '') ||
         notas.trim() !== (objetoToEdit.notas || ''))
      : (nombre.trim() || descripcion.trim() || efectoConocido.trim() || dondeLoConseguimos.trim() || notas.trim())
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en este objeto. ¿Seguro que deseas salir sin guardar?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleRequestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, onClose]);

  return (
    <div
      id="objeto-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="objeto-modal-dialog"
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#111827] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="objeto-modal-title"
      >
        {/* Encabezado fijo */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-[#c9a227] border border-amber-800/40 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 id="objeto-modal-title" className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                {objetoToEdit ? 'Editar Ficha de Objeto' : 'Nuevo Objeto / Tesoro'}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                Registra armas, armaduras, pociones, reliquias y tesoros para tu grupo.
              </p>
            </div>
          </div>
          <button
            id="objeto-modal-close"
            type="button"
            onClick={handleRequestClose}
            className="text-slate-400 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario envolvente */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Cuerpo scrolleable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Nombre y Conocimiento */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="objeto-nombre" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Nombre del objeto <span className="text-amber-400">*</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                  <input
                    id="objeto-nombre-conocido"
                    type="checkbox"
                    checked={nombreConocido}
                    onChange={(e) => setNombreConocido(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-[#c9a227] focus:ring-amber-500/50"
                  />
                  <span className="flex items-center gap-1">
                    {nombreConocido ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    El grupo conoce su nombre real
                  </span>
                </label>
              </div>
              <input
                ref={firstInputRef}
                id="objeto-nombre"
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorNombre) setErrorNombre(false);
                }}
              placeholder={nombreConocido ? "Ej: Espada larga +1 'Garra', Poción de velocidad..." : "¿? o nombre oculto para el DM..."}
              className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0b0f17] border text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#c9a227]/50 ${
                errorNombre ? 'border-rose-600' : 'border-slate-700 focus:border-[#c9a227]'
              }`}
            />
            {errorNombre && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Por favor ingresa un nombre o signo identificador (ej: ?).
              </p>
            )}
            {!nombreConocido && (
              <p className="text-xs text-amber-300/80 italic">
                El grupo aún no ha identificado este objeto. En las tarjetas aparecerá como "?" o un nombre provisional.
              </p>
            )}
          </div>

          {/* Tipo y Quién lo lleva */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="objeto-tipo" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tipo de objeto
              </label>
              <select
                id="objeto-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoObjeto)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0b0f17] border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/50"
              >
                {TIPOS_DISPONIBLES.map((t) => {
                  const cfg = TIPO_OBJETO_CONFIG[t];
                  return (
                    <option key={t} value={t}>
                      {cfg.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="objeto-portador" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Quién lo lleva (Portador)
              </label>
              {!isAddingCustomPortador ? (
                <div className="flex gap-2">
                  <select
                    id="objeto-portador"
                    value={quienLoLleva}
                    onChange={(e) => handlePortadorSelectChange(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-[#0b0f17] border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/50"
                  >
                    <option value="__sin_asignar__">Sin asignar (En el grupo / alijo común)</option>
                    {portadoresDisponibles.map(([name, label]) => (
                      <option key={name} value={name}>
                        {label}
                      </option>
                    ))}
                    <option value="__custom__">+ Añadir otro personaje/portador...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="objeto-custom-portador"
                    type="text"
                    value={customPortador}
                    onChange={(e) => setCustomPortador(e.target.value)}
                    placeholder="Nombre del personaje (ej: Krogar, Elora...)"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0b0f17] border border-amber-600 text-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#c9a227]/50"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomPortador(false);
                      setQuienLoLleva('__sin_asignar__');
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dónde lo conseguimos */}
          <div>
            <label htmlFor="objeto-donde" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Dónde o de quién lo conseguimos
            </label>
            <div className="relative">
              <input
                id="objeto-donde"
                type="text"
                value={dondeLoConseguimos}
                onChange={(e) => setDondeLoConseguimos(e.target.value)}
                placeholder="Ej: En el cofre de la grieta del escondite Marca Roja, regalado por Elmar..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0b0f17] border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/50"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Descripción física */}
          <div>
            <label htmlFor="objeto-descripcion" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Descripción física
            </label>
            <textarea
              id="objeto-descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="¿Cómo es físicamente? Materiales, colores, inscripciones, tacto, temperatura o detalles visuales..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#0b0f17] border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/50"
            />
          </div>

          {/* Efectos: Conocido y Sospechado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="objeto-efecto-conocido" className="block text-xs font-semibold uppercase tracking-wider text-emerald-300/90 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Efecto conocido
              </label>
              <textarea
                id="objeto-efecto-conocido"
                rows={3}
                value={efectoConocido}
                onChange={(e) => setEfectoConocido(e.target.value)}
                placeholder="Qué hace con certeza (ej: +1 a ataque y daño, cura 2d4+2, emite luz blanca tenue...)"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0b0f17] border border-emerald-900/40 text-slate-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label htmlFor="objeto-efecto-sospechado" className="block text-xs font-semibold uppercase tracking-wider text-purple-300/90 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                Efecto sospechado / Teorías
              </label>
              <textarea
                id="objeto-efecto-sospechado"
                rows={3}
                value={efectoSospechado}
                onChange={(e) => setEfectoSospechado(e.target.value)}
                placeholder="Qué sospechan que hace o rumores (ej: Podría ser una llave para la cripta, parece tener una maldición...)"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0b0f17] border border-purple-900/40 text-slate-100 text-sm focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          {/* Notas adicionales */}
          <div>
            <label htmlFor="objeto-notas" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Notas y trasfondo
            </label>
            <textarea
              id="objeto-notas"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Historia, a quién pertenecía antiguamente, secretos o comentarios del DM..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#0b0f17] border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/50"
            />
          </div>

          {/* Selector de Etiquetas */}
          <div className="pt-1">
            <TagSelector
              selectedTags={etiquetas}
              onChange={setEtiquetas}
              existingItems={campanaObjetos}
              customPresets={ETIQUETAS_SUGERIDAS_OBJETOS}
              labelColeccion="Etiquetas de Objetos de la Campaña"
            />
          </div>

          </div>

          {/* Botones de acción fijos en el pie */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="objeto-modal-cancel"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center font-medium"
            >
              Cancelar
            </button>
            <button
              id="objeto-modal-submit"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md shadow-amber-950/40 min-h-[44px] flex items-center justify-center"
            >
              {objetoToEdit ? 'Guardar Cambios' : 'Crear Objeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
