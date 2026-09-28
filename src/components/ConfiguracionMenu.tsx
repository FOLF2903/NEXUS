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
  LogIn,
  Sparkles,
  Layers,
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

type TabConfig = 'apariencia' | 'datos' | 'cuenta';

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
  const [activeTab, setActiveTab] = useState<TabConfig>('apariencia');
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
        title={`Configuración. Modo actual: ${modoApp === 'dm' ? 'Dungeon Master' : 'Jugador'}`}
        aria-label="Abrir panel de configuración"
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
          title={`Tema: ${activeThemeConfig.nombre}`}
        />
      </button>

      {/* Menú desplegable / panel modal flotante */}
      {isOpen && (
        <>
          {/* Backdrop semitransparente en móviles */}
          <div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            id="configuracion-dropdown-panel"
            className="fixed inset-x-3 top-16 sm:top-auto sm:inset-x-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-[420px] rounded-2xl bg-[#131b2a] border border-amber-900/70 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200 max-h-[85vh] flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Panel de configuración"
          >
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-[#0e1522] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#c9a227]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-amber-100">
                    Configuración de la App
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Personaliza tema, respaldos y cuenta
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

            {/* Pestañas de Navegación del Menú */}
            <div className="grid grid-cols-3 border-b border-slate-800 bg-[#101726] p-1.5 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('apariencia')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'apariencia'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Apariencia</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('datos')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'datos'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Respaldos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cuenta')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'cuenta'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Cuenta</span>
              </button>
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* PESTAÑA 1: APARIENCIA Y MODO */}
              {activeTab === 'apariencia' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Selector de Temas */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Tema Visual
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TEMAS_APP.map((tema) => {
                        const isSelected = tema.id === currentTheme;
                        return (
                          <button
                            key={tema.id}
                            type="button"
                            onClick={() => onSelectTheme(tema.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all relative ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                                style={{ backgroundColor: tema.colores.acento }}
                              />
                              <span className="text-xs font-bold truncate">{tema.nombre}</span>
                              {isSelected && <Check className="w-3 h-3 text-amber-400 ml-auto shrink-0" />}
                            </div>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">
                              {tema.descripcion}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de Modo de Libreta (DM / Jugador) */}
                  {onToggleModoApp && (
                    <div className="pt-3 border-t border-slate-800">
                      <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                        Modo de Libreta
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          id="menu-modo-jugador-btn"
                          onClick={() => {
                            if (modoApp === 'dm') onToggleModoApp();
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                            modoApp === 'jugador'
                              ? 'bg-amber-500/15 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Users className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold">Jugador</span>
                              {modoApp === 'jugador' && <Check className="w-3 h-3 text-amber-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400 block">Vista limpia</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          id="menu-modo-dm-btn"
                          onClick={() => {
                            if (modoApp === 'jugador') onToggleModoApp();
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                            modoApp === 'dm'
                              ? 'bg-amber-500/15 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold">Dungeon Master</span>
                              {modoApp === 'dm' && <Check className="w-3 h-3 text-amber-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400 block">Notas secretas</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 2: COPIA DE SEGURIDAD / DATOS */}
              {activeTab === 'datos' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-300">
                    Exporta tus campañas a un archivo para respaldarlas en tu ordenador o restaurarlas en cualquier momento.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      id="menu-exportar-btn"
                      type="button"
                      onClick={() => {
                        onExportar();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#c9a227] shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-100">
                          Exportar Copia de Seguridad
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Descarga un archivo .json con todas tus campañas
                        </span>
                      </div>
                    </button>

                    <button
                      id="menu-importar-btn"
                      type="button"
                      onClick={() => {
                        onImportar();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-100">
                          Importar Copia de Seguridad
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Restaura campañas desde un archivo .json
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: CUENTA Y NUBE */}
              {activeTab === 'cuenta' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Tarjeta de estado de usuario */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#c9a227]">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-100">
                            {currentUser ? currentUser.email : 'Modo Invitado'}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {currentUser ? 'Cuenta de Supabase activa' : 'Sin iniciar sesión'}
                          </span>
                        </div>
                      </div>

                      {currentUser ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Conectado
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Invitado
                        </span>
                      )}
                    </div>

                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuth();
                          setIsOpen(false);
                        }}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs shadow-sm transition-colors min-h-[38px]"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{currentUser ? 'Ver Mi Perfil / Cerrar Sesión' : 'Iniciar Sesión / Registrarse'}</span>
                      </button>
                    )}
                  </div>

                  {/* Selector de Modo de Almacenamiento */}
                  {onToggleStorageMode && (
                    <div className="pt-2 border-t border-slate-800">
                      <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                        Modo de Almacenamiento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleStorageMode('cloud')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            storageMode === 'cloud'
                              ? 'bg-amber-500/15 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Cloud className="w-3.5 h-3.5 text-sky-400" />
                            <span className="text-xs font-semibold">Modo Nube</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">Supabase Realtime</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStorageMode('local')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            storageMode === 'local'
                              ? 'bg-amber-500/15 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/40'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-semibold">Modo Local</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">Solo este navegador</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botón Unirse con Token */}
                  {onOpenJoinModal && (
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenJoinModal();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-amber-200 transition-colors min-h-[42px]"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Unirse con Código de Invitación</span>
                        </div>
                        <span className="text-[10px] text-amber-400">Pegar token</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
