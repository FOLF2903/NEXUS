import React from 'react';
import { BookOpen, Plus, Cloud, HardDrive, User as UserIcon } from 'lucide-react';
import {
  Campana,
  Sesion,
  NPC,
  Lugar,
  Mision,
  Objeto,
  Monstruo,
  PJ,
  ModoApp,
  TemaApp,
} from '../types';
import { StorageDataSource, UserProfile } from '../types/supabase';
import { User } from '@supabase/supabase-js';
import { GlobalSearch, SearchEntityType } from './GlobalSearch';
import { ConfiguracionMenu } from './ConfiguracionMenu';

interface NavbarProps {
  onNuevaCampana: () => void;
  onExportar: () => void;
  onImportar: () => void;
  onGoHome: () => void;
  campanas?: Campana[];
  sesiones?: Sesion[];
  pjs?: PJ[];
  npcs?: NPC[];
  lugares?: Lugar[];
  misiones?: Mision[];
  objetos?: Objeto[];
  monstruos?: Monstruo[];
  activeCampanaId?: string;
  onNavigateToEntity?: (type: SearchEntityType, item: any, campanaId: string) => void;
  modoApp?: ModoApp;
  onToggleModoApp?: () => void;
  currentTheme?: TemaApp;
  onSelectTheme?: (theme: TemaApp) => void;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
  storageMode?: StorageDataSource;
  onToggleStorageMode?: (mode: StorageDataSource) => void;
  onOpenAuth?: (tab?: 'login' | 'register' | 'config') => void;
  onOpenJoinModal?: () => void;
  onOpenConfigSupabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNuevaCampana,
  onExportar,
  onImportar,
  onGoHome,
  campanas = [],
  sesiones = [],
  pjs = [],
  npcs = [],
  lugares = [],
  misiones = [],
  objetos = [],
  monstruos = [],
  activeCampanaId,
  onNavigateToEntity,
  modoApp = 'jugador',
  onToggleModoApp,
  currentTheme = 'oscuro-dorado',
  onSelectTheme,
  currentUser,
  userProfile,
  storageMode = 'local',
  onToggleStorageMode,
  onOpenAuth,
  onOpenJoinModal,
  onOpenConfigSupabase,
}) => {
  return (
    <header className={`sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b transition-colors ${
      modoApp === 'dm' ? 'border-amber-700/60 shadow-xs shadow-amber-900/20' : 'border-amber-900/40'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Logo / Marca */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 shadow-md transition-transform group-hover:scale-105 ${
            modoApp === 'dm'
              ? 'bg-gradient-to-br from-amber-400 via-[#c9a227] to-amber-700 shadow-amber-900/50'
              : 'bg-gradient-to-br from-[#c9a227] to-[#7d5e11] shadow-amber-950/40'
          }`}>
            <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center text-[#c9a227]">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base sm:text-lg md:text-xl font-bold tracking-wide text-amber-100 group-hover:text-amber-200 transition-colors block leading-tight">
                Bitácora<span className="hidden sm:inline"> de Campaña</span>
              </span>
              {storageMode === 'cloud' ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Nube</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                  <HardDrive className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Local</span>
                </span>
              )}
            </div>
            <span className="hidden md:block text-[11px] text-slate-400">
              Libreta digital para crónicas y sesiones de rol
            </span>
          </div>
        </div>

        {/* Barra de Búsqueda Global: orden inferior en móvil (ancho completo) y centro en pantallas medianas */}
        {onNavigateToEntity && (
          <div className="order-last sm:order-none w-full sm:w-auto flex-1 sm:max-w-xs md:max-w-sm mt-1 sm:mt-0">
            <GlobalSearch
              campanas={campanas}
              sesiones={sesiones}
              pjs={pjs}
              npcs={npcs}
              lugares={lugares}
              misiones={misiones}
              objetos={objetos}
              monstruos={monstruos}
              activeCampanaId={activeCampanaId}
              onNavigateToEntity={onNavigateToEntity}
            />
          </div>
        )}

        {/* Acciones principales de la cabecera */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto sm:ml-0">
          {/* Botón de cuenta / estado en la nube */}
          {storageMode === 'cloud' && (
            <>
              {currentUser ? (
                <button
                  id="navbar-user-btn"
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 hover:bg-emerald-900/40 text-emerald-200 text-xs font-semibold transition-colors min-h-[44px]"
                  title={`Conectado como ${userProfile?.display_name || currentUser.email}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {userProfile?.display_name || currentUser.email?.split('@')[0]}
                  </span>
                  <span className="md:hidden text-[11px]">Cuenta</span>
                </button>
              ) : (
                <button
                  id="navbar-login-btn"
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/40 border border-sky-600/40 hover:bg-sky-900/40 text-sky-200 text-xs font-semibold transition-colors min-h-[44px]"
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
              )}

              {onOpenJoinModal && (
                <button
                  id="navbar-join-btn"
                  type="button"
                  onClick={onOpenJoinModal}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-amber-200 transition-colors min-h-[44px]"
                  title="Unirse a una campaña con código de invitación"
                >
                  <span>Unirse</span>
                </button>
              )}
            </>
          )}

          {/* Menú de Configuración (Temas, Importar, Exportar, Modo DM/Jugador y Modo Nube) */}
          {onSelectTheme && (
            <ConfiguracionMenu
              currentTheme={currentTheme}
              onSelectTheme={onSelectTheme}
              onExportar={onExportar}
              onImportar={onImportar}
              modoApp={modoApp}
              onToggleModoApp={onToggleModoApp}
              currentUser={currentUser}
              storageMode={storageMode}
              onToggleStorageMode={onToggleStorageMode}
              onOpenAuth={onOpenAuth}
              onOpenJoinModal={onOpenJoinModal}
              onOpenConfigSupabase={onOpenConfigSupabase}
            />
          )}

          {/* Botón Crear Campaña */}
          <button
            id="nueva-campana-top-btn"
            type="button"
            onClick={onNuevaCampana}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black text-xs font-semibold shadow-md shadow-amber-950/30 transition-all active:scale-98 min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span className="hidden sm:inline">Nueva campaña</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>
    </header>
  );
};

