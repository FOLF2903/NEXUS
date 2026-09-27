import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Search,
  ArrowUpDown,
  Tag,
  ChevronRight,
  BookOpen,
  Users,
  User,
  MapPin,
  Eye,
  EyeOff,
  Shield,
  X,
  Filter,
  Layers,
  Compass,
  Scroll,
  CheckCircle2,
  Package,
  Skull,
  BarChart3,
  TrendingUp,
  Sparkles,
  Download,
  Upload,
  Check,
  Network,
  Crown,
  UserPlus,
} from 'lucide-react';
import {
  Campana,
  Sesion,
  NPC,
  Lugar,
  Mision,
  Objeto,
  TipoObjeto,
  Monstruo,
  TipoMonstruo,
  PJ,
  EstadoPJ,
  EstadoCampana,
  ActitudNPC,
  TipoLugar,
  EstadoLugar,
  EstadoMision,
  CampanaTab,
  ModoApp,
  SingleEntityType,
} from '../types';
import { SupabaseRole } from '../types/supabase';
import { ConfirmModal } from './ConfirmModal';
import { AccionesMenu } from './AccionesMenu';
import { getTagsFrequencies } from '../lib/tags';
import { ACTITUD_CONFIG } from './NpcModal';
import { LugarCard } from './LugarCard';
import { TIPO_LUGAR_CONFIG, ESTADO_LUGAR_CONFIG } from './LugarModal';
import { MisionCard, ESTADO_MISION_CONFIG } from './MisionCard';
import { ObjetoCard, TIPO_OBJETO_CONFIG } from './ObjetoCard';
import { MonstruoCard, TIPO_MONSTRUO_CONFIG } from './MonstruoCard';
import { DiarioView } from './DiarioView';
import { PjCard } from './PjCard';
import { ESTADO_PJ_CONFIG } from './PjModal';
import { ResumenView } from './ResumenView';
import { DmNotesSection } from './DmNotesSection';
import { ImportEntityModal } from './ImportEntityModal';
import { exportCampanaCompleta } from '../utils/exportImport';
import { MapaMentalView } from './MapaMentalView';
import { MiembrosTab } from './MiembrosTab';

interface CampanaViewProps {
  campana: Campana;
  sesiones: Sesion[];
  npcs: NPC[];
  lugares?: Lugar[];
  misiones?: Mision[];
  objetos?: Objeto[];
  monstruos?: Monstruo[];
  pjs?: PJ[];
  modoApp?: ModoApp;
  isCloud?: boolean;
  currentUserRole?: SupabaseRole;
  currentUserId?: string;
  onOpenInvite?: () => void;
  onBack: () => void;
  onEditCampana: (campana: Campana) => void;
  onDeleteCampana: (campanaId: string) => void;
  onUpdateCampana?: (updatedCampana: Campana) => void;
  onImportEntity?: (type: SingleEntityType, entity: any, ignoredRefs: string[]) => void;
  onNuevaSesion: () => void;
  onSelectSesion: (sesion: Sesion) => void;
  onNuevoNpc: () => void;
  onSelectNpc: (npc: NPC) => void;
  onNuevoLugar?: () => void;
  onSelectLugar?: (lugar: Lugar) => void;
  onNuevaMision?: () => void;
  onSelectMision?: (mision: Mision) => void;
  onNuevoObjeto?: () => void;
  onSelectObjeto?: (objeto: Objeto) => void;
  onNuevoMonstruo?: () => void;
  onSelectMonstruo?: (monstruo: Monstruo) => void;
  onNuevoPj?: () => void;
  onSelectPj?: (pj: PJ) => void;
  onEditPj?: (pj: PJ) => void;
  onDeletePj?: (pj: PJ) => void;
  onNavigateToEntity?: (type: 'sesion' | 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo' | 'pj', id: string) => void;
  activeTab?: CampanaTab;
  onTabChange?: (tab: CampanaTab) => void;
  initialTab?: CampanaTab;
}

const estadoBadges: Record<
  EstadoCampana,
  { label: string; bg: string; text: string; border: string }
> = {
  activa: {
    label: 'Activa',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/50',
  },
  pausada: {
    label: 'Pausada',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/50',
  },
  completada: {
    label: 'Completada',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-300',
    border: 'border-indigo-800/50',
  },
  abandonada: {
    label: 'Abandonada',
    bg: 'bg-slate-900/60',
    text: 'text-slate-400',
    border: 'border-slate-800',
  },
};

export const CampanaView: React.FC<CampanaViewProps> = ({
  campana,
  sesiones,
  npcs,
  lugares = [],
  misiones = [],
  objetos = [],
  monstruos = [],
  pjs = [],
  modoApp = 'jugador',
  isCloud = false,
  currentUserRole = 'host',
  currentUserId,
  onOpenInvite,
  onBack,
  onEditCampana,
  onDeleteCampana,
  onUpdateCampana,
  onImportEntity,
  onNuevaSesion,
  onSelectSesion,
  onNuevoNpc,
  onSelectNpc,
  onNuevoLugar = () => {},
  onSelectLugar = () => {},
  onNuevaMision = () => {},
  onSelectMision = () => {},
  onNuevoObjeto = () => {},
  onSelectObjeto = () => {},
  onNuevoMonstruo = () => {},
  onSelectMonstruo = () => {},
  onNuevoPj = () => {},
  onSelectPj = () => {},
  onEditPj = () => {},
  onDeletePj = () => {},
  onNavigateToEntity,
  activeTab: controlledActiveTab,
  onTabChange,
  initialTab = 'sesiones',
}) => {
  // Pestaña activa: Resumen, Diario, Sesiones, Grupo, NPCs, Lugares, Misiones, Objetos o Bestiario
  const [internalTab, setInternalTab] = useState<CampanaTab>(controlledActiveTab || initialTab);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const setActiveTab = (tab: CampanaTab) => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Estados de filtrado y visualización para PJs (Grupo)
  const [searchPjTerm, setSearchPjTerm] = useState('');
  const [selectedEstadoPjFilter, setSelectedEstadoPjFilter] = useState<string>('todos');
  const [selectedPjTagFilter, setSelectedPjTagFilter] = useState<string | null>(null);

  const filteredPjs = useMemo(() => {
    return pjs.filter((pj) => {
      const matchSearch =
        searchPjTerm === '' ||
        pj.nombre.toLowerCase().includes(searchPjTerm.toLowerCase()) ||
        pj.clase.toLowerCase().includes(searchPjTerm.toLowerCase()) ||
        pj.raza.toLowerCase().includes(searchPjTerm.toLowerCase()) ||
        (pj.trasfondo && pj.trasfondo.toLowerCase().includes(searchPjTerm.toLowerCase())) ||
        (pj.personalidad && pj.personalidad.toLowerCase().includes(searchPjTerm.toLowerCase())) ||
        (pj.descripcion && pj.descripcion.toLowerCase().includes(searchPjTerm.toLowerCase()));

      const matchEstado =
        selectedEstadoPjFilter === 'todos' || pj.estado === selectedEstadoPjFilter;

      const matchTag =
        !selectedPjTagFilter || (pj.etiquetas && pj.etiquetas.includes(selectedPjTagFilter));

      return matchSearch && matchEstado && matchTag;
    });
  }, [pjs, searchPjTerm, selectedEstadoPjFilter, selectedPjTagFilter]);

  const pjsTags = useMemo(() => {
    return getTagsFrequencies(pjs);
  }, [pjs]);

  // Estados de filtrado y visualización para Sesiones
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(true);

  // Estados de filtrado y visualización para NPCs
  const [searchNpcTerm, setSearchNpcTerm] = useState('');
  const [actitudFilter, setActitudFilter] = useState<string>('todas');
  const [selectedNpcTagFilter, setSelectedNpcTagFilter] = useState<string | null>(null);

  // Estados de filtrado y visualización para Lugares
  const [searchLugarTerm, setSearchLugarTerm] = useState('');
  const [tipoLugarFilter, setTipoLugarFilter] = useState<string>('todos');
  const [estadoLugarFilter, setEstadoLugarFilter] = useState<string>('todos');
  const [selectedLugarTagFilter, setSelectedLugarTagFilter] = useState<string | null>(null);

  // Estados de filtrado y visualización para Misiones
  const [searchMisionTerm, setSearchMisionTerm] = useState('');
  const [estadoMisionFilter, setEstadoMisionFilter] = useState<string>('todas');
  const [selectedMisionTagFilter, setSelectedMisionTagFilter] = useState<string | null>(null);

  // Estados de filtrado y visualización para Objetos
  const [searchObjetoTerm, setSearchObjetoTerm] = useState('');
  const [tipoObjetoFilter, setTipoObjetoFilter] = useState<string>('todos');
  const [portadorFilter, setPortadorFilter] = useState<string>('todos');
  const [selectedObjetoTagFilter, setSelectedObjetoTagFilter] = useState<string | null>(null);

  // Estados de filtrado y visualización para Bestiario / Monstruos
  const [searchMonstruoTerm, setSearchMonstruoTerm] = useState('');
  const [tipoMonstruoFilter, setTipoMonstruoFilter] = useState<string>('todos');
  const [selectedMonstruoTagFilter, setSelectedMonstruoTagFilter] = useState<string | null>(null);

  // Notas del DM y Modal de confirmación
  const [showDmNotes, setShowDmNotes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImportEntityOpen, setIsImportEntityOpen] = useState(false);
  const [importTargetType, setImportTargetType] = useState<SingleEntityType | undefined>(undefined);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleExportCampana = () => {
    exportCampanaCompleta(
      campana,
      sesiones,
      npcs,
      lugares,
      misiones,
      objetos,
      monstruos,
      pjs
    );
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleSaveCampanaDmNotes = (newNotasDm: string) => {
    if (onUpdateCampana) {
      onUpdateCampana({
        ...campana,
        notas_dm: newNotasDm,
      });
    }
  };

  const handleInternalNavigateToEntity = (
    type: 'sesion' | 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo' | 'pj',
    id: string
  ) => {
    if (type === 'sesion') {
      const s = sesiones.find((x) => x.id === id);
      if (s) {
        onSelectSesion(s);
        return;
      }
    }
    if (type === 'npc') {
      const n = npcs.find((x) => x.id === id);
      if (n) {
        onSelectNpc(n);
        return;
      }
    }
    if (type === 'lugar') {
      const l = lugares.find((x) => x.id === id);
      if (l) {
        onSelectLugar(l);
        return;
      }
    }
    if (type === 'mision') {
      const m = misiones.find((x) => x.id === id);
      if (m) {
        onSelectMision(m);
        return;
      }
    }
    if (type === 'objeto') {
      const o = objetos.find((x) => x.id === id);
      if (o) {
        onSelectObjeto(o);
        return;
      }
    }
    if (type === 'monstruo') {
      const mo = monstruos.find((x) => x.id === id);
      if (mo) {
        onSelectMonstruo(mo);
        return;
      }
    }
    if (type === 'pj') {
      const p = pjs.find((x) => x.id === id);
      if (p) {
        onSelectPj(p);
        return;
      }
    }
    if (onNavigateToEntity) {
      onNavigateToEntity(type, id);
    }
  };

  const badge = estadoBadges[campana.estado] || estadoBadges.activa;

  // Frecuencias de etiquetas en sesiones, NPCs, Lugares, Misiones, Objetos y Monstruos
  const tagFrequencies = useMemo(() => getTagsFrequencies(sesiones), [sesiones]);
  const npcTagFrequencies = useMemo(() => getTagsFrequencies(npcs), [npcs]);
  const lugarTagFrequencies = useMemo(() => getTagsFrequencies(lugares), [lugares]);
  const misionTagFrequencies = useMemo(() => getTagsFrequencies(misiones), [misiones]);
  const objetoTagFrequencies = useMemo(() => getTagsFrequencies(objetos), [objetos]);
  const monstruoTagFrequencies = useMemo(() => getTagsFrequencies(monstruos), [monstruos]);

  // Lista de portadores conocidos para filtrar objetos
  const portadoresCampana = useMemo(() => {
    const set = new Set<string>();
    if (campana.pj_ids && Array.isArray(campana.pj_ids)) {
      campana.pj_ids.forEach((p) => p && set.add(p.trim()));
    }
    objetos.forEach((o) => {
      if (o.quien_lo_lleva) set.add(o.quien_lo_lleva.trim());
    });
    return Array.from(set).sort();
  }, [campana.pj_ids, objetos]);

  // Filtrado de Objetos
  const filteredObjetos = useMemo(() => {
    return objetos.filter((obj) => {
      if (selectedObjetoTagFilter && !obj.etiquetas?.includes(selectedObjetoTagFilter)) {
        return false;
      }
      if (tipoObjetoFilter !== 'todos' && obj.tipo !== tipoObjetoFilter) {
        return false;
      }
      if (portadorFilter !== 'todos') {
        if (portadorFilter === '__sin_asignar__') {
          if (obj.quien_lo_lleva && obj.quien_lo_lleva.trim() !== '') return false;
        } else {
          if (obj.quien_lo_lleva !== portadorFilter) return false;
        }
      }
      if (!searchObjetoTerm.trim()) return true;

      const term = searchObjetoTerm.toLowerCase();
      const matchNombre = obj.nombre.toLowerCase().includes(term);
      const matchDesc = obj.descripcion.toLowerCase().includes(term);
      const matchEfecto = obj.efecto_conocido.toLowerCase().includes(term);
      const matchSospecha = obj.efecto_sospechado.toLowerCase().includes(term);
      const matchDonde = obj.donde_lo_conseguimos.toLowerCase().includes(term);
      const matchPortador = (obj.quien_lo_lleva || '').toLowerCase().includes(term);
      const matchNotas = obj.notas.toLowerCase().includes(term);
      const matchEtiquetas = obj.etiquetas?.some((tag) => tag.toLowerCase().includes(term));

      return (
        matchNombre ||
        matchDesc ||
        matchEfecto ||
        matchSospecha ||
        matchDonde ||
        matchPortador ||
        matchNotas ||
        matchEtiquetas
      );
    });
  }, [objetos, selectedObjetoTagFilter, tipoObjetoFilter, portadorFilter, searchObjetoTerm]);

  // Filtrado de Monstruos / Bestiario
  const filteredMonstruos = useMemo(() => {
    return monstruos.filter((m) => {
      if (selectedMonstruoTagFilter && !m.etiquetas?.includes(selectedMonstruoTagFilter)) {
        return false;
      }
      if (tipoMonstruoFilter !== 'todos' && m.tipo !== tipoMonstruoFilter) {
        return false;
      }
      if (!searchMonstruoTerm.trim()) return true;

      const term = searchMonstruoTerm.toLowerCase();
      const matchNombre = m.nombre.toLowerCase().includes(term);
      const matchDesc = m.descripcion_visual ? m.descripcion_visual.toLowerCase().includes(term) : false;
      const matchComp = m.comportamiento ? m.comportamiento.toLowerCase().includes(term) : false;
      const matchDebil = m.debilidades ? m.debilidades.toLowerCase().includes(term) : false;
      const matchResist = m.resistencias ? m.resistencias.toLowerCase().includes(term) : false;
      const matchDonde = m.donde_lo_vimos ? m.donde_lo_vimos.toLowerCase().includes(term) : false;
      const matchNotas = m.notas ? m.notas.toLowerCase().includes(term) : false;
      const matchEtiquetas = m.etiquetas?.some((tag) => tag.toLowerCase().includes(term));

      return (
        matchNombre ||
        matchDesc ||
        matchComp ||
        matchDebil ||
        matchResist ||
        matchDonde ||
        matchNotas ||
        matchEtiquetas
      );
    });
  }, [monstruos, selectedMonstruoTagFilter, tipoMonstruoFilter, searchMonstruoTerm]);

  // Filtrado y ordenamiento de sesiones
  const filteredSesiones = sesiones
    .filter((s) => {
      if (selectedTagFilter && !s.etiquetas?.includes(selectedTagFilter)) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchTitulo = s.titulo.toLowerCase().includes(term);
      const matchNotas = s.notas.toLowerCase().includes(term);
      const matchEtiquetas = s.etiquetas?.some((tag) => tag.toLowerCase().includes(term));
      const matchNumero = s.numero.toString().includes(term);
      return matchTitulo || matchNotas || matchEtiquetas || matchNumero;
    })
    .sort((a, b) => (sortAscending ? a.numero - b.numero : b.numero - a.numero));

  // Filtrado de NPCs
  const filteredNpcs = npcs.filter((npc) => {
    if (selectedNpcTagFilter && !npc.etiquetas?.includes(selectedNpcTagFilter)) {
      return false;
    }
    if (actitudFilter !== 'todas' && npc.actitud !== actitudFilter) {
      return false;
    }
    if (!searchNpcTerm.trim()) return true;

    const term = searchNpcTerm.toLowerCase();
    const matchNombre = npc.nombre.toLowerCase().includes(term);
    const matchRol = npc.rol.toLowerCase().includes(term);
    const matchUbicacion = npc.ubicacion_habitual.toLowerCase().includes(term);
    const matchDesc = npc.descripcion.toLowerCase().includes(term);
    const matchInfo = npc.informacion_conocida.toLowerCase().includes(term);
    const matchSospecha = npc.informacion_sospechada.toLowerCase().includes(term);
    const matchNotas = npc.notas.toLowerCase().includes(term);
    const matchEtiquetas = npc.etiquetas?.some((tag) => tag.toLowerCase().includes(term));

    return (
      matchNombre ||
      matchRol ||
      matchUbicacion ||
      matchDesc ||
      matchInfo ||
      matchSospecha ||
      matchNotas ||
      matchEtiquetas
    );
  });

  // Filtrado de Lugares
  const isFilteringLugares =
    searchLugarTerm.trim() !== '' ||
    tipoLugarFilter !== 'todos' ||
    estadoLugarFilter !== 'todos' ||
    selectedLugarTagFilter !== null;

  const filteredLugares = useMemo(() => {
    return lugares.filter((loc) => {
      // Si no estamos buscando ni filtrando, solo mostramos los lugares raíz (padre_id === null)
      if (!isFilteringLugares) {
        return loc.padre_id === null;
      }

      if (tipoLugarFilter !== 'todos' && loc.tipo !== tipoLugarFilter) {
        return false;
      }
      if (estadoLugarFilter !== 'todos' && loc.estado !== estadoLugarFilter) {
        return false;
      }
      if (selectedLugarTagFilter && !loc.etiquetas?.includes(selectedLugarTagFilter)) {
        return false;
      }
      if (!searchLugarTerm.trim()) return true;

      const term = searchLugarTerm.toLowerCase();
      const matchNombre = loc.nombre.toLowerCase().includes(term);
      const matchDesc = loc.descripcion.toLowerCase().includes(term);
      const matchNotas = loc.notas.toLowerCase().includes(term);
      const matchLlegar = loc.como_llegar.toLowerCase().includes(term);
      const matchQueHay = loc.que_hay.toLowerCase().includes(term);
      const matchQuePaso = loc.que_paso.toLowerCase().includes(term);
      const matchEtiquetas = loc.etiquetas?.some((t) => t.toLowerCase().includes(term));

      return (
        matchNombre ||
        matchDesc ||
        matchNotas ||
        matchLlegar ||
        matchQueHay ||
        matchQuePaso ||
        matchEtiquetas
      );
    });
  }, [
    lugares,
    isFilteringLugares,
    tipoLugarFilter,
    estadoLugarFilter,
    selectedLugarTagFilter,
    searchLugarTerm,
  ]);

  // Filtrado de Misiones
  const filteredMisiones = useMemo(() => {
    return misiones.filter((m) => {
      if (selectedMisionTagFilter && !m.etiquetas?.includes(selectedMisionTagFilter)) {
        return false;
      }
      if (estadoMisionFilter !== 'todas' && m.estado !== estadoMisionFilter) {
        return false;
      }
      if (!searchMisionTerm.trim()) return true;

      const term = searchMisionTerm.toLowerCase();
      const matchTitulo = m.titulo.toLowerCase().includes(term);
      const matchDesc = m.descripcion ? m.descripcion.toLowerCase().includes(term) : false;
      const matchNotas = m.notas ? m.notas.toLowerCase().includes(term) : false;
      const matchRecompensa = m.recompensa_conocida
        ? m.recompensa_conocida.toLowerCase().includes(term)
        : false;
      const matchEtiquetas = m.etiquetas?.some((t) => t.toLowerCase().includes(term));
      const matchPasos = m.pasos?.some((p) => p.texto.toLowerCase().includes(term));

      return (
        matchTitulo ||
        matchDesc ||
        matchNotas ||
        matchRecompensa ||
        matchEtiquetas ||
        matchPasos
      );
    });
  }, [
    misiones,
    selectedMisionTagFilter,
    estadoMisionFilter,
    searchMisionTerm,
  ]);

  const isHost = !isCloud || currentUserRole === 'host';
  const isDm = currentUserRole === 'dm';
  const isPlayer = isCloud && currentUserRole === 'player';
  const canManageCampaign = isHost || isDm;

  return (
    <div id="campana-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Barra superior de navegación y acciones compacta */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <button
          id="back-to-campanas-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Volver a todas las campañas</span>
          <span className="sm:hidden">Campañas</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón Invitar (solo Host o DM) */}
          {canManageCampaign && onOpenInvite && (
            <button
              id="invite-members-btn"
              type="button"
              onClick={onOpenInvite}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 text-xs font-semibold transition-colors min-h-[44px]"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Invitar</span>
            </button>
          )}

          {canManageCampaign && (
            <button
              id="edit-campana-btn"
              type="button"
              onClick={() => onEditCampana(campana)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 text-xs font-semibold transition-colors min-h-[44px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editar</span>
            </button>
          )}

          <AccionesMenu
            buttonId="campana-more-actions-btn"
            title="Opciones de la campaña"
            items={[
              ...(onImportEntity && canManageCampaign
                ? [
                    {
                      id: 'importar-elemento',
                      label: 'Importar Elemento',
                      descripcion: 'Añadir NPC, lugar, misión o entidad desde .json',
                      icon: <Upload className="w-4 h-4" />,
                      onClick: () => {
                        setImportTargetType(undefined);
                        setIsImportEntityOpen(true);
                      },
                    },
                  ]
                : []),
              {
                id: 'exportar-campana',
                label: copiedNotification ? '¡Campaña Exportada!' : 'Exportar Campaña',
                descripcion: 'Descargar copia completa en archivo JSON',
                icon: copiedNotification ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-4 h-4" />
                ),
                onClick: handleExportCampana,
                variant: copiedNotification ? 'success' : 'default',
              },
              ...(canManageCampaign
                ? [
                    {
                      id: 'eliminar-campana',
                      label: 'Eliminar Campaña',
                      descripcion: 'Borrar permanentemente esta crónica y datos',
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => setShowDeleteConfirm(true),
                      variant: 'danger' as const,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      {/* Cabecera de la Campaña */}
      <div className="rounded-2xl bg-[#111827] border border-amber-900/40 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-900/40">
              {campana.sistema}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </span>
            {isCloud && currentUserRole && (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                currentUserRole === 'host'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : currentUserRole === 'dm'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
              }`}>
                {currentUserRole === 'host' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Host (Creador)</span>
                  </>
                ) : currentUserRole === 'dm' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Dungeon Master</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Jugador (Lectura y Ficha Propia)</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Iniciada el {campana.fecha_inicio}</span>
          </div>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-amber-100 tracking-wide mt-1">
          {campana.nombre}
        </h1>

        {campana.descripcion && (
          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
            {campana.descripcion}
          </p>
        )}

        {/* Sección de Notas Secretas del DM */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <DmNotesSection
            modoApp={modoApp}
            notasDm={campana.notas_dm}
            onSaveNotasDm={handleSaveCampanaDmNotes}
            entityName={`Campaña "${campana.nombre}"`}
          />
        </div>
      </div>

      {/* Pestañas principales de la Campaña: Resumen, Diario, Sesiones, Grupo, NPCs, Lugares, Misiones, Objetos, Bestiario */}
      <div className="flex border-b border-slate-800 gap-2 pt-2 overflow-x-auto no-scrollbar">
        <button
          id="tab-resumen"
          type="button"
          onClick={() => setActiveTab('resumen')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'resumen'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#c9a227]" />
          <span>Resumen</span>
        </button>

        <button
          id="tab-diario"
          type="button"
          onClick={() => setActiveTab('diario')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'diario'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#c9a227]" />
          <span>Diario</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'diario'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {sesiones.length}
          </span>
        </button>

        <button
          id="tab-mapa"
          type="button"
          onClick={() => setActiveTab('mapa')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'mapa'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4 text-[#c9a227]" />
          <span>Mapa</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'mapa'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {sesiones.length + npcs.length + lugares.length + misiones.length + objetos.length + monstruos.length + pjs.length}
          </span>
        </button>

        <button
          id="tab-sesiones"
          type="button"
          onClick={() => setActiveTab('sesiones')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'sesiones'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#c9a227]" />
          <span>Sesiones</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'sesiones'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {sesiones.length}
          </span>
        </button>

        <button
          id="tab-grupo"
          type="button"
          onClick={() => setActiveTab('grupo')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'grupo'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4 text-[#c9a227]" />
          <span>Grupo</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'grupo'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {pjs.length}
          </span>
        </button>

        <button
          id="tab-npcs"
          type="button"
          onClick={() => setActiveTab('npcs')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'npcs'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-[#c9a227]" />
          <span>NPCs</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'npcs'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {npcs.length}
          </span>
        </button>

        <button
          id="tab-lugares"
          type="button"
          onClick={() => setActiveTab('lugares')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'lugares'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-[#c9a227]" />
          <span>Lugares</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'lugares'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lugares.length}
          </span>
        </button>

        <button
          id="tab-misiones"
          type="button"
          onClick={() => setActiveTab('misiones')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'misiones'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scroll className="w-4 h-4 text-[#c9a227]" />
          <span>Misiones</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'misiones'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {misiones.length}
          </span>
        </button>

        <button
          id="tab-objetos"
          type="button"
          onClick={() => setActiveTab('objetos')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'objetos'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4 text-[#c9a227]" />
          <span>Objetos</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'objetos'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {objetos.length}
          </span>
        </button>

        <button
          id="tab-bestiario"
          type="button"
          onClick={() => setActiveTab('bestiario')}
          className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
            activeTab === 'bestiario'
              ? 'border-[#c9a227] text-amber-200'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Skull className="w-4 h-4 text-[#c9a227]" />
          <span>Bestiario</span>
          <span
            className={`text-xs font-sans px-2 py-0.5 rounded-full ${
              activeTab === 'bestiario'
                ? 'bg-[#c9a227]/20 text-amber-200 font-semibold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {monstruos.length}
          </span>
        </button>

        {/* Pestaña Miembros (Solo Host y DM en modo Multijugador) */}
        {canManageCampaign && isCloud && (
          <button
            id="tab-miembros"
            type="button"
            onClick={() => setActiveTab('miembros')}
            className={`inline-flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold transition-all border-b-2 -mb-px shrink-0 min-h-[44px] ${
              activeTab === 'miembros'
                ? 'border-[#c9a227] text-amber-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-[#c9a227]" />
            <span>Miembros</span>
          </button>
        )}
      </div>

      {/* CONTENIDO DE LA PESTAÑA: MIEMBROS (Fase 16) */}
      {activeTab === 'miembros' && (
        <div className="animate-in fade-in duration-150">
          <MiembrosTab
            campaignId={campana.id}
            campaignName={campana.nombre}
            currentUserRole={currentUserRole || 'host'}
            isHost={isHost}
            onOpenInvite={onOpenInvite || (() => {})}
          />
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: RESUMEN / ESTADÍSTICAS */}
      {activeTab === 'resumen' && (
        <div className="animate-in fade-in duration-150">
          <ResumenView
            campana={campana}
            sesiones={sesiones}
            pjs={pjs}
            npcs={npcs}
            lugares={lugares}
            misiones={misiones}
            objetos={objetos}
            monstruos={monstruos}
            onNavigateTab={setActiveTab}
          />
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: DIARIO CRONOLÓGICO (Fase 8) */}
      {activeTab === 'diario' && (
        <DiarioView
          campana={campana}
          sesiones={sesiones}
          npcs={npcs}
          lugares={lugares}
          misiones={misiones}
          objetos={objetos}
          monstruos={monstruos}
          onSelectSesion={onSelectSesion}
          onNavigateToEntity={onNavigateToEntity}
        />
      )}

      {/* CONTENIDO DE LA PESTAÑA: MAPA MENTAL (Fase 14) */}
      {activeTab === 'mapa' && (
        <div className="animate-in fade-in duration-150">
          <MapaMentalView
            campana={campana}
            sesiones={sesiones}
            npcs={npcs}
            lugares={lugares}
            misiones={misiones}
            objetos={objetos}
            monstruos={monstruos}
            pjs={pjs}
            modoApp={modoApp}
            onNavigateToEntity={handleInternalNavigateToEntity}
          />
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: SESIONES */}
      {activeTab === 'sesiones' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas de sesiones */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Diario de Sesiones</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {sesiones.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Búsqueda */}
              <div className="relative flex-1 sm:flex-initial sm:w-60">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en sesiones..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Alternar orden */}
              <button
                type="button"
                onClick={() => setSortAscending(!sortAscending)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-amber-200 transition-colors"
                title={sortAscending ? 'Orden: 1 a N (ascendente)' : 'Orden: N a 1 (más reciente primero)'}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>{sortAscending ? '1 → N' : 'N → 1'}</span>
              </button>

              {/* Botón + Nueva sesión (Solo DM o Host) */}
              {canManageCampaign && (
                <button
                  id="nueva-sesion-btn"
                  type="button"
                  onClick={onNuevaSesion}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>+ Nueva sesión</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de filtrado por etiquetas temáticas de sesiones */}
          {tagFrequencies.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                <Tag className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Filtrar por etiqueta:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedTagFilter(null)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  selectedTagFilter === null
                    ? 'bg-[#c9a227] text-black font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Todas ({sesiones.length})
              </button>

              {tagFrequencies.map(({ tag, count }) => {
                const isSelected = selectedTagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                    className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/20 text-[#c9a227] border-[#c9a227]/70 ring-1 ring-[#c9a227]/40'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-amber-800/60 hover:text-amber-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                        isSelected ? 'bg-[#c9a227]/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {selectedTagFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedTagFilter(null)}
                  className="inline-flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-200 ml-auto transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtro (#{selectedTagFilter})</span>
                </button>
              )}
            </div>
          )}

          {/* Lista de sesiones */}
          {sesiones.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  No hay sesiones registradas aún
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Las sesiones te permiten plasmar la historia que forjan tus jugadores.
                </p>
              </div>
              {canManageCampaign ? (
                <button
                  type="button"
                  onClick={onNuevaSesion}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Registrar primera sesión</span>
                </button>
              ) : (
                <p className="text-xs text-amber-300/80 italic">
                  Esperando a que el Dungeon Master registre la primera sesión.
                </p>
              )}
            </div>
          ) : filteredSesiones.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron sesiones que coincidan con la búsqueda o etiqueta seleccionada.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSesiones.map((sesion) => (
                <div
                  key={sesion.id}
                  id={`sesion-card-${sesion.numero}`}
                  onClick={() => onSelectSesion(sesion)}
                  className="group rounded-xl bg-[#111827] border border-slate-800/80 hover:border-amber-500/50 p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-serif text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-[#c9a227] border border-amber-900/60">
                        Sesión {sesion.numero}
                      </span>
                      {modoApp === 'dm' && sesion.notas_dm && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                          title="Contiene notas privadas del DM"
                        >
                          <Shield className="w-3 h-3 text-[#c9a227]" />
                          <span>DM</span>
                        </span>
                      )}
                      <h3 className="font-serif text-base md:text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors truncate">
                        {sesion.titulo}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Fecha: {sesion.fecha_real}</span>
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          Día de juego {sesion.dia_juego_inicio}
                          {sesion.dia_juego_fin && sesion.dia_juego_fin !== sesion.dia_juego_inicio
                            ? ` al ${sesion.dia_juego_fin}`
                            : ''}
                        </span>
                      </span>

                      {sesion.duracion_horas && (
                        <span className="text-slate-500">· {sesion.duracion_horas} horas</span>
                      )}
                    </div>

                    {/* Resumen notas */}
                    {sesion.notas && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {sesion.notas}
                      </p>
                    )}

                    {/* Etiquetas temáticas como chips */}
                    {sesion.etiquetas && sesion.etiquetas.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {sesion.etiquetas.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTagFilter(selectedTagFilter === t ? null : t);
                            }}
                            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                              selectedTagFilter === t
                                ? 'bg-amber-500/25 text-amber-200 border-amber-600'
                                : 'bg-slate-900 text-amber-300/80 border-slate-800 hover:border-amber-700/60 hover:text-amber-200'
                            }`}
                            title={`Filtrar por #${t}`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center justify-end md:justify-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-[#c9a227]/20 border border-slate-800 group-hover:border-[#c9a227]/50 text-xs font-medium text-slate-300 group-hover:text-[#c9a227] transition-colors">
                      <span>Ver sesión</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: GRUPO (PJs) */}
      {activeTab === 'grupo' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas del Grupo */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Personajes del Grupo (PJs)</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {pjs.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fichas de los héroes y aventureros que forman parte de la crónica
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Búsqueda */}
              <div className="relative flex-1 sm:flex-initial sm:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPjTerm}
                  onChange={(e) => setSearchPjTerm(e.target.value)}
                  placeholder="Buscar nombre, clase, raza..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227]"
                />
              </div>

              {/* Filtro por estado */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedEstadoPjFilter}
                  onChange={(e) => setSelectedEstadoPjFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-300 focus:outline-hidden focus:border-[#c9a227]"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="retirado">Retirado</option>
                  <option value="muerto">Muerto</option>
                  <option value="desaparecido">Desaparecido</option>
                </select>
              </div>

              {/* Botón Nuevo PJ */}
              <button
                id="nuevo-pj-tab-btn"
                type="button"
                onClick={onNuevoPj}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black text-xs font-semibold shadow-md shadow-amber-950/20 transition-colors"
              >
                <Plus className="w-4 h-4 text-black stroke-[2.5]" />
                <span>+ Nuevo PJ</span>
              </button>
            </div>
          </div>

          {/* Filtros de etiquetas si existen */}
          {pjsTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
              <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Etiquetas:
              </span>
              <button
                type="button"
                onClick={() => setSelectedPjTagFilter(null)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  selectedPjTagFilter === null
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 font-medium'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              {pjsTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedPjTagFilter(selectedPjTagFilter === tag ? null : tag)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                    selectedPjTagFilter === tag
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 font-medium'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Listado de tarjetas de personajes */}
          {pjs.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#111827]/70 border border-dashed border-amber-900/40 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/40 text-[#c9a227] flex items-center justify-center border border-amber-800/40">
                <Shield className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  Aún no has registrado ningún personaje jugador
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Registra la ficha de tus aventureros: bárbaros, pícaros, magas, clérigos y paladines, con sus estadísticas de combate, trasfondo e inventario.
                </p>
              </div>
              <button
                type="button"
                onClick={onNuevoPj}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-lg shadow-amber-950/30"
              >
                <Plus className="w-4 h-4 text-black stroke-[2.5]" />
                <span>+ Crear primer personaje</span>
              </button>
            </div>
          ) : filteredPjs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron personajes que coincidan con la búsqueda o filtro seleccionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchPjTerm('');
                  setSelectedEstadoPjFilter('todos');
                  setSelectedPjTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPjs.map((pj) => (
                <PjCard
                  key={pj.id}
                  pj={pj}
                  objetos={objetos}
                  modoApp={modoApp}
                  onSelect={onSelectPj}
                  onEdit={(p) => {
                    if (isPlayer && p.user_id && currentUserId && p.user_id !== currentUserId) {
                      return;
                    }
                    onEditPj(p);
                  }}
                  onDelete={(p) => {
                    if (isPlayer && p.user_id && currentUserId && p.user_id !== currentUserId) {
                      return;
                    }
                    onDeletePj(p);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: NPCS */}
      {activeTab === 'npcs' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas de NPCs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Fichas de NPCs</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {npcs.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Búsqueda */}
              <div className="relative flex-1 sm:flex-initial sm:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchNpcTerm}
                  onChange={(e) => setSearchNpcTerm(e.target.value)}
                  placeholder="Buscar por nombre, rol, notas..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Filtro por actitud */}
              <div className="relative">
                <select
                  value={actitudFilter}
                  onChange={(e) => setActitudFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#c9a227] cursor-pointer"
                >
                  <option value="todas">Actitud: Todas</option>
                  <option value="aliado">🟢 Aliados</option>
                  <option value="amistoso">🟢 Amistosos</option>
                  <option value="neutral">⚪ Neutrales</option>
                  <option value="receloso">🟠 Recelosos</option>
                  <option value="hostil">🔴 Hostiles</option>
                  <option value="desconocido">⚫ Desconocidos</option>
                </select>
              </div>

              {/* Botón + Nuevo NPC (Solo DM o Host) */}
              {canManageCampaign && (
                <button
                  id="nuevo-npc-btn"
                  type="button"
                  onClick={onNuevoNpc}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>+ Nuevo NPC</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de filtrado por etiquetas temáticas de NPCs */}
          {npcTagFrequencies.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                <Tag className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Filtrar por etiqueta:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedNpcTagFilter(null)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  selectedNpcTagFilter === null
                    ? 'bg-[#c9a227] text-black font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Todos ({npcs.length})
              </button>

              {npcTagFrequencies.map(({ tag, count }) => {
                const isSelected = selectedNpcTagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedNpcTagFilter(isSelected ? null : tag)}
                    className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/20 text-[#c9a227] border-[#c9a227]/70 ring-1 ring-[#c9a227]/40'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-amber-800/60 hover:text-amber-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                        isSelected ? 'bg-[#c9a227]/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {selectedNpcTagFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedNpcTagFilter(null)}
                  className="inline-flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-200 ml-auto transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtro (#{selectedNpcTagFilter})</span>
                </button>
              )}
            </div>
          )}

          {/* Lista de NPCs */}
          {npcs.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  No hay NPCs registrados en esta campaña
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Registra a los tenderos, gobernantes, sospechosos, aliados y enemigos que tus aventureros conozcan en su travesía.
                </p>
              </div>
              <button
                type="button"
                onClick={onNuevoNpc}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Crear primer NPC</span>
              </button>
            </div>
          ) : filteredNpcs.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron NPCs que coincidan con la búsqueda o filtros seleccionados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchNpcTerm('');
                  setActitudFilter('todas');
                  setSelectedNpcTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNpcs.map((npc) => {
                const actitudConfig = ACTITUD_CONFIG[npc.actitud] || ACTITUD_CONFIG.neutral;
                const displayName = npc.nombre_conocido ? npc.nombre : '?';

                return (
                  <div
                    key={npc.id}
                    id={`npc-card-${npc.id}`}
                    onClick={() => onSelectNpc(npc)}
                    className="group rounded-xl bg-[#111827] border border-slate-800 hover:border-amber-500/50 p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      {/* Cabecera de la tarjeta: Nombre, Rol y Actitud */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-serif text-base md:text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors truncate flex items-center gap-2">
                            <span>{displayName}</span>
                            {!npc.nombre_conocido && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
                                title="Nombre secreto no revelado aún a los aventureros"
                              >
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </span>
                            )}
                          </h3>
                          {npc.rol && (
                            <span className="text-xs text-[#c9a227] font-medium block truncate">
                              {npc.rol}
                            </span>
                          )}
                        </div>

                        {/* Badge de Actitud y DM */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {modoApp === 'dm' && npc.notas_dm && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-[#c9a227] border border-amber-800/60"
                              title="Contiene notas privadas del DM"
                            >
                              <Shield className="w-3 h-3 text-[#c9a227]" />
                              <span>DM</span>
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border ${actitudConfig.bg} ${actitudConfig.text} ${actitudConfig.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${actitudConfig.dot}`} />
                            <span>{actitudConfig.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Ubicación habitual si existe */}
                      {npc.ubicacion_habitual && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{npc.ubicacion_habitual}</span>
                        </div>
                      )}

                      {/* Descripción breve o Información conocida */}
                      {npc.descripcion && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {npc.descripcion}
                        </p>
                      )}

                      {!npc.descripcion && npc.informacion_conocida && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                          &quot;{npc.informacion_conocida}&quot;
                        </p>
                      )}

                      {/* Etiquetas temáticas como chips */}
                      {npc.etiquetas && npc.etiquetas.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {npc.etiquetas.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNpcTagFilter(selectedNpcTagFilter === t ? null : t);
                              }}
                              className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                                selectedNpcTagFilter === t
                                  ? 'bg-amber-500/25 text-amber-200 border-amber-600'
                                  : 'bg-slate-900 text-amber-300/80 border-slate-800 hover:border-amber-700/60 hover:text-amber-200'
                              }`}
                              title={`Filtrar por #${t}`}
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pie de la tarjeta: botón ver ficha */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        {new Date(npc.creado_en).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-300 group-hover:text-[#c9a227] font-medium transition-colors">
                        <span>Ver ficha completa</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: LUGARES */}
      {activeTab === 'lugares' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas de Lugares */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Atlas de Lugares</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {lugares.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFilteringLugares
                  ? `Mostrando resultados filtrados (${filteredLugares.length} encontrados)`
                  : 'Mostrando lugares principales. Haz clic para ver sus sub-lugares y detalles.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Búsqueda */}
              <div className="relative flex-1 sm:flex-initial sm:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchLugarTerm}
                  onChange={(e) => setSearchLugarTerm(e.target.value)}
                  placeholder="Buscar lugares, rutas o notas..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Filtro por Tipo */}
              <div className="relative">
                <select
                  value={tipoLugarFilter}
                  onChange={(e) => setTipoLugarFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#c9a227] cursor-pointer"
                >
                  <option value="todos">Tipo: Todos</option>
                  {Object.entries(TIPO_LUGAR_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.iconLabel} {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Estado */}
              <div className="relative">
                <select
                  value={estadoLugarFilter}
                  onChange={(e) => setEstadoLugarFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#c9a227] cursor-pointer"
                >
                  <option value="todos">Estado: Todos</option>
                  <option value="visitado">🟢 Visitado</option>
                  <option value="conocido">🔵 Conocido</option>
                  <option value="misterioso">🟠 Misterioso</option>
                  <option value="inaccesible">⚪ Inaccesible</option>
                </select>
              </div>

              {/* Botón + Nuevo Lugar (Solo DM o Host) */}
              {canManageCampaign && (
                <button
                  id="nuevo-lugar-btn"
                  type="button"
                  onClick={onNuevoLugar}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>+ Nuevo lugar</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de filtrado por etiquetas temáticas de Lugares */}
          {lugarTagFrequencies.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                <Tag className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Filtrar por etiqueta:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedLugarTagFilter(null)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  selectedLugarTagFilter === null
                    ? 'bg-[#c9a227] text-black font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Todos ({lugares.length})
              </button>

              {lugarTagFrequencies.map(({ tag, count }) => {
                const isSelected = selectedLugarTagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedLugarTagFilter(isSelected ? null : tag)}
                    className={`text-xs font-mono px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/20 text-[#c9a227] border-[#c9a227]/70 ring-1 ring-[#c9a227]/40'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-amber-800/60 hover:text-amber-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                        isSelected ? 'bg-[#c9a227]/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {selectedLugarTagFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedLugarTagFilter(null)}
                  className="inline-flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-200 ml-auto transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtro (#{selectedLugarTagFilter})</span>
                </button>
              )}
            </div>
          )}

          {/* Lista de Lugares */}
          {lugares.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  No hay lugares registrados en esta campaña
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Crea fichas de las regiones, ciudades, fortalezas, estancias y mazmorras que tus aventureros descubren.
                </p>
              </div>
              <button
                type="button"
                onClick={onNuevoLugar}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Crear primer lugar</span>
              </button>
            </div>
          ) : filteredLugares.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron lugares que coincidan con los criterios de búsqueda o filtros.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchLugarTerm('');
                  setTipoLugarFilter('todos');
                  setEstadoLugarFilter('todos');
                  setSelectedLugarTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLugares.map((loc) => {
                const subCount = lugares.filter((l) => l.padre_id === loc.id).length;
                const parentLugar = loc.padre_id
                  ? lugares.find((l) => l.id === loc.padre_id) || null
                  : null;

                return (
                  <LugarCard
                    key={loc.id}
                    lugar={loc}
                    parentLugar={parentLugar}
                    subLugaresCount={subCount}
                    modoApp={modoApp}
                    onSelect={onSelectLugar}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: MISIONES */}
      {activeTab === 'misiones' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas de Misiones */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Tablón de Misiones y Objetivos</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {misiones.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Encargos, misiones principales, contratos de recompensa y progreso paso a paso.
              </p>
            </div>

            {/* Botón + Nueva Misión (Solo DM o Host) */}
            {canManageCampaign && (
              <button
                id="nueva-mision-btn"
                type="button"
                onClick={onNuevaMision}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-colors shadow-md shadow-amber-950/40 shrink-0"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Nueva Misión</span>
              </button>
            )}
          </div>

          {/* Filtros y Búsqueda para Misiones */}
          <div className="p-4 rounded-xl bg-[#111827] border border-amber-900/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Buscador de misiones */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="search-misiones-input"
                  type="text"
                  placeholder="Buscar por título, pasos, descripción, recompensa o nota..."
                  value={searchMisionTerm}
                  onChange={(e) => setSearchMisionTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227] text-xs"
                />
                {searchMisionTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchMisionTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro por Estado */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  id="filter-estado-mision-select"
                  value={estadoMisionFilter}
                  onChange={(e) => setEstadoMisionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-slate-200 focus:outline-hidden focus:border-[#c9a227] text-xs"
                >
                  <option value="todas">Todos los estados</option>
                  <option value="activa">Activa (Dorado)</option>
                  <option value="completada">Completada (Verde)</option>
                  <option value="pausada">Pausada (Naranja)</option>
                  <option value="fallada">Fallada (Rojo)</option>
                  <option value="abandonada">Abandonada (Gris)</option>
                </select>
              </div>
            </div>

            {/* Chips de Etiquetas para Misiones */}
            {misionTagFrequencies.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>Etiquetas:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedMisionTagFilter(null)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    selectedMisionTagFilter === null
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Todas ({misiones.length})
                </button>

                {misionTagFrequencies.map(({ tag, count }) => {
                  const isSelected = selectedMisionTagFilter === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedMisionTagFilter(isSelected ? null : tag)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#c9a227] text-black font-semibold'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>#{tag}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-black/40 text-amber-200' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {selectedMisionTagFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedMisionTagFilter(null)}
                    className="inline-flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-200 ml-auto transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpiar filtro (#{selectedMisionTagFilter})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lista de Misiones */}
          {misiones.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                <Scroll className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  No hay misiones registradas en esta campaña
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Registra misiones, contratos de mercenarios, misterios y objetivos que tus héroes deben resolver.
                </p>
              </div>
              <button
                type="button"
                onClick={onNuevaMision}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Crear primera misión</span>
              </button>
            </div>
          ) : filteredMisiones.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron misiones que coincidan con los criterios de búsqueda o filtros.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchMisionTerm('');
                  setEstadoMisionFilter('todas');
                  setSelectedMisionTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMisiones.map((mision) => (
                <MisionCard
                  key={mision.id}
                  mision={mision}
                  npcs={npcs}
                  lugares={lugares}
                  modoApp={modoApp}
                  onSelect={onSelectMision}
                  onTagClick={(tag) => setSelectedMisionTagFilter(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: OBJETOS */}
      {activeTab === 'objetos' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas de objetos */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Inventario & Tesoros</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {objetos.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Búsqueda */}
              <div className="relative flex-1 sm:flex-initial sm:w-52">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="buscar-objetos-input"
                  type="text"
                  value={searchObjetoTerm}
                  onChange={(e) => setSearchObjetoTerm(e.target.value)}
                  placeholder="Buscar objetos, efectos..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#c9a227]"
                />
              </div>

              {/* Filtro por tipo de objeto */}
              <select
                id="filtro-tipo-objeto"
                value={tipoObjetoFilter}
                onChange={(e) => setTipoObjetoFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-[#c9a227]"
              >
                <option value="todos">Todos los tipos</option>
                {Object.entries(TIPO_OBJETO_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>

              {/* Filtro por portador */}
              <select
                id="filtro-portador-objeto"
                value={portadorFilter}
                onChange={(e) => setPortadorFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0e1522] border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-[#c9a227]"
              >
                <option value="todos">Todos los portadores</option>
                <option value="__sin_asignar__">Sin asignar / Alijo</option>
                {portadoresCampana.map((pj) => (
                  <option key={pj} value={pj}>
                    Lleva: {pj}
                  </option>
                ))}
              </select>

              {/* Botón + Nuevo objeto (Solo DM o Host) */}
              {canManageCampaign && (
                <button
                  id="nuevo-objeto-btn"
                  type="button"
                  onClick={onNuevoObjeto}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black shadow-md transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Nuevo objeto</span>
                </button>
              )}
            </div>
          </div>

          {/* Fila de Filtro de Etiquetas Temáticas de Objetos */}
          <div className="space-y-2">
            {objetoTagFrequencies.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 mr-1">
                  <Tag className="w-3.5 h-3.5 text-[#c9a227]" />
                  <span>Etiquetas:</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedObjetoTagFilter(null)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors shrink-0 ${
                    selectedObjetoTagFilter === null
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Todos ({objetos.length})
                </button>

                {objetoTagFrequencies.map(({ tag, count }) => {
                  const isSelected = selectedObjetoTagFilter === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedObjetoTagFilter(isSelected ? null : tag)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#c9a227] text-black font-semibold'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>#{tag}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-black/40 text-amber-200' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {selectedObjetoTagFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedObjetoTagFilter(null)}
                    className="inline-flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-200 ml-auto shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpiar (#{selectedObjetoTagFilter})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lista de Objetos */}
          {objetos.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  No hay objetos ni tesoros registrados en esta campaña
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Añade armas mágicas, armaduras, pociones, pergaminos, reliquias y botín que encuentre tu grupo.
                </p>
              </div>
              <button
                type="button"
                onClick={onNuevoObjeto}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Registrar primer objeto</span>
              </button>
            </div>
          ) : filteredObjetos.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron objetos que coincidan con los filtros seleccionados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchObjetoTerm('');
                  setTipoObjetoFilter('todos');
                  setPortadorFilter('todos');
                  setSelectedObjetoTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredObjetos.map((objeto) => (
                <ObjetoCard
                  key={objeto.id}
                  objeto={objeto}
                  modoApp={modoApp}
                  onSelect={onSelectObjeto}
                  onTagClick={(tag) => setSelectedObjetoTagFilter(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: BESTIARIO */}
      {activeTab === 'bestiario' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Barra de herramientas del Bestiario */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Bestiario y Cuaderno de Monstruos</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {monstruos.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cuaderno de campo: registra avistamientos, comportamientos, debilidades observadas y tácticas
              </p>
            </div>

            {/* Botón Registrar Criatura (Solo DM o Host) */}
            {canManageCampaign && (
              <button
                id="nuevo-monstruo-btn"
                type="button"
                onClick={onNuevoMonstruo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-colors shadow-md shadow-amber-950/20 shrink-0"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Registrar criatura</span>
              </button>
            )}
          </div>

          {/* Filtros: Búsqueda, Tipo y Etiquetas */}
          <div className="space-y-3 bg-[#111827] p-4 rounded-xl border border-amber-900/30">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Barra de Búsqueda */}
              <div className="relative sm:col-span-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="buscar-monstruos-input"
                  type="text"
                  placeholder="Buscar por nombre, debilidad, hábitat o notas..."
                  value={searchMonstruoTerm}
                  onChange={(e) => setSearchMonstruoTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#0b0f17] border border-slate-800 focus:border-[#c9a227] text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                />
                {searchMonstruoTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchMonstruoTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro por Tipo */}
              <div className="sm:col-span-4">
                <div className="relative">
                  <select
                    id="filtro-tipo-monstruo-select"
                    value={tipoMonstruoFilter}
                    onChange={(e) => setTipoMonstruoFilter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-[#0b0f17] border border-slate-800 focus:border-[#c9a227] text-xs text-slate-200 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="todos">Todos los tipos ({monstruos.length})</option>
                    {Object.entries(TIPO_MONSTRUO_CONFIG).map(([tipoKey, cfg]) => {
                      const count = monstruos.filter((m) => m.tipo === tipoKey).length;
                      return (
                        <option key={tipoKey} value={tipoKey}>
                          {cfg.label} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filtro por Etiquetas Temáticas */}
            {monstruoTagFrequencies.length > 0 && (
              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#c9a227]" /> Etiquetas:
                </span>
                {monstruoTagFrequencies.map(({ tag, count }) => {
                  const isSelected = selectedMonstruoTagFilter === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedMonstruoTagFilter(isSelected ? null : tag)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#c9a227] text-black font-semibold'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>#{tag}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-black/40 text-amber-200' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {selectedMonstruoTagFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedMonstruoTagFilter(null)}
                    className="inline-flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-200 ml-auto shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpiar (#{selectedMonstruoTagFilter})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lista de Criaturas del Bestiario */}
          {monstruos.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#111827] border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                <Skull className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  No hay criaturas registradas en el cuaderno de campo
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Anota los monstruos avistados, sus puntos débiles descubiertos, hábitos y tácticas de combate.
                </p>
              </div>
              <button
                type="button"
                onClick={onNuevoMonstruo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c9a227] hover:bg-[#dbb333] text-black transition-colors shadow-md"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Registrar primer monstruo</span>
              </button>
            </div>
          ) : filteredMonstruos.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No se encontraron criaturas que coincidan con los filtros seleccionados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchMonstruoTerm('');
                  setTipoMonstruoFilter('todos');
                  setSelectedMonstruoTagFilter(null);
                }}
                className="text-xs text-[#c9a227] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMonstruos.map((monstruo) => (
                <MonstruoCard
                  key={monstruo.id}
                  monstruo={monstruo}
                  modoApp={modoApp}
                  onSelect={onSelectMonstruo}
                  onTagClick={(tag) => setSelectedMonstruoTagFilter(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación para eliminar campaña */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`¿Eliminar campaña "${campana.nombre}"?`}
        message={`Esta acción eliminará permanentemente la campaña, sus ${sesiones.length} sesiones, sus ${npcs.length} NPCs, sus ${lugares.length} lugares, sus ${misiones.length} misiones, sus ${objetos.length} objetos y sus ${monstruos.length} monstruos asociados de tu navegador. ¿Deseas continuar?`}
        confirmText="Eliminar Campaña"
        isDangerous={true}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteCampana(campana.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Modal de Importar Entidad Individual */}
      {isImportEntityOpen && onImportEntity && (
        <ImportEntityModal
          isOpen={isImportEntityOpen}
          targetType={importTargetType}
          campanaId={campana.id}
          campanaNombre={campana.nombre}
          existingSessions={sesiones}
          onConfirmImport={(type: SingleEntityType, entity: any, ignoredRefs: string[]) => {
            onImportEntity(type, entity, ignoredRefs);
            setIsImportEntityOpen(false);
          }}
          onClose={() => setIsImportEntityOpen(false)}
        />
      )}
    </div>
  );
};
