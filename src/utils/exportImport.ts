import {
  Campana,
  Sesion,
  NPC,
  Lugar,
  Mision,
  Objeto,
  Monstruo,
  PJ,
  SingleEntityType,
  SingleEntityExport,
  CampanaExport,
} from '../types';

/**
 * Convierte un texto en un slug seguro para nombres de archivos
 */
export function slugify(text: string): string {
  return (text || 'archivo')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '_')
    .substring(0, 40);
}

/**
 * Dispara la descarga en el navegador de un archivo JSON
 */
export function downloadJsonFile(filename: string, data: any): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exporta una entidad individual a formato JSON estándar
 */
export function exportSingleEntity(
  tipo: SingleEntityType,
  entity: any,
  referencias?: Record<string, any>
): void {
  const name =
    entity.nombre ||
    entity.titulo ||
    (tipo === 'sesion' ? `sesion_${entity.numero || 'x'}` : tipo);

  const filename = `${tipo}_${slugify(name)}.json`;

  const payload: SingleEntityExport = {
    tipo,
    version: '1.0',
    exportado_en: new Date().toISOString(),
    entidad: { ...entity },
    referencias: referencias || {},
  };

  downloadJsonFile(filename, payload);
}

/**
 * Exporta una campaña completa con todas sus entidades vinculadas
 */
export function exportCampanaCompleta(
  campana: Campana,
  sesiones: Sesion[],
  npcs: NPC[],
  lugares: Lugar[],
  misiones: Mision[],
  objetos: Objeto[],
  monstruos: Monstruo[],
  pjs: PJ[]
): void {
  const filename = `campana_${slugify(campana.nombre)}.json`;

  const payload: CampanaExport = {
    tipo: 'campana',
    version: '1.0',
    exportado_en: new Date().toISOString(),
    campana: { ...campana },
    sesiones: sesiones.map((s) => ({ ...s })),
    npcs: npcs.map((n) => ({ ...n })),
    lugares: lugares.map((l) => ({ ...l })),
    misiones: misiones.map((m) => ({ ...m })),
    objetos: objetos.map((o) => ({ ...o })),
    monstruos: monstruos.map((mo) => ({ ...mo })),
    pjs: pjs.map((p) => ({ ...p })),
  };

  downloadJsonFile(filename, payload);
}

/**
 * Genera un ID único para una entidad
 */
function generateNewId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Importa y remapea una campaña completa con todos sus IDs y referencias internas cruzadas
 */
export function remapCampanaData(data: CampanaExport): {
  campana: Campana;
  sesiones: Sesion[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  pjs: PJ[];
} {
  const newCampanaId = generateNewId('camp');

  // Mapas de ID antiguo -> ID nuevo
  const sesionIdMap = new Map<string, string>();
  const npcIdMap = new Map<string, string>();
  const lugarIdMap = new Map<string, string>();
  const misionIdMap = new Map<string, string>();
  const objetoIdMap = new Map<string, string>();
  const monstruoIdMap = new Map<string, string>();
  const pjIdMap = new Map<string, string>();

  // 1. Asignar nuevos IDs a todas las entidades
  const rawSesiones = data.sesiones || [];
  const rawNpcs = data.npcs || [];
  const rawLugares = data.lugares || [];
  const rawMisiones = data.misiones || [];
  const rawObjetos = data.objetos || [];
  const rawMonstruos = data.monstruos || [];
  const rawPjs = data.pjs || [];

  rawSesiones.forEach((s) => sesionIdMap.set(s.id, generateNewId('ses')));
  rawNpcs.forEach((n) => npcIdMap.set(n.id, generateNewId('npc')));
  rawLugares.forEach((l) => lugarIdMap.set(l.id, generateNewId('lugar')));
  rawMisiones.forEach((m) => misionIdMap.set(m.id, generateNewId('mis')));
  rawObjetos.forEach((o) => objetoIdMap.set(o.id, generateNewId('obj')));
  rawMonstruos.forEach((mo) => monstruoIdMap.set(mo.id, generateNewId('mon')));
  rawPjs.forEach((p) => pjIdMap.set(p.id, generateNewId('pj')));

  // 2. Remapear Campaña
  const newCampana: Campana = {
    ...data.campana,
    id: newCampanaId,
    pj_ids: (data.campana.pj_ids || []).map((id) => pjIdMap.get(id) || id),
    creada_en: new Date().toISOString(),
  };

  // 3. Remapear Sesiones
  const newSesiones: Sesion[] = rawSesiones.map((s) => ({
    ...s,
    id: sesionIdMap.get(s.id) || generateNewId('ses'),
    campana_id: newCampanaId,
    npc_ids: (s.npc_ids || []).map((id) => npcIdMap.get(id) || id),
    lugar_ids: (s.lugar_ids || []).map((id) => lugarIdMap.get(id) || id),
    mision_ids: (s.mision_ids || []).map((id) => misionIdMap.get(id) || id),
    objeto_ids: (s.objeto_ids || []).map((id) => objetoIdMap.get(id) || id),
    monstruo_ids: (s.monstruo_ids || []).map((id) => monstruoIdMap.get(id) || id),
    pj_ids_presentes: (s.pj_ids_presentes || []).map((id) => pjIdMap.get(id) || id),
  }));

  // 4. Remapear NPCs
  const newNpcs: NPC[] = rawNpcs.map((n) => ({
    ...n,
    id: npcIdMap.get(n.id) || generateNewId('npc'),
    campana_id: newCampanaId,
    sesion_ids: (n.sesion_ids || []).map((id) => sesionIdMap.get(id) || id),
  }));

  // 5. Remapear Lugares (incluyendo jerarquía padre_id e hijos)
  const newLugares: Lugar[] = rawLugares.map((l) => ({
    ...l,
    id: lugarIdMap.get(l.id) || generateNewId('lugar'),
    campana_id: newCampanaId,
    padre_id: l.padre_id ? lugarIdMap.get(l.padre_id) || null : null,
    hijos: (l.hijos || []).map((id) => lugarIdMap.get(id) || id),
    sesion_ids: (l.sesion_ids || []).map((id) => sesionIdMap.get(id) || id),
  }));

  // 6. Remapear Misiones
  const newMisiones: Mision[] = rawMisiones.map((m) => ({
    ...m,
    id: misionIdMap.get(m.id) || generateNewId('mis'),
    campana_id: newCampanaId,
    origen_npc_id: m.origen_npc_id ? npcIdMap.get(m.origen_npc_id) || null : null,
    origen_lugar_id: m.origen_lugar_id ? lugarIdMap.get(m.origen_lugar_id) || null : null,
    sesion_activacion_id: m.sesion_activacion_id
      ? sesionIdMap.get(m.sesion_activacion_id) || null
      : null,
    sesion_completado_id: m.sesion_completado_id
      ? sesionIdMap.get(m.sesion_completado_id) || null
      : null,
    sesion_ids: (m.sesion_ids || []).map((id) => sesionIdMap.get(id) || id),
  }));

  // 7. Remapear Objetos
  const newObjetos: Objeto[] = rawObjetos.map((o) => ({
    ...o,
    id: objetoIdMap.get(o.id) || generateNewId('obj'),
    campana_id: newCampanaId,
    sesion_obtencion_id: o.sesion_obtencion_id
      ? sesionIdMap.get(o.sesion_obtencion_id) || null
      : null,
    sesion_ids: (o.sesion_ids || []).map((id) => sesionIdMap.get(id) || id),
  }));

  // 8. Remapear Monstruos
  const newMonstruos: Monstruo[] = rawMonstruos.map((mo) => ({
    ...mo,
    id: monstruoIdMap.get(mo.id) || generateNewId('mon'),
    campana_id: newCampanaId,
    sesion_ids: (mo.sesion_ids || []).map((id) => sesionIdMap.get(id) || id),
  }));

  // 9. Remapear PJs
  const newPjs: PJ[] = rawPjs.map((p) => ({
    ...p,
    id: pjIdMap.get(p.id) || generateNewId('pj'),
    campana_id: newCampanaId,
  }));

  return {
    campana: newCampana,
    sesiones: newSesiones,
    npcs: newNpcs,
    lugares: newLugares,
    misiones: newMisiones,
    objetos: newObjetos,
    monstruos: newMonstruos,
    pjs: newPjs,
  };
}
