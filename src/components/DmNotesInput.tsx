import React, { useState } from 'react';
import { Shield, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { ModoApp } from '../types';

interface DmNotesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  modoApp?: ModoApp;
}

export const DmNotesInput: React.FC<DmNotesInputProps> = ({
  value,
  onChange,
  placeholder = 'Secretos, intenciones, tiradas ocultas, consecuencias pendientes o notas privadas del DM...',
  modoApp,
}) => {
  const [isOpen, setIsOpen] = useState(Boolean(value && value.trim()) || modoApp === 'dm');

  return (
    <div className="rounded-xl border border-amber-800/60 bg-[#0d131f] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left bg-amber-950/30 hover:bg-amber-950/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#c9a227]" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Notas Secretas del DM (Privadas)
          </span>
          {value && value.trim() && (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Contiene notas privadas" />
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
          <span className="text-[11px] hidden sm:inline">
            {isOpen ? 'Ocultar' : 'Desplegar'}
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-3 space-y-2 border-t border-amber-900/30">
          <p className="text-[11px] text-amber-200/60 leading-relaxed">
            Este contenido solo será visible cuando la aplicación se encuentre en <strong>Modo DM</strong>.
            Los jugadores no podrán verlo en Modo Jugador.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-amber-800/70 text-amber-100 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-200/30 font-sans"
          />
        </div>
      )}
    </div>
  );
};
