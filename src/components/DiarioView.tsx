import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  ArrowRight,
  List,
  GitCommit,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Campana, Sesion, NPC, Lugar, Mision, Objeto, Monstruo } from '../types';

interface DiarioViewProps {
  campana: Campana;
  sesiones: Sesion[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  onSelectSesion: (sesion: Sesion) => void;
  onNavigateToEntity?: (type: 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo', id: string) => void;
}

type SortOrder = 'numero-asc' | 'numero-desc' | 'fecha-asc' | 'fecha-desc';
type ViewMode = 'lista' | 'timeline';

export const DiarioView: React.FC<DiarioViewProps> = ({
  campana,
  sesiones,
  npcs,
  lugares,
  misiones,
  objetos,
  monstruos,
  onSelectSesion,
  onNavigateToEntity,
}) => {
  // Modo de vista: lista vs timeline
  const [viewMode, setViewMode] = useState<ViewMode>('lista');

  // Orden
  const [sortOrder, setSortOrder] = useState<SortOrder>('numero-asc');

  // Búsqueda en texto
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [diaJuegoFilter, setDiaJuegoFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<{
    type: 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo' | 'todos';
    id: string;
  }>({ type: 'todos', id: '' });

  // Lista de todas las etiquetas únicas presentes en las sesiones
  const allSessionTags = useMemo(() => {
    const tagsSet = new Set<string>();
    sesiones.forEach((s) => {
      s.etiquetas?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [sesiones]);

  // Sesiones filtradas y ordenadas
  const filteredAndSortedSesiones = useMemo(() => {
    let result = sesiones.filter((s) => {
      // 1. Filtro de búsqueda textual (título, notas, etiquetas, número)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitulo = s.titulo.toLowerCase().includes(term);
        const matchNotas = s.notas.toLowerCase().includes(term);
        const matchNumero = s.numero.toString().includes(term);
        const matchTag = s.etiquetas?.some((t) => t.toLowerCase().includes(term));
        
        // También buscar en nombres de entidades vinculadas
        const matchEntity =
          s.npc_ids?.some((id) => npcs.find((n) => n.id === id)?.nombre.toLowerCase().includes(term)) ||
          s.lugar_ids?.some((id) => lugares.find((l) => l.id === id)?.nombre.toLowerCase().includes(term)) ||
          s.mision_ids?.some((id) => misiones.find((m) => m.id === id)?.titulo.toLowerCase().includes(term)) ||
          s.objeto_ids?.some((id) => objetos.find((o) => o.id === id)?.nombre.toLowerCase().includes(term)) ||
          s.monstruo_ids?.some((id) => monstruos.find((m) => m.id === id)?.nombre.toLowerCase().includes(term));

        if (!matchTitulo && !matchNotas && !matchNumero && !matchTag && !matchEntity) {
          return false;
        }
      }

      // 2. Filtro de fecha real desde / hasta
      if (fechaDesde && s.fecha_real < fechaDesde) {
        return false;
      }
      if (fechaHasta && s.fecha_real > fechaHasta) {
        return false;
      }

      // 3. Filtro por día de juego
      if (diaJuegoFilter.trim()) {
        const targetDia = parseInt(diaJuegoFilter.trim(), 10);
        if (!isNaN(targetDia)) {
          const inicio = s.dia_juego_inicio;
          const fin = s.dia_juego_fin ?? s.dia_juego_inicio;
          if (targetDia < inicio || targetDia > fin) {
            return false;
          }
        }
      }

      // 4. Filtro por etiqueta
      if (selectedTag && !s.etiquetas?.includes(selectedTag)) {
        return false;
      }

      // 5. Filtro por entidad vinculada
      if (selectedEntityFilter.id) {
        const { type, id } = selectedEntityFilter;
        if (type === 'npc' && !s.npc_ids?.includes(id)) return false;
        if (type === 'lugar' && !s.lugar_ids?.includes(id)) return false;
        if (type === 'mision' && !s.mision_ids?.includes(id)) return false;
        if (type === 'objeto' && !s.objeto_ids?.includes(id)) return false;
        if (type === 'monstruo' && !s.monstruo_ids?.includes(id)) return false;
      }

      return true;
    });

    // Ordenamiento
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'numero-asc':
          return a.numero - b.numero;
        case 'numero-desc':
          return b.numero - a.numero;
        case 'fecha-asc':
          return a.fecha_real.localeCompare(b.fecha_real) || a.numero - b.numero;
        case 'fecha-desc':
          return b.fecha_real.localeCompare(a.fecha_real) || b.numero - a.numero;
        default:
          return a.numero - b.numero;
      }
    });

    return result;
  }, [
    sesiones,
    searchTerm,
    fechaDesde,
    fechaHasta,
    diaJuegoFilter,
    selectedTag,
    selectedEntityFilter,
    sortOrder,
    npcs,
    lugares,
    misiones,
    objetos,
    monstruos,
  ]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta) ||
    Boolean(diaJuegoFilter.trim()) ||
    Boolean(selectedTag) ||
    Boolean(selectedEntityFilter.id);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFechaDesde('');
    setFechaHasta('');
    setDiaJuegoFilter('');
    setSelectedTag(null);
    setSelectedEntityFilter({ type: 'todos', id: '' });
  };

  // Helper para extraer las primeras 2-3 líneas de texto limpio
  const getNotesExcerpt = (notes: string) => {
    if (!notes) return 'Sin anotaciones registradas en esta sesión.';
    const lines = notes
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const excerpt = lines.slice(0, 2).join(' ');
    if (excerpt.length > 220) {
      return excerpt.substring(0, 220) + '...';
    }
    return excerpt || 'Sin anotaciones registradas.';
  };

  return (
    <div id="diario-view-container" className="space-y-6 animate-in fade-in duration-150">
      {/* Cabecera del Diario */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#111827] border border-amber-900/40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-800/40 text-[#c9a227]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-slate-100">
                Diario Cronológico
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                {filteredAndSortedSesiones.length} {filteredAndSortedSesiones.length === 1 ? 'sesión' : 'sesiones'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Línea temporal continua de los acontecimientos de <span className="text-amber-200/90 font-medium">{campana.nombre}</span>
            </p>
          </div>
        </div>

        {/* Toggle Lista / Timeline + Orden */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Orden */}
          <div className="relative">
            <select
              id="diario-sort-select"
              aria-label="Criterio de ordenación"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="appearance-none bg-slate-900 text-slate-300 border border-slate-700 hover:border-amber-700/50 rounded-lg pl-8 pr-7 py-1.5 text-xs font-medium focus:outline-hidden focus:border-[#c9a227] cursor-pointer"
            >
              <option value="numero-asc">Número (1 → N)</option>
              <option value="numero-desc">Número (N → 1)</option>
              <option value="fecha-asc">Fecha (antigua → reciente)</option>
              <option value="fecha-desc">Fecha (reciente → antigua)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle Vista Lista / Timeline */}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
            <button
              id="diario-toggle-lista-btn"
              type="button"
              onClick={() => setViewMode('lista')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'lista'
                  ? 'bg-[#c9a227] text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              id="diario-toggle-timeline-btn"
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#c9a227] text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="diario-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el diario por título, notas, etiquetas o personajes..."
              className="w-full bg-[#111827] text-slate-200 text-xs pl-10 pr-9 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 focus:border-[#c9a227] focus:outline-hidden transition-colors placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="diario-filters-toggle-btn"
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
            )}
            {showFilters ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {hasActiveFilters && (
            <button
              id="diario-clear-filters-btn"
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 hover:bg-rose-950/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Panel Expandible de Filtros */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-[#0f1624] border border-slate-800 space-y-3.5 text-xs text-slate-300 animate-in fade-in duration-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Rango de Fechas Reales */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Fecha real desde:
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-[#c9a227] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Fecha real hasta:
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-[#c9a227] focus:outline-hidden"
                />
              </div>

              {/* Día de Juego */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Día de juego específico:
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ej. 14"
                  value={diaJuegoFilter}
                  onChange={(e) => setDiaJuegoFilter(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-[#c9a227] focus:outline-hidden placeholder:text-slate-600"
                />
              </div>

              {/* Entidad Mencionada */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Entidad mencionada:
                </label>
                <select
                  aria-label="Filtrar por entidad vinculada"
                  value={
                    selectedEntityFilter.id
                      ? `${selectedEntityFilter.type}:${selectedEntityFilter.id}`
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setSelectedEntityFilter({ type: 'todos', id: '' });
                    } else {
                      const [type, id] = val.split(':') as [
                        'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo',
                        string
                      ];
                      setSelectedEntityFilter({ type, id });
                    }
                  }}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-[#c9a227] focus:outline-hidden cursor-pointer truncate"
                >
                  <option value="">Todas las entidades</option>
                  {npcs.length > 0 && (
                    <optgroup label="👤 NPCs">
                      {npcs.map((npc) => (
                        <option key={npc.id} value={`npc:${npc.id}`}>
                          {npc.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {lugares.length > 0 && (
                    <optgroup label="📍 Lugares">
                      {lugares.map((lugar) => (
                        <option key={lugar.id} value={`lugar:${lugar.id}`}>
                          {lugar.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {misiones.length > 0 && (
                    <optgroup label="📜 Misiones">
                      {misiones.map((mision) => (
                        <option key={mision.id} value={`mision:${mision.id}`}>
                          {mision.titulo}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {objetos.length > 0 && (
                    <optgroup label="🎁 Objetos">
                      {objetos.map((objeto) => (
                        <option key={objeto.id} value={`objeto:${objeto.id}`}>
                          {objeto.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {monstruos.length > 0 && (
                    <optgroup label="👹 Monstruos">
                      {monstruos.map((monstruo) => (
                        <option key={monstruo.id} value={`monstruo:${monstruo.id}`}>
                          {monstruo.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* Etiquetas temáticas */}
            {allSessionTags.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Filtrar por etiqueta:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      selectedTag === null
                        ? 'bg-[#c9a227] text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Todas
                  </button>
                  {allSessionTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        selectedTag === tag
                          ? 'bg-[#c9a227] text-slate-950 font-bold'
                          : 'bg-slate-900 text-amber-300/80 hover:text-amber-200 border border-slate-800'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista vacía o sin resultados */}
      {filteredAndSortedSesiones.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-serif text-lg font-bold text-slate-200">
            {hasActiveFilters
              ? 'No hay entradas del diario que coincidan con los filtros'
              : 'Aún no hay sesiones registradas en esta campaña'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? 'Prueba a modificar los términos de búsqueda o a reiniciar los filtros para ver más resultados.'
              : 'Las sesiones que registres en la pestaña "Sesiones" aparecerán organizadas aquí en orden cronológico.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-900/30 text-amber-300 border border-amber-700/40 hover:bg-amber-900/50 transition-colors"
            >
              Reiniciar filtros
            </button>
          )}
        </div>
      ) : viewMode === 'lista' ? (
        /* VISTA 1: LISTA HORIZONTAL (POR DEFECTO) */
        <div className="space-y-3.5">
          {filteredAndSortedSesiones.map((sesion) => {
            // Resolver entidades vinculadas
            const sNpcs = (sesion.npc_ids || [])
              .map((id) => npcs.find((n) => n.id === id))
              .filter((n): n is NPC => Boolean(n));
            const sLugares = (sesion.lugar_ids || [])
              .map((id) => lugares.find((l) => l.id === id))
              .filter((l): l is Lugar => Boolean(l));
            const sMisiones = (sesion.mision_ids || [])
              .map((id) => misiones.find((m) => m.id === id))
              .filter((m): m is Mision => Boolean(m));
            const sObjetos = (sesion.objeto_ids || [])
              .map((id) => objetos.find((o) => o.id === id))
              .filter((o): o is Objeto => Boolean(o));
            const sMonstruos = (sesion.monstruo_ids || [])
              .map((id) => monstruos.find((m) => m.id === id))
              .filter((m): m is Monstruo => Boolean(m));

            const hasEntities =
              sNpcs.length > 0 ||
              sLugares.length > 0 ||
              sMisiones.length > 0 ||
              sObjetos.length > 0 ||
              sMonstruos.length > 0;

            return (
              <article
                key={sesion.id}
                id={`diario-item-${sesion.id}`}
                className="group relative flex flex-col md:flex-row items-stretch rounded-xl bg-[#111827] border border-slate-800 hover:border-amber-700/60 transition-all hover:shadow-xl hover:shadow-black/40 overflow-hidden"
              >
                {/* Columna Izquierda: Número de Sesión Grande */}
                <div className="flex md:flex-col items-center justify-between md:justify-center p-4 md:px-5 bg-[#0b0f17]/90 border-b md:border-b-0 md:border-r border-slate-800 min-w-[120px] shrink-0 text-center">
                  <div>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-slate-500 font-bold block">
                      Sesión
                    </span>
                    <span className="text-3xl md:text-4xl font-serif font-black text-[#c9a227] tracking-tight group-hover:scale-105 transition-transform inline-block">
                      #{sesion.numero}
                    </span>
                  </div>

                  <div className="mt-1 md:mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                      <Clock className="w-3 h-3 text-[#c9a227]" />
                      <span>
                        Día {sesion.dia_juego_inicio}
                        {sesion.dia_juego_fin && sesion.dia_juego_fin !== sesion.dia_juego_inicio
                          ? ` - ${sesion.dia_juego_fin}`
                          : ''}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Columna Centro: Título, Extracto de notas y Chips de entidades */}
                <div className="flex-1 p-4 md:p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3
                        onClick={() => onSelectSesion(sesion)}
                        className="font-serif text-lg md:text-xl font-bold text-slate-100 group-hover:text-amber-200 transition-colors cursor-pointer hover:underline underline-offset-2"
                      >
                        {sesion.titulo}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 md:line-clamp-2">
                      {getNotesExcerpt(sesion.notas)}
                    </p>
                  </div>

                  {/* Chips de vinculaciones */}
                  {hasEntities && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                      {sNpcs.map((npc) => (
                        <button
                          key={npc.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('npc', npc.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-600 transition-colors"
                          title={`Ver NPC: ${npc.nombre}`}
                        >
                          <span>👤</span>
                          <span className="font-medium">{npc.nombre}</span>
                        </button>
                      ))}

                      {sLugares.map((lugar) => (
                        <button
                          key={lugar.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('lugar', lugar.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-600 transition-colors"
                          title={`Ver Lugar: ${lugar.nombre}`}
                        >
                          <span>📍</span>
                          <span className="font-medium">{lugar.nombre}</span>
                        </button>
                      ))}

                      {sMisiones.map((mision) => (
                        <button
                          key={mision.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('mision', mision.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-600 transition-colors"
                          title={`Ver Misión: ${mision.titulo}`}
                        >
                          <span>📜</span>
                          <span className="font-medium">{mision.titulo}</span>
                        </button>
                      ))}

                      {sObjetos.map((objeto) => (
                        <button
                          key={objeto.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('objeto', objeto.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-600 transition-colors"
                          title={`Ver Objeto: ${objeto.nombre}`}
                        >
                          <span>🎁</span>
                          <span className="font-medium">{objeto.nombre}</span>
                        </button>
                      ))}

                      {sMonstruos.map((monstruo) => (
                        <button
                          key={monstruo.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('monstruo', monstruo.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-600 transition-colors"
                          title={`Ver Monstruo: ${monstruo.nombre}`}
                        >
                          <span>👹</span>
                          <span className="font-medium">{monstruo.nombre}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Fecha real, Etiquetas y Botón Ver Sesión */}
                <div className="flex md:flex-col items-center md:items-end justify-between p-4 md:p-5 bg-slate-900/40 border-t md:border-t-0 md:border-l border-slate-800 shrink-0 gap-3 min-w-[190px]">
                  <div className="space-y-1.5 md:text-right">
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>{sesion.fecha_real}</span>
                    </div>

                    {sesion.etiquetas && sesion.etiquetas.length > 0 && (
                      <div className="flex flex-wrap md:justify-end gap-1">
                        {sesion.etiquetas.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300/80 border border-slate-700"
                          >
                            #{tag}
                          </span>
                        ))}
                        {sesion.etiquetas.length > 3 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            +{sesion.etiquetas.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectSesion(sesion)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-[#c9a227] hover:text-slate-950 transition-all shadow-xs"
                  >
                    <span>Ver sesión completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* VISTA 2: TIMELINE VISUAL VERTICAL */
        <div className="relative pl-6 sm:pl-8 py-2 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-amber-800/60 before:to-slate-800 space-y-8">
          {filteredAndSortedSesiones.map((sesion) => {
            const sNpcs = (sesion.npc_ids || [])
              .map((id) => npcs.find((n) => n.id === id))
              .filter((n): n is NPC => Boolean(n));
            const sLugares = (sesion.lugar_ids || [])
              .map((id) => lugares.find((l) => l.id === id))
              .filter((l): l is Lugar => Boolean(l));
            const sMisiones = (sesion.mision_ids || [])
              .map((id) => misiones.find((m) => m.id === id))
              .filter((m): m is Mision => Boolean(m));
            const sObjetos = (sesion.objeto_ids || [])
              .map((id) => objetos.find((o) => o.id === id))
              .filter((o): o is Objeto => Boolean(o));
            const sMonstruos = (sesion.monstruo_ids || [])
              .map((id) => monstruos.find((m) => m.id === id))
              .filter((m): m is Monstruo => Boolean(m));

            const hasEntities =
              sNpcs.length > 0 ||
              sLugares.length > 0 ||
              sMisiones.length > 0 ||
              sObjetos.length > 0 ||
              sMonstruos.length > 0;

            return (
              <div key={sesion.id} className="relative group">
                {/* Nodo circular en la línea del timeline */}
                <div className="absolute -left-6 sm:-left-8 top-4 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0b0f17] border-2 border-[#c9a227] flex items-center justify-center text-[10px] font-bold text-amber-300 shadow-md shadow-black group-hover:scale-110 group-hover:bg-[#c9a227] group-hover:text-black transition-all">
                  {sesion.numero}
                </div>

                {/* Tarjeta del nodo del timeline */}
                <div className="rounded-xl bg-[#111827] border border-slate-800 hover:border-amber-700/60 p-4 sm:p-5 transition-all shadow-lg hover:shadow-black/50">
                  {/* Encabezado del nodo */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-[#c9a227] bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded">
                        SESIÓN #{sesion.numero}
                      </span>
                      <h4
                        onClick={() => onSelectSesion(sesion)}
                        className="font-serif text-base sm:text-lg font-bold text-slate-100 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        {sesion.titulo}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 text-amber-300/80">
                        <Clock className="w-3.5 h-3.5 text-[#c9a227]" />
                        <span>
                          Día {sesion.dia_juego_inicio}
                          {sesion.dia_juego_fin && sesion.dia_juego_fin !== sesion.dia_juego_inicio
                            ? ` - ${sesion.dia_juego_fin}`
                            : ''}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sesion.fecha_real}</span>
                      </span>
                    </div>
                  </div>

                  {/* Extracto de notas */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
                    {getNotesExcerpt(sesion.notas)}
                  </p>

                  {/* Entidades vinculadas en el timeline */}
                  {hasEntities && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5 pt-2 border-t border-slate-800/60">
                      {sNpcs.map((npc) => (
                        <button
                          key={npc.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('npc', npc.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors"
                        >
                          <span>👤</span>
                          <span>{npc.nombre}</span>
                        </button>
                      ))}

                      {sLugares.map((lugar) => (
                        <button
                          key={lugar.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('lugar', lugar.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors"
                        >
                          <span>📍</span>
                          <span>{lugar.nombre}</span>
                        </button>
                      ))}

                      {sMisiones.map((mision) => (
                        <button
                          key={mision.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('mision', mision.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors"
                        >
                          <span>📜</span>
                          <span>{mision.titulo}</span>
                        </button>
                      ))}

                      {sObjetos.map((objeto) => (
                        <button
                          key={objeto.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('objeto', objeto.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors"
                        >
                          <span>🎁</span>
                          <span>{objeto.nombre}</span>
                        </button>
                      ))}

                      {sMonstruos.map((monstruo) => (
                        <button
                          key={monstruo.id}
                          type="button"
                          onClick={() => onNavigateToEntity && onNavigateToEntity('monstruo', monstruo.id)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600 transition-colors"
                        >
                          <span>👹</span>
                          <span>{monstruo.nombre}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Pie de la tarjeta del timeline */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex flex-wrap gap-1">
                      {sesion.etiquetas?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300/80 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSesion(sesion)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-[#c9a227] transition-colors ml-auto"
                    >
                      <span>Ver sesión completa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
