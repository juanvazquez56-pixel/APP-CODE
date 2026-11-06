import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { traerTodo } from '../posConfig'
import { FASES, calcularAvance } from '../rutaAvance'

const selCls = 'bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs'
const FALTA_SQL = 'Falta correr supabase/pos_seguimiento.sql en Supabase.'
const SIN_PERMISO = 'No se guardó: tu cuenta no tiene permiso para evaluar.'

function mensajeError(err) {
  return /does not exist|schema cache|es_kid|progreso_temas|examen_criterios/i.test(err.message)
    ? FALTA_SQL : 'Error: ' + err.message
}

const colorFase = n => FASES.find(f => f.n === n)?.color ?? '#fbbf24'

function Barra({ pct, color = '#fbbf24', alto = 'h-2' }) {
  return (
    <div className={`w-full ${alto} rounded-full bg-zinc-800 overflow-hidden`}>
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function CoachSeguimiento() {
  const [alumnos, setAlumnos] = useState([])
  const [temas, setTemas] = useState([])
  const [criterios, setCriterios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(null)

  useEffect(() => { cargar() }, [])

  async function cargar(silencioso = false) {
    if (!silencioso) setCargando(true)
    const [a, t, c] = await Promise.all([
      traerTodo(() => supabase.from('alumnos').select('id, nombre, es_kid, estatus')),
      traerTodo(() => supabase.from('progreso_temas').select('alumno_id, fase, tema')),
      traerTodo(() => supabase.from('examen_criterios').select('alumno_id, fase, criterio')),
    ])
    const err = a.error || t.error || c.error
    if (err) setError(mensajeError(err))
    else {
      setError('')
      setAlumnos(a.data.filter(x => x.estatus !== 'inactivo'))
      setTemas(t.data)
      setCriterios(c.data)
    }
    setCargando(false)
  }

  const avances = useMemo(() => {
    const m = new Map()
    const dato = id => { let x = m.get(id); if (!x) { x = { temas: [], criterios: [] }; m.set(id, x) } return x }
    temas.forEach(r => dato(r.alumno_id).temas.push([r.fase, r.tema]))
    criterios.forEach(r => dato(r.alumno_id).criterios.push([r.fase, r.criterio]))
    return m
  }, [temas, criterios])

  const filas = useMemo(() => alumnos
    .map(a => ({ ...a, avance: calcularAvance(avances.get(a.id)?.temas, avances.get(a.id)?.criterios) }))
    .sort((x, y) => x.nombre.localeCompare(y.nombre)), [alumnos, avances])

  // Marca o desmarca una casilla (tema o criterio de examen) y la guarda al momento.
  async function alternar(tabla, setLista, fila, estaba) {
    setError('')
    const campo = 'tema' in fila ? 'tema' : 'criterio'
    const mismo = r => r.alumno_id === fila.alumno_id && r.fase === fila.fase && r[campo] === fila[campo]
    if (estaba) {
      setLista(p => p.filter(r => !mismo(r)))
      const { data, error: err } = await supabase.from(tabla).delete().match(fila).select()
      if (err || !data?.length) {
        setLista(p => [...p, fila])
        setError(err ? mensajeError(err) : SIN_PERMISO)
      }
    } else {
      setLista(p => [...p, fila])
      const { data, error: err } = await supabase.from(tabla).insert(fila).select()
      if (err || !data?.length) {
        setLista(p => p.filter(r => !mismo(r)))
        setError(err ? mensajeError(err) : SIN_PERMISO)
      }
    }
  }

  const onTema = (alumno_id, fase, tema, estaba) =>
    alternar('progreso_temas', setTemas, { alumno_id, fase, tema }, estaba)
  const onCriterio = (alumno_id, fase, criterio, estaba) =>
    alternar('examen_criterios', setCriterios, { alumno_id, fase, criterio }, estaba)

  // Para alumnos que ya traen nivel: marca como hechas todas las fases anteriores a la elegida.
  async function ubicar(alumno, destino) {
    if (!confirm(`¿Ubicar a ${alumno.nombre} en la Fase ${destino}? Se marcarán como hechos todos los temas y exámenes de las fases anteriores.`)) return
    setError('')
    const t = []
    const c = []
    FASES.filter(f => f.n < destino).forEach(f => {
      f.temas.forEach((_, i) => t.push({ alumno_id: alumno.id, fase: f.n, tema: i }))
      f.criterios.forEach(x => c.push({ alumno_id: alumno.id, fase: f.n, criterio: x.id }))
    })
    const [a, b] = await Promise.all([
      supabase.from('progreso_temas').upsert(t, { onConflict: 'alumno_id,fase,tema', ignoreDuplicates: true }),
      c.length
        ? supabase.from('examen_criterios').upsert(c, { onConflict: 'alumno_id,fase,criterio', ignoreDuplicates: true })
        : Promise.resolve({ error: null }),
    ])
    if (a.error || b.error) { setError(mensajeError(a.error || b.error)); return }
    await cargar(true)
  }

  const ficha = abierto != null ? filas.find(f => f.id === abierto) : null
  if (ficha) {
    return (
      <Detalle alumno={ficha} error={error}
        onVolver={() => { setAbierto(null); setError('') }}
        onTema={onTema} onCriterio={onCriterio} onUbicar={d => ubicar(ficha, d)} />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-zinc-400 text-xs">
        Busca al alumno y marca lo que ya domina. La barra de cada alumno se llena con los temas y los exámenes.
      </p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {cargando ? <p className="text-zinc-500 text-sm">Cargando...</p> : <Lista filas={filas} onAbrir={setAbierto} />}
    </div>
  )
}

function Lista({ filas, onAbrir }) {
  const [q, setQ] = useState('')
  const [fase, setFase] = useState('todas')
  const texto = q.trim().toLowerCase()
  const lista = filas.filter(f =>
    (fase === 'todas' || f.avance.faseActual === Number(fase)) &&
    (!texto || f.nombre.toLowerCase().includes(texto)))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input placeholder="Buscar alumno por nombre..." value={q} onChange={e => setQ(e.target.value)}
          className={`${selCls} flex-1 min-w-[180px]`} />
        <select value={fase} onChange={e => setFase(e.target.value)} className={selCls}>
          <option value="todas">Todas las fases</option>
          {FASES.map(f => <option key={f.n} value={f.n}>Fase {f.n} · {f.nombre}</option>)}
        </select>
      </div>
      <p className="text-zinc-500 text-xs">{lista.length} alumnos</p>
      <div className="flex flex-col gap-2">
        {lista.length === 0 && <p className="text-zinc-600 text-sm">Sin resultados.</p>}
        {lista.map(f => {
          const color = colorFase(f.avance.faseActual)
          return (
            <button key={f.id} onClick={() => onAbrir(f.id)}
              className="text-left bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-xl p-3 active:scale-[0.99]">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm flex-1 min-w-0 truncate">
                  {f.nombre}
                  {f.es_kid && <span className="ml-1.5 text-[10px] font-bold text-sky-400">KID</span>}
                </span>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color, borderColor: `${color}70`, background: `${color}18` }}>
                  {f.avance.completo ? 'COMPETIDOR ✓' : `FASE ${f.avance.faseActual}`}
                </span>
                <span className="shrink-0 w-10 text-right text-zinc-300 text-xs font-bold">{f.avance.pct}%</span>
              </div>
              <div className="mt-2"><Barra pct={f.avance.pct} color={color} /></div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Detalle({ alumno, error, onVolver, onTema, onCriterio, onUbicar }) {
  const av = alumno.avance
  const [faseVista, setFaseVista] = useState(av.faseActual)
  const [destino, setDestino] = useState(2)
  const f = FASES.find(x => x.n === faseVista)
  const af = av.fases.find(x => x.n === faseVista)

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onVolver} className="text-zinc-500 text-sm text-left">← Alumnos</button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-white font-black text-lg leading-tight">
          {alumno.nombre}
          {alumno.es_kid && <span className="ml-2 text-[10px] font-bold text-sky-400 align-middle">KID</span>}
        </p>
        <p className="text-zinc-400 text-xs mt-0.5">
          {av.completo ? 'Completó la ruta: Competidor' : `Va en Fase ${av.faseActual} · ${FASES.find(x => x.n === av.faseActual).nombre}`}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Barra pct={av.pct} color={colorFase(av.faseActual)} alto="h-3" />
          <span className="text-white font-black text-sm w-11 text-right">{av.pct}%</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {FASES.map(x => {
            const a = av.fases.find(y => y.n === x.n)
            return (
              <div key={x.n}>
                <Barra pct={a.pct} color={x.color} alto="h-1.5" />
                <p className="text-[10px] text-center mt-1 text-zinc-500">{a.aprobada ? '✓' : `${a.pct}%`}</p>
              </div>
            )
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="grid grid-cols-4 gap-1.5">
        {FASES.map(x => (
          <button key={x.n} onClick={() => setFaseVista(x.n)}
            className={`py-2 rounded-xl text-xs font-bold active:scale-95 ${faseVista === x.n ? 'text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
            style={faseVista === x.n ? { background: x.color } : undefined}>
            Fase {x.n}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4" style={{ borderTop: `3px solid ${f.color}` }}>
        <p className="font-display font-bold text-lg uppercase text-white mb-0.5">{f.nombre}</p>
        <p className="text-zinc-500 text-xs mb-3">{af.temasHechos} de {af.temasTotal} temas</p>
        {f.temas.map((t, i) => (
          <div key={i}>
            {(i === 0 || f.temas[i - 1].grupo !== t.grupo) && (
              <p className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold mt-3 mb-1">{t.grupo}</p>
            )}
            <Casilla marcada={av.temaMarcado(f.n, i)} texto={t.texto} color={f.color}
              onChange={() => onTema(alumno.id, f.n, i, av.temaMarcado(f.n, i))} />
          </div>
        ))}

        {f.criterios.length > 0 ? (
          <div className="mt-5 rounded-xl p-3 border border-dashed" style={{ borderColor: `${f.color}88`, background: `${f.color}10` }}>
            <p className="font-bold text-sm uppercase tracking-wide" style={{ color: f.color }}>
              Examen para pasar a la Fase {f.examenPara}
            </p>
            <p className="text-zinc-400 text-xs mb-2">
              {af.aprobada ? '✓ Examen aprobado' : `${af.criteriosHechos} de ${af.criteriosTotal} criterios aprobados`}
            </p>
            {f.criterios.map(c => (
              <Casilla key={c.id} marcada={av.criterioMarcado(f.n, c.id)} color={f.color}
                texto={<><b className="text-zinc-200">{c.etiqueta}: </b>{c.texto}</>}
                onChange={() => onCriterio(alumno.id, f.n, c.id, av.criterioMarcado(f.n, c.id))} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-xs mt-4">
            La Fase 4 no tiene examen: se completa al marcar todos sus temas.
          </p>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-white text-sm font-bold">Ubicar en una fase</p>
        <p className="text-zinc-500 text-xs">
          Para alumnos que ya traen nivel: marca como hechos todos los temas y exámenes de las fases anteriores.
        </p>
        <div className="flex gap-2">
          <select value={destino} onChange={e => setDestino(Number(e.target.value))} className={`${selCls} flex-1`}>
            {FASES.filter(x => x.n > 1).map(x => <option key={x.n} value={x.n}>Fase {x.n} · {x.nombre}</option>)}
          </select>
          <button onClick={() => onUbicar(destino)}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-bold active:scale-95">Aplicar</button>
        </div>
      </div>
    </div>
  )
}

function Casilla({ marcada, texto, color, onChange }) {
  return (
    <label className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0 cursor-pointer">
      <input type="checkbox" checked={marcada} onChange={onChange}
        className="mt-0.5 w-5 h-5 shrink-0" style={{ accentColor: color }} />
      <span className={`text-sm leading-snug ${marcada ? 'text-zinc-500' : 'text-zinc-200'}`}>{texto}</span>
    </label>
  )
}
