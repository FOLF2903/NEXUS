import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Sparkles,
  HelpCircle,
  MapPin,
  User,
  Tag,
  Calendar,
  EyeOff,
  Eye,
  Shield,
  Clock,
  Download,
} from 'lucide-react';
import { Objeto, Campana, Sesion, ModoApp } from '../types';
import { TIPO_OBJETO_CONFIG } from './ObjetoCard';
import { ConfirmModal } from './ConfirmModal';
import { AccionesMenu } from './AccionesMenu';
import { LinkedSessionsList } from './LinkedSessionsList';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface ObjetoViewProps {
  objeto: Objeto;
  campana: Campana;
  allSesiones?: Sesion[];
  modoApp?: ModoApp;
  onBack: () => void;
  onEdit: (objeto: Objeto) => void;
  onDelete: (objeto: Objeto) => void;
  onUpdateObjeto?: (updatedObjeto: Objeto) => void;
  onSelectSesion?: (sesion: Sesion) => void;
  backLabel?: string;
}

export const ObjetoView: React.FC<ObjetoViewProps> = ({
  objeto,
  campana,
  allSesiones = [],
  modoApp = 'jugador',
  onBack,
  onEdit,
  onDelete,
  onUpdateObjeto,
  onSelectSesion,
  backLabel,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const config = TIPO_OBJETO_CONFIG[objeto.tipo] || TIPO_OBJETO_CONFIG.otro;
  const TypeIcon = config.icon;

  const displayName = objeto.nombre_conocido
    ? objeto.nombre
    : objeto.nombre && objeto.nombre !== '?'
    ? `? (${objeto.nombre})`
    : '?';

  const formattedDate = objeto.creado_en
    ? new Date(objeto.creado_en).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdateObjeto) {
      onUpdateObjeto({
        ...objeto,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportObjeto = () => {
    exportSingleEntity('objeto', objeto, {
      sesion_ids: objeto.sesion_ids || [],
      sesion_obtencion_id: objeto.sesion_obtencion_id || null,
    });
  };

  return (
    <div id={`objeto-view-${objeto.id}`} className="space-y-6 animate-in fade-in duration-150">
      {/* Barra de navegación superior fija (Sticky) con acceso rápido permanente */}
      <div className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 border-b border-amber-900/30 transition-all flex items-center justify-between gap-2">
        <button
          id="objeto-view-back-btn"
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
            id="objeto-view-edit-btn"
            type="button"
            onClick={() => onEdit(objeto)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-200 text-xs font-semibold border border-slate-700 hover:border-amber-600/40 transition-colors shadow-xs min-h-[44px]"
          >
            <Edit className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Editar</span>
          </button>

          <AccionesMenu
            buttonId="objeto-more-actions-btn"
            title="Opciones del objeto"
            items={[
              {
                id: 'exportar-objeto',
                label: 'Exportar Objeto',
                descripcion: 'Descargar datos del objeto en archivo JSON',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportObjeto,
              },
              {
                id: 'eliminar-objeto',
                label: 'Eliminar Objeto',
                descripcion: 'Borrar permanentemente este objeto',
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

          {/* Badge Portador */}
          {objeto.quien_lo_lleva ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-amber-950/40 text-amber-200 border border-amber-800/40">
              <User className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>En poder de: <strong>{objeto.quien_lo_lleva}</strong></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800/60 text-slate-400 border border-slate-700/50">
              <span>Sin asignar (En el grupo)</span>
            </span>
          )}

          {/* Badge Estado Conocido / Desconocido */}
          {!objeto.nombre_conocido && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/50">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Nombre no identificado por el grupo</span>
            </span>
          )}
        </div>

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-100 tracking-tight leading-tight">
            {displayName}
          </h1>

          {objeto.donde_lo_conseguimos && (
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
              <MapPin className="w-4 h-4 text-[#c9a227] shrink-0" />
              <span>Conseguido en: <strong className="text-slate-300">{objeto.donde_lo_conseguimos}</strong></span>
            </div>
          )}
        </div>

        {/* Etiquetas como chips */}
        {objeto.etiquetas && objeto.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {objeto.etiquetas.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-amber-200/90 border border-amber-900/30"
              >
                <Tag className="w-3 h-3 text-[#c9a227]" />
                <span>#{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cuadrícula de Contenido: Efectos y Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Efecto Conocido */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-emerald-900/40 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <h3>Efecto Conocido</h3>
          </div>
          {objeto.efecto_conocido ? (
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-[#0b0f17]/50 p-4 rounded-xl border border-emerald-900/30">
              {objeto.efecto_conocido}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-[#0b0f17]/30">
              No se han descubierto o verificado efectos mágicos con certeza todavía.
            </p>
          )}
        </div>

        {/* Panel 2: Efecto Sospechado / Teorías */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-purple-900/40 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <h3>Efecto Sospechado / Rumores</h3>
          </div>
          {objeto.efecto_sospechado ? (
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-[#0b0f17]/50 p-4 rounded-xl border border-purple-900/30 italic">
              {objeto.efecto_sospechado}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-[#0b0f17]/30">
              Sin sospechas, rumores o advertencias anotadas por el momento.
            </p>
          )}
        </div>
      </div>

      {/* Paneles Inferiores: Descripción Física y Notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Descripción física */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-200/90 font-semibold text-sm uppercase tracking-wider">
            <Package className="w-4 h-4 text-[#c9a227]" />
            <h3>Descripción Física</h3>
          </div>
          {objeto.descripcion ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {objeto.descripcion}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Sin descripción visual registrada.
            </p>
          )}
        </div>

        {/* Notas y trasfondo */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-200/90 font-semibold text-sm uppercase tracking-wider">
            <Shield className="w-4 h-4 text-[#c9a227]" />
            <h3>Notas & Trasfondo</h3>
          </div>
          {objeto.notas ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {objeto.notas}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Sin notas adicionales sobre historia, orígenes o secretos.
            </p>
          )}

          {formattedDate && (
            <div className="pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Registrado el {formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sección privada de Notas del DM */}
      <DmNotesSection
        modoApp={modoApp}
        notasDm={objeto.notas_dm}
        onSaveNotasDm={handleSaveDmNotes}
        entityName={objeto.nombre}
      />

      {/* Sesiones en las que ha aparecido (Fase 7) */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 shadow-lg">
        <LinkedSessionsList
          idPrefix="objeto-sesiones"
          sesionIds={objeto.sesion_ids || []}
          allSesiones={allSesiones}
          title="Sesiones en las que ha aparecido o se ha usado"
          emptyMessage="Este objeto no está vinculado a ninguna sesión registrada todavía."
          onSelectSesion={onSelectSesion}
        />
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Objeto"
        message={`¿Estás seguro de que deseas eliminar la ficha de "${displayName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Objeto"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete(objeto);
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
