import React from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Scroll,
  Package,
  Skull,
  Shield,
  Award,
  Heart,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Campana,
  Sesion,
  NPC,
  Lugar,
  Mision,
  Objeto,
  Monstruo,
  PJ,
} from '../types';
import { ACTITUD_CONFIG } from './NpcModal';
import { ESTADO_PJ_CONFIG } from './PjModal';

interface ResumenViewProps {
  campana: Campana;
  sesiones: Sesion[];
  pjs: PJ[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  onNavigateTab: (tab: any) => void;
}

export const ResumenView: React.FC<ResumenViewProps> = ({
  campana,
  sesiones,
  pjs,
  npcs,
  lugares,
  misiones,
  objetos,
  monstruos,
  onNavigateTab,
}) => {
  // Estadísticas del Grupo
  const pjsActivos = pjs.filter((p) => p.estado === 'activo').length;
  const nivelMedio =
    pjs.length > 0
      ? (pjs.reduce((acc, p) => acc + (p.nivel || 1), 0) / pjs.length).toFixed(1)
      : '0';
  const totalPgGrupo = pjs.reduce((acc, p) => acc + (p.pg_max || 0), 0);

  // Estadísticas de Misiones
  const misionesCompletadas = misiones.filter((m) => m.estado === 'completada').length;
  const misionesActivas = misiones.filter((m) => m.estado === 'activa').length;
  const misionesFallidas = misiones.filter((m) => m.estado === 'fallada').length;
  const pctMisionesCompletadas =
    misiones.length > 0
      ? Math.round((misionesCompletadas / misiones.length) * 100)
      : 0;

  // Estadísticas de Lugares
  const lugaresVisitados = lugares.filter((l) => l.estado === 'visitado').length;
  const lugaresConocidos = lugares.filter((l) => l.estado === 'conocido').length;
  const pctLugaresVisitados =
    lugares.length > 0
      ? Math.round((lugaresVisitados / lugares.length) * 100)
      : 0;

  // Estadísticas de NPCs por actitud
  const desgloseNpcs = React.useMemo(() => {
    const counts: Record<string, number> = {
      aliado: 0,
      amistoso: 0,
      neutral: 0,
      receloso: 0,
      hostil: 0,
      desconocido: 0,
    };
    npcs.forEach((n) => {
      const act = n.actitud || 'neutral';
      counts[act] = (counts[act] || 0) + 1;
    });
    return counts;
  }, [npcs]);

  // Estadísticas de Objetos
  const objetosIdentificados = objetos.filter((o) => o.nombre_conocido).length;
  const objetosEquipados = objetos.filter(
    (o) => o.quien_lo_lleva && o.quien_lo_lleva !== '__sin_asignar__'
  ).length;

  // Estadísticas del Bestiario
  const totalEncuentrosMonstruos = monstruos.reduce(
    (acc, m) => acc + (m.veces_encontrado || 1),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado del Resumen */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#182235] via-[#111827] to-[#0d121d] border border-amber-900/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c9a227] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Bitácora de Crónica & Estadísticas</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-amber-100">
              {campana.nombre}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {campana.descripcion || 'Sin descripción general de la campaña.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Sistema</div>
              <div className="text-sm font-semibold text-amber-200">{campana.sistema}</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Inicio</div>
              <div className="text-sm font-semibold text-slate-200">{campana.fecha_inicio}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sesiones */}
        <div
          onClick={() => onNavigateTab('sesiones')}
          className="p-5 rounded-2xl bg-[#111827]/90 border border-amber-900/30 hover:border-[#c9a227]/60 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-amber-950/60 text-[#c9a227]">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs text-amber-400 group-hover:underline">Ver &rarr;</span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-amber-100">
            {sesiones.length}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-0.5">Sesiones Jugadas</div>
        </div>

        {/* Grupo / PJs */}
        <div
          onClick={() => onNavigateTab('grupo')}
          className="p-5 rounded-2xl bg-[#111827]/90 border border-amber-900/30 hover:border-[#c9a227]/60 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs text-emerald-400 group-hover:underline">Ver &rarr;</span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-amber-100">
            {pjs.length}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-0.5">
            PJs ({pjsActivos} activos • Nvl {nivelMedio})
          </div>
        </div>

        {/* Misiones */}
        <div
          onClick={() => onNavigateTab('misiones')}
          className="p-5 rounded-2xl bg-[#111827]/90 border border-amber-900/30 hover:border-[#c9a227]/60 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-sky-950/60 text-sky-400">
              <Scroll className="w-5 h-5" />
            </div>
            <span className="text-xs text-sky-400 group-hover:underline">Ver &rarr;</span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-amber-100">
            {misiones.length}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-0.5">
            Misiones ({misionesCompletadas} completadas)
          </div>
        </div>

        {/* NPCs */}
        <div
          onClick={() => onNavigateTab('npcs')}
          className="p-5 rounded-2xl bg-[#111827]/90 border border-amber-900/30 hover:border-[#c9a227]/60 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs text-purple-400 group-hover:underline">Ver &rarr;</span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-amber-100">
            {npcs.length}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-0.5">NPCs Conocidos</div>
        </div>
      </div>

      {/* Detalle y Barras de Progreso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Estado de las Misiones */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-amber-100 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-[#c9a227]" />
              <span>Progreso de Misiones</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-300">
              {pctMisionesCompletadas}% completado
            </span>
          </div>

          {/* Barra de progreso visual */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pctMisionesCompletadas}%` }}
              title={`Completadas: ${pctMisionesCompletadas}%`}
            />
            <div
              className="h-full bg-amber-500 transition-all"
              style={{
                width: `${misiones.length ? (misionesActivas / misiones.length) * 100 : 0}%`,
              }}
              title="Activas"
            />
            <div
              className="h-full bg-rose-500 transition-all"
              style={{
                width: `${misiones.length ? (misionesFallidas / misiones.length) * 100 : 0}%`,
              }}
              title="Fallidas"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-emerald-400 font-medium">Completadas</div>
              <div className="text-lg font-mono font-bold text-slate-100">{misionesCompletadas}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-amber-400 font-medium">Activas</div>
              <div className="text-lg font-mono font-bold text-slate-100">{misionesActivas}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-rose-400 font-medium">Fallidas</div>
              <div className="text-lg font-mono font-bold text-slate-100">{misionesFallidas}</div>
            </div>
          </div>
        </div>

        {/* Panel 2: Exploración del Mundo / Lugares */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-amber-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c9a227]" />
              <span>Exploración del Mundo</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-300">
              {pctLugaresVisitados}% visitados
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${pctLugaresVisitados}%` }}
              title={`Visitados: ${pctLugaresVisitados}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-cyan-400 font-medium">Lugares Visitados</div>
              <div className="text-lg font-mono font-bold text-slate-100">{lugaresVisitados}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Total Descubiertos</div>
              <div className="text-lg font-mono font-bold text-slate-100">{lugares.length}</div>
            </div>
          </div>
        </div>

        {/* Panel 3: NPCs por Actitud */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-4">
          <h3 className="font-serif text-base font-bold text-amber-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#c9a227]" />
            <span>Relaciones con NPCs</span>
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(desgloseNpcs).map(([actitud, count]) => {
              const cfg = ACTITUD_CONFIG[actitud as keyof typeof ACTITUD_CONFIG];
              if (!cfg) return null;
              return (
                <div
                  key={actitud}
                  className={`p-2.5 rounded-xl border ${cfg.bg} ${cfg.border} text-center`}
                >
                  <div className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</div>
                  <div className="text-lg font-mono font-bold text-slate-100">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 4: Inventario & Bestiario */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-amber-900/30 space-y-4">
          <h3 className="font-serif text-base font-bold text-amber-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#c9a227]" />
            <span>Inventario & Bestiario</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Objetos y Tesoros</span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-100">{objetos.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {objetosIdentificados} identificados • {objetosEquipados} en uso
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-rose-400 font-semibold mb-1 flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5" />
                <span>Monstruos y Criaturas</span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-100">{monstruos.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {totalEncuentrosMonstruos} encuentros registrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
