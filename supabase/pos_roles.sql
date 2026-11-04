-- NK BOX — Cuentas admin / recepción, metas y costos fijos. Correr en Supabase → SQL Editor.
-- Requiere pos_fase1.sql y pos_movimientos.sql. Se puede volver a correr sin error.
-- No borra ni cambia ninguna regla existente: agrega reglas RESTRICTIVAS (se suman a las actuales).

-- 1) Perfiles: quién es admin. Cualquier usuario sin perfil se trata como recepción.
create table if not exists perfiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('admin','recepcion')),
  created_at timestamptz not null default now()
);

insert into perfiles (user_id, rol)
select id, 'admin' from auth.users where lower(email) = 'nk_boxing@outlook.com'
on conflict (user_id) do update set rol = 'admin';

-- 2) Configuración: metas del negocio y permisos de recepción.
create table if not exists pos_config (
  clave      text primary key,
  valor      jsonb not null,
  updated_at timestamptz not null default now()
);

insert into pos_config (clave, valor) values
  ('metas', '{"ingreso_mensual": 40000, "arpu": 530, "nomina_verde": 45, "nomina_rojo": 50, "margen_verde": 50, "margen_rojo": 40}'),
  ('permisos_recepcion', '{"venta": true, "retiro": true, "corte": true, "movimientos": true, "editar": false, "productos": false, "reportes": false, "anuncios": false, "horarios": false, "planes": false}')
on conflict (clave) do nothing;

-- 3) Costos fijos mensuales que no pasan por caja.
create table if not exists costos_fijos (
  id         bigint generated always as identity primary key,
  mes        date not null check (extract(day from mes) = 1),
  concepto   text not null check (concepto in ('renta','servicios','suscripciones','otro')),
  monto      numeric(10,2) not null check (monto >= 0),
  nota       text,
  created_at timestamptz not null default now()
);

-- 4) Funciones de permisos (se ejecutan con privilegios del dueño para poder leer perfiles/config).
create or replace function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where user_id = auth.uid() and rol = 'admin')
$$;

create or replace function puede(permiso text) returns boolean
language sql stable security definer set search_path = public as $$
  select es_admin() or coalesce(
    (select (valor ->> permiso)::boolean from pos_config where clave = 'permisos_recepcion'), false)
$$;

-- 5) RLS de las tablas nuevas
alter table perfiles     enable row level security;
alter table pos_config   enable row level security;
alter table costos_fijos enable row level security;

drop policy if exists "perfiles ver"      on perfiles;
drop policy if exists "perfiles admin"    on perfiles;
drop policy if exists "config ver"        on pos_config;
drop policy if exists "config admin ins"  on pos_config;
drop policy if exists "config admin upd"  on pos_config;
drop policy if exists "costos ver"        on costos_fijos;
drop policy if exists "costos admin"      on costos_fijos;

create policy "perfiles ver"     on perfiles     for select to authenticated using (user_id = auth.uid() or es_admin());
create policy "perfiles admin"   on perfiles     for all    to authenticated using (es_admin()) with check (es_admin());
create policy "config ver"       on pos_config   for select to authenticated using (true);
create policy "config admin ins" on pos_config   for insert to authenticated with check (es_admin());
create policy "config admin upd" on pos_config   for update to authenticated using (es_admin()) with check (es_admin());
create policy "costos ver"       on costos_fijos for select to authenticated using (puede('reportes'));
create policy "costos admin"     on costos_fijos for all    to authenticated using (es_admin()) with check (es_admin());

-- 6) Reglas restrictivas en el POS: recepción solo puede lo que el admin le active.
drop policy if exists "rol insert ventas"     on ventas;
drop policy if exists "rol update ventas"     on ventas;
drop policy if exists "rol insert retiros"    on retiros;
drop policy if exists "rol update retiros"    on retiros;
drop policy if exists "rol insert corte"      on corte_caja;
drop policy if exists "rol insert productos"  on productos;
drop policy if exists "rol update productos"  on productos;
drop policy if exists "rol insert alumnos"    on alumnos;
drop policy if exists "rol update alumnos"    on alumnos;

create policy "rol insert ventas"    on ventas     as restrictive for insert to authenticated with check (puede('venta'));
create policy "rol update ventas"    on ventas     as restrictive for update to authenticated using (puede('editar'));
create policy "rol insert retiros"   on retiros    as restrictive for insert to authenticated with check (puede('retiro'));
create policy "rol update retiros"   on retiros    as restrictive for update to authenticated using (puede('editar'));
create policy "rol insert corte"     on corte_caja as restrictive for insert to authenticated with check (puede('corte'));
create policy "rol insert productos" on productos  as restrictive for insert to authenticated with check (puede('productos'));
create policy "rol update productos" on productos  as restrictive for update to authenticated using (puede('productos'));
create policy "rol insert alumnos"   on alumnos    as restrictive for insert to authenticated with check (puede('venta'));
create policy "rol update alumnos"   on alumnos    as restrictive for update to authenticated using (puede('editar'));
