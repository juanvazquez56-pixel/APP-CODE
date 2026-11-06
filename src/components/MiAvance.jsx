import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FASES, calcularAvance } from '../rutaAvance'

const LLAVE = 'nk_alumno'

const MENSAJES = {
  formato: 'Escribe tu celular de 10 dígitos.',
  no_encontrado: 'No encontramos ese número. Pide en recepción que registren tu celular y vuelve a intentar.',
  compartido: 'Ese número está registrado en más de una persona. Pide en recepción que registren tu número personal.',
  kid: 'El seguimiento desde el celular no está disponible para NK Kids. Pregúntale a tu entrenador por tu avance.',
  bloqueado: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.',
}

function guardado() {
  try { return JSON.parse(localStorage.getItem(LLAVE)) } catch { return null }
}
function guardar(v) {
  try { v ? localStorage.setItem(LLAVE, JSON.stringify(v)) : localStorage.removeItem(LLAVE) } catch { /* sin almacenamiento */ }
}

export default function MiAvance() {
  const [sesion, setSesion] = useState(guardado)       // { id, token, nombre } en este celular
  const [datos, setDatos] = useState(null)             // progreso devuelto por la base
  const [paso, setPaso] = useState('inicio')           // inicio | celular | confirmar
  const [celular, setCelular] = useState('')
  const [candidato, setCandidato] = useState(null)
  const [msg, setMsg] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [detalle, setDetalle] = useState(false)

  useEffect(() => { if (sesion) cargar(sesion) }, [sesion])

  async function cargar(s) {
    const { data, error } = await supabase.rpc('alumno_mi_progreso', { p_id: s.id, p_token: s.token })
    if (error) { setMsg('El seguimiento todavía no está disponible. Intenta más tarde.'); return }
    if (!data) {
      // El número cambió, se dio de baja, etc.: hay que volver a entrar.
      guardar(null); setSesion(null); setDatos(null)
      setMsg('Tu acceso ya no es válido. Vuelve a entrar con tu celular.')
      setPaso('celular')
      return
    }
    setMsg('')
    setDatos(data)
  }

  async function buscar(e) {
    e.preventDefault()
    setMsg('')
    setOcupado(true)
    const { data, error } = await supabase.rpc('alumno_entrar', { p_celular: celular })
    setOcupado(false)
    if (error) { setMsg('El seguimiento todavía no está disponible. Intenta más tarde.'); return }
    if (!data?.ok) { setMsg(MENSAJES[data?.motivo] ?? 'No se pudo entrar.'); return }
    setCandidato(data)
    setPaso('confirmar')
  }

  function confirmar() {
    const s = { id: candidato.id, token: candidato.token, nombre: candidato.nombre }
    guardar(s)
    setSesion(s)
    setCandidato(null)
    setCelular('')
    setPaso('inicio')
  }

  function salir() {
    guardar(null); setSesion(null); setDatos(null); setPaso('inicio'); setMsg(''); setDetalle(false)
  }

  const caja = 'bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6'

  // --- Con sesión: se muestra su avance ---
  if (sesion) {
    if (!datos) return <div className={caja}><p className="text-zinc-500 text-sm">{msg || 'Cargando tu avance...'}</p></div>
    const av = calcularAvance(datos.temas, datos.criterios)
    const fase = FASES.find(f => f.n === av.faseActual)
    const af = av.fases.find(f => f.n === av.faseActual)
    const primerNombre = (datos.nombre ?? '').split(' ')[0]
    const bonito = primerNombre.charAt(0) + primerNombre.slice(1).toLowerCase()
    return (
      <div className={caja} style={{ borderTop: `3px solid ${fase.color}` }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold">Tu avance</p>
            <p className="text-white font-black text-lg leading-tight">{bonito}</p>
          </div>
          <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full border"
            style={{ color: fase.color, borderColor: `${fase.color}70`, background: `${fase.color}18` }}>
            {av.completo ? 'Competidor ✓' : `Fase ${fase.n} · ${fase.nombre}`}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${av.pct}%`, background: fase.color }} />
          </div>
          <b className="font-display text-xl text-white w-12 text-right">{av.pct}%</b>
        </div>
        <p className="text-xs text-zinc-500 mt-1">De cero a competidor</p>

        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {FASES.map(f => {
            const a = av.fases.find(x => x.n === f.n)
            return (
              <div key={f.n}>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: f.color }} />
                </div>
                <p className={`text-[10px] text-center mt-1 ${a.aprobada ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {a.aprobada ? '✓ ' : ''}Fase {f.n}
                </p>
              </div>
            )
          })}
        </div>

        {!av.completo && (
          <p className="text-sm text-zinc-300 mt-4">
            Llevas <b className="text-white">{af.temasHechos} de {af.temasTotal}</b> temas de la fase
            {af.criteriosTotal > 0 && <> y <b className="text-white">{af.criteriosHechos} de {af.criteriosTotal}</b> criterios del examen</>}.
          </p>
        )}

        <button onClick={() => setDetalle(d => !d)} className="mt-3 text-yellow-400 text-sm font-semibold">
          {detalle ? 'Ocultar detalle' : 'Ver detalle de mi fase'}
        </button>
        {detalle && (
          <div className="mt-2">
            {fase.temas.map((t, i) => {
              const ok = av.temaMarcado(fase.n, i)
              return (
                <div key={i} className="flex gap-2.5 py-1.5 border-b border-zinc-800 last:border-0 text-sm">
                  <span className={ok ? 'text-green-400' : 'text-zinc-600'}>{ok ? '✓' : '○'}</span>
                  <span className={ok ? 'text-zinc-500' : 'text-zinc-200'}>{t.texto}</span>
                </div>
              )
            })}
            {fase.criterios.length > 0 && (
              <div className="mt-3 rounded-xl p-3 border border-dashed" style={{ borderColor: `${fase.color}88`, background: `${fase.color}10` }}>
                <p className="font-bold text-sm uppercase tracking-wide mb-1" style={{ color: fase.color }}>
                  Examen para la Fase {fase.examenPara}
                </p>
                {fase.criterios.map(c => {
                  const ok = av.criterioMarcado(fase.n, c.id)
                  return (
                    <div key={c.id} className="flex gap-2.5 py-1 text-sm">
                      <span className={ok ? 'text-green-400' : 'text-zinc-600'}>{ok ? '✓' : '○'}</span>
                      <span className={ok ? 'text-zinc-500' : 'text-zinc-200'}><b>{c.etiqueta}:</b> {c.texto}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-zinc-600 mt-4">
          Tu entrenador actualiza tu avance en cada evaluación.{' '}
          <button onClick={salir} className="underline">No soy {bonito}</button>
        </p>
      </div>
    )
  }

  // --- Sin sesión ---
  if (paso === 'confirmar' && candidato) {
    return (
      <div className={caja}>
        <p className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold">Confirma que eres tú</p>
        <p className="text-white font-black text-xl mt-2">¿Eres {candidato.nombre}?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setCandidato(null); setPaso('celular') }}
            className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl active:scale-95">No, volver</button>
          <button onClick={confirmar}
            className="flex-1 bg-yellow-400 text-zinc-950 font-black py-3 rounded-xl active:scale-95">Sí, soy yo</button>
        </div>
      </div>
    )
  }

  if (paso === 'celular') {
    return (
      <form onSubmit={buscar} className={`${caja} flex flex-col gap-3`}>
        <p className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold">Entra con tu celular</p>
        <p className="text-sm text-zinc-300">Escribe el número que registraste en recepción.</p>
        <input type="tel" inputMode="tel" autoComplete="tel" placeholder="442 123 4567" maxLength={20}
          value={celular} onChange={e => setCelular(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-base" required />
        {msg && <p className="text-yellow-500 text-xs">{msg}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => { setPaso('inicio'); setMsg('') }}
            className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl active:scale-95">Cancelar</button>
          <button type="submit" disabled={ocupado}
            className="flex-1 bg-yellow-400 text-zinc-950 font-black py-3 rounded-xl active:scale-95 disabled:opacity-50">
            {ocupado ? 'Buscando...' : 'Entrar'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className={caja}>
      <p className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold">Tu avance</p>
      <p className="text-sm text-zinc-300 mt-1">Si ya eres alumno, entra con tu celular para ver en qué fase vas y qué te falta.</p>
      {msg && <p className="text-yellow-500 text-xs mt-2">{msg}</p>}
      <button onClick={() => { setPaso('celular'); setMsg('') }}
        className="mt-3 w-full bg-yellow-400 text-zinc-950 font-black py-3 rounded-xl active:scale-[0.98]">
        Ver mi avance
      </button>
    </div>
  )
}
