// Sesión del alumno en "Mi Ruta": entra con su celular una sola vez y queda guardado en ese teléfono.
// Toda la lógica de entrar / confirmar / salir vive aquí; las pantallas solo la muestran.
import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient'
import { calcularAvance } from './rutaAvance'

const LLAVE = 'nk_alumno'

export const MENSAJES = {
  formato: 'Escribe tu celular de 10 dígitos.',
  no_encontrado: 'No encontramos ese número. Pide en recepción que registren tu celular y vuelve a intentar.',
  compartido: 'Ese número está registrado en más de una persona. Pide en recepción que registren tu número personal.',
  kid: 'El seguimiento desde el celular no está disponible para NK Kids. Pregúntale a tu entrenador por tu avance.',
  bloqueado: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.',
}

const NO_DISPONIBLE = 'El seguimiento todavía no está disponible. Intenta más tarde.'

function guardado() {
  try { return JSON.parse(localStorage.getItem(LLAVE)) } catch { return null }
}
function guardar(v) {
  try { v ? localStorage.setItem(LLAVE, JSON.stringify(v)) : localStorage.removeItem(LLAVE) } catch { /* sin almacenamiento */ }
}

// "ANA PÉREZ LÓPEZ" → "Ana"
export function primerNombre(nombre = '') {
  const p = (nombre ?? '').trim().split(/\s+/)[0] ?? ''
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
}

export function useAvance() {
  const [sesion, setSesion] = useState(guardado)   // { id, token, nombre } en este celular
  const [datos, setDatos] = useState(null)         // progreso devuelto por la base
  const [candidato, setCandidato] = useState(null) // alguien encontrado, falta que confirme "¿Eres tú?"
  const [celular, setCelular] = useState('')
  const [msg, setMsg] = useState('')               // errores / avisos de la tarjeta de entrada
  const [ocupado, setOcupado] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')

  useEffect(() => {
    if (!sesion) return
    let vivo = true
    ;(async () => {
      const { data, error } = await supabase.rpc('alumno_mi_progreso', { p_id: sesion.id, p_token: sesion.token })
      if (!vivo) return
      if (error) { setErrorCarga(NO_DISPONIBLE); return }
      if (!data) {
        // El número cambió, se dio de baja, etc.: hay que volver a entrar.
        guardar(null); setSesion(null); setDatos(null)
        setMsg('Tu acceso ya no es válido. Vuelve a entrar con tu celular.')
        return
      }
      setErrorCarga('')
      setDatos(data)
    })()
    return () => { vivo = false }
  }, [sesion])

  async function buscar(e) {
    e?.preventDefault()
    setMsg('')
    setOcupado(true)
    const { data, error } = await supabase.rpc('alumno_entrar', { p_celular: celular })
    setOcupado(false)
    if (error) { setMsg(NO_DISPONIBLE); return }
    if (!data?.ok) { setMsg(MENSAJES[data?.motivo] ?? 'No se pudo entrar.'); return }
    setCandidato(data)
  }

  function confirmar() {
    const s = { id: candidato.id, token: candidato.token, nombre: candidato.nombre }
    guardar(s)
    setDatos(null)
    setSesion(s)
    setCandidato(null)
    setCelular('')
    setMsg('')
  }

  function volver() { setCandidato(null); setMsg('') }

  function salir() {
    guardar(null); setSesion(null); setDatos(null); setCandidato(null); setMsg(''); setErrorCarga('')
  }

  const avance = useMemo(() => (datos ? calcularAvance(datos.temas, datos.criterios) : null), [datos])

  return {
    sesion, datos, avance,
    nombre: primerNombre(datos?.nombre ?? sesion?.nombre),
    errorCarga,
    celular, setCelular, msg, ocupado, candidato, buscar, confirmar, volver, salir,
  }
}
