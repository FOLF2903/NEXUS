import React from 'react';
import { Calendar, Scroll, ChevronRight, Edit3, Trash2, Users, Compass, CheckCircle2, Package, Shield, Crown } from 'lucide-react';
import { Campana, EstadoCampana } from '../types';
import { SupabaseRole } from '../types/supabase';

interface CampanaCardProps {
  campana: Campana;
  sesionesCount: number;
  npcsCount?: number;
  lugaresCount?: number;
  misionesCount?: number;
  objetosCount?: number;
  ultimaSesionFecha?: string | null;
  role?: SupabaseRole;
  canEdit?: boolean;
  onSelect: (campana: Campana) => void;
  onEdit: (campana: Campana) => void;
  onDelete: (campana: Campana) => void;
}

const estadoBadges: Record<
  EstadoCampana,
  { label: string; bg: string; text: string; border: string }
> = {
  activa: {
    label: 'Activa',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/50',
  },
  pausada: {
    label: 'Pausada',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/50',
  },
  completada: {
    label: 'Completada',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-300',
    border: 'border-indigo-800/50',
  },
  abandonada: {
    label: 'Abandonada',
    bg: 'bg-slate-900/60',
    text: 'text-slate-400',
    border: 'border-slate-800',
  },
};

export const CampanaCard: React.FC<CampanaCardProps> = ({
  campana,
  sesionesCount,
  npcsCount,
  lugaresCount,
  misionesCount,
  objetosCount,
  ultimaSesionFecha,
  role,
  canEdit = true,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const badge = estadoBadges[campana.estado] || estadoBadges.activa;

  return (
    <div
      id={`campana-card-${campana.id}`}
      className="group relative rounded-xl bg-[#111827] border border-amber-900/30 hover:border-amber-500/50 p-5 md:p-6 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between cursor-pointer"
      onClick={() => onSelect(campana)}
    >
      <div>
        {/* Cabecera de la tarjeta: Sistema, Rol y Estado */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90 bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-900/40">
              {campana.sistema}
            </span>
            {role && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  role === 'host'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : role === 'dm'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                }`}
              >
                {role === 'host' ? (
                  <>
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Host</span>
                  </>
                ) : role === 'dm' ? (
                  <>
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>DM</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 text-sky-400" />
                    <span>Jugador</span>
                  </>
                )}
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Título de la campaña en Serif */}
        <h3 className="font-serif text-xl font-bold text-amber-100 group-hover:text-amber-200 transition-colors line-clamp-2 mb-2 leading-snug">
          {campana.nombre}
        </h3>

        {/* Descripción breve si existe */}
        {campana.descripcion && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {campana.descripcion}
          </p>
        )}
      </div>

      {/* Métricas y fechas de la campaña */}
      <div className="pt-4 border-t border-slate-800/80 mt-2 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Scroll className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>
                <strong className="text-amber-200 font-semibold">{sesionesCount}</strong>{' '}
                {sesionesCount === 1 ? 'sesión' : 'sesiones'}
              </span>
            </div>

            {npcsCount !== undefined && npcsCount > 0 && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>
                  <strong className="text-amber-200 font-semibold">{npcsCount}</strong>{' '}
                  {npcsCount === 1 ? 'NPC' : 'NPCs'}
                </span>
              </div>
            )}

            {lugaresCount !== undefined && lugaresCount > 0 && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>
                  <strong className="text-amber-200 font-semibold">{lugaresCount}</strong>{' '}
                  {lugaresCount === 1 ? 'lugar' : 'lugares'}
                </span>
              </div>
            )}

            {misionesCount !== undefined && misionesCount > 0 && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>
                  <strong className="text-amber-200 font-semibold">{misionesCount}</strong>{' '}
                  {misionesCount === 1 ? 'misión' : 'misiones'}
                </span>
              </div>
            )}

            {objetosCount !== undefined && objetosCount > 0 && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Package className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>
                  <strong className="text-amber-200 font-semibold">{objetosCount}</strong>{' '}
                  {objetosCount === 1 ? 'objeto' : 'objetos'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate" title={ultimaSesionFecha ? `Última sesión: ${ultimaSesionFecha}` : `Inicio: ${campana.fecha_inicio}`}>
              {ultimaSesionFecha ? `Última: ${ultimaSesionFecha}` : `Inicio: ${campana.fecha_inicio}`}
            </span>
          </div>
        </div>

        {/* Fila de acciones y ver detalles */}
        <div className="flex items-center justify-between pt-2">
          {canEdit ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                id={`edit-campana-btn-${campana.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(campana);
                }}
                title="Editar campaña"
                aria-label="Editar campaña"
                className="p-2 sm:p-2.5 rounded-lg hover:text-amber-300 hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                id={`delete-campana-btn-${campana.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(campana);
                }}
                title="Eliminar campaña"
                aria-label="Eliminar campaña"
                className="p-2 sm:p-2.5 rounded-lg hover:text-rose-400 hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              Modo participante
            </div>
          )}

          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#c9a227] group-hover:translate-x-0.5 transition-transform">
            <span>Abrir libreta</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
