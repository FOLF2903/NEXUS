import React, { useState, useEffect, useRef } from 'react';
import { X, User, Shield, MapPin, Eye, EyeOff, FileText, HelpCircle, CheckCircle } from 'lucide-react';
import { NPC, ActitudNPC } from '../types';
import { TagSelector } from './TagSelector';
import { ETIQUETAS_SUGERIDAS_NPCS } from '../lib/tags';

interface NpcModalProps {
  isOpen: boolean;
  campanaId?: string;
  onClose: () => void;
  onSave: (data: {
    nombre: string;
    nombre_conocido: boolean;
    rol: string;
    actitud: ActitudNPC;
    descripcion: string;
    ubicacion_habitual: string;
    informacion_conocida: string;
    informacion_sospechada: string;
    notas: string;
    etiquetas: string[];
  }) => void;
  npcToEdit?: NPC | null;
  campanaNpcs: NPC[];
}

export const ACTITUD_CONFIG: Record<
  ActitudNPC,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  aliado: {
    label: 'Aliado',
    bg: 'bg-emerald-950/50',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
    dot: 'bg-emerald-400',
  },
  amistoso: {
    label: 'Amistoso',
    bg: 'bg-teal-950/50',
    text: 'text-teal-300',
    border: 'border-teal-800/60',
    dot: 'bg-teal-400',
  },
  neutral: {
    label: 'Neutral',
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  },
  receloso: {
    label: 'Receloso',
    bg: 'bg-amber-950/50',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
    dot: 'bg-amber-400',
  },
  hostil: {
    label: 'Hostil',
    bg: 'bg-rose-950/50',
    text: 'text-rose-300',
    border: 'border-rose-800/60',
    dot: 'bg-rose-400',
  },
  desconocido: {
    label: 'Desconocido',
    bg: 'bg-zinc-900',
    text: 'text-zinc-400',
    border: 'border-zinc-800',
    dot: 'bg-zinc-500',
  },
};

export const NpcModal: React.FC<NpcModalProps> = ({
  isOpen,
  onClose,
  onSave,
  npcToEdit,
  campanaNpcs,
}) => {
  const [nombre, setNombre] = useState('');
  const [nombreConocido, setNombreConocido] = useState(true);
  const [rol, setRol] = useState('');
  const [actitud, setActitud] = useState<ActitudNPC>('neutral');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacionHabitual, setUbicacionHabitual] = useState('');
  const [informacionConocida, setInformacionConocida] = useState('');
  const [informacionSospechada, setInformacionSospechada] = useState('');
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (npcToEdit) {
      setNombre(npcToEdit.nombre || '');
      setNombreConocido(npcToEdit.nombre_conocido !== false);
      setRol(npcToEdit.rol || '');
      setActitud(npcToEdit.actitud || 'neutral');
      setDescripcion(npcToEdit.descripcion || '');
      setUbicacionHabitual(npcToEdit.ubicacion_habitual || '');
      setInformacionConocida(npcToEdit.informacion_conocida || '');
      setInformacionSospechada(npcToEdit.informacion_sospechada || '');
      setNotas(npcToEdit.notas || '');
      setEtiquetas(npcToEdit.etiquetas || []);
    } else {
      setNombre('');
      setNombreConocido(true);
      setRol('');
      setActitud('neutral');
      setDescripcion('');
      setUbicacionHabitual('');
      setInformacionConocida('');
      setInformacionSospechada('');
      setNotas('');
      setEtiquetas([]);
    }
    setError(null);
  }, [npcToEdit, isOpen]);

  // Foco en el primer campo
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const isDirty = Boolean(
    npcToEdit
      ? (nombre.trim() !== (npcToEdit.nombre || '') ||
         rol.trim() !== (npcToEdit.rol || '') ||
         descripcion.trim() !== (npcToEdit.descripcion || '') ||
         ubicacionHabitual.trim() !== (npcToEdit.ubicacion_habitual || '') ||
         notas.trim() !== (npcToEdit.notas || ''))
      : (nombre.trim() || rol.trim() || descripcion.trim() || ubicacionHabitual.trim() || notas.trim())
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en este NPC. ¿Seguro que deseas salir sin guardar?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Manejo de Escape
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del NPC es obligatorio (si no lo conocen, escribe su apodo o "?" y desmarca la casilla).');
      return;
    }

    onSave({
      nombre: nombre.trim(),
      nombre_conocido: nombreConocido,
      rol: rol.trim(),
      actitud,
      descripcion: descripcion.trim(),
      ubicacion_habitual: ubicacionHabitual.trim(),
      informacion_conocida: informacionConocida.trim(),
      informacion_sospechada: informacionSospechada.trim(),
      notas: notas.trim(),
      etiquetas,
    });
    onClose();
  };

  return (
    <div
      id="npc-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="npc-modal-dialog"
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="npc-modal-title"
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-[#c9a227] border border-amber-800/40 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="npc-modal-title" className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                {npcToEdit ? 'Editar Ficha de NPC' : 'Nuevo Personaje No Jugador (NPC)'}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                Registra la información, actitud y pistas descubiertas por tu grupo de aventureros.
              </p>
            </div>
          </div>
          <button
            id="npc-modal-close-btn"
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
          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Nombre y Rol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="npc-nombre" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nombre del NPC <span className="text-[#c9a227]">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="npc-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Elmar Barthen, o La Encapuchada"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                  required
                />

                {/* Checkbox Nombre Conocido */}
                <div className="mt-2.5 flex items-start gap-2">
                  <input
                    id="npc-nombre-conocido"
                    type="checkbox"
                    checked={nombreConocido}
                    onChange={(e) => setNombreConocido(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-[#0e1522] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                  />
                  <label
                    htmlFor="npc-nombre-conocido"
                    className="text-xs text-slate-300 cursor-pointer select-none leading-tight"
                  >
                    <span className="font-semibold text-amber-200">El grupo conoce su nombre real</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {nombreConocido
                        ? 'Se mostrará con su nombre real en la lista de NPCs.'
                        : 'Se guardará el nombre pero en la lista pública aparecerá como "?" para mantener el misterio.'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="npc-rol" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rol / Ocupación
                </label>
                <input
                  id="npc-rol"
                  type="text"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  placeholder="ej. Tendero, Alcalde, Mercenario, Mago ermitaño"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                />

                {/* Actitud */}
                <div className="mt-3">
                  <label htmlFor="npc-actitud" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Actitud hacia el grupo
                  </label>
                  <div className="relative">
                    <select
                      id="npc-actitud"
                      value={actitud}
                      onChange={(e) => setActitud(e.target.value as ActitudNPC)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] cursor-pointer appearance-none pr-8"
                    >
                      <option value="aliado">🟢 Aliado (dispuesto a arriesgarse por el grupo)</option>
                      <option value="amistoso">🟢 Amistoso (cordial y cooperativo)</option>
                      <option value="neutral">⚪ Neutral (indiferente o pragmático)</option>
                      <option value="receloso">🟠 Receloso (desconfiado o vigilante)</option>
                      <option value="hostil">🔴 Hostil (abiertamente enemigo o violento)</option>
                      <option value="desconocido">⚫ Desconocido (aún no se han relacionado)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <Shield className="w-4 h-4 text-[#c9a227]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ubicación Habitual */}
            <div>
              <label htmlFor="npc-ubicacion" className="block text-xs font-medium text-slate-300 mb-1.5">
                Ubicación Habitual
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4 text-[#c9a227]" />
                </div>
                <input
                  id="npc-ubicacion"
                  type="text"
                  value={ubicacionHabitual}
                  onChange={(e) => setUbicacionHabitual(e.target.value)}
                  placeholder="ej. Suministros Barthen, Phandalin"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                />
              </div>
            </div>

            {/* Descripción Física */}
            <div>
              <label htmlFor="npc-descripcion" className="block text-xs font-medium text-slate-300 mb-1.5">
                Descripción Física y Apariencia
              </label>
              <textarea
                id="npc-descripcion"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="ej. Humano enjuto, medio calvo, unos 50 años. Viste delantal de cuero manchado y gafas redondas."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] min-h-[60px]"
              />
            </div>

            {/* Información Conocida vs Sospechada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="npc-info-conocida"
                  className="block text-xs font-medium text-emerald-300 mb-1.5 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Información Conocida (Hechos comprobados)</span>
                </label>
                <textarea
                  id="npc-info-conocida"
                  rows={3}
                  value={informacionConocida}
                  onChange={(e) => setInformacionConocida(e.target.value)}
                  placeholder="ej. Nos pagó 10 po por entregar el carromato. Está preocupado por la banda Marca Roja."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[75px]"
                />
              </div>

              <div>
                <label
                  htmlFor="npc-info-sospechada"
                  className="block text-xs font-medium text-amber-300 mb-1.5 flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Información Sospechada (Rumores y sospechas)</span>
                </label>
                <textarea
                  id="npc-info-sospechada"
                  rows={3}
                  value={informacionSospechada}
                  onChange={(e) => setInformacionSospechada(e.target.value)}
                  placeholder="ej. Se rumorea que tiene deudas con el prestamista local o esconde a un familiar prófugo."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[75px]"
                />
              </div>
            </div>

            {/* Notas Generales */}
            <div>
              <label htmlFor="npc-notas" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Notas Libres de la Campaña</span>
              </label>
              <textarea
                id="npc-notas"
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="ej. Nos dijo que los Marca Roja frecuentan El Gigante Durmiente. Si le traemos noticias de Gundren nos hará descuento."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] min-h-[75px]"
              />
            </div>

            {/* Selector de Etiquetas */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Etiquetas Temáticas del NPC
              </label>
              <TagSelector
                selectedTags={etiquetas}
                onChange={setEtiquetas}
                existingItems={campanaNpcs}
                customPresets={ETIQUETAS_SUGERIDAS_NPCS}
                labelColeccion="Etiquetas de NPCs"
              />
            </div>
          </div>

          {/* Footer fijo */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="npc-cancel-btn"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              id="npc-save-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold text-black bg-[#c9a227] hover:bg-[#dbb333] shadow-md transition-colors min-h-[44px] flex items-center justify-center"
            >
              {npcToEdit ? 'Actualizar Ficha' : 'Guardar NPC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
