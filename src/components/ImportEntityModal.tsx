import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileCheck,
  AlertTriangle,
  FileText,
  Shield,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { SingleEntityType, SingleEntityExport, Sesion } from '../types';
import { generateUUID } from '../services/supabaseService';

interface ImportEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: SingleEntityType;
  campanaId: string;
  campanaNombre: string;
  existingSessions: Sesion[];
  onConfirmImport: (type: SingleEntityType, entity: any, ignoredReferences: string[]) => void;
}

const TIPO_LABELS: Record<SingleEntityType, string> = {
  npc: 'NPC',
  lugar: 'Lugar',
  mision: 'Misión',
  objeto: 'Objeto',
  monstruo: 'Monstruo',
  pj: 'Personaje Jugador (PJ)',
  sesion: 'Sesión',
};

export const ImportEntityModal: React.FC<ImportEntityModalProps> = ({
  isOpen,
  onClose,
  targetType,
  campanaId,
  campanaNombre,
  existingSessions,
  onConfirmImport,
}) => {
  const [fileContent, setFileContent] = useState<SingleEntityExport | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [ignoredRefs, setIgnoredRefs] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFileContent(null);
    setFileName('');
    setError(null);
    setIgnoredRefs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processJson = (rawText: string, name: string) => {
    setError(null);
    setIgnoredRefs([]);
    try {
      const parsed = JSON.parse(rawText);

      // Validar tipo de JSON
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('El archivo no contiene un objeto JSON válido.');
      }

      // Si es un export con envoltorio de entidad
      let entityData: any = parsed.entidad || parsed;
      const detectedType: SingleEntityType = (parsed.tipo as SingleEntityType) || targetType || 'npc';

      if (targetType && parsed.tipo && parsed.tipo !== targetType) {
        throw new Error(
          `El archivo contiene un ${TIPO_LABELS[parsed.tipo as SingleEntityType] || parsed.tipo}, pero este listado es para importar ${TIPO_LABELS[targetType]}.`
        );
      }

      // Validar campos mínimos
      if (detectedType === 'sesion') {
        if (entityData.numero === undefined && !entityData.titulo) {
          throw new Error('El archivo no contiene los datos requeridos de una Sesión.');
        }
      } else {
        if (!entityData.nombre && !entityData.titulo) {
          throw new Error(
            `El archivo no contiene un nombre o título válido para un ${TIPO_LABELS[detectedType]}.`
          );
        }
      }

      // Verificar referencias a sesiones
      const rawSessionRefs: string[] =
        parsed.referencias?.sesion_ids || entityData.sesion_ids || [];
      const currentSessionIds = new Set(existingSessions.map((s) => s.id));
      const ignored: string[] = [];

      rawSessionRefs.forEach((refId) => {
        if (!currentSessionIds.has(refId)) {
          ignored.push(refId);
        }
      });

      const structuredPayload: SingleEntityExport = {
        tipo: detectedType,
        version: parsed.version || '1.0',
        exportado_en: parsed.exportado_en || new Date().toISOString(),
        entidad: entityData,
        referencias: {
          sesion_ids: rawSessionRefs,
        },
      };

      setFileContent(structuredPayload);
      setFileName(name);
      setIgnoredRefs(ignored);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo JSON.');
      setFileContent(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processJson(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processJson(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirm = () => {
    if (!fileContent) return;

    const baseEntity = fileContent.entidad;
    const effectiveType = fileContent.tipo;
    const newId = generateUUID();

    // Filtrar sesiones que sí existan en la campaña actual
    const currentSessionIds = new Set(existingSessions.map((s) => s.id));
    const rawSessions: string[] =
      fileContent.referencias?.sesion_ids || baseEntity.sesion_ids || [];
    const validSessions = rawSessions.filter((id) => currentSessionIds.has(id));

    const finalEntity = {
      ...baseEntity,
      id: newId,
      campana_id: campanaId,
      sesion_ids: validSessions,
      creado_en: new Date().toISOString(),
    };

    onConfirmImport(effectiveType, finalEntity, ignoredRefs);
    handleClose();
  };

  const renderEntityPreview = () => {
    if (!fileContent) return null;
    const ent = fileContent.entidad;
    const currentType = fileContent.tipo;
    const nombre = ent.nombre || ent.titulo || `Sesión #${ent.numero}`;

    return (
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/50">
              {TIPO_LABELS[currentType]} detectado
            </span>
            <h4 className="font-serif text-lg font-bold text-amber-100 mt-1">
              {nombre}
            </h4>
          </div>
          <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
        </div>

        {/* Resumen de campos característicos según el tipo */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
          {currentType === 'npc' && (
            <>
              <div><strong className="text-slate-400">Rol:</strong> {ent.rol || 'No especificado'}</div>
              <div><strong className="text-slate-400">Actitud:</strong> {ent.actitud || 'Neutral'}</div>
            </>
          )}
          {currentType === 'lugar' && (
            <>
              <div><strong className="text-slate-400">Tipo:</strong> {ent.tipo || 'Lugar'}</div>
              <div><strong className="text-slate-400">Estado:</strong> {ent.estado || 'Visitado'}</div>
            </>
          )}
          {currentType === 'mision' && (
            <>
              <div><strong className="text-slate-400">Estado:</strong> {ent.estado || 'Activa'}</div>
              <div><strong className="text-slate-400">Pasos:</strong> {ent.pasos?.length || 0} pasos</div>
            </>
          )}
          {currentType === 'objeto' && (
            <>
              <div><strong className="text-slate-400">Tipo:</strong> {ent.tipo || 'Objeto'}</div>
              <div><strong className="text-slate-400">Portador:</strong> {ent.quien_lo_lleva || 'En el alijo'}</div>
            </>
          )}
          {currentType === 'monstruo' && (
            <>
              <div><strong className="text-slate-400">Tipo:</strong> {ent.tipo || 'Monstruo'}</div>
              <div><strong className="text-slate-400">Encuentros:</strong> {ent.veces_encontrado || 1}</div>
            </>
          )}
          {currentType === 'pj' && (
            <>
              <div><strong className="text-slate-400">Clase/Raza:</strong> {ent.raza} {ent.clase}</div>
              <div><strong className="text-slate-400">Nivel / PG:</strong> Nvl {ent.nivel || 1} • {ent.pg_max || 10} PG</div>
            </>
          )}
          {currentType === 'sesion' && (
            <>
              <div><strong className="text-slate-400">Número:</strong> #{ent.numero}</div>
              <div><strong className="text-slate-400">Fecha:</strong> {ent.fecha_real || 'Sin fecha'}</div>
            </>
          )}
        </div>

        {/* Indicador de notas DM */}
        {ent.notas_dm && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-900/40">
            <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Incluye notas secretas del DM</span>
          </div>
        )}

        {/* Advertencia de referencias ignoradas */}
        {ignoredRefs.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-950/50 p-2.5 rounded-lg border border-amber-800/50">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                Referencias a sesiones no encontradas en {campanaNombre}:
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Se omitirán {ignoredRefs.length} vinculación(es) a sesiones que no existen en esta campaña.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-[#111827] border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0d121d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#c9a227]" />
            <h3 className="font-serif text-lg font-bold text-amber-100">
              Importar {targetType ? TIPO_LABELS[targetType] : 'Elemento'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecciona un archivo JSON exportado previamente para incorporarlo a la campaña{' '}
            <strong className="text-amber-200">{campanaNombre}</strong>. Se le asignará un ID nuevo para evitar colisiones.
          </p>

          {!fileContent ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-950/20 scale-[0.99]'
                  : 'border-slate-700 hover:border-amber-700/60 bg-slate-900/40 hover:bg-slate-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-200">
                Arrastra o haz clic para elegir el archivo JSON
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Archivos con formato <code className="text-amber-300">{targetType}_*.json</code>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="truncate max-w-[280px] font-mono text-amber-300">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-amber-300 underline"
                >
                  Cambiar archivo
                </button>
              </div>

              {renderEntityPreview()}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-900/60 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Pie / Acciones */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0d121d] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!fileContent}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold transition-all shadow-md shadow-amber-950/40"
          >
            Confirmar e Importar
          </button>
        </div>
      </div>
    </div>
  );
};
