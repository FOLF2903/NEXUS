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
  Key,
  Globe,
  Check,
  AlertCircle,
  Sparkles,
  Copy,
  Download,
  Database,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  getCurrentUser,
  fetchUserProfile,
} from '../services/supabaseService';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
} from '../lib/supabase';
import { UserProfile } from '../types/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: SupabaseAuthUser) => void;
  onSignOut?: () => void;
  initialTab?: 'login' | 'register' | 'config';
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
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'config'>(initialTab);

  // Formulario Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Configuración de Supabase
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Cargar credenciales guardadas
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseAnonKey(creds.anonKey);

    // Cargar usuario actual
    getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserProfile(user.id).then(setProfile);
      }
    });

    if (initialTab) {
      setActiveTab(initialTab);
    } else if (!isSupabaseConfigured()) {
      setActiveTab('config');
    }

    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isOpen, initialTab]);

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setActiveTab('config');
      setErrorMessage('Por favor configura la URL y la Anon Key de Supabase primero.');
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
      setActiveTab('config');
      setErrorMessage('Por favor configura la URL y la Anon Key de Supabase primero.');
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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = supabaseUrl.trim();
    const cleanKey = supabaseAnonKey.trim();

    saveSupabaseCredentials({
      url: cleanUrl,
      anonKey: cleanKey,
    });

    // Si había una sesión activa previa, cerrar sesión para evitar inconsistencias
    if (currentUser) {
      try {
        await supabaseSignOut();
      } catch {
        // Ignorar
      }
      setCurrentUser(null);
      setProfile(null);
      if (onSignOut) onSignOut();
    }

    setConfigSaved(true);
    setSuccessMessage('¡Credenciales de Supabase actualizadas con éxito! Ahora puedes iniciar sesión con tu cuenta.');
    setErrorMessage(null);

    setTimeout(() => {
      setConfigSaved(false);
      setActiveTab('login');
    }, 1000);
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setConnectionStatus({ ok: false, message: 'Ingresa la Project URL y la Anon Key para probar la conexión.' });
      return;
    }
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey.trim(),
          Authorization: `Bearer ${supabaseAnonKey.trim()}`,
        },
      });

      if (res.ok || res.status === 200) {
        setConnectionStatus({ ok: true, message: '¡Conexión exitosa! Las credenciales y la URL son correctas.' });
      } else if (res.status === 401) {
        setConnectionStatus({ ok: false, message: 'Error 401: Anon Key no autorizada o incorrecta. Verifica la clave pública en Project Settings -> API.' });
      } else {
        setConnectionStatus({ ok: true, message: `Conexión alcanzada (HTTP ${res.status}). La URL responde correctamente.` });
      }
    } catch (err: any) {
      setConnectionStatus({
        ok: false,
        message: `Error al conectar con Supabase: ${err.message || 'Error de red'}. Asegúrate de que la URL empiece con https:// y el proyecto esté activo.`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopySql = async () => {
    try {
      const res = await fetch('/supabase-schema.sql');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
      } else {
        // Fallback básico
        setErrorMessage('No se pudo cargar el archivo SQL automáticamente. Puedes encontrarlo en la raíz del proyecto (supabase-schema.sql).');
      }
    } catch {
      setErrorMessage('Error al copiar el archivo SQL al portapapeles.');
    }
  };

  const handleResetConfig = () => {
    saveSupabaseCredentials({ url: '', anonKey: '' });
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setConnectionStatus(null);
    if (currentUser) {
      setCurrentUser(null);
      setProfile(null);
      if (onSignOut) onSignOut();
    }
    setSuccessMessage('Credenciales restablecidas.');
    setErrorMessage(null);
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
                {currentUser && activeTab !== 'config' ? 'Mi Cuenta de Aventurero' : 'Cuentas y Multijugador'}
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
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs font-semibold">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-center transition-all ${
                    activeTab !== 'config'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mi Perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('config');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'config'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Cambiar proyecto o claves de Supabase"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Configurar Supabase</span>
                </button>
              </>
            ) : (
              <>
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
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('config');
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-center transition-all flex items-center gap-1 ${
                    activeTab === 'config'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Configurar proyecto o cambiar claves de Supabase"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Config</span>
                </button>
              </>
            )}
          </div>

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

          {/* VISTA: USUARIO CONECTADO (cuando activeTab no es config) */}
          {currentUser && activeTab !== 'config' ? (
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
                  onClick={() => {
                    setActiveTab('config');
                    setErrorMessage(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all min-h-[44px]"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Cambiar Credenciales / Proyecto Supabase</span>
                </button>
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
              {activeTab === 'login' && !currentUser && (
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
              {activeTab === 'register' && !currentUser && (
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

              {/* TAB 3: CONFIGURACIÓN DE PROYECTO SUPABASE */}
              {activeTab === 'config' && (
                <form onSubmit={handleSaveConfig} className="space-y-4">
                  {/* Tarjeta de ayuda para cambio de cuenta */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-indigo-500/15 border border-amber-500/30 text-slate-200 text-xs leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-200">
                      <Sparkles className="w-4 h-4 text-[#c9a227]" />
                      <span>¿Has cambiado de cuenta o de proyecto en Supabase?</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>
                        Crea un nuevo proyecto en tu cuenta de <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline font-semibold hover:text-amber-200 inline-flex items-center gap-0.5">Supabase <ExternalLink className="w-3 h-3 inline" /></a>.
                      </li>
                      <li>
                        Ve a <strong>SQL Editor</strong> en Supabase, pega el script de tablas y pulsa <strong>Run</strong> (esencial para crónicas, sesiones y fichas).
                      </li>
                      <li>
                        En <strong>Project Settings → API</strong>, copia la <strong>Project URL</strong> y la <strong>anon public key</strong>.
                      </li>
                      <li>Pega ambos códigos aquí abajo y pulsa <strong>Guardar y Conectar</strong>.</li>
                    </ol>
                  </div>

                  {/* Botones de acción rápida para el SQL */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold w-full sm:w-auto sm:mr-auto text-[11px]">
                      <Database className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>Tablas y Políticas RLS:</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-semibold transition-all"
                      title="Copiar el script SQL para ejecutar en el SQL Editor de tu nuevo proyecto Supabase"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">¡Copiado al portapapeles!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copiar Script SQL</span>
                        </>
                      )}
                    </button>

                    <a
                      href="/supabase-schema.sql"
                      download="supabase-schema.sql"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-all"
                      title="Descargar archivo supabase-schema.sql"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Descargar .sql</span>
                    </a>
                  </div>

                  {/* Input Project URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project URL (Supabase)
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        value={supabaseUrl}
                        onChange={(e) => {
                          setSupabaseUrl(e.target.value);
                          setConnectionStatus(null);
                        }}
                        placeholder="https://xyzabcdefghijklmnop.supabase.co"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Encuéntralo en: Supabase → Project Settings → API → Project URL
                    </span>
                  </div>

                  {/* Input Anon Public Key */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Anon / Public Key
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={supabaseAnonKey}
                        onChange={(e) => {
                          setSupabaseAnonKey(e.target.value);
                          setConnectionStatus(null);
                        }}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Encuéntralo en: Supabase → Project Settings → API → Project API keys → anon (public)
                    </span>
                  </div>

                  {/* Estado de prueba de conexión */}
                  {connectionStatus && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                        connectionStatus.ok
                          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                      }`}
                    >
                      {connectionStatus.ok ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{connectionStatus.message}</span>
                    </div>
                  )}

                  {/* Botones de Guardar, Probar y Restablecer */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-all shadow-md min-h-[44px]"
                    >
                      {configSaved ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Guardado! Conectando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-black" />
                          <span>Guardar y Conectar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors min-h-[44px]"
                      title="Verificar que la URL y la Anon Key respondan"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                      <span>{testingConnection ? 'Probando...' : 'Probar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetConfig}
                      className="px-3 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors min-h-[44px]"
                      title="Restablecer credenciales a las variables por defecto"
                    >
                      Restablecer
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
