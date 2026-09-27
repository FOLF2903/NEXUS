import React, { useEffect } from 'react';
import {
  X,
  User,
  Heart,
  Shield,
  Award,
  Sparkles,
  ScrollText,
  FileText,
  Package,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  Download,
} from 'lucide-react';
import { PJ, Objeto, ModoApp } from '../types';
import { ESTADO_PJ_CONFIG } from './PjModal';
import { AccionesMenu } from './AccionesMenu';
import { DmNotesSection } from './DmNotesSection';
import { exportSingleEntity } from '../utils/exportImport';

interface PjDetailModalProps {
  pj: PJ | null;
  isOpen: boolean;
  objetos?: Objeto[];
  modoApp?: ModoApp;
  onClose: () => void;
  onEdit: (pj: PJ) => void;
  onDelete: (pj: PJ) => void;
  onUpdatePj?: (updatedPj: PJ) => void;
  onSelectObjeto?: (objeto: Objeto) => void;
}

export const PjDetailModal: React.FC<PjDetailModalProps> = ({
  pj,
  isOpen,
  objetos = [],
  modoApp = 'jugador',
  onClose,
  onEdit,
  onDelete,
  onUpdatePj,
  onSelectObjeto,
}) => {
  if (!isOpen || !pj) return null;

  const estadoCfg = ESTADO_PJ_CONFIG[pj.estado] || ESTADO_PJ_CONFIG.activo;
  const objetosQueLleva = objetos.filter(
    (obj) =>
      obj.quien_lo_lleva &&
      obj.quien_lo_lleva.toLowerCase().trim() === pj.nombre.toLowerCase().trim()
  );

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

  const handleSaveDmNotes = (newNotasDm: string) => {
    if (onUpdatePj) {
      onUpdatePj({
        ...pj,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleExportPj = () => {
    exportSingleEntity('pj', pj, {});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90dvh] md:max-h-[90vh] flex flex-col bg-[#111827] border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera fija */}
        <div className="px-5 sm:px-6 py-4 border-b border-amber-900/30 bg-[#0d121d] flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${estadoCfg.bg} ${estadoCfg.text} ${estadoCfg.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${estadoCfg.dot}`} />
                {estadoCfg.label}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/40 text-amber-300 border border-amber-800/40">
                <Award className="w-3.5 h-3.5 text-[#c9a227]" />
                Nivel {pj.nivel}
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              {pj.nombre}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              <span className="font-medium text-slate-200">{pj.raza}</span>
              <span className="mx-2 text-slate-600">•</span>
              <span className="font-medium text-amber-300/90">{pj.clase}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(pj);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-semibold transition-colors border border-slate-700 min-h-[44px]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <AccionesMenu
              buttonId="pj-more-actions-btn"
              title="Opciones del personaje"
              items={[
                {
                  id: 'exportar-pj',
                  label: 'Exportar Personaje',
                  descripcion: 'Descargar datos del PJ en archivo JSON',
                  icon: <Download className="w-4 h-4" />,
                  onClick: handleExportPj,
                },
                {
                  id: 'eliminar-pj',
                  label: 'Eliminar Personaje',
                  descripcion: 'Borrar permanentemente este PJ de la campaña',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => {
                    onClose();
                    onDelete(pj);
                  },
                  variant: 'danger',
                },
              ]}
            />

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Bloque de Combate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-900/40">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold text-slate-400">Puntos de Golpe</div>
                <div className="text-xl font-mono font-bold text-rose-300">{pj.pg_max} PG</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-950/60 text-sky-400 border border-sky-900/40">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold text-slate-400">Armadura</div>
                <div className="text-xl font-mono font-bold text-sky-300">{pj.ca} CA</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/60 text-[#c9a227] border border-amber-900/40">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold text-slate-400">Rango / Nivel</div>
                <div className="text-xl font-mono font-bold text-amber-200">Nvl {pj.nivel}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-900/40">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold text-slate-400">Objetos</div>
                <div className="text-xl font-mono font-bold text-purple-300">{objetosQueLleva.length}</div>
              </div>
            </div>
          </div>

          {/* Inventario / Objetos asignados */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#c9a227]" />
              <span>Objetos que lleva ({objetosQueLleva.length})</span>
            </h3>
            {objetosQueLleva.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {objetosQueLleva.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => {
                      if (onSelectObjeto) {
                        onClose();
                        onSelectObjeto(obj);
                      }
                    }}
                    className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2 ${
                      onSelectObjeto ? 'hover:border-[#c9a227]/60 hover:bg-slate-900 cursor-pointer' : ''
                    } transition-all`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-amber-200">{obj.nombre}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide font-mono mt-0.5">
                        {obj.tipo}
                      </div>
                      {obj.efecto_conocido && (
                        <div className="text-xs text-emerald-400/90 mt-1 line-clamp-1">
                          {obj.efecto_conocido}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-900/30 p-3 rounded-xl border border-slate-800">
                Este personaje actualmente no tiene objetos o armas asignadas en el inventario de la bitácora.
              </p>
            )}
          </div>

          {/* Descripción Física */}
          {pj.descripcion && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Descripción Física</span>
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line">
                {pj.descripcion}
              </p>
            </div>
          )}

          {/* Personalidad */}
          {pj.personalidad && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Personalidad, Ideales & Rasgos</span>
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line">
                {pj.personalidad}
              </p>
            </div>
          )}

          {/* Trasfondo */}
          {pj.trasfondo && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ScrollText className="w-4 h-4 text-amber-400" />
                <span>Trasfondo & Origen</span>
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line">
                {pj.trasfondo}
              </p>
            </div>
          )}

          {/* Notas y Secretos */}
          {pj.notas && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Notas de Campaña / Objetivos</span>
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line">
                {pj.notas}
              </p>
            </div>
          )}

          {/* Sección privada de Notas del DM */}
          <DmNotesSection
            modoApp={modoApp}
            notasDm={pj.notas_dm}
            onSaveNotasDm={handleSaveDmNotes}
            entityName={pj.nombre}
          />

          {/* Etiquetas */}
          {pj.etiquetas && pj.etiquetas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Etiquetas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pj.etiquetas.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
