import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { importarDatos } from '../lib/storage';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{
    campanas: number;
    sesiones: number;
    npcs: number;
    lugares: number;
    misiones: number;
    objetos: number;
    monstruos: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setFileContent(null);
    setPreviewInfo(null);
    setErrorMsg(null);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMsg('Por favor selecciona un archivo en formato .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let campanasCount = 0;
        let sesionesCount = 0;
        let npcsCount = 0;
        let lugaresCount = 0;
        let misionesCount = 0;
        let objetosCount = 0;
        let monstruosCount = 0;

        if (Array.isArray(parsed.campanas)) {
          campanasCount = parsed.campanas.length;
        }
        if (Array.isArray(parsed.sesiones)) {
          sesionesCount = parsed.sesiones.length;
        }
        if (Array.isArray(parsed.npcs)) {
          npcsCount = parsed.npcs.length;
        }
        if (Array.isArray(parsed.lugares)) {
          lugaresCount = parsed.lugares.length;
        }
        if (Array.isArray(parsed.misiones)) {
          misionesCount = parsed.misiones.length;
        }
        if (Array.isArray(parsed.objetos)) {
          objetosCount = parsed.objetos.length;
        }
        if (Array.isArray(parsed.monstruos)) {
          monstruosCount = parsed.monstruos.length;
        }

        if (
          campanasCount === 0 &&
          sesionesCount === 0 &&
          npcsCount === 0 &&
          lugaresCount === 0 &&
          misionesCount === 0 &&
          objetosCount === 0 &&
          monstruosCount === 0
        ) {
          setErrorMsg('El archivo JSON no contiene campañas, sesiones, NPCs, lugares, misiones, objetos ni monstruos válidos.');
          return;
        }

        setSelectedFile(file);
        setFileContent(text);
        setPreviewInfo({
          campanas: campanasCount,
          sesiones: sesionesCount,
          npcs: npcsCount,
          lugares: lugaresCount,
          misiones: misionesCount,
          objetos: objetosCount,
          monstruos: monstruosCount,
        });
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg('Error al leer el archivo JSON: sintaxis inválida.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleExecuteImport = () => {
    if (!fileContent) return;
    const result = importarDatos(fileContent);
    if (result.success) {
      onSuccess();
      handleReset();
      onClose();
    } else {
      setErrorMsg(result.error || 'Error al importar datos');
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      id="import-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={handleClose}
    >
      <div
        id="import-modal-dialog"
        className="relative w-full max-w-lg max-h-[90dvh] md:max-h-[90vh] flex flex-col rounded-2xl bg-[#131b2a] border border-amber-900/50 shadow-2xl text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        {/* Cabecera fija */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0e1522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/60 text-[#c9a227] border border-amber-800/40 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 id="import-modal-title" className="font-serif text-lg font-bold text-amber-100">
                Importar Datos de Bitácora
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                Restaura tus campañas y sesiones desde un respaldo JSON.
              </p>
            </div>
          </div>
          <button
            id="import-modal-close"
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!selectedFile ? (
          <div
            id="drop-zone"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#c9a227] bg-[#c9a227]/10'
                : 'border-slate-700 hover:border-amber-700/70 bg-[#0e1522]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-amber-400 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-200 text-sm">
              Arrastra y suelta tu archivo JSON aquí o{' '}
              <span className="text-[#c9a227] underline underline-offset-2">explora tus archivos</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Soporta archivos de respaldo exportados de esta bitácora (.json)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0e1522] border border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#c9a227]" />
                <div>
                  <div className="font-medium text-slate-100 text-sm">{selectedFile.name}</div>
                  <div className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-rose-400 underline underline-offset-2"
              >
                Cambiar archivo
              </button>
            </div>

            {previewInfo && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Contenido detectado en el respaldo:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-sm">
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">Campañas</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.campanas}</span>
                  </div>
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">Sesiones</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.sesiones}</span>
                  </div>
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">NPCs</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.npcs}</span>
                  </div>
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">Lugares</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.lugares}</span>
                  </div>
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">Misiones</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.misiones}</span>
                  </div>
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">Objetos</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.objetos}</span>
                  </div>
                  <div className="bg-[#131b2a] p-2.5 rounded-lg border border-slate-800 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">Monstruos</span>
                    <span className="text-lg font-bold text-amber-200">{previewInfo.monstruos}</span>
                  </div>
                </div>
                <p className="text-xs text-amber-300/80 mt-3">
                  ⚠️ Atención: Importar reemplazará las campañas, sesiones, NPCs, lugares, misiones, objetos y monstruos actuales en tu navegador.
                </p>
              </div>
            )}
          </div>
        )}

        </div>

        {/* Pie fijo */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#0e1522] shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
          <button
            id="import-cancel-btn"
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700 min-h-[44px] flex items-center justify-center font-medium"
          >
            Cancelar
          </button>
          <button
            id="import-confirm-btn"
            type="button"
            disabled={!fileContent}
            onClick={handleExecuteImport}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#c9a227] hover:bg-[#dbb333] text-black disabled:opacity-40 disabled:cursor-not-allowed shadow-sm min-h-[44px] flex items-center justify-center"
          >
            Confirmar e Importar
          </button>
        </div>
      </div>
    </div>
  );
};
