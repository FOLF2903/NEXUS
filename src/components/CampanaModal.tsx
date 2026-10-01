import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, BookMarked, Calendar, AlignLeft, HelpCircle } from 'lucide-react';
import { Campana, EstadoCampana } from '../types';

interface CampanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campana: Campana) => void;
  campanaToEdit?: Campana | null;
}

const SISTEMAS_PREDEFINIDOS = [
  'D&D 2024',
  'D&D 2014',
  'Pathfinder 2e',
  'Call of Cthulhu',
  'Otro',
];

export const CampanaModal: React.FC<CampanaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  campanaToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [sistema, setSistema] = useState('D&D 2024');
  const [otroSistema, setOtroSistema] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<EstadoCampana>('activa');
  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notasDm, setNotasDm] = useState('');
  const [errorNombre, setErrorNombre] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (campanaToEdit) {
      setNombre(campanaToEdit.nombre);
      if (SISTEMAS_PREDEFINIDOS.includes(campanaToEdit.sistema)) {
        setSistema(campanaToEdit.sistema);
        setOtroSistema('');
      } else {
        setSistema('Otro');
        setOtroSistema(campanaToEdit.sistema);
      }
      setDescripcion(campanaToEdit.descripcion || '');
      setEstado(campanaToEdit.estado || 'activa');
      setFechaInicio(campanaToEdit.fecha_inicio || new Date().toISOString().slice(0, 10));
      setNotasDm(campanaToEdit.notas_dm || '');
    } else {
      setNombre('');
      setSistema('D&D 2024');
      setOtroSistema('');
      setDescripcion('');
      setEstado('activa');
      setFechaInicio(new Date().toISOString().slice(0, 10));
      setNotasDm('');
    }
    setErrorNombre(false);
  }, [campanaToEdit, isOpen]);

  // Foco inicial en el primer campo al abrir
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const isDirty = Boolean(
    campanaToEdit
      ? (nombre.trim() !== campanaToEdit.nombre ||
         descripcion.trim() !== (campanaToEdit.descripcion || '') ||
         notasDm.trim() !== (campanaToEdit.notas_dm || ''))
      : (nombre.trim() || descripcion.trim() || notasDm.trim())
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en la campaña. ¿Seguro que deseas salir sin guardar?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Manejo de tecla Escape
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
      setErrorNombre(true);
      return;
    }

    const sistemaFinal =
      sistema === 'Otro' ? otroSistema.trim() || 'Sistema personalizado' : sistema;

    const campana: Campana = {
      id: campanaToEdit?.id || `camp_${Date.now()}`,
      nombre: nombre.trim(),
      sistema: sistemaFinal,
      descripcion: descripcion.trim(),
      estado,
      fecha_inicio: fechaInicio,
      pj_ids: campanaToEdit?.pj_ids || [],
      notas_dm: notasDm.trim(),
      creada_en: campanaToEdit?.creada_en || new Date().toISOString(),
    };

    onSave(campana);
    onClose();
  };

  return (
    <div
      id="campana-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="campana-modal-dialog"
        className="relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#131b2a] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="campana-modal-title"
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-[#c9a227] border border-amber-800/40 shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 id="campana-modal-title" className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                {campanaToEdit ? 'Editar Campaña' : 'Nueva Campaña'}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                Configura los detalles del mundo y crónica para tus jugadores.
              </p>
            </div>
          </div>
          <button
            id="campana-modal-close"
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
            {/* Nombre */}
            <div>
              <label
                htmlFor="campana-nombre-input"
                className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5"
              >
                Nombre de la Campaña <span className="text-rose-400">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="campana-nombre-input"
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorNombre) setErrorNombre(false);
                }}
                placeholder="ej. La Maldición de Strahd, Aventuras en Faerûn..."
                className={`w-full px-4 py-2.5 rounded-lg bg-[#0e1522] border text-slate-100 focus:outline-none focus:ring-1 text-sm ${
                  errorNombre
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-[#c9a227] focus:ring-[#c9a227]'
                }`}
                required
              />
              {errorNombre && (
                <p className="mt-1 text-xs text-rose-400">
                  Por favor ingresa un nombre para identificar la campaña.
                </p>
              )}
            </div>

            {/* Sistema de juego */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5">
                Sistema de Juego
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SISTEMAS_PREDEFINIDOS.map((sys) => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => setSistema(sys)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors min-h-[40px] flex items-center justify-center ${
                      sistema === sys
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-xs'
                        : 'bg-[#0e1522] border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>

              {sistema === 'Otro' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={otroSistema}
                    onChange={(e) => setOtroSistema(e.target.value)}
                    placeholder="Especifica el nombre del sistema (ej. Savage Worlds, FATE)..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                  />
                </div>
              )}
            </div>

            {/* Estado y Fecha de inicio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="campana-estado-select"
                  className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5"
                >
                  Estado actual
                </label>
                <select
                  id="campana-estado-select"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoCampana)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
                >
                  <option value="activa">Activa (En curso)</option>
                  <option value="pausada">En pausa</option>
                  <option value="completada">Completada</option>
                  <option value="abandonada">Abandonada</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="campana-fecha-input"
                  className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5"
                >
                  Fecha de inicio
                </label>
                <input
                  id="campana-fecha-input"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
                >
                </input>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="campana-descripcion-input"
                className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5"
              >
                Descripción / Sinopsis (Opcional)
              </label>
              <textarea
                id="campana-descripcion-input"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve introducción de la premisa, tono o región de la campaña..."
                className="w-full px-4 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm leading-relaxed min-h-[80px]"
              />
            </div>

            {/* Notas privadas DM */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="campana-notas-dm-input"
                  className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider"
                >
                  Notas Privadas del DM (Opcional)
                </label>
                <span className="text-[11px] text-slate-400">Secretos, tramas maestras</span>
              </div>
              <textarea
                id="campana-notas-dm-input"
                rows={3}
                value={notasDm}
                onChange={(e) => setNotasDm(e.target.value)}
                placeholder="Anotaciones secretas para el Dungeon Master (ganchos de trama, giros planeados)..."
                className="w-full px-4 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm font-sans min-h-[80px]"
              />
            </div>
          </div>

          {/* Footer fijo */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="campana-modal-cancel-btn"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center font-medium"
            >
              Cancelar
            </button>
            <button
              id="campana-modal-save-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Shield className="w-4 h-4 text-black" />
              <span>{campanaToEdit ? 'Guardar Cambios' : 'Crear Campaña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
