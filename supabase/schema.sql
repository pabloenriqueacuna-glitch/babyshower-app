create extension if not exists pgcrypto;

create table if not exists public.regalos (
  id text primary key,
  categoria text not null default '',
  nombre text not null,
  descripcion text,
  precio_estimado numeric,
  imagen_url text,
  cantidad_total integer not null check (cantidad_total >= 0),
  cantidad_disponible integer not null check (cantidad_disponible >= 0),
  orden integer not null default 0,
  creado_en timestamptz not null default now(),
  check (cantidad_disponible <= cantidad_total)
);

create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  regalo_id text not null references public.regalos(id) on delete cascade,
  nombre_invitado text not null,
  email_invitado text not null,
  cantidad_regalada integer not null check (cantidad_regalada > 0),
  fecha timestamptz not null default now(),
  check (length(trim(nombre_invitado)) > 0),
  check (length(trim(email_invitado)) > 0)
);

create index if not exists reservas_regalo_id_idx on public.reservas(regalo_id);
create index if not exists reservas_fecha_idx on public.reservas(fecha);
create index if not exists regalos_orden_idx on public.regalos(orden);

alter table public.regalos enable row level security;
alter table public.reservas enable row level security;

drop policy if exists "regalos lectura publica" on public.regalos;
create policy "regalos lectura publica"
  on public.regalos
  for select
  using (true);

drop policy if exists "reservas lectura publica" on public.reservas;

revoke all on public.regalos from anon, authenticated;
revoke all on public.reservas from anon, authenticated;

grant select on public.regalos to anon, authenticated;

create or replace function public.reservar_regalo(
  p_regalo_id text,
  p_nombre text,
  p_email text,
  p_cantidad integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_disponible integer;
begin
  if p_cantidad is null or p_cantidad < 1 then
    return false;
  end if;

  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_email), '') = '' then
    return false;
  end if;

  select cantidad_disponible
    into v_disponible
    from public.regalos
   where id = p_regalo_id
     for update;

  if v_disponible is null or v_disponible < p_cantidad then
    return false;
  end if;

  update public.regalos
     set cantidad_disponible = cantidad_disponible - p_cantidad
   where id = p_regalo_id;

  insert into public.reservas (
    regalo_id,
    nombre_invitado,
    email_invitado,
    cantidad_regalada
  )
  values (
    p_regalo_id,
    trim(p_nombre),
    trim(p_email),
    p_cantidad
  );

  return true;
end;
$$;

create or replace function public.cargar_inventario(p_regalos jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.reservas where true;
  delete from public.regalos where true;

  insert into public.regalos (
    id,
    categoria,
    nombre,
    descripcion,
    precio_estimado,
    imagen_url,
    cantidad_total,
    cantidad_disponible,
    orden
  )
  select
    coalesce(nullif(x->>'id', ''), gen_random_uuid()::text),
    coalesce(x->>'categoria', ''),
    x->>'nombre',
    nullif(x->>'descripcion', ''),
    nullif(x->>'precioEstimado', '')::numeric,
    nullif(x->>'imagenUrl', ''),
    coalesce((x->>'cantidadTotal')::integer, 0),
    coalesce((x->>'cantidadDisponible')::integer, 0),
    (ord - 1)::integer
  from jsonb_array_elements(coalesce(p_regalos, '[]'::jsonb)) with ordinality as t(x, ord)
  where coalesce(x->>'nombre', '') <> '';
end;
$$;

create or replace function public.contar_reservas()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.reservas;
$$;

revoke all on function public.reservar_regalo(text, text, text, integer) from public;
revoke all on function public.cargar_inventario(jsonb) from public;
revoke all on function public.contar_reservas() from public;

grant execute on function public.reservar_regalo(text, text, text, integer) to anon, authenticated;
grant execute on function public.cargar_inventario(jsonb) to anon, authenticated;
grant execute on function public.contar_reservas() to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'regalos'
    ) then
      alter publication supabase_realtime add table public.regalos;
    end if;

    if exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'reservas'
    ) then
      alter publication supabase_realtime drop table public.reservas;
    end if;
  end if;
end;
$$;
