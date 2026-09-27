import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Trash2, ArrowUpRight } from 'lucide-react';
import { Lugar } from '../types';

interface LugarDeleteModalProps {
  isOpen: boolean;
  lugar: Lugar | null;
  subLugaresCount?: number;
  nombrePadre?: string | null;
  todosLosLugares?: Lugar[];
  onClose: () => void;
  onConfirm: (lugarId: string, cascadeDelete: boolean) => void;
}

export const LugarDeleteModal: React.FC<LugarDeleteModalProps> = ({
  isOpen,
  lugar,
  subLugaresCount,
  nombrePadre,
  todosLosLugares = [],
  onClose,
  onConfirm,
}) => {
  const [deleteOption, setDeleteOption] = useState<'move' | 'cascade'>('move');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lugar) return null;

  const computedSubCount =
    subLugaresCount !== undefined
      ? subLugaresCount
      : todosLosLugares.filter((l) => l.padre_id === lugar.id).length;

  const computedNombrePadre =
    nombrePadre !== undefined
      ? nombrePadre
      : lugar.padre_id
      ? todosLosLugares.find((l) => l.id === lugar.padre_id)?.nombre || null
      : null;

  const hasChildren = computedSubCount > 0;

  return (
    <div
      id="delete-lugar-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="delete-lugar-modal-dialog"
        className="relative w-full max-w-md max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#131b2a] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        {/* Cabecera fija */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg shrink-0 bg-rose-950/60 text-rose-400 border border-rose-900/50">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-amber-100 truncate">
              ¿Eliminar lugar?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <h4 className="font-serif text-base font-bold text-amber-100">
              &quot;{lugar.nombre}&quot;
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Esta acción eliminará la ficha de este lugar de tu bitácora de campaña.
            </p>
          </div>

          {/* Si tiene sub-lugares: Preguntar qué hacer con ellos */}
          {hasChildren && (
            <div className="p-4 rounded-xl bg-[#0e1522] border border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Este lugar contiene {computedSubCount}{' '}
                  {computedSubCount === 1 ? 'sub-lugar' : 'sub-lugares'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecciona qué deseas hacer con los sub-lugares anidados:
              </p>

              <div className="space-y-2 pt-1">
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    deleteOption === 'move'
                      ? 'bg-amber-950/30 border-amber-500/60 text-amber-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="sublugares-action"
                    checked={deleteOption === 'move'}
                    onChange={() => setDeleteOption('move')}
                    className="mt-0.5 accent-[#c9a227]"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>
                        {computedNombrePadre
                          ? `Mover al padre superior ("${computedNombrePadre}")`
                          : 'Mover al nivel raíz (lugares principales)'}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Los sub-lugares se conservarán y subirán de nivel jerárquico.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    deleteOption === 'cascade'
                      ? 'bg-rose-950/30 border-rose-500/60 text-rose-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="sublugares-action"
                    checked={deleteOption === 'cascade'}
                    onChange={() => setDeleteOption('cascade')}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="font-semibold text-rose-300 block flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Eliminar también todos los sub-lugares (en cascada)</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Borrará permanentemente este lugar y todos sus descendientes.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Pie fijo */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(lugar.id, deleteOption === 'cascade')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold bg-rose-700 hover:bg-rose-600 text-white transition-colors shadow-sm min-h-[44px] flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar lugar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

