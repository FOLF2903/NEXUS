import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Minus,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Footprints,
  Users,
  Skull,
  Flame,
  Mountain,
  Bug,
  Droplet,
  Leaf,
  HelpCircle,
} from 'lucide-react';
import { Monstruo, TipoMonstruo, Campana } from '../types';
import { TagSelector } from './TagSelector';
import { ETIQUETAS_SUGERIDAS_BESTIARIO } from '../lib/tags';
import { TIPO_MONSTRUO_CONFIG } from './MonstruoCard';

interface MonstruoModalProps {
  isOpen: boolean;
  campana?: Campana;
  monstruoToEdit: Monstruo | null;
  campanaMonstruos?: Monstruo[];
  onClose: () => void;
  onSave: (monstruoData: Omit<Monstruo, 'id' | 'creado_en'> | Monstruo) => void;
}

const TIPOS_DISPONIBLES: TipoMonstruo[] = [
  'bestia',
  'humanoide',
  'no_muerto',
  'dragon',
  'gigante',
  'monstruosidad',
  'aberracion',
  'cieno',
  'planta',
  'otro',
];

export const MonstruoModal: React.FC<MonstruoModalProps> = ({
  isOpen,
  campana,
  monstruoToEdit,
  campanaMonstruos = [],
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [nombreConocido, setNombreConocido] = useState(true);
  const [tipo, setTipo] = useState<TipoMonstruo>('humanoide');
  const [descripcionVisual, setDescripcionVisual] = useState('');
  const [comportamiento, setComportamiento] = useState('');
  const [debilidades, setDebilidades] = useState('');
  const [resistencias, setResistencias] = useState('');
  const [dondeLoVimos, setDondeLoVimos] = useState('');
  const [vecesEncontrado, setVecesEncontrado] = useState<number>(1);
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [errorNombre, setErrorNombre] = useState(false);

  useEffect(() => {
    if (monstruoToEdit) {
      setNombre(monstruoToEdit.nombre || '');
      setNombreConocido(monstruoToEdit.nombre_conocido !== false);
      setTipo(monstruoToEdit.tipo || 'humanoide');
      setDescripcionVisual(monstruoToEdit.descripcion_visual || '');
      setComportamiento(monstruoToEdit.comportamiento || '');
      setDebilidades(monstruoToEdit.debilidades || '');
      setResistencias(monstruoToEdit.resistencias || '');
      setDondeLoVimos(monstruoToEdit.donde_lo_vimos || '');
      setVecesEncontrado(
        typeof monstruoToEdit.veces_encontrado === 'number' && monstruoToEdit.veces_encontrado >= 1
          ? monstruoToEdit.veces_encontrado
          : 1
      );
      setNotas(monstruoToEdit.notas || '');
      setEtiquetas(monstruoToEdit.etiquetas || []);
    } else {
      setNombre('');
      setNombreConocido(true);
      setTipo('humanoide');
      setDescripcionVisual('');
      setComportamiento('');
      setDebilidades('');
      setResistencias('');
      setDondeLoVimos('');
      setVecesEncontrado(1);
      setNotas('');
      setEtiquetas([]);
    }
    setErrorNombre(false);
  }, [monstruoToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNombre = nombre.trim();

    if (!finalNombre) {
      setErrorNombre(true);
      return;
    }

    const payload = {
      campana_id: monstruoToEdit ? monstruoToEdit.campana_id : (campana ? campana.id : ''),
      nombre: finalNombre,
      nombre_conocido: nombreConocido,
      tipo,
      descripcion_visual: descripcionVisual.trim(),
      comportamiento: comportamiento.trim(),
      debilidades: debilidades.trim(),
      resistencias: resistencias.trim(),
      donde_lo_vimos: dondeLoVimos.trim(),
      veces_encontrado: Math.max(1, vecesEncontrado),
      notas: notas.trim(),
      etiquetas,
      sesion_ids: monstruoToEdit?.sesion_ids || [],
    };

    if (monstruoToEdit) {
      onSave({
        ...monstruoToEdit,
        ...payload,
      });
    } else {
      onSave(payload);
    }

    onClose();
  };

  const handleStepVeces = (delta: number) => {
    setVecesEncontrado((prev) => Math.max(1, (prev || 1) + delta));
  };

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const isDirty = Boolean(
    monstruoToEdit
      ? (nombre.trim() !== (monstruoToEdit.nombre || '') ||
         descripcionVisual.trim() !== (monstruoToEdit.descripcion_visual || '') ||
         comportamiento.trim() !== (monstruoToEdit.comportamiento || '') ||
         dondeLoVimos.trim() !== (monstruoToEdit.donde_lo_vimos || '') ||
         notas.trim() !== (monstruoToEdit.notas || ''))
      : (nombre.trim() || descripcionVisual.trim() || comportamiento.trim() || dondeLoVimos.trim() || notas.trim())
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en esta criatura. ¿Seguro que deseas salir sin guardar?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

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

  if (!isOpen) return null;

  return (
    <div
      id="monstruo-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="monstruo-modal-content"
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#0f172a] border border-amber-900/40 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="monstruo-modal-title"
      >
        {/* Cabecera fija */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-900/30 shrink-0">
              <Skull className="w-5 h-5" />
            </span>
            <div>
              <h2 id="monstruo-modal-title" className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                {monstruoToEdit ? 'Editar Cuaderno de Monstruo' : 'Añadir Nueva Criatura al Bestiario'}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                Cuaderno de campo de avistamientos, tácticas y puntos débiles descubiertos
              </p>
            </div>
          </div>
          <button
            id="cerrar-monstruo-modal-btn"
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
            {/* Nombre y Checkbox de conocimiento */}
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="nombre-monstruo-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Nombre de la Criatura o Bestia <span className="text-red-400">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="nombre-monstruo-input"
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errorNombre) setErrorNombre(false);
                  }}
                  placeholder={nombreConocido ? "ej: Goblin, Huargo, Beholder, Lobo de cueva..." : "ej: ? (La criatura del pantano)"}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border ${
                    errorNombre ? 'border-red-500' : 'border-slate-700 focus:border-[#c9a227]'
                  } text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors`}
                />
                {errorNombre && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> El nombre del monstruo es obligatorio. Si es desconocido puedes escribir "?"
                  </p>
                )}
              </div>

            {/* Checkbox de Nombre Conocido */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {nombreConocido ? (
                  <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <div>
                  <label
                    htmlFor="nombre-conocido-checkbox"
                    className="text-xs font-medium text-slate-200 cursor-pointer block"
                  >
                    El grupo conoce su nombre real
                  </label>
                  <span className="text-[11px] text-slate-400 block">
                    {nombreConocido
                      ? 'Se mostrará con su nombre oficial en el bestiario'
                      : 'Se catalogará con signo de interrogación "?" hasta que identifiquen la especie'}
                  </span>
                </div>
              </div>
              <input
                id="nombre-conocido-checkbox"
                type="checkbox"
                checked={nombreConocido}
                onChange={(e) => setNombreConocido(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#c9a227] focus:ring-[#c9a227] cursor-pointer"
              />
            </div>
          </div>

          {/* Tipo de Monstruo y Veces Encontrado (2 columnas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Monstruo */}
            <div>
              <label
                htmlFor="tipo-monstruo-select"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Tipo / Taxonomía
              </label>
              <select
                id="tipo-monstruo-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMonstruo)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-[#c9a227] cursor-pointer"
              >
                {TIPOS_DISPONIBLES.map((t) => {
                  const cfg = TIPO_MONSTRUO_CONFIG[t];
                  return (
                    <option key={t} value={t}>
                      {cfg.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Veces Encontrado (Contador con stepper) */}
            <div>
              <label
                htmlFor="veces-encontrado-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between"
              >
                <span>Veces Encontrado</span>
                <span className="text-[11px] text-slate-400 font-normal">Contador manual</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepVeces(-1)}
                  disabled={vecesEncontrado <= 1}
                  className="p-2.5 rounded-xl bg-[#1e293b] border border-slate-700 hover:border-amber-500/50 text-slate-300 disabled:opacity-40 disabled:hover:border-slate-700 transition-colors"
                  title="Restar encuentro"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="veces-encontrado-input"
                  type="number"
                  min={1}
                  value={vecesEncontrado}
                  onChange={(e) => setVecesEncontrado(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center px-3.5 py-2 rounded-xl bg-[#1e293b] border border-slate-700 text-sm font-semibold text-amber-200 focus:outline-none focus:border-[#c9a227]"
                />
                <button
                  type="button"
                  onClick={() => handleStepVeces(1)}
                  className="p-2.5 rounded-xl bg-[#1e293b] border border-slate-700 hover:border-amber-500/50 text-slate-300 transition-colors"
                  title="Añadir encuentro"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dónde lo vimos */}
          <div>
            <label
              htmlFor="donde-vimos-monstruo-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Dónde lo vimos / Hábitat o Lugar de Encuentro</span>
            </label>
            <input
              id="donde-vimos-monstruo-input"
              type="text"
              value={dondeLoVimos}
              onChange={(e) => setDondeLoVimos(e.target.value)}
              placeholder="ej: Sendero de Triboar, pantano cenagoso, cripta de los Tresendar..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] transition-colors"
            />
          </div>

          {/* Descripción visual */}
          <div>
            <label
              htmlFor="descripcion-visual-monstruo-textarea"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Descripción Visual y Rasgos Físicos
            </label>
            <textarea
              id="descripcion-visual-monstruo-textarea"
              rows={2}
              value={descripcionVisual}
              onChange={(e) => setDescripcionVisual(e.target.value)}
              placeholder="¿Cómo se ve físicamente? Tamaño relativo, piel, escamas, pelaje, colmillos, garras, armamento que porta..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] transition-colors resize-y"
            />
          </div>

          {/* Comportamiento */}
          <div>
            <label
              htmlFor="comportamiento-monstruo-textarea"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Comportamiento y Tácticas en Combate</span>
            </label>
            <textarea
              id="comportamiento-monstruo-textarea"
              rows={2}
              value={comportamiento}
              onChange={(e) => setComportamiento(e.target.value)}
              placeholder="¿Cómo ataca? En jauría, al acecho desde las sombras, ataques a distancia, huidas organizadas, defensa férrea de nidos..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] transition-colors resize-y"
            />
          </div>

          {/* Debilidades y Resistencias (2 columnas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Debilidades */}
            <div>
              <label
                htmlFor="debilidades-monstruo-textarea"
                className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Debilidades Descubiertas</span>
              </label>
              <textarea
                id="debilidades-monstruo-textarea"
                rows={2}
                value={debilidades}
                onChange={(e) => setDebilidades(e.target.value)}
                placeholder="Vulnerabilidades observadas (fuego, plata, luz solar, poca agilidad, cobardía...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-y"
              />
            </div>

            {/* Resistencias */}
            <div>
              <label
                htmlFor="resistencias-monstruo-textarea"
                className="block text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1.5 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Resistencias Sospechadas</span>
              </label>
              <textarea
                id="resistencias-monstruo-textarea"
                rows={2}
                value={resistencias}
                onChange={(e) => setResistencias(e.target.value)}
                placeholder="Inmunidades, piel gruesa ante cortes, resistencia a hechizos o veneno..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors resize-y"
              />
            </div>
          </div>

          {/* Notas adicionales */}
          <div>
            <label
              htmlFor="notas-monstruo-textarea"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Notas de Campo y Pistas Libres
            </label>
            <textarea
              id="notas-monstruo-textarea"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Rumores escuchados en tabernas, botines que custodiaban, líderes o jerarquías..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e293b] border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] transition-colors resize-y"
            />
          </div>

          {/* Etiquetas Temáticas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Etiquetas Temáticas
            </label>
            <TagSelector
              selectedTags={etiquetas}
              onChange={setEtiquetas}
              existingItems={campanaMonstruos}
              customPresets={ETIQUETAS_SUGERIDAS_BESTIARIO}
              labelColeccion="Etiquetas del Bestiario de la Campaña"
            />
          </div>

          </div>

          {/* Botones de acción fijos en el pie */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="cancelar-monstruo-modal-btn"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              id="guardar-monstruo-modal-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-sm transition-colors shadow-lg shadow-amber-950/30 min-h-[44px] flex items-center justify-center"
            >
              {monstruoToEdit ? 'Guardar Cambios' : 'Registrar Criatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
