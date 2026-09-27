import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  MapPin,
  Compass,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Navigation,
  Sparkles,
  Layers,
  History,
} from 'lucide-react';
import { Lugar, TipoLugar, EstadoLugar } from '../types';
import { TagSelector } from './TagSelector';
import { ETIQUETAS_SUGERIDAS_LUGARES } from '../lib/tags';

export const ESTADO_LUGAR_CONFIG: Record<
  EstadoLugar,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  visitado: {
    label: 'Visitado',
    bg: 'bg-emerald-950/50',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
    dot: 'bg-emerald-400',
  },
  conocido: {
    label: 'Conocido',
    bg: 'bg-sky-950/50',
    text: 'text-sky-300',
    border: 'border-sky-800/60',
    dot: 'bg-sky-400',
  },
  misterioso: {
    label: 'Misterioso',
    bg: 'bg-amber-950/50',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
    dot: 'bg-amber-400',
  },
  inaccesible: {
    label: 'Inaccesible',
    bg: 'bg-slate-900/80',
    text: 'text-slate-400',
    border: 'border-slate-700',
    dot: 'bg-slate-500',
  },
};

export const TIPO_LUGAR_CONFIG: Record<TipoLugar, { label: string; iconLabel: string }> = {
  region: { label: 'Región', iconLabel: '🗺️' },
  pueblo: { label: 'Pueblo / Ciudad', iconLabel: '🏘️' },
  edificio: { label: 'Edificio / Posada / Tienda', iconLabel: '🏛️' },
  habitacion: { label: 'Habitación / Estancia', iconLabel: '🚪' },
  exterior: { label: 'Exterior / Naturaleza', iconLabel: '🌲' },
  viaje: { label: 'Ruta / Camino de viaje', iconLabel: '🛤️' },
  otro: { label: 'Otro tipo de lugar', iconLabel: '📍' },
};

interface LugarModalProps {
  isOpen: boolean;
  campanaId?: string;
  lugarToEdit?: Lugar | null;
  padreDefaultId?: string | null;
  lugarPadreDefaultId?: string | null;
  campanaLugares: Lugar[];
  onClose: () => void;
  onSave: (data: {
    nombre: string;
    nombre_conocido: boolean;
    tipo: TipoLugar;
    padre_id: string | null;
    descripcion: string;
    como_llegar: string;
    que_hay: string;
    que_paso: string;
    notas: string;
    estado: EstadoLugar;
    etiquetas: string[];
  }) => void;
}

export const LugarModal: React.FC<LugarModalProps> = ({
  isOpen,
  campanaLugares,
  lugarToEdit,
  padreDefaultId = null,
  lugarPadreDefaultId = null,
  onClose,
  onSave,
}) => {
  const initialPadre = padreDefaultId ?? lugarPadreDefaultId ?? null;
  const [nombre, setNombre] = useState('');
  const [nombreConocido, setNombreConocido] = useState(true);
  const [tipo, setTipo] = useState<TipoLugar>('pueblo');
  const [padreId, setPadreId] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [comoLlegar, setComoLlegar] = useState('');
  const [queHay, setQueHay] = useState('');
  const [quePaso, setQuePaso] = useState('');
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState<EstadoLugar>('visitado');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (lugarToEdit) {
        setNombre(lugarToEdit.nombre || '');
        setNombreConocido(lugarToEdit.nombre_conocido !== false);
        setTipo(lugarToEdit.tipo || 'pueblo');
        setPadreId(lugarToEdit.padre_id || null);
        setDescripcion(lugarToEdit.descripcion || '');
        setComoLlegar(lugarToEdit.como_llegar || '');
        setQueHay(lugarToEdit.que_hay || '');
        setQuePaso(lugarToEdit.que_paso || '');
        setNotas(lugarToEdit.notas || '');
        setEstado(lugarToEdit.estado || 'visitado');
        setEtiquetas(lugarToEdit.etiquetas || []);
      } else {
        setNombre('');
        setNombreConocido(true);
        setTipo('pueblo');
        setPadreId(initialPadre);
        setDescripcion('');
        setComoLlegar('');
        setQueHay('');
        setQuePaso('');
        setNotas('');
        setEstado('visitado');
        setEtiquetas([]);
      }
      setErrorMsg(null);
    }
  }, [isOpen, lugarToEdit, lugarPadreDefaultId]);

  // Calcular lugares inválidos como padre (evitar ciclos jerárquicos)
  const invalidParentIds = useMemo(() => {
    const set = new Set<string>();
    if (!lugarToEdit) return set;
    set.add(lugarToEdit.id);

    function collectDescendants(id: string) {
      const children = campanaLugares.filter((l) => l.padre_id === id);
      for (const child of children) {
        if (!set.has(child.id)) {
          set.add(child.id);
          collectDescendants(child.id);
        }
      }
    }
    collectDescendants(lugarToEdit.id);
    return set;
  }, [lugarToEdit, campanaLugares]);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

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
  });

  const isDirty = Boolean(
    lugarToEdit
      ? (nombre.trim() !== (lugarToEdit.nombre || '') ||
         descripcion.trim() !== (lugarToEdit.descripcion || '') ||
         comoLlegar.trim() !== (lugarToEdit.como_llegar || '') ||
         notas.trim() !== (lugarToEdit.notas || ''))
      : (nombre.trim() || descripcion.trim() || comoLlegar.trim() || notas.trim())
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en este lugar. ¿Seguro que deseas salir sin guardar?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Lista de posibles padres válidos
  const validParentOptions = useMemo(() => {
    return campanaLugares.filter((l) => !invalidParentIds.has(l.id));
  }, [campanaLugares, invalidParentIds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa un nombre para el lugar.');
      return;
    }

    onSave({
      nombre: nombre.trim(),
      nombre_conocido: nombreConocido,
      tipo,
      padre_id: padreId || null,
      descripcion: descripcion.trim(),
      como_llegar: comoLlegar.trim(),
      que_hay: queHay.trim(),
      que_paso: quePaso.trim(),
      notas: notas.trim(),
      estado,
      etiquetas,
    });
    onClose();
  };

  return (
    <div
      id="lugar-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="lugar-modal-dialog"
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#111827] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal fija */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-900/50 text-[#c9a227] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">
                {lugarToEdit ? `Editar lugar: ${lugarToEdit.nombre}` : 'Nuevo Lugar'}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                Registra pueblos, regiones, mazmorras o estancias descubiertas por tu grupo.
              </p>
            </div>
          </div>
          <button
            id="close-lugar-modal-btn"
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
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-900/60 text-xs text-rose-300 animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {/* Bloque 1: Identidad del Lugar */}
            <div className="space-y-4 p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c9a227] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Identidad y Jerarquía del Lugar</span>
              </h3>

              {/* Nombre */}
              <div>
                <label htmlFor="lugar-nombre-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del lugar <span className="text-amber-400">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="lugar-nombre-input"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ej: Phandalin, Cueva del Eco, Posada Colina de Piedra..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#111827] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

            {/* Checkbox: El grupo conoce el nombre real */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="lugar-nombre-conocido-checkbox"
                type="checkbox"
                checked={nombreConocido}
                onChange={(e) => setNombreConocido(e.target.checked)}
                className="w-4 h-4 rounded bg-[#111827] border-slate-700 text-[#c9a227] focus:ring-[#c9a227] accent-[#c9a227] cursor-pointer"
              />
              <label
                htmlFor="lugar-nombre-conocido-checkbox"
                className="text-xs text-slate-300 cursor-pointer select-none flex items-center gap-1.5"
              >
                {nombreConocido ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>El grupo de aventureros conoce el nombre real del lugar</span>
              </label>
            </div>
            {!nombreConocido && (
              <p className="text-[11px] text-amber-300/80 italic pl-6">
                En la lista se mostrará como &quot;?&quot; para preservar el misterio ante los jugadores.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Tipo de lugar */}
              <div>
                <label htmlFor="lugar-tipo-select" className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de lugar
                </label>
                <select
                  id="lugar-tipo-select"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoLugar)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-[#c9a227] cursor-pointer"
                >
                  {Object.entries(TIPO_LUGAR_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.iconLabel} {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado del lugar */}
              <div>
                <label htmlFor="lugar-estado-select" className="block text-xs font-semibold text-slate-300 mb-1">
                  Estado de exploración
                </label>
                <select
                  id="lugar-estado-select"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoLugar)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-[#c9a227] cursor-pointer"
                >
                  <option value="visitado">🟢 Visitado (explorado en persona)</option>
                  <option value="conocido">🔵 Conocido (oído o cartografiado)</option>
                  <option value="misterioso">🟠 Misterioso (rumores o secretos)</option>
                  <option value="inaccesible">⚪ Inaccesible (bloqueado o prohibido)</option>
                </select>
              </div>
            </div>

            {/* Lugar Padre (Jerarquía) */}
            <div className="pt-1">
              <label htmlFor="lugar-padre-select" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#c9a227]" />
                  <span>Lugar contenedor (Padre)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {padreId ? 'Sub-lugar anidado' : 'Lugar principal / raíz'}
                </span>
              </label>
              <select
                id="lugar-padre-select"
                value={padreId || ''}
                onChange={(e) => setPadreId(e.target.value ? e.target.value : null)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-[#c9a227] cursor-pointer"
              >
                <option value="">(Ninguno) - Es un lugar principal / raíz</option>
                {validParentOptions.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    ↳ {TIPO_LUGAR_CONFIG[parent.tipo]?.iconLabel || '📍'} {parent.nombre}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Por ejemplo, una posada o tienda puede estar dentro del pueblo de Phandalin.
              </p>
            </div>
          </div>

          {/* Bloque 2: Descripción y Cómo Llegar */}
          <div className="space-y-4 p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c9a227] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Descripción y Rutas de Acceso</span>
            </h3>

            {/* Descripción */}
            <div>
              <label htmlFor="lugar-desc-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción física y ambiente
              </label>
              <textarea
                id="lugar-desc-input"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cómo es visualmente, olores, clima, sonidos, arquitectura..."
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] leading-relaxed resize-y"
              />
            </div>

            {/* Cómo llegar */}
            <div>
              <label htmlFor="lugar-llegar-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Cómo llegar (caminos, hitos o peligros en la ruta)
              </label>
              <textarea
                id="lugar-llegar-input"
                rows={2}
                value={comoLlegar}
                onChange={(e) => setComoLlegar(e.target.value)}
                placeholder="Ej: Siguiendo el Sendero de Triboar hacia el este, cruce tras el viejo molino..."
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Bloque 3: Qué hay y Qué pasó */}
          <div className="space-y-4 p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c9a227] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contenido y Hechos Ocurridos</span>
            </h3>

            {/* Qué hay */}
            <div>
              <label htmlFor="lugar-que-hay-input" className="block text-xs font-semibold text-emerald-300 mb-1">
                ¿Qué hay allí? (Edificios, recursos, tiendas, peligros o puntos de interés)
              </label>
              <textarea
                id="lugar-que-hay-input"
                rows={2}
                value={queHay}
                onChange={(e) => setQueHay(e.target.value)}
                placeholder="Ej: Una posada acogedora, un herrero taciturno, un altar profanado..."
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] leading-relaxed resize-y"
              />
            </div>

            {/* Qué pasó */}
            <div>
              <label htmlFor="lugar-que-paso-input" className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                <History className="w-3 h-3 text-amber-400" />
                <span>¿Qué pasó aquí? (Acontecimientos o encuentros memorables del grupo)</span>
              </label>
              <textarea
                id="lugar-que-paso-input"
                rows={2}
                value={quePaso}
                onChange={(e) => setQuePaso(e.target.value)}
                placeholder="Ej: En este lugar libramos la emboscada contra los bandidos de la Marca Roja..."
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Bloque 4: Notas adicionales */}
          <div>
            <label htmlFor="lugar-notas-input" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#c9a227]" />
              <span>Notas generales y rumores</span>
            </label>
            <textarea
              id="lugar-notas-input"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Cualquier apunte extra, claves de acceso, secretos o recordatorios..."
              className="w-full px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] leading-relaxed resize-y"
            />
          </div>

          {/* Bloque 5: Selector de Etiquetas Temáticas */}
          <div>
            <TagSelector
              selectedTags={etiquetas}
              onChange={setEtiquetas}
              existingItems={campanaLugares}
              customPresets={ETIQUETAS_SUGERIDAS_LUGARES}
              labelColeccion="Etiquetas de Lugares"
            />
          </div>

          </div>

          {/* Botones de acción fijos en el pie del modal */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="cancel-lugar-btn"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              id="save-lugar-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md transition-all active:scale-98 min-h-[44px] flex items-center justify-center"
            >
              {lugarToEdit ? 'Guardar Cambios' : 'Crear Lugar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
