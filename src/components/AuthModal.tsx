import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  getCurrentUser,
  fetchUserProfile,
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: SupabaseAuthUser) => void;
  onSignOut?: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSignOut,
  initialTab = 'login',
}) => {
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Formulario Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Cargar usuario actual si existe
    getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserProfile(user.id).then(setProfile);
      }
    });

    if (initialTab) {
      setActiveTab(initialTab);
    }

    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isOpen, initialTab]);

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage('La conexión a la nube no está disponible en este momento. Por favor contacta al administrador.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { user, error } = await supabaseSignIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else if (user) {
      setCurrentUser(user);
      const prof = await fetchUserProfile(user.id);
      setProfile(prof);
      setSuccessMessage('¡Sesión iniciada con éxito!');
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage('La conexión a la nube no está disponible en este momento. Por favor contacta al administrador.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { user, error } = await supabaseSignUp(email, password, displayName);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else if (user) {
      setCurrentUser(user);
      const prof = await fetchUserProfile(user.id);
      setProfile(prof);
      setSuccessMessage('¡Cuenta creada correctamente!');
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => onClose(), 1000);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabaseSignOut();
    setCurrentUser(null);
    setProfile(null);
    setLoading(false);
    if (onSignOut) onSignOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#111827] border border-amber-900/60 shadow-2xl p-5 sm:p-6 text-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#c9a227]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                {currentUser ? 'Mi Cuenta de Aventurero' : 'Cuentas y Multijugador'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Sincronización en la nube con Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="pt-4">
          {!currentUser && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  activeTab === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  activeTab === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Mensajes de error / éxito */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VISTA: USUARIO CONECTADO */}
          {currentUser ? (
            <div className="py-2 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/30 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-serif font-bold text-lg shadow-md">
                  {(profile?.display_name || currentUser.email || 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-slate-100 text-sm truncate">
                    {profile?.display_name || 'Aventurero'}
                  </span>
                  <span className="block text-xs text-slate-400 truncate">
                    {currentUser.email}
                  </span>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Check className="w-3 h-3" /> Conectado en la nube
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-900/50 text-xs font-semibold transition-all min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all min-h-[44px]"
                >
                  Volver a la Bitácora
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: INICIAR SESIÓN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aventurero@reino.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-all shadow-md min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTRO */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre o Apodo de Aventurero
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Gandalf el Gris"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aventurero@reino.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-all shadow-md min-h-[44px]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
