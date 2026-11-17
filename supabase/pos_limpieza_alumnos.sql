-- ============================================================
-- Limpieza del directorio de alumnos (SOLO cuenta admin).
--   alumnos_eliminar(ids)   borra alumnos que NO tienen ningún pago/venta. Nunca borra pagos:
--                           si un alumno tiene ventas, se omite y se avisa.
--   alumnos_fusionar(a, b)  une un alumno repetido (b) con el que se queda (a): pasa sus pagos
--                           y su avance de Tu ruta al alumno que se queda y borra el repetido.
-- Correr UNA vez en Supabase → SQL Editor. Se puede volver a correr sin problema.
-- ORDEN: primero este SQL, después publicar el código. Requiere pos_roles.sql y pos_seguimiento.sql.
-- ============================================================

create or replace function alumnos_eliminar(p_ids bigint[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_ok   bigint[];
  v_omit bigint[];
begin
  if not es_admin() then raise exception 'Solo el admin puede eliminar alumnos'; end if;

  select coalesce(array_agg(a.id), '{}') into v_ok
  from alumnos a
  where a.id = any(p_ids) and not exists (select 1 from ventas v where v.alumno_id = a.id);

  v_omit := array(select unnest(p_ids) except select unnest(v_ok));
  delete from alumnos where id = any(v_ok);   -- su avance de Tu ruta se borra con él (on delete cascade)

  return jsonb_build_object('eliminados', cardinality(v_ok), 'omitidos', to_jsonb(v_omit));
end $$;

create or replace function alumnos_fusionar(p_conservar bigint, p_eliminar bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not es_admin() then raise exception 'Solo el admin puede fusionar alumnos'; end if;
  if p_conservar = p_eliminar then raise exception 'Elige dos alumnos distintos'; end if;
  if (select count(*) from alumnos where id in (p_conservar, p_eliminar)) <> 2 then
    raise exception 'No se encontró alguno de los alumnos';
  end if;

  update ventas set alumno_id = p_conservar where alumno_id = p_eliminar;

  insert into progreso_temas (alumno_id, fase, tema)
    select p_conservar, fase, tema from progreso_temas where alumno_id = p_eliminar
    on conflict (alumno_id, fase, tema) do nothing;
  insert into examen_criterios (alumno_id, fase, criterio)
    select p_conservar, fase, criterio from examen_criterios where alumno_id = p_eliminar
    on conflict (alumno_id, fase, criterio) do nothing;

  -- si al que se queda le falta el celular, toma el del repetido
  update alumnos k
     set telefono = coalesce(k.telefono, d.telefono), es_kid = (k.es_kid or d.es_kid)
    from alumnos d
   where k.id = p_conservar and d.id = p_eliminar;

  delete from alumnos where id = p_eliminar;
end $$;

revoke all on function alumnos_eliminar(bigint[])      from public, anon;
revoke all on function alumnos_fusionar(bigint, bigint) from public, anon;
grant execute on function alumnos_eliminar(bigint[])      to authenticated;
grant execute on function alumnos_fusionar(bigint, bigint) to authenticated;
