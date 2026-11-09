-- ============================================================
-- Corte de caja por turno (Mañana / Tarde) y arranque con efectivo inicial.
-- Correr UNA vez en Supabase → SQL Editor. Se puede volver a correr sin problema.
-- ORDEN: primero este SQL, después publicar el código.
-- ============================================================

alter table corte_caja
  add column if not exists turno            text,
  add column if not exists efectivo_inicial numeric(10,2);

-- 'manana' | 'tarde' = corte de un turno; 'inicio' = arranque (efectivo con el que se empieza a llevar el control).
-- Los cortes anteriores quedan con turno vacío.
alter table corte_caja drop constraint if exists corte_caja_turno_check;
alter table corte_caja
  add constraint corte_caja_turno_check check (turno is null or turno in ('manana', 'tarde', 'inicio'));
