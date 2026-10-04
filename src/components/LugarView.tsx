import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Eye,
  EyeOff,
  Navigation,
  Sparkles,
  History,
  FileText,
  Layers,
  Plus,
  ChevronRight,
  Compass,
  Download,
} from 'lucide-react';
import { Lugar, Campana, Sesion, ModoApp } from '../types';
import { ESTADO_LUGAR_CONFIG, TIPO_LUGAR_CONFIG } from './LugarModal';
import { AccionesMenu } from './AccionesMenu';
import { LugarCard } from './LugarCard';
import { LinkedSessionsList } from './LinkedSessionsList';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface LugarViewProps {
  lugar: Lugar;
  campana: Campana;
  allLugares: Lugar[];
  allSesiones?: Sesion[];
  modoApp?: ModoApp;
  onBack: () => void;
  onSelectLugar: (lugar: Lugar) => void;
  onEdit: (lugar: Lugar) => void;
  onDelete: (lugar: Lugar) => void;
  onUpdateLugar?: (updatedLugar: Lugar) => void;
  onAddSubLugar: (parentLugar: Lugar) => void;
  onSelectSesion?: (sesion: Sesion) => void;
  backLabel?: string;
}

export const LugarView: React.FC<LugarViewProps> = ({
  lugar,
  campana,
  allLugares,
  allSesiones = [],
  modoApp = 'jugador',
  onBack,
  onSelectLugar,
  onEdit,
  onDelete,
  onUpdateLugar,
  onAddSubLugar,
  onSelectSesion,
  backLabel,
}) => {
  const [showRealName, setShowRealName] = useState(false);

  const estadoCfg = ESTADO_LUGAR_CONFIG[lugar.estado] || ESTADO_LUGAR_CONFIG.visitado;
  const tipoCfg = TIPO_LUGAR_CONFIG[lugar.tipo] || TIPO_LUGAR_CONFIG.otro;

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdateLugar) {
      onUpdateLugar({
        ...lugar,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportLugar = () => {
    exportSingleEntity('lugar', lugar, {
      sesion_ids: lugar.sesion_ids || [],
      padre_id: lugar.padre_id || null,
      hijos: lugar.hijos || [],
    });
  };

  // Construir la ruta de migas de pan (Breadcrumb)
  const breadcrumbs = useMemo(() => {
    const trail: Lugar[] = [];
    let currentId: string | null = lugar.padre_id;

    // Máximo 10 niveles para evitar bucles infinitos en datos corruptos
    let depth = 0;
    while (currentId && depth < 10) {
      const parent = allLugares.find((l) => l.id === currentId);
      if (parent) {
        trail.unshift(parent);
        currentId = parent.padre_id;
      } else {
        break;
      }
      depth++;
    }
    return trail;
  }, [lugar.padre_id, allLugares]);

  // Sub-lugares directos de este lugar
  const subLugares = useMemo(() => {
    return allLugares
      .filter((l) => l.padre_id === lugar.id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [allLugares, lugar.id]);

  const displayName = lugar.nombre_conocido
    ? lugar.nombre
    : showRealName
    ? `${lugar.nombre} (Oculto al grupo)`
    : '?';

  return (
    <div id="lugar-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Barra superior de navegación y acciones fija (Sticky) */}
      <div className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 border-b border-amber-900/30 transition-all flex items-center justify-between gap-2">
        {/* Breadcrumbs de navegación */}
        <div className="flex items-center flex-wrap gap-1 text-xs text-slate-400 min-w-0 flex-1 mr-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-700 font-semibold shrink-0 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{backLabel || `Lugares de ${campana.nombre}`}</span>
            <span className="sm:hidden">Lugares</span>
          </button>

          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:inline" />
              <button
                type="button"
                onClick={() => onSelectLugar(crumb)}
                className="hidden sm:inline-flex hover:text-amber-300 transition-colors py-1 px-2 rounded-md hover:bg-slate-800/60 max-w-[120px] truncate"
                title={crumb.nombre}
              >
                {crumb.nombre_conocido ? crumb.nombre : '?'}
              </button>
            </React.Fragment>
          ))}

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:inline" />
          <span className="hidden sm:inline text-[#c9a227] font-semibold py-1 px-2 bg-amber-950/30 rounded-md border border-amber-900/40 max-w-[160px] truncate">
            {displayName}
          </span>
        </div>

        {/* Botones de acción compactos */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="edit-lugar-btn"
            type="button"
            onClick={() => onEdit(lugar)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 text-xs font-semibold transition-colors min-h-[44px]"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar</span>
          </button>

          <AccionesMenu
            buttonId="lugar-more-actions-btn"
            title="Opciones del lugar"
            items={[
              {
                id: 'exportar-lugar',
                label: 'Exportar Lugar',
                descripcion: 'Descargar datos del lugar en archivo JSON',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportLugar,
              },
              {
                id: 'eliminar-lugar',
                label: 'Eliminar Lugar',
                descripcion: 'Borrar permanentemente esta locación',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => onDelete(lugar),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>

      {/* Tarjeta Principal de la Ficha */}
      <div className="rounded-2xl bg-[#111827] border border-amber-900/40 p-4 sm:p-6 md:p-8 shadow-xl space-y-6">
        {/* Cabecera: Nombre, Tipo y Estado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label={tipoCfg.label}>
                {tipoCfg.iconLabel}
              </span>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-3 flex-wrap">
                  <span>{displayName}</span>
                  {!lugar.nombre_conocido && (
                    <span className="inline-flex items-center gap-1 text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nombre oculto a los jugadores</span>
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  Tipo: <span className="text-slate-200 font-semibold">{tipoCfg.label}</span>
                  {lugar.padre_id && (
                    <>
                      {' · '}
                      <span>Sub-lugar anidado</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Toggle para que el DM pueda revelar el nombre real */}
            {!lugar.nombre_conocido && (
              <div className="pt-2 pl-11">
                <button
                  type="button"
                  onClick={() => setShowRealName(!showRealName)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#c9a227] hover:underline"
                >
                  {showRealName ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>
                    {showRealName ? 'Ocultar nombre real del DM' : 'Ver nombre real del DM'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Badge de Estado con color distintivo */}
          <div className="sm:self-start">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${estadoCfg.dot}`} />
              <span>{estadoCfg.label}</span>
            </span>
          </div>
        </div>

        {/* Sección: Descripción física y ambiente */}
        {lugar.descripcion && (
          <div className="space-y-2">
            <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c9a227] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#c9a227]" />
              <span>Descripción y Ambiente</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {lugar.descripcion}
            </div>
          </div>
        )}

        {/* Sección: Cómo llegar */}
        {lugar.como_llegar && (
          <div className="space-y-2">
            <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-sky-400" />
              <span>Cómo Llegar / Rutas</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#0b0f17] border border-sky-950/40 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {lugar.como_llegar}
            </div>
          </div>
        )}

        {/* Rejilla: Qué hay allí y Qué pasó */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Qué hay */}
          <div className="space-y-2">
            <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>¿Qué hay allí?</span>
            </h2>
            <div className="h-full min-h-[90px] p-4 rounded-xl bg-[#0b0f17] border border-emerald-950/40 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {lugar.que_hay ? (
                lugar.que_hay
              ) : (
                <span className="text-slate-500 italic text-xs">
                  Sin información registrada sobre edificios o recursos.
                </span>
              )}
            </div>
          </div>

          {/* Qué pasó */}
          <div className="space-y-2">
            <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" />
              <span>¿Qué pasó aquí?</span>
            </h2>
            <div className="h-full min-h-[90px] p-4 rounded-xl bg-[#0b0f17] border border-amber-950/40 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {lugar.que_paso ? (
                lugar.que_paso
              ) : (
                <span className="text-slate-500 italic text-xs">
                  Aún no se han registrado eventos o combates en este lugar.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Notas de Campaña */}
        {lugar.notas && (
          <div className="space-y-2">
            <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c9a227] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#c9a227]" />
              <span>Notas y Rumores</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {lugar.notas}
            </div>
          </div>
        )}

        {/* Sección privada de Notas del DM */}
        <DmNotesSection
          modoApp={modoApp}
          notasDm={lugar.notas_dm}
          onSaveNotasDm={handleSaveDmNotes}
          entityName={lugar.nombre}
        />

        {/* Etiquetas como chips */}
        {lugar.etiquetas && lugar.etiquetas.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">Etiquetas:</span>
              {lugar.etiquetas.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#0b0f17] text-[#c9a227] border border-amber-900/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sesiones en las que ha sido visitado (Fase 7) */}
      <div className="rounded-2xl bg-[#111827] border border-amber-900/40 p-6 md:p-8 shadow-xl">
        <LinkedSessionsList
          idPrefix="lugar-sesiones"
          sesionIds={lugar.sesion_ids || []}
          allSesiones={allSesiones}
          title="Visitado en las sesiones"
          emptyMessage="Este lugar no ha sido visitado en ninguna sesión registrada todavía."
          onSelectSesion={onSelectSesion}
        />
      </div>

      {/* Sección de Sub-lugares (Jerarquía) */}
      <div className="rounded-2xl bg-[#111827] border border-amber-900/40 p-6 md:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-900/50 text-[#c9a227]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <span>Sub-lugares en {displayName}</span>
                <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                  {subLugares.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Estancias, tiendas, templos o salas ubicadas dentro de este lugar.
              </p>
            </div>
          </div>

          <button
            id="add-sublugar-btn"
            type="button"
            onClick={() => onAddSubLugar(lugar)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black text-xs font-bold transition-all shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir sub-lugar</span>
          </button>
        </div>

        {subLugares.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-[#0b0f17] border border-dashed border-slate-800 space-y-3">
            <MapPin className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs text-slate-400">
              No hay sub-lugares anidados dentro de este lugar.
            </p>
            <button
              type="button"
              onClick={() => onAddSubLugar(lugar)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir el primer sub-lugar</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subLugares.map((child) => {
              const childSubCount = allLugares.filter((l) => l.padre_id === child.id).length;
              return (
                <LugarCard
                  key={child.id}
                  lugar={child}
                  subLugaresCount={childSubCount}
                  modoApp={modoApp}
                  canManageCampaign={true}
                  onSelect={onSelectLugar}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
