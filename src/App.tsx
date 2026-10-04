/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Plus,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Users,
  Compass,
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
  ActitudNPC,
  TipoLugar,
  EstadoLugar,
  EstadoMision,
  CampanaTab,
  NavigationState,
  ViewType,
  PJ,
  EstadoPJ,
  ModoApp,
  TemaApp,
  SingleEntityType,
} from './types';
import {
  getCampanas,
  saveCampanas,
  getSesiones,
  saveSesiones,
  getNpcs,
  saveNpcs,
  getLugares,
  saveLugares,
  getMisiones,
  saveMisiones,
  getObjetos,
  saveObjetos,
  getMonstruos,
  saveMonstruos,
  getPjs,
  savePjs,
  getModoApp,
  saveModoApp,
  getTemaApp,
  saveTemaApp,
  applyTemaToDOM,
  exportarDatos,
  cargarEjemploInicial,
  migrateAllLegacyIdsToUUIDs,
} from './lib/storage';
import {
  syncSessionEntities,
  cleanupDeletedSession,
  cleanupDeletedEntityFromSessions,
} from './lib/linking';
import { Navbar } from './components/Navbar';
import { CampanaCard } from './components/CampanaCard';
import { CampanaModal } from './components/CampanaModal';
import { CampanaView } from './components/CampanaView';
import { SesionModal } from './components/SesionModal';
import { SesionView } from './components/SesionView';
import { NpcModal } from './components/NpcModal';
import { NpcView } from './components/NpcView';
import { LugarModal } from './components/LugarModal';
import { LugarView } from './components/LugarView';
import { LugarDeleteModal } from './components/LugarDeleteModal';
import { MisionModal } from './components/MisionModal';
import { MisionView } from './components/MisionView';
import { ObjetoModal } from './components/ObjetoModal';
import { ObjetoView } from './components/ObjetoView';
import { MonstruoModal } from './components/MonstruoModal';
import { MonstruoView } from './components/MonstruoView';
import { PjModal } from './components/PjModal';
import { PjDetailModal } from './components/PjDetailModal';
import { SearchEntityType } from './components/GlobalSearch';
import { ImportModal } from './components/ImportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './components/AuthModal';
import { JoinCampaignModal } from './components/JoinCampaignModal';
import { InviteModal } from './components/InviteModal';
import { PantallaInicio } from './components/PantallaInicio';
import { User } from '@supabase/supabase-js';
import { StorageDataSource, UserProfile, CloudCampaignWithRole, SupabaseRole } from './types/supabase';
import { getStorageMode, setStorageMode, getSupabase } from './lib/supabase';
import {
  fetchUserCampaigns,
  createCloudCampaign,
  updateCloudCampaign,
  deleteCloudCampaign,
  fetchCampaignEntities,
  syncCloudSession,
  deleteCloudSession,
  syncCloudNpc,
  deleteCloudNpc,
  syncCloudLugar,
  deleteCloudLugar,
  syncCloudMision,
  deleteCloudMision,
  syncCloudObjeto,
  deleteCloudObjeto,
  syncCloudMonstruo,
  deleteCloudMonstruo,
  syncCloudPj,
  deleteCloudPj,
  subscribeToCampaignRealtime,
  fetchUserProfile,
  uploadLocalCampaignToCloud,
  isUUID,
  generateUUID,
} from './services/supabaseService';
import { Cloud, HardDrive, Crown, UserPlus, Key, LogIn, ExternalLink, ArrowRight } from 'lucide-react';

export default function App() {
  // Estado de datos
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [monstruos, setMonstruos] = useState<Monstruo[]>([]);
  const [pjs, setPjs] = useState<PJ[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Navegación de vistas
  const [selectedCampanaId, setSelectedCampanaId] = useState<string | null>(null);
  const [selectedSesionId, setSelectedSesionId] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [selectedLugarId, setSelectedLugarId] = useState<string | null>(null);
  const [selectedMisionId, setSelectedMisionId] = useState<string | null>(null);
  const [selectedObjetoId, setSelectedObjetoId] = useState<string | null>(null);
  const [selectedMonstruoId, setSelectedMonstruoId] = useState<string | null>(null);
  const [activeCampaignTab, setActiveCampaignTab] = useState<CampanaTab>('diario');
  const [navStack, setNavStack] = useState<NavigationState[]>([]);
  const navStackRef = useRef<NavigationState[]>([]);
  const isInternalBackRef = useRef(false);

  // Modo de visualización de la App: Jugador o Dungeon Master (Fase 8)
  const [modoApp, setModoApp] = useState<ModoApp>(() => getModoApp());

  const handleToggleModoApp = () => {
    const next: ModoApp = modoApp === 'dm' ? 'jugador' : 'dm';
    setModoApp(next);
    saveModoApp(next);
  };

  // Tema visual de la aplicación (Fase 15)
  const [tema, setTema] = useState<TemaApp>(() => getTemaApp());

  const handleSelectTheme = (nuevoTema: TemaApp) => {
    setTema(nuevoTema);
    saveTemaApp(nuevoTema);
  };

  useEffect(() => {
    applyTemaToDOM(tema);
  }, [tema]);

  useEffect(() => {
    navStackRef.current = navStack;
  }, [navStack]);

  // Modales
  const [isCampanaModalOpen, setIsCampanaModalOpen] = useState(false);
  const [campanaToEdit, setCampanaToEdit] = useState<Campana | null>(null);

  const [isSesionModalOpen, setIsSesionModalOpen] = useState(false);
  const [sesionToEdit, setSesionToEdit] = useState<Sesion | null>(null);

  const [isPjModalOpen, setIsPjModalOpen] = useState(false);
  const [pjToEdit, setPjToEdit] = useState<PJ | null>(null);
  const [pjToDelete, setPjToDelete] = useState<PJ | null>(null);
  const [selectedPjDetail, setSelectedPjDetail] = useState<PJ | null>(null);

  const [isNpcModalOpen, setIsNpcModalOpen] = useState(false);
  const [npcToEdit, setNpcToEdit] = useState<NPC | null>(null);

  const [isLugarModalOpen, setIsLugarModalOpen] = useState(false);
  const [lugarToEdit, setLugarToEdit] = useState<Lugar | null>(null);
  const [lugarPadreDefaultId, setLugarPadreDefaultId] = useState<string | null>(null);

  const [isLugarDeleteModalOpen, setIsLugarDeleteModalOpen] = useState(false);
  const [lugarToDelete, setLugarToDelete] = useState<Lugar | null>(null);

  const [isMisionModalOpen, setIsMisionModalOpen] = useState(false);
  const [misionToEdit, setMisionToEdit] = useState<Mision | null>(null);

  const [isObjetoModalOpen, setIsObjetoModalOpen] = useState(false);
  const [objetoToEdit, setObjetoToEdit] = useState<Objeto | null>(null);

  const [isMonstruoModalOpen, setIsMonstruoModalOpen] = useState(false);
  const [monstruoToEdit, setMonstruoToEdit] = useState<Monstruo | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Modal de confirmación para borrar campaña desde la lista principal
  const [campanaToDelete, setCampanaToDelete] = useState<Campana | null>(null);

  // Filtro y búsqueda en pantalla principal
  const [filtroSistema, setFiltroSistema] = useState<string>('todos');
  const [busquedaCampana, setBusquedaCampana] = useState('');

  // ============================================================================
  // FASE 16: ESTADO Y LOGICA DE MULTIJUGADOR CON SUPABASE
  // ============================================================================
  const [storageMode, setStorageModeState] = useState<StorageDataSource>(() => getStorageMode());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const currentUserRef = useRef<User | null>(null);
  currentUserRef.current = currentUser;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cloudCampaignsWithRoles, setCloudCampaignsWithRoles] = useState<CloudCampaignWithRole[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [urlInviteToken, setUrlInviteToken] = useState<string | null>(null);

  // Control de pantalla de inicio: si es false y no hay usuario, se muestra la pantalla de inicio
  const [hasEnteredGuestMode, setHasEnteredGuestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bitacora_guest_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Escuchar tokens de invitación en URL (?token=... o ?join=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('join') || params.get('token');
      if (token) {
        setUrlInviteToken(token);
        setIsJoinModalOpen(true);
        if (getStorageMode() !== 'cloud') {
          setStorageMode('cloud');
          setStorageModeState('cloud');
        }
      }
    } catch {
      // Ignorar restricciones de URL en iframes
    }
  }, []);

  // Cargar campañas en la nube (función estable sin dependencias que causen re-renders infinitos)
  const loadCloudCampaigns = useCallback(async (userId?: string) => {
    const uid = userId || currentUserRef.current?.id;
    if (!uid) {
      setCloudCampaignsWithRoles([]);
      setCampanas([]);
      return;
    }
    setIsLoadingCloud(true);
    try {
      const list = await fetchUserCampaigns(uid);
      const cloudCamps = list.map((c) => c.campana);
      const localCamps = getCampanas();

      const allWithRoles: CloudCampaignWithRole[] = [
        ...list,
        ...localCamps
          .filter((lc) => !list.some((item) => item.campana.id === lc.id))
          .map((lc) => ({
            campana: lc,
            role: 'host' as SupabaseRole,
            isHost: true,
            memberCount: 1,
          })),
      ];
      setCloudCampaignsWithRoles(allWithRoles);

      if (cloudCamps.length > 0) {
        const merged = [
          ...cloudCamps,
          ...localCamps.filter((lc) => !cloudCamps.some((cc) => cc.id === lc.id)),
        ];
        setCampanas(merged);
        saveCampanas(merged);
      } else {
        // Si la nube aún no tiene campañas o no está configurada, mantener las campañas locales
        setCampanas(localCamps);
      }
    } catch (err) {
      console.error('Error al cargar campañas en la nube:', err);
      const localCamps = getCampanas();
      setCampanas(localCamps);
      setCloudCampaignsWithRoles(
        localCamps.map((lc) => ({
          campana: lc,
          role: 'host' as SupabaseRole,
          isHost: true,
          memberCount: 1,
        }))
      );
    } finally {
      setIsLoadingCloud(false);
    }
  }, []);

  // Escuchar cambios de sesión de Supabase Auth (se monta una sola vez sin provocar bucles)
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      if (user?.id !== currentUserRef.current?.id) {
        setCurrentUser(user);
        currentUserRef.current = user;
        if (user) {
          fetchUserProfile(user.id).then(setUserProfile);
          setHasEnteredGuestMode(true);
          try {
            localStorage.setItem('bitacora_guest_mode', 'true');
          } catch {}
          setStorageMode('cloud');
          setStorageModeState('cloud');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user?.id !== currentUserRef.current?.id) {
        setCurrentUser(user);
        currentUserRef.current = user;
        if (user) {
          fetchUserProfile(user.id).then(setUserProfile);
          setHasEnteredGuestMode(true);
          try {
            localStorage.setItem('bitacora_guest_mode', 'true');
          } catch {}
          setStorageMode('cloud');
          setStorageModeState('cloud');
        } else {
          setUserProfile(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cambiar entre modo Local y modo Nube
  const handleToggleStorageMode = (newMode: StorageDataSource) => {
    setStorageMode(newMode);
    setStorageModeState(newMode);
    setSelectedCampanaId(null);
    setSelectedSesionId(null);
    setSelectedNpcId(null);
    setSelectedLugarId(null);
    setSelectedMisionId(null);
    setSelectedObjetoId(null);
    setSelectedMonstruoId(null);

    // Siempre recargar datos locales para que las listas estén listas
    const storedCampanas = getCampanas();
    const storedSesiones = getSesiones();
    const storedNpcs = getNpcs();
    const storedLugares = getLugares();
    const storedMisiones = getMisiones();
    const storedObjetos = getObjetos();
    const storedMonstruos = getMonstruos();
    const storedPjs = getPjs();

    setSesiones(storedSesiones);
    setNpcs(storedNpcs);
    setLugares(storedLugares);
    setMisiones(storedMisiones);
    setObjetos(storedObjetos);
    setMonstruos(storedMonstruos);
    setPjs(storedPjs);

    if (newMode === 'local') {
      setCampanas(storedCampanas);
    } else if (currentUser?.id) {
      loadCloudCampaigns(currentUser.id);
    }
  };

  // Cargar datos según modo de almacenamiento (Arquitectura híbrida offline-first)
  useEffect(() => {
    // 0. Migrar cualquier ID legado en localStorage a UUIDs estándar para compatibilidad total
    migrateAllLegacyIdsToUUIDs();

    // 1. Siempre cargar primero los datos locales de localStorage (resiliencia offline-first)
    const storedCampanas = getCampanas();
    const storedSesiones = getSesiones();
    const storedNpcs = getNpcs();
    const storedLugares = getLugares();
    const storedMisiones = getMisiones();
    const storedObjetos = getObjetos();
    const storedMonstruos = getMonstruos();
    const storedPjs = getPjs();

    setSesiones(storedSesiones);
    setNpcs(storedNpcs);
    setLugares(storedLugares);
    setMisiones(storedMisiones);
    setObjetos(storedObjetos);
    setMonstruos(storedMonstruos);
    setPjs(storedPjs);

    if (storageMode === 'cloud') {
      if (currentUser?.id) {
        loadCloudCampaigns(currentUser.id);
      } else {
        setCloudCampaignsWithRoles([]);
        setCampanas(storedCampanas);
      }
    } else {
      setCampanas(storedCampanas);
    }
    setLoaded(true);
  }, [storageMode, currentUser?.id, loadCloudCampaigns]);

  // Cargar entidades y suscribirse a Realtime cuando se abre una campaña en la nube
  useEffect(() => {
    if (storageMode !== 'cloud' || !selectedCampanaId) return;

    let isSubscribed = true;
    fetchCampaignEntities(selectedCampanaId).then((entities) => {
      if (!isSubscribed) return;

      const localSesiones = getSesiones();
      const localNpcs = getNpcs();
      const localLugares = getLugares();
      const localMisiones = getMisiones();
      const localObjetos = getObjetos();
      const localMonstruos = getMonstruos();
      const localPjs = getPjs();

      const canSyncToCloud = isUUID(selectedCampanaId);

      // --- 1. SESIONES ---
      const localSesForCamp = localSesiones.filter((s) => s.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localSesForCamp.forEach((s) => {
          if (!entities.sesiones.some((es) => es.id === s.id)) {
            syncCloudSession(s, selectedCampanaId);
          }
        });
      }
      const mergedSesiones = [
        ...entities.sesiones,
        ...localSesForCamp.filter((s) => !entities.sesiones.some((es) => es.id === s.id)),
        ...localSesiones.filter((s) => s.campana_id !== selectedCampanaId),
      ];
      setSesiones(mergedSesiones);
      saveSesiones(mergedSesiones);

      // --- 2. NPCS ---
      const localNpcsForCamp = localNpcs.filter((n) => n.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localNpcsForCamp.forEach((n) => {
          if (!entities.npcs.some((en) => en.id === n.id)) {
            syncCloudNpc(n, selectedCampanaId);
          }
        });
      }
      const mergedNpcs = [
        ...entities.npcs,
        ...localNpcsForCamp.filter((n) => !entities.npcs.some((en) => en.id === n.id)),
        ...localNpcs.filter((n) => n.campana_id !== selectedCampanaId),
      ];
      setNpcs(mergedNpcs);
      saveNpcs(mergedNpcs);

      // --- 3. LUGARES ---
      const localLugForCamp = localLugares.filter((l) => l.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localLugForCamp.forEach((l) => {
          if (!entities.lugares.some((el) => el.id === l.id)) {
            syncCloudLugar(l, selectedCampanaId);
          }
        });
      }
      const mergedLugares = [
        ...entities.lugares,
        ...localLugForCamp.filter((l) => !entities.lugares.some((el) => el.id === l.id)),
        ...localLugares.filter((l) => l.campana_id !== selectedCampanaId),
      ];
      setLugares(mergedLugares);
      saveLugares(mergedLugares);

      // --- 4. MISIONES ---
      const localMisForCamp = localMisiones.filter((m) => m.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localMisForCamp.forEach((m) => {
          if (!entities.misiones.some((em) => em.id === m.id)) {
            syncCloudMision(m, selectedCampanaId);
          }
        });
      }
      const mergedMisiones = [
        ...entities.misiones,
        ...localMisForCamp.filter((m) => !entities.misiones.some((em) => em.id === m.id)),
        ...localMisiones.filter((m) => m.campana_id !== selectedCampanaId),
      ];
      setMisiones(mergedMisiones);
      saveMisiones(mergedMisiones);

      // --- 5. OBJETOS ---
      const localObjForCamp = localObjetos.filter((o) => o.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localObjForCamp.forEach((o) => {
          if (!entities.objetos.some((eo) => eo.id === o.id)) {
            syncCloudObjeto(o, selectedCampanaId);
          }
        });
      }
      const mergedObjetos = [
        ...entities.objetos,
        ...localObjForCamp.filter((o) => !entities.objetos.some((eo) => eo.id === o.id)),
        ...localObjetos.filter((o) => o.campana_id !== selectedCampanaId),
      ];
      setObjetos(mergedObjetos);
      saveObjetos(mergedObjetos);

      // --- 6. MONSTRUOS ---
      const localMonForCamp = localMonstruos.filter((mo) => mo.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localMonForCamp.forEach((mo) => {
          if (!entities.monstruos.some((em) => em.id === mo.id)) {
            syncCloudMonstruo(mo, selectedCampanaId);
          }
        });
      }
      const mergedMonstruos = [
        ...entities.monstruos,
        ...localMonForCamp.filter((mo) => !entities.monstruos.some((em) => em.id === mo.id)),
        ...localMonstruos.filter((mo) => mo.campana_id !== selectedCampanaId),
      ];
      setMonstruos(mergedMonstruos);
      saveMonstruos(mergedMonstruos);

      // --- 7. PJS ---
      const localPjsForCamp = localPjs.filter((p) => p.campana_id === selectedCampanaId);
      if (canSyncToCloud) {
        localPjsForCamp.forEach((p) => {
          if (!entities.pjs.some((ep) => ep.id === p.id)) {
            syncCloudPj(p, selectedCampanaId);
          }
        });
      }
      const mergedPjs = [
        ...entities.pjs,
        ...localPjsForCamp.filter((p) => !entities.pjs.some((ep) => ep.id === p.id)),
        ...localPjs.filter((p) => p.campana_id !== selectedCampanaId),
      ];
      setPjs(mergedPjs);
      savePjs(mergedPjs);
    });

    const channel = subscribeToCampaignRealtime(selectedCampanaId, () => {
      fetchCampaignEntities(selectedCampanaId).then((entities) => {
        if (!isSubscribed) return;
        setSesiones((prev) => {
          const next = [
            ...entities.sesiones,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          saveSesiones(next);
          return next;
        });
        setNpcs((prev) => {
          const next = [
            ...entities.npcs,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          saveNpcs(next);
          return next;
        });
        setLugares((prev) => {
          const next = [
            ...entities.lugares,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          saveLugares(next);
          return next;
        });
        setMisiones((prev) => {
          const next = [
            ...entities.misiones,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          saveMisiones(next);
          return next;
        });
        setObjetos((prev) => {
          const next = [
            ...entities.objetos,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          saveObjetos(next);
          return next;
        });
        setMonstruos((prev) => {
          const next = [
            ...entities.monstruos,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          saveMonstruos(next);
          return next;
        });
        setPjs((prev) => {
          const next = [
            ...entities.pjs,
            ...prev.filter((p) => p.campana_id !== selectedCampanaId),
          ];
          savePjs(next);
          return next;
        });
      });
    });

    return () => {
      isSubscribed = false;
      channel?.unsubscribe();
    };
  }, [storageMode, selectedCampanaId]);

  // Rol del usuario en la campaña activa (host | dm | player)
  const activeCloudRole: SupabaseRole = useMemo(() => {
    if (storageMode !== 'cloud' || !selectedCampanaId) return 'host';
    const found = cloudCampaignsWithRoles.find((c) => c.campana.id === selectedCampanaId);
    return found?.role || 'player';
  }, [storageMode, selectedCampanaId, cloudCampaignsWithRoles]);

  // Actualizar localStorage cada vez que cambien campañas
  const handleUpdateCampanas = (updated: Campana[]) => {
    setCampanas(updated);
    saveCampanas(updated);
  };

  // Actualizar localStorage cada vez que cambien PJs
  const handleUpdatePjs = (updated: PJ[]) => {
    setPjs(updated);
    savePjs(updated);
  };

  // Actualizar localStorage cada vez que cambien sesiones
  const handleUpdateSesiones = (updated: Sesion[]) => {
    setSesiones(updated);
    saveSesiones(updated);
  };

  // Actualizar localStorage cada vez que cambien NPCs
  const handleUpdateNpcs = (updated: NPC[]) => {
    setNpcs(updated);
    saveNpcs(updated);
  };

  // Actualizar localStorage cada vez que cambien Lugares
  const handleUpdateLugares = (updated: Lugar[]) => {
    setLugares(updated);
    saveLugares(updated);
  };

  // Actualizar localStorage cada vez que cambien Misiones
  const handleUpdateMisiones = (updated: Mision[]) => {
    setMisiones(updated);
    saveMisiones(updated);
  };

  // Actualizar localStorage cada vez que cambien Objetos
  const handleUpdateObjetos = (updated: Objeto[]) => {
    setObjetos(updated);
    saveObjetos(updated);
  };

  // Actualizar localStorage cada vez que cambien Monstruos
  const handleUpdateMonstruos = (updated: Monstruo[]) => {
    setMonstruos(updated);
    saveMonstruos(updated);
  };

  // Actualizar entidad individual (p.ej. notas del DM u otros campos in-situ)
  const handleUpdateCampana = (updatedCampana: Campana) => {
    handleUpdateCampanas(campanas.map((c) => (c.id === updatedCampana.id ? updatedCampana : c)));
    if (storageMode === 'cloud' && isUUID(updatedCampana.id)) {
      updateCloudCampaign(updatedCampana);
    }
  };

  const handleUpdateSesion = (updatedSesion: Sesion) => {
    handleUpdateSesiones(sesiones.map((s) => (s.id === updatedSesion.id ? updatedSesion : s)));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudSession(updatedSesion, selectedCampanaId);
    }
  };

  const handleUpdateNpc = (updatedNpc: NPC) => {
    handleUpdateNpcs(npcs.map((n) => (n.id === updatedNpc.id ? updatedNpc : n)));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudNpc(updatedNpc, selectedCampanaId);
    }
  };

  const handleUpdateLugar = (updatedLugar: Lugar) => {
    handleUpdateLugares(lugares.map((l) => (l.id === updatedLugar.id ? updatedLugar : l)));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudLugar(updatedLugar, selectedCampanaId);
    }
  };

  const handleUpdateMision = (updatedMision: Mision) => {
    handleUpdateMisiones(misiones.map((m) => (m.id === updatedMision.id ? updatedMision : m)));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudMision(updatedMision, selectedCampanaId);
    }
  };

  const handleUpdateObjeto = (updatedObjeto: Objeto) => {
    handleUpdateObjetos(objetos.map((o) => (o.id === updatedObjeto.id ? updatedObjeto : o)));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudObjeto(updatedObjeto, selectedCampanaId);
    }
  };

  const handleUpdateMonstruo = (updatedMonstruo: Monstruo) => {
    handleUpdateMonstruos(monstruos.map((m) => (m.id === updatedMonstruo.id ? updatedMonstruo : m)));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudMonstruo(updatedMonstruo, selectedCampanaId);
    }
  };

  const handleUpdatePj = (updatedPj: PJ) => {
    handleUpdatePjs(pjs.map((p) => (p.id === updatedPj.id ? updatedPj : p)));
    if (selectedPjDetail && selectedPjDetail.id === updatedPj.id) {
      setSelectedPjDetail(updatedPj);
    }
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudPj(updatedPj, selectedCampanaId);
    }
  };

  // Importar entidad individual a la campaña activa (Fase 8)
  const handleImportSingleEntity = (type: SingleEntityType, entity: any, _ignoredRefs: string[]) => {
    const safeEntity = {
      ...entity,
      id: isUUID(entity.id) ? entity.id : generateUUID(),
      campana_id: selectedCampanaId || entity.campana_id,
    };
    switch (type) {
      case 'sesion':
        handleUpdateSesiones([safeEntity, ...sesiones]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudSession(safeEntity, selectedCampanaId);
        }
        break;
      case 'npc':
        handleUpdateNpcs([safeEntity, ...npcs]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudNpc(safeEntity, selectedCampanaId);
        }
        break;
      case 'lugar':
        handleUpdateLugares([safeEntity, ...lugares]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudLugar(safeEntity, selectedCampanaId);
        }
        break;
      case 'mision':
        handleUpdateMisiones([safeEntity, ...misiones]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudMision(safeEntity, selectedCampanaId);
        }
        break;
      case 'objeto':
        handleUpdateObjetos([safeEntity, ...objetos]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudObjeto(safeEntity, selectedCampanaId);
        }
        break;
      case 'monstruo':
        handleUpdateMonstruos([safeEntity, ...monstruos]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudMonstruo(safeEntity, selectedCampanaId);
        }
        break;
      case 'pj':
        handleUpdatePjs([safeEntity, ...pjs]);
        if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
          syncCloudPj(safeEntity, selectedCampanaId);
        }
        break;
    }
  };

  // Obtener la fecha de la última sesión para una campaña
  const getUltimaSesionFecha = (campanaId: string): string | null => {
    const sesDeCampana = sesiones.filter((s) => s.campana_id === campanaId);
    if (sesDeCampana.length === 0) return null;
    const sorted = [...sesDeCampana].sort((a, b) => b.fecha_real.localeCompare(a.fecha_real));
    return sorted[0].fecha_real;
  };

  // Obtener la campaña actualmente seleccionada
  const activeCampana = campanas.find((c) => c.id === selectedCampanaId) || null;

  // Sesiones de la campaña activa
  const activeCampanaSesiones = selectedCampanaId
    ? sesiones.filter((s) => s.campana_id === selectedCampanaId)
    : [];

  // NPCs de la campaña activa
  const activeCampanaNpcs = selectedCampanaId
    ? npcs.filter((n) => n.campana_id === selectedCampanaId)
    : [];

  // Lugares de la campaña activa
  const activeCampanaLugares = selectedCampanaId
    ? lugares.filter((l) => l.campana_id === selectedCampanaId)
    : [];

  // Misiones de la campaña activa
  const activeCampanaMisiones = selectedCampanaId
    ? misiones.filter((m) => m.campana_id === selectedCampanaId)
    : [];

  // Objetos de la campaña activa
  const activeCampanaObjetos = selectedCampanaId
    ? objetos.filter((o) => o.campana_id === selectedCampanaId)
    : [];

  // Monstruos de la campaña activa
  const activeCampanaMonstruos = selectedCampanaId
    ? monstruos.filter((m) => m.campana_id === selectedCampanaId)
    : [];

  // Personajes del grupo (PJs) de la campaña activa
  const activeCampanaPjs = selectedCampanaId
    ? pjs.filter((p) => p.campana_id === selectedCampanaId)
    : [];

  // Entidades actualmente seleccionadas
  const activeSesion = sesiones.find((s) => s.id === selectedSesionId) || null;
  const activeNpc = npcs.find((n) => n.id === selectedNpcId) || null;
  const activeLugar = lugares.find((l) => l.id === selectedLugarId) || null;
  const activeMision = misiones.find((m) => m.id === selectedMisionId) || null;
  const activeObjeto = objetos.find((o) => o.id === selectedObjetoId) || null;
  const activeMonstruo = monstruos.find((m) => m.id === selectedMonstruoId) || null;

  // Lógica de navegación contextual con pila e historial (Fase 8)
  const getCurrentNavState = (): NavigationState => {
    if (!selectedCampanaId) {
      return { view: 'campanas', campanaId: null, originLabel: 'Volver a Campañas' };
    }
    if (selectedSesionId) {
      const s = sesiones.find((x) => x.id === selectedSesionId);
      return {
        view: 'sesion',
        campanaId: selectedCampanaId,
        entityId: selectedSesionId,
        originLabel: s ? `Volver a Sesión #${s.numero}` : 'Volver a la Sesión',
      };
    }
    if (selectedNpcId) {
      const n = npcs.find((x) => x.id === selectedNpcId);
      return {
        view: 'npc',
        campanaId: selectedCampanaId,
        entityId: selectedNpcId,
        originLabel: n ? `Volver a ${n.nombre}` : 'Volver al NPC',
      };
    }
    if (selectedLugarId) {
      const l = lugares.find((x) => x.id === selectedLugarId);
      return {
        view: 'lugar',
        campanaId: selectedCampanaId,
        entityId: selectedLugarId,
        originLabel: l ? `Volver a ${l.nombre}` : 'Volver al Lugar',
      };
    }
    if (selectedMisionId) {
      const m = misiones.find((x) => x.id === selectedMisionId);
      return {
        view: 'mision',
        campanaId: selectedCampanaId,
        entityId: selectedMisionId,
        originLabel: m ? `Volver a ${m.titulo}` : 'Volver a la Misión',
      };
    }
    if (selectedObjetoId) {
      const o = objetos.find((x) => x.id === selectedObjetoId);
      return {
        view: 'objeto',
        campanaId: selectedCampanaId,
        entityId: selectedObjetoId,
        originLabel: o ? `Volver a ${o.nombre}` : 'Volver al Objeto',
      };
    }
    if (selectedMonstruoId) {
      const mo = monstruos.find((x) => x.id === selectedMonstruoId);
      return {
        view: 'monstruo',
        campanaId: selectedCampanaId,
        entityId: selectedMonstruoId,
        originLabel: mo ? `Volver a ${mo.nombre}` : 'Volver al Monstruo',
      };
    }

    const tabNames: Record<CampanaTab, string> = {
      resumen: 'Volver al Resumen',
      diario: 'Volver al Diario',
      sesiones: 'Volver a Sesiones',
      grupo: 'Volver al Grupo',
      npcs: 'Volver a NPCs',
      lugares: 'Volver a Lugares',
      misiones: 'Volver a Misiones',
      objetos: 'Volver a Objetos',
      bestiario: 'Volver al Bestiario',
      mapa: 'Volver al Mapa',
      miembros: 'Volver a Miembros',
    };

    return {
      view: 'campana',
      campanaId: selectedCampanaId,
      campaignTab: activeCampaignTab,
      originLabel: tabNames[activeCampaignTab] || 'Volver a la Campaña',
    };
  };

  const applyNavState = (state: NavigationState) => {
    setSelectedCampanaId(state.campanaId);
    setSelectedSesionId(state.view === 'sesion' ? state.entityId || null : null);
    setSelectedNpcId(state.view === 'npc' ? state.entityId || null : null);
    setSelectedLugarId(state.view === 'lugar' ? state.entityId || null : null);
    setSelectedMisionId(state.view === 'mision' ? state.entityId || null : null);
    setSelectedObjetoId(state.view === 'objeto' ? state.entityId || null : null);
    setSelectedMonstruoId(state.view === 'monstruo' ? state.entityId || null : null);
    if (state.campaignTab) {
      setActiveCampaignTab(state.campaignTab);
    }
  };

  const navigateTo = (target: NavigationState) => {
    const current = getCurrentNavState();
    const isSame =
      current.view === target.view &&
      current.campanaId === target.campanaId &&
      current.entityId === target.entityId &&
      current.campaignTab === target.campaignTab;

    if (!isSame) {
      const newStack = [...navStackRef.current, current];
      setNavStack(newStack);
      navStackRef.current = newStack;

      try {
        window.history.pushState(
          { target, prev: current, depth: newStack.length },
          ''
        );
      } catch {
        // En algunos iframes la API pushState puede arrojar excepciones de seguridad
      }
    }

    applyNavState(target);
  };

  const navigateBack = () => {
    if (navStackRef.current.length > 0) {
      const newStack = [...navStackRef.current];
      const prev = newStack.pop()!;
      setNavStack(newStack);
      navStackRef.current = newStack;

      applyNavState(prev);

      isInternalBackRef.current = true;
      try {
        window.history.back();
      } catch {
        // Ignorar
      }
    } else {
      if (
        selectedSesionId ||
        selectedNpcId ||
        selectedLugarId ||
        selectedMisionId ||
        selectedObjetoId ||
        selectedMonstruoId
      ) {
        setSelectedSesionId(null);
        setSelectedNpcId(null);
        setSelectedLugarId(null);
        setSelectedMisionId(null);
        setSelectedObjetoId(null);
        setSelectedMonstruoId(null);
      } else if (selectedCampanaId) {
        setSelectedCampanaId(null);
      }
    }
  };

  // Escuchar botón de Atrás / Adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      if (isInternalBackRef.current) {
        isInternalBackRef.current = false;
        return;
      }

      if (navStackRef.current.length > 0) {
        const newStack = [...navStackRef.current];
        const prev = newStack.pop()!;
        setNavStack(newStack);
        navStackRef.current = newStack;
        applyNavState(prev);
      } else {
        if (
          selectedSesionId ||
          selectedNpcId ||
          selectedLugarId ||
          selectedMisionId ||
          selectedObjetoId ||
          selectedMonstruoId
        ) {
          setSelectedSesionId(null);
          setSelectedNpcId(null);
          setSelectedLugarId(null);
          setSelectedMisionId(null);
          setSelectedObjetoId(null);
          setSelectedMonstruoId(null);
        } else if (selectedCampanaId) {
          setSelectedCampanaId(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    selectedCampanaId,
    selectedSesionId,
    selectedNpcId,
    selectedLugarId,
    selectedMisionId,
    selectedObjetoId,
    selectedMonstruoId,
  ]);

  const currentBackLabel = useMemo(() => {
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      if (prev.originLabel) return prev.originLabel;
    }
    if (activeCampana) {
      return `Volver a ${activeCampana.nombre}`;
    }
    return 'Volver';
  }, [navStack, activeCampana]);

  const handleNavigateToEntity = (
    type: 'sesion' | 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo' | 'pj',
    id: string
  ) => {
    if (type === 'pj') {
      const pj = pjs.find((p) => p.id === id);
      if (pj) setSelectedPjDetail(pj);
      setActiveCampaignTab('grupo');
      return;
    }
    navigateTo({
      view: type,
      campanaId: selectedCampanaId,
      entityId: id,
    });
  };

  const handleSelectSesion = (sesion: Sesion) => {
    navigateTo({
      view: 'sesion',
      campanaId: sesion.campana_id,
      entityId: sesion.id,
    });
  };

  const handleSelectNpc = (npc: NPC) => {
    navigateTo({
      view: 'npc',
      campanaId: npc.campana_id,
      entityId: npc.id,
    });
  };

  const handleSelectLugar = (lugar: Lugar) => {
    navigateTo({
      view: 'lugar',
      campanaId: lugar.campana_id,
      entityId: lugar.id,
    });
  };

  const handleSelectMision = (mision: Mision) => {
    navigateTo({
      view: 'mision',
      campanaId: mision.campana_id,
      entityId: mision.id,
    });
  };

  const handleSelectObjeto = (objeto: Objeto) => {
    navigateTo({
      view: 'objeto',
      campanaId: objeto.campana_id,
      entityId: objeto.id,
    });
  };

  const handleSelectMonstruo = (monstruo: Monstruo) => {
    navigateTo({
      view: 'monstruo',
      campanaId: monstruo.campana_id,
      entityId: monstruo.id,
    });
  };

  // Manejar guardado de campaña (crear o editar)
  const handleSaveCampana = async (campana: Campana) => {
    if (storageMode === 'cloud' && currentUser) {
      const exists = campanas.some((c) => c.id === campana.id);
      if (exists) {
        await updateCloudCampaign(campana);
        const updated = campanas.map((c) => (c.id === campana.id ? campana : c));
        setCampanas(updated);
        setCloudCampaignsWithRoles((prev) =>
          prev.map((item) => (item.campana.id === campana.id ? { ...item, campana } : item))
        );
        // Mantener sincronizado el almacenamiento local
        const currentLocal = getCampanas();
        saveCampanas(currentLocal.map((c) => (c.id === campana.id ? campana : c)));
      } else {
        const { campana: created, error } = await createCloudCampaign(
          campana.nombre,
          campana.sistema,
          campana.descripcion,
          campana.fecha_inicio
        );
        if (created) {
          setCampanas((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
          setCloudCampaignsWithRoles((prev) => [
            { campana: created, role: 'host', isHost: true, memberCount: 1 },
            ...prev.filter((item) => item.campana.id !== created.id),
          ]);
          // Guardar copia local en localStorage para que no desaparezca si el usuario cambia a Modo Local
          const currentLocal = getCampanas();
          saveCampanas([created, ...currentLocal.filter((c) => c.id !== created.id)]);

          // Abrir la campaña creada
          navigateTo({
            view: 'campana',
            campanaId: created.id,
            campaignTab: 'diario',
          });
        } else if (error) {
          console.error('Error al crear campaña en Supabase:', error);
          alert(`No se pudo crear la campaña en la nube: ${error}`);
        }
      }
    } else {
      const exists = campanas.some((c) => c.id === campana.id);
      let updated: Campana[];
      if (exists) {
        updated = campanas.map((c) => (c.id === campana.id ? campana : c));
      } else {
        updated = [campana, ...campanas];
      }
      handleUpdateCampanas(updated);
    }
  };

  // Subir la campaña actualmente abierta de Modo Local a Modo Nube (Supabase)
  const handleUploadActiveCampaignToCloud = async (): Promise<string | null> => {
    if (!activeCampana) return null;
    if (!currentUser) {
      setIsInviteModalOpen(false);
      handleOpenAuth('login');
      return null;
    }

    try {
      const { campana: newCampana, error } = await uploadLocalCampaignToCloud(
        activeCampana,
        {
          sesiones: activeCampanaSesiones,
          npcs: activeCampanaNpcs,
          lugares: activeCampanaLugares,
          misiones: activeCampanaMisiones,
          objetos: activeCampanaObjetos,
          monstruos: activeCampanaMonstruos,
          pjs: activeCampanaPjs,
        }
      );

      if (error || !newCampana) {
        console.error('Error al subir campaña a la nube:', error);
        return null;
      }

      // Cambiar a modo Nube en la app
      setStorageMode('cloud');
      setStorageModeState('cloud');

      // Recargar campañas desde Supabase
      await loadCloudCampaigns(currentUser.id);

      // Redirigir a la nueva campaña en la nube
      setSelectedCampanaId(newCampana.id);

      return newCampana.id;
    } catch (err) {
      console.error('Error inesperado al subir campaña a la nube:', err);
      return null;
    }
  };

  // Manejar eliminación de campaña y sus sesiones, npcs, lugares, misiones, objetos y monstruos asociados
  const handleDeleteCampana = async (campanaId: string) => {
    if (storageMode === 'cloud') {
      await deleteCloudCampaign(campanaId);
      setCloudCampaignsWithRoles((prev) => prev.filter((item) => item.campana.id !== campanaId));
    }
    const updatedCampanas = campanas.filter((c) => c.id !== campanaId);
    const updatedSesiones = sesiones.filter((s) => s.campana_id !== campanaId);
    const updatedNpcs = npcs.filter((n) => n.campana_id !== campanaId);
    const updatedLugares = lugares.filter((l) => l.campana_id !== campanaId);
    const updatedMisiones = misiones.filter((m) => m.campana_id !== campanaId);
    const updatedObjetos = objetos.filter((o) => o.campana_id !== campanaId);
    const updatedMonstruos = monstruos.filter((m) => m.campana_id !== campanaId);

    handleUpdateCampanas(updatedCampanas);
    handleUpdateSesiones(updatedSesiones);
    handleUpdateNpcs(updatedNpcs);
    handleUpdateLugares(updatedLugares);
    handleUpdateMisiones(updatedMisiones);
    handleUpdateObjetos(updatedObjetos);
    handleUpdateMonstruos(updatedMonstruos);

    if (selectedCampanaId === campanaId) {
      setSelectedCampanaId(null);
      setSelectedSesionId(null);
      setSelectedNpcId(null);
      setSelectedLugarId(null);
      setSelectedMisionId(null);
      setSelectedObjetoId(null);
      setSelectedMonstruoId(null);
    }
  };

  // Manejar guardado de sesión (crear o editar)
  const handleSaveSesion = (sesion: Sesion) => {
    const previous = sesiones.find((s) => s.id === sesion.id) || null;
    const exists = sesiones.some((s) => s.id === sesion.id);
    let updatedSesiones: Sesion[];
    if (exists) {
      updatedSesiones = sesiones.map((s) => (s.id === sesion.id ? sesion : s));
    } else {
      updatedSesiones = [...sesiones, sesion];
    }
    handleUpdateSesiones(updatedSesiones);

    // Sincronización bidireccional con entidades vinculadas (Fase 7)
    const {
      updatedNpcs,
      updatedLugares,
      updatedMisiones,
      updatedObjetos,
      updatedMonstruos,
    } = syncSessionEntities(sesion, previous, npcs, lugares, misiones, objetos, monstruos);

    handleUpdateNpcs(updatedNpcs);
    handleUpdateLugares(updatedLugares);
    handleUpdateMisiones(updatedMisiones);
    handleUpdateObjetos(updatedObjetos);
    handleUpdateMonstruos(updatedMonstruos);

    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      syncCloudSession(sesion, selectedCampanaId);
      updatedNpcs.forEach((n) => syncCloudNpc(n, selectedCampanaId));
      updatedLugares.forEach((l) => syncCloudLugar(l, selectedCampanaId));
      updatedMisiones.forEach((m) => syncCloudMision(m, selectedCampanaId));
      updatedObjetos.forEach((o) => syncCloudObjeto(o, selectedCampanaId));
      updatedMonstruos.forEach((mo) => syncCloudMonstruo(mo, selectedCampanaId));
    }
  };

  // Manejar eliminación de sesión
  const handleDeleteSesion = (sesionId: string) => {
    const updated = sesiones.filter((s) => s.id !== sesionId);
    handleUpdateSesiones(updated);

    // Limpieza de referencias a la sesión en todas las entidades vinculadas
    const {
      updatedNpcs,
      updatedLugares,
      updatedMisiones,
      updatedObjetos,
      updatedMonstruos,
    } = cleanupDeletedSession(sesionId, {
      npcs,
      lugares,
      misiones,
      objetos,
      monstruos,
    });

    handleUpdateNpcs(updatedNpcs);
    handleUpdateLugares(updatedLugares);
    handleUpdateMisiones(updatedMisiones);
    handleUpdateObjetos(updatedObjetos);
    handleUpdateMonstruos(updatedMonstruos);

    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId) && isUUID(sesionId)) {
      deleteCloudSession(sesionId);
    }

    if (selectedSesionId === sesionId) {
      setSelectedSesionId(null);
    }
  };

  // Manejar guardado de NPC (crear o editar)
  const handleSaveNpc = (npcData: {
    nombre: string;
    nombre_conocido: boolean;
    rol: string;
    actitud: ActitudNPC;
    descripcion: string;
    ubicacion_habitual: string;
    informacion_conocida: string;
    informacion_sospechada: string;
    notas: string;
    etiquetas: string[];
  }) => {
    if (!selectedCampanaId) return;

    if (npcToEdit) {
      const updatedNpc: NPC = {
        ...npcToEdit,
        ...npcData,
      };
      const updated = npcs.map((n) => (n.id === updatedNpc.id ? updatedNpc : n));
      handleUpdateNpcs(updated);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudNpc(updatedNpc, selectedCampanaId);
      }
    } else {
      const newNpc: NPC = {
        id: generateUUID(),
        campana_id: selectedCampanaId,
        ...npcData,
        sesion_ids: [],
        creado_en: new Date().toISOString(),
      };
      handleUpdateNpcs([newNpc, ...npcs]);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudNpc(newNpc, selectedCampanaId);
      }
    }
  };

  // Manejar eliminación de NPC
  const handleDeleteNpc = (npcId: string) => {
    const updated = npcs.filter((n) => n.id !== npcId);
    handleUpdateNpcs(updated);
    handleUpdateSesiones(cleanupDeletedEntityFromSessions('npc', npcId, sesiones));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId) && isUUID(npcId)) {
      deleteCloudNpc(npcId);
    }
    if (selectedNpcId === npcId) {
      setSelectedNpcId(null);
    }
  };

  // Manejar guardado de Lugar (crear o editar con gestión de jerarquía)
  const handleSaveLugar = (lugarData: {
    nombre: string;
    nombre_conocido: boolean;
    tipo: TipoLugar;
    padre_id: string | null;
    descripcion: string;
    como_llegar: string;
    que_hay: string;
    que_paso: string;
    notas: string;
    estado: EstadoLugar;
    etiquetas: string[];
  }) => {
    if (!selectedCampanaId) return;

    if (lugarToEdit) {
      const targetId = lugarToEdit.id;
      const oldPadreId = lugarToEdit.padre_id;
      const newPadreId = lugarData.padre_id;

      let updatedLugares = lugares.map((loc) => {
        if (loc.id === targetId) {
          return {
            ...loc,
            ...lugarData,
          };
        }
        return loc;
      });

      // Si cambió de padre, actualizar arrays hijos del viejo y nuevo padre
      if (oldPadreId !== newPadreId) {
        updatedLugares = updatedLugares.map((loc) => {
          if (oldPadreId && loc.id === oldPadreId) {
            return {
              ...loc,
              hijos: loc.hijos.filter((h) => h !== targetId),
            };
          }
          if (newPadreId && loc.id === newPadreId) {
            return {
              ...loc,
              hijos: loc.hijos.includes(targetId) ? loc.hijos : [...loc.hijos, targetId],
            };
          }
          return loc;
        });
      }

      handleUpdateLugares(updatedLugares);

      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        const saved = updatedLugares.find((l) => l.id === targetId);
        if (saved) syncCloudLugar(saved, selectedCampanaId);
        if (oldPadreId && isUUID(oldPadreId)) {
          const oldP = updatedLugares.find((l) => l.id === oldPadreId);
          if (oldP) syncCloudLugar(oldP, selectedCampanaId);
        }
        if (newPadreId && isUUID(newPadreId)) {
          const newP = updatedLugares.find((l) => l.id === newPadreId);
          if (newP) syncCloudLugar(newP, selectedCampanaId);
        }
      }
    } else {
      const newLugarId = generateUUID();
      const newLugar: Lugar = {
        id: newLugarId,
        campana_id: selectedCampanaId,
        ...lugarData,
        hijos: [],
        sesion_ids: [],
        creado_en: new Date().toISOString(),
      };

      let updatedLugares = [newLugar, ...lugares];

      // Si tiene padre, agregar al array hijos del padre
      if (newLugar.padre_id) {
        updatedLugares = updatedLugares.map((loc) => {
          if (loc.id === newLugar.padre_id) {
            return {
              ...loc,
              hijos: loc.hijos.includes(newLugarId) ? loc.hijos : [...loc.hijos, newLugarId],
            };
          }
          return loc;
        });
      }

      handleUpdateLugares(updatedLugares);

      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudLugar(newLugar, selectedCampanaId);
        if (newLugar.padre_id && isUUID(newLugar.padre_id)) {
          const parentLoc = updatedLugares.find((l) => l.id === newLugar.padre_id);
          if (parentLoc) syncCloudLugar(parentLoc, selectedCampanaId);
        }
      }
    }
  };

  // Manejar eliminación de Lugar (con opción mover a nivel superior o borrar en cascada)
  const handleDeleteLugar = (lugarId: string, cascadeDelete: boolean) => {
    const targetLugar = lugares.find((l) => l.id === lugarId);
    if (!targetLugar) return;

    if (cascadeDelete) {
      // Obtener recursivamente todos los IDs de sub-lugares
      const getDescendantIds = (id: string, all: Lugar[]): string[] => {
        const directChildren = all.filter((l) => l.padre_id === id);
        let ids: string[] = [];
        for (const child of directChildren) {
          ids.push(child.id);
          ids = ids.concat(getDescendantIds(child.id, all));
        }
        return ids;
      };

      const idsToDelete = new Set<string>([lugarId, ...getDescendantIds(lugarId, lugares)]);

      let updatedLugares = lugares.filter((l) => !idsToDelete.has(l.id));

      // Limpiar del padre del lugar raíz eliminado
      if (targetLugar.padre_id) {
        updatedLugares = updatedLugares.map((loc) => {
          if (loc.id === targetLugar.padre_id) {
            return {
              ...loc,
              hijos: loc.hijos.filter((h) => h !== lugarId),
            };
          }
          return loc;
        });
      }

      handleUpdateLugares(updatedLugares);
      // Limpiar lugares eliminados de las sesiones
      let currentSesiones = sesiones;
      idsToDelete.forEach((locId) => {
        currentSesiones = cleanupDeletedEntityFromSessions('lugar', locId, currentSesiones);
      });
      handleUpdateSesiones(currentSesiones);

      if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
        idsToDelete.forEach((locId) => {
          if (isUUID(locId)) deleteCloudLugar(locId);
        });
      }

      if (selectedLugarId && idsToDelete.has(selectedLugarId)) {
        setSelectedLugarId(null);
      }
    } else {
      // Mover sub-lugares al nivel del padre (o convertirlos en raíz si padre_id es null)
      const directChildren = lugares.filter((l) => l.padre_id === lugarId);
      const newPadreIdForChildren = targetLugar.padre_id;

      let updatedLugares = lugares
        .filter((l) => l.id !== lugarId)
        .map((loc) => {
          if (loc.padre_id === lugarId) {
            return {
              ...loc,
              padre_id: newPadreIdForChildren,
            };
          }
          // Si es el abuelo, remover el lugar eliminado y agregar sus nietos promovidos
          if (newPadreIdForChildren && loc.id === newPadreIdForChildren) {
            const cleanHijos = loc.hijos.filter((h) => h !== lugarId);
            const addedChildrenIds = directChildren.map((c) => c.id);
            return {
              ...loc,
              hijos: Array.from(new Set([...cleanHijos, ...addedChildrenIds])),
            };
          }
          return loc;
        });

      handleUpdateLugares(updatedLugares);
      handleUpdateSesiones(cleanupDeletedEntityFromSessions('lugar', lugarId, sesiones));

      if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
        if (isUUID(lugarId)) deleteCloudLugar(lugarId);
        directChildren.forEach((child) => {
          const updatedChild = updatedLugares.find((l) => l.id === child.id);
          if (updatedChild && isUUID(updatedChild.id)) syncCloudLugar(updatedChild, selectedCampanaId);
        });
      }

      if (selectedLugarId === lugarId) {
        setSelectedLugarId(null);
      }
    }
  };

  // Manejar guardado de Misión (crear o editar)
  const handleSaveMision = (misionData: {
    titulo: string;
    descripcion: string;
    origen_npc_id: string | null;
    origen_lugar_id: string | null;
    estado: EstadoMision;
    pasos: { id: string; texto: string; completado: boolean }[];
    recompensa_conocida: string;
    recompensa_obtenida: string;
    notas: string;
    etiquetas: string[];
  }) => {
    if (!selectedCampanaId) return;

    if (misionToEdit) {
      const updatedMision: Mision = {
        ...misionToEdit,
        ...misionData,
      };
      const updated = misiones.map((m) => (m.id === updatedMision.id ? updatedMision : m));
      handleUpdateMisiones(updated);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudMision(updatedMision, selectedCampanaId);
      }
    } else {
      const newMision: Mision = {
        id: generateUUID(),
        campana_id: selectedCampanaId,
        ...misionData,
        sesion_ids: [],
        sesion_activacion_id: null,
        sesion_completado_id: null,
        creado_en: new Date().toISOString(),
      };
      handleUpdateMisiones([newMision, ...misiones]);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudMision(newMision, selectedCampanaId);
      }
    }
  };

  // Manejar eliminación de Misión
  const handleDeleteMision = (mision: Mision) => {
    const updated = misiones.filter((m) => m.id !== mision.id);
    handleUpdateMisiones(updated);
    handleUpdateSesiones(cleanupDeletedEntityFromSessions('mision', mision.id, sesiones));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId) && isUUID(mision.id)) {
      deleteCloudMision(mision.id);
    }
    if (selectedMisionId === mision.id) {
      setSelectedMisionId(null);
    }
  };

  // Alternar el estado de completado de un paso de misión
  const handleTogglePasoMision = (misionId: string, pasoId: string) => {
    const updated = misiones.map((m) => {
      if (m.id !== misionId) return m;
      const updatedPasos = m.pasos.map((p) =>
        p.id === pasoId ? { ...p, completado: !p.completado } : p
      );
      return { ...m, pasos: updatedPasos };
    });
    handleUpdateMisiones(updated);
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      const target = updated.find((m) => m.id === misionId);
      if (target) syncCloudMision(target, selectedCampanaId);
    }
  };

  // Actualizar el estado de una misión
  const handleUpdateEstadoMision = (misionId: string, nuevoEstado: EstadoMision) => {
    const updated = misiones.map((m) => {
      if (m.id !== misionId) return m;
      return { ...m, estado: nuevoEstado };
    });
    handleUpdateMisiones(updated);
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      const target = updated.find((m) => m.id === misionId);
      if (target) syncCloudMision(target, selectedCampanaId);
    }
  };

  // Añadir un paso rápido a una misión
  const handleAddPasoRapido = (misionId: string, textoPaso: string) => {
    const updated = misiones.map((m) => {
      if (m.id !== misionId) return m;
      const nuevoPaso = {
        id: generateUUID(),
        texto: textoPaso.trim(),
        completado: false,
      };
      return { ...m, pasos: [...m.pasos, nuevoPaso] };
    });
    handleUpdateMisiones(updated);
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      const target = updated.find((m) => m.id === misionId);
      if (target) syncCloudMision(target, selectedCampanaId);
    }
  };

  // Manejar guardado de Objeto (crear o editar)
  const handleSaveObjeto = (objetoData: {
    nombre: string;
    nombre_conocido: boolean;
    tipo: TipoObjeto;
    descripcion: string;
    efecto_conocido: string;
    efecto_sospechado: string;
    donde_lo_conseguimos: string;
    quien_lo_lleva: string | null;
    notas: string;
    etiquetas: string[];
  }) => {
    if (!selectedCampanaId) return;

    if (objetoToEdit) {
      const updatedObjeto: Objeto = {
        ...objetoToEdit,
        ...objetoData,
      };
      const updated = objetos.map((o) => (o.id === updatedObjeto.id ? updatedObjeto : o));
      handleUpdateObjetos(updated);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudObjeto(updatedObjeto, selectedCampanaId);
      }
    } else {
      const newObjeto: Objeto = {
        id: generateUUID(),
        campana_id: selectedCampanaId,
        ...objetoData,
        sesion_ids: [],
        sesion_obtencion_id: null,
        creado_en: new Date().toISOString(),
      };
      handleUpdateObjetos([newObjeto, ...objetos]);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudObjeto(newObjeto, selectedCampanaId);
      }
    }
  };

  // Manejar eliminación de Objeto
  const handleDeleteObjeto = (objeto: Objeto) => {
    const updated = objetos.filter((o) => o.id !== objeto.id);
    handleUpdateObjetos(updated);
    handleUpdateSesiones(cleanupDeletedEntityFromSessions('objeto', objeto.id, sesiones));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId) && isUUID(objeto.id)) {
      deleteCloudObjeto(objeto.id);
    }
    if (selectedObjetoId === objeto.id) {
      setSelectedObjetoId(null);
    }
  };

  // Manejar guardado de Monstruo (crear o editar)
  const handleSaveMonstruo = (monstruoData: Omit<Monstruo, 'id' | 'creado_en'> | Monstruo) => {
    if (!selectedCampanaId) return;

    if ('id' in monstruoData && monstruoData.id) {
      const updatedMonstruo: Monstruo = {
        ...(monstruoData as Monstruo),
      };
      const updated = monstruos.map((m) => (m.id === updatedMonstruo.id ? updatedMonstruo : m));
      handleUpdateMonstruos(updated);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudMonstruo(updatedMonstruo, selectedCampanaId);
      }
    } else {
      const newMonstruo: Monstruo = {
        ...(monstruoData as Omit<Monstruo, 'id' | 'creado_en'>),
        id: generateUUID(),
        campana_id: selectedCampanaId,
        sesion_ids: [],
        creado_en: new Date().toISOString(),
      };
      handleUpdateMonstruos([newMonstruo, ...monstruos]);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudMonstruo(newMonstruo, selectedCampanaId);
      }
    }
  };

  // Manejar eliminación de Monstruo
  const handleDeleteMonstruo = (monstruo: Monstruo) => {
    const updated = monstruos.filter((m) => m.id !== monstruo.id);
    handleUpdateMonstruos(updated);
    handleUpdateSesiones(cleanupDeletedEntityFromSessions('monstruo', monstruo.id, sesiones));
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId) && isUUID(monstruo.id)) {
      deleteCloudMonstruo(monstruo.id);
    }
    if (selectedMonstruoId === monstruo.id) {
      setSelectedMonstruoId(null);
    }
  };

  // Incrementar contador de encuentros de la criatura (+1)
  const handleIncrementVecesMonstruo = (monstruo: Monstruo) => {
    const updated = monstruos.map((m) =>
      m.id === monstruo.id ? { ...m, veces_encontrado: (m.veces_encontrado || 1) + 1 } : m
    );
    handleUpdateMonstruos(updated);
    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId)) {
      const target = updated.find((m) => m.id === monstruo.id);
      if (target) syncCloudMonstruo(target, selectedCampanaId);
    }
  };

  // Calcular el siguiente número de sesión sugerido para la campaña activa
  const getSiguienteNumeroSesion = (): number => {
    if (!selectedCampanaId) return 1;
    const ses = sesiones.filter((s) => s.campana_id === selectedCampanaId);
    if (ses.length === 0) return 1;
    const maxNum = Math.max(...ses.map((s) => s.numero || 0));
    return maxNum + 1;
  };

  // Manejar guardado de Personaje Jugador (crear o editar)
  const handleSavePj = (pjData: {
    nombre: string;
    clase: string;
    raza: string;
    nivel: number;
    pg_max: number;
    ca: number;
    descripcion: string;
    personalidad: string;
    trasfondo: string;
    notas: string;
    estado: EstadoPJ;
    etiquetas: string[];
  }) => {
    if (!selectedCampanaId) return;

    if (pjToEdit) {
      const updatedPj: PJ = {
        ...pjToEdit,
        ...pjData,
      };
      const updated = pjs.map((p) => (p.id === updatedPj.id ? updatedPj : p));
      handleUpdatePjs(updated);
      if (selectedPjDetail?.id === updatedPj.id) {
        setSelectedPjDetail(updatedPj);
      }
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudPj(updatedPj, selectedCampanaId);
      }
    } else {
      const newPj: PJ = {
        id: generateUUID(),
        campana_id: selectedCampanaId,
        user_id: currentUser?.id,
        creado_en: new Date().toISOString(),
        ...pjData,
      };
      handleUpdatePjs([newPj, ...pjs]);
      if (storageMode === 'cloud' && isUUID(selectedCampanaId)) {
        syncCloudPj(newPj, selectedCampanaId);
      }
    }
  };

  // Manejar eliminación de Personaje Jugador
  const handleDeletePj = (pj: PJ) => {
    const updated = pjs.filter((p) => p.id !== pj.id);
    handleUpdatePjs(updated);
    // Si tenía objetos asignados, desasignarlos
    const updatedObjetos = objetos.map((o) =>
      o.quien_lo_lleva === pj.nombre ? { ...o, quien_lo_lleva: null } : o
    );
    handleUpdateObjetos(updatedObjetos);

    if (storageMode === 'cloud' && selectedCampanaId && isUUID(selectedCampanaId) && isUUID(pj.id)) {
      deleteCloudPj(pj.id);
    }

    if (selectedPjDetail?.id === pj.id) {
      setSelectedPjDetail(null);
    }
  };

  // Manejar navegación global desde el buscador
  const handleGlobalNavigateToEntity = (type: SearchEntityType, item: any, campanaId: string) => {
    if (type === 'campana') {
      navigateTo({
        view: 'campana',
        campanaId: item.id,
        campaignTab: 'resumen',
      });
      setSelectedCampanaId(item.id);
      setSelectedSesionId(null);
      setSelectedNpcId(null);
      setSelectedLugarId(null);
      setSelectedMisionId(null);
      setSelectedObjetoId(null);
      setSelectedMonstruoId(null);
      setActiveCampaignTab('resumen');
    } else if (type === 'sesion') {
      navigateTo({
        view: 'sesion',
        campanaId,
        entityId: item.id,
        campaignTab: 'sesiones',
      });
      setSelectedCampanaId(campanaId);
      setSelectedSesionId(item.id);
      setActiveCampaignTab('sesiones');
    } else if (type === 'pj') {
      navigateTo({
        view: 'campana',
        campanaId,
        campaignTab: 'grupo',
      });
      setSelectedCampanaId(campanaId);
      setSelectedSesionId(null);
      setSelectedNpcId(null);
      setSelectedLugarId(null);
      setSelectedMisionId(null);
      setSelectedObjetoId(null);
      setSelectedMonstruoId(null);
      setActiveCampaignTab('grupo');
      setSelectedPjDetail(item);
    } else if (type === 'npc') {
      navigateTo({
        view: 'npc',
        campanaId,
        entityId: item.id,
        campaignTab: 'npcs',
      });
      setSelectedCampanaId(campanaId);
      setSelectedNpcId(item.id);
      setActiveCampaignTab('npcs');
    } else if (type === 'lugar') {
      navigateTo({
        view: 'lugar',
        campanaId,
        entityId: item.id,
        campaignTab: 'lugares',
      });
      setSelectedCampanaId(campanaId);
      setSelectedLugarId(item.id);
      setActiveCampaignTab('lugares');
    } else if (type === 'mision') {
      navigateTo({
        view: 'mision',
        campanaId,
        entityId: item.id,
        campaignTab: 'misiones',
      });
      setSelectedCampanaId(campanaId);
      setSelectedMisionId(item.id);
      setActiveCampaignTab('misiones');
    } else if (type === 'objeto') {
      navigateTo({
        view: 'objeto',
        campanaId,
        entityId: item.id,
        campaignTab: 'objetos',
      });
      setSelectedCampanaId(campanaId);
      setSelectedObjetoId(item.id);
      setActiveCampaignTab('objetos');
    } else if (type === 'monstruo') {
      navigateTo({
        view: 'monstruo',
        campanaId,
        entityId: item.id,
        campaignTab: 'bestiario',
      });
      setSelectedCampanaId(campanaId);
      setSelectedMonstruoId(item.id);
      setActiveCampaignTab('bestiario');
    }
  };

  // Cargar aventura de ejemplo inicial si el usuario lo solicita
  const handleCargarEjemplo = () => {
    cargarEjemploInicial();
    setCampanas(getCampanas());
    setSesiones(getSesiones());
    setNpcs(getNpcs());
    setLugares(getLugares());
    setMisiones(getMisiones());
    setObjetos(getObjetos());
    setMonstruos(getMonstruos());
    setPjs(getPjs());
  };

  // Campañas filtradas en pantalla principal
  const filteredCampanas = campanas.filter((c) => {
    const matchSistema =
      filtroSistema === 'todos' || c.sistema.toLowerCase().includes(filtroSistema.toLowerCase());
    const matchBusqueda =
      !busquedaCampana.trim() ||
      c.nombre.toLowerCase().includes(busquedaCampana.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(busquedaCampana.toLowerCase());
    return matchSistema && matchBusqueda;
  });

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-fondo)', color: 'var(--color-texto)' }}
    >
      {/* Barra de navegación superior */}
      <Navbar
        onNuevaCampana={() => {
          setCampanaToEdit(null);
          setIsCampanaModalOpen(true);
        }}
        onExportar={exportarDatos}
        onImportar={() => setIsImportModalOpen(true)}
        modoApp={modoApp}
        onToggleModoApp={handleToggleModoApp}
        currentTheme={tema}
        onSelectTheme={handleSelectTheme}
        onGoHome={() => {
          if (!currentUser && !selectedCampanaId) {
            try {
              localStorage.removeItem('bitacora_guest_mode');
            } catch {}
            setHasEnteredGuestMode(false);
          }
          navigateTo({
            view: 'campanas',
            campanaId: null,
          });
          setNavStack([]);
        }}
        campanas={campanas}
        sesiones={sesiones}
        pjs={pjs}
        npcs={npcs}
        lugares={lugares}
        misiones={misiones}
        objetos={objetos}
        monstruos={monstruos}
        activeCampanaId={selectedCampanaId || undefined}
        onNavigateToEntity={handleGlobalNavigateToEntity}
        currentUser={currentUser}
        userProfile={userProfile}
        storageMode={storageMode}
        onToggleStorageMode={handleToggleStorageMode}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* VISTA 1: DETALLE DE SESIÓN */}
        {activeCampana && activeSesion ? (
          <SesionView
            campana={activeCampana}
            sesion={activeSesion}
            todasLasSesiones={activeCampanaSesiones}
            npcs={activeCampanaNpcs}
            lugares={activeCampanaLugares}
            misiones={activeCampanaMisiones}
            objetos={activeCampanaObjetos}
            monstruos={activeCampanaMonstruos}
            modoApp={modoApp}
            onBackToCampana={navigateBack}
            onEditSesion={(s) => {
              setSesionToEdit(s);
              setIsSesionModalOpen(true);
            }}
            onDeleteSesion={(id) => handleDeleteSesion(id)}
            onUpdateSesion={handleUpdateSesion}
            onSelectSesion={handleSelectSesion}
            onNavigateToEntity={handleNavigateToEntity}
            backLabel={currentBackLabel}
          />
        ) : activeCampana && activeNpc ? (
          /* VISTA 2: DETALLE DE FICHA DE NPC */
          <NpcView
            npc={activeNpc}
            campana={activeCampana}
            allSesiones={activeCampanaSesiones}
            allMisiones={activeCampanaMisiones}
            modoApp={modoApp}
            onBack={navigateBack}
            onEdit={(n) => {
              setNpcToEdit(n);
              setIsNpcModalOpen(true);
            }}
            onDelete={(id) => handleDeleteNpc(id)}
            onUpdateNpc={handleUpdateNpc}
            onSelectSesion={handleSelectSesion}
            onSelectMision={handleSelectMision}
            backLabel={currentBackLabel}
          />
        ) : activeCampana && activeLugar ? (
          /* VISTA 3: DETALLE DE FICHA DE LUGAR (con sub-lugares y migas de pan) */
          <LugarView
            lugar={activeLugar}
            campana={activeCampana}
            allLugares={activeCampanaLugares}
            allSesiones={activeCampanaSesiones}
            modoApp={modoApp}
            onBack={navigateBack}
            onEdit={(loc: Lugar) => {
              setLugarToEdit(loc);
              setLugarPadreDefaultId(loc.padre_id);
              setIsLugarModalOpen(true);
            }}
            onDelete={(loc: Lugar) => {
              setLugarToDelete(loc);
              setIsLugarDeleteModalOpen(true);
            }}
            onUpdateLugar={handleUpdateLugar}
            onSelectLugar={handleSelectLugar}
            onAddSubLugar={(parentLoc: Lugar) => {
              setLugarToEdit(null);
              setLugarPadreDefaultId(parentLoc.id);
              setIsLugarModalOpen(true);
            }}
            onSelectSesion={handleSelectSesion}
            backLabel={currentBackLabel}
          />
        ) : activeCampana && activeMision ? (
          /* VISTA 4: DETALLE DE FICHA DE MISIÓN */
          <MisionView
            mision={activeMision}
            campana={activeCampana}
            allNpcs={activeCampanaNpcs}
            allLugares={activeCampanaLugares}
            allSesiones={activeCampanaSesiones}
            modoApp={modoApp}
            onBack={navigateBack}
            onEdit={(m: Mision) => {
              setMisionToEdit(m);
              setIsMisionModalOpen(true);
            }}
            onDelete={(m: Mision) => handleDeleteMision(m)}
            onUpdateMision={handleUpdateMision}
            onTogglePaso={handleTogglePasoMision}
            onUpdateEstado={handleUpdateEstadoMision}
            onAddPasoRapido={handleAddPasoRapido}
            onNavigateToNpc={(npcId) => {
              const target = npcs.find((n) => n.id === npcId);
              if (target) handleSelectNpc(target);
            }}
            onNavigateToLugar={(lugarId) => {
              const target = lugares.find((l) => l.id === lugarId);
              if (target) handleSelectLugar(target);
            }}
            onSelectSesion={handleSelectSesion}
            backLabel={currentBackLabel}
          />
        ) : activeCampana && activeObjeto ? (
          /* VISTA 5: DETALLE DE FICHA DE OBJETO */
          <ObjetoView
            objeto={activeObjeto}
            campana={activeCampana}
            allSesiones={activeCampanaSesiones}
            modoApp={modoApp}
            onBack={navigateBack}
            onEdit={(obj: Objeto) => {
              setObjetoToEdit(obj);
              setIsObjetoModalOpen(true);
            }}
            onDelete={(obj: Objeto) => handleDeleteObjeto(obj)}
            onUpdateObjeto={handleUpdateObjeto}
            onSelectSesion={handleSelectSesion}
            backLabel={currentBackLabel}
          />
        ) : activeCampana && activeMonstruo ? (
          /* VISTA 6: DETALLE DE FICHA DE MONSTRUO */
          <MonstruoView
            monstruo={activeMonstruo}
            campana={activeCampana}
            allSesiones={activeCampanaSesiones}
            modoApp={modoApp}
            onBack={navigateBack}
            onEdit={(m: Monstruo) => {
              setMonstruoToEdit(m);
              setIsMonstruoModalOpen(true);
            }}
            onDelete={(m: Monstruo) => handleDeleteMonstruo(m)}
            onUpdateMonstruo={handleUpdateMonstruo}
            onIncrementVeces={handleIncrementVecesMonstruo}
            onSelectSesion={handleSelectSesion}
            backLabel={currentBackLabel}
          />
        ) : activeCampana ? (
          /* VISTA 7: DETALLE DE CAMPAÑA (con pestañas de Sesiones, NPCs, Lugares, Misiones, Objetos, Bestiario y Diario) */
          <CampanaView
            campana={activeCampana}
            sesiones={activeCampanaSesiones}
            pjs={activeCampanaPjs}
            npcs={activeCampanaNpcs}
            lugares={activeCampanaLugares}
            misiones={activeCampanaMisiones}
            objetos={activeCampanaObjetos}
            monstruos={activeCampanaMonstruos}
            modoApp={modoApp}
            onBack={() => {
              navigateTo({
                view: 'campanas',
                campanaId: null,
              });
            }}
            onEditCampana={(c) => {
              setCampanaToEdit(c);
              setIsCampanaModalOpen(true);
            }}
            onDeleteCampana={(id) => handleDeleteCampana(id)}
            onUpdateCampana={handleUpdateCampana}
            onImportEntity={handleImportSingleEntity}
            onNuevaSesion={() => {
              setActiveCampaignTab('sesiones');
              setSesionToEdit(null);
              setIsSesionModalOpen(true);
            }}
            onSelectSesion={handleSelectSesion}
            onEditSesion={(s) => {
              setSesionToEdit(s);
              setIsSesionModalOpen(true);
            }}
            onDeleteSesion={(id) => handleDeleteSesion(id)}
            onNuevoPj={() => {
              setActiveCampaignTab('grupo');
              setPjToEdit(null);
              setIsPjModalOpen(true);
            }}
            onSelectPj={(pj) => setSelectedPjDetail(pj)}
            onEditPj={(pj) => {
              setPjToEdit(pj);
              setIsPjModalOpen(true);
            }}
            onDeletePj={(pj) => setPjToDelete(pj)}
            onNuevoNpc={() => {
              setActiveCampaignTab('npcs');
              setNpcToEdit(null);
              setIsNpcModalOpen(true);
            }}
            onSelectNpc={handleSelectNpc}
            onEditNpc={(npc) => {
              setNpcToEdit(npc);
              setIsNpcModalOpen(true);
            }}
            onDeleteNpc={(id) => handleDeleteNpc(id)}
            onNuevoLugar={() => {
              setActiveCampaignTab('lugares');
              setLugarToEdit(null);
              setLugarPadreDefaultId(null);
              setIsLugarModalOpen(true);
            }}
            onSelectLugar={handleSelectLugar}
            onEditLugar={(lugar) => {
              setLugarToEdit(lugar);
              setIsLugarModalOpen(true);
            }}
            onDeleteLugar={(lugar) => {
              setLugarToDelete(lugar);
              setIsLugarDeleteModalOpen(true);
            }}
            onNuevaMision={() => {
              setActiveCampaignTab('misiones');
              setMisionToEdit(null);
              setIsMisionModalOpen(true);
            }}
            onSelectMision={handleSelectMision}
            onEditMision={(mision) => {
              setMisionToEdit(mision);
              setIsMisionModalOpen(true);
            }}
            onDeleteMision={(mision) => handleDeleteMision(mision)}
            onNuevoObjeto={() => {
              setActiveCampaignTab('objetos');
              setObjetoToEdit(null);
              setIsObjetoModalOpen(true);
            }}
            onSelectObjeto={handleSelectObjeto}
            onEditObjeto={(objeto) => {
              setObjetoToEdit(objeto);
              setIsObjetoModalOpen(true);
            }}
            onDeleteObjeto={(objeto) => handleDeleteObjeto(objeto)}
            onNuevoMonstruo={() => {
              setActiveCampaignTab('bestiario');
              setMonstruoToEdit(null);
              setIsMonstruoModalOpen(true);
            }}
            onSelectMonstruo={handleSelectMonstruo}
            onEditMonstruo={(monstruo) => {
              setMonstruoToEdit(monstruo);
              setIsMonstruoModalOpen(true);
            }}
            onDeleteMonstruo={(monstruo) => handleDeleteMonstruo(monstruo)}
            onNavigateToEntity={handleNavigateToEntity}
            activeTab={activeCampaignTab}
            onTabChange={(tab) => setActiveCampaignTab(tab)}
            isCloud={storageMode === 'cloud'}
            currentUserRole={activeCloudRole}
            currentUserId={currentUser?.id}
            onOpenInvite={() => setIsInviteModalOpen(true)}
          />
        ) : (
          /* VISTA 5: PANTALLA PRINCIPAL (LISTA DE CAMPAÑAS O PANTALLA DE INICIO) */
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Si no hay usuario y no ha elegido continuar como invitado: Pantalla de Inicio */}
            {!currentUser && !hasEnteredGuestMode ? (
              <PantallaInicio
                onIniciarSesion={() => handleOpenAuth('login')}
                onRegistrarse={() => handleOpenAuth('register')}
                onContinuarInvitado={() => {
                  try {
                    localStorage.setItem('bitacora_guest_mode', 'true');
                  } catch {}
                  setHasEnteredGuestMode(true);
                  handleToggleStorageMode('local');
                }}
                onUnirseConToken={() => setIsJoinModalOpen(true)}
              />
            ) : storageMode === 'cloud' && !currentUser ? (
              <div
                id="cloud-auth-welcome-card"
                className="my-10 p-8 sm:p-12 rounded-2xl bg-[#111827] border border-sky-900/40 text-center max-w-2xl mx-auto shadow-2xl space-y-6"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-[#c9a227] p-0.5 shadow-lg shadow-sky-950/50">
                  <div className="w-full h-full bg-[#131b2a] rounded-[14px] flex items-center justify-center text-sky-400">
                    <Cloud className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
                    Campañas Compartidas con Supabase
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Inicia sesión o crea tu cuenta para disfrutar de multijugador real: forja campañas como <strong>Host</strong>, invita a tus jugadores con enlaces únicos, asigna roles de <strong>Dungeon Master</strong> o <strong>Jugador</strong> y sincroniza tiradas y crónicas en tiempo real.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    id="welcome-login-btn"
                    type="button"
                    onClick={() => handleOpenAuth('login')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-sm transition-transform active:scale-95 shadow-md shadow-amber-950/30 min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>Iniciar Sesión / Registrarse</span>
                  </button>

                  <button
                    id="welcome-join-btn"
                    type="button"
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Unirse con token</span>
                  </button>

                  <button
                    id="welcome-local-mode-btn"
                    type="button"
                    onClick={() => handleToggleStorageMode('local')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors min-h-[44px]"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Modo Local (Invitado)</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cabecera de bienvenida & descripción */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 tracking-tight">
                        {storageMode === 'cloud' ? 'Campañas en la Nube' : 'Campañas Activas'}
                      </h1>
                      {storageMode === 'cloud' && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800/80 flex items-center gap-1">
                          <Cloud className="w-3 h-3" />
                          <span>Supabase Realtime</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-400 max-w-2xl leading-relaxed">
                      {storageMode === 'cloud'
                        ? 'Campañas compartidas sincronizadas con Supabase. Administra tus mesas como Host o colabora como Dungeon Master o Jugador invitado.'
                        : 'Tu libreta digital de Dungeon Master y aventureros. Registra crónicas, gestiona sesiones, atlas de lugares y fichas de NPCs sin depender de conexiones a la nube.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
                    {storageMode === 'cloud' && (
                      <button
                        id="unirse-campana-hero-btn"
                        type="button"
                        onClick={() => setIsJoinModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50 text-sm font-semibold transition-colors min-h-[44px]"
                        title="Unirse a una campaña compartida con token de invitación"
                      >
                        <UserPlus className="w-4 h-4 text-[#c9a227]" />
                        <span>Unirse a campaña</span>
                      </button>
                    )}

                    <button
                      id="crear-campana-hero-btn"
                      type="button"
                      onClick={() => {
                        setCampanaToEdit(null);
                        setIsCampanaModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black text-sm font-semibold shadow-lg shadow-amber-950/40 transition-transform active:scale-98 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4 text-black stroke-[2.5]" />
                      <span> Nueva campaña</span>
                    </button>
                  </div>
                </div>

                {/* Banner de aviso para cambiar a modo Nube si está en modo Local / Invitado */}
                {storageMode === 'local' && (
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border text-xs ${
                    currentUser
                      ? 'bg-sky-950/30 border-sky-800/50 text-sky-200'
                      : 'bg-amber-950/20 border-amber-900/40 text-amber-200/90'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <HardDrive className={`w-4 h-4 shrink-0 ${currentUser ? 'text-sky-400' : 'text-[#c9a227]'}`} />
                      <span>
                        {currentUser ? (
                          <>
                            <strong>Viendo en Modo Local:</strong> Tu cuenta en la nube (<strong>{currentUser.email}</strong>) está activa. Tus campañas están sincronizadas y seguras en Supabase.
                          </>
                        ) : (
                          <>
                            <strong>Modo Invitado (Local):</strong> Los datos se almacenan exclusivamente en este navegador. Puedes iniciar sesión o crear una cuenta para invitar amigos con roles y sincronizar en tiempo real.
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {currentUser ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStorageMode('cloud')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-colors shadow-sm"
                        >
                          <Cloud className="w-3.5 h-3.5 text-black" />
                          <span>Volver a Modo Nube</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                localStorage.removeItem('bitacora_guest_mode');
                              } catch {}
                              setHasEnteredGuestMode(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors"
                          >
                            <span>Volver a Inicio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAuth('login')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-xs transition-colors"
                          >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>Iniciar Sesión / Nube</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Si no hay campañas: Mensaje de bienvenida con botón */}
                {campanas.length === 0 ? (
                  <div
                    id="empty-campanas-state"
                    className="my-10 p-8 sm:p-12 rounded-2xl bg-[#111827] border border-amber-900/40 text-center max-w-2xl mx-auto shadow-xl"
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#805f15] p-0.5 mb-5 shadow-lg shadow-amber-950/50">
                      <div className="w-full h-full bg-[#131b2a] rounded-[14px] flex items-center justify-center text-[#c9a227]">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 mb-2">
                      ¡Aún no tienes campañas registradas!
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
                      {storageMode === 'cloud'
                        ? 'Crea tu primera campaña en la nube como Host o únete a una campaña existente usando un token de invitación.'
                        : 'Comienza forjando tu primera campaña para anotar sesiones, lugares del mapa, NPCs, batallas y secretos de tu grupo de aventureros. Los datos se guardan de forma segura en tu navegador.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        id="empty-create-campana-btn"
                        type="button"
                        onClick={() => {
                          setCampanaToEdit(null);
                          setIsCampanaModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9a227] hover:bg-[#dbb333] text-black font-semibold text-sm transition-colors shadow-md min-h-[44px]"
                      >
                        <Plus className="w-4 h-4 text-black stroke-[2]" />
                        <span>Crear mi primera campaña</span>
                      </button>

                      {storageMode === 'cloud' ? (
                        <button
                          id="empty-join-campana-btn"
                          type="button"
                          onClick={() => setIsJoinModalOpen(true)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-sm border border-amber-900/50 transition-colors min-h-[44px]"
                        >
                          <UserPlus className="w-4 h-4 text-[#c9a227]" />
                          <span>Unirse a una campaña</span>
                        </button>
                      ) : (
                        <button
                          id="cargar-ejemplo-btn"
                          type="button"
                          onClick={handleCargarEjemplo}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-sm border border-amber-900/50 transition-colors min-h-[44px]"
                        >
                          <Sparkles className="w-4 h-4 text-[#c9a227]" />
                          <span>Cargar aventura de ejemplo</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Barra de Filtros y Búsqueda */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] p-3 sm:p-4 rounded-xl border border-slate-800">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="buscar-campana-input"
                          type="text"
                          value={busquedaCampana}
                          onChange={(e) => setBusquedaCampana(e.target.value)}
                          placeholder="Buscar campaña por nombre o descripción..."
                          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0e1522] border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c9a227] transition-colors min-h-[44px]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
                        <select
                          id="filtro-sistema-select"
                          value={filtroSistema}
                          onChange={(e) => setFiltroSistema(e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#0e1522] border border-slate-700 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#c9a227] cursor-pointer min-h-[44px]"
                        >
                          <option value="todos">Todos los sistemas</option>
                          <option value="D&D 2024">D&D 2024</option>
                          <option value="D&D 5e">D&D 5e</option>
                          <option value="Pathfinder 2e">Pathfinder 2e</option>
                          <option value="La Llamada de Cthulhu">La Llamada de Cthulhu</option>
                          <option value="Vampiro: La Mascarada">Vampiro: La Mascarada</option>
                          <option value="Otro">Otros sistemas</option>
                        </select>
                      </div>
                    </div>

                    {/* VISTA SEGMENTADA: EN MODO NUBE MOSTRAMOS "MIS CAMPAÑAS (HOST)" Y "CAMPAÑAS DONDE PARTICIPO (DM / PLAYER)" */}
                    {storageMode === 'cloud' ? (
                      <div className="space-y-10">
                        {/* SECCIÓN 1: MIS CAMPAÑAS (HOST) */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                            <div className="flex items-center gap-2">
                              <Crown className="w-5 h-5 text-amber-400" />
                              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                                Mis Campañas (Host)
                              </h2>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold">
                                {
                                  cloudCampaignsWithRoles.filter((item) => item.role === 'host').length
                                }
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 hidden sm:inline">
                              Campañas creadas por ti • Control total y gestión de miembros
                            </span>
                          </div>

                          {(() => {
                            const hostList = cloudCampaignsWithRoles
                              .filter((item) => item.role === 'host')
                              .map((item) => item.campana)
                              .filter((c) => {
                                const matchSistema =
                                  filtroSistema === 'todos' ||
                                  c.sistema.toLowerCase().includes(filtroSistema.toLowerCase());
                                const matchBusqueda =
                                  !busquedaCampana.trim() ||
                                  c.nombre.toLowerCase().includes(busquedaCampana.toLowerCase()) ||
                                  c.descripcion.toLowerCase().includes(busquedaCampana.toLowerCase());
                                return matchSistema && matchBusqueda;
                              });

                            if (hostList.length === 0) {
                              return (
                                <div className="p-6 rounded-xl bg-[#111827]/70 border border-slate-800 text-center space-y-2">
                                  <p className="text-sm text-slate-400">
                                    No tienes campañas activas donde seas Host.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCampanaToEdit(null);
                                      setIsCampanaModalOpen(true);
                                    }}
                                    className="text-xs text-[#c9a227] hover:underline inline-flex items-center gap-1 font-semibold"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Crear una campaña como Host</span>
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {hostList.map((campana) => {
                                  const countSesiones = sesiones.filter(
                                    (s) => s.campana_id === campana.id
                                  ).length;
                                  const countNpcs = npcs.filter(
                                    (n) => n.campana_id === campana.id
                                  ).length;
                                  const countLugares = lugares.filter(
                                    (l) => l.campana_id === campana.id
                                  ).length;
                                  const countMisiones = misiones.filter(
                                    (m) => m.campana_id === campana.id
                                  ).length;
                                  const countObjetos = objetos.filter(
                                    (o) => o.campana_id === campana.id
                                  ).length;
                                  const ultimaFecha = getUltimaSesionFecha(campana.id);

                                  return (
                                    <CampanaCard
                                      key={campana.id}
                                      campana={campana}
                                      sesionesCount={countSesiones}
                                      npcsCount={countNpcs}
                                      lugaresCount={countLugares}
                                      misionesCount={countMisiones}
                                      objetosCount={countObjetos}
                                      ultimaSesionFecha={ultimaFecha}
                                      role="host"
                                      canEdit={true}
                                      onSelect={(c) => {
                                        navigateTo({
                                          view: 'campana',
                                          campanaId: c.id,
                                          campaignTab: activeCampaignTab,
                                        });
                                      }}
                                      onEdit={(c) => {
                                        setCampanaToEdit(c);
                                        setIsCampanaModalOpen(true);
                                      }}
                                      onDelete={(c) => setCampanaToDelete(c)}
                                    />
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* SECCIÓN 2: CAMPAÑAS DONDE PARTICIPO (DM / PLAYER) */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-sky-400" />
                              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                                Campañas donde participo
                              </h2>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-800/60 font-semibold">
                                {
                                  cloudCampaignsWithRoles.filter((item) => item.role !== 'host').length
                                }
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 hidden sm:inline">
                              Mesas a las que has sido invitado como DM o Jugador
                            </span>
                          </div>

                          {(() => {
                            const partList = cloudCampaignsWithRoles
                              .filter((item) => item.role !== 'host')
                              .filter((item) => {
                                const c = item.campana;
                                const matchSistema =
                                  filtroSistema === 'todos' ||
                                  c.sistema.toLowerCase().includes(filtroSistema.toLowerCase());
                                const matchBusqueda =
                                  !busquedaCampana.trim() ||
                                  c.nombre.toLowerCase().includes(busquedaCampana.toLowerCase()) ||
                                  c.descripcion.toLowerCase().includes(busquedaCampana.toLowerCase());
                                return matchSistema && matchBusqueda;
                              });

                            if (partList.length === 0) {
                              return (
                                <div className="p-6 rounded-xl bg-[#111827]/70 border border-slate-800 text-center space-y-2">
                                  <p className="text-sm text-slate-400">
                                    Aún no participas en campañas de otros anfitriones.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setIsJoinModalOpen(true)}
                                    className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold"
                                  >
                                    <Key className="w-3.5 h-3.5" />
                                    <span>Unirse con enlace o código de invitación</span>
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {partList.map(({ campana, role }) => {
                                  const countSesiones = sesiones.filter(
                                    (s) => s.campana_id === campana.id
                                  ).length;
                                  const countNpcs = npcs.filter(
                                    (n) => n.campana_id === campana.id
                                  ).length;
                                  const countLugares = lugares.filter(
                                    (l) => l.campana_id === campana.id
                                  ).length;
                                  const countMisiones = misiones.filter(
                                    (m) => m.campana_id === campana.id
                                  ).length;
                                  const countObjetos = objetos.filter(
                                    (o) => o.campana_id === campana.id
                                  ).length;
                                  const ultimaFecha = getUltimaSesionFecha(campana.id);
                                  const canEdit = role === 'dm';

                                  return (
                                    <CampanaCard
                                      key={campana.id}
                                      campana={campana}
                                      sesionesCount={countSesiones}
                                      npcsCount={countNpcs}
                                      lugaresCount={countLugares}
                                      misionesCount={countMisiones}
                                      objetosCount={countObjetos}
                                      ultimaSesionFecha={ultimaFecha}
                                      role={role}
                                      canEdit={canEdit}
                                      onSelect={(c) => {
                                        navigateTo({
                                          view: 'campana',
                                          campanaId: c.id,
                                          campaignTab: activeCampaignTab,
                                        });
                                      }}
                                      onEdit={(c) => {
                                        setCampanaToEdit(c);
                                        setIsCampanaModalOpen(true);
                                      }}
                                      onDelete={(c) => setCampanaToDelete(c)}
                                    />
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      /* EN MODO LOCAL: LISTA UNIFICADA DE CAMPAÑAS EN LOCALSTORAGE */
                      <div>
                        {filteredCampanas.length === 0 ? (
                          <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 text-center space-y-2">
                            <p className="text-sm text-slate-400">
                              No se encontraron campañas que coincidan con la búsqueda o filtro seleccionado.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setBusquedaCampana('');
                                setFiltroSistema('todos');
                              }}
                              className="text-xs text-[#c9a227] hover:underline"
                            >
                              Limpiar filtros
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredCampanas.map((campana) => {
                              const countSesiones = sesiones.filter(
                                (s) => s.campana_id === campana.id
                              ).length;
                              const countNpcs = npcs.filter(
                                (n) => n.campana_id === campana.id
                              ).length;
                              const countLugares = lugares.filter(
                                (l) => l.campana_id === campana.id
                              ).length;
                              const countMisiones = misiones.filter(
                                (m) => m.campana_id === campana.id
                              ).length;
                              const countObjetos = objetos.filter(
                                (o) => o.campana_id === campana.id
                              ).length;
                              const ultimaFecha = getUltimaSesionFecha(campana.id);

                              return (
                                <CampanaCard
                                  key={campana.id}
                                  campana={campana}
                                  sesionesCount={countSesiones}
                                  npcsCount={countNpcs}
                                  lugaresCount={countLugares}
                                  misionesCount={countMisiones}
                                  objetosCount={countObjetos}
                                  ultimaSesionFecha={ultimaFecha}
                                  canEdit={true}
                                  onSelect={(c) => {
                                    navigateTo({
                                      view: 'campana',
                                      campanaId: c.id,
                                      campaignTab: activeCampaignTab,
                                    });
                                  }}
                                  onEdit={(c) => {
                                    setCampanaToEdit(c);
                                    setIsCampanaModalOpen(true);
                                  }}
                                  onDelete={(c) => setCampanaToDelete(c)}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer informativo */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0b0f17] py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-amber-200/90">
              Bitácora de Campaña
            </span>
            <span>• Fase 8: Diario Cronológico + Navegación Contextual</span>
          </div>
          <p className="text-slate-400">
            Libreta digital offline-first • Datos persistidos en el almacenamiento local del navegador
          </p>
        </div>
      </footer>

      {/* MODAL: Crear / Editar Campaña */}
      {isCampanaModalOpen && (
        <CampanaModal
          isOpen={isCampanaModalOpen}
          campanaToEdit={campanaToEdit}
          onClose={() => {
            setIsCampanaModalOpen(false);
            setCampanaToEdit(null);
          }}
          onSave={handleSaveCampana}
        />
      )}

      {/* MODAL: Crear / Editar Sesión */}
      {selectedCampanaId && isSesionModalOpen && (
        <SesionModal
          isOpen={isSesionModalOpen}
          campanaId={selectedCampanaId}
          siguienteNumero={getSiguienteNumeroSesion()}
          sesionToEdit={sesionToEdit}
          campanaSesiones={sesiones.filter((s) => s.campana_id === selectedCampanaId)}
          campanaNpcs={npcs.filter((n) => n.campana_id === selectedCampanaId)}
          campanaLugares={lugares.filter((l) => l.campana_id === selectedCampanaId)}
          campanaMisiones={misiones.filter((m) => m.campana_id === selectedCampanaId)}
          campanaObjetos={objetos.filter((o) => o.campana_id === selectedCampanaId)}
          campanaMonstruos={monstruos.filter((m) => m.campana_id === selectedCampanaId)}
          onClose={() => {
            setIsSesionModalOpen(false);
            setSesionToEdit(null);
          }}
          onSave={handleSaveSesion}
        />
      )}

      {/* MODAL: Crear / Editar NPC */}
      {selectedCampanaId && isNpcModalOpen && (
        <NpcModal
          isOpen={isNpcModalOpen}
          campanaId={selectedCampanaId}
          npcToEdit={npcToEdit}
          campanaNpcs={npcs.filter((n) => n.campana_id === selectedCampanaId)}
          onClose={() => {
            setIsNpcModalOpen(false);
            setNpcToEdit(null);
          }}
          onSave={handleSaveNpc}
        />
      )}

      {/* MODAL: Crear / Editar Lugar */}
      {selectedCampanaId && isLugarModalOpen && (
        <LugarModal
          isOpen={isLugarModalOpen}
          campanaId={selectedCampanaId}
          lugarToEdit={lugarToEdit}
          padreDefaultId={lugarPadreDefaultId}
          campanaLugares={activeCampanaLugares}
          onClose={() => {
            setIsLugarModalOpen(false);
            setLugarToEdit(null);
            setLugarPadreDefaultId(null);
          }}
          onSave={handleSaveLugar}
        />
      )}

      {/* MODAL: Crear / Editar Misión */}
      {selectedCampanaId && isMisionModalOpen && (
        <MisionModal
          isOpen={isMisionModalOpen}
          campanaId={selectedCampanaId}
          misionToEdit={misionToEdit}
          campanaMisiones={activeCampanaMisiones}
          campanaNpcs={activeCampanaNpcs}
          campanaLugares={activeCampanaLugares}
          onClose={() => {
            setIsMisionModalOpen(false);
            setMisionToEdit(null);
          }}
          onSave={handleSaveMision}
        />
      )}

      {/* MODAL: Crear / Editar Objeto */}
      {selectedCampanaId && isObjetoModalOpen && (
        <ObjetoModal
          isOpen={isObjetoModalOpen}
          campana={activeCampana || undefined}
          pjs={activeCampanaPjs}
          objetoToEdit={objetoToEdit}
          campanaObjetos={activeCampanaObjetos}
          onClose={() => {
            setIsObjetoModalOpen(false);
            setObjetoToEdit(null);
          }}
          onSave={handleSaveObjeto}
        />
      )}

      {/* MODAL: Crear / Editar Monstruo */}
      {selectedCampanaId && isMonstruoModalOpen && (
        <MonstruoModal
          isOpen={isMonstruoModalOpen}
          campana={activeCampana || undefined}
          monstruoToEdit={monstruoToEdit}
          campanaMonstruos={activeCampanaMonstruos}
          onClose={() => {
            setIsMonstruoModalOpen(false);
            setMonstruoToEdit(null);
          }}
          onSave={handleSaveMonstruo}
        />
      )}

      {/* MODAL: Crear / Editar Personaje Jugador (PJ) */}
      {selectedCampanaId && isPjModalOpen && (
        <PjModal
          isOpen={isPjModalOpen}
          campanaId={selectedCampanaId}
          pjToEdit={pjToEdit}
          campanaPjs={activeCampanaPjs}
          onClose={() => {
            setIsPjModalOpen(false);
            setPjToEdit(null);
          }}
          onSave={handleSavePj}
        />
      )}

      {/* MODAL: Detalle de Personaje Jugador (PJ) */}
      <PjDetailModal
        isOpen={Boolean(selectedPjDetail)}
        pj={selectedPjDetail}
        objetos={activeCampanaObjetos}
        modoApp={modoApp}
        onClose={() => setSelectedPjDetail(null)}
        onEdit={(pj) => {
          setPjToEdit(pj);
          setIsPjModalOpen(true);
        }}
        onDelete={(pj) => setPjToDelete(pj)}
        onUpdatePj={handleUpdatePj}
        onSelectObjeto={handleSelectObjeto}
      />

      {/* MODAL: Confirmar eliminación de PJ */}
      <ConfirmModal
        isOpen={Boolean(pjToDelete)}
        title={`¿Eliminar personaje "${pjToDelete?.nombre}"?`}
        message={`Esta acción eliminará la ficha de ${pjToDelete?.nombre} (${pjToDelete?.clase}) de forma permanente. Los objetos asignados a este personaje pasarán a estar sin asignar en el grupo. ¿Deseas continuar?`}
        confirmText="Eliminar Personaje"
        isDangerous={true}
        onConfirm={() => {
          if (pjToDelete) {
            handleDeletePj(pjToDelete);
            setPjToDelete(null);
          }
        }}
        onCancel={() => setPjToDelete(null)}
      />

      {/* MODAL: Confirmar eliminación de Lugar (con gestión de jerarquía) */}
      <LugarDeleteModal
        isOpen={isLugarDeleteModalOpen || Boolean(lugarToDelete)}
        lugar={lugarToDelete}
        todosLosLugares={activeCampanaLugares}
        onClose={() => {
          setIsLugarDeleteModalOpen(false);
          setLugarToDelete(null);
        }}
        onConfirm={(lugarId, cascade) => {
          handleDeleteLugar(lugarId, cascade);
          setIsLugarDeleteModalOpen(false);
          setLugarToDelete(null);
        }}
      />

      {/* MODAL: Importar datos */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setCampanas(getCampanas());
          setSesiones(getSesiones());
          setNpcs(getNpcs());
          setLugares(getLugares());
          setMisiones(getMisiones());
          setObjetos(getObjetos());
          setMonstruos(getMonstruos());
          setPjs(getPjs());
        }}
      />

      {/* MODAL: Confirmar eliminación de campaña */}
      <ConfirmModal
        isOpen={!!campanaToDelete}
        title={`¿Eliminar campaña "${campanaToDelete?.nombre}"?`}
        message="Esta acción borrará la campaña y todas sus sesiones, NPCs, lugares, misiones, objetos y monstruos asociados guardados en tu navegador. Esta acción no se puede deshacer."
        confirmText="Eliminar Campaña"
        isDangerous={true}
        onConfirm={() => {
          if (campanaToDelete) {
            handleDeleteCampana(campanaToDelete.id);
            setCampanaToDelete(null);
          }
        }}
        onCancel={() => setCampanaToDelete(null)}
      />

      {/* MODAL: Autenticación Supabase (Fase 16) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          fetchUserProfile(user.id).then(setUserProfile);
          setStorageMode('cloud');
          setStorageModeState('cloud');
          setHasEnteredGuestMode(true);
          try {
            localStorage.setItem('bitacora_guest_mode', 'true');
          } catch {}
          loadCloudCampaigns(user.id);
        }}
        onSignOut={() => {
          setCurrentUser(null);
          setUserProfile(null);
          setCloudCampaignsWithRoles([]);
          setCampanas([]);
          setHasEnteredGuestMode(false);
          try {
            localStorage.removeItem('bitacora_guest_mode');
          } catch {}
          handleToggleStorageMode('local');
        }}
      />

      {/* MODAL: Unirse a Campaña mediante Token (Fase 16) */}
      <JoinCampaignModal
        isOpen={isJoinModalOpen}
        initialToken={urlInviteToken || ''}
        onClose={() => {
          setIsJoinModalOpen(false);
          setUrlInviteToken(null);
        }}
        onRequestAuth={() => {
          setIsJoinModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSuccess={(joinedCampaignId) => {
          if (currentUser) {
            loadCloudCampaigns(currentUser.id).then(() => {
              navigateTo({
                view: 'campana',
                campanaId: joinedCampaignId,
                campaignTab: 'diario',
              });
            });
          }
        }}
      />

      {/* MODAL: Generar y Gestionar Invitaciones (Fase 16) */}
      {selectedCampanaId && (
        <InviteModal
          isOpen={isInviteModalOpen}
          campaignId={selectedCampanaId}
          campaignName={activeCampana?.nombre || 'Campaña'}
          onClose={() => setIsInviteModalOpen(false)}
          onUploadCampaignToCloud={handleUploadActiveCampaignToCloud}
          onRequestAuth={() => {
            setIsInviteModalOpen(false);
            handleOpenAuth('login');
          }}
          currentUser={currentUser}
          storageMode={storageMode}
        />
      )}
    </div>
  );
}
