import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Copy,
  Check,
  Shield,
  Users,
  AlertCircle,
  Share2,
  CloudUpload,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  createCampaignInvite,
  fetchCampaignInvites,
  isUUID,
} from '../services/supabaseService';
import { CampaignInvite } from '../types/supabase';
import { User } from '@supabase/supabase-js';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName: string;
  onUploadCampaignToCloud?: () => Promise<string | null>;
  onRequestAuth?: () => void;
  currentUser?: User | null;
  storageMode?: 'local' | 'cloud';
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignName,
  onUploadCampaignToCloud,
  onRequestAuth,
  currentUser,
  storageMode = 'local',
}) => {
  const [currentCampaignId, setCurrentCampaignId] = useState(campaignId);
  const [role, setRole] = useState<'player' | 'dm'>('player');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [currentLink, setCurrentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLocalCampaign = !isUUID(currentCampaignId) || storageMode === 'local';

  useEffect(() => {
    if (!isOpen) return;
    setCurrentCampaignId(campaignId);
    setError(null);
    setSuccessMsg(null);
    setCurrentLink(null);
    setCopied(false);

    if (isUUID(campaignId)) {
      fetchCampaignInvites(campaignId).then(setInvites);
    } else {
      setInvites([]);
    }
  }, [isOpen, campaignId]);

  const handleUploadAndInvite = async () => {
    if (!currentUser) {
      if (onRequestAuth) onRequestAuth();
      return;
    }

    if (!onUploadCampaignToCloud) {
      setError('Función de subida a la nube no disponible.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const newUuid = await onUploadCampaignToCloud();
      if (!newUuid) {
        setError('No se pudo subir la campaña a la nube. Comprueba tu conexión con Supabase.');
        setUploading(false);
        return;
      }

      setCurrentCampaignId(newUuid);
      setSuccessMsg('¡Campaña subida con éxito a Supabase! Generando enlace...');

      // Generar invitación con el nuevo UUID
      const { invite, error: invError } = await createCampaignInvite(newUuid, role);
      setUploading(false);

      if (invError || !invite) {
        setError(invError || 'Error al generar enlace tras subir la campaña.');
        return;
      }

      const fullUrl = `${window.location.origin}/?token=${invite.token}`;
      setCurrentLink(fullUrl);
      setInvites((prev) => [invite, ...prev]);

      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Ignorar fallo de portapapeles
      }
    } catch (err: any) {
      setError(err?.message || 'Error al subir la campaña.');
      setUploading(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (isLocalCampaign) {
      await handleUploadAndInvite();
      return;
    }

    setLoading(true);
    setError(null);

    const { invite, error: invError } = await createCampaignInvite(currentCampaignId, role);
    setLoading(false);

    if (invError || !invite) {
      setError(invError || 'Error al generar enlace de invitación');
      return;
    }

    const fullUrl = `${window.location.origin}/?token=${invite.token}`;
    setCurrentLink(fullUrl);
    setInvites((prev) => [invite, ...prev]);

    // Copiar automáticamente al portapapeles
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignorar fallo de portapapeles
    }
  };

  const handleCopyExisting = async (token: string) => {
    const fullUrl = `${window.location.origin}/?token=${token}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#111827] border border-amber-900/60 shadow-2xl p-5 sm:p-6 text-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#c9a227]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                Invitar a la Campaña
              </h2>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                {campaignName}
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

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Banner informativo si la campaña es local */}
        {isLocalCampaign && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <CloudUpload className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-amber-100">
                  Campaña en Modo Local ({currentCampaignId})
                </h4>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Esta campaña está guardada únicamente en la memoria de este navegador. Para que otros aventureros puedan acceder mediante un enlace de invitación y sincronizar tiradas y notas en tiempo real, debe subirse a la <strong>Nube de Supabase</strong>.
                </p>
              </div>
            </div>

            {!currentUser ? (
              <button
                type="button"
                onClick={() => {
                  if (onRequestAuth) onRequestAuth();
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors min-h-[40px]"
              >
                <Lock className="w-4 h-4" />
                <span>Inicia sesión o regístrate para subir a la Nube</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUploadAndInvite}
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs shadow-md transition-colors min-h-[40px]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo campaña y elementos a Supabase...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>Subir a Supabase y Generar Enlace de Invitación</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Generador de Invitación */}
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Rol del Aventurero Invitado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  role === 'player'
                    ? 'bg-amber-500/20 border-amber-500/70 text-amber-100 ring-1 ring-amber-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold">Jugador (Player)</span>
                  <span className="block text-[10px] text-slate-400">Ve la campaña y gestiona su PJ</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('dm')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  role === 'dm'
                    ? 'bg-amber-500/20 border-amber-500/70 text-amber-100 ring-1 ring-amber-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold">Co-Master (DM)</span>
                  <span className="block text-[10px] text-slate-400">Edición completa de trama y notas</span>
                </div>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateInvite}
            disabled={loading || uploading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-all shadow-md min-h-[44px]"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Subiendo campaña a la nube...</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando token seguro...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>
                  {isLocalCampaign
                    ? 'Subir a la Nube y Generar Enlace'
                    : 'Generar y Copiar Enlace de Invitación'}
                </span>
              </>
            )}
          </button>

          {/* Enlace generado recientemente */}
          {currentLink && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 animate-in fade-in duration-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span>Enlace de invitación generado (expira en 7 días):</span>
                {copied && (
                  <span className="text-emerald-400 inline-flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" /> ¡Copiado al portapapeles!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentLink}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-slate-700 text-slate-200 text-xs font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors shrink-0"
                  title="Copiar enlace"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Historial de invitaciones activas */}
          {invites.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Invitaciones pendientes ({invites.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-semibold">
                        Rol: {inv.role === 'dm' ? '🎲 DM' : '👥 Jugador'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {inv.token.slice(0, 10)}...
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyExisting(inv.token)}
                      className="p-1.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                      title="Copiar enlace"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
