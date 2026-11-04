import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

export function usePermisos(session) {
  const [estado, setEstado] = useState({ cargando: true, rol: null, permisos: {}, sinConfigurar: false })

  const cargar = useCallback(async () => {
    if (!session) return
    const [perfil, config] = await Promise.all([
      supabase.from('perfiles').select('rol').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('pos_config').select('valor').eq('clave', 'permisos_recepcion').maybeSingle(),
    ])
    // Sin pos_roles.sql corrido todavía: se mantiene el acceso completo de antes.
    if (perfil.error || config.error) {
      setEstado({ cargando: false, rol: 'admin', permisos: {}, sinConfigurar: true })
      return
    }
    setEstado({
      cargando: false,
      rol: perfil.data?.rol ?? 'recepcion',
      permisos: config.data?.valor ?? {},
      sinConfigurar: false,
    })
  }, [session])

  useEffect(() => { cargar() }, [cargar])

  const puede = permiso => estado.rol === 'admin' || !!estado.permisos[permiso]
  return { ...estado, puede, recargar: cargar }
}
