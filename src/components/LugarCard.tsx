import React from 'react';
import {
  MapPin,
  EyeOff,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Shield,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Lugar, ModoApp } from '../types';
import { ESTADO_LUGAR_CONFIG, TIPO_LUGAR_CONFIG } from './LugarModal';

interface LugarCardProps {
  lugar: Lugar;
  parentLugar?: Lugar | null;
  subLugaresCount: number;
  modoApp?: ModoApp;
  canManageCampaign?: boolean;
  onSelect: (lugar: Lugar) => void;
  onEdit?: (lugar: Lugar) => void;
  onDelete?: (lugar: Lugar) => void;
  onTagClick?: (tag: string) => void;
  onQuickAddSubLugar?: (parentLugar: Lugar) => void;
}

export const LugarCard: React.FC<LugarCardProps> = ({
  lugar,
  parentLugar,
  subLugaresCount,
  modoApp = 'jugador',
  canManageCampaign = false,
  onSelect,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const estadoCfg = ESTADO_LUGAR_CONFIG[lugar.estado] || ESTADO_LUGAR_CONFIG.visitado;
  const tipoCfg = TIPO_LUGAR_CONFIG[lugar.tipo] || TIPO_LUGAR_CONFIG.otro;

  const displayName = lugar.nombre_conocido ? lugar.nombre : '?';

  return (
    <div
      id={`lugar-card-${lugar.id}`}
      className="group relative rounded-xl bg-[#111827] border border-amber-900/30 hover:border-amber-500/50 p-4 sm:p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
      onClick={() => onSelect(lugar)}
    >
      <div>
        {/* Cabecera de la tarjeta: Nombre, Estado y Tipo */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl shrink-0" role="img" aria-label={tipoCfg.label}>
              {tipoCfg.iconLabel}
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate flex items-center gap-2">
                <span className="truncate">{displayName}</span>
                {!lugar.nombre_conocido && (
                  <span
                    className="shrink-0 inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
                    title="Nombre secreto no revelado aún a los aventureros"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Secreto</span>
                  </span>
                )}
              </h3>
              <span className="text-xs text-slate-400 font-medium block truncate">
                {tipoCfg.label}
              </span>
            </div>
          </div>

          {/* Badge de Estado, DM y Acciones Rápidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            {modoApp === 'dm' && lugar.notas_dm && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                title="Contiene notas privadas del DM"
              >
                <Shield className="w-3 h-3 text-[#c9a227]" />
                <span>DM</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
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
                      onEdit(lugar);
                    }}
                    title="Editar lugar"
                    aria-label="Editar lugar"
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
                      onDelete(lugar);
                    }}
                    title="Eliminar lugar"
                    aria-label="Eliminar lugar"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lugar Padre (si es un sub-lugar listado) */}
        {parentLugar && (
          <div className="mb-2.5 flex items-center gap-1.5 text-xs text-[#c9a227] bg-[#0c121e] px-2.5 py-1 rounded-md border border-amber-950/40">
            <Layers className="w-3 h-3 shrink-0" />
            <span className="truncate">Dentro de: {parentLugar.nombre}</span>
          </div>
        )}

        {/* Descripción o Qué hay */}
        {lugar.descripcion && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {lugar.descripcion}
          </p>
        )}

        {/* Qué pasó breve (si no hay descripción) */}
        {!lugar.descripcion && lugar.que_paso && (
          <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed mb-3">
            &quot;{lugar.que_paso}&quot;
          </p>
        )}

        {/* Etiquetas como chips interactivos */}
        {lugar.etiquetas && lugar.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {lugar.etiquetas.slice(0, 3).map((etiqueta) => (
              <button
                key={etiqueta}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(etiqueta);
                }}
                className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0d1424] text-amber-300/80 border border-amber-950/40 hover:border-amber-700/60 hover:text-amber-200 transition-colors"
                title={`Filtrar por #${etiqueta}`}
              >
                #{etiqueta}
              </button>
            ))}
            {lugar.etiquetas.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{lugar.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pie de tarjeta: Sub-lugares y flecha de exploración */}
      <div className="pt-3 mt-1 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#c9a227]" />
          <span className="text-slate-300 font-medium">
            {subLugaresCount === 0
              ? 'Sin sub-lugares'
              : `${subLugaresCount} ${subLugaresCount === 1 ? 'sub-lugar' : 'sub-lugares'}`}
          </span>
        </div>

        <span className="text-xs text-[#c9a227] flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity font-medium">
          <span>Ver ficha</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
