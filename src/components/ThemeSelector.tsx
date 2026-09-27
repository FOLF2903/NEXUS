import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { TemaApp } from '../types';
import { TEMAS_APP } from '../lib/storage';

interface ThemeSelectorProps {
  currentTheme: TemaApp;
  onSelectTheme: (theme: TemaApp) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cerrar dropdown al hacer click fuera o presionar escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeThemeConfig = TEMAS_APP.find((t) => t.id === currentTheme) || TEMAS_APP[0];

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        id="theme-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Tema actual: ${activeThemeConfig.nombre}. Haz clic para cambiar de tema visual`}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs font-semibold transition-all min-h-[44px] select-none ${
          isOpen
            ? 'bg-amber-500/20 border-amber-500/70 text-amber-200 ring-1 ring-amber-500/40'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-amber-200'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="w-3.5 h-3.5 text-[#c9a227] shrink-0" />
        <span className="text-xs font-medium text-amber-200/80">Tema:</span>
        <span className="text-xs font-semibold truncate max-w-[85px] sm:max-w-none">{activeThemeConfig.nombre}</span>
        {/* Muestra de color acento actual */}
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0 ml-0.5"
          style={{ backgroundColor: activeThemeConfig.colores.acento }}
        />
      </button>

      {isOpen && (
        <div
          id="theme-selector-dropdown"
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#131b2a] border border-amber-900/60 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#c9a227]" />
              <span className="font-serif text-xs font-bold uppercase tracking-wider text-amber-100">
                Temas Visuales
              </span>
            </div>
            <span className="text-[10px] text-slate-400">4 estilos</span>
          </div>

          <div className="space-y-1">
            {TEMAS_APP.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  type="button"
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all text-xs border ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-100 shadow-xs'
                      : 'border-transparent hover:bg-slate-800/80 text-slate-300 hover:text-slate-100'
                  }`}
                  role="menuitem"
                >
                  <div className="space-y-0.5 mr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100">
                        {theme.nombre}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {theme.descripcion}
                    </p>
                  </div>

                  {/* Previsualización de paleta con 4 swatches */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="p-1 rounded-md border flex items-center gap-1 shadow-xs"
                      style={{
                        backgroundColor: theme.colores.fondo,
                        borderColor: theme.isDark ? '#3d3228' : '#d4c19d',
                      }}
                      title={`Fondo: ${theme.colores.fondo} | Superficie: ${theme.colores.superficie}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colores.superficie }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colores.acento }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colores.texto }}
                      />
                    </div>

                    <div className="w-5 flex items-center justify-center">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-[#c9a227] stroke-[2.5]" />
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
