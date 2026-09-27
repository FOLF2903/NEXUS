import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCredentials, StorageDataSource } from '../types/supabase';

// ==============================================================================
// CONFIGURACIÓN CENTRAL DE SUPABASE (MODIFICAR AQUÍ)
// ==============================================================================
// Aquí se configuran los códigos de conexión de tu nueva cuenta de Supabase.
// Los usuarios finales no necesitan configurar nada en la interfaz.
export const SUPABASE_CONFIG: SupabaseCredentials = {
  url: 'https://witbwpeohxuzfyngszzr.supabase.co',
  anonKey: 'sb_publishable_MPZUsEoDvOh-3hMS88dvDA_HAyupD7Q',
};

const STORAGE_KEY_SUPABASE_CONFIG = 'bitacora_supabase_credentials';
const STORAGE_KEY_DATA_SOURCE = 'bitacora_data_source';

let supabaseInstance: SupabaseClient | null = null;
let currentConfigString = '';

/**
 * Obtiene las credenciales actuales de Supabase (desde constantes de código o env)
 */
export function getSupabaseCredentials(): SupabaseCredentials {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey && !envUrl.includes('tu-proyecto')) {
    return { url: envUrl, anonKey: envKey };
  }

  if (
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.url.includes('TU_NUEVO_PROYECTO') &&
    !SUPABASE_CONFIG.url.includes('tu-proyecto')
  ) {
    return { url: SUPABASE_CONFIG.url, anonKey: SUPABASE_CONFIG.anonKey };
  }

  return { url: SUPABASE_CONFIG.url, anonKey: SUPABASE_CONFIG.anonKey };
}

/**
 * Guarda credenciales manuales en localStorage
 */
export function saveSupabaseCredentials(creds: SupabaseCredentials): void {
  try {
    if (creds.url && creds.anonKey) {
      localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(creds));
    } else {
      localStorage.removeItem(STORAGE_KEY_SUPABASE_CONFIG);
    }
    // Forzar recreación del cliente
    supabaseInstance = null;
    currentConfigString = '';
  } catch (err) {
    console.error('Error guardando credenciales de Supabase:', err);
  }
}

/**
 * Comprueba si hay credenciales válidas configuradas
 */
export function isSupabaseConfigured(): boolean {
  const creds = getSupabaseCredentials();
  return Boolean(
    creds.url &&
    creds.anonKey &&
    creds.url.startsWith('https://') &&
    creds.anonKey.length > 20
  );
}

/**
 * Obtiene o crea el cliente Supabase
 */
export function getSupabase(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.anonKey) {
    return null;
  }

  const configKey = `${creds.url}_${creds.anonKey}`;
  if (supabaseInstance && currentConfigString === configKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    currentConfigString = configKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Error al inicializar cliente Supabase:', err);
    return null;
  }
}

/**
 * Modo de origen de datos: 'local' (Demo offline) o 'cloud' (Supabase multijugador)
 */
export function getStorageMode(): StorageDataSource {
  try {
    const mode = localStorage.getItem(STORAGE_KEY_DATA_SOURCE) as StorageDataSource | null;
    if (mode === 'cloud' || mode === 'local') {
      return mode;
    }
  } catch {
    // fallback
  }
  // Por defecto 'local' a menos que haya sesión activa en Supabase
  return 'local';
}

export function setStorageMode(mode: StorageDataSource): void {
  try {
    localStorage.setItem(STORAGE_KEY_DATA_SOURCE, mode);
  } catch {
    // ignorar
  }
}
