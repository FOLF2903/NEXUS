import React, { useState, useEffect, useRef } from 'react';
import { X, User, Shield, Heart, Award, Sparkles, ScrollText, FileText, AlertCircle } from 'lucide-react';
import { PJ, EstadoPJ } from '../types';
import { TagSelector } from './TagSelector';

interface PjModalProps {
  isOpen: boolean;
  onClose: () => void;
  campanaId?: string;
  onSave: (data: {
    nombre: string;
    clase: string;
    raza: string;
    nivel: number;
    pg_max: number;
    ca: number;
    descripcion: string;
    personalidad: string;
    trasfondo: string;
    notas: string;
    estado: EstadoPJ;
    etiquetas: string[];
  }) => void;
  pjToEdit?: PJ | null;
  campanaPjs: PJ[];
}

export const ESTADO_PJ_CONFIG: Record<
  EstadoPJ,
  { label: string; bg: string; text: string; border: string; dot: string; desc: string }
> = {
  activo: {
    label: 'Activo',
    bg: 'bg-emerald-950/50',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
    dot: 'bg-emerald-400',
    desc: 'En el grupo activo',
  },
  retirado: {
    label: 'Retirado',
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
    desc: 'Ha abandonado temporal o definitivamente la aventura',
  },
  muerto: {
    label: 'Muerto',
    bg: 'bg-rose-950/50',
    text: 'text-rose-300',
    border: 'border-rose-800/60',
    dot: 'bg-rose-400',
    desc: 'Ha caído durante la campaña',
  },
  desaparecido: {
    label: 'Desaparecido',
    bg: 'bg-amber-950/50',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
    dot: 'bg-amber-400',
    desc: 'Separado del grupo o paradero desconocido',
  },
};

export const ETIQUETAS_SUGERIDAS_PJS = [
  'jugador',
  'tanque',
  'curador',
  'lanzador-conjuros',
  'marcial',
  'sigiloso',
  'enano',
  'elfo',
  'humano',
  'mediano',
  'noble',
  'forastero',
];

export const PjModal: React.FC<PjModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pjToEdit,
  campanaPjs,
}) => {
  const [nombre, setNombre] = useState('');
  const [clase, setClase] = useState('');
  const [raza, setRaza] = useState('');
  const [nivel, setNivel] = useState<number>(1);
  const [pgMax, setPgMax] = useState<number>(10);
  const [ca, setCa] = useState<number>(10);
  const [estado, setEstado] = useState<EstadoPJ>('activo');
  const [descripcion, setDescripcion] = useState('');
  const [personalidad, setPersonalidad] = useState('');
  const [trasfondo, setTrasfondo] = useState('');
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    setShowDiscardConfirm(false);
    if (pjToEdit) {
      setNombre(pjToEdit.nombre || '');
      setClase(pjToEdit.clase || '');
      setRaza(pjToEdit.raza || '');
      setNivel(pjToEdit.nivel || 1);
      setPgMax(pjToEdit.pg_max || 10);
      setCa(pjToEdit.ca || 10);
      setEstado(pjToEdit.estado || 'activo');
      setDescripcion(pjToEdit.descripcion || '');
      setPersonalidad(pjToEdit.personalidad || '');
      setTrasfondo(pjToEdit.trasfondo || '');
      setNotas(pjToEdit.notas || '');
      setEtiquetas(pjToEdit.etiquetas || []);
    } else {
      setNombre('');
      setClase('');
      setRaza('');
      setNivel(1);
      setPgMax(10);
      setCa(10);
      setEstado('activo');
      setDescripcion('');
      setPersonalidad('');
      setTrasfondo('');
      setNotas('');
      setEtiquetas(['jugador']);
    }
    setError(null);
  }, [pjToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNombre = nombre.trim();
    if (!cleanNombre) {
      setError('El nombre del personaje jugador es obligatorio.');
      return;
    }

    const cleanClase = clase.trim();
    if (!cleanClase) {
      setError('La clase del personaje es obligatoria (ej: Guerrero, Bárbaro, Mago).');
      return;
    }

    const cleanRaza = raza.trim();
    if (!cleanRaza) {
      setError('La raza o especie del personaje es obligatoria (ej: Enano, Elfo, Humano).');
      return;
    }

    // Verificar si ya existe otro PJ con el mismo nombre en la campaña
    const duplicate = campanaPjs.find(
      (p) =>
        p.nombre.toLowerCase().trim() === cleanNombre.toLowerCase() &&
        p.id !== pjToEdit?.id
    );

    if (duplicate) {
      setError(`Ya existe un personaje jugador registrado con el nombre "${cleanNombre}".`);
      return;
    }

    onSave({
      nombre: cleanNombre,
      clase: cleanClase,
      raza: cleanRaza,
      nivel: Math.max(1, Math.min(30, Number(nivel) || 1)),
      pg_max: Math.max(1, Number(pgMax) || 1),
      ca: Math.max(1, Number(ca) || 10),
      estado,
      descripcion: descripcion.trim(),
      personalidad: personalidad.trim(),
      trasfondo: trasfondo.trim(),
      notas: notas.trim(),
      etiquetas,
    });
    onClose();
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
    pjToEdit
      ? (nombre.trim() !== (pjToEdit.nombre || '') ||
         clase.trim() !== (pjToEdit.clase || '') ||
         raza.trim() !== (pjToEdit.raza || '') ||
         descripcion.trim() !== (pjToEdit.descripcion || '') ||
         personalidad.trim() !== (pjToEdit.personalidad || '') ||
         trasfondo.trim() !== (pjToEdit.trasfondo || '') ||
         notas.trim() !== (pjToEdit.notas || ''))
      : (nombre.trim() || clase.trim() || raza.trim() || descripcion.trim() || personalidad.trim() || trasfondo.trim() || notas.trim())
  );

  const handleRequestClose = () => {
    if (showDiscardConfirm) {
      setShowDiscardConfirm(false);
      onClose();
    } else if (isDirty) {
      setShowDiscardConfirm(true);
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
  }, [isOpen, isDirty, showDiscardConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col bg-[#111827] border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pj-modal-title"
      >
        {/* Cabecera fija del Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-amber-900/30 bg-[#0d121d] shrink-0">
          <div className="flex items-center gap-2.5 text-amber-200">
            <User className="w-5 h-5 text-[#c9a227] shrink-0" />
            <h2 id="pj-modal-title" className="font-serif text-lg sm:text-xl font-bold">
              {pjToEdit ? 'Editar Ficha de Personaje (PJ)' : 'Nuevo Personaje Jugador (PJ)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="text-slate-400 hover:text-amber-200 transition-colors p-2 rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario envolvente */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Cuerpo scrolleable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
                {error}
              </div>
            )}

            {/* Nombre y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  Nombre del Personaje *
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Kragthor Barbafuego"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
                />
              </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5">
                Estado *
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPJ)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              >
                <option value="activo">Activo</option>
                <option value="retirado">Retirado</option>
                <option value="muerto">Muerto</option>
                <option value="desaparecido">Desaparecido</option>
              </select>
            </div>
          </div>

          {/* Clase, Raza y Nivel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Clase *
              </label>
              <input
                type="text"
                required
                value={clase}
                onChange={(e) => setClase(e.target.value)}
                placeholder="Ej. Bárbaro, Mago, Pícaro"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Raza / Especie *
              </label>
              <input
                type="text"
                required
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
                placeholder="Ej. Enano, Elfo, Humano"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Nivel</span>
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={nivel}
                onChange={(e) => setNivel(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm font-mono"
              />
            </div>
          </div>

          {/* Estadísticas de Combate: PG Máx y CA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Puntos de Golpe Máximos (PG Máx)</span>
              </label>
              <input
                type="number"
                min="1"
                value={pgMax}
                onChange={(e) => setPgMax(parseInt(e.target.value) || 1)}
                placeholder="32"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sky-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Clase de Armadura (CA)</span>
              </label>
              <input
                type="number"
                min="1"
                value={ca}
                onChange={(e) => setCa(parseInt(e.target.value) || 10)}
                placeholder="15"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm font-mono font-bold"
              />
            </div>
          </div>

          {/* Descripción Física */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Descripción Física & Rasgos
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Enano robusto con barba trenzada en tres ramales, cicatriz en la mejilla izquierda y hacha de guerra a la espalda..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm resize-y"
            />
          </div>

          {/* Personalidad */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Personalidad, Ideales & Defectos</span>
            </label>
            <textarea
              rows={2}
              value={personalidad}
              onChange={(e) => setPersonalidad(e.target.value)}
              placeholder="Impulsivo, leal a ultranza con sus compañeros, odia las arañas y nunca retrocede ante un reto..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm resize-y"
            />
          </div>

          {/* Trasfondo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-amber-400" />
              <span>Trasfondo & Origen</span>
            </label>
            <textarea
              rows={2}
              value={trasfondo}
              onChange={(e) => setTrasfondo(e.target.value)}
              placeholder="Ex-minero de las Montañas de la Espada que busca venganza tras el asalto de su clan..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm resize-y"
            />
          </div>

          {/* Notas & Secretos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas de Campaña / Deudas / Objetivos</span>
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Debe 50 po a un mercader de Neverwinter. Busca una forja legendaria..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm resize-y"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Etiquetas Temáticas
            </label>
            <TagSelector
              selectedTags={etiquetas}
              onChange={setEtiquetas}
              customPresets={ETIQUETAS_SUGERIDAS_PJS}
              labelColeccion="Etiquetas del Grupo"
            />
          </div>

          </div>

          {/* Alerta responsiva de cambios sin guardar (Iframe-safe, sin popups nativos) */}
          {showDiscardConfirm && (
            <div className="px-5 py-3 bg-amber-950/90 border-t border-amber-600/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200 animate-in fade-in shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tienes cambios sin guardar en este personaje. ¿Deseas descartarlos y salir?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 min-h-[38px] text-xs font-semibold"
                >
                  Continuar editando
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white min-h-[38px] text-xs font-semibold"
                >
                  Descartar y salir
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción fijos en el pie */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0d121d] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800 text-sm font-medium transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#c9a227] hover:from-amber-500 hover:to-[#dfb532] text-slate-950 text-sm font-bold shadow-md shadow-amber-950/40 transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[44px] flex items-center justify-center"
            >
              {pjToEdit ? 'Guardar Cambios' : 'Crear Personaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
