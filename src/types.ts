export type EstadoCampana = 'activa' | 'pausada' | 'completada' | 'abandonada';

export interface Campana {
  id: string;
  nombre: string;
  sistema: string;
  descripcion: string;
  estado: EstadoCampana;
  fecha_inicio: string; // YYYY-MM-DD
  pj_ids: string[]; // preparado para grupo/personajes
  notas_dm: string;
  creada_en: string; // ISO string
}

export interface Sesion {
  id: string;
  campana_id: string;
  numero: number;
  titulo: string;
  fecha_real: string; // YYYY-MM-DD
  dia_juego_inicio: number;
  dia_juego_fin?: number | null;
  duracion_horas?: number | null;
  pj_ids_presentes: string[];
  notas: string;
  notas_dm?: string;
  etiquetas: string[];
  npc_ids: string[];
  lugar_ids: string[];
  mision_ids: string[];
  objeto_ids: string[];
  monstruo_ids: string[];
  creada_en: string; // ISO string
}

export type ActitudNPC =
  | 'aliado'
  | 'amistoso'
  | 'neutral'
  | 'receloso'
  | 'hostil'
  | 'desconocido';

export interface NPC {
  id: string;
  campana_id: string;
  nombre: string;
  nombre_conocido: boolean;
  rol: string;
  actitud: ActitudNPC;
  descripcion: string;
  ubicacion_habitual: string;
  informacion_conocida: string;
  informacion_sospechada: string;
  notas: string;
  notas_dm?: string;
  etiquetas: string[];
  sesion_ids: string[];
  creado_en: string; // ISO string
}

export type TipoLugar =
  | 'region'
  | 'pueblo'
  | 'edificio'
  | 'habitacion'
  | 'exterior'
  | 'viaje'
  | 'otro';

export type EstadoLugar =
  | 'visitado'
  | 'conocido'
  | 'misterioso'
  | 'inaccesible';

export interface Lugar {
  id: string;
  campana_id: string;
  nombre: string;
  nombre_conocido: boolean;
  tipo: TipoLugar;
  padre_id: string | null;
  hijos: string[];
  descripcion: string;
  como_llegar: string;
  que_hay: string;
  que_paso: string;
  notas: string;
  notas_dm?: string;
  estado: EstadoLugar;
  etiquetas: string[];
  sesion_ids: string[];
  creado_en: string; // ISO string
}

export type EstadoMision =
  | 'activa'
  | 'completada'
  | 'fallada'
  | 'abandonada'
  | 'pausada';

export interface PasoMision {
  id: string;
  texto: string;
  completado: boolean;
}

export interface Mision {
  id: string;
  campana_id: string;
  titulo: string;
  descripcion: string;
  origen_npc_id: string | null;
  origen_lugar_id: string | null;
  estado: EstadoMision;
  pasos: PasoMision[];
  recompensa_conocida: string;
  recompensa_obtenida: string;
  notas: string;
  notas_dm?: string;
  etiquetas: string[];
  sesion_activacion_id: string | null;
  sesion_completado_id: string | null;
  sesion_ids: string[];
  creado_en: string; // ISO string
}

export type TipoObjeto =
  | 'arma'
  | 'armadura'
  | 'pocion'
  | 'pergamino'
  | 'anillo'
  | 'varita'
  | 'vara'
  | 'tesoro'
  | 'miscelaneo'
  | 'otro';

export interface Objeto {
  id: string;
  campana_id: string;
  nombre: string;
  nombre_conocido: boolean;
  tipo: TipoObjeto;
  descripcion: string;
  efecto_conocido: string;
  efecto_sospechado: string;
  donde_lo_conseguimos: string;
  quien_lo_lleva: string | null;
  notas: string;
  notas_dm?: string;
  etiquetas: string[];
  sesion_obtencion_id: string | null;
  sesion_ids: string[];
  creado_en: string; // ISO string
}

export type TipoMonstruo =
  | 'bestia'
  | 'humanoide'
  | 'no_muerto'
  | 'dragon'
  | 'gigante'
  | 'monstruosidad'
  | 'aberracion'
  | 'cieno'
  | 'planta'
  | 'otro';

export interface Monstruo {
  id: string;
  campana_id: string;
  nombre: string;
  nombre_conocido: boolean;
  tipo: TipoMonstruo;
  descripcion_visual: string;
  comportamiento: string;
  debilidades: string;
  resistencias: string;
  donde_lo_vimos: string;
  veces_encontrado: number;
  notas: string;
  notas_dm?: string;
  etiquetas: string[];
  sesion_ids: string[];
  creado_en: string; // ISO string
}

export type EstadoPJ = 'activo' | 'retirado' | 'muerto' | 'desaparecido';

export interface PJ {
  id: string;
  campana_id: string;
  user_id?: string; // Dueño de la ficha (en campañas multijugador Supabase)
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
  notas_dm?: string;
  estado: EstadoPJ;
  etiquetas: string[];
  creado_en: string; // ISO string
}

export type ModoApp = 'jugador' | 'dm';

export type SingleEntityType =
  | 'npc'
  | 'lugar'
  | 'mision'
  | 'objeto'
  | 'monstruo'
  | 'pj'
  | 'sesion';

export interface SingleEntityExport<T = any> {
  tipo: SingleEntityType;
  version: string;
  exportado_en: string;
  entidad: T;
  referencias?: {
    sesion_ids?: string[];
    [key: string]: any;
  };
}

export interface CampanaExport {
  tipo: 'campana';
  version: string;
  exportado_en: string;
  campana: Campana;
  sesiones: Sesion[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  pjs: PJ[];
}

export interface BackupBitacora {
  version: number;
  exported_at: string;
  campanas: Campana[];
  sesiones: Sesion[];
  npcs?: NPC[];
  lugares?: Lugar[];
  misiones?: Mision[];
  objetos?: Objeto[];
  monstruos?: Monstruo[];
  pjs?: PJ[];
}

export type CampanaTab =
  | 'diario'
  | 'sesiones'
  | 'grupo'
  | 'npcs'
  | 'lugares'
  | 'misiones'
  | 'objetos'
  | 'bestiario'
  | 'resumen'
  | 'mapa'
  | 'miembros';

export type ViewType =
  | 'campanas'
  | 'campana'
  | 'sesion'
  | 'pj'
  | 'npc'
  | 'lugar'
  | 'mision'
  | 'objeto'
  | 'monstruo';

export interface NavigationState {
  view: ViewType;
  campanaId: string | null;
  entityId?: string | null;
  campaignTab?: CampanaTab;
  originLabel?: string;
}

export type TemaApp =
  | 'oscuro-dorado'
  | 'oscuro-azul'
  | 'claro-pergamino'
  | 'claro-moderno';

export interface TemaConfig {
  id: TemaApp;
  nombre: string;
  descripcion: string;
  isDark: boolean;
  colores: {
    fondo: string;
    superficie: string;
    texto: string;
    acento: string;
  };
}
