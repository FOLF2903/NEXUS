import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Edit3,
  Trash2,
  Tag,
  Users,
  MapPin,
  Scroll,
  Gift,
  Skull,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Link2,
  Download,
} from 'lucide-react';
import { Campana, Sesion, NPC, Lugar, Mision, Objeto, Monstruo, ModoApp } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { AccionesMenu } from './AccionesMenu';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface SesionViewProps {
  campana: Campana;
  sesion: Sesion;
  todasLasSesiones: Sesion[];
  npcs?: NPC[];
  lugares?: Lugar[];
  misiones?: Mision[];
  objetos?: Objeto[];
  monstruos?: Monstruo[];
  modoApp?: ModoApp;
  onBackToCampana: () => void;
  onEditSesion: (sesion: Sesion) => void;
  onDeleteSesion: (sesionId: string) => void;
  onUpdateSesion?: (updatedSesion: Sesion) => void;
  onSelectSesion: (sesion: Sesion) => void;
  onNavigateToEntity?: (type: 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo', id: string) => void;
  backLabel?: string;
}

export const SesionView: React.FC<SesionViewProps> = ({
  campana,
  sesion,
  todasLasSesiones,
  npcs = [],
  lugares = [],
  misiones = [],
  objetos = [],
  monstruos = [],
  modoApp = 'jugador',
  onBackToCampana,
  onEditSesion,
  onDeleteSesion,
  onUpdateSesion,
  onSelectSesion,
  onNavigateToEntity,
  backLabel,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdateSesion) {
      onUpdateSesion({
        ...sesion,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportSesion = () => {
    exportSingleEntity('sesion', sesion, {
      npc_ids: sesion.npc_ids || [],
      lugar_ids: sesion.lugar_ids || [],
      mision_ids: sesion.mision_ids || [],
      objeto_ids: sesion.objeto_ids || [],
      monstruo_ids: sesion.monstruo_ids || [],
      pj_ids_presentes: sesion.pj_ids_presentes || [],
    });
  };

  // Ordenadas por número
  const sortedSessions = [...todasLasSesiones].sort((a, b) => a.numero - b.numero);
  const currentIndex = sortedSessions.findIndex((s) => s.id === sesion.id);
  const prevSession = currentIndex > 0 ? sortedSessions[currentIndex - 1] : null;
  const nextSession =
    currentIndex !== -1 && currentIndex < sortedSessions.length - 1
      ? sortedSessions[currentIndex + 1]
      : null;

  // Entidades vinculadas
  const linkedNpcs = (sesion.npc_ids || [])
    .map((id) => npcs.find((n) => n.id === id))
    .filter((n): n is NPC => Boolean(n));

  const linkedLugares = (sesion.lugar_ids || [])
    .map((id) => lugares.find((l) => l.id === id))
    .filter((l): l is Lugar => Boolean(l));

  const linkedMisiones = (sesion.mision_ids || [])
    .map((id) => misiones.find((m) => m.id === id))
    .filter((m): m is Mision => Boolean(m));

  const linkedObjetos = (sesion.objeto_ids || [])
    .map((id) => objetos.find((o) => o.id === id))
    .filter((o): o is Objeto => Boolean(o));

  const linkedMonstruos = (sesion.monstruo_ids || [])
    .map((id) => monstruos.find((m) => m.id === id))
    .filter((m): m is Monstruo => Boolean(m));

  const totalLinked =
    linkedNpcs.length +
    linkedLugares.length +
    linkedMisiones.length +
    linkedObjetos.length +
    linkedMonstruos.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Barra de navegación superior fija (Sticky) con acceso rápido permanente */}
      <div className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 border-b border-amber-900/30 transition-all flex items-center justify-between gap-2">
        <button
          id="back-to-campana-btn"
          type="button"
          onClick={onBackToCampana}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-700/60 transition-colors text-xs font-semibold min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{backLabel || `Volver a ${campana.nombre}`}</span>
          <span className="sm:hidden">Volver</span>
        </button>

        {/* Acciones de la sesión */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="edit-current-sesion-btn"
            type="button"
            onClick={() => onEditSesion(sesion)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-200 border border-slate-700 transition-colors text-xs font-semibold min-h-[44px]"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar</span>
          </button>

          <AccionesMenu
            buttonId="sesion-more-actions-btn"
            title="Opciones de la sesión"
            items={[
              {
                id: 'exportar-sesion',
                label: 'Exportar Sesión',
                descripcion: 'Descargar datos de la sesión en archivo JSON',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportSesion,
              },
              {
                id: 'eliminar-sesion',
                label: 'Eliminar Sesión',
                descripcion: 'Borrar permanentemente este registro',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => setShowDeleteConfirm(true),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>

      {/* Cabecera de la sesión */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#111827] border border-amber-900/40 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-[#c9a227]/20 border border-[#c9a227]/40 text-[#c9a227] font-mono text-sm font-bold">
              Sesión #{sesion.numero}
            </span>
            <span className="text-xs text-slate-400">
              en <span className="text-slate-300 font-medium">{campana.nombre}</span>
            </span>
          </div>

          {/* Días y duración */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Fecha: <strong className="text-slate-200">{sesion.fecha_real}</strong></span>
            </div>

            {sesion.duracion_horas !== null && sesion.duracion_horas !== undefined && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Duración: <strong className="text-slate-200">{sesion.duracion_horas}h</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Día de juego:{' '}
                <strong className="text-slate-200">
                  {sesion.dia_juego_fin && sesion.dia_juego_fin !== sesion.dia_juego_inicio
                    ? `${sesion.dia_juego_inicio} - ${sesion.dia_juego_fin}`
                    : sesion.dia_juego_inicio}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-amber-100 tracking-wide mt-2">
          {sesion.titulo}
        </h1>

        {/* Etiquetas de la sesión */}
        {sesion.etiquetas && sesion.etiquetas.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <Tag className="w-3.5 h-3.5 text-[#c9a227]" />
            {sesion.etiquetas.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-950/30 text-amber-300 border border-amber-800/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cuerpo de lectura de las Notas */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
          <BookOpen className="w-4 h-4 text-[#c9a227]" />
          <span>Crónica y Notas de la Sesión</span>
        </div>

        {sesion.notas ? (
          <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {sesion.notas}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm italic">
            Esta sesión no tiene notas registradas todavía. Puedes presionar &quot;Editar sesión&quot; para añadir detalles narrativos.
          </div>
        )}
      </div>

      {/* Sección privada de Notas del DM */}
      <DmNotesSection
        modoApp={modoApp}
        notasDm={sesion.notas_dm}
        onSaveNotasDm={handleSaveDmNotes}
        entityName={`Sesión #${sesion.numero}`}
      />

      {/* Sección de Vinculaciones de la Sesión (Fase 7) */}
      <div id="sesion-vinculaciones-card" className="p-4 sm:p-6 rounded-2xl bg-[#0e1522] border border-amber-900/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#c9a227]" />
            <h3 className="text-sm font-semibold text-amber-200">
              Entidades vinculadas a esta sesión
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
            {totalLinked} {totalLinked === 1 ? 'vinculación' : 'vinculaciones'}
          </span>
        </div>

        {totalLinked === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic space-y-2">
            <p>No se han vinculado NPCs, lugares, misiones, objetos ni monstruos a esta sesión.</p>
            <button
              type="button"
              onClick={() => onEditSesion(sesion)}
              className="inline-flex items-center gap-1.5 text-xs text-[#c9a227] hover:underline"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar sesión para vincular entidades</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* NPCs vinculados */}
            {linkedNpcs.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>👤</span>
                    <span>NPCs ({linkedNpcs.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {linkedNpcs.map((npc) => (
                    <button
                      key={npc.id}
                      type="button"
                      id={`sesion-linked-npc-${npc.id}`}
                      onClick={() => onNavigateToEntity && onNavigateToEntity('npc', npc.id)}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#182338] text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors text-left"
                      title="Ver ficha del NPC"
                    >
                      <span>👤</span>
                      <span className="font-medium">{npc.nombre}</span>
                      {npc.rol && <span className="text-[10px] text-slate-400">({npc.rol})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lugares vinculados */}
            {linkedLugares.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Lugares ({linkedLugares.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {linkedLugares.map((lugar) => (
                    <button
                      key={lugar.id}
                      type="button"
                      id={`sesion-linked-lugar-${lugar.id}`}
                      onClick={() => onNavigateToEntity && onNavigateToEntity('lugar', lugar.id)}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#182338] text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors text-left"
                      title="Ver ficha del lugar"
                    >
                      <span>📍</span>
                      <span className="font-medium">{lugar.nombre}</span>
                      <span className="text-[10px] text-slate-400">({lugar.tipo})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Misiones vinculadas */}
            {linkedMisiones.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>📜</span>
                    <span>Misiones ({linkedMisiones.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {linkedMisiones.map((mision) => (
                    <button
                      key={mision.id}
                      type="button"
                      id={`sesion-linked-mision-${mision.id}`}
                      onClick={() => onNavigateToEntity && onNavigateToEntity('mision', mision.id)}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#182338] text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors text-left"
                      title="Ver ficha de la misión"
                    >
                      <span>📜</span>
                      <span className="font-medium">{mision.titulo}</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">[{mision.estado}]</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Objetos vinculados */}
            {linkedObjetos.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>Objetos ({linkedObjetos.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {linkedObjetos.map((objeto) => (
                    <button
                      key={objeto.id}
                      type="button"
                      id={`sesion-linked-objeto-${objeto.id}`}
                      onClick={() => onNavigateToEntity && onNavigateToEntity('objeto', objeto.id)}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#182338] text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors text-left"
                      title="Ver ficha del objeto"
                    >
                      <span>🎁</span>
                      <span className="font-medium">{objeto.nombre}</span>
                      {objeto.quien_lo_lleva && (
                        <span className="text-[10px] text-slate-400">({objeto.quien_lo_lleva})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monstruos vinculados */}
            {linkedMonstruos.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>👹</span>
                    <span>Bestiario ({linkedMonstruos.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {linkedMonstruos.map((monstruo) => (
                    <button
                      key={monstruo.id}
                      type="button"
                      id={`sesion-linked-monstruo-${monstruo.id}`}
                      onClick={() => onNavigateToEntity && onNavigateToEntity('monstruo', monstruo.id)}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#182338] text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors text-left"
                      title="Ver ficha en el Bestiario"
                    >
                      <span>👹</span>
                      <span className="font-medium">{monstruo.nombre}</span>
                      <span className="text-[10px] text-slate-400">({monstruo.tipo})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paginación entre sesiones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-800">
        {prevSession ? (
          <button
            type="button"
            onClick={() => onSelectSesion(prevSession)}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-amber-200 transition-colors min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Sesión #{prevSession.numero}: <span className="italic">{prevSession.titulo}</span>
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextSession ? (
          <button
            type="button"
            onClick={() => onSelectSesion(nextSession)}
            className="inline-flex items-center justify-center sm:justify-end gap-2 px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-amber-200 transition-colors min-h-[44px]"
          >
            <span className="truncate">
              Sesión #{nextSession.numero}: <span className="italic">{nextSession.titulo}</span>
            </span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Modal de confirmación para eliminar sesión */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`¿Eliminar Sesión #${sesion.numero}?`}
        message={`¿Estás seguro de que deseas eliminar permanentemente la sesión "${sesion.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Sesión"
        isDestructive={true}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteSesion(sesion.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
