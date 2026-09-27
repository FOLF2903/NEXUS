import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Palette,
  Download,
  Upload,
  Check,
  X,
  Shield,
  Users,
  Database,
  Cloud,
  HardDrive,
  User,
  Key,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { TemaApp, ModoApp } from '../types';
import { TEMAS_APP } from '../lib/storage';
import { StorageDataSource } from '../types/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

interface ConfiguracionMenuProps {
  currentTheme: TemaApp;
  onSelectTheme: (theme: TemaApp) => void;
  onExportar: () => void;
  onImportar: () => void;
  modoApp?: ModoApp;
  onToggleModoApp?: () => void;
  currentUser?: SupabaseAuthUser | null;
  storageMode?: StorageDataSource;
  onToggleStorageMode?: (mode: StorageDataSource) => void;
  onOpenAuth?: (tab?: 'login' | 'register') => void;
  onOpenJoinModal?: () => void;
}

export const ConfiguracionMenu: React.FC<ConfiguracionMenuProps> = ({
  currentTheme,
  onSelectTheme,
  onExportar,
  onImportar,
  modoApp = 'jugador',
  onToggleModoApp,
  currentUser,
  storageMode = 'local',
  onToggleStorageMode,
  onOpenAuth,
  onOpenJoinModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al presionar Escape o click fuera
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
      {/* Botón de activación en la barra superior */}
      <button
        id="configuracion-menu-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Configuración y temas. Modo actual: ${modoApp === 'dm' ? 'Dungeon Master' : 'Jugador'}`}
        aria-label="Abrir panel de configuración y temas"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all min-h-[44px] min-w-[44px] select-none ${
          isOpen
            ? 'bg-amber-500/20 border-amber-500/70 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
            : modoApp === 'dm'
            ? 'bg-amber-950/40 border-amber-600/50 text-amber-100 hover:bg-amber-900/40'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-amber-200'
        }`}
      >
        <Settings className={`w-4 h-4 text-[#c9a227] transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        <span className="hidden md:inline text-xs font-semibold">Configuración</span>
        {modoApp === 'dm' && (
          <span className="text-[10px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            🎲 DM
          </span>
        )}
        {/* Indicador visual del color de tema actual */}
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
          style={{ backgroundColor: activeThemeConfig.colores.acento }}
          title={`Tema actual: ${activeThemeConfig.nombre}`}
        />
      </button>

      {/* Menú desplegable / panel modal flotante */}
      {isOpen && (
        <>
          {/* Backdrop semitransparente en móviles para facilitar el cierre */}
          <div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            id="configuracion-dropdown-panel"
            className="fixed inset-x-3 top-16 sm:top-auto sm:inset-x-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-96 rounded-xl bg-[#131b2a] border border-amber-900/70 shadow-2xl p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-label="Panel de configuración"
          >
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#c9a227]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-amber-100">
                    Configuración
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ajustes de apariencia y datos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cerrar configuración"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECCIÓN 1: APARIENCIA Y TEMAS */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                <Palette className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Tema Visual ({TEMAS_APP.length} disponibles)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {TEMAS_APP.map((theme) => {
                  const isSelected = theme.id === currentTheme;
                  return (
                    <button
                      key={theme.id}
                      id={`theme-opt-${theme.id}`}
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className={`flex flex-col p-2.5 rounded-lg text-left transition-all border ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40 shadow-xs'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-semibold text-xs text-slate-100">
                          {theme.nombre}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-2">
                        {theme.descripcion}
                      </p>
                      {/* Mini paleta de colores */}
                      <div
                        className="p-1 rounded flex items-center gap-1 border self-start shadow-xs"
                        style={{
                          backgroundColor: theme.colores.fondo,
                          borderColor: theme.isDark ? '#3d3228' : '#d4c19d',
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: theme.colores.superficie }}
                          title="Superficie"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: theme.colores.acento }}
                          title="Acento"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: theme.colores.texto }}
                          title="Texto"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: COPIAS DE SEGURIDAD Y DATOS */}
            <div className="mb-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                <Database className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Datos y Respaldo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Botón Exportar */}
                <button
                  id="menu-exportar-btn"
                  type="button"
                  onClick={() => {
                    onExportar();
                    setIsOpen(false);
                  }}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-600/50 transition-all text-left group min-h-[44px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#c9a227] shrink-0 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-200 group-hover:text-amber-200">
                      Exportar Copia
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Descargar archivo .json
                    </span>
                  </div>
                </button>

                {/* Botón Importar */}
                <button
                  id="menu-importar-btn"
                  type="button"
                  onClick={() => {
                    onImportar();
                    setIsOpen(false);
                  }}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-600/50 transition-all text-left group min-h-[44px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#c9a227] shrink-0 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-200 group-hover:text-amber-200">
                      Importar Datos
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Restaurar desde .json
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* SECCIÓN 3: MODO DE USO (DM / JUGADOR) */}
            {onToggleModoApp && (
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
                  <span>Modo de Libreta</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="menu-modo-jugador-btn"
                    onClick={() => {
                      if (modoApp === 'dm') onToggleModoApp();
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      modoApp === 'jugador'
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4 text-slate-300 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-100">Jugador</span>
                        {modoApp === 'jugador' && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">Vista limpia</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="menu-modo-dm-btn"
                    onClick={() => {
                      if (modoApp === 'jugador') onToggleModoApp();
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      modoApp === 'dm'
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-100">Dungeon Master</span>
                        {modoApp === 'dm' && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">Notas secretas</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* SECCIÓN 4: MULTIJUGADOR Y CUENTAS (SUPABASE FASE 16) */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Cloud className="w-3.5 h-3.5 text-[#c9a227]" />
                  <span>Multijugador en la Nube</span>
                </div>
                {currentUser && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Conectado
                  </span>
                )}
              </div>

              {/* Selector de Modo: Demo Local vs Nube */}
              {onToggleStorageMode && (
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleStorageMode('local')}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      storageMode === 'local'
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold truncate">Modo Local</span>
                      <span className="block text-[9px] text-slate-400">Offline / Demo</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStorageMode('cloud')}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      storageMode === 'cloud'
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold truncate">Modo Nube</span>
                      <span className="block text-[9px] text-slate-400">Supabase Sync</span>
                    </div>
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                {/* Botón de Cuenta / Iniciar sesión */}
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-amber-200 transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <User className="w-4 h-4 text-[#c9a227] shrink-0" />
                      <span className="truncate">
                        {currentUser
                          ? `Mi Cuenta (${currentUser.email})`
                          : 'Iniciar Sesión / Registrarse'}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 shrink-0">
                      {currentUser ? 'Gestionar' : 'Entrar'}
                    </span>
                  </button>
                )}

                {/* Botón Unirse con Token */}
                {onOpenJoinModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenJoinModal();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-amber-200 transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Unirse a Campaña con Código</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Pegar token</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
