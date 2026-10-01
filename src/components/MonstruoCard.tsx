import React from 'react';
import {
  Footprints,
  Users,
  Skull,
  Flame,
  Mountain,
  Bug,
  Eye,
  Droplet,
  Leaf,
  HelpCircle,
  MapPin,
  Tag,
  ChevronRight,
  EyeOff,
  Swords,
  ShieldAlert,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Monstruo, TipoMonstruo, ModoApp } from '../types';

export interface TipoMonstruoConfig {
  label: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TIPO_MONSTRUO_CONFIG: Record<TipoMonstruo, TipoMonstruoConfig> = {
  bestia: {
    label: 'Bestia',
    colorBg: 'bg-amber-950/40',
    colorText: 'text-amber-400',
    colorBorder: 'border-amber-800/40',
    icon: Footprints,
  },
  humanoide: {
    label: 'Humanoide',
    colorBg: 'bg-emerald-950/40',
    colorText: 'text-emerald-400',
    colorBorder: 'border-emerald-800/40',
    icon: Users,
  },
  no_muerto: {
    label: 'No Muerto',
    colorBg: 'bg-purple-950/40',
    colorText: 'text-purple-400',
    colorBorder: 'border-purple-800/40',
    icon: Skull,
  },
  dragon: {
    label: 'Dragón',
    colorBg: 'bg-red-950/40',
    colorText: 'text-red-400',
    colorBorder: 'border-red-800/40',
    icon: Flame,
  },
  gigante: {
    label: 'Gigante',
    colorBg: 'bg-orange-950/40',
    colorText: 'text-orange-400',
    colorBorder: 'border-orange-800/40',
    icon: Mountain,
  },
  monstruosidad: {
    label: 'Monstruosidad',
    colorBg: 'bg-rose-950/40',
    colorText: 'text-rose-400',
    colorBorder: 'border-rose-800/40',
    icon: Bug,
  },
  aberracion: {
    label: 'Aberración',
    colorBg: 'bg-cyan-950/40',
    colorText: 'text-cyan-400',
    colorBorder: 'border-cyan-800/40',
    icon: Eye,
  },
  cieno: {
    label: 'Cieno',
    colorBg: 'bg-lime-950/40',
    colorText: 'text-lime-400',
    colorBorder: 'border-lime-800/40',
    icon: Droplet,
  },
  planta: {
    label: 'Planta',
    colorBg: 'bg-green-950/40',
    colorText: 'text-green-400',
    colorBorder: 'border-green-800/40',
    icon: Leaf,
  },
  otro: {
    label: 'Otro',
    colorBg: 'bg-slate-900/60',
    colorText: 'text-slate-300',
    colorBorder: 'border-slate-700/60',
    icon: HelpCircle,
  },
};

interface MonstruoCardProps {
  monstruo: Monstruo;
  modoApp?: ModoApp;
  canManageCampaign?: boolean;
  onSelect: (monstruo: Monstruo) => void;
  onEdit?: (monstruo: Monstruo) => void;
  onDelete?: (monstruo: Monstruo) => void;
  onTagClick?: (tag: string) => void;
}

export const MonstruoCard: React.FC<MonstruoCardProps> = ({
  monstruo,
  modoApp = 'jugador',
  canManageCampaign = false,
  onSelect,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const config = TIPO_MONSTRUO_CONFIG[monstruo.tipo] || TIPO_MONSTRUO_CONFIG.otro;
  const TypeIcon = config.icon;

  const displayName = monstruo.nombre_conocido
    ? monstruo.nombre
    : (monstruo.nombre && monstruo.nombre !== '?' ? `? (${monstruo.nombre})` : '?');

  return (
    <div
      id={`monstruo-card-${monstruo.id}`}
      onClick={() => onSelect(monstruo)}
      className="group relative rounded-xl bg-[#111827] border border-amber-900/30 hover:border-amber-500/50 p-4 sm:p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
    >
      <div className="space-y-2.5">
        {/* Cabecera: Tipo, Contador de encuentros y acciones rápidas */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-semibold border ${config.colorBg} ${config.colorText} ${config.colorBorder}`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </span>

            {modoApp === 'dm' && monstruo.notas_dm && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                title="Contiene notas privadas del DM"
              >
                <ShieldAlert className="w-3 h-3 text-[#c9a227]" />
                <span>DM</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              title={`Encontrado ${monstruo.veces_encontrado} ${monstruo.veces_encontrado === 1 ? 'vez' : 'veces'}`}
              className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full font-medium"
            >
              <Swords className="w-3 h-3 text-[#c9a227]" />
              <span>
                {monstruo.veces_encontrado} {monstruo.veces_encontrado === 1 ? 'encuentro' : 'encuentros'}
              </span>
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
                    onClick={() => onEdit(monstruo)}
                    title="Editar criatura"
                    aria-label="Editar criatura"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(monstruo)}
                    title="Eliminar criatura"
                    aria-label="Eliminar criatura"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nombre y estado de anonimato */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-amber-100 group-hover:text-amber-300 transition-colors line-clamp-1">
              {displayName}
            </h3>
            {!monstruo.nombre_conocido && (
              <span
                title="El grupo aún no conoce el nombre exacto de esta criatura"
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700"
              >
                <EyeOff className="w-3 h-3 text-amber-400" />
                <span>Nombre desconocido</span>
              </span>
            )}
          </div>

          {/* Dónde lo vimos */}
          {monstruo.donde_lo_vimos && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
              <span>{monstruo.donde_lo_vimos}</span>
            </p>
          )}
        </div>

        {/* Descripción visual */}
        {monstruo.descripcion_visual && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {monstruo.descripcion_visual}
          </p>
        )}

        {/* Comportamiento o Debilidades destacadas */}
        {monstruo.debilidades ? (
          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs">
            <span className="font-semibold text-amber-400/90 block mb-0.5 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> Debilidades observadas:
            </span>
            <p className="text-slate-300 line-clamp-2">{monstruo.debilidades}</p>
          </div>
        ) : monstruo.comportamiento ? (
          <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
            <span className="font-semibold text-slate-400 block mb-0.5">
              Comportamiento:
            </span>
            <p className="text-slate-300 line-clamp-2">{monstruo.comportamiento}</p>
          </div>
        ) : null}
      </div>

      {/* Pie de tarjeta: Etiquetas temáticas y flecha */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 max-h-12 overflow-hidden">
          {monstruo.etiquetas && monstruo.etiquetas.length > 0 ? (
            monstruo.etiquetas.slice(0, 3).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(tag);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/90 text-amber-300/80 border border-slate-700/60 transition-colors ${
                  onTagClick ? 'hover:border-[#c9a227] hover:text-[#c9a227]' : ''
                }`}
              >
                <Tag className="w-2.5 h-2.5 text-amber-400/60" />
                <span>#{tag}</span>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 italic">Sin etiquetas</span>
          )}
          {monstruo.etiquetas && monstruo.etiquetas.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{monstruo.etiquetas.length - 3}
            </span>
          )}
        </div>

        <span className="shrink-0 p-1.5 rounded-lg text-slate-400 group-hover:text-amber-300 group-hover:bg-amber-950/30 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
