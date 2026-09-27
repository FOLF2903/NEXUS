import React from 'react';
import { Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { Sesion } from '../types';

interface LinkedSessionsListProps {
  idPrefix: string;
  sesionIds: string[];
  allSesiones: Sesion[];
  title?: string;
  emptyMessage?: string;
  onSelectSesion?: (sesion: Sesion) => void;
}

export const LinkedSessionsList: React.FC<LinkedSessionsListProps> = ({
  idPrefix,
  sesionIds,
  allSesiones,
  title = 'Aparece en las sesiones',
  emptyMessage = 'No se ha registrado su aparición en ninguna sesión aún.',
  onSelectSesion,
}) => {
  const linkedSesiones = allSesiones
    .filter((s) => sesionIds.includes(s.id))
    .sort((a, b) => a.numero - b.numero);

  return (
    <div id={`${idPrefix}-container`} className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-200/90 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#c9a227]" />
          <span>{title}</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
          {linkedSesiones.length}
        </span>
      </div>

      {linkedSesiones.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-1">
          {emptyMessage}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {linkedSesiones.map((sesion) => (
            <button
              key={sesion.id}
              id={`${idPrefix}-item-${sesion.id}`}
              type="button"
              onClick={() => onSelectSesion && onSelectSesion(sesion)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1522] hover:bg-[#182338] border border-slate-800 hover:border-amber-700/60 transition-all text-left group ${
                onSelectSesion ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={`Ir a la Sesión #${sesion.numero}: ${sesion.titulo}`}
            >
              <span className="text-xs font-mono font-bold text-[#c9a227] bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/30">
                #{sesion.numero}
              </span>
              <span className="text-xs font-medium text-slate-200 group-hover:text-amber-200 truncate max-w-[180px]">
                {sesion.titulo}
              </span>
              {sesion.fecha_real && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="w-2.5 h-2.5 text-slate-500" />
                  {sesion.fecha_real}
                </span>
              )}
              {onSelectSesion && (
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors ml-0.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
