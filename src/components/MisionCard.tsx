import React from 'react';
import {
  Scroll,
  CheckCircle2,
  Circle,
  User,
  MapPin,
  Coins,
  ArrowRight,
  Clock,
  Sparkles,
  Shield,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Mision, NPC, Lugar, EstadoMision, ModoApp } from '../types';

export const ESTADO_MISION_CONFIG: Record<
  EstadoMision,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    progressBar: string;
  }
> = {
  activa: {
    label: 'Activa',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
    dot: 'bg-amber-400',
    progressBar: 'bg-amber-500',
  },
  completada: {
    label: 'Completada',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-700/50',
    dot: 'bg-emerald-400',
    progressBar: 'bg-emerald-500',
  },
  fallada: {
    label: 'Fallada',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-700/50',
    dot: 'bg-rose-400',
    progressBar: 'bg-rose-500',
  },
  abandonada: {
    label: 'Abandonada',
    bg: 'bg-slate-900/70',
    text: 'text-slate-400',
    border: 'border-slate-800',
    dot: 'bg-slate-500',
    progressBar: 'bg-slate-600',
  },
  pausada: {
    label: 'Pausada',
    bg: 'bg-orange-950/40',
    text: 'text-orange-300',
    border: 'border-orange-700/50',
    dot: 'bg-orange-400',
    progressBar: 'bg-orange-500',
  },
};

interface MisionCardProps {
  mision: Mision;
  npcs?: NPC[];
  lugares?: Lugar[];
  modoApp?: ModoApp;
  canManageCampaign?: boolean;
  onSelect: (mision: Mision) => void;
  onEdit?: (mision: Mision) => void;
  onDelete?: (mision: Mision) => void;
  onTagClick?: (tag: string) => void;
}

export const MisionCard: React.FC<MisionCardProps> = ({
  mision,
  npcs = [],
  lugares = [],
  modoApp = 'jugador',
  canManageCampaign = false,
  onSelect,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const estadoCfg = ESTADO_MISION_CONFIG[mision.estado] || ESTADO_MISION_CONFIG.activa;

  const totalPasos = mision.pasos ? mision.pasos.length : 0;
  const pasosCompletados = mision.pasos
    ? mision.pasos.filter((p) => p.completado).length
    : 0;
  const porcentaje =
    totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;

  const origenNpc = mision.origen_npc_id
    ? npcs.find((n) => n.id === mision.origen_npc_id)
    : null;

  const origenLugar = mision.origen_lugar_id
    ? lugares.find((l) => l.id === mision.origen_lugar_id)
    : null;

  return (
    <div
      id={`mision-card-${mision.id}`}
      onClick={() => onSelect(mision)}
      className="group relative rounded-xl bg-[#111827] border border-amber-900/30 hover:border-amber-500/50 p-4 sm:p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
    >
      <div>
        {/* Cabecera: Título, Estado y Acciones Rápidas */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-950/40 text-[#c9a227] border border-amber-900/40 shrink-0 mt-0.5">
              <Scroll className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {mision.titulo}
              </h3>

              {/* Origen NPC o Lugar */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400">
                {origenNpc && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px]"
                    title={`Otorgada por: ${origenNpc.nombre}`}
                  >
                    <User className="w-3 h-3 text-amber-400" />
                    <span className="truncate max-w-[120px]">{origenNpc.nombre}</span>
                  </span>
                )}
                {origenLugar && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px]"
                    title={`Ubicación: ${origenLugar.nombre}`}
                  >
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span className="truncate max-w-[120px]">{origenLugar.nombre}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badge Estado, DM y Acciones rápidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            {modoApp === 'dm' && mision.notas_dm && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                title="Contiene notas privadas del DM"
              >
                <Shield className="w-3 h-3 text-[#c9a227]" />
                <span>DM</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold shrink-0 border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dot}`} />
              <span>{estadoCfg.label}</span>
            </span>

            {/* Acciones rápidas para el DM */}
            {canManageCampaign && (onEdit || onDelete) && (
              <div
                className="flex items-center gap-0.5 ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(mision);
                    }}
                    title="Editar misión"
                    aria-label="Editar misión"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(mision);
                    }}
                    title="Eliminar misión"
                    aria-label="Eliminar misión"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Descripción breve */}
        {mision.descripcion && (
          <p className="text-xs text-slate-300/90 line-clamp-2 mt-2 leading-relaxed">
            {mision.descripcion}
          </p>
        )}

        {/* Barra de progreso */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              {mision.estado === 'completada' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-amber-400" />
              )}
              {totalPasos > 0
                ? `${pasosCompletados} de ${totalPasos} pasos completados`
                : 'Sin pasos registrados'}
            </span>
            {totalPasos > 0 && (
              <span className="font-semibold text-slate-300">{porcentaje}%</span>
            )}
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${estadoCfg.progressBar}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Recompensa preview si existe */}
        {mision.recompensa_conocida && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-300/90 font-medium truncate">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400">Recompensa:</span>
            <span className="truncate">{mision.recompensa_conocida}</span>
          </div>
        )}
      </div>

      {/* Pie de la tarjeta: Etiquetas temáticas y ver detalle */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 items-center min-w-0">
          {mision.etiquetas && mision.etiquetas.length > 0 ? (
            mision.etiquetas.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-950/30 text-amber-300/90 hover:bg-amber-900/50 hover:text-amber-200 transition-colors border border-amber-900/40"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 italic">Sin etiquetas</span>
          )}
          {mision.etiquetas && mision.etiquetas.length > 3 && (
            <span className="text-[11px] text-slate-500">
              +{mision.etiquetas.length - 3}
            </span>
          )}
        </div>

        <span className="text-xs text-[#c9a227] font-semibold flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
          <span>Ver misión</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
