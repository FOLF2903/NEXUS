import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Skull,
  MapPin,
  Tag,
  Calendar,
  EyeOff,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Swords,
  BookOpen,
  Plus,
  Download,
} from 'lucide-react';
import { Monstruo, Campana, Sesion, ModoApp } from '../types';
import { TIPO_MONSTRUO_CONFIG } from './MonstruoCard';
import { ConfirmModal } from './ConfirmModal';
import { AccionesMenu } from './AccionesMenu';
import { LinkedSessionsList } from './LinkedSessionsList';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface MonstruoViewProps {
  monstruo: Monstruo;
  campana: Campana;
  allSesiones?: Sesion[];
  modoApp?: ModoApp;
  onBack: () => void;
  onEdit: (monstruo: Monstruo) => void;
  onDelete: (monstruo: Monstruo) => void;
  onUpdateMonstruo?: (updatedMonstruo: Monstruo) => void;
  onIncrementVeces?: (monstruo: Monstruo) => void;
  onSelectSesion?: (sesion: Sesion) => void;
  backLabel?: string;
}

export const MonstruoView: React.FC<MonstruoViewProps> = ({
  monstruo,
  campana,
  allSesiones = [],
  modoApp = 'jugador',
  onBack,
  onEdit,
  onDelete,
  onUpdateMonstruo,
  onIncrementVeces,
  onSelectSesion,
  backLabel,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const config = TIPO_MONSTRUO_CONFIG[monstruo.tipo] || TIPO_MONSTRUO_CONFIG.otro;
  const TypeIcon = config.icon;

  const displayName = monstruo.nombre_conocido
    ? monstruo.nombre
    : monstruo.nombre && monstruo.nombre !== '?'
    ? `? (${monstruo.nombre})`
    : '?';

  const formattedDate = monstruo.creado_en
    ? new Date(monstruo.creado_en).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdateMonstruo) {
      onUpdateMonstruo({
        ...monstruo,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportMonstruo = () => {
    exportSingleEntity('monstruo', monstruo, {
      sesion_ids: monstruo.sesion_ids || [],
    });
  };

  return (
    <div id={`monstruo-view-${monstruo.id}`} className="space-y-6 animate-in fade-in duration-150">
      {/* Barra de navegación superior fija (Sticky) con acceso permanente */}
      <div className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 border-b border-amber-900/30 transition-all flex items-center justify-between gap-2">
        <button
          id="monstruo-view-back-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 transition-colors py-2 px-3 rounded-lg bg-[#111827] border border-slate-800 min-h-[44px] font-semibold"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{backLabel || `Volver a ${campana.nombre}`}</span>
          <span className="sm:hidden">Volver</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="monstruo-view-edit-btn"
            type="button"
            onClick={() => onEdit(monstruo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-200 text-xs font-semibold border border-slate-700 hover:border-amber-600/40 transition-colors shadow-xs min-h-[44px]"
          >
            <Edit className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Editar</span>
          </button>

          <AccionesMenu
            buttonId="monstruo-more-actions-btn"
            title="Opciones del monstruo"
            items={[
              {
                id: 'exportar-monstruo',
                label: 'Exportar Monstruo',
                descripcion: 'Descargar datos del monstruo en archivo JSON',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportMonstruo,
              },
              {
                id: 'eliminar-monstruo',
                label: 'Eliminar Monstruo',
                descripcion: 'Borrar permanentemente este monstruo',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => setIsDeleteModalOpen(true),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>

      {/* Cabecera Principal de la Ficha */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#111827] border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Badge Tipo */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${config.colorBg} ${config.colorText} ${config.colorBorder}`}
          >
            <TypeIcon className="w-4 h-4" />
            <span>{config.label}</span>
          </span>

          {/* Badge Veces Encontrado */}
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full font-medium">
            <Swords className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>
              Encontrado {monstruo.veces_encontrado} {monstruo.veces_encontrado === 1 ? 'vez' : 'veces'}
            </span>
          </span>

          {/* Badge Conocimiento del nombre */}
          {!monstruo.nombre_conocido ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/30 text-amber-300 border border-amber-800/40">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Nombre real no descubierto</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/30 text-emerald-300 border border-emerald-800/40">
              <Eye className="w-3.5 h-3.5" />
              <span>Especie identificada</span>
            </span>
          )}
        </div>

        {/* Nombre y Título */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
            {displayName}
          </h1>
          {monstruo.donde_lo_vimos && (
            <p className="mt-2 flex items-center gap-2 text-sm text-amber-300/80">
              <MapPin className="w-4 h-4 text-[#c9a227] shrink-0" />
              <span>Visto en: {monstruo.donde_lo_vimos}</span>
            </p>
          )}
        </div>

        {/* Descripción visual */}
        {monstruo.descripcion_visual ? (
          <div className="pt-2 text-sm sm:text-base text-slate-200 leading-relaxed bg-[#0b0f17]/50 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Descripción Visual y Morfología
            </span>
            <p className="whitespace-pre-line">{monstruo.descripcion_visual}</p>
          </div>
        ) : (
          <p className="italic text-slate-500 text-sm">Sin descripción visual anotada.</p>
        )}
      </div>

      {/* Grid de Secciones de Combate y Tácticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Comportamiento en Combate */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <span>Comportamiento en Combate</span>
          </h3>
          {monstruo.comportamiento ? (
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {monstruo.comportamiento}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Sin tácticas o patrones de ataque documentados.
            </p>
          )}
        </div>

        {/* Veces Encontrado & Registro */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
              <Skull className="w-5 h-5 text-[#c9a227]" />
              <span>Historial de Encuentros</span>
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              El grupo ha combatido o avistado esta criatura en{' '}
              <strong className="text-amber-200">{monstruo.veces_encontrado}</strong> ocasión(es).
            </p>
          </div>

          {onIncrementVeces && (
            <button
              type="button"
              onClick={() => onIncrementVeces(monstruo)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs border border-amber-900/40 transition-colors self-start"
            >
              <Plus className="w-4 h-4 text-[#c9a227]" />
              <span>Registrar otro avistamiento (+1)</span>
            </button>
          )}
        </div>

        {/* Debilidades Descubiertas */}
        <div className="p-6 rounded-2xl bg-amber-950/15 border border-amber-900/40 space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Debilidades Observadas</span>
          </h3>
          {monstruo.debilidades ? (
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {monstruo.debilidades}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Aún no se han descubierto debilidades ni vulnerabilidades particulares.
            </p>
          )}
        </div>

        {/* Resistencias e Inmunidades */}
        <div className="p-6 rounded-2xl bg-blue-950/15 border border-blue-900/40 space-y-3">
          <h3 className="font-serif text-lg font-bold text-blue-300 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>Resistencias Sospechadas</span>
          </h3>
          {monstruo.resistencias ? (
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {monstruo.resistencias}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No se han registrado resistencias evidentes a daño o condiciones.
            </p>
          )}
        </div>
      </div>

      {/* Notas de Campo y Rumores */}
      {monstruo.notas && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-3">
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c9a227]" />
            <span>Notas de Campo y Rumores</span>
          </h3>
          <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
            {monstruo.notas}
          </p>
        </div>
      )}

      {/* Sección privada de Notas del DM */}
      <DmNotesSection
        modoApp={modoApp}
        notasDm={monstruo.notas_dm}
        onSaveNotasDm={handleSaveDmNotes}
        entityName={monstruo.nombre}
      />

      {/* Sesiones en las que ha aparecido (Fase 7) */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-lg">
        <LinkedSessionsList
          idPrefix="monstruo-sesiones"
          sesionIds={monstruo.sesion_ids || []}
          allSesiones={allSesiones}
          title="Sesiones en las que se ha avistado o combatido"
          emptyMessage="Este monstruo no ha sido avistado en ninguna sesión registrada todavía."
          onSelectSesion={onSelectSesion}
        />
      </div>

      {/* Etiquetas y Metadatos */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-4">
        <h3 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#c9a227]" />
          <span>Etiquetas Temáticas del Cuaderno</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {monstruo.etiquetas && monstruo.etiquetas.length > 0 ? (
            monstruo.etiquetas.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-amber-300 border border-slate-700/80"
              >
                <Tag className="w-3 h-3 text-amber-400/80" />
                <span>#{tag}</span>
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">Esta ficha no tiene etiquetas temáticas.</p>
          )}
        </div>

        {formattedDate && (
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Registrado en el bestiario el {formattedDate}</span>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Borrado */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`¿Eliminar ficha de "${displayName}"?`}
        message="Esta acción borrará permanentemente los datos, debilidades y notas registradas para este monstruo de tu bitácora local."
        confirmText="Eliminar del Bestiario"
        isDangerous={true}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete(monstruo);
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
