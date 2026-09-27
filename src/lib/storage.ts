import { Campana, Sesion, NPC, Lugar, Mision, Objeto, Monstruo, BackupBitacora, PJ, ModoApp, TemaApp, TemaConfig } from '../types';
import { cleanAndNormalizeTags } from './tags';

export const STORAGE_KEY_CAMPANAS = 'bitacora_campanas';
export const STORAGE_KEY_SESIONES = 'bitacora_sesiones';
export const STORAGE_KEY_NPCS = 'bitacora_npcs';
export const STORAGE_KEY_LUGARES = 'bitacora_lugares';
export const STORAGE_KEY_MISIONES = 'bitacora_misiones';
export const STORAGE_KEY_OBJETOS = 'bitacora_objetos';
export const STORAGE_KEY_MONSTRUOS = 'bitacora_monstruos';
export const STORAGE_KEY_PJS = 'bitacora_pjs';
export const STORAGE_KEY_MODO_APP = 'bitacora_modo_app';
export const STORAGE_KEY_TEMA = 'bitacora_tema';

export const TEMAS_APP: TemaConfig[] = [
  {
    id: 'oscuro-dorado',
    nombre: 'Oscuro Dorado',
    descripcion: 'Aspecto clásico y cálido de mesa de rol (por defecto)',
    isDark: true,
    colores: {
      fondo: '#1a1612',
      superficie: '#2a2420',
      texto: '#e8dcc8',
      acento: '#c9a227',
    },
  },
  {
    id: 'oscuro-azul',
    nombre: 'Oscuro Azul',
    descripcion: 'Aspecto nocturno frío, profundo y místico',
    isDark: true,
    colores: {
      fondo: '#0f1520',
      superficie: '#1a2535',
      texto: '#d8e0e8',
      acento: '#5b9bd5',
    },
  },
  {
    id: 'claro-pergamino',
    nombre: 'Claro Pergamino',
    descripcion: 'Textura cálida de tomo antiguo y pergamino de fantasía',
    isDark: false,
    colores: {
      fondo: '#f5ecd8',
      superficie: '#fdf8ed',
      texto: '#261b0c',
      acento: '#8b5a1f',
    },
  },
  {
    id: 'claro-moderno',
    nombre: 'Claro Moderno',
    descripcion: 'Diseño limpio, minimalista y de máxima legibilidad',
    isDark: false,
    colores: {
      fondo: '#f3f4f6',
      superficie: '#ffffff',
      texto: '#111827',
      acento: '#0284c7',
    },
  },
];

export function getTemaApp(): TemaApp {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMA) as TemaApp | null;
    if (
      raw === 'oscuro-dorado' ||
      raw === 'oscuro-azul' ||
      raw === 'claro-pergamino' ||
      raw === 'claro-moderno'
    ) {
      return raw;
    }
    return 'oscuro-dorado';
  } catch {
    return 'oscuro-dorado';
  }
}

export function applyTemaToDOM(tema: TemaApp): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-tema', tema);
  if (tema.startsWith('claro')) {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}

export function saveTemaApp(tema: TemaApp): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEMA, tema);
    applyTemaToDOM(tema);
  } catch (error) {
    console.error('Error al guardar tema:', error);
  }
}

export function getModoApp(): ModoApp {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODO_APP);
    return raw === 'dm' ? 'dm' : 'jugador';
  } catch {
    return 'jugador';
  }
}

export function saveModoApp(modo: ModoApp): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODO_APP, modo);
  } catch (error) {
    console.error('Error al guardar modo de app:', error);
  }
}

export function getCampanas(): Campana[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAMPANAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error al leer campañas de localStorage:', error);
    return [];
  }
}

export function saveCampanas(campanas: Campana[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CAMPANAS, JSON.stringify(campanas));
  } catch (error) {
    console.error('Error al guardar campañas en localStorage:', error);
  }
}

export function getSesiones(): Sesion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESIONES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Normalizar etiquetas y vinculaciones para compatibilidad con datos existentes
    return parsed.map((s: Sesion) => ({
      ...s,
      etiquetas: cleanAndNormalizeTags(s.etiquetas || []),
      npc_ids: Array.isArray(s.npc_ids) ? s.npc_ids : [],
      lugar_ids: Array.isArray(s.lugar_ids) ? s.lugar_ids : [],
      mision_ids: Array.isArray(s.mision_ids) ? s.mision_ids : [],
      objeto_ids: Array.isArray(s.objeto_ids) ? s.objeto_ids : [],
      monstruo_ids: Array.isArray(s.monstruo_ids) ? s.monstruo_ids : [],
    }));
  } catch (error) {
    console.error('Error al leer sesiones de localStorage:', error);
    return [];
  }
}

export function saveSesiones(sesiones: Sesion[]): void {
  try {
    const normalized = sesiones.map((s) => ({
      ...s,
      etiquetas: cleanAndNormalizeTags(s.etiquetas || []),
      npc_ids: Array.isArray(s.npc_ids) ? s.npc_ids : [],
      lugar_ids: Array.isArray(s.lugar_ids) ? s.lugar_ids : [],
      mision_ids: Array.isArray(s.mision_ids) ? s.mision_ids : [],
      objeto_ids: Array.isArray(s.objeto_ids) ? s.objeto_ids : [],
      monstruo_ids: Array.isArray(s.monstruo_ids) ? s.monstruo_ids : [],
    }));
    localStorage.setItem(STORAGE_KEY_SESIONES, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar sesiones en localStorage:', error);
  }
}

export function getSesionesByCampana(campanaId: string): Sesion[] {
  const todas = getSesiones();
  return todas
    .filter((s) => s.campana_id === campanaId)
    .sort((a, b) => a.numero - b.numero);
}

export function getNpcs(): NPC[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NPCS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((npc: NPC) => ({
      ...npc,
      etiquetas: cleanAndNormalizeTags(npc.etiquetas || []),
      sesion_ids: Array.isArray(npc.sesion_ids) ? npc.sesion_ids : [],
    }));
  } catch (error) {
    console.error('Error al leer NPCs de localStorage:', error);
    return [];
  }
}

export function saveNpcs(npcs: NPC[]): void {
  try {
    const normalized = npcs.map((npc) => ({
      ...npc,
      etiquetas: cleanAndNormalizeTags(npc.etiquetas || []),
      sesion_ids: Array.isArray(npc.sesion_ids) ? npc.sesion_ids : [],
    }));
    localStorage.setItem(STORAGE_KEY_NPCS, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar NPCs en localStorage:', error);
  }
}

export function getNpcsByCampana(campanaId: string): NPC[] {
  const todos = getNpcs();
  return todos
    .filter((n) => n.campana_id === campanaId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function getLugares(): Lugar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LUGARES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((loc: Lugar) => ({
      ...loc,
      hijos: Array.isArray(loc.hijos) ? loc.hijos : [],
      etiquetas: cleanAndNormalizeTags(loc.etiquetas || []),
      sesion_ids: Array.isArray(loc.sesion_ids) ? loc.sesion_ids : [],
    }));
  } catch (error) {
    console.error('Error al leer lugares de localStorage:', error);
    return [];
  }
}

export function saveLugares(lugares: Lugar[]): void {
  try {
    const normalized = lugares.map((loc) => ({
      ...loc,
      hijos: Array.isArray(loc.hijos) ? loc.hijos : [],
      etiquetas: cleanAndNormalizeTags(loc.etiquetas || []),
      sesion_ids: Array.isArray(loc.sesion_ids) ? loc.sesion_ids : [],
    }));
    localStorage.setItem(STORAGE_KEY_LUGARES, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar lugares en localStorage:', error);
  }
}

export function getLugaresByCampana(campanaId: string): Lugar[] {
  const todos = getLugares();
  return todos
    .filter((loc) => loc.campana_id === campanaId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function getMisiones(): Mision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISIONES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: Mision) => ({
      ...m,
      pasos: Array.isArray(m.pasos) ? m.pasos : [],
      etiquetas: cleanAndNormalizeTags(m.etiquetas || []),
      sesion_activacion_id: m.sesion_activacion_id || null,
      sesion_completado_id: m.sesion_completado_id || null,
      sesion_ids: Array.isArray(m.sesion_ids) ? m.sesion_ids : [],
    }));
  } catch (error) {
    console.error('Error al leer misiones de localStorage:', error);
    return [];
  }
}

export function saveMisiones(misiones: Mision[]): void {
  try {
    const normalized = misiones.map((m) => ({
      ...m,
      pasos: Array.isArray(m.pasos) ? m.pasos : [],
      etiquetas: cleanAndNormalizeTags(m.etiquetas || []),
      sesion_activacion_id: m.sesion_activacion_id || null,
      sesion_completado_id: m.sesion_completado_id || null,
      sesion_ids: Array.isArray(m.sesion_ids) ? m.sesion_ids : [],
    }));
    localStorage.setItem(STORAGE_KEY_MISIONES, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar misiones en localStorage:', error);
  }
}

export function getMisionesByCampana(campanaId: string): Mision[] {
  const todas = getMisiones();
  return todas
    .filter((m) => m.campana_id === campanaId)
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

export function getObjetos(): Objeto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OBJETOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((obj: Objeto) => ({
      ...obj,
      etiquetas: cleanAndNormalizeTags(obj.etiquetas || []),
      sesion_obtencion_id: obj.sesion_obtencion_id || null,
      sesion_ids: Array.isArray(obj.sesion_ids) ? obj.sesion_ids : [],
    }));
  } catch (error) {
    console.error('Error al leer objetos de localStorage:', error);
    return [];
  }
}

export function saveObjetos(objetos: Objeto[]): void {
  try {
    const normalized = objetos.map((obj) => ({
      ...obj,
      etiquetas: cleanAndNormalizeTags(obj.etiquetas || []),
      sesion_obtencion_id: obj.sesion_obtencion_id || null,
      sesion_ids: Array.isArray(obj.sesion_ids) ? obj.sesion_ids : [],
    }));
    localStorage.setItem(STORAGE_KEY_OBJETOS, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar objetos en localStorage:', error);
  }
}

export function getObjetosByCampana(campanaId: string): Objeto[] {
  const todos = getObjetos();
  return todos
    .filter((obj) => obj.campana_id === campanaId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function getMonstruos(): Monstruo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MONSTRUOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: Monstruo) => ({
      ...m,
      veces_encontrado: typeof m.veces_encontrado === 'number' && m.veces_encontrado >= 1 ? m.veces_encontrado : 1,
      etiquetas: cleanAndNormalizeTags(m.etiquetas || []),
      sesion_ids: Array.isArray(m.sesion_ids) ? m.sesion_ids : [],
    }));
  } catch (error) {
    console.error('Error al leer monstruos de localStorage:', error);
    return [];
  }
}

export function saveMonstruos(monstruos: Monstruo[]): void {
  try {
    const normalized = monstruos.map((m) => ({
      ...m,
      veces_encontrado: typeof m.veces_encontrado === 'number' && m.veces_encontrado >= 1 ? m.veces_encontrado : 1,
      etiquetas: cleanAndNormalizeTags(m.etiquetas || []),
      sesion_ids: Array.isArray(m.sesion_ids) ? m.sesion_ids : [],
    }));
    localStorage.setItem(STORAGE_KEY_MONSTRUOS, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar monstruos en localStorage:', error);
  }
}

export function getMonstruosByCampana(campanaId: string): Monstruo[] {
  const todos = getMonstruos();
  return todos
    .filter((m) => m.campana_id === campanaId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function getPjs(): PJ[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PJS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: PJ) => ({
      ...p,
      nivel: typeof p.nivel === 'number' && p.nivel >= 1 ? p.nivel : 1,
      pg_max: typeof p.pg_max === 'number' ? p.pg_max : 10,
      ca: typeof p.ca === 'number' ? p.ca : 10,
      etiquetas: cleanAndNormalizeTags(p.etiquetas || []),
      estado: p.estado || 'activo',
    }));
  } catch (error) {
    console.error('Error al leer PJs de localStorage:', error);
    return [];
  }
}

export function savePjs(pjs: PJ[]): void {
  try {
    const normalized = pjs.map((p) => ({
      ...p,
      nivel: typeof p.nivel === 'number' && p.nivel >= 1 ? p.nivel : 1,
      pg_max: typeof p.pg_max === 'number' ? p.pg_max : 10,
      ca: typeof p.ca === 'number' ? p.ca : 10,
      etiquetas: cleanAndNormalizeTags(p.etiquetas || []),
      estado: p.estado || 'activo',
    }));
    localStorage.setItem(STORAGE_KEY_PJS, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error al guardar PJs en localStorage:', error);
  }
}

export function getPjsByCampana(campanaId: string): PJ[] {
  const todos = getPjs();
  return todos
    .filter((p) => p.campana_id === campanaId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function exportarDatos(): void {
  const campanas = getCampanas();
  const sesiones = getSesiones();
  const npcs = getNpcs();
  const lugares = getLugares();
  const misiones = getMisiones();
  const objetos = getObjetos();
  const monstruos = getMonstruos();
  const pjs = getPjs();
  const backup: BackupBitacora = {
    version: 1,
    exported_at: new Date().toISOString(),
    campanas,
    sesiones,
    npcs,
    lugares,
    misiones,
    objetos,
    monstruos,
    pjs,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(backup, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  const fecha = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `bitacora_campana_backup_${fecha}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importarDatos(jsonContent: string): {
  success: boolean;
  totalCampanas: number;
  totalSesiones: number;
  totalNpcs: number;
  totalLugares: number;
  totalMisiones: number;
  totalObjetos: number;
  totalMonstruos: number;
  totalPjs: number;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    let campanas: Campana[] = [];
    let sesiones: Sesion[] = [];
    let npcs: NPC[] = [];
    let lugares: Lugar[] = [];
    let misiones: Mision[] = [];
    let objetos: Objeto[] = [];
    let monstruos: Monstruo[] = [];
    let pjs: PJ[] = [];

    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.campanas)) {
        campanas = parsed.campanas;
      }
      if (Array.isArray(parsed.sesiones)) {
        sesiones = parsed.sesiones;
      }
      if (Array.isArray(parsed.npcs)) {
        npcs = parsed.npcs;
      }
      if (Array.isArray(parsed.lugares)) {
        lugares = parsed.lugares;
      }
      if (Array.isArray(parsed.misiones)) {
        misiones = parsed.misiones;
      }
      if (Array.isArray(parsed.objetos)) {
        objetos = parsed.objetos;
      }
      if (Array.isArray(parsed.monstruos)) {
        monstruos = parsed.monstruos;
      }
      if (Array.isArray(parsed.pjs)) {
        pjs = parsed.pjs;
      }
    }

    if (
      campanas.length === 0 &&
      sesiones.length === 0 &&
      npcs.length === 0 &&
      lugares.length === 0 &&
      misiones.length === 0 &&
      objetos.length === 0 &&
      monstruos.length === 0 &&
      pjs.length === 0
    ) {
      return {
        success: false,
        totalCampanas: 0,
        totalSesiones: 0,
        totalNpcs: 0,
        totalLugares: 0,
        totalMisiones: 0,
        totalObjetos: 0,
        totalMonstruos: 0,
        totalPjs: 0,
        error: 'El archivo JSON no contiene campañas, sesiones, NPCs, lugares, misiones, objetos, monstruos ni PJs válidos.',
      };
    }

    saveCampanas(campanas);
    saveSesiones(sesiones);
    saveNpcs(npcs);
    saveLugares(lugares);
    saveMisiones(misiones);
    saveObjetos(objetos);
    saveMonstruos(monstruos);
    savePjs(pjs);

    return {
      success: true,
      totalCampanas: campanas.length,
      totalSesiones: sesiones.length,
      totalNpcs: npcs.length,
      totalLugares: lugares.length,
      totalMisiones: misiones.length,
      totalObjetos: objetos.length,
      totalMonstruos: monstruos.length,
      totalPjs: pjs.length,
    };
  } catch (error) {
    return {
      success: false,
      totalCampanas: 0,
      totalSesiones: 0,
      totalNpcs: 0,
      totalLugares: 0,
      totalMisiones: 0,
      totalObjetos: 0,
      totalMonstruos: 0,
      totalPjs: 0,
      error: error instanceof Error ? error.message : 'Formato de JSON inválido',
    };
  }
}

export function cargarEjemploInicial(): {
  campana: Campana;
  sesion: Sesion;
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  pjs: PJ[];
} {
  const pjEjemplo1: PJ = {
    id: 'pj_001',
    campana_id: 'camp_001',
    nombre: 'Kragthor Barbafuego',
    clase: 'Bárbaro',
    raza: 'Enano',
    nivel: 3,
    pg_max: 32,
    ca: 15,
    descripcion: 'Enano robusto con barba trenzada y hacha de guerra.',
    personalidad: 'Impulsivo, leal, protector.',
    trasfondo: 'Ex-minero de las Montañas de la Espada.',
    notas: 'Debe 50 po a un mercader de Neverwinter.',
    estado: 'activo',
    etiquetas: ['jugador', 'enano'],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const pjEjemplo2: PJ = {
    id: 'pj_002',
    campana_id: 'camp_001',
    nombre: 'Elora Hojasusurro',
    clase: 'Pícara',
    raza: 'Elfa de los bosques',
    nivel: 3,
    pg_max: 24,
    ca: 14,
    descripcion: 'Ágil y de mirada alerta, viste ropajes de cuero oscuro y capa de viaje verde musgo.',
    personalidad: 'Cautelosa, observadora y con debilidad por los enigmas antiguos.',
    trasfondo: 'Exploradora y rastreadora de los lindes de Neverwinter.',
    notas: 'Lleva un mapa parcial de la región de las colinas de Phandalin.',
    estado: 'activo',
    etiquetas: ['jugador', 'elfa', 'picara'],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const campanaEjemplo: Campana = {
    id: 'camp_001',
    nombre: 'La Mina Perdida de Phandelver',
    sistema: 'D&D 2024',
    descripcion: 'Campaña de introducción al Valle de Phandalin y la leyenda de la cueva del Eco.',
    estado: 'activa',
    fecha_inicio: '2026-01-15',
    pj_ids: ['pj_001', 'pj_002'],
    notas_dm: 'Gundren Rockseeker contrató al grupo en Neverwinter para escoltar una carreta de suministros hasta Phandalin.',
    creada_en: '2026-01-15T10:00:00Z',
  };

  const sesionEjemplo: Sesion = {
    id: 'sesion_001',
    campana_id: 'camp_001',
    numero: 1,
    titulo: 'La emboscada goblin',
    fecha_real: '2026-01-15',
    dia_juego_inicio: 1,
    dia_juego_fin: 1,
    duracion_horas: 3,
    pj_ids_presentes: [],
    notas: `El grupo avanzaba escoltando la carreta por el Camino Alto cuando descubrieron dos caballos muertos atravesados en el sendero, pertenecientes a Gundren y Sildar.

De repente, una lluvia de flechas cayó desde los matorrales. Cuatro goblins de la tribu Cragmaw atacaron por sorpresa.
- El pícaro flanqueó por los arbustos y abatió al arquero líder.
- El clérigo curó al guerrero tras recibir un golpe crítico de cimitarra.

Tras interrogar al último goblin superviviente, confesó que su jefe Klarg llevó a los prisioneros a su guarida en las colinas cercanas.`,
    etiquetas: ['combate', 'inicio', 'emboscada', 'goblins'],
    npc_ids: ['npc_gundren'],
    lugar_ids: ['loc_001'],
    mision_ids: ['mision_001'],
    objeto_ids: ['objeto_002'],
    monstruo_ids: ['monstruo_001', 'monstruo_002'],
    creada_en: '2026-01-15T22:00:00Z',
  };

  const npcBarthen: NPC = {
    id: 'npc_001',
    campana_id: 'camp_001',
    nombre: 'Elmar Barthen',
    nombre_conocido: true,
    rol: 'Tendero',
    actitud: 'amistoso',
    descripcion: 'Humano enjuto, medio calvo, de unos 50 años.',
    ubicacion_habitual: 'Suministros Barthen, Phandalin',
    informacion_conocida:
      'Nos pagó 10 po por entregar el carromato de provisiones. Está preocupado por el acoso de la banda Marca Roja.',
    informacion_sospechada:
      'Sospecha que alguien del pueblo podría estar colaborando en secreto con los bandidos.',
    notas: 'Nos advirtió que los miembros de la Marca Roja suelen frecuentar la taberna El Gigante Durmiente.',
    etiquetas: ['aliado', 'comerciante'],
    sesion_ids: [],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const npcGundren: NPC = {
    id: 'npc_gundren',
    campana_id: 'camp_001',
    nombre: 'Gundren Buscarrocas',
    nombre_conocido: true,
    rol: 'Patrón / Explorador enano',
    actitud: 'aliado',
    descripcion: 'Enano animado y visionario, optimista con su nuevo hallazgo comercial y minero.',
    ubicacion_habitual: 'Neverwinter / Cueva del Eco Oleaje',
    informacion_conocida: 'Nos contrató en Neverwinter para escoltar una carreta de suministros hasta Phandalin.',
    informacion_sospechada: 'Descubrió junto a sus hermanos la entrada secreta a la Cueva del Eco Oleaje.',
    notas: 'Fue capturado en una emboscada goblin junto con Sildar Hallwinter.',
    etiquetas: ['aliado', 'enano', 'patron'],
    sesion_ids: ['sesion_001'],
    creado_en: '2026-01-15T12:00:00Z',
  };

  const lugarRaizEjemplo: Lugar = {
    id: 'loc_001',
    campana_id: 'camp_001',
    nombre: 'Phandalin',
    nombre_conocido: true,
    tipo: 'pueblo',
    padre_id: null,
    hijos: ['loc_002'],
    descripcion: 'Ciudad fronteriza construida sobre ruinas antiguas a los pies de las colinas de la Espada.',
    como_llegar: 'Por el Sendero de Triboar, desde el sur tras varios días de marcha.',
    que_hay: 'Posada Colina de Piedra, Suministros Barthen, santuario de la Suerte y la Mansión Tresendar en ruinas.',
    que_paso: 'Aquí conocimos a Barthen y Sildar nos presentó al burgomaestre Harbin Wester.',
    notas: 'La banda de la Marca Roja extorsiona al pueblo. Cuidado con la taberna El Gigante Durmiente.',
    estado: 'visitado',
    etiquetas: ['pueblo', 'comercio', 'peligroso'],
    sesion_ids: ['sesion_001'],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const subLugarEjemplo: Lugar = {
    id: 'loc_002',
    campana_id: 'camp_001',
    nombre: 'Suministros Barthen',
    nombre_conocido: true,
    tipo: 'edificio',
    padre_id: 'loc_001',
    hijos: [],
    descripcion: 'El puesto comercial más grande de Phandalin, con un amplio almacén y establos anexos.',
    como_llegar: 'En la plaza este de Phandalin, frente a la posada.',
    que_hay: 'Raciones, cuerdas, antorchas, armas comunes y aperos de labranza.',
    que_paso: 'Entregamos la carreta de Gundren a Elmar Barthen y cobramos las 10 piezas de oro.',
    notas: 'Elmar es un hombre amistoso y preocupado por los matones de la Marca Roja.',
    estado: 'visitado',
    etiquetas: ['tienda', 'comercio', 'seguro'],
    sesion_ids: [],
    creado_en: '2026-01-20T15:30:00Z',
  };

  const misionEjemplo: Mision = {
    id: 'mision_001',
    campana_id: 'camp_001',
    titulo: 'Rescatar a Gundren Buscarrocas',
    descripcion: 'Nuestro patrón enano fue capturado por goblins. Debemos encontrarlo.',
    origen_npc_id: 'npc_gundren',
    origen_lugar_id: null,
    estado: 'activa',
    pasos: [
      { id: 'paso_001', texto: 'Investigar el lugar de la emboscada', completado: true },
      { id: 'paso_002', texto: 'Encontrar el rastro goblin', completado: true },
      { id: 'paso_003', texto: 'Llegar a la Guarida Bocapeñasco', completado: true },
      { id: 'paso_004', texto: 'Rescatar a Sildar', completado: true },
      { id: 'paso_005', texto: 'Derrotar a Klarg', completado: false },
      { id: 'paso_006', texto: 'Averiguar dónde está Gundren', completado: false },
    ],
    recompensa_conocida: '10 po por escoltar el carromato',
    recompensa_obtenida: '',
    notas: 'Nos la dio Gundren en Neverwinter.',
    etiquetas: ['principal', 'rescate'],
    sesion_activacion_id: 'sesion_001',
    sesion_completado_id: null,
    sesion_ids: ['sesion_001'],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const objetoEjemplo1: Objeto = {
    id: 'objeto_001',
    campana_id: 'camp_001',
    nombre: "Espada larga +1 'Garra'",
    nombre_conocido: true,
    tipo: 'arma',
    descripcion: 'Espada larga en vaina de plata cincelada. La empuñadura tiene forma de pájaro rapaz con las alas extendidas.',
    efecto_conocido: "+1 a ataque y daño. Inscripción: 'Garra'.",
    efecto_sospechado: 'Quizás tiene algo que ver con los Tresendar.',
    donde_lo_conseguimos: 'En la grieta del escondite de la Marca Roja, en un cofre.',
    quien_lo_lleva: 'Kragthor Barbafuego',
    notas: 'Pertenecía a Aldith Tresendar, el Halcón Negro.',
    etiquetas: ['magico', 'arma', 'tresendar'],
    sesion_obtencion_id: null,
    sesion_ids: [],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const objetoEjemplo2: Objeto = {
    id: 'objeto_002',
    campana_id: 'camp_001',
    nombre: 'Poción de Curación Mayor',
    nombre_conocido: true,
    tipo: 'pocion',
    descripcion: 'Frasco de cristal sellado con cera roja, líquido translúcido con brillos carmesíes.',
    efecto_conocido: 'Restaura 4d4 + 4 puntos de golpe al beberse.',
    efecto_sospechado: '',
    donde_lo_conseguimos: 'Comprada a la botica de Phandalin.',
    quien_lo_lleva: 'Elora Hojasusurro',
    notas: 'Reservar para emergencias en combate contra jefes.',
    etiquetas: ['pocion', 'curacion', 'consumible'],
    sesion_obtencion_id: 'sesion_001',
    sesion_ids: ['sesion_001'],
    creado_en: '2026-01-21T11:00:00Z',
  };

  const monstruoEjemplo1: Monstruo = {
    id: 'monstruo_001',
    campana_id: 'camp_001',
    nombre: 'Goblin',
    nombre_conocido: true,
    tipo: 'humanoide',
    descripcion_visual: 'Pequeños, verdes, orejas puntiagudas, dientes afilados y ojos amarillentos.',
    comportamiento: 'Atacan en grupo desde la maleza. Usan cimitarras oxidadas y arcos cortos. Tienden a huir en desbandada si matan a su líder.',
    debilidades: 'Parecen frágiles y tienen poca moral individual, pero son muy escurridizos en terreno difícil.',
    resistencias: '',
    donde_lo_vimos: 'Sendero de Triboar, emboscada a los caballos y Guarida Bocapeñasco.',
    veces_encontrado: 3,
    notas: 'Uno intentó huir hacia el noroeste. Uno de ellos hablaba común balbuceando órdenes sobre un tal "Klarg".',
    etiquetas: ['goblinoide', 'peligroso', 'emboscada'],
    sesion_ids: ['sesion_001'],
    creado_en: '2026-01-20T15:00:00Z',
  };

  const monstruoEjemplo2: Monstruo = {
    id: 'monstruo_002',
    campana_id: 'camp_001',
    nombre: 'Lobo de los bosques',
    nombre_conocido: true,
    tipo: 'bestia',
    descripcion_visual: 'Caninos grises de pelaje espeso y ojos penetrantes, hocicos ensangrentados y tamaño mayor a un sabueso.',
    comportamiento: 'Cazan en jauría flanqueando a la presa para derribarla al suelo.',
    debilidades: 'Sensibles al fuego y a ruidos estruendosos.',
    resistencias: 'Olfato y oído muy agudos.',
    donde_lo_vimos: 'Encadenados en la cueva de estalactitas de Bocapeñasco.',
    veces_encontrado: 1,
    notas: 'Estaban hambrientos. Si les arrojas cecina se distraen momentáneamente.',
    etiquetas: ['manada', 'salvaje', 'bestia'],
    sesion_ids: ['sesion_001'],
    creado_en: '2026-01-21T16:00:00Z',
  };

  const campanas = getCampanas();
  const sesiones = getSesiones();
  const npcs = getNpcs();
  const lugares = getLugares();
  const misiones = getMisiones();
  const objetos = getObjetos();
  const monstruos = getMonstruos();
  const pjs = getPjs();

  if (!campanas.some((c) => c.id === campanaEjemplo.id)) {
    campanas.push(campanaEjemplo);
    saveCampanas(campanas);
  }

  if (!sesiones.some((s) => s.id === sesionEjemplo.id)) {
    sesiones.push(sesionEjemplo);
    saveSesiones(sesiones);
  }

  if (!pjs.some((p) => p.id === pjEjemplo1.id)) {
    pjs.push(pjEjemplo1);
  }
  if (!pjs.some((p) => p.id === pjEjemplo2.id)) {
    pjs.push(pjEjemplo2);
  }
  savePjs(pjs);

  if (!npcs.some((n) => n.id === npcBarthen.id)) {
    npcs.push(npcBarthen);
  }
  if (!npcs.some((n) => n.id === npcGundren.id)) {
    npcs.push(npcGundren);
  }
  saveNpcs(npcs);

  if (!lugares.some((l) => l.id === lugarRaizEjemplo.id)) {
    lugares.push(lugarRaizEjemplo);
  }
  if (!lugares.some((l) => l.id === subLugarEjemplo.id)) {
    lugares.push(subLugarEjemplo);
  }
  saveLugares(lugares);

  if (!misiones.some((m) => m.id === misionEjemplo.id)) {
    misiones.push(misionEjemplo);
    saveMisiones(misiones);
  }

  if (!objetos.some((o) => o.id === objetoEjemplo1.id)) {
    objetos.push(objetoEjemplo1);
  }
  if (!objetos.some((o) => o.id === objetoEjemplo2.id)) {
    objetos.push(objetoEjemplo2);
  }
  saveObjetos(objetos);

  if (!monstruos.some((m) => m.id === monstruoEjemplo1.id)) {
    monstruos.push(monstruoEjemplo1);
  }
  if (!monstruos.some((m) => m.id === monstruoEjemplo2.id)) {
    monstruos.push(monstruoEjemplo2);
  }
  saveMonstruos(monstruos);

  return {
    campana: campanaEjemplo,
    sesion: sesionEjemplo,
    npcs: [npcBarthen, npcGundren],
    lugares: [lugarRaizEjemplo, subLugarEjemplo],
    misiones: [misionEjemplo],
    objetos: [objetoEjemplo1, objetoEjemplo2],
    monstruos: [monstruoEjemplo1, monstruoEjemplo2],
    pjs: [pjEjemplo1, pjEjemplo2],
  };
}
