import React, { useState, useEffect } from 'react';
import { Shield, Lock, Save, Check, Edit2 } from 'lucide-react';
import { ModoApp } from '../types';

interface DmNotesSectionProps {
  modoApp: ModoApp;
  notasDm?: string;
  onSaveNotasDm?: (newNotasDm: string) => void;
  entityName?: string;
}

export const DmNotesSection: React.FC<DmNotesSectionProps> = ({
  modoApp,
  notasDm = '',
  onSaveNotasDm,
  entityName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(notasDm);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setText(notasDm || '');
  }, [notasDm]);

  const handleSave = () => {
    if (onSaveNotasDm) {
      onSaveNotasDm(text);
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // En Modo Jugador, NO se renderiza nada
  if (modoApp !== 'dm') {
    return null;
  }

  return (
    <div className="p-5 rounded-2xl bg-[#0f141f] border-2 border-amber-600/60 shadow-lg shadow-amber-950/30 relative overflow-hidden">
      {/* Glow de ambientación DM */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Cabecera de la sección DM */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Shield className="w-4 h-4 text-[#c9a227]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>Notas Secretas del DM</span>
              <Lock className="w-3 h-3 text-amber-400/80" />
            </h4>
            <p className="text-[11px] text-amber-200/60">
              Información privada invisible para los jugadores en Modo Jugador
            </p>
          </div>
        </div>

        {onSaveNotasDm && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/60 text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            <span>Editar notas</span>
          </button>
        )}
      </div>

      {/* Contenido / Editor */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Apunta aquí secretos, planes de futuro, verdades ocultas, estadísticas de combate o notas privadas para esta entidad..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-600/70 text-amber-100 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-200/30 font-sans"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setText(notasDm || '');
                setIsEditing(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black text-xs font-bold transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar notas</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          {savedSuccess && (
            <div className="mb-2 text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Notas del DM actualizadas correctamente</span>
            </div>
          )}

          {text && text.trim() ? (
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-950/60 text-xs text-amber-100/90 leading-relaxed font-sans whitespace-pre-wrap">
              {text}
            </div>
          ) : (
            <p className="text-xs italic text-amber-200/50 py-1">
              Sin notas privadas del DM para {entityName || 'esta entidad'}. Haz clic en "Editar notas" para registrar detalles secretos.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
