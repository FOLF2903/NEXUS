import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Crown,
  UserPlus,
  Trash2,
  Check,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  fetchCampaignMembers,
  updateMemberRole,
  removeMember,
  getCurrentUser,
} from '../services/supabaseService';
import { CampaignMember, SupabaseRole } from '../types/supabase';
import { ConfirmModal } from './ConfirmModal';

interface MiembrosTabProps {
  campaignId: string;
  campaignName: string;
  currentUserRole: SupabaseRole;
  isHost: boolean;
  onOpenInvite: () => void;
}

export const MiembrosTab: React.FC<MiembrosTabProps> = ({
  campaignId,
  campaignName,
  currentUserRole,
  isHost,
  onOpenInvite,
}) => {
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberToKick, setMemberToKick] = useState<CampaignMember | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    const [data, user] = await Promise.all([
      fetchCampaignMembers(campaignId),
      getCurrentUser(),
    ]);
    setMembers(data);
    if (user) setCurrentUserId(user.id);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [campaignId]);

  const handleChangeRole = async (userId: string, newRole: 'dm' | 'player') => {
    setActionError(null);
    const { success, error } = await updateMemberRole(campaignId, userId, newRole);
    if (success) {
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
      );
    } else {
      setActionError(error || 'Error al actualizar rol');
    }
  };

  const handleConfirmKick = async () => {
    if (!memberToKick) return;
    setActionError(null);
    const { success, error } = await removeMember(campaignId, memberToKick.user_id);
    if (success) {
      setMembers((prev) => prev.filter((m) => m.user_id !== memberToKick.user_id));
      setMemberToKick(null);
    } else {
      setActionError(error || 'Error al expulsar miembro');
    }
  };

  const canManageRoles = isHost;
  const canInvite = isHost || currentUserRole === 'dm';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera de la sección */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 rounded-2xl bg-[#111827] border border-amber-900/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#c9a227]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-amber-100">
              Miembros de la Mesa ({members.length})
            </h2>
            <p className="text-xs text-slate-400">
              Aventureros y DMs con acceso a {campaignName}
            </p>
          </div>
        </div>

        {canInvite && (
          <button
            type="button"
            id="invite-member-btn"
            onClick={onOpenInvite}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs shadow-md transition-all min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invitar Aventurero</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Lista de Miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Cargando miembros de la campaña...
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No hay miembros registrados en esta campaña aún.
          </div>
        ) : (
          members.map((member) => {
            const isSelf = member.user_id === currentUserId;
            const isMemberHost = member.role === 'host';
            const name = member.profile?.display_name || 'Aventurero Anónimo';

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-slate-950 font-serif font-bold text-sm shrink-0">
                    {name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-slate-100 truncate">
                        {name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Tú
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Unido el {new Date(member.joined_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Badge de Rol o Selector para el Host */}
                  {canManageRoles && !isMemberHost ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleChangeRole(member.user_id, e.target.value as 'dm' | 'player')
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-200 cursor-pointer focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="player">👥 Jugador</option>
                      <option value="dm">🎲 Co-DM</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        member.role === 'host'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : member.role === 'dm'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {member.role === 'host' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      {member.role === 'dm' && <Shield className="w-3.5 h-3.5 text-indigo-400" />}
                      {member.role === 'host'
                        ? 'Host'
                        : member.role === 'dm'
                        ? 'DM'
                        : 'Jugador'}
                    </span>
                  )}

                  {/* Botón de Expulsar (Solo Host, no a sí mismo) */}
                  {canManageRoles && !isMemberHost && !isSelf && (
                    <button
                      type="button"
                      onClick={() => setMemberToKick(member)}
                      title="Expulsar de la campaña"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de confirmación para expulsar */}
      {memberToKick && (
        <ConfirmModal
          isOpen={Boolean(memberToKick)}
          onCancel={() => setMemberToKick(null)}
          onConfirm={handleConfirmKick}
          title={`¿Expulsar a "${memberToKick.profile?.display_name || 'este miembro'}"?`}
          message="Este aventurero perderá el acceso a la campaña y no podrá ver ni editar sus datos a menos que sea invitado nuevamente."
          confirmText="Expulsar de la mesa"
          isDangerous={true}
        />
      )}
    </div>
  );
};
