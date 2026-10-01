import React from 'react';
import {
  User,
  Heart,
  Shield,
  Award,
  Package,
  Edit2,
  Trash2,
  Sparkles,
  ScrollText,
} from 'lucide-react';
import { PJ, Objeto, ModoApp } from '../types';
import { ESTADO_PJ_CONFIG } from './PjModal';

interface PjCardProps {
  pj: PJ;
  objetos?: Objeto[];
  modoApp?: ModoApp;
  canManageCampaign?: boolean;
  onSelect: (pj: PJ) => void;
  onEdit: (pj: PJ) => void;
  onDelete: (pj: PJ) => void;
}

export const PjCard: React.FC<PjCardProps> = ({
  pj,
  objetos = [],
  modoApp = 'jugador',
  canManageCampaign = true,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const estadoCfg = ESTADO_PJ_CONFIG[pj.estado] || ESTADO_PJ_CONFIG.activo;

  // Filtrar objetos que lleva este PJ (por nombre exacto o nombre en quien_lo_lleva)
  const objetosQueLleva = objetos.filter(
    (obj) =>
      obj.quien_lo_lleva &&
      obj.quien_lo_lleva.toLowerCase().trim() === pj.nombre.toLowerCase().trim()
  );

  return (
    <div
      id={`pj-card-${pj.id}`}
      onClick={() => onSelect(pj)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#111827]/90 border border-amber-900/30 hover:border-[#c9a227]/70 hover:shadow-xl hover:shadow-amber-950/20 transition-all cursor-pointer overflow-hidden backdrop-blur-xs active:scale-[0.99]"
    >
      {/* Barra superior con estado y acciones */}
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dot}`} />
              {estadoCfg.label}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-950/40 text-amber-300 border border-amber-800/40">
              <Award className="w-3 h-3 text-[#c9a227]" />
              Nivel {pj.nivel}
            </span>

            {modoApp === 'dm' && pj.notas_dm && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                title="Contiene notas privadas del DM"
              >
                <Shield className="w-3 h-3 text-[#c9a227]" />
                <span>DM</span>
              </span>
            )}
          </div>

          {canManageCampaign && (
            <div
              className="flex items-center gap-0.5 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEdit(pj)}
                title="Editar ficha"
                aria-label="Editar ficha"
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(pj)}
                title="Eliminar personaje"
                aria-label="Eliminar personaje"
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Nombre, Raza y Clase */}
        <div className="mb-4">
          <h3 className="font-serif text-lg font-bold text-amber-100 group-hover:text-[#e5bf3c] transition-colors leading-snug">
            {pj.nombre}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="text-slate-300 font-medium">{pj.raza}</span>
            <span className="mx-1 text-slate-600">•</span>
            <span className="text-amber-300/90 font-medium">{pj.clase}</span>
          </p>
        </div>

        {/* Combate: PG Máx y CA */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="p-1 rounded-lg bg-rose-950/60 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">PG Máx</div>
              <div className="text-sm font-mono font-bold text-rose-300">{pj.pg_max}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="p-1 rounded-lg bg-sky-950/60 text-sky-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Clase Armadura</div>
              <div className="text-sm font-mono font-bold text-sky-300">{pj.ca} CA</div>
            </div>
          </div>
        </div>

        {/* Descripción / Personalidad extracto */}
        {(pj.descripcion || pj.personalidad || pj.trasfondo) && (
          <p className="text-xs text-slate-300/90 line-clamp-2 mb-3 leading-relaxed">
            {pj.descripcion || pj.personalidad || pj.trasfondo}
          </p>
        )}
      </div>

      {/* Pie de tarjeta: Objetos que lleva y Etiquetas */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
        {/* Objetos equipados */}
        {objetosQueLleva.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-300/90">
            <Package className="w-3.5 h-3.5 text-[#c9a227]" />
            <span className="font-medium">
              {objetosQueLleva.length} {objetosQueLleva.length === 1 ? 'objeto equipado' : 'objetos equipados'}:
            </span>
            <span className="text-slate-400 truncate text-[11px]">
              {objetosQueLleva.map((o) => o.nombre).join(', ')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Package className="w-3 h-3" />
            <span>Sin objetos asignados en el inventario</span>
          </div>
        )}

        {/* Etiquetas */}
        {pj.etiquetas && pj.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pj.etiquetas.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
            {pj.etiquetas.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{pj.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
