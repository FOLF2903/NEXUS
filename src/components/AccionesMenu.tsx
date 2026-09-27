import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface AccionesMenuItem {
  id: string;
  label: string;
  descripcion?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

interface AccionesMenuProps {
  items: AccionesMenuItem[];
  triggerLabel?: string;
  align?: 'left' | 'right';
  buttonId?: string;
  menuId?: string;
  title?: string;
}

export const AccionesMenu: React.FC<AccionesMenuProps> = ({
  items,
  triggerLabel,
  align = 'right',
  buttonId = 'acciones-menu-btn',
  menuId = 'acciones-menu-dropdown',
  title = 'Más opciones',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al presionar Escape o clic fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (items.length === 0) return null;

  return (
    <div className="relative inline-block text-left shrink-0" ref={menuRef}>
      {/* Botón trigger */}
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        aria-label={title}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border text-xs font-semibold transition-all min-h-[44px] min-w-[44px] select-none ${
          isOpen
            ? 'bg-amber-500/20 border-amber-500/70 text-amber-200 ring-1 ring-amber-500/40 shadow-xs'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-amber-200 hover:bg-slate-800'
        }`}
      >
        <MoreVertical className="w-4 h-4 shrink-0" />
        {triggerLabel && (
          <span className="hidden sm:inline text-xs font-medium">{triggerLabel}</span>
        )}
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <>
          {/* Backdrop sutil en móviles */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/20"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            id={menuId}
            className={`absolute ${
              align === 'right' ? 'right-0' : 'left-0'
            } mt-2 w-56 sm:w-64 rounded-xl bg-[#131b2a] border border-amber-900/60 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-200`}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="space-y-1">
              {items.map((item) => {
                const isDanger = item.variant === 'danger';
                const isSuccess = item.variant === 'success';

                return (
                  <button
                    key={item.id}
                    id={`accion-item-${item.id}`}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick();
                    }}
                    role="menuitem"
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors min-h-[44px] ${
                      isDanger
                        ? 'text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 active:bg-rose-950/60'
                        : isSuccess
                        ? 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/40 active:bg-emerald-950/60'
                        : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/80 active:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 flex items-center justify-center shrink-0 ${
                        isDanger
                          ? 'text-rose-400'
                          : isSuccess
                          ? 'text-emerald-400'
                          : 'text-[#c9a227]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-semibold">{item.label}</span>
                      {item.descripcion && (
                        <span className="block text-[10px] text-slate-400 truncate">
                          {item.descripcion}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
