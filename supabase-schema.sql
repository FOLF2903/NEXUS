-- ==============================================================================
-- BITÁCORA DE CAMPAÑA - FASE 16: ESQUEMA DE BASE DE DATOS Y RLS EN SUPABASE
-- ==============================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.
-- Incluye: Tablas, Relaciones, Triggers, Políticas RLS y Habilitación de Realtime.
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLA DE PERFILES DE USUARIO
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Aventurero',
  avatar_url text,
  created_at timestamptz default now()
);

-- Trigger automático para crear perfil al registrarse un nuevo usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Aventurero')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 3. TABLA DE CAMPAÑAS
-- ==============================================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system text not null default 'D&D 5e',
  description text default '',
  state text not null default 'activa', -- 'activa' | 'en-pausa' | 'finalizada'
  start_date text,
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 4. TABLA DE MIEMBROS DE CAMPAÑA (ROLES: 'host', 'dm', 'player')
-- ==============================================================================
create table if not exists public.campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'player' check (role in ('host', 'dm', 'player')),
  joined_at timestamptz default now(),
  unique(campaign_id, user_id)
);

-- Trigger para que el creador de la campaña sea añadido automáticamente como 'host'
create or replace function public.handle_new_campaign_host()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.campaign_members (campaign_id, user_id, role)
  values (new.id, new.host_id, 'host')
  on conflict (campaign_id, user_id) do update set role = 'host';
  return new;
end;
$$;

drop trigger if exists on_campaign_created on public.campaigns;
create trigger on_campaign_created
  after insert on public.campaigns
  for each row execute function public.handle_new_campaign_host();

-- ==============================================================================
-- 5. TABLA DE INVITACIONES CON TOKEN
-- ==============================================================================
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  created_by uuid references auth.users(id),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  role text not null default 'player' check (role in ('dm', 'player')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ==============================================================================
-- 6. TABLAS DE ENTIDADES VINCULADAS A LA CAMPAÑA
-- ==============================================================================

-- 6.1 Sesiones
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  numero integer not null default 1,
  titulo text not null,
  fecha_real text not null,
  dia_juego_inicio integer default 1,
  dia_juego_fin integer,
  duracion_horas numeric,
  pj_ids_presentes text[] default array[]::text[],
  notas text default '',
  notas_dm text default '',
  etiquetas text[] default array[]::text[],
  npc_ids text[] default array[]::text[],
  lugar_ids text[] default array[]::text[],
  mision_ids text[] default array[]::text[],
  objeto_ids text[] default array[]::text[],
  monstruo_ids text[] default array[]::text[],
  creada_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- 6.2 NPCs
create table if not exists public.npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  nombre text not null,
  nombre_conocido boolean default true,
  rol text default '',
  actitud text default 'neutral',
  descripcion text default '',
  ubicacion_habitual text default '',
  informacion_conocida text default '',
  informacion_sospechada text default '',
  notas text default '',
  notas_dm text default '',
  etiquetas text[] default array[]::text[],
  sesion_ids text[] default array[]::text[],
  creado_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- 6.3 Lugares
create table if not exists public.lugares (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  nombre text not null,
  nombre_conocido boolean default true,
  tipo text default 'otro',
  estado text default 'conocido',
  padre_id text,
  descripcion text default '',
  como_llegar text default '',
  que_hay text default '',
  que_paso text default '',
  notas text default '',
  notas_dm text default '',
  etiquetas text[] default array[]::text[],
  sesion_ids text[] default array[]::text[],
  creado_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- 6.4 Misiones
create table if not exists public.misiones (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  titulo text not null,
  descripcion text default '',
  estado text default 'activa',
  origen_npc_id text,
  origen_lugar_id text,
  recompensa_conocida text default '',
  recompensa_obtenida text default '',
  pasos jsonb default '[]'::jsonb,
  sesion_activacion_id text,
  sesion_completado_id text,
  sesion_ids text[] default array[]::text[],
  notas text default '',
  notas_dm text default '',
  etiquetas text[] default array[]::text[],
  creada_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- 6.5 Objetos
create table if not exists public.objetos (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  nombre text not null,
  nombre_conocido boolean default true,
  tipo text default 'comun',
  subtipo text default '',
  donde_lo_conseguimos text default '',
  efecto_conocido text default '',
  efecto_sospechado text default '',
  sintonizacion text default '',
  valor text default '',
  peso text default '',
  ubicacion_actual text default '',
  portador_pj_id text,
  descripcion text default '',
  propiedades text default '',
  notas text default '',
  notas_dm text default '',
  etiquetas text[] default array[]::text[],
  sesion_ids text[] default array[]::text[],
  creado_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- 6.6 Monstruos / Bestiario
create table if not exists public.monstruos (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  nombre text not null,
  nombre_conocido boolean default true,
  tipo text default 'humanoide',
  nivel_peligro text default 'medio',
  descripcion_visual text default '',
  comportamiento text default '',
  debilidades text default '',
  resistencias text default '',
  inmunidades text default '',
  tacticas text default '',
  lugares_visto_ids text[] default array[]::text[],
  sesion_ids text[] default array[]::text[],
  veces_encontrado integer default 1,
  notas text default '',
  notas_dm text default '',
  etiquetas text[] default array[]::text[],
  creado_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- 6.7 Personajes Jugadores (PJs)
create table if not exists public.pjs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- Dueño de la ficha
  nombre text not null,
  clase text not null default 'Guerrero',
  raza text not null default 'Humano',
  nivel integer not null default 1,
  pg_max integer default 10,
  ca integer default 10,
  descripcion text default '',
  personalidad text default '',
  trasfondo text default '',
  notas text default '',
  notas_dm text default '',
  estado text default 'activo',
  etiquetas text[] default array[]::text[],
  creado_en text,
  actualizado_en text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 7. FUNCIONES HELPER DE SEGURIDAD (SECURITY DEFINER)
-- ==============================================================================
-- El uso de 'security definer' evita recursiones infinitas en las políticas RLS
-- entre las tablas campaigns y campaign_members.

create or replace function public.check_user_campaign_role(c_id uuid, required_roles text[])
returns boolean language sql security definer set search_path = '' as $$
  select exists (
    select 1 from public.campaign_members
    where campaign_id = c_id
      and user_id = auth.uid()
      and role = any(required_roles)
  );
$$;

create or replace function public.is_campaign_member(c_id uuid)
returns boolean language sql security definer set search_path = '' as $$
  select exists (
    select 1 from public.campaign_members
    where campaign_id = c_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_campaign_host(c_id uuid)
returns boolean language sql security definer set search_path = '' as $$
  select exists (
    select 1 from public.campaigns
    where id = c_id
      and host_id = auth.uid()
  );
$$;

-- ==============================================================================
-- 8. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.invites enable row level security;
alter table public.sessions enable row level security;
alter table public.npcs enable row level security;
alter table public.lugares enable row level security;
alter table public.misiones enable row level security;
alter table public.objetos enable row level security;
alter table public.monstruos enable row level security;
alter table public.pjs enable row level security;

-- --- PROFILES ---
drop policy if exists "Cualquiera autenticado puede ver perfiles" on public.profiles;
create policy "Cualquiera autenticado puede ver perfiles"
  on public.profiles for select to authenticated
  using (true);

drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.profiles;
create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- --- CAMPAIGNS ---
drop policy if exists "Miembros pueden ver sus campañas" on public.campaigns;
create policy "Miembros pueden ver sus campañas"
  on public.campaigns for select to authenticated
  using (
    host_id = auth.uid()
    or public.is_campaign_member(id)
  );

drop policy if exists "Usuarios autenticados pueden crear campañas" on public.campaigns;
create policy "Usuarios autenticados pueden crear campañas"
  on public.campaigns for insert to authenticated
  with check (host_id = auth.uid());

drop policy if exists "Host y DM pueden editar la campaña" on public.campaigns;
create policy "Host y DM pueden editar la campaña"
  on public.campaigns for update to authenticated
  using (public.check_user_campaign_role(id, array['host', 'dm']))
  with check (public.check_user_campaign_role(id, array['host', 'dm']));

drop policy if exists "Solo el Host puede eliminar la campaña" on public.campaigns;
create policy "Solo el Host puede eliminar la campaña"
  on public.campaigns for delete to authenticated
  using (host_id = auth.uid());

-- --- CAMPAIGN_MEMBERS ---
drop policy if exists "Miembros pueden ver los integrantes de su campaña" on public.campaign_members;
create policy "Miembros pueden ver los integrantes de su campaña"
  on public.campaign_members for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_campaign_host(campaign_id)
    or public.is_campaign_member(campaign_id)
  );

drop policy if exists "Host puede añadir miembros manualmente" on public.campaign_members;
create policy "Host puede añadir miembros manualmente"
  on public.campaign_members for insert to authenticated
  with check (
    public.check_user_campaign_role(campaign_id, array['host']) or user_id = auth.uid()
  );

drop policy if exists "Solo el Host puede cambiar roles de miembros" on public.campaign_members;
create policy "Solo el Host puede cambiar roles de miembros"
  on public.campaign_members for update to authenticated
  using (public.check_user_campaign_role(campaign_id, array['host']))
  with check (public.check_user_campaign_role(campaign_id, array['host']));

drop policy if exists "Host puede expulsar o el miembro puede salir" on public.campaign_members;
create policy "Host puede expulsar o el miembro puede salir"
  on public.campaign_members for delete to authenticated
  using (
    (public.check_user_campaign_role(campaign_id, array['host']) and role != 'host')
    or (user_id = auth.uid() and role != 'host')
  );

-- --- INVITES ---
create policy "Miembros pueden ver invitaciones de su campaña"
  on public.invites for select to authenticated
  using (
    public.check_user_campaign_role(campaign_id, array['host', 'dm'])
    or token is not null
  );

create policy "Host y DM pueden crear invitaciones"
  on public.invites for insert to authenticated
  with check (public.check_user_campaign_role(campaign_id, array['host', 'dm']));

create policy "Host y DM pueden gestionar invitaciones o usuarios pueden canjearlas"
  on public.invites for update to authenticated
  using (true)
  with check (true);

-- --- ENTIDADES BASE: SESSIONS, NPCS, LUGARES, MISIONES, OBJETOS, MONSTRUOS ---

-- Helper macro para tablas generales
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['sessions', 'npcs', 'lugares', 'misiones', 'objetos', 'monstruos']) loop
    execute format('
      create policy "Miembros pueden ver %1$I"
        on public.%1$I for select to authenticated
        using (public.check_user_campaign_role(campaign_id, array[''host'', ''dm'', ''player'']));

      create policy "Host y DM pueden insertar en %1$I"
        on public.%1$I for insert to authenticated
        with check (public.check_user_campaign_role(campaign_id, array[''host'', ''dm'']));

      create policy "Host y DM pueden actualizar %1$I"
        on public.%1$I for update to authenticated
        using (public.check_user_campaign_role(campaign_id, array[''host'', ''dm'']))
        with check (public.check_user_campaign_role(campaign_id, array[''host'', ''dm'']));

      create policy "Host y DM pueden eliminar en %1$I"
        on public.%1$I for delete to authenticated
        using (public.check_user_campaign_role(campaign_id, array[''host'', ''dm'']));
    ', tbl);
  end loop;
end $$;

-- --- PJS (PERSONAJES JUGADORES) ---
create policy "Miembros pueden ver los PJs de la campaña"
  on public.pjs for select to authenticated
  using (public.check_user_campaign_role(campaign_id, array['host', 'dm', 'player']));

create policy "Cualquier miembro de la campaña puede crear un PJ"
  on public.pjs for insert to authenticated
  with check (public.check_user_campaign_role(campaign_id, array['host', 'dm', 'player']));

create policy "Host, DM o el Dueño del PJ pueden editarlo"
  on public.pjs for update to authenticated
  using (
    public.check_user_campaign_role(campaign_id, array['host', 'dm'])
    or (user_id = auth.uid())
  )
  with check (
    public.check_user_campaign_role(campaign_id, array['host', 'dm'])
    or (user_id = auth.uid())
  );

create policy "Host, DM o el Dueño del PJ pueden eliminarlo"
  on public.pjs for delete to authenticated
  using (
    public.check_user_campaign_role(campaign_id, array['host', 'dm'])
    or (user_id = auth.uid())
  );

-- ==============================================================================
-- 9. HABILITAR PUBLICACIÓN SUPABASE REALTIME
-- ==============================================================================
do $$
begin
  begin
    alter publication supabase_realtime add table 
      public.campaigns,
      public.campaign_members,
      public.sessions,
      public.npcs,
      public.lugares,
      public.misiones,
      public.objetos,
      public.monstruos,
      public.pjs;
  exception when duplicate_object then
    null;
  end;
end $$;

-- ==============================================================================
-- 10. FUNCIÓN SEGURA PARA CANJEAR INVITACIÓN (RPC)
-- ==============================================================================
create or replace function public.accept_campaign_invite(invite_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  inv record;
  current_user_id uuid := auth.uid();
  already_member boolean;
begin
  if current_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Debes haber iniciado sesión para unirte a una campaña');
  end if;

  -- Buscar token válido
  select * into inv from public.invites
  where token = invite_token
    and (expires_at > now())
    and used_at is null;

  if not found then
    return jsonb_build_object('success', false, 'error', 'La invitación no es válida o ya ha expirado');
  end if;

  -- Comprobar si ya es miembro
  select exists (
    select 1 from public.campaign_members
    where campaign_id = inv.campaign_id and user_id = current_user_id
  ) into already_member;

  if already_member then
    return jsonb_build_object('success', true, 'campaign_id', inv.campaign_id, 'message', 'Ya eras miembro de esta campaña');
  end if;

  -- Insertar membresía con el rol estipulado
  insert into public.campaign_members (campaign_id, user_id, role)
  values (inv.campaign_id, current_user_id, coalesce(inv.role, 'player'));

  -- Marcar invitación como usada
  update public.invites
  set used_at = now(), used_by = current_user_id
  where id = inv.id;

  return jsonb_build_object('success', true, 'campaign_id', inv.campaign_id, 'role', inv.role);
end;
$$;
