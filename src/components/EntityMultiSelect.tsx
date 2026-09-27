import React, { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown, Check } from 'lucide-react';

export interface EntitySelectItem {
  id: string;
  nombre: string;
  subtitulo?: string;
  badge?: string;
}

interface EntityMultiSelectProps {
  idPrefix: string;
  label: string;
  icon: string; // e.g., '👤', '📍', '📜', '🎁', '👹'
  items: EntitySelectItem[];
  selectedIds: string[];
  onChange: (newSelectedIds: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
}

export const EntityMultiSelect: React.FC<EntityMultiSelectProps> = ({
  idPrefix,
  label,
  icon,
  items,
  selectedIds,
  onChange,
  placeholder = 'Buscar o añadir...',
  emptyLabel = 'No hay elementos creados',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSet = new Set(selectedIds);

  const availableItems = items.filter((item) => !selectedSet.has(item.id));
  const filteredItems = availableItems.filter((item) =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const selectedItems = selectedIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is EntitySelectItem => Boolean(item));

  const handleToggle = (itemId: string) => {
    if (selectedSet.has(itemId)) {
      onChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onChange([...selectedIds, itemId]);
    }
  };

  const handleRemove = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== itemId));
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
        <span>{icon}</span>
        <span>{label}</span>
        {selectedIds.length > 0 && (
          <span className="text-[10px] bg-amber-950/60 text-[#c9a227] border border-amber-800/40 px-1.5 py-0.2 rounded-full font-mono">
            {selectedIds.length}
          </span>
        )}
      </label>

      {/* Chips seleccionados */}
      <div className="flex flex-wrap gap-1.5 min-h-[34px] p-1.5 rounded-lg bg-[#0e1522] border border-slate-800 focus-within:border-amber-500/60 transition-colors">
        {selectedItems.map((item) => (
          <span
            key={item.id}
            id={`${idPrefix}-chip-${item.id}`}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[#182338] text-amber-200 border border-amber-900/40 group hover:border-amber-700/60 transition-colors"
          >
            <span className="text-[11px]">{icon}</span>
            <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">
              {item.nombre}
            </span>
            <button
              type="button"
              id={`${idPrefix}-remove-${item.id}`}
              onClick={(e) => handleRemove(item.id, e)}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
              title="Quitar vinculación"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Botón / disparador del dropdown */}
        <button
          type="button"
          id={`${idPrefix}-toggle-dropdown`}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors ml-auto"
        >
          <span>{isOpen ? 'Cerrar' : '+ Vincular'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="relative z-30">
          <div className="absolute top-1 left-0 right-0 p-2 rounded-xl bg-[#111827] border border-amber-900/50 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-100">
            {/* Buscador interno */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                id={`${idPrefix}-search-input`}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0a0f18] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>

            {/* Lista de opciones disponibles */}
            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {items.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 italic">
                  {emptyLabel}
                </div>
              ) : availableItems.length === 0 ? (
                <div className="p-3 text-center text-xs text-emerald-400/80 flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Todos los elementos disponibles ya están vinculados</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 italic">
                  No se encontraron coincidencias para &quot;{searchTerm}&quot;
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    id={`${idPrefix}-option-${item.id}`}
                    type="button"
                    onClick={() => {
                      handleToggle(item.id);
                    }}
                    className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/70 hover:bg-amber-950/40 border border-slate-800/80 hover:border-amber-700/50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-amber-200 block truncate">
                          {item.nombre}
                        </span>
                        {item.subtitulo && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.subtitulo}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
