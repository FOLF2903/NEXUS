import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Feather, Calendar, Clock, Bookmark, Link2 } from 'lucide-react';
import { Sesion, NPC, Lugar, Mision, Objeto, Monstruo } from '../types';
import { TagSelector } from './TagSelector';
import { EntityMultiSelect, EntitySelectItem } from './EntityMultiSelect';
import { cleanAndNormalizeTags } from '../lib/tags';
import { getSesionesByCampana } from '../lib/storage';

interface SesionModalProps {
  isOpen: boolean;
  campanaId: string;
  siguienteNumero: number;
  sesionToEdit?: Sesion | null;
  campanaSesiones?: Sesion[];
  campanaNpcs?: NPC[];
  campanaLugares?: Lugar[];
  campanaMisiones?: Mision[];
  campanaObjetos?: Objeto[];
  campanaMonstruos?: Monstruo[];
  onClose: () => void;
  onSave: (sesion: Sesion) => void;
}

export const SesionModal: React.FC<SesionModalProps> = ({
  isOpen,
  campanaId,
  siguienteNumero,
  sesionToEdit,
  campanaSesiones,
  campanaNpcs = [],
  campanaLugares = [],
  campanaMisiones = [],
  campanaObjetos = [],
  campanaMonstruos = [],
  onClose,
  onSave,
}) => {
  const [numero, setNumero] = useState(siguienteNumero);
  const [titulo, setTitulo] = useState('');
  const [fechaReal, setFechaReal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [diaJuegoInicio, setDiaJuegoInicio] = useState(1);
  const [diaJuegoFin, setDiaJuegoFin] = useState<string>('');
  const [duracionHoras, setDuracionHoras] = useState<string>('');
  const [notas, setNotas] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [npcIds, setNpcIds] = useState<string[]>([]);
  const [lugarIds, setLugarIds] = useState<string[]>([]);
  const [misionIds, setMisionIds] = useState<string[]>([]);
  const [objetoIds, setObjetoIds] = useState<string[]>([]);
  const [monstruoIds, setMonstruoIds] = useState<string[]>([]);
  const [errorTitulo, setErrorTitulo] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const sesionesDeCampana = campanaSesiones || getSesionesByCampana(campanaId);

  useEffect(() => {
    if (sesionToEdit) {
      setNumero(sesionToEdit.numero);
      setTitulo(sesionToEdit.titulo);
      setFechaReal(sesionToEdit.fecha_real || new Date().toISOString().slice(0, 10));
      setDiaJuegoInicio(sesionToEdit.dia_juego_inicio ?? 1);
      setDiaJuegoFin(
        sesionToEdit.dia_juego_fin !== null && sesionToEdit.dia_juego_fin !== undefined
          ? String(sesionToEdit.dia_juego_fin)
          : ''
      );
      setDuracionHoras(
        sesionToEdit.duracion_horas !== null && sesionToEdit.duracion_horas !== undefined
          ? String(sesionToEdit.duracion_horas)
          : ''
      );
      setNotas(sesionToEdit.notas || '');
      setEtiquetas(cleanAndNormalizeTags(sesionToEdit.etiquetas || []));
      setNpcIds(Array.isArray(sesionToEdit.npc_ids) ? sesionToEdit.npc_ids : []);
      setLugarIds(Array.isArray(sesionToEdit.lugar_ids) ? sesionToEdit.lugar_ids : []);
      setMisionIds(Array.isArray(sesionToEdit.mision_ids) ? sesionToEdit.mision_ids : []);
      setObjetoIds(Array.isArray(sesionToEdit.objeto_ids) ? sesionToEdit.objeto_ids : []);
      setMonstruoIds(Array.isArray(sesionToEdit.monstruo_ids) ? sesionToEdit.monstruo_ids : []);
    } else {
      setNumero(siguienteNumero);
      setTitulo('');
      setFechaReal(new Date().toISOString().slice(0, 10));
      setDiaJuegoInicio(siguienteNumero > 1 ? siguienteNumero : 1);
      setDiaJuegoFin('');
      setDuracionHoras('');
      setNotas('');
      setEtiquetas([]);
      setNpcIds([]);
      setLugarIds([]);
      setMisionIds([]);
      setObjetoIds([]);
      setMonstruoIds([]);
    }
    setErrorTitulo(false);
  }, [sesionToEdit, siguienteNumero, isOpen]);

  // Foco inicial en el primer campo
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const isDirty = Boolean(
    sesionToEdit
      ? (titulo.trim() !== sesionToEdit.titulo ||
         notas.trim() !== (sesionToEdit.notas || '') ||
         npcIds.length !== (sesionToEdit.npc_ids || []).length ||
         lugarIds.length !== (sesionToEdit.lugar_ids || []).length)
      : (titulo.trim() || notas.trim() || npcIds.length > 0 || lugarIds.length > 0)
  );

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar en esta sesión. ¿Seguro que deseas salir sin guardar?'
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

  // Preparar opciones de entidades
  const npcOptions: EntitySelectItem[] = useMemo(
    () =>
      campanaNpcs.map((n) => ({
        id: n.id,
        nombre: n.nombre,
        detalle: n.rol ? `${n.rol} • ${n.actitud}` : n.actitud,
      })),
    [campanaNpcs]
  );

  const lugarOptions: EntitySelectItem[] = useMemo(
    () =>
      campanaLugares.map((l) => ({
        id: l.id,
        nombre: l.nombre,
        detalle: `${l.tipo} • ${l.estado}`,
      })),
    [campanaLugares]
  );

  const misionOptions: EntitySelectItem[] = useMemo(
    () =>
      campanaMisiones.map((m) => ({
        id: m.id,
        nombre: m.titulo,
        detalle: `Estado: ${m.estado}`,
      })),
    [campanaMisiones]
  );

  const objetoOptions: EntitySelectItem[] = useMemo(
    () =>
      campanaObjetos.map((o) => ({
        id: o.id,
        nombre: o.nombre,
        detalle: o.quien_lo_lleva ? `Portado por: ${o.quien_lo_lleva}` : o.tipo,
      })),
    [campanaObjetos]
  );

  const monstruoOptions: EntitySelectItem[] = useMemo(
    () =>
      campanaMonstruos.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        detalle: `${m.tipo || 'Criatura'} • Encontrado ${m.veces_encontrado || 1} vez/veces`,
      })),
    [campanaMonstruos]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorTitulo(true);
      return;
    }

    const fin = diaJuegoFin !== '' ? Number(diaJuegoFin) : null;
    const duracion = duracionHoras !== '' ? Number(duracionHoras) : null;

    const sesion: Sesion = {
      id: sesionToEdit?.id || `ses_${Date.now()}`,
      campana_id: campanaId,
      numero: Number(numero),
      titulo: titulo.trim(),
      fecha_real: fechaReal,
      dia_juego_inicio: Number(diaJuegoInicio),
      dia_juego_fin: fin,
      duracion_horas: duracion,
      pj_ids_presentes: sesionToEdit?.pj_ids_presentes || [],
      notas: notas.trim(),
      notas_dm: sesionToEdit?.notas_dm || '',
      etiquetas,
      npc_ids: npcIds,
      lugar_ids: lugarIds,
      mision_ids: misionIds,
      objeto_ids: objetoIds,
      monstruo_ids: monstruoIds,
      creada_en: sesionToEdit?.creada_en || new Date().toISOString(),
    };

    onSave(sesion);
    onClose();
  };

  return (
    <div
      id="sesion-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleRequestClose}
    >
      <div
        id="sesion-modal-dialog"
        className="relative w-full max-w-3xl max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#131b2a] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sesion-modal-title"
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-[#c9a227] border border-amber-800/40 shrink-0">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 id="sesion-modal-title" className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                {sesionToEdit ? `Editar Sesión #${numero}` : `Registrar Sesión #${numero}`}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                Anota lo acontecido, combates, pistas y revelaciones de la aventura.
              </p>
            </div>
          </div>
          <button
            id="sesion-modal-close"
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
            {/* Número y Título */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label
                  htmlFor="sesion-numero-input"
                  className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5"
                >
                  Nº Sesión
                </label>
                <input
                  id="sesion-numero-input"
                  type="number"
                  min={1}
                  value={numero}
                  onChange={(e) => setNumero(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="sesion-titulo-input"
                  className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5"
                >
                  Título de la Sesión <span className="text-rose-400">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="sesion-titulo-input"
                  type="text"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (errorTitulo) setErrorTitulo(false);
                  }}
                  placeholder="ej. Emboscada en el Bosque de Neverwinter..."
                  className={`w-full px-4 py-2.5 rounded-lg bg-[#0e1522] border text-slate-100 focus:outline-none focus:ring-1 text-sm ${
                    errorTitulo
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-700 focus:border-[#c9a227] focus:ring-[#c9a227]'
                  }`}
                  required
                />
                {errorTitulo && (
                  <p className="mt-1 text-xs text-rose-400">
                    El título de la sesión es obligatorio.
                  </p>
                )}
              </div>
            </div>

            {/* Fechas y Tiempo */}
            <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-4">
              <span className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                Cronología y Duración
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label
                    htmlFor="sesion-fecha-real-input"
                    className="block text-xs text-slate-300 mb-1"
                  >
                    Fecha real de juego
                  </label>
                  <input
                    id="sesion-fecha-real-input"
                    type="date"
                    value={fechaReal}
                    onChange={(e) => setFechaReal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sesion-dia-inicio-input"
                    className="block text-xs text-slate-300 mb-1"
                  >
                    Día en el mundo de juego
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="sesion-dia-inicio-input"
                      type="number"
                      min={1}
                      value={diaJuegoInicio}
                      onChange={(e) => setDiaJuegoInicio(Number(e.target.value))}
                      placeholder="Inicio"
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-[#c9a227]"
                    />
                    <span className="text-slate-500 text-xs">a</span>
                    <input
                      id="sesion-dia-fin-input"
                      type="number"
                      min={diaJuegoInicio}
                      value={diaJuegoFin}
                      onChange={(e) => setDiaJuegoFin(e.target.value)}
                      placeholder="Fin"
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-[#c9a227]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sesion-duracion-input"
                    className="block text-xs text-slate-300 mb-1"
                  >
                    Horas de partida (Aprox.)
                  </label>
                  <div className="relative">
                    <input
                      id="sesion-duracion-input"
                      type="number"
                      step="0.5"
                      min="0"
                      value={duracionHoras}
                      onChange={(e) => setDuracionHoras(e.target.value)}
                      placeholder="ej. 3.5"
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-[#c9a227]"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen / Notas de la sesión */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="sesion-notas-input"
                  className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider"
                >
                  Resumen de la Sesión / Crónica
                </label>
                <span className="text-[11px] text-slate-400">
                  Acepta saltos de línea para listar sucesos
                </span>
              </div>
              <textarea
                id="sesion-notas-input"
                rows={7}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="El grupo exploró las ruinas al este del camino real. Tras derrotar a los tres trasgos exploradores, encontraron un pergamino sellado con cera púrpura..."
                className="w-full px-4 py-3 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-sm leading-relaxed min-h-[140px]"
              />
            </div>

            {/* Selector de Etiquetas */}
            <div>
              <TagSelector
                selectedTags={etiquetas}
                onChange={setEtiquetas}
                existingItems={sesionesDeCampana}
                labelColeccion="Etiquetas de la Sesión"
              />
            </div>

            {/* Sección de Vinculaciones con Entidades */}
            <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-amber-200">
                  <Link2 className="w-4 h-4 text-[#c9a227]" />
                  <span className="font-serif text-xs font-bold uppercase tracking-wider">
                    Elementos Vinculados a esta Sesión
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Relaciona NPCs, lugares, misiones u objetos
                </span>
              </div>

              {/* NPCs */}
              <div>
                <EntityMultiSelect
                  idPrefix="sesion-link-npcs"
                  label="NPCs que aparecieron o interactuaron"
                  icon="👤"
                  items={npcOptions}
                  selectedIds={npcIds}
                  onChange={setNpcIds}
                  placeholder="Buscar NPC por nombre o rol..."
                  emptyLabel="No hay NPCs creados en la campaña"
                />
              </div>

              {/* Lugares */}
              <div>
                <EntityMultiSelect
                  idPrefix="sesion-link-lugares"
                  label="Lugares visitados o descubiertos"
                  icon="📍"
                  items={lugarOptions}
                  selectedIds={lugarIds}
                  onChange={setLugarIds}
                  placeholder="Buscar lugar o región..."
                  emptyLabel="No hay lugares creados en la campaña"
                />
              </div>

              {/* Misiones */}
              <div>
                <EntityMultiSelect
                  idPrefix="sesion-link-misiones"
                  label="Misiones avanzadas, iniciadas o completadas"
                  icon="📜"
                  items={misionOptions}
                  selectedIds={misionIds}
                  onChange={setMisionIds}
                  placeholder="Buscar misión u objetivo..."
                  emptyLabel="No hay misiones creadas en la campaña"
                />
              </div>

              {/* Objetos */}
              <div>
                <EntityMultiSelect
                  idPrefix="sesion-link-objetos"
                  label="Objetos o tesoros encontrados / utilizados"
                  icon="🗡️"
                  items={objetoOptions}
                  selectedIds={objetoIds}
                  onChange={setObjetoIds}
                  placeholder="Buscar objeto o tesoro..."
                  emptyLabel="No hay objetos creados en la campaña"
                />
              </div>

              {/* Monstruos / Bestiario */}
              <div>
                <EntityMultiSelect
                  idPrefix="sesion-link-monstruos"
                  label="Monstruos combatidos / avistados (Bestiario)"
                  icon="👹"
                  items={monstruoOptions}
                  selectedIds={monstruoIds}
                  onChange={setMonstruoIds}
                  placeholder="Buscar criatura en el bestiario..."
                  emptyLabel="No hay criaturas registradas en el bestiario"
                />
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
            <button
              id="sesion-modal-cancel-btn"
              type="button"
              onClick={handleRequestClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center font-medium"
            >
              Cancelar
            </button>
            <button
              id="sesion-modal-save-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Feather className="w-4 h-4 text-black" />
              <span>{sesionToEdit ? 'Guardar Cambios' : 'Registrar Sesión'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
