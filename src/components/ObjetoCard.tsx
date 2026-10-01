import React from 'react';
import {
  Sword,
  Shield,
  FlaskConical,
  Scroll,
  CircleDot,
  Wand2,
  Coins,
  Package,
  HelpCircle,
  User,
  MapPin,
  Sparkles,
  Tag,
  ChevronRight,
  EyeOff,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Objeto, TipoObjeto, ModoApp } from '../types';

export interface TipoObjetoConfig {
  label: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TIPO_OBJETO_CONFIG: Record<TipoObjeto, TipoObjetoConfig> = {
  arma: {
    label: 'Arma',
    colorBg: 'bg-red-950/40',
    colorText: 'text-red-400',
    colorBorder: 'border-red-800/40',
    icon: Sword,
  },
  armadura: {
    label: 'Armadura',
    colorBg: 'bg-blue-950/40',
    colorText: 'text-blue-400',
    colorBorder: 'border-blue-800/40',
    icon: Shield,
  },
  pocion: {
    label: 'Poción',
    colorBg: 'bg-emerald-950/40',
    colorText: 'text-emerald-400',
    colorBorder: 'border-emerald-800/40',
    icon: FlaskConical,
  },
  pergamino: {
    label: 'Pergamino',
    colorBg: 'bg-amber-950/40',
    colorText: 'text-amber-300',
    colorBorder: 'border-amber-800/40',
    icon: Scroll,
  },
  anillo: {
    label: 'Anillo',
    colorBg: 'bg-purple-950/40',
    colorText: 'text-purple-400',
    colorBorder: 'border-purple-800/40',
    icon: CircleDot,
  },
  varita: {
    label: 'Varita',
    colorBg: 'bg-cyan-950/40',
    colorText: 'text-cyan-400',
    colorBorder: 'border-cyan-800/40',
    icon: Wand2,
  },
  vara: {
    label: 'Vara',
    colorBg: 'bg-cyan-950/40',
    colorText: 'text-cyan-400',
    colorBorder: 'border-cyan-800/40',
    icon: Wand2,
  },
  tesoro: {
    label: 'Tesoro',
    colorBg: 'bg-yellow-950/40',
    colorText: 'text-yellow-300',
    colorBorder: 'border-yellow-800/40',
    icon: Coins,
  },
  miscelaneo: {
    label: 'Misceláneo',
    colorBg: 'bg-slate-800/60',
    colorText: 'text-slate-300',
    colorBorder: 'border-slate-700/60',
    icon: Package,
  },
  otro: {
    label: 'Otro',
    colorBg: 'bg-slate-800/60',
    colorText: 'text-slate-300',
    colorBorder: 'border-slate-700/60',
    icon: HelpCircle,
  },
};

interface ObjetoCardProps {
  objeto: Objeto;
  modoApp?: ModoApp;
  canManageCampaign?: boolean;
  onSelect: (objeto: Objeto) => void;
  onEdit?: (objeto: Objeto) => void;
  onDelete?: (objeto: Objeto) => void;
  onTagClick?: (tag: string) => void;
}

export const ObjetoCard: React.FC<ObjetoCardProps> = ({
  objeto,
  modoApp = 'jugador',
  canManageCampaign = false,
  onSelect,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const config = TIPO_OBJETO_CONFIG[objeto.tipo] || TIPO_OBJETO_CONFIG.otro;
  const TypeIcon = config.icon;

  const displayName = objeto.nombre_conocido ? objeto.nombre : (objeto.nombre && objeto.nombre !== '?' ? `? (${objeto.nombre})` : '?');

  return (
    <div
      id={`objeto-card-${objeto.id}`}
      onClick={() => onSelect(objeto)}
      className="group relative rounded-xl bg-[#111827] border border-amber-900/30 hover:border-amber-500/50 p-4 sm:p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
    >
      <div className="space-y-2.5">
        {/* Cabecera: Tipo, portador y acciones rápidas */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-semibold border ${config.colorBg} ${config.colorText} ${config.colorBorder}`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </span>

            {modoApp === 'dm' && objeto.notas_dm && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                title="Contiene notas privadas del DM"
              >
                <Shield className="w-3 h-3 text-[#c9a227]" />
                <span>DM</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {objeto.quien_lo_lleva ? (
              <span
                title={`En posesión de: ${objeto.quien_lo_lleva}`}
                className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full"
              >
                <User className="w-3 h-3 text-[#c9a227]" />
                <span className="font-medium truncate max-w-[110px] sm:max-w-[140px]">
                  {objeto.quien_lo_lleva}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/40 px-2.5 py-0.5 rounded-full">
                Sin asignar
              </span>
            )}

            {/* Acciones rápidas para DM */}
            {canManageCampaign && (onEdit || onDelete) && (
              <div
                className="flex items-center gap-0.5 ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(objeto)}
                    title="Editar objeto"
                    aria-label="Editar objeto"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(objeto)}
                    title="Eliminar objeto"
                    aria-label="Eliminar objeto"
                    className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nombre del objeto */}
        <div>
          <div className="flex items-center gap-2">
            {!objeto.nombre_conocido && (
              <span
                title="Nombre desconocido por los personajes"
                className="p-1 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40 shrink-0"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </span>
            )}
            <h4 className="font-serif text-lg font-bold text-amber-100 group-hover:text-amber-200 transition-colors line-clamp-1 leading-snug">
              {displayName}
            </h4>
          </div>

          {/* Dónde se consiguió */}
          {objeto.donde_lo_conseguimos && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <MapPin className="w-3 h-3 text-amber-500/70 shrink-0" />
              <span className="truncate">{objeto.donde_lo_conseguimos}</span>
            </div>
          )}
        </div>

        {/* Descripción física */}
        {objeto.descripcion && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {objeto.descripcion}
          </p>
        )}

        {/* Efectos conocidos o sospechados */}
        {(objeto.efecto_conocido || objeto.efecto_sospechado) && (
          <div className="space-y-1.5 pt-1">
            {objeto.efecto_conocido && (
              <div className="p-2 rounded-lg bg-[#0b0f17]/60 border border-emerald-900/30 text-xs text-emerald-300/90 line-clamp-2 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{objeto.efecto_conocido}</span>
              </div>
            )}
            {objeto.efecto_sospechado && !objeto.efecto_conocido && (
              <div className="p-2 rounded-lg bg-[#0b0f17]/60 border border-purple-900/30 text-xs text-purple-300/90 line-clamp-2 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-snug italic">{objeto.efecto_sospechado}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pie de tarjeta: Etiquetas temáticas y enlace a ficha */}
      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 max-w-[75%] overflow-hidden">
          {objeto.etiquetas && objeto.etiquetas.length > 0 ? (
            objeto.etiquetas.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 hover:border-amber-600/40 transition-colors"
              >
                <Tag className="w-2.5 h-2.5 text-amber-400/80" />
                <span>#{tag}</span>
              </button>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 italic">Sin etiquetas</span>
          )}
          {objeto.etiquetas && objeto.etiquetas.length > 3 && (
            <span className="text-[11px] text-slate-500 self-center">
              +{objeto.etiquetas.length - 3}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#c9a227] group-hover:translate-x-0.5 transition-transform shrink-0">
          <span>Ver ficha</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
