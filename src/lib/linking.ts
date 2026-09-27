import { Sesion, NPC, Lugar, Mision, Objeto, Monstruo } from '../types';

export type EntityType = 'npc' | 'lugar' | 'mision' | 'objeto' | 'monstruo';

/**
 * Normaliza un array de strings evitando duplicados y valores nulos
 */
export function uniqueIds(ids: (string | null | undefined)[]): string[] {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id && typeof id === 'string'))));
}

/**
 * Sincroniza bidireccionalmente los enlaces cuando una sesión es creada o editada.
 * Si una entidad fue agregada a la sesión, se le añade la sesión a su sesion_ids.
 * Si una entidad fue desvinculada de la sesión, se le retira la sesión de su sesion_ids.
 */
export function syncSessionEntities(
  currentSession: Sesion,
  previousSession: Sesion | null,
  allNpcs: NPC[],
  allLugares: Lugar[],
  allMisiones: Mision[],
  allObjetos: Objeto[],
  allMonstruos: Monstruo[]
): {
  updatedNpcs: NPC[];
  updatedLugares: Lugar[];
  updatedMisiones: Mision[];
  updatedObjetos: Objeto[];
  updatedMonstruos: Monstruo[];
} {
  const sessionId = currentSession.id;
  const currentNpcIds = new Set(currentSession.npc_ids || []);
  const currentLugarIds = new Set(currentSession.lugar_ids || []);
  const currentMisionIds = new Set(currentSession.mision_ids || []);
  const currentObjetoIds = new Set(currentSession.objeto_ids || []);
  const currentMonstruoIds = new Set(currentSession.monstruo_ids || []);

  const prevNpcIds = new Set(previousSession?.npc_ids || []);
  const prevLugarIds = new Set(previousSession?.lugar_ids || []);
  const prevMisionIds = new Set(previousSession?.mision_ids || []);
  const prevObjetoIds = new Set(previousSession?.objeto_ids || []);
  const prevMonstruoIds = new Set(previousSession?.monstruo_ids || []);

  // 1. NPCs
  const updatedNpcs = allNpcs.map((npc) => {
    const isCurrentlyLinked = currentNpcIds.has(npc.id);
    const wasLinked = prevNpcIds.has(npc.id);
    const existingSessionIds = Array.isArray(npc.sesion_ids) ? npc.sesion_ids : [];

    if (isCurrentlyLinked && !existingSessionIds.includes(sessionId)) {
      return { ...npc, sesion_ids: [...existingSessionIds, sessionId] };
    }
    if (!isCurrentlyLinked && wasLinked && existingSessionIds.includes(sessionId)) {
      return { ...npc, sesion_ids: existingSessionIds.filter((sId) => sId !== sessionId) };
    }
    return npc;
  });

  // 2. Lugares
  const updatedLugares = allLugares.map((lugar) => {
    const isCurrentlyLinked = currentLugarIds.has(lugar.id);
    const wasLinked = prevLugarIds.has(lugar.id);
    const existingSessionIds = Array.isArray(lugar.sesion_ids) ? lugar.sesion_ids : [];

    if (isCurrentlyLinked && !existingSessionIds.includes(sessionId)) {
      return { ...lugar, sesion_ids: [...existingSessionIds, sessionId] };
    }
    if (!isCurrentlyLinked && wasLinked && existingSessionIds.includes(sessionId)) {
      return { ...lugar, sesion_ids: existingSessionIds.filter((sId) => sId !== sessionId) };
    }
    return lugar;
  });

  // 3. Misiones
  const updatedMisiones = allMisiones.map((mision) => {
    const isCurrentlyLinked = currentMisionIds.has(mision.id);
    const wasLinked = prevMisionIds.has(mision.id);
    const existingSessionIds = Array.isArray(mision.sesion_ids) ? mision.sesion_ids : [];

    if (isCurrentlyLinked && !existingSessionIds.includes(sessionId)) {
      return { ...mision, sesion_ids: [...existingSessionIds, sessionId] };
    }
    if (!isCurrentlyLinked && wasLinked && existingSessionIds.includes(sessionId)) {
      return {
        ...mision,
        sesion_ids: existingSessionIds.filter((sId) => sId !== sessionId),
        sesion_activacion_id: mision.sesion_activacion_id === sessionId ? null : mision.sesion_activacion_id,
        sesion_completado_id: mision.sesion_completado_id === sessionId ? null : mision.sesion_completado_id,
      };
    }
    return mision;
  });

  // 4. Objetos
  const updatedObjetos = allObjetos.map((objeto) => {
    const isCurrentlyLinked = currentObjetoIds.has(objeto.id);
    const wasLinked = prevObjetoIds.has(objeto.id);
    const existingSessionIds = Array.isArray(objeto.sesion_ids) ? objeto.sesion_ids : [];

    if (isCurrentlyLinked && !existingSessionIds.includes(sessionId)) {
      return { ...objeto, sesion_ids: [...existingSessionIds, sessionId] };
    }
    if (!isCurrentlyLinked && wasLinked && existingSessionIds.includes(sessionId)) {
      return {
        ...objeto,
        sesion_ids: existingSessionIds.filter((sId) => sId !== sessionId),
        sesion_obtencion_id: objeto.sesion_obtencion_id === sessionId ? null : objeto.sesion_obtencion_id,
      };
    }
    return objeto;
  });

  // 5. Monstruos
  const updatedMonstruos = allMonstruos.map((monstruo) => {
    const isCurrentlyLinked = currentMonstruoIds.has(monstruo.id);
    const wasLinked = prevMonstruoIds.has(monstruo.id);
    const existingSessionIds = Array.isArray(monstruo.sesion_ids) ? monstruo.sesion_ids : [];

    if (isCurrentlyLinked && !existingSessionIds.includes(sessionId)) {
      return { ...monstruo, sesion_ids: [...existingSessionIds, sessionId] };
    }
    if (!isCurrentlyLinked && wasLinked && existingSessionIds.includes(sessionId)) {
      return { ...monstruo, sesion_ids: existingSessionIds.filter((sId) => sId !== sessionId) };
    }
    return monstruo;
  });

  return {
    updatedNpcs,
    updatedLugares,
    updatedMisiones,
    updatedObjetos,
    updatedMonstruos,
  };
}

/**
 * Añade o elimina una vinculación entre una sesión y una entidad de forma bidireccional.
 */
export function toggleEntityLink(
  type: EntityType,
  entityId: string,
  sessionId: string,
  link: boolean,
  context: {
    sesiones: Sesion[];
    npcs: NPC[];
    lugares: Lugar[];
    misiones: Mision[];
    objetos: Objeto[];
    monstruos: Monstruo[];
  }
): {
  sesiones: Sesion[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
} {
  // 1. Actualizar la sesión
  const updatedSesiones = context.sesiones.map((sesion) => {
    if (sesion.id !== sessionId) return sesion;

    switch (type) {
      case 'npc': {
        const ids = new Set(sesion.npc_ids || []);
        if (link) ids.add(entityId);
        else ids.delete(entityId);
        return { ...sesion, npc_ids: Array.from(ids) };
      }
      case 'lugar': {
        const ids = new Set(sesion.lugar_ids || []);
        if (link) ids.add(entityId);
        else ids.delete(entityId);
        return { ...sesion, lugar_ids: Array.from(ids) };
      }
      case 'mision': {
        const ids = new Set(sesion.mision_ids || []);
        if (link) ids.add(entityId);
        else ids.delete(entityId);
        return { ...sesion, mision_ids: Array.from(ids) };
      }
      case 'objeto': {
        const ids = new Set(sesion.objeto_ids || []);
        if (link) ids.add(entityId);
        else ids.delete(entityId);
        return { ...sesion, objeto_ids: Array.from(ids) };
      }
      case 'monstruo': {
        const ids = new Set(sesion.monstruo_ids || []);
        if (link) ids.add(entityId);
        else ids.delete(entityId);
        return { ...sesion, monstruo_ids: Array.from(ids) };
      }
      default:
        return sesion;
    }
  });

  // 2. Actualizar la entidad
  let updatedNpcs = context.npcs;
  let updatedLugares = context.lugares;
  let updatedMisiones = context.misiones;
  let updatedObjetos = context.objetos;
  let updatedMonstruos = context.monstruos;

  if (type === 'npc') {
    updatedNpcs = context.npcs.map((npc) => {
      if (npc.id !== entityId) return npc;
      const sIds = new Set(npc.sesion_ids || []);
      if (link) sIds.add(sessionId);
      else sIds.delete(sessionId);
      return { ...npc, sesion_ids: Array.from(sIds) };
    });
  } else if (type === 'lugar') {
    updatedLugares = context.lugares.map((lugar) => {
      if (lugar.id !== entityId) return lugar;
      const sIds = new Set(lugar.sesion_ids || []);
      if (link) sIds.add(sessionId);
      else sIds.delete(sessionId);
      return { ...lugar, sesion_ids: Array.from(sIds) };
    });
  } else if (type === 'mision') {
    updatedMisiones = context.misiones.map((mision) => {
      if (mision.id !== entityId) return mision;
      const sIds = new Set(mision.sesion_ids || []);
      if (link) sIds.add(sessionId);
      else sIds.delete(sessionId);
      return {
        ...mision,
        sesion_ids: Array.from(sIds),
        sesion_activacion_id: !link && mision.sesion_activacion_id === sessionId ? null : mision.sesion_activacion_id,
        sesion_completado_id: !link && mision.sesion_completado_id === sessionId ? null : mision.sesion_completado_id,
      };
    });
  } else if (type === 'objeto') {
    updatedObjetos = context.objetos.map((objeto) => {
      if (objeto.id !== entityId) return objeto;
      const sIds = new Set(objeto.sesion_ids || []);
      if (link) sIds.add(sessionId);
      else sIds.delete(sessionId);
      return {
        ...objeto,
        sesion_ids: Array.from(sIds),
        sesion_obtencion_id: !link && objeto.sesion_obtencion_id === sessionId ? null : objeto.sesion_obtencion_id,
      };
    });
  } else if (type === 'monstruo') {
    updatedMonstruos = context.monstruos.map((monstruo) => {
      if (monstruo.id !== entityId) return monstruo;
      const sIds = new Set(monstruo.sesion_ids || []);
      if (link) sIds.add(sessionId);
      else sIds.delete(sessionId);
      return { ...monstruo, sesion_ids: Array.from(sIds) };
    });
  }

  return {
    sesiones: updatedSesiones,
    npcs: updatedNpcs,
    lugares: updatedLugares,
    misiones: updatedMisiones,
    objetos: updatedObjetos,
    monstruos: updatedMonstruos,
  };
}

/**
 * Limpia todas las referencias cuando se elimina una sesión.
 */
export function cleanupDeletedSession(
  deletedSessionId: string,
  context: {
    npcs: NPC[];
    lugares: Lugar[];
    misiones: Mision[];
    objetos: Objeto[];
    monstruos: Monstruo[];
  }
) {
  const updatedNpcs = context.npcs.map((n) => ({
    ...n,
    sesion_ids: (n.sesion_ids || []).filter((sId) => sId !== deletedSessionId),
  }));

  const updatedLugares = context.lugares.map((l) => ({
    ...l,
    sesion_ids: (l.sesion_ids || []).filter((sId) => sId !== deletedSessionId),
  }));

  const updatedMisiones = context.misiones.map((m) => ({
    ...m,
    sesion_ids: (m.sesion_ids || []).filter((sId) => sId !== deletedSessionId),
    sesion_activacion_id: m.sesion_activacion_id === deletedSessionId ? null : m.sesion_activacion_id,
    sesion_completado_id: m.sesion_completado_id === deletedSessionId ? null : m.sesion_completado_id,
  }));

  const updatedObjetos = context.objetos.map((o) => ({
    ...o,
    sesion_ids: (o.sesion_ids || []).filter((sId) => sId !== deletedSessionId),
    sesion_obtencion_id: o.sesion_obtencion_id === deletedSessionId ? null : o.sesion_obtencion_id,
  }));

  const updatedMonstruos = context.monstruos.map((m) => ({
    ...m,
    sesion_ids: (m.sesion_ids || []).filter((sId) => sId !== deletedSessionId),
  }));

  return {
    updatedNpcs,
    updatedLugares,
    updatedMisiones,
    updatedObjetos,
    updatedMonstruos,
  };
}

/**
 * Limpia todas las referencias en sesiones cuando una entidad es eliminada.
 */
export function cleanupDeletedEntityFromSessions(
  type: EntityType,
  entityId: string,
  sesiones: Sesion[]
): Sesion[] {
  return sesiones.map((sesion) => {
    switch (type) {
      case 'npc':
        return {
          ...sesion,
          npc_ids: (sesion.npc_ids || []).filter((id) => id !== entityId),
        };
      case 'lugar':
        return {
          ...sesion,
          lugar_ids: (sesion.lugar_ids || []).filter((id) => id !== entityId),
        };
      case 'mision':
        return {
          ...sesion,
          mision_ids: (sesion.mision_ids || []).filter((id) => id !== entityId),
        };
      case 'objeto':
        return {
          ...sesion,
          objeto_ids: (sesion.objeto_ids || []).filter((id) => id !== entityId),
        };
      case 'monstruo':
        return {
          ...sesion,
          monstruo_ids: (sesion.monstruo_ids || []).filter((id) => id !== entityId),
        };
      default:
        return sesion;
    }
  });
}
