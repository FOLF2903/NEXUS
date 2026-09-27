import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileCheck,
  AlertTriangle,
  BookOpen,
  Calendar,
  Users,
  MapPin,
  Scroll,
  Gift,
  Skull,
  Shield,
} from 'lucide-react';
import { CampanaExport } from '../types';

interface ImportCampanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (data: CampanaExport) => void;
}

export const ImportCampanaModal: React.FC<ImportCampanaModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
}) => {
  const [fileData, setFileData] = useState<CampanaExport | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFileData(null);
    setFileName('');
    setError(null);
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
    try {
      const parsed = JSON.parse(rawText);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('El archivo no contiene un JSON válido.');
      }

      // Validar que tenga estructura de campaña
      const campanaObj = parsed.campana || (parsed.nombre && parsed.sistema ? parsed : null);

      if (!campanaObj || !campanaObj.nombre) {
        throw new Error(
          'El archivo no parece ser una campaña válida de Bitácora (falta el objeto campana con nombre).'
        );
      }

      const structuredPayload: CampanaExport = {
        tipo: 'campana',
        version: parsed.version || '1.0',
        exportado_en: parsed.exportado_en || new Date().toISOString(),
        campana: campanaObj,
        sesiones: Array.isArray(parsed.sesiones) ? parsed.sesiones : [],
        npcs: Array.isArray(parsed.npcs) ? parsed.npcs : [],
        lugares: Array.isArray(parsed.lugares) ? parsed.lugares : [],
        misiones: Array.isArray(parsed.misiones) ? parsed.misiones : [],
        objetos: Array.isArray(parsed.objetos) ? parsed.objetos : [],
        monstruos: Array.isArray(parsed.monstruos) ? parsed.monstruos : [],
        pjs: Array.isArray(parsed.pjs) ? parsed.pjs : [],
      };

      setFileData(structuredPayload);
      setFileName(name);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo de campaña.');
      setFileData(null);
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
    if (!fileData) return;
    onConfirmImport(fileData);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-[#111827] border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0d121d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c9a227]" />
            <h3 className="font-serif text-lg font-bold text-amber-100">
              Importar Campaña Completa
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
            Sube un archivo de campaña en formato JSON exportado previamente. Se importará como una
            nueva crónica con IDs remapeados para conservar todas las vinculaciones sin alterar tus campañas existentes.
          </p>

          {!fileData ? (
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
              <Upload className="w-9 h-9 text-[#c9a227] mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-200">
                Arrastra o haz clic para seleccionar la campaña JSON
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Archivos con formato <code className="text-amber-300">campana_*.json</code>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="truncate max-w-[300px] font-mono text-amber-300">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-amber-300 underline"
                >
                  Elegir otro archivo
                </button>
              </div>

              {/* Previsualización de la Campaña */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-900/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/50">
                      {fileData.campana.sistema || 'D&D 5e'}
                    </span>
                    <h4 className="font-serif text-xl font-bold text-amber-100 mt-1">
                      {fileData.campana.nombre}
                    </h4>
                    {fileData.campana.descripcion && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {fileData.campana.descripcion}
                      </p>
                    )}
                  </div>
                  <FileCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                </div>

                {/* Recuento de entidades a importar */}
                <div className="pt-3 border-t border-slate-800">
                  <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Contenido detectado para importar:
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{fileData.sesiones.length} Sesiones</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{fileData.pjs.length} PJs</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>{fileData.npcs.length} NPCs</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{fileData.lugares.length} Lugares</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <Scroll className="w-3.5 h-3.5 text-amber-300" />
                      <span>{fileData.misiones.length} Misiones</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{fileData.objetos.length} Objetos</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center gap-2">
                      <Skull className="w-3.5 h-3.5 text-rose-400" />
                      <span>{fileData.monstruos.length} Monstruos</span>
                    </div>
                    {fileData.campana.notas_dm && (
                      <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-900/50 flex items-center gap-2 text-amber-300">
                        <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
                        <span>Notas DM</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            disabled={!fileData}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold transition-all shadow-md shadow-amber-950/40"
          >
            Importar Campaña Completa
          </button>
        </div>
      </div>
    </div>
  );
};
