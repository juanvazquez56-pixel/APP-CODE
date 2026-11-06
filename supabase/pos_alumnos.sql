-- NK BOX — Fase 3: alumnos, membresías y vencimientos. Correr en Supabase → SQL Editor.
-- Requiere pos_fase1.sql, pos_movimientos.sql y pos_roles.sql. Solo agrega; se puede volver a correr.

-- 1) Días que cubre cada producto (membresías = 30). Pases y bebidas quedan sin vigencia.
alter table productos add column if not exists dias_vigencia integer check (dias_vigencia > 0);
update productos set dias_vigencia = 30 where es_membresia and dias_vigencia is null;

-- 2) Alumno activo / inactivo (inactivo = se dio de baja; sale de las listas de seguimiento).
alter table alumnos add column if not exists estatus text not null default 'activo'
  check (estatus in ('activo', 'inactivo'));

-- El celular NO es único: hermanos o Kids pueden compartir el de su papá/mamá.
create index if not exists alumnos_telefono_idx on alumnos (telefono);
create index if not exists ventas_alumno_idx on ventas (alumno_id) where alumno_id is not null;

-- 3) Permiso nuevo "alumnos" para recepción (activado por defecto: hace el seguimiento de vencidos).
update pos_config set valor = valor || '{"alumnos": true}'
where clave = 'permisos_recepcion' and not (valor ? 'alumnos');

-- 4) Registrar o editar alumnos (nombre, celular, activo/inactivo) con el permiso "alumnos".
--    Reemplaza las dos reglas restrictivas de alumnos que creó pos_roles.sql.
drop policy if exists "rol insert alumnos" on alumnos;
drop policy if exists "rol update alumnos" on alumnos;
create policy "rol insert alumnos" on alumnos as restrictive for insert to authenticated
  with check (puede('venta') or puede('alumnos'));
create policy "rol update alumnos" on alumnos as restrictive for update to authenticated
  using (puede('alumnos') or puede('editar'));
