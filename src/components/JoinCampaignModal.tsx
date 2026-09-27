import React, { useState, useEffect } from 'react';
import { X, Sparkles, LogIn, Check, AlertCircle, ArrowRight, Key } from 'lucide-react';
import { acceptCampaignInvite, getCurrentUser } from '../services/supabaseService';
import { User } from '@supabase/supabase-js';

interface JoinCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  onSuccess: (campaignId: string) => void;
  onRequestAuth: () => void;
}

export const JoinCampaignModal: React.FC<JoinCampaignModalProps> = ({
  isOpen,
  onClose,
  initialToken = '',
  onSuccess,
  onRequestAuth,
}) => {
  const [token, setToken] = useState(initialToken);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setToken(initialToken);
    setError(null);
    setSuccess(false);
    getCurrentUser().then(setCurrentUser);
  }, [isOpen, initialToken]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    if (!currentUser) {
      setError('Debes iniciar sesión con tu cuenta antes de unirte a la campaña.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await acceptCampaignInvite(token.trim());
    setLoading(false);

    if (result.success && result.campaignId) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess(result.campaignId!);
        onClose();
      }, 1000);
    } else {
      setError(result.error || 'La invitación no es válida o ya ha expirado.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#111827] border border-amber-900/60 shadow-2xl p-5 sm:p-6 text-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#c9a227]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                Unirse a una Campaña
              </h2>
              <p className="text-[11px] text-slate-400">
                Introduce el código o enlace de invitación
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

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>¡Te has unido exitosamente a la campaña! Abriendo...</span>
          </div>
        )}

        {!currentUser ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#c9a227] mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Para unirte a una campaña compartida necesitas tener una cuenta en la aplicación.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestAuth();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-all shadow-md min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarme</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Token o Código de Invitación
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega aquí el token (ej. 8a7f9b2c4e...)"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim() || success}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-all shadow-md min-h-[44px]"
            >
              <span>{loading ? 'Comprobando invitación...' : 'Entrar a la Campaña'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
