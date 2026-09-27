import { Sesion } from '../types';

/**
 * Normaliza una etiqueta temática según las especificaciones:
 * - Minúsculas
 * - Sin espacios iniciales ni finales (trim)
 * - Sin tildes / signos diacríticos (á -> a, ñ -> n, etc.)
 * - Espacios y guiones bajos reemplazados por guiones (-)
 * - Eliminación de caracteres especiales o puntuación
 * - Colapso de guiones consecutivos y recorte de guiones extremos
 */
export function normalizeTag(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes y diacríticos
    .replace(/[^a-z0-9\s-_]/g, '') // Elimina caracteres especiales
    .replace(/[\s_]+/g, '-') // Espacios y guiones bajos a guiones
    .replace(/-+/g, '-') // Colapsa guiones repetidos
    .replace(/^-+|-+$/g, ''); // Recorta guiones en extremos
}

/**
 * Limpia y normaliza un arreglo de etiquetas asegurando que sean únicas.
 */
export function cleanAndNormalizeTags(tags: (string | undefined | null)[]): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    if (!raw) continue;
    const normalized = normalizeTag(raw);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}

/**
 * Lista de etiquetas temáticas sugeridas por defecto para sesiones de rol
 */
export const ETIQUETAS_SUGERIDAS_DEFECTO: string[] = [
  'combate',
  'rol',
  'investigacion',
  'jefe',
  'descanso',
  'viaje',
  'social',
  'exploracion',
  'misterio',
  'recompensa',
  'mazmorra',
  'sigilo',
  'lore',
  'trampa',
  'diplomacia',
];

export interface HasEtiquetas {
  etiquetas?: string[];
}

/**
 * Lista de etiquetas temáticas sugeridas por defecto para NPCs
 */
export const ETIQUETAS_SUGERIDAS_NPCS: string[] = [
  'aliado',
  'comerciante',
  'noble',
  'guardia',
  'mago',
  'informante',
  'posadero',
  'villano',
  'mercenario',
  'clerigo',
  'artesano',
  'lider',
  'guia',
  'sospechoso',
];

/**
 * Lista de etiquetas temáticas sugeridas por defecto para Lugares
 */
export const ETIQUETAS_SUGERIDAS_LUGARES: string[] = [
  'pueblo',
  'ciudad',
  'posada',
  'tienda',
  'mazmorra',
  'ruinas',
  'bosque',
  'montana',
  'cueva',
  'fortaleza',
  'templo',
  'puerto',
  'peligroso',
  'seguro',
  'comercio',
  'misterio',
];

/**
 * Lista de etiquetas temáticas sugeridas por defecto para Misiones
 */
export const ETIQUETAS_SUGERIDAS_MISIONES: string[] = [
  'principal',
  'secundaria',
  'encargo',
  'rescate',
  'investigacion',
  'exploracion',
  'combate',
  'cazarrecompensas',
  'urgente',
  'sigilo',
  'escolta',
  'misterio',
  'diplomacia',
  'recompensa',
];

/**
 * Lista de etiquetas temáticas sugeridas por defecto para Objetos
 */
export const ETIQUETAS_SUGERIDAS_OBJETOS: string[] = [
  'magico',
  'arma',
  'armadura',
  'pocion',
  'pergamino',
  'curacion',
  'valioso',
  'maldito',
  'reliquia',
  'clave',
  'legendario',
  'utilidad',
  'trampa',
  'consumible',
  'arcano',
  'tesoro',
];

/**
 * Lista de etiquetas temáticas sugeridas por defecto para el Bestiario / Monstruos
 */
export const ETIQUETAS_SUGERIDAS_BESTIARIO: string[] = [
  'goblinoide',
  'peligroso',
  'nocturno',
  'emboscada',
  'manada',
  'jefe',
  'veneno',
  'magico',
  'volador',
  'acuatico',
  'escurridizo',
  'resistente',
  'maldito',
  'subterraneo',
  'astuto',
  'salvaje',
];

export interface TagFrequency {
  tag: string;
  count: number;
}

/**
 * Calcula las etiquetas existentes en una colección de elementos (sesiones o NPCs)
 * y su frecuencia, ordenadas de mayor a menor frecuencia, luego alfabéticamente.
 */
export function getTagsFrequencies(items: HasEtiquetas[]): TagFrequency[] {
  const counts: Record<string, number> = {};

  for (const item of items) {
    if (!Array.isArray(item.etiquetas)) continue;
    for (const rawTag of item.etiquetas) {
      const tag = normalizeTag(rawTag);
      if (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.tag.localeCompare(b.tag);
    });
}
