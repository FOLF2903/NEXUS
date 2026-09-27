import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Scroll,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  User,
  MapPin,
  Coins,
  Gift,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Mision, PasoMision, EstadoMision, NPC, Lugar } from '../types';
import { TagSelector } from './TagSelector';
import { ETIQUETAS_SUGERIDAS_MISIONES } from '../lib/tags';
import { ESTADO_MISION_CONFIG } from './MisionCard';

interface MisionModalProps {
  isOpen: boolean;
  campanaId?: string;
  misionToEdit?: Mision | null;
  campanaMisiones?: Mision[];
  campanaNpcs?: NPC[];
  campanaLugares?: Lugar[];
  onClose: () => void;
  onSave: (misionData: {
    titulo: string;
    descripcion: string;
    origen_npc_id: string | null;
    origen_lugar_id: string | null;
    estado: EstadoMision;
    pasos: PasoMision[];
    recompensa_conocida: string;
    recompensa_obtenida: string;
    notas: string;
    etiquetas: string[];
  }) => void;
}

export const MisionModal: React.FC<MisionModalProps> = ({
  isOpen,
  campanaId,
  misionToEdit,
  campanaMisiones = [],
  campanaNpcs = [],
  campanaLugares = [],
  onClose,
  onSave,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origenNpcId, setOrigenNpcId] = useState<string | null>(null);
  const [origenLugarId, setOrigenLugarId] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoMision>('activa');
  const [pasos, setPasos] = useState<PasoMision[]>([]);
  const [recompensaConocida, setRecompensaConocida] = useState('');
  const [recompensaObtenida, setRecompensaObtenida] = useState('');
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Inicializar el formulario según si estamos editando o creando
  useEffect(() => {
    if (isOpen) {
      if (misionToEdit) {
        setTitulo(misionToEdit.titulo);
        setDescripcion(misionToEdit.descripcion || '');
        setOrigenNpcId(misionToEdit.origen_npc_id || null);
        setOrigenLugarId(misionToEdit.origen_lugar_id || null);
        setEstado(misionToEdit.estado || 'activa');
        setPasos(
          misionToEdit.pasos && misionToEdit.pasos.length > 0
            ? misionToEdit.pasos.map((p) => ({ ...p }))
            : [
                {
                  id: `paso_${Date.now()}_1`,
                  texto: '',
                  completado: false,
                },
              ]
        );
        setRecompensaConocida(misionToEdit.recompensa_conocida || '');
        setRecompensaObtenida(misionToEdit.recompensa_obtenida || '');
        setNotas(misionToEdit.notas || '');
        setEtiquetas(misionToEdit.etiquetas || []);
      } else {
        setTitulo('');
        setDescripcion('');
        setOrigenNpcId(null);
        setOrigenLugarId(null);
        setEstado('activa');
        setPasos([
          {
            id: `paso_${Date.now()}_1`,
            texto: '',
            completado: false,
          },
        ]);
        setRecompensaConocida('');
        setRecompensaObtenida('');
        setNotas('');
        setEtiquetas([]);
      }
      setError(null);
    }
  }, [isOpen, misionToEdit]);

  if (!isOpen) return null;

  // Manejo de pasos
  const handleAddPaso = () => {
    setPasos((prev) => [
      ...prev,
      {
        id: `paso_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        texto: '',
        completado: false,
      },
    ]);
  };

  const handleUpdatePasoTexto = (id: string, nuevoTexto: string) => {
    setPasos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, texto: nuevoTexto } : p))
    );
  };

  const handleTogglePasoCompletado = (id: string) => {
    setPasos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completado: !p.completado } : p))
    );
  };

  const handleRemovePaso = (id: string) => {
    setPasos((prev) => prev.filter((p) => p.id !== id));
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
    misionToEdit
      ? (titulo.trim() !== (misionToEdit.titulo || '') ||
         descripcion.trim() !== (misionToEdit.descripcion || '') ||
         notas.trim() !== (misionToEdit.notas || '') ||
         recompensaConocida.trim() !== (misionToEdit.recompensa_conocida || ''))
      : (titulo.trim() || descripcion.trim() || notas.trim() || recompensaConocida.trim())
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en esta misión. ¿Seguro que deseas salir sin guardar?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError('El título de la misión es obligatorio.');
      return;
    }

    // Filtrar pasos vacíos al guardar
    const pasosLimpios = pasos
      .map((p) => ({ ...p, texto: p.texto.trim() }))
      .filter((p) => p.texto.length > 0);

    onSave({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      origen_npc_id: origenNpcId || null,
      origen_lugar_id: origenLugarId || null,
      estado,
      pasos: pasosLimpios,
      recompensa_conocida: recompensaConocida.trim(),
      recompensa_obtenida: recompensaObtenida.trim(),
      notas: notas.trim(),
      etiquetas,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="mision-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="mision-modal-dialog"
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#111827] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera fija */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/60 text-[#c9a227] border border-amber-800/40 shrink-0">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="mision-modal-title"
                className="font-serif text-lg sm:text-xl font-bold text-amber-100"
              >
                {misionToEdit ? 'Editar Misión' : 'Nueva Misión u Objetivo'}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                Registra encargos, tramas principales, secundarias y metas del grupo.
              </p>
            </div>
          </div>
          <button
            id="close-mision-modal-btn"
            type="button"
            onClick={handleRequestClose}
            className="text-slate-400 hover:text-amber-300 p-2 rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
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
              <div
                id="mision-modal-error"
                className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Bloque 1: Título y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="mision-titulo-input"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Título de la Misión <span className="text-amber-400">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="mision-titulo-input"
                  type="text"
                  required
                  placeholder="Ej: Rescatar a Gundren Buscarrocas"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
                />
              </div>

            <div>
              <label
                htmlFor="mision-estado-select"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Estado
              </label>
              <select
                id="mision-estado-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoMision)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              >
                <option value="activa">Activa (Dorado)</option>
                <option value="completada">Completada (Verde)</option>
                <option value="pausada">Pausada (Naranja)</option>
                <option value="fallada">Fallada (Rojo)</option>
                <option value="abandonada">Abandonada (Gris)</option>
              </select>
            </div>
          </div>

          {/* Bloque 2: Origen (NPC y Lugar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mision-origen-npc-select"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Origen: ¿Quién la dio? (NPC)</span>
              </label>
              <select
                id="mision-origen-npc-select"
                value={origenNpcId || ''}
                onChange={(e) => setOrigenNpcId(e.target.value || null)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              >
                <option value="">Ninguno (o desconocido)</option>
                {campanaNpcs.map((npc) => (
                  <option key={npc.id} value={npc.id}>
                    {npc.nombre} ({npc.rol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="mision-origen-lugar-select"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Origen: ¿Dónde se originó? (Lugar)</span>
              </label>
              <select
                id="mision-origen-lugar-select"
                value={origenLugarId || ''}
                onChange={(e) => setOrigenLugarId(e.target.value || null)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              >
                <option value="">Ninguno (o desconocido)</option>
                {campanaLugares.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nombre} ({loc.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bloque 3: Descripción */}
          <div>
            <label
              htmlFor="mision-descripcion-input"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Descripción / Qué hay que hacer
            </label>
            <textarea
              id="mision-descripcion-input"
              rows={3}
              placeholder="Explica el objetivo, trasfondo y detalles del encargo..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm leading-relaxed"
            />
          </div>

          {/* Bloque 4: Lista Dinámica de Pasos */}
          <div className="p-4 rounded-xl bg-[#0e1522] border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Pasos y Objetivos de la Misión
                </span>
                <span className="text-[11px] text-slate-400">
                  Marca las casillas conforme el grupo progrese en la aventura.
                </span>
              </div>
              <span className="text-xs text-amber-300 font-medium">
                {pasos.filter((p) => p.completado).length} de {pasos.length} completados
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {pasos.map((paso, idx) => (
                <div
                  key={paso.id}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePasoCompletado(paso.id)}
                    className="shrink-0 text-slate-400 hover:text-amber-400 transition-colors p-1"
                    title={paso.completado ? 'Marcar incompleto' : 'Marcar completado'}
                  >
                    {paso.completado ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-amber-400" />
                    )}
                  </button>

                  <input
                    type="text"
                    placeholder={`Paso ${idx + 1}...`}
                    value={paso.texto}
                    onChange={(e) => handleUpdatePasoTexto(paso.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPaso();
                      }
                    }}
                    className={`grow px-3 py-1.5 rounded-md bg-[#131b2a] border border-slate-700 text-sm focus:outline-hidden focus:border-[#c9a227] ${
                      paso.completado ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemovePaso(paso.id)}
                    disabled={pasos.length <= 1 && idx === 0 && !paso.texto}
                    className="shrink-0 p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-md hover:bg-rose-950/30 disabled:opacity-30 disabled:hover:text-slate-500"
                    title="Eliminar este paso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              id="add-paso-btn"
              type="button"
              onClick={handleAddPaso}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir paso</span>
            </button>
          </div>

          {/* Bloque 5: Recompensas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mision-recompensa-conocida-input"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Recompensa Prometida / Conocida</span>
              </label>
              <textarea
                id="mision-recompensa-conocida-input"
                rows={2}
                placeholder="Ej: 10 po por escoltar el carromato, un mapa antiguo..."
                value={recompensaConocida}
                onChange={(e) => setRecompensaConocida(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="mision-recompensa-obtenida-input"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recompensa Obtenida / Recibida</span>
              </label>
              <textarea
                id="mision-recompensa-obtenida-input"
                rows={2}
                placeholder="Ej: 15 po, poción de curación adicional..."
                value={recompensaObtenida}
                onChange={(e) => setRecompensaObtenida(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
              />
            </div>
          </div>

          {/* Bloque 6: Notas Libres */}
          <div>
            <label
              htmlFor="mision-notas-input"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas y Pistas del DM o Jugadores</span>
            </label>
            <textarea
              id="mision-notas-input"
              rows={2}
              placeholder="Anotaciones clave, sospechas, cómo contactar al contratante..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm leading-relaxed"
            />
          </div>

          {/* Bloque 7: Etiquetas Temáticas */}
          <div>
            <TagSelector
              selectedTags={etiquetas}
              onChange={setEtiquetas}
              existingItems={campanaMisiones}
              customPresets={ETIQUETAS_SUGERIDAS_MISIONES}
              labelColeccion="Etiquetas de Misiones"
            />
          </div>

          </div>

          {/* Botones de acción fijos en el pie */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="cancel-mision-btn"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center font-medium"
            >
              Cancelar
            </button>
            <button
              id="save-mision-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md shadow-amber-950/30 min-h-[44px] flex items-center justify-center"
            >
              {misionToEdit ? 'Guardar Cambios' : 'Crear Misión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
