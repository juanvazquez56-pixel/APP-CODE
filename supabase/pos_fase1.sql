-- POS NK BOX — Fase 1. Correr una vez en Supabase → SQL Editor.
-- No toca anuncios, horario_clases ni planes.

create table if not exists productos (
  id           bigint generated always as identity primary key,
  nombre       text not null,
  categoria    text not null,            -- 'membresia' | 'bebida' | 'equipo' | 'pase'
  precio       numeric(10,2) not null,
  es_membresia boolean not null default false,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists alumnos (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  telefono    text,
  notas       text,
  created_at  timestamptz not null default now()
);

create table if not exists ventas (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  producto_id  bigint references productos(id),
  concepto     text not null,
  categoria    text not null,
  cantidad     integer not null default 1 check (cantidad > 0),
  precio_unit  numeric(10,2) not null,
  total        numeric(10,2) not null,
  metodo_pago  text not null,
  alumno_id    bigint references alumnos(id),
  es_alta      boolean,
  usuario_id   uuid references auth.users(id) default auth.uid(),
  turno        text
);

create table if not exists retiros (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  tipo         text not null check (tipo in ('nomina','gasto')),
  concepto     text not null,
  beneficiario text,
  monto        numeric(10,2) not null check (monto > 0),
  metodo_pago  text not null,
  usuario_id   uuid references auth.users(id) default auth.uid()
);

create table if not exists corte_caja (
  id                bigint generated always as identity primary key,
  fecha             date not null default current_date,
  efectivo_esperado numeric(10,2) not null,
  efectivo_contado  numeric(10,2) not null,
  diferencia        numeric(10,2) not null,
  notas             text,
  usuario_id        uuid references auth.users(id) default auth.uid(),
  created_at        timestamptz not null default now()
);

-- RLS: solo usuarios autenticados. Sin delete/update en ventas/retiros/corte (historial inmutable).
alter table productos  enable row level security;
alter table alumnos    enable row level security;
alter table ventas     enable row level security;
alter table retiros    enable row level security;
alter table corte_caja enable row level security;

create policy "auth select productos" on productos  for select to authenticated using (true);
create policy "auth insert productos" on productos  for insert to authenticated with check (true);
create policy "auth update productos" on productos  for update to authenticated using (true);

create policy "auth select alumnos"   on alumnos    for select to authenticated using (true);
create policy "auth insert alumnos"   on alumnos    for insert to authenticated with check (true);
create policy "auth update alumnos"   on alumnos    for update to authenticated using (true);

create policy "auth select ventas"    on ventas     for select to authenticated using (true);
create policy "auth insert ventas"    on ventas     for insert to authenticated with check (true);

create policy "auth select retiros"   on retiros    for select to authenticated using (true);
create policy "auth insert retiros"   on retiros    for insert to authenticated with check (true);

create policy "auth select corte"     on corte_caja for select to authenticated using (true);
create policy "auth insert corte"     on corte_caja for insert to authenticated with check (true);

-- Semilla de productos (precios editables después)
insert into productos (nombre, categoria, precio, es_membresia) values
  ('NK Básico',       'membresia', 499, true),
  ('NK Fight Club',   'membresia', 699, true),
  ('NK Competitivo',  'membresia', 599, true),
  ('NK Box+Gym',      'membresia', 799, true),
  ('NK Kids',         'membresia', 399, true),
  ('Pase/Visita',     'pase',       70, false),
  ('Agua 500ml',      'bebida',     15, false),
  ('Agua 1L',         'bebida',     25, false),
  ('Gatorade',        'bebida',     35, false);
