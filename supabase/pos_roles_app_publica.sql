-- OPCIONAL — Bloquea en la base de datos que recepción edite Anuncios, Horarios y Planes
-- si el admin no se lo permite. Correr DESPUÉS de pos_roles.sql.
-- No borra ni cambia las reglas actuales de esas tablas: agrega reglas RESTRICTIVAS solo para
-- crear/editar/borrar. Lo que ven los alumnos en la app pública NO se afecta.
-- Para deshacerlo: correr la sección "DESHACER" de abajo.

drop policy if exists "rol insert anuncios" on anuncios;
drop policy if exists "rol update anuncios" on anuncios;
drop policy if exists "rol delete anuncios" on anuncios;
create policy "rol insert anuncios" on anuncios as restrictive for insert to authenticated with check (puede('anuncios'));
create policy "rol update anuncios" on anuncios as restrictive for update to authenticated using (puede('anuncios'));
create policy "rol delete anuncios" on anuncios as restrictive for delete to authenticated using (puede('anuncios'));

drop policy if exists "rol insert horarios" on horario_clases;
drop policy if exists "rol update horarios" on horario_clases;
drop policy if exists "rol delete horarios" on horario_clases;
create policy "rol insert horarios" on horario_clases as restrictive for insert to authenticated with check (puede('horarios'));
create policy "rol update horarios" on horario_clases as restrictive for update to authenticated using (puede('horarios'));
create policy "rol delete horarios" on horario_clases as restrictive for delete to authenticated using (puede('horarios'));

drop policy if exists "rol insert planes" on planes;
drop policy if exists "rol update planes" on planes;
drop policy if exists "rol delete planes" on planes;
create policy "rol insert planes" on planes as restrictive for insert to authenticated with check (puede('planes'));
create policy "rol update planes" on planes as restrictive for update to authenticated using (puede('planes'));
create policy "rol delete planes" on planes as restrictive for delete to authenticated using (puede('planes'));

-- DESHACER (copiar solo estas líneas si algún día quieres quitarlo):
-- drop policy "rol insert anuncios" on anuncios; drop policy "rol update anuncios" on anuncios; drop policy "rol delete anuncios" on anuncios;
-- drop policy "rol insert horarios" on horario_clases; drop policy "rol update horarios" on horario_clases; drop policy "rol delete horarios" on horario_clases;
-- drop policy "rol insert planes" on planes; drop policy "rol update planes" on planes; drop policy "rol delete planes" on planes;
