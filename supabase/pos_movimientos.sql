-- POS NK BOX — Movimientos (editar / anular). Correr UNA vez en Supabase → SQL Editor.
-- Requiere haber corrido antes pos_fase1.sql. Se puede volver a correr sin error.

-- 1) Columnas nuevas
alter table ventas
  add column if not exists anulada        boolean not null default false,
  add column if not exists anulada_motivo text,
  add column if not exists updated_at     timestamptz,
  add column if not exists editado_por    text,
  add column if not exists usuario_email  text default (auth.jwt() ->> 'email');

alter table retiros
  add column if not exists anulada        boolean not null default false,
  add column if not exists anulada_motivo text,
  add column if not exists updated_at     timestamptz,
  add column if not exists editado_por    text,
  add column if not exists usuario_email  text default (auth.jwt() ->> 'email');

alter table corte_caja
  add column if not exists usuario_email  text default (auth.jwt() ->> 'email');

-- 2) Métodos de pago en formato estándar (convierte los datos de prueba existentes)
drop trigger if exists ventas_proteger  on ventas;
drop trigger if exists retiros_proteger on retiros;

update ventas set metodo_pago = case metodo_pago
  when 'Efectivo' then 'efectivo' when 'Débito' then 'debito' when 'Crédito' then 'credito'
  when 'Transferencia' then 'transferencia' when 'Cortesía' then 'cortesia' else metodo_pago end;
update retiros set metodo_pago = case metodo_pago
  when 'Efectivo' then 'efectivo' when 'Débito' then 'debito' when 'Crédito' then 'credito'
  when 'Transferencia' then 'transferencia' else metodo_pago end;

alter table ventas  drop constraint if exists ventas_metodo_chk;
alter table ventas  add  constraint ventas_metodo_chk
  check (metodo_pago in ('efectivo','debito','credito','transferencia','cortesia'));
alter table retiros drop constraint if exists retiros_metodo_chk;
alter table retiros add  constraint retiros_metodo_chk
  check (metodo_pago in ('efectivo','debito','credito','transferencia'));

-- 3) Al editar: la fecha original y quién capturó NO se pueden cambiar,
--    se registra cuándo y quién editó, y una anulación no se puede revertir.
create or replace function pos_proteger_edicion() returns trigger
language plpgsql as $$
begin
  if old.anulada and not new.anulada then
    raise exception 'Un movimiento anulado no se puede reactivar';
  end if;
  new.created_at    := old.created_at;
  new.usuario_id    := old.usuario_id;
  new.usuario_email := old.usuario_email;
  new.updated_at    := now();
  new.editado_por   := auth.jwt() ->> 'email';
  return new;
end $$;

create trigger ventas_proteger  before update on ventas
  for each row execute function pos_proteger_edicion();
create trigger retiros_proteger before update on retiros
  for each row execute function pos_proteger_edicion();

-- 4) Permiso de editar (UPDATE) para usuarios autenticados. Sin DELETE: nada se borra.
drop policy if exists "auth update ventas"  on ventas;
drop policy if exists "auth update retiros" on retiros;
create policy "auth update ventas"  on ventas  for update to authenticated using (true) with check (true);
create policy "auth update retiros" on retiros for update to authenticated using (true) with check (true);
