import React from 'react';
import {
  MapPin,
  EyeOff,
  Shield,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { NPC, ModoApp } from '../types';
import { ACTITUD_CONFIG } from './NpcModal';

interface NpcCardProps {
  npc: NPC;
  modoApp?: ModoApp;
  canManageCampaign?: boolean;
  onSelect: (npc: NPC) => void;
  onEdit?: (npc: NPC) => void;
  onDelete?: (npc: NPC) => void;
  onTagClick?: (tag: string) => void;
}

export const NpcCard: React.FC<NpcCardProps> = ({
  npc,
  modoApp = 'jugador',
  canManageCampaign = false,
  onSelect,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const actitudConfig = ACTITUD_CONFIG[npc.actitud] || ACTITUD_CONFIG.neutral;
  const displayName = npc.nombre_conocido ? npc.nombre : '?';

  return (
    <div
      id={`npc-card-${npc.id}`}
      onClick={() => onSelect(npc)}
      className="group relative rounded-xl bg-[#111827] border border-slate-800/80 hover:border-amber-500/50 p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between active:scale-[0.99]"
    >
      <div className="space-y-2.5">
        {/* Cabecera de la tarjeta: Nombre, Rol, Badges y Acciones Rápidas */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors truncate flex items-center gap-1.5">
              <span className="truncate">{displayName}</span>
              {!npc.nombre_conocido && (
                <span
                  className="shrink-0 inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
                  title="Nombre secreto no revelado aún a los aventureros"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Oculto</span>
                </span>
              )}
            </h3>
            {npc.rol && (
              <span className="text-xs text-[#c9a227] font-medium block truncate mt-0.5">
                {npc.rol}
              </span>
            )}
          </div>

          {/* Badges de Actitud, DM y Acciones rápidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            {modoApp === 'dm' && npc.notas_dm && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                title="Contiene notas privadas del DM"
              >
                <Shield className="w-3 h-3 text-[#c9a227]" />
                <span>DM</span>
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${actitudConfig.bg} ${actitudConfig.text} ${actitudConfig.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${actitudConfig.dot}`} />
              <span>{actitudConfig.label}</span>
            </span>

            {/* Acciones rápidas para DM */}
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
                      onEdit(npc);
                    }}
                    title="Editar ficha del NPC"
                    aria-label="Editar ficha del NPC"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(npc);
                    }}
                    title="Eliminar NPC"
                    aria-label="Eliminar NPC"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación habitual si existe */}
        {npc.ubicacion_habitual && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
            <span className="truncate">{npc.ubicacion_habitual}</span>
          </div>
        )}

        {/* Descripción breve o Información conocida */}
        {npc.descripcion ? (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {npc.descripcion}
          </p>
        ) : npc.informacion_conocida ? (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
            &quot;{npc.informacion_conocida}&quot;
          </p>
        ) : null}

        {/* Etiquetas temáticas como chips interactivos */}
        {npc.etiquetas && npc.etiquetas.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {npc.etiquetas.slice(0, 3).map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(t);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300/80 border border-slate-800 hover:border-amber-700/60 hover:text-amber-200 transition-colors"
                title={`Filtrar por #${t}`}
              >
                #{t}
              </button>
            ))}
            {npc.etiquetas.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{npc.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pie de la tarjeta: Fecha y ver ficha */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">
          {new Date(npc.creado_en).toLocaleDateString()}
        </span>
        <span className="inline-flex items-center gap-1 text-slate-300 group-hover:text-[#c9a227] font-medium transition-colors">
          <span>Ver ficha</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
