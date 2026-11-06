-- NK BOX — Seguimiento de avance (Tu ruta): Menú Coach + acceso del alumno por celular.
-- Correr en Supabase → SQL Editor. Requiere pos_fase1.sql, pos_movimientos.sql y pos_roles.sql.
-- Solo agrega; se puede volver a correr sin error. No borra datos.

-- 1) Columnas nuevas en alumnos ---------------------------------------------------------
-- estatus: por si todavía no se corrió pos_alumnos.sql (si ya existe, no hace nada).
alter table alumnos add column if not exists estatus text not null default 'activo'
  check (estatus in ('activo', 'inactivo'));
-- NK Kids no usan el acceso por celular.
alter table alumnos add column if not exists es_kid boolean not null default false;
-- Llave privada que se guarda en el celular del alumno. Cambia sola si cambia su número.
alter table alumnos add column if not exists token_acceso uuid not null default gen_random_uuid();

create or replace function alumnos_rotar_token() returns trigger
language plpgsql as $$
begin
  if new.telefono is distinct from old.telefono then
    new.token_acceso := gen_random_uuid();
  end if;
  return new;
end $$;

drop trigger if exists alumnos_rotar_token on alumnos;
create trigger alumnos_rotar_token before update on alumnos
  for each row execute function alumnos_rotar_token();

-- 2) Rol "entrenador" (solo puede evaluar avance) --------------------------------------
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.perfiles'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%rol%'
  loop
    execute format('alter table public.perfiles drop constraint %I', c.conname);
  end loop;
  alter table public.perfiles add constraint perfiles_rol_check check (rol in ('admin', 'recepcion', 'entrenador'));
end $$;

create or replace function es_entrenador() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where user_id = auth.uid() and rol = 'entrenador')
$$;

-- El entrenador solo tiene el permiso "evaluaciones". Admin y recepción quedan igual que antes.
create or replace function puede(permiso text) returns boolean
language sql stable security definer set search_path = public as $$
  select es_admin()
    or case when es_entrenador() then permiso = 'evaluaciones'
       else coalesce((select (valor ->> permiso)::boolean from pos_config where clave = 'permisos_recepcion'), false)
       end
$$;

-- Recepción NO evalúa por defecto (el admin puede activarlo en Permisos).
update pos_config set valor = valor || '{"evaluaciones": false}'
where clave = 'permisos_recepcion' and not (valor ? 'evaluaciones');

-- 3) Avance por tema y por criterio de examen -------------------------------------------
-- "tema" es la posición del tema dentro de su fase en content.js (0, 1, 2...). No reordenes
-- los temas de la ruta en content.js sin avisar: el avance guardado se movería de lugar.
create table if not exists progreso_temas (
  id          bigint generated always as identity primary key,
  alumno_id   bigint not null references alumnos(id) on delete cascade,
  fase        smallint not null check (fase between 1 and 4),
  tema        smallint not null check (tema >= 0),
  marcado_por uuid default auth.uid(),
  marcado_en  timestamptz not null default now(),
  unique (alumno_id, fase, tema)
);

create table if not exists examen_criterios (
  id          bigint generated always as identity primary key,
  alumno_id   bigint not null references alumnos(id) on delete cascade,
  fase        smallint not null check (fase between 1 and 3),
  criterio    text not null check (criterio in ('tecnica', 'fisico', 'actitud', 'requisito')),
  marcado_por uuid default auth.uid(),
  marcado_en  timestamptz not null default now(),
  unique (alumno_id, fase, criterio)
);

alter table progreso_temas   enable row level security;
alter table examen_criterios enable row level security;

drop policy if exists "evaluar ver temas"       on progreso_temas;
drop policy if exists "evaluar insertar temas"  on progreso_temas;
drop policy if exists "evaluar borrar temas"    on progreso_temas;
drop policy if exists "evaluar ver criterios"      on examen_criterios;
drop policy if exists "evaluar insertar criterios" on examen_criterios;
drop policy if exists "evaluar borrar criterios"   on examen_criterios;

create policy "evaluar ver temas"      on progreso_temas for select to authenticated using (puede('evaluaciones'));
create policy "evaluar insertar temas" on progreso_temas for insert to authenticated with check (puede('evaluaciones'));
create policy "evaluar borrar temas"   on progreso_temas for delete to authenticated using (puede('evaluaciones'));
create policy "evaluar ver criterios"      on examen_criterios for select to authenticated using (puede('evaluaciones'));
create policy "evaluar insertar criterios" on examen_criterios for insert to authenticated with check (puede('evaluaciones'));
create policy "evaluar borrar criterios"   on examen_criterios for delete to authenticated using (puede('evaluaciones'));

-- 4) Acceso del alumno desde Tu ruta -----------------------------------------------------
-- La tabla alumnos sigue cerrada al público. El alumno solo puede llamar estas dos funciones:
-- una confirma su celular y la otra devuelve ÚNICAMENTE su propio avance.
create table if not exists intentos_acceso (
  id        bigint generated always as identity primary key,
  clave     text not null,
  creado_en timestamptz not null default now()
);
create index if not exists intentos_acceso_idx on intentos_acceso (clave, creado_en);
alter table intentos_acceso enable row level security;  -- sin reglas: nadie la lee desde la app

create or replace function alumno_entrar(p_celular text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  d text := regexp_replace(coalesce(p_celular, ''), '\D', '', 'g');
  v_clave text;
  fallos_clave int;
  fallos_total int;
  n_alumnos int;
  n_kids int;
  a record;
begin
  if length(d) = 13 and left(d, 3) = '521' then d := substr(d, 4);
  elsif length(d) = 12 and left(d, 2) = '52' then d := substr(d, 3);
  end if;
  if length(d) <> 10 then
    return jsonb_build_object('ok', false, 'motivo', 'formato');
  end if;

  -- Límite de intentos fallidos: 8 por conexión y 80 en total cada 15 minutos.
  v_clave := coalesce(nullif(trim(split_part(
    coalesce((nullif(current_setting('request.headers', true), '')::json) ->> 'x-forwarded-for', ''), ',', 1)), ''), 'sin-ip');
  delete from intentos_acceso where creado_en < now() - interval '1 day';
  select count(*) into fallos_clave from intentos_acceso
    where clave = v_clave and creado_en > now() - interval '15 minutes';
  select count(*) into fallos_total from intentos_acceso
    where creado_en > now() - interval '15 minutes';
  if fallos_clave >= 8 or fallos_total >= 80 then
    return jsonb_build_object('ok', false, 'motivo', 'bloqueado');
  end if;

  select count(*) filter (where not es_kid), count(*) filter (where es_kid)
    into n_alumnos, n_kids
  from alumnos
  where estatus = 'activo'
    and right(regexp_replace(coalesce(telefono, ''), '\D', '', 'g'), 10) = d;

  if n_alumnos = 1 then
    select id, nombre, token_acceso into a from alumnos
    where estatus = 'activo' and not es_kid
      and right(regexp_replace(coalesce(telefono, ''), '\D', '', 'g'), 10) = d;
    return jsonb_build_object('ok', true, 'id', a.id, 'nombre', a.nombre, 'token', a.token_acceso);
  end if;

  insert into intentos_acceso (clave) values (v_clave);
  if n_alumnos > 1 then
    return jsonb_build_object('ok', false, 'motivo', 'compartido');
  elsif n_kids > 0 then
    return jsonb_build_object('ok', false, 'motivo', 'kid');
  end if;
  return jsonb_build_object('ok', false, 'motivo', 'no_encontrado');
end $$;

create or replace function alumno_mi_progreso(p_id bigint, p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a record;
begin
  select id, nombre into a from alumnos
  where id = p_id and token_acceso = p_token and estatus = 'activo' and not es_kid;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'nombre', a.nombre,
    'temas', coalesce((select jsonb_agg(jsonb_build_array(fase, tema) order by fase, tema)
                       from progreso_temas where alumno_id = a.id), '[]'::jsonb),
    'criterios', coalesce((select jsonb_agg(jsonb_build_array(fase, criterio) order by fase, criterio)
                           from examen_criterios where alumno_id = a.id), '[]'::jsonb)
  );
end $$;

revoke all on function alumno_entrar(text) from public;
revoke all on function alumno_mi_progreso(bigint, uuid) from public;
grant execute on function alumno_entrar(text) to anon, authenticated;
grant execute on function alumno_mi_progreso(bigint, uuid) to anon, authenticated;

-- CREAR LA CUENTA DE UN ENTRENADOR (después de agregarlo en Authentication → Add user):
--   insert into perfiles (user_id, rol)
--   select id, 'entrenador' from auth.users where lower(email) = 'correo@del.entrenador'
--   on conflict (user_id) do update set rol = 'entrenador';
