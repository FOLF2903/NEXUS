import React, { useState, useRef, useEffect } from 'react';
import { Tag, Plus, X, Check, Sparkles, AlertCircle } from 'lucide-react';
import {
  normalizeTag,
  cleanAndNormalizeTags,
  getTagsFrequencies,
  ETIQUETAS_SUGERIDAS_DEFECTO,
  HasEtiquetas,
  TagFrequency,
} from '../lib/tags';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  campanaSesiones?: HasEtiquetas[];
  existingItems?: HasEtiquetas[];
  customPresets?: string[];
  labelColeccion?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  campanaSesiones,
  existingItems,
  customPresets,
  labelColeccion = 'Etiquetas de la Campaña',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const itemsToAnalyze = existingItems || campanaSesiones || [];
  const presetsToUse = customPresets || ETIQUETAS_SUGERIDAS_DEFECTO;

  // Calcular frecuencias de etiquetas en los elementos actuales
  const existingFrequencies: TagFrequency[] = React.useMemo(() => {
    return getTagsFrequencies(itemsToAnalyze);
  }, [itemsToAnalyze]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const normalizedInput = normalizeTag(inputValue);
  const isInputAlreadySelected = normalizedInput && selectedTags.includes(normalizedInput);

  // Filtrar etiquetas existentes según lo que escribe el usuario
  const filteredExistingTags = existingFrequencies.filter((item) => {
    if (!normalizedInput) return true;
    return item.tag.includes(normalizedInput);
  });

  // Etiquetas sugeridas que no están en los elementos existentes ni en la selección actual
  const existingTagNames = new Set(existingFrequencies.map((item) => item.tag));
  const suggestedPresets = presetsToUse.filter(
    (preset) => !existingTagNames.has(preset) && !selectedTags.includes(preset)
  ).filter((preset) => {
    if (!normalizedInput) return true;
    return preset.includes(normalizedInput);
  });

  // Agregar etiqueta
  const handleAddTag = (rawTag: string) => {
    const normalized = normalizeTag(rawTag);
    if (!normalized) return;

    if (!selectedTags.includes(normalized)) {
      onChange([...selectedTags, normalized]);
    }
    setInputValue('');
  };

  // Remover etiqueta
  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  // Manejador de teclado en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (normalizedInput) {
        handleAddTag(normalizedInput);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Elimina la última etiqueta con retroceso si el input está vacío
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Contenedor principal de chips e input */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`w-full min-h-[46px] p-2 rounded-lg bg-[#0e1522] border transition-colors cursor-text flex flex-wrap items-center gap-1.5 ${
          isOpen
            ? 'border-[#c9a227] ring-1 ring-[#c9a227]'
            : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        {/* Chips seleccionados */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm animate-in fade-in zoom-in-95 duration-100"
          >
            <Tag className="w-3 h-3 text-[#c9a227]" />
            <span>#{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/60 rounded p-0.5 transition-colors"
              title={`Eliminar #${tag}`}
              aria-label={`Eliminar #${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input de texto para buscar o crear */}
        <input
          ref={inputRef}
          id="sesion-etiquetas-input"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedTags.length === 0
              ? 'Haz clic para seleccionar o escribe para crear...'
              : 'Añadir otra etiqueta...'
          }
          className="flex-1 min-w-[140px] bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm py-1 px-1"
        />
      </div>

      {/* Panel desplegable de selección y sugerencias */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#111827] border border-amber-900/50 shadow-2xl p-3.5 space-y-3 max-h-80 overflow-y-auto backdrop-blur-md">
          {/* Opción de crear nueva etiqueta si hay texto escrito */}
          {normalizedInput && (
            <div className="pb-2 border-b border-slate-800">
              {isInputAlreadySelected ? (
                <div className="flex items-center gap-2 text-xs text-amber-400/90 py-1.5 px-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>La etiqueta <strong>#{normalizedInput}</strong> ya está añadida</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddTag(normalizedInput)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#c9a227]/15 hover:bg-[#c9a227]/25 text-[#c9a227] border border-[#c9a227]/40 text-xs font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Crear etiqueta: <strong className="font-mono text-amber-200">#{normalizedInput}</strong></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Pulsar Enter</span>
                </button>
              )}
            </div>
          )}

          {/* Etiquetas usadas en la campaña actual */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#c9a227]" />
                <span>{labelColeccion} ({existingFrequencies.length})</span>
              </span>
              <span className="text-[10px] text-slate-500">Ordenadas por frecuencia</span>
            </div>

            {existingFrequencies.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">
                Aún no hay etiquetas en esta campaña. ¡Crea la primera arriba o elige una sugerida!
              </p>
            ) : filteredExistingTags.length === 0 ? (
              <p className="text-xs text-slate-500 py-1">
                No hay etiquetas existentes que coincidan con &quot;{normalizedInput}&quot;.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filteredExistingTags.map(({ tag, count }) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveTag(tag);
                        } else {
                          handleAddTag(tag);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 text-[#c9a227] border-[#c9a227]/60 ring-1 ring-[#c9a227]/40 shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-amber-700/60 hover:text-amber-200 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 text-[#c9a227]" />
                      ) : (
                        <span className="text-slate-500">#</span>
                      )}
                      <span>{tag}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                          isSelected
                            ? 'bg-[#c9a227]/30 text-amber-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sugerencias temáticas predefinidas */}
          {suggestedPresets.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-amber-400/80" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Sugerencias Temáticas
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddTag(preset)}
                    className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-amber-600/50 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5 text-amber-500/70" />
                    <span>#{preset}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
