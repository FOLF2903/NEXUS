import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Scroll,
  CheckCircle2,
  Circle,
  User,
  MapPin,
  Coins,
  Gift,
  FileText,
  Tag,
  Plus,
  Sparkles,
  Calendar,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Mision, Campana, NPC, Lugar, EstadoMision, Sesion, ModoApp } from '../types';
import { ESTADO_MISION_CONFIG } from './MisionCard';
import { ConfirmModal } from './ConfirmModal';
import { AccionesMenu } from './AccionesMenu';
import { LinkedSessionsList } from './LinkedSessionsList';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface MisionViewProps {
  mision: Mision;
  campana: Campana;
  allNpcs?: NPC[];
  allLugares?: Lugar[];
  allSesiones?: Sesion[];
  modoApp?: ModoApp;
  onBack: () => void;
  onEdit: (mision: Mision) => void;
  onDelete: (mision: Mision) => void;
  onUpdateMision?: (updatedMision: Mision) => void;
  onTogglePaso: (misionId: string, pasoId: string) => void;
  onUpdateEstado?: (misionId: string, nuevoEstado: EstadoMision) => void;
  onAddPasoRapido?: (misionId: string, textoPaso: string) => void;
  onNavigateToNpc?: (npcId: string) => void;
  onNavigateToLugar?: (lugarId: string) => void;
  onSelectSesion?: (sesion: Sesion) => void;
  backLabel?: string;
}

export const MisionView: React.FC<MisionViewProps> = ({
  mision,
  campana,
  allNpcs = [],
  allLugares = [],
  allSesiones = [],
  modoApp = 'jugador',
  onBack,
  onEdit,
  onDelete,
  onUpdateMision,
  onTogglePaso,
  onUpdateEstado,
  onAddPasoRapido,
  onNavigateToNpc,
  onNavigateToLugar,
  onSelectSesion,
  backLabel,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nuevoPasoTexto, setNuevoPasoTexto] = useState('');
  const [showAddPasoInput, setShowAddPasoInput] = useState(false);

  const estadoCfg = ESTADO_MISION_CONFIG[mision.estado] || ESTADO_MISION_CONFIG.activa;

  const totalPasos = mision.pasos ? mision.pasos.length : 0;
  const pasosCompletados = mision.pasos
    ? mision.pasos.filter((p) => p.completado).length
    : 0;
  const porcentaje =
    totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;
  const todosCompletados = totalPasos > 0 && pasosCompletados === totalPasos;

  const origenNpc = mision.origen_npc_id
    ? allNpcs.find((n) => n.id === mision.origen_npc_id)
    : null;

  const origenLugar = mision.origen_lugar_id
    ? allLugares.find((l) => l.id === mision.origen_lugar_id)
    : null;

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdateMision) {
      onUpdateMision({
        ...mision,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportMision = () => {
    exportSingleEntity('mision', mision, {
      sesion_ids: mision.sesion_ids || [],
      origen_npc_id: mision.origen_npc_id || null,
      origen_lugar_id: mision.origen_lugar_id || null,
    });
  };

  const handleAddPasoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPasoTexto.trim() || !onAddPasoRapido) return;
    onAddPasoRapido(mision.id, nuevoPasoTexto.trim());
    setNuevoPasoTexto('');
    setShowAddPasoInput(false);
  };

  const formattedDate = mision.creado_en
    ? new Date(mision.creado_en).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Barra de navegación superior compacta */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          id="back-to-campana-misiones-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 transition-colors px-3 py-2 rounded-lg bg-[#111827] border border-slate-800 hover:border-amber-700/50 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{backLabel || 'Volver a Misiones'}</span>
          <span className="sm:hidden">Misiones</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="edit-mision-btn"
            type="button"
            onClick={() => onEdit(mision)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-xs min-h-[44px]"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar</span>
          </button>

          <AccionesMenu
            buttonId="mision-more-actions-btn"
            title="Opciones de la misión"
            items={[
              {
                id: 'exportar-mision',
                label: 'Exportar Misión',
                descripcion: 'Descargar datos de la misión en archivo JSON',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportMision,
              },
              {
                id: 'eliminar-mision',
                label: 'Eliminar Misión',
                descripcion: 'Borrar permanentemente esta misión',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => setIsDeleteModalOpen(true),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>

      {/* Tarjeta Principal de Cabecera */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#111827] border border-amber-900/40 shadow-xl relative overflow-hidden">
        {/* Adorno sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium tracking-wide">
              <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{campana.nombre}</span>
              {formattedDate && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </>
              )}
            </div>

            <h1
              id="mision-title-heading"
              className="font-serif text-2xl md:text-3xl font-bold text-slate-100 tracking-tight"
            >
              {mision.titulo}
            </h1>

            {/* Badges de origen */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {origenNpc && (
                <div
                  onClick={() => onNavigateToNpc && onNavigateToNpc(origenNpc.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0e1522] border border-amber-900/40 text-xs text-slate-200 ${
                    onNavigateToNpc ? 'cursor-pointer hover:border-amber-500/60' : ''
                  }`}
                  title="Ver ficha de este NPC"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Otorgada por:</span>
                  <span className="font-semibold text-amber-200">{origenNpc.nombre}</span>
                  <span className="text-[11px] text-slate-400">({origenNpc.rol})</span>
                </div>
              )}

              {origenLugar && (
                <div
                  onClick={() => onNavigateToLugar && onNavigateToLugar(origenLugar.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0e1522] border border-amber-900/40 text-xs text-slate-200 ${
                    onNavigateToLugar ? 'cursor-pointer hover:border-amber-500/60' : ''
                  }`}
                  title="Ver ficha de este lugar"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Lugar:</span>
                  <span className="font-semibold text-amber-200">{origenLugar.nombre}</span>
                  <span className="text-[11px] text-slate-400">({origenLugar.tipo})</span>
                </div>
              )}
            </div>
          </div>

          {/* Estado Selector / Badge */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${estadoCfg.dot}`} />
              <span className="uppercase tracking-wider font-bold">
                {estadoCfg.label}
              </span>
            </div>

            {/* Acciones rápidas para cambiar de estado */}
            {onUpdateEstado && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Cambiar a:</span>
                {(['activa', 'completada', 'pausada', 'fallada', 'abandonada'] as EstadoMision[])
                  .filter((st) => st !== mision.estado)
                  .map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateEstado(mision.id, st)}
                      className="px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors capitalize underline underline-offset-2"
                    >
                      {st}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              {mision.estado === 'completada' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4 text-amber-400" />
              )}
              <span>Progreso de la misión:</span>
              <strong className="text-amber-200">
                {totalPasos > 0
                  ? `${pasosCompletados} de ${totalPasos} pasos completados`
                  : 'Sin pasos definidos'}
              </strong>
            </span>
            <span className="font-bold text-amber-300 text-sm">{porcentaje}%</span>
          </div>

          <div className="w-full h-3 bg-[#0a0f18] rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${estadoCfg.progressBar}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Sugerencia interactiva si todos los pasos están listos pero no marcada completada */}
        {todosCompletados && mision.estado !== 'completada' && onUpdateEstado && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-xs text-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">
                  ¡Todos los pasos de esta misión han sido completados!
                </p>
                <p className="text-emerald-400/80">
                  ¿El grupo ha concluido el objetivo? Puedes marcarla como completada.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateEstado(mision.id, 'completada')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shrink-0 shadow-sm"
            >
              Marcar como Completada
            </button>
          </div>
        )}
      </div>

      {/* Bloque: Descripción */}
      {mision.descripcion && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-md">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Descripción del Encargo</span>
          </h2>
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
            {mision.descripcion}
          </div>
        </div>
      )}

      {/* Bloque: Lista de Pasos Interactiva */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
            <h2 className="text-base font-bold text-slate-100 font-serif">
              Pasos y Objetivos ({pasosCompletados}/{totalPasos})
            </h2>
          </div>

          {!showAddPasoInput && onAddPasoRapido && (
            <button
              type="button"
              onClick={() => setShowAddPasoInput(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir paso</span>
            </button>
          )}
        </div>

        {totalPasos === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 mb-2">
              No hay pasos registrados para esta misión.
            </p>
            {onAddPasoRapido && (
              <button
                type="button"
                onClick={() => setShowAddPasoInput(true)}
                className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar el primer paso</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {mision.pasos.map((paso, index) => (
              <div
                key={paso.id}
                onClick={() => onTogglePaso(mision.id, paso.id)}
                className={`group flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                  paso.completado
                    ? 'bg-[#0b101a] border-slate-800/60 text-slate-400'
                    : 'bg-[#0e1522] border-slate-800 hover:border-amber-700/50 text-slate-100'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 shrink-0 focus:outline-hidden"
                  aria-label={paso.completado ? 'Marcar incompleto' : 'Marcar completado'}
                >
                  {paso.completado ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:scale-110 transition-all" />
                  )}
                </button>

                <div className="grow min-w-0">
                  <span
                    className={`text-sm leading-relaxed block ${
                      paso.completado
                        ? 'line-through text-slate-400'
                        : 'font-medium text-slate-100'
                    }`}
                  >
                    {paso.texto}
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 shrink-0 font-mono mt-0.5">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Input rápido para añadir paso */}
        {showAddPasoInput && onAddPasoRapido && (
          <form
            onSubmit={handleAddPasoSubmit}
            className="mt-3 p-3 rounded-xl bg-[#0e1522] border border-amber-800/40 flex items-center gap-2"
          >
            <input
              type="text"
              autoFocus
              placeholder="Escribe el siguiente paso..."
              value={nuevoPasoTexto}
              onChange={(e) => setNuevoPasoTexto(e.target.value)}
              className="grow px-3 py-1.5 rounded-lg bg-[#131b2a] border border-slate-700 text-sm text-slate-100 focus:outline-hidden focus:border-[#c9a227]"
            />
            <button
              type="submit"
              disabled={!nuevoPasoTexto.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black disabled:opacity-40 transition-colors"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddPasoInput(false);
                setNuevoPasoTexto('');
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>

      {/* Bloque Recompensas: Conocida y Obtenida */}
      {(mision.recompensa_conocida || mision.recompensa_obtenida) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mision.recompensa_conocida && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-md">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>Recompensa Prometida / Conocida</span>
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                {mision.recompensa_conocida}
              </p>
            </div>
          )}

          {mision.recompensa_obtenida && (
            <div className="p-5 rounded-2xl bg-[#111827] border border-emerald-900/30 shadow-md">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>Recompensa Obtenida</span>
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                {mision.recompensa_obtenida}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bloque: Notas */}
      {mision.notas && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-md">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Notas de la Misión</span>
          </h2>
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
            {mision.notas}
          </div>
        </div>
      )}

      {/* Sección privada de Notas del DM */}
      <DmNotesSection
        modoApp={modoApp}
        notasDm={mision.notas_dm}
        onSaveNotasDm={handleSaveDmNotes}
        entityName={mision.titulo}
      />

      {/* Sesiones en las que ha aparecido o avanzado (Fase 7) */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-md">
        <LinkedSessionsList
          idPrefix="mision-sesiones"
          sesionIds={mision.sesion_ids || []}
          allSesiones={allSesiones}
          title="Sesiones en las que ha intervenido"
          emptyMessage="Esta misión no está vinculada a ninguna sesión registrada todavía."
          onSelectSesion={onSelectSesion}
        />
      </div>

      {/* Bloque: Etiquetas Temáticas */}
      {mision.etiquetas && mision.etiquetas.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800/80 shadow-md">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Etiquetas Temáticas</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {mision.etiquetas.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-amber-950/40 text-amber-300 text-xs font-medium border border-amber-900/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Misión"
        message={`¿Estás seguro de que deseas eliminar la misión "${mision.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Misión"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete(mision);
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
