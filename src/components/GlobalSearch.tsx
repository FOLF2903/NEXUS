import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Calendar,
  User,
  Users,
  Compass,
  Scroll,
  Package,
  Skull,
  ChevronRight,
  Sparkles,
  Shield,
  Command,
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

export type SearchEntityType =
  | 'campana'
  | 'sesion'
  | 'pj'
  | 'npc'
  | 'lugar'
  | 'mision'
  | 'objeto'
  | 'monstruo';

export interface SearchResultItem {
  id: string;
  campanaId: string;
  campanaNombre: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  snippet?: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  data: any;
}

interface GlobalSearchProps {
  campanas: Campana[];
  sesiones: Sesion[];
  pjs: PJ[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  activeCampanaId?: string;
  onNavigateToEntity: (type: SearchEntityType, item: any, campanaId: string) => void;
}

const TYPE_CONFIG: Record<
  SearchEntityType,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  campana: {
    label: 'Campaña',
    icon: Sparkles,
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-800/50',
  },
  sesion: {
    label: 'Sesión',
    icon: Calendar,
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-800/50',
  },
  pj: {
    label: 'Personaje (PJ)',
    icon: Shield,
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-800/50',
  },
  npc: {
    label: 'NPC',
    icon: Users,
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-800/50',
  },
  lugar: {
    label: 'Lugar',
    icon: Compass,
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-300',
    border: 'border-cyan-800/50',
  },
  mision: {
    label: 'Misión',
    icon: Scroll,
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-800/50',
  },
  objeto: {
    label: 'Objeto',
    icon: Package,
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-800/50',
  },
  monstruo: {
    label: 'Monstruo',
    icon: Skull,
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-800/50',
  },
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  campanas,
  sesiones,
  pjs,
  npcs,
  lugares,
  misiones,
  objetos,
  monstruos,
  onNavigateToEntity,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mapear nombres de campañas por ID
  const campanasMap = useMemo(() => {
    const map = new Map<string, string>();
    campanas.forEach((c) => map.set(c.id, c.nombre));
    return map;
  }, [campanas]);

  // Atajo de teclado: Ctrl+K / Cmd+K y Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Función para extraer fragmento que coincida
  const findSnippet = (text: string | undefined, search: string): string | undefined => {
    if (!text || !search) return undefined;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return undefined;
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + search.length + 50);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';
    return `${prefix}${text.slice(start, end).trim()}${suffix}`;
  };

  // Buscar en todas las entidades
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || term.length < 2) return [];

    const matches: SearchResultItem[] = [];

    // 0. Campañas
    campanas.forEach((c) => {
      const matchName = c.nombre.toLowerCase().includes(term);
      const matchDesc = c.descripcion?.toLowerCase().includes(term);
      const matchSistema = c.sistema?.toLowerCase().includes(term);

      if (matchName || matchDesc || matchSistema) {
        matches.push({
          id: c.id,
          campanaId: c.id,
          campanaNombre: c.nombre,
          type: 'campana',
          title: c.nombre,
          subtitle: `${c.sistema} • Estado: ${c.estado}`,
          snippet: findSnippet(c.descripcion, term),
          badge: TYPE_CONFIG.campana.label,
          badgeBg: TYPE_CONFIG.campana.bg,
          badgeText: TYPE_CONFIG.campana.text,
          badgeBorder: TYPE_CONFIG.campana.border,
          data: c,
        });
      }
    });

    // 1. PJs
    pjs.forEach((pj) => {
      const matchName = pj.nombre.toLowerCase().includes(term);
      const matchClase = pj.clase?.toLowerCase().includes(term);
      const matchRaza = pj.raza?.toLowerCase().includes(term);
      const matchDesc = pj.descripcion?.toLowerCase().includes(term);
      const matchTrasfondo = pj.trasfondo?.toLowerCase().includes(term);
      const matchPersonalidad = pj.personalidad?.toLowerCase().includes(term);
      const matchNotas = pj.notas?.toLowerCase().includes(term);
      const matchTags = pj.etiquetas?.some((t) => t.toLowerCase().includes(term));

      if (
        matchName ||
        matchClase ||
        matchRaza ||
        matchDesc ||
        matchTrasfondo ||
        matchPersonalidad ||
        matchNotas ||
        matchTags
      ) {
        const snippet =
          findSnippet(pj.descripcion, term) ||
          findSnippet(pj.trasfondo, term) ||
          findSnippet(pj.personalidad, term) ||
          findSnippet(pj.notas, term);

        matches.push({
          id: pj.id,
          campanaId: pj.campana_id,
          campanaNombre: campanasMap.get(pj.campana_id) || 'Campaña',
          type: 'pj',
          title: pj.nombre,
          subtitle: `${pj.raza} • ${pj.clase} Nvl ${pj.nivel}`,
          snippet,
          badge: TYPE_CONFIG.pj.label,
          badgeBg: TYPE_CONFIG.pj.bg,
          badgeText: TYPE_CONFIG.pj.text,
          badgeBorder: TYPE_CONFIG.pj.border,
          data: pj,
        });
      }
    });

    // 2. Sesiones
    sesiones.forEach((s) => {
      const matchTitle = s.titulo.toLowerCase().includes(term);
      const matchNum = `sesión ${s.numero}`.includes(term) || `#${s.numero}`.includes(term);
      const matchNotas = s.notas?.toLowerCase().includes(term);
      const matchTags = s.etiquetas?.some((t) => t.toLowerCase().includes(term));

      if (matchTitle || matchNum || matchNotas || matchTags) {
        const snippet = findSnippet(s.notas, term);

        matches.push({
          id: s.id,
          campanaId: s.campana_id,
          campanaNombre: campanasMap.get(s.campana_id) || 'Campaña',
          type: 'sesion',
          title: `Sesión #${s.numero}: ${s.titulo}`,
          subtitle: s.fecha_real || 'Sin fecha',
          snippet,
          badge: TYPE_CONFIG.sesion.label,
          badgeBg: TYPE_CONFIG.sesion.bg,
          badgeText: TYPE_CONFIG.sesion.text,
          badgeBorder: TYPE_CONFIG.sesion.border,
          data: s,
        });
      }
    });

    // 3. NPCs
    npcs.forEach((n) => {
      const matchName = n.nombre.toLowerCase().includes(term);
      const matchRol = n.rol?.toLowerCase().includes(term);
      const matchDesc = n.descripcion?.toLowerCase().includes(term);
      const matchUbi = n.ubicacion_habitual?.toLowerCase().includes(term);
      const matchInfo = n.informacion_conocida?.toLowerCase().includes(term);
      const matchNotas = n.notas?.toLowerCase().includes(term);

      if (matchName || matchRol || matchDesc || matchUbi || matchInfo || matchNotas) {
        const snippet =
          findSnippet(n.descripcion, term) ||
          findSnippet(n.informacion_conocida, term) ||
          findSnippet(n.notas, term) ||
          findSnippet(n.ubicacion_habitual, term);

        matches.push({
          id: n.id,
          campanaId: n.campana_id,
          campanaNombre: campanasMap.get(n.campana_id) || 'Campaña',
          type: 'npc',
          title: n.nombre,
          subtitle: `${n.rol || 'Sin rol'} • Actitud ${n.actitud}`,
          snippet,
          badge: TYPE_CONFIG.npc.label,
          badgeBg: TYPE_CONFIG.npc.bg,
          badgeText: TYPE_CONFIG.npc.text,
          badgeBorder: TYPE_CONFIG.npc.border,
          data: n,
        });
      }
    });

    // 4. Lugares
    lugares.forEach((l) => {
      const matchName = l.nombre.toLowerCase().includes(term);
      const matchDesc = l.descripcion?.toLowerCase().includes(term);
      const matchQueHay = l.que_hay?.toLowerCase().includes(term);
      const matchLlegar = l.como_llegar?.toLowerCase().includes(term);
      const matchPaso = l.que_paso?.toLowerCase().includes(term);
      const matchNotas = l.notas?.toLowerCase().includes(term);

      if (matchName || matchDesc || matchQueHay || matchLlegar || matchPaso || matchNotas) {
        const snippet =
          findSnippet(l.descripcion, term) ||
          findSnippet(l.que_hay, term) ||
          findSnippet(l.que_paso, term) ||
          findSnippet(l.como_llegar, term);

        matches.push({
          id: l.id,
          campanaId: l.campana_id,
          campanaNombre: campanasMap.get(l.campana_id) || 'Campaña',
          type: 'lugar',
          title: l.nombre,
          subtitle: `Tipo: ${l.tipo} • Estado: ${l.estado}`,
          snippet,
          badge: TYPE_CONFIG.lugar.label,
          badgeBg: TYPE_CONFIG.lugar.bg,
          badgeText: TYPE_CONFIG.lugar.text,
          badgeBorder: TYPE_CONFIG.lugar.border,
          data: l,
        });
      }
    });

    // 5. Misiones
    misiones.forEach((m) => {
      const matchTitulo = m.titulo.toLowerCase().includes(term);
      const matchDesc = m.descripcion?.toLowerCase().includes(term);
      const matchRecompensa = m.recompensa_conocida?.toLowerCase().includes(term);
      const matchNotas = m.notas?.toLowerCase().includes(term);
      const matchPasos = m.pasos?.some((p) => p.texto.toLowerCase().includes(term));

      if (matchTitulo || matchDesc || matchRecompensa || matchNotas || matchPasos) {
        const snippet =
          findSnippet(m.descripcion, term) ||
          findSnippet(m.recompensa_conocida, term) ||
          findSnippet(m.notas, term);

        matches.push({
          id: m.id,
          campanaId: m.campana_id,
          campanaNombre: campanasMap.get(m.campana_id) || 'Campaña',
          type: 'mision',
          title: m.titulo,
          subtitle: `Estado: ${m.estado} • ${m.pasos?.length || 0} pasos`,
          snippet,
          badge: TYPE_CONFIG.mision.label,
          badgeBg: TYPE_CONFIG.mision.bg,
          badgeText: TYPE_CONFIG.mision.text,
          badgeBorder: TYPE_CONFIG.mision.border,
          data: m,
        });
      }
    });

    // 6. Objetos
    objetos.forEach((o) => {
      const matchNombre = o.nombre.toLowerCase().includes(term);
      const matchTipo = o.tipo?.toLowerCase().includes(term);
      const matchDesc = o.descripcion?.toLowerCase().includes(term);
      const matchEfecto = o.efecto_conocido?.toLowerCase().includes(term);
      const matchSospecha = o.efecto_sospechado?.toLowerCase().includes(term);
      const matchPortador = o.quien_lo_lleva?.toLowerCase().includes(term);
      const matchNotas = o.notas?.toLowerCase().includes(term);

      if (
        matchNombre ||
        matchTipo ||
        matchDesc ||
        matchEfecto ||
        matchSospecha ||
        matchPortador ||
        matchNotas
      ) {
        const snippet =
          findSnippet(o.efecto_conocido, term) ||
          findSnippet(o.descripcion, term) ||
          findSnippet(o.efecto_sospechado, term);

        matches.push({
          id: o.id,
          campanaId: o.campana_id,
          campanaNombre: campanasMap.get(o.campana_id) || 'Campaña',
          type: 'objeto',
          title: o.nombre,
          subtitle: `Tipo: ${o.tipo} • Portador: ${o.quien_lo_lleva || 'Sin asignar'}`,
          snippet,
          badge: TYPE_CONFIG.objeto.label,
          badgeBg: TYPE_CONFIG.objeto.bg,
          badgeText: TYPE_CONFIG.objeto.text,
          badgeBorder: TYPE_CONFIG.objeto.border,
          data: o,
        });
      }
    });

    // 7. Monstruos
    monstruos.forEach((mo) => {
      const matchNombre = mo.nombre.toLowerCase().includes(term);
      const matchTipo = mo.tipo?.toLowerCase().includes(term);
      const matchDesc = mo.descripcion_visual?.toLowerCase().includes(term);
      const matchComportamiento = mo.comportamiento?.toLowerCase().includes(term);
      const matchDebilidades = mo.debilidades?.toLowerCase().includes(term);
      const matchNotas = mo.notas?.toLowerCase().includes(term);

      if (
        matchNombre ||
        matchTipo ||
        matchDesc ||
        matchComportamiento ||
        matchDebilidades ||
        matchNotas
      ) {
        const snippet =
          findSnippet(mo.descripcion_visual, term) ||
          findSnippet(mo.comportamiento, term) ||
          findSnippet(mo.debilidades, term);

        matches.push({
          id: mo.id,
          campanaId: mo.campana_id,
          campanaNombre: campanasMap.get(mo.campana_id) || 'Campaña',
          type: 'monstruo',
          title: mo.nombre,
          subtitle: `Tipo: ${mo.tipo} • Encuentros: ${mo.veces_encontrado || 1}`,
          snippet,
          badge: TYPE_CONFIG.monstruo.label,
          badgeBg: TYPE_CONFIG.monstruo.bg,
          badgeText: TYPE_CONFIG.monstruo.text,
          badgeBorder: TYPE_CONFIG.monstruo.border,
          data: mo,
        });
      }
    });

    return matches;
  }, [query, pjs, sesiones, npcs, lugares, misiones, objetos, monstruos, campanasMap]);

  // Agrupar resultados por tipo
  const groupedResults = useMemo(() => {
    const groups: { type: SearchEntityType; label: string; items: SearchResultItem[] }[] = [];
    const typesOrder: SearchEntityType[] = [
      'pj',
      'sesion',
      'npc',
      'lugar',
      'mision',
      'objeto',
      'monstruo',
    ];

    typesOrder.forEach((t) => {
      const items = results.filter((r) => r.type === t);
      if (items.length > 0) {
        groups.push({
          type: t,
          label: TYPE_CONFIG[t].label,
          items,
        });
      }
    });

    return groups;
  }, [results]);

  const handleSelect = (item: SearchResultItem) => {
    onNavigateToEntity(item.type, item.data, item.campanaId);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm sm:max-w-md mx-2">
      {/* Input de Búsqueda */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Buscar en la bitácora... (Ctrl+K)"
          className="w-full pl-9 pr-14 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] transition-all"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 pointer-events-none">
            <span>⌘K</span>
          </div>
        )}
      </div>

      {/* Panel Flotante de Resultados */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-[80vh] overflow-y-auto rounded-2xl bg-[#0e1422] border border-amber-900/50 shadow-2xl shadow-black/80 backdrop-blur-md p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              {results.length} {results.length === 1 ? 'coincidencia' : 'coincidencias'} para &ldquo;
              <strong className="text-amber-200">{query}</strong>&rdquo;
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">ESC para cerrar</span>
          </div>

          {results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-serif text-slate-300">
                No se encontraron resultados para &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Prueba buscando por nombre de personaje, NPC, monstruo, objeto o palabras clave de una misión.
              </p>
            </div>
          ) : (
            <div className="py-2 space-y-4">
              {groupedResults.map((group) => (
                <div key={group.type} className="space-y-1">
                  {/* Encabezado del Grupo */}
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{group.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {group.items.length}
                    </span>
                  </div>

                  {/* Lista de Ítems */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = TYPE_CONFIG[item.type].icon;
                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          onClick={() => handleSelect(item)}
                          className="group/item flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${item.badgeBg} ${item.badgeBorder} ${item.badgeText}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-amber-100 group-hover/item:text-[#f3d265] truncate">
                                {item.title}
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                                {item.campanaNombre}
                              </span>
                            </div>

                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </div>

                            {item.snippet && (
                              <p className="text-[11px] text-slate-400/90 italic line-clamp-1 mt-1 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                                {item.snippet}
                              </p>
                            )}
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-amber-400 shrink-0 self-center transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
