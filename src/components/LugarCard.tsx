import React from 'react';
import {
  MapPin,
  EyeOff,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { Lugar, ModoApp } from '../types';
import { ESTADO_LUGAR_CONFIG, TIPO_LUGAR_CONFIG } from './LugarModal';

interface LugarCardProps {
  lugar: Lugar;
  parentLugar?: Lugar | null;
  subLugaresCount: number;
  modoApp?: ModoApp;
  onSelect: (lugar: Lugar) => void;
  onQuickAddSubLugar?: (parentLugar: Lugar) => void;
}

export const LugarCard: React.FC<LugarCardProps> = ({
  lugar,
  parentLugar,
  subLugaresCount,
  modoApp = 'jugador',
  onSelect,
}) => {
  const estadoCfg = ESTADO_LUGAR_CONFIG[lugar.estado] || ESTADO_LUGAR_CONFIG.visitado;
  const tipoCfg = TIPO_LUGAR_CONFIG[lugar.tipo] || TIPO_LUGAR_CONFIG.otro;

  const displayName = lugar.nombre_conocido ? lugar.nombre : '?';

  return (
    <div
      id={`lugar-card-${lugar.id}`}
      className="group relative rounded-xl bg-[#111827] border border-amber-900/30 hover:border-amber-500/50 p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between cursor-pointer"
      onClick={() => onSelect(lugar)}
    >
      <div>
        {/* Cabecera de la tarjeta: Nombre, Estado y Tipo */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0" role="img" aria-label={tipoCfg.label}>
              {tipoCfg.iconLabel}
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-base md:text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate flex items-center gap-2">
                <span>{displayName}</span>
                {!lugar.nombre_conocido && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
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

          {/* Badge de Estado y DM */}
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
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${estadoCfg.dot}`} />
              <span>{estadoCfg.label}</span>
            </span>
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

        {/* Etiquetas como chips */}
        {lugar.etiquetas && lugar.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {lugar.etiquetas.slice(0, 3).map((etiqueta) => (
              <span
                key={etiqueta}
                className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#0d1424] text-amber-300/80 border border-amber-950/40"
              >
                #{etiqueta}
              </span>
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

        <span className="text-xs text-[#c9a227] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          <span>Ver ficha</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
