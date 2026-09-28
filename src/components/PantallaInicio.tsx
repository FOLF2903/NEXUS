import React from 'react';
import {
  BookOpen,
  LogIn,
  UserPlus,
  Users,
  HardDrive,
  Sparkles,
  Shield,
  MapPin,
  Scroll,
  ArrowRight,
  Cloud,
} from 'lucide-react';

interface PantallaInicioProps {
  onIniciarSesion: () => void;
  onRegistrarse: () => void;
  onContinuarInvitado: () => void;
  onUnirseConToken: () => void;
}

export const PantallaInicio: React.FC<PantallaInicioProps> = ({
  onIniciarSesion,
  onRegistrarse,
  onContinuarInvitado,
  onUnirseConToken,
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Cabecera / Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Herramienta de Rol & Crónicas para Mesas de Rol</span>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#c9a227] via-amber-600 to-amber-950 p-0.5 shadow-2xl shadow-amber-950/60">
            <div className="w-full h-full bg-[#131b2a] rounded-[22px] flex items-center justify-center text-[#c9a227]">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-amber-100 tracking-tight">
              Bitácora de Campaña
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              El centro de mando para tus aventuras de D&D y rol. Registra crónicas de sesiones, administra tu atlas de lugares, NPCs, criaturas y fichas sincronizadas en tiempo real.
            </p>
          </div>
        </div>

        {/* Tarjetas de Acciones Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Opción 1: Iniciar Sesión / Cuenta en la Nube */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#162238] to-[#0f172a] border border-amber-500/40 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/70 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#c9a227]">
                <Cloud className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-lg font-bold text-amber-100">
                Modo Nube (Multijugador)
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Guarda tus campañas en Supabase, invita a tus amigos con enlaces seguros y sincroniza tiradas y crónicas en tiempo real.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="landing-login-btn"
                onClick={onIniciarSesion}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-bold text-xs sm:text-sm shadow-md shadow-amber-950/40 transition-all active:scale-98 min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                id="landing-register-btn"
                onClick={onRegistrarse}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-200 border border-amber-500/30 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Crear Cuenta Nueva</span>
              </button>
            </div>
          </div>

          {/* Opción 2: Modo Invitado (Local) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#131b2a] to-[#0c121e] border border-slate-700/80 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <HardDrive className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="font-serif text-lg font-bold text-amber-100">
                Modo Invitado (Local)
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prueba la aplicación inmediatamente sin registrarte. Los datos se almacenan exclusivamente en este navegador y podrás subirlos a la nube cuando quieras.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="landing-guest-btn"
                onClick={onContinuarInvitado}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all shadow-sm min-h-[44px]"
              >
                <span>Continuar como Invitado</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                id="landing-join-token-btn"
                onClick={onUnirseConToken}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-amber-300 font-medium text-xs transition-colors min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>¿Tienes código de invitación? Unirse</span>
              </button>
            </div>
          </div>
        </div>

        {/* Características Destacadas / Ventajas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-900/30 text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-xs">
              <Scroll className="w-4 h-4" />
              <span>Diario y Crónicas</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Registra cada sesión con calendario en juego, resumen para jugadores y notas secretas de Dungeon Master.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-xs">
              <Users className="w-4 h-4" />
              <span>Roles y Multijugador</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Define roles de Host, DM y Jugadores. Los jugadores solo ven lo revelado, protegiendo las sorpresas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-xs">
              <MapPin className="w-4 h-4" />
              <span>Atlas y Bestiario</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Organiza reinos, ciudades, mazmorras, tiendas, monstruos y objetos legendarios con etiquetas y búsquedas rápidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
