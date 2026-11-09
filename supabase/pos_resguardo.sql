-- ============================================================
-- Retiro tipo "Resguardo": efectivo que se saca de la caja para guardarlo
-- (no es nómina ni gasto, no entra a los costos del cierre del mes).
-- Correr UNA vez en Supabase → SQL Editor. Se puede volver a correr sin problema.
-- ORDEN: primero este SQL, después publicar el código.
-- ============================================================

do $$
declare c record;
begin
  -- quita la regla vieja que solo permitía 'nomina' y 'gasto' en retiros.tipo
  for c in
    select conname from pg_constraint
    where conrelid = 'retiros'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%tipo%'
  loop
    execute format('alter table retiros drop constraint %I', c.conname);
  end loop;
end $$;

alter table retiros
  add constraint retiros_tipo_check check (tipo in ('nomina', 'gasto', 'resguardo'));
