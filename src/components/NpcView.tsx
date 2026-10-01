import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  Tag,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle,
  HelpCircle,
  FileText,
  Eye,
  EyeOff,
  Shield,
  Scroll,
  Download,
} from 'lucide-react';
import { NPC, Campana, Sesion, Mision, ModoApp } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { AccionesMenu } from './AccionesMenu';
import { ACTITUD_CONFIG } from './NpcModal';
import { LinkedSessionsList } from './LinkedSessionsList';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface NpcViewProps {
  npc: NPC;
  campana: Campana;
  allSesiones?: Sesion[];
  allMisiones?: Mision[];
  modoApp?: ModoApp;
  onBack: () => void;
  onEdit: (npc: NPC) => void;
  onDelete: (npcId: string) => void;
  onUpdateNpc?: (updatedNpc: NPC) => void;
  onSelectSesion?: (sesion: Sesion) => void;
  onSelectMision?: (mision: Mision) => void;
  backLabel?: string;
}

export const NpcView: React.FC<NpcViewProps> = ({
  npc,
  campana,
  allSesiones = [],
  allMisiones = [],
  modoApp = 'jugador',
  onBack,
  onEdit,
  onDelete,
  onUpdateNpc,
  onSelectSesion,
  onSelectMision,
  backLabel,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [revealRealName, setRevealRealName] = useState(false);

  const actitudInfo = ACTITUD_CONFIG[npc.actitud] || ACTITUD_CONFIG.neutral;
  const isNameKnown = npc.nombre_conocido !== false;

  // Misiones otorgadas por este NPC
  const misionesOtorgadas = allMisiones.filter((m) => m.origen_npc_id === npc.id);

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdateNpc) {
      onUpdateNpc({
        ...npc,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportNpc = () => {
    exportSingleEntity('npc', npc, {
      sesion_ids: npc.sesion_ids || [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de navegación superior fija (Sticky) con acceso rápido permanente */}
      <div className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 border-b border-amber-900/30 transition-all flex items-center justify-between gap-2">
        <button
          id="back-to-npcs-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#c9a227] transition-colors py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{backLabel || `Volver a ${campana.nombre} (NPCs)`}</span>
          <span className="sm:hidden">Volver</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="edit-npc-btn"
            type="button"
            onClick={() => onEdit(npc)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-colors min-h-[44px]"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Editar</span>
          </button>

          <AccionesMenu
            buttonId="npc-more-actions-btn"
            title="Opciones del NPC"
            items={[
              {
                id: 'exportar-npc',
                label: 'Exportar NPC',
                descripcion: 'Descargar datos del personaje en archivo JSON',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportNpc,
              },
              {
                id: 'eliminar-npc',
                label: 'Eliminar NPC',
                descripcion: 'Borrar permanentemente este PNJ',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => setShowDeleteConfirm(true),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>

      {/* Cabecera principal del NPC */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Badge Actitud */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${actitudInfo.bg} ${actitudInfo.text} ${actitudInfo.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${actitudInfo.dot}`} />
                <span>{actitudInfo.label}</span>
              </span>

              {/* Rol */}
              {npc.rol && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 text-amber-300 text-xs font-medium border border-slate-700">
                  <Shield className="w-3 h-3 text-[#c9a227]" />
                  <span>{npc.rol}</span>
                </span>
              )}

              {/* Indicador si el nombre es secreto */}
              {!isNameKnown && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] bg-amber-950/40 text-amber-300/90 border border-amber-900/50">
                  <EyeOff className="w-3 h-3 text-[#c9a227]" />
                  <span>Nombre oculto para el grupo</span>
                </span>
              )}
            </div>

            {/* Nombre del NPC */}
            <div className="pt-1">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-amber-100 flex items-center gap-3">
                {isNameKnown ? (
                  <span>{npc.nombre}</span>
                ) : (
                  <span className="font-mono text-amber-300 text-4xl">?</span>
                )}
              </h1>

              {/* Si el nombre no es conocido por el grupo, permitir al DM revelarlo */}
              {!isNameKnown && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setRevealRealName(!revealRealName)}
                    className="inline-flex items-center gap-1.5 text-amber-400/90 hover:text-amber-200 underline underline-offset-2 transition-colors"
                  >
                    {revealRealName ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{revealRealName ? 'Ocultar nombre real' : 'Ver nombre real (DM/Notas)'}</span>
                  </button>

                  {revealRealName && (
                    <span className="font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      &quot;{npc.nombre}&quot;
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fecha y metadatos */}
          <div className="flex md:flex-col items-end gap-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Registrado el {new Date(npc.creado_en).toLocaleDateString()}</span>
            </span>
            <span className="text-[11px] text-slate-500">Campaña: {campana.nombre}</span>
          </div>
        </div>

        {/* Ubicación habitual */}
        {npc.ubicacion_habitual && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-[#c9a227] shrink-0" />
            <span className="text-slate-400">Ubicación habitual:</span>
            <span className="font-medium text-amber-100">{npc.ubicacion_habitual}</span>
          </div>
        )}
      </div>

      {/* Secciones de contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Descripción Física */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <h2 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
            <User className="w-4 h-4 text-[#c9a227]" />
            <span>Descripción Física y Apariencia</span>
          </h2>
          {npc.descripcion ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {npc.descripcion}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No se ha registrado aún una descripción física de este personaje.
            </p>
          )}
        </div>

        {/* Notas Adicionales */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <h2 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c9a227]" />
            <span>Notas de Campaña</span>
          </h2>
          {npc.notas ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {npc.notas}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Sin notas adicionales registradas.
            </p>
          )}
        </div>

        {/* Información Conocida */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <h2 className="font-serif text-base font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Información Conocida (Hechos certeros)</span>
          </h2>
          {npc.informacion_conocida ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {npc.informacion_conocida}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              El grupo aún no tiene datos contrastados o confirmados sobre este NPC.
            </p>
          )}
        </div>

        {/* Información Sospechada */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
          <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Información Sospechada (Rumores y sospechas)</span>
          </h2>
          {npc.informacion_sospechada ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {npc.informacion_sospechada}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No hay sospechas o rumores registrados en este momento.
            </p>
          )}
        </div>
      </div>

      {/* Sección privada de Notas del DM */}
      <DmNotesSection
        modoApp={modoApp}
        notasDm={npc.notas_dm}
        onSaveNotasDm={handleSaveDmNotes}
        entityName={npc.nombre}
      />

      {/* Misiones encomendadas por este personaje (Navegación contextual) */}
      {misionesOtorgadas.length > 0 && (
        <div className="p-6 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-[#c9a227]" />
            <h3 className="font-serif text-sm font-bold text-slate-200">
              Misiones encomendadas ({misionesOtorgadas.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {misionesOtorgadas.map((mision) => (
              <button
                key={mision.id}
                type="button"
                id={`npc-mision-${mision.id}`}
                onClick={() => onSelectMision && onSelectMision(mision)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors text-xs font-medium"
                title={`Ver misión: ${mision.titulo}`}
              >
                <span>📜</span>
                <span>{mision.titulo}</span>
                <span className="text-[10px] text-amber-400 font-mono">[{mision.estado}]</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sesiones en las que ha aparecido (Fase 7) */}
      <div className="p-6 rounded-xl bg-[#111827] border border-slate-800">
        <LinkedSessionsList
          idPrefix="npc-sesiones"
          sesionIds={npc.sesion_ids || []}
          allSesiones={allSesiones}
          title="Sesiones en las que ha aparecido"
          emptyMessage="Este personaje no ha aparecido en ninguna sesión registrada todavía."
          onSelectSesion={onSelectSesion}
        />
      </div>

      {/* Etiquetas Temáticas */}
      {npc.etiquetas && npc.etiquetas.length > 0 && (
        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
            <Tag className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Etiquetas:</span>
          </span>
          {npc.etiquetas.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-amber-300/90 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="¿Eliminar ficha de NPC?"
        message={`¿Estás seguro de que deseas eliminar la ficha de "${npc.nombre}"? Esta acción borrará todas sus notas y sospechas y no se puede deshacer.`}
        confirmText="Eliminar NPC"
        isDangerous={true}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(npc.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
