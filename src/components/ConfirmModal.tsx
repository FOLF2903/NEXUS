import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  isDangerous,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const destructive = isDangerous !== undefined ? isDangerous : isDestructive;

  return (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        id="confirm-modal-dialog"
        className="relative w-full max-w-md max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#131b2a] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        {/* Cabecera fija */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                destructive
                  ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                  : 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="confirm-modal-title" className="font-serif text-lg font-bold text-amber-100 tracking-wide line-clamp-1">
              {title}
            </h3>
          </div>
          <button
            id="confirm-modal-close"
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <p id="confirm-modal-desc" className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Pie fijo */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center"
          >
            {cancelText}
          </button>
          <button
            id="confirm-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm min-h-[44px] flex items-center justify-center ${
              destructive
                ? 'bg-rose-700 hover:bg-rose-600 text-white'
                : 'bg-[#c9a227] hover:bg-[#dbb333] text-black'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

