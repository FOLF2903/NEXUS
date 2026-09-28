import { getSupabase } from '../lib/supabase';
import {
  Campana,
  Sesion,
  NPC,
  Lugar,
  Mision,
  Objeto,
  Monstruo,
  PJ,
} from '../types';
import {
  CampaignMember,
  CampaignInvite,
  SupabaseRole,
  UserProfile,
} from '../types/supabase';
import { RealtimeChannel, User } from '@supabase/supabase-js';

// ==============================================================================
// 1. AUTENTICACIÓN Y PERFILES
// ==============================================================================

export async function supabaseSignUp(
  email: string,
  pass: string,
  displayName: string
): Promise<{ user: User | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: 'Supabase no está configurado.' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: { display_name: displayName.trim() || 'Aventurero' },
    },
  });

  if (error) return { user: null, error: error.message };

  if (data.user) {
    // Asegurar inserción de perfil
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          display_name: displayName.trim() || 'Aventurero',
        });
    } catch {
      // Ignorar si el trigger ya lo insertó
    }
  }

  return { user: data.user, error: null };
}

export async function supabaseSignIn(
  email: string,
  pass: string
): Promise<{ user: User | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { user: null, error: 'Supabase no está configurado.' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function supabaseSignOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// ==============================================================================
// 2. CAMPAÑAS Y MEMBRESÍAS
// ==============================================================================

export interface CloudCampaignWithRole {
  campana: Campana;
  role: SupabaseRole;
  isHost: boolean;
  memberCount: number;
}

export async function fetchUserCampaigns(userIdParam?: string): Promise<CloudCampaignWithRole[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let userId = userIdParam;
  if (!userId) {
    const { data: userResp } = await supabase.auth.getUser();
    userId = userResp.user?.id;
  }
  if (!userId) return [];

  // 1. Obtener todas las campañas a las que el usuario tiene acceso (Host o Invitado)
  let list: any[] = [];
  const { data: campaigns, error: cError } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (!cError && Array.isArray(campaigns) && campaigns.length > 0) {
    list = campaigns;
  } else {
    if (cError) {
      console.warn('Aviso al obtener campañas con RLS general:', cError);
    }
    // Fallback de máxima fiabilidad: consultar directamente donde el usuario es host
    try {
      const { data: hostCampaigns, error: hError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (!hError && Array.isArray(hostCampaigns)) {
        list = hostCampaigns;
      }
    } catch (hErr) {
      console.error('Error en fallback de campañas host:', hErr);
    }
  }

  // 2. Intentar obtener roles de miembros y campañas compartidas adicionales
  const roleMap = new Map<string, SupabaseRole>();
  try {
    const { data: memberships } = await supabase
      .from('campaign_members')
      .select('campaign_id, role')
      .eq('user_id', userId);

    if (memberships && Array.isArray(memberships)) {
      memberships.forEach((m: any) => {
        roleMap.set(m.campaign_id, m.role as SupabaseRole);
      });

      // Si hay campañas donde es invitado que no vinieron en la lista inicial, intentar recuperarlas
      const existingIds = new Set(list.map((c: any) => c.id));
      const missingIds = memberships
        .map((m: any) => m.campaign_id)
        .filter((cid: string) => !existingIds.has(cid));

      if (missingIds.length > 0) {
        try {
          const { data: guestCampaigns } = await supabase
            .from('campaigns')
            .select('*')
            .in('id', missingIds);

          if (guestCampaigns && Array.isArray(guestCampaigns)) {
            list = [...list, ...guestCampaigns];
          }
        } catch (gErr) {
          console.warn('Aviso: no se pudieron cargar campañas como invitado:', gErr);
        }
      }
    }
  } catch (mErr) {
    console.warn('Aviso: no se pudieron consultar roles secundarios:', mErr);
  }

  // 3. Mapear a formato Campana
  return list.map((c: any) => {
    const isHost = c.host_id === userId;
    const memberRole = roleMap.get(c.id);
    const role: SupabaseRole = isHost ? 'host' : (memberRole || 'player');

    const campana: Campana = {
      id: c.id,
      nombre: c.name,
      sistema: c.system || 'D&D 5e',
      descripcion: c.description || '',
      estado: (c.state as any) || 'activa',
      fecha_inicio: c.start_date || (c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      pj_ids: Array.isArray(c.pj_ids) ? c.pj_ids : [],
      notas_dm: c.notas_dm || '',
      creada_en: c.creada_en || c.created_at || new Date().toISOString(),
    };

    return {
      campana,
      role,
      isHost,
      memberCount: 1,
    };
  });
}

export async function createCloudCampaign(
  name: string,
  system: string,
  description: string,
  startDate?: string
): Promise<{ campana: Campana | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { campana: null, error: 'Supabase no conectado' };

  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id;
  if (!userId) return { campana: null, error: 'No has iniciado sesión' };

  const campaignId = generateUUID();
  const nowIso = new Date().toISOString();
  const dateStr = startDate || nowIso.split('T')[0];

  // 1. Insertar la campaña directamente con el UUID asignado
  const { error: insertError } = await supabase
    .from('campaigns')
    .insert({
      id: campaignId,
      name: name.trim(),
      system: system || 'D&D 5e',
      description: description?.trim() || '',
      state: 'activa',
      start_date: dateStr,
      host_id: userId,
    });

  if (insertError) {
    console.error('Error al insertar campaña en Supabase:', insertError);
    return { campana: null, error: insertError.message || 'Error al crear campaña en la nube' };
  }

  // 2. Garantizar que el creador esté registrado como 'host' en campaign_members
  try {
    await supabase
      .from('campaign_members')
      .upsert({
        campaign_id: campaignId,
        user_id: userId,
        role: 'host',
      });
  } catch (mErr) {
    console.warn('Aviso: membresía host creada por trigger o ya existente:', mErr);
  }

  const campana: Campana = {
    id: campaignId,
    nombre: name.trim(),
    sistema: system || 'D&D 5e',
    descripcion: description?.trim() || '',
    estado: 'activa',
    fecha_inicio: dateStr,
    pj_ids: [],
    notas_dm: '',
    creada_en: nowIso,
  };

  return { campana, error: null };
}

// ==============================================================================
// UTILIDADES UUID
// ==============================================================================

export function isUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function updateCloudCampaign(
  campana: Campana
): Promise<{ success: boolean; error: string | null }> {
  if (!isUUID(campana.id)) {
    return { success: false, error: 'Esta campaña no está registrada en la nube de Supabase.' };
  }
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase no conectado' };

  const { error } = await supabase
    .from('campaigns')
    .update({
      name: campana.nombre,
      system: campana.sistema,
      description: campana.descripcion,
      state: campana.estado,
      start_date: campana.fecha_inicio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campana.id);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function deleteCloudCampaign(
  campaignId: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isUUID(campaignId)) {
    return { success: false, error: 'Identificador de campaña inválido.' };
  }
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase no conectado' };

  const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

/**
 * Sube una campaña completa local (como camp_001 o generada en local) a Supabase
 * Genera un UUID real para la campaña y sus entidades relacionadas, manteniendo integridad
 */
export async function uploadLocalCampaignToCloud(
  localCampana: Campana,
  entities: {
    sesiones: Sesion[];
    npcs: NPC[];
    lugares: Lugar[];
    misiones: Mision[];
    objetos: Objeto[];
    monstruos: Monstruo[];
    pjs: PJ[];
  }
): Promise<{ campana: Campana | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { campana: null, error: 'Supabase no está configurado.' };

  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id;
  if (!userId) return { campana: null, error: 'Debes iniciar sesión para subir una campaña a la nube.' };

  // 1. Crear la campaña en Supabase (generará un UUID real)
  const { campana: newCloudCampana, error: createErr } = await createCloudCampaign(
    localCampana.nombre,
    localCampana.sistema,
    localCampana.descripcion,
    localCampana.fecha_inicio
  );

  if (createErr || !newCloudCampana) {
    return { campana: null, error: createErr || 'Error al crear la campaña en la nube.' };
  }

  const newCampaignId = newCloudCampana.id;

  // 2. Mapear IDs de entidades locales a nuevos UUIDs para mantener integridad relacional
  const idMap = new Map<string, string>();
  const getMappedId = (oldId: string): string => {
    if (isUUID(oldId)) return oldId;
    if (!idMap.has(oldId)) {
      idMap.set(oldId, generateUUID());
    }
    return idMap.get(oldId)!;
  };

  // Pre-mapear
  entities.sesiones.forEach((s) => getMappedId(s.id));
  entities.npcs.forEach((n) => getMappedId(n.id));
  entities.lugares.forEach((l) => getMappedId(l.id));
  entities.misiones.forEach((m) => getMappedId(m.id));
  entities.objetos.forEach((o) => getMappedId(o.id));
  entities.monstruos.forEach((m) => getMappedId(m.id));
  entities.pjs.forEach((p) => getMappedId(p.id));

  // 3. Subir entidades
  try {
    for (const ses of entities.sesiones) {
      await syncCloudSession({
        ...ses,
        id: getMappedId(ses.id),
        campana_id: newCampaignId,
        pj_ids_presentes: (ses.pj_ids_presentes || []).map((id) => idMap.get(id) || id),
        npc_ids: (ses.npc_ids || []).map((id) => idMap.get(id) || id),
        lugar_ids: (ses.lugar_ids || []).map((id) => idMap.get(id) || id),
        mision_ids: (ses.mision_ids || []).map((id) => idMap.get(id) || id),
        objeto_ids: (ses.objeto_ids || []).map((id) => idMap.get(id) || id),
        monstruo_ids: (ses.monstruo_ids || []).map((id) => idMap.get(id) || id),
      }, newCampaignId);
    }

    for (const npc of entities.npcs) {
      await syncCloudNpc({
        ...npc,
        id: getMappedId(npc.id),
        campana_id: newCampaignId,
        sesion_ids: (npc.sesion_ids || []).map((id) => idMap.get(id) || id),
      }, newCampaignId);
    }

    for (const lug of entities.lugares) {
      await syncCloudLugar({
        ...lug,
        id: getMappedId(lug.id),
        campana_id: newCampaignId,
        padre_id: lug.padre_id ? idMap.get(lug.padre_id) || lug.padre_id : null,
        hijos: (lug.hijos || []).map((id) => idMap.get(id) || id),
        sesion_ids: (lug.sesion_ids || []).map((id) => idMap.get(id) || id),
      }, newCampaignId);
    }

    for (const mis of entities.misiones) {
      await syncCloudMision({
        ...mis,
        id: getMappedId(mis.id),
        campana_id: newCampaignId,
        origen_npc_id: mis.origen_npc_id ? idMap.get(mis.origen_npc_id) || mis.origen_npc_id : null,
        origen_lugar_id: mis.origen_lugar_id ? idMap.get(mis.origen_lugar_id) || mis.origen_lugar_id : null,
        sesion_activacion_id: mis.sesion_activacion_id ? idMap.get(mis.sesion_activacion_id) || mis.sesion_activacion_id : null,
        sesion_completado_id: mis.sesion_completado_id ? idMap.get(mis.sesion_completado_id) || mis.sesion_completado_id : null,
        sesion_ids: (mis.sesion_ids || []).map((id) => idMap.get(id) || id),
      }, newCampaignId);
    }

    for (const obj of entities.objetos) {
      await syncCloudObjeto({
        ...obj,
        id: getMappedId(obj.id),
        campana_id: newCampaignId,
        quien_lo_lleva: obj.quien_lo_lleva ? idMap.get(obj.quien_lo_lleva) || obj.quien_lo_lleva : null,
        sesion_obtencion_id: obj.sesion_obtencion_id ? idMap.get(obj.sesion_obtencion_id) || obj.sesion_obtencion_id : null,
        sesion_ids: (obj.sesion_ids || []).map((id) => idMap.get(id) || id),
      }, newCampaignId);
    }

    for (const mon of entities.monstruos) {
      await syncCloudMonstruo({
        ...mon,
        id: getMappedId(mon.id),
        campana_id: newCampaignId,
        sesion_ids: (mon.sesion_ids || []).map((id) => idMap.get(id) || id),
      }, newCampaignId);
    }

    for (const pj of entities.pjs) {
      await syncCloudPj({
        ...pj,
        id: getMappedId(pj.id),
        campana_id: newCampaignId,
      }, newCampaignId);
    }
  } catch (err: any) {
    console.error('Error al sincronizar entidades al subir a la nube:', err);
  }

  return { campana: newCloudCampana, error: null };
}

export async function fetchCampaignMembers(campaignId: string): Promise<CampaignMember[]> {
  if (!isUUID(campaignId)) return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('campaign_members')
    .select(`
      id,
      campaign_id,
      user_id,
      role,
      joined_at,
      profiles:user_id (id, display_name, avatar_url)
    `)
    .eq('campaign_id', campaignId);

  if (error || !data) return [];

  return data.map((m: any) => ({
    id: m.id,
    campaign_id: m.campaign_id,
    user_id: m.user_id,
    role: m.role as SupabaseRole,
    joined_at: m.joined_at,
    profile: m.profiles || null,
  }));
}

export async function updateMemberRole(
  campaignId: string,
  userId: string,
  newRole: 'dm' | 'player'
): Promise<{ success: boolean; error: string | null }> {
  if (!isUUID(campaignId)) return { success: false, error: 'Identificador no válido en la nube' };
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase no conectado' };

  const { error } = await supabase
    .from('campaign_members')
    .update({ role: newRole })
    .eq('campaign_id', campaignId)
    .eq('user_id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function removeMember(
  campaignId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isUUID(campaignId)) return { success: false, error: 'Identificador no válido en la nube' };
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase no conectado' };

  const { error } = await supabase
    .from('campaign_members')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('user_id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

// ==============================================================================
// 3. INVITACIONES
// ==============================================================================

export async function createCampaignInvite(
  campaignId: string,
  role: 'dm' | 'player' = 'player'
): Promise<{ invite: CampaignInvite | null; error: string | null }> {
  if (!isUUID(campaignId)) {
    return {
      invite: null,
      error: 'Esta campaña está guardada de forma local (en este navegador). Para invitar a otros jugadores y compartir la mesa en tiempo real, sube la campaña a la Nube de Supabase.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) return { invite: null, error: 'Supabase no conectado' };

  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id;

  const { data, error } = await supabase
    .from('invites')
    .insert({
      campaign_id: campaignId,
      created_by: userId,
      role,
    })
    .select()
    .single();

  if (error || !data) {
    return { invite: null, error: error?.message || 'Error al generar invitación' };
  }

  return { invite: data as CampaignInvite, error: null };
}

export async function fetchCampaignInvites(campaignId: string): Promise<CampaignInvite[]> {
  if (!isUUID(campaignId)) return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('campaign_id', campaignId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as CampaignInvite[];
}

export async function acceptCampaignInvite(
  token: string
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase no conectado' };

  // Intentar mediante función RPC segura
  const { data: rpcData, error: rpcError } = await supabase.rpc('accept_campaign_invite', {
    invite_token: token.trim(),
  });

  if (!rpcError && rpcData) {
    if (rpcData.success) {
      return { success: true, campaignId: rpcData.campaign_id };
    }
    return { success: false, error: rpcData.error || 'Error al canjear invitación' };
  }

  // Fallback directo si no se ha cargado la RPC en la BD
  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id;
  if (!userId) return { success: false, error: 'Debes iniciar sesión primero' };

  const { data: inv, error: invErr } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token.trim())
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (invErr || !inv) {
    return { success: false, error: 'Invitación inválida o expirada' };
  }

  // Añadir a members
  const { error: memErr } = await supabase
    .from('campaign_members')
    .upsert({
      campaign_id: inv.campaign_id,
      user_id: userId,
      role: inv.role || 'player',
    });

  if (memErr) return { success: false, error: memErr.message };

  // Marcar invitación usada
  await supabase
    .from('invites')
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq('id', inv.id);

  return { success: true, campaignId: inv.campaign_id };
}

// ==============================================================================
// 4. CRUD DE ENTIDADES VINCULADAS
// ==============================================================================

export async function fetchCampaignEntities(campaignId: string): Promise<{
  sesiones: Sesion[];
  npcs: NPC[];
  lugares: Lugar[];
  misiones: Mision[];
  objetos: Objeto[];
  monstruos: Monstruo[];
  pjs: PJ[];
}> {
  if (!isUUID(campaignId)) {
    return {
      sesiones: [],
      npcs: [],
      lugares: [],
      misiones: [],
      objetos: [],
      monstruos: [],
      pjs: [],
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      sesiones: [],
      npcs: [],
      lugares: [],
      misiones: [],
      objetos: [],
      monstruos: [],
      pjs: [],
    };
  }

  const [
    { data: sesData },
    { data: npcData },
    { data: lugData },
    { data: misData },
    { data: objData },
    { data: monData },
    { data: pjData },
  ] = await Promise.all([
    supabase.from('sessions').select('*').eq('campaign_id', campaignId).order('numero', { ascending: true }),
    supabase.from('npcs').select('*').eq('campaign_id', campaignId),
    supabase.from('lugares').select('*').eq('campaign_id', campaignId),
    supabase.from('misiones').select('*').eq('campaign_id', campaignId),
    supabase.from('objetos').select('*').eq('campaign_id', campaignId),
    supabase.from('monstruos').select('*').eq('campaign_id', campaignId),
    supabase.from('pjs').select('*').eq('campaign_id', campaignId),
  ]);

  return {
    sesiones: (sesData || []).map((s: any) => ({
      id: s.id,
      campana_id: s.campaign_id,
      numero: s.numero,
      titulo: s.titulo,
      fecha_real: s.fecha_real,
      dia_juego_inicio: s.dia_juego_inicio ?? 1,
      dia_juego_fin: s.dia_juego_fin ?? null,
      duracion_horas: s.duracion_horas ?? null,
      pj_ids_presentes: s.pj_ids_presentes || [],
      notas: s.notas || '',
      notas_dm: s.notas_dm || '',
      etiquetas: s.etiquetas || [],
      npc_ids: s.npc_ids || [],
      lugar_ids: s.lugar_ids || [],
      mision_ids: s.mision_ids || [],
      objeto_ids: s.objeto_ids || [],
      monstruo_ids: s.monstruo_ids || [],
      creada_en: s.creada_en || s.created_at || new Date().toISOString(),
    })),
    npcs: (npcData || []).map((n: any) => ({
      id: n.id,
      campana_id: n.campaign_id,
      nombre: n.nombre,
      nombre_conocido: n.nombre_conocido ?? true,
      rol: n.rol || '',
      actitud: n.actitud || 'neutral',
      descripcion: n.descripcion || '',
      ubicacion_habitual: n.ubicacion_habitual || '',
      informacion_conocida: n.informacion_conocida || '',
      informacion_sospechada: n.informacion_sospechada || '',
      notas: n.notas || '',
      notas_dm: n.notas_dm || '',
      etiquetas: n.etiquetas || [],
      sesion_ids: n.sesion_ids || [],
      creado_en: n.creado_en || n.created_at || new Date().toISOString(),
    })),
    lugares: (lugData || []).map((l: any) => ({
      id: l.id,
      campana_id: l.campaign_id,
      nombre: l.nombre,
      nombre_conocido: l.nombre_conocido ?? true,
      tipo: l.tipo || 'otro',
      estado: l.estado || 'conocido',
      padre_id: l.padre_id || null,
      hijos: Array.isArray(l.hijos) ? l.hijos : [],
      descripcion: l.descripcion || '',
      como_llegar: l.como_llegar || '',
      que_hay: l.que_hay || '',
      que_paso: l.que_paso || '',
      notas: l.notas || '',
      notas_dm: l.notas_dm || '',
      etiquetas: l.etiquetas || [],
      sesion_ids: l.sesion_ids || [],
      creado_en: l.creado_en || l.created_at || new Date().toISOString(),
    })),
    misiones: (misData || []).map((m: any) => ({
      id: m.id,
      campana_id: m.campaign_id,
      titulo: m.titulo,
      descripcion: m.descripcion || '',
      estado: m.estado || 'activa',
      origen_npc_id: m.origen_npc_id || null,
      origen_lugar_id: m.origen_lugar_id || null,
      recompensa_conocida: m.recompensa_conocida || m.recompensa || '',
      recompensa_obtenida: m.recompensa_obtenida || '',
      pasos: Array.isArray(m.pasos) ? m.pasos : [],
      sesion_activacion_id: m.sesion_activacion_id || null,
      sesion_completado_id: m.sesion_completado_id || null,
      sesion_ids: m.sesion_ids || [],
      notas: m.notas || '',
      notas_dm: m.notas_dm || '',
      etiquetas: m.etiquetas || [],
      creado_en: m.creado_en || m.creada_en || m.created_at || new Date().toISOString(),
    })),
    objetos: (objData || []).map((o: any) => ({
      id: o.id,
      campana_id: o.campaign_id,
      nombre: o.nombre,
      nombre_conocido: o.nombre_conocido ?? true,
      tipo: o.tipo || 'comun',
      donde_lo_conseguimos: o.donde_lo_conseguimos || '',
      efecto_conocido: o.efecto_conocido || '',
      efecto_sospechado: o.efecto_sospechado || '',
      quien_lo_lleva: o.quien_lo_lleva || o.portador_pj_id || null,
      descripcion: o.descripcion || '',
      notas: o.notas || '',
      notas_dm: o.notas_dm || '',
      etiquetas: o.etiquetas || [],
      sesion_obtencion_id: o.sesion_obtencion_id || null,
      sesion_ids: o.sesion_ids || [],
      creado_en: o.creado_en || o.created_at || new Date().toISOString(),
    })),
    monstruos: (monData || []).map((m: any) => ({
      id: m.id,
      campana_id: m.campaign_id,
      nombre: m.nombre,
      nombre_conocido: m.nombre_conocido ?? true,
      tipo: m.tipo || 'humanoide',
      descripcion_visual: m.descripcion_visual || m.descripcion || '',
      comportamiento: m.comportamiento || '',
      debilidades: m.debilidades || '',
      resistencias: m.resistencias || '',
      donde_lo_vimos: m.donde_lo_vimos || m.ubicacion_habitual || '',
      veces_encontrado: m.veces_encontrado || 1,
      notas: m.notas || '',
      notas_dm: m.notas_dm || '',
      etiquetas: m.etiquetas || [],
      sesion_ids: m.sesion_ids || [],
      creado_en: m.creado_en || m.created_at || new Date().toISOString(),
    })),
    pjs: (pjData || []).map((p: any) => ({
      id: p.id,
      campana_id: p.campaign_id,
      user_id: p.user_id || undefined,
      nombre: p.nombre,
      clase: p.clase,
      raza: p.raza,
      nivel: p.nivel,
      pg_max: p.pg_max ?? p.vida_maxima ?? 10,
      ca: p.ca ?? p.clase_armadura ?? 10,
      descripcion: p.descripcion || p.apariencia || '',
      personalidad: p.personalidad || '',
      trasfondo: p.trasfondo || '',
      notas: p.notas || '',
      notas_dm: p.notas_dm || '',
      estado: p.estado || 'activo',
      etiquetas: p.etiquetas || [],
      creado_en: p.creado_en || p.created_at || new Date().toISOString(),
    })),
  };
}

// Operaciones individuales de sincronización
export async function syncCloudSession(sesion: Sesion, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('sessions').upsert({
    id: sesion.id,
    campaign_id: campaignId,
    numero: sesion.numero,
    titulo: sesion.titulo,
    fecha_real: sesion.fecha_real,
    dia_juego_inicio: sesion.dia_juego_inicio ?? 1,
    dia_juego_fin: sesion.dia_juego_fin || null,
    duracion_horas: sesion.duracion_horas || null,
    pj_ids_presentes: sesion.pj_ids_presentes || [],
    notas: sesion.notas || '',
    notas_dm: sesion.notas_dm || '',
    etiquetas: sesion.etiquetas || [],
    npc_ids: sesion.npc_ids || [],
    lugar_ids: sesion.lugar_ids || [],
    mision_ids: sesion.mision_ids || [],
    objeto_ids: sesion.objeto_ids || [],
    monstruo_ids: sesion.monstruo_ids || [],
    creada_en: sesion.creada_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudSession(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('sessions').delete().eq('id', id);
}

export async function syncCloudNpc(npc: NPC, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('npcs').upsert({
    id: npc.id,
    campaign_id: campaignId,
    nombre: npc.nombre,
    nombre_conocido: npc.nombre_conocido ?? true,
    rol: npc.rol || null,
    actitud: npc.actitud || 'neutral',
    descripcion: npc.descripcion || '',
    ubicacion_habitual: npc.ubicacion_habitual || '',
    informacion_conocida: npc.informacion_conocida || '',
    informacion_sospechada: npc.informacion_sospechada || '',
    notas: npc.notas || '',
    notas_dm: npc.notas_dm || '',
    etiquetas: npc.etiquetas || [],
    sesion_ids: npc.sesion_ids || [],
    creado_en: npc.creado_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudNpc(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('npcs').delete().eq('id', id);
}

export async function syncCloudLugar(lugar: Lugar, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('lugares').upsert({
    id: lugar.id,
    campaign_id: campaignId,
    nombre: lugar.nombre,
    nombre_conocido: lugar.nombre_conocido ?? true,
    tipo: lugar.tipo || 'otro',
    estado: lugar.estado || 'conocido',
    padre_id: lugar.padre_id || null,
    descripcion: lugar.descripcion || '',
    como_llegar: lugar.como_llegar || '',
    que_hay: lugar.que_hay || '',
    que_paso: lugar.que_paso || '',
    notas: lugar.notas || '',
    notas_dm: lugar.notas_dm || '',
    etiquetas: lugar.etiquetas || [],
    sesion_ids: lugar.sesion_ids || [],
    creado_en: lugar.creado_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudLugar(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('lugares').delete().eq('id', id);
}

export async function syncCloudMision(mision: Mision, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('misiones').upsert({
    id: mision.id,
    campaign_id: campaignId,
    titulo: mision.titulo,
    descripcion: mision.descripcion || '',
    estado: mision.estado || 'activa',
    origen_npc_id: mision.origen_npc_id || null,
    origen_lugar_id: mision.origen_lugar_id || null,
    recompensa_conocida: mision.recompensa_conocida || '',
    recompensa_obtenida: mision.recompensa_obtenida || '',
    pasos: mision.pasos || [],
    sesion_activacion_id: mision.sesion_activacion_id || null,
    sesion_completado_id: mision.sesion_completado_id || null,
    sesion_ids: mision.sesion_ids || [],
    notas: mision.notas || '',
    notas_dm: mision.notas_dm || '',
    etiquetas: mision.etiquetas || [],
    creada_en: mision.creado_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudMision(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('misiones').delete().eq('id', id);
}

export async function syncCloudObjeto(objeto: Objeto, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('objetos').upsert({
    id: objeto.id,
    campaign_id: campaignId,
    nombre: objeto.nombre,
    nombre_conocido: objeto.nombre_conocido ?? true,
    tipo: objeto.tipo || 'comun',
    donde_lo_conseguimos: objeto.donde_lo_conseguimos || '',
    efecto_conocido: objeto.efecto_conocido || '',
    efecto_sospechado: objeto.efecto_sospechado || '',
    quien_lo_lleva: objeto.quien_lo_lleva || null,
    descripcion: objeto.descripcion || '',
    notas: objeto.notas || '',
    notas_dm: objeto.notas_dm || '',
    etiquetas: objeto.etiquetas || [],
    sesion_obtencion_id: objeto.sesion_obtencion_id || null,
    sesion_ids: objeto.sesion_ids || [],
    creado_en: objeto.creado_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudObjeto(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('objetos').delete().eq('id', id);
}

export async function syncCloudMonstruo(monstruo: Monstruo, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('monstruos').upsert({
    id: monstruo.id,
    campaign_id: campaignId,
    nombre: monstruo.nombre,
    nombre_conocido: monstruo.nombre_conocido ?? true,
    tipo: monstruo.tipo || 'humanoide',
    descripcion_visual: monstruo.descripcion_visual || '',
    comportamiento: monstruo.comportamiento || '',
    debilidades: monstruo.debilidades || '',
    resistencias: monstruo.resistencias || '',
    donde_lo_vimos: monstruo.donde_lo_vimos || '',
    veces_encontrado: monstruo.veces_encontrado || 1,
    notas: monstruo.notas || '',
    notas_dm: monstruo.notas_dm || '',
    etiquetas: monstruo.etiquetas || [],
    sesion_ids: monstruo.sesion_ids || [],
    creado_en: monstruo.creado_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudMonstruo(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('monstruos').delete().eq('id', id);
}

export async function syncCloudPj(pj: PJ, campaignId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: userResp } = await supabase.auth.getUser();
  const currentUserId = userResp.user?.id;

  await supabase.from('pjs').upsert({
    id: pj.id,
    campaign_id: campaignId,
    user_id: pj.user_id || currentUserId,
    nombre: pj.nombre,
    clase: pj.clase,
    raza: pj.raza,
    nivel: pj.nivel,
    pg_max: pj.pg_max ?? 10,
    ca: pj.ca ?? 10,
    descripcion: pj.descripcion || '',
    personalidad: pj.personalidad || '',
    trasfondo: pj.trasfondo || '',
    notas: pj.notas || '',
    notas_dm: pj.notas_dm || '',
    estado: pj.estado || 'activo',
    etiquetas: pj.etiquetas || [],
    creado_en: pj.creado_en,
    actualizado_en: new Date().toISOString(),
  });
}

export async function deleteCloudPj(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from('pjs').delete().eq('id', id);
}

// ==============================================================================
// 5. SINCRONIZACIÓN EN TIEMPO REAL (REALTIME)
// ==============================================================================

export function subscribeToCampaignRealtime(
  campaignId: string,
  onRemoteChange: () => void
): RealtimeChannel | null {
  if (!isUUID(campaignId)) return null;
  const supabase = getSupabase();
  if (!supabase || !campaignId) return null;

  const channelName = `campaign_${campaignId}_sync`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', filter: `campaign_id=eq.${campaignId}` },
      () => {
        onRemoteChange();
      }
    )
    .subscribe();

  return channel;
}
