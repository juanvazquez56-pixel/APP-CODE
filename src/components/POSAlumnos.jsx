import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { fmt, metodoLabel, traerTodo } from '../posConfig'
import { ESTATUS, calcularVigencia, normalizarTel, formatoTel, textoRestantes } from '../posAlumnos'
import { Etiqueta, inputCls } from './POSModal'

const fecha = d => (d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
const selCls = 'bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs'

function Chip({ estatus }) {
  const e = ESTATUS[estatus]
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
      style={{ backgroundColor: `${e.color}33`, boxShadow: `inset 0 0 0 1px ${e.color}` }}>
      <span style={{ color: e.color }}>{e.icono}</span>{e.label}
    </span>
  )
}

function Contacto({ tel }) {
  const d = normalizarTel(tel)
  if (d.length !== 10) return <span className="text-zinc-600">{tel || '—'}</span>
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <a href={`tel:${d}`} className="text-zinc-300 underline decoration-zinc-700">{formatoTel(d)}</a>
      <a href={`https://wa.me/52${d}`} target="_blank" rel="noopener noreferrer"
        className="text-green-400 font-bold text-[10px] no-print">WhatsApp</a>
    </span>
  )
}

export default function POSAlumnos({ onRenovar }) {
  const [vista, setVista] = useState('directorio')
  const [alumnos, setAlumnos] = useState([])
  const [pagos, setPagos] = useState({})
  const [dias, setDias] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [fichaId, setFichaId] = useState(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    setError('')
    const [a, v, p] = await Promise.all([
      traerTodo(() => supabase.from('alumnos').select('*')),
      traerTodo(() => supabase.from('ventas')
        .select('id, alumno_id, created_at, total, concepto, producto_id, metodo_pago, anulada, anulada_motivo, es_alta')
        .eq('categoria', 'membresia').not('alumno_id', 'is', null)),
      supabase.from('productos').select('*'),
    ])
    const err = a.error || v.error || p.error
    if (err) { setError('Error al cargar: ' + err.message); setCargando(false); return }
    const por = {}
    for (const x of v.data) (por[x.alumno_id] ??= []).push(x)
    setPagos(por)
    setDias(Object.fromEntries(p.data.filter(x => x.dias_vigencia).map(x => [x.id, x.dias_vigencia])))
    setAlumnos(a.data)
    setCargando(false)
  }

  const filas = useMemo(() => alumnos
    .map(a => ({ ...a, estatus: a.estatus ?? 'activo', vig: calcularVigencia(pagos[a.id] ?? [], dias) }))
    .sort((x, y) => x.nombre.localeCompare(y.nombre)), [alumnos, pagos, dias])

  const ficha = fichaId === 'nuevo' ? { id: null, nombre: '', telefono: '', estatus: 'activo', vig: calcularVigencia([]) }
    : filas.find(f => f.id === fichaId)

  if (ficha) {
    return (
      <Ficha alumno={ficha} pagos={pagos[ficha.id] ?? []} todos={filas}
        onVolver={() => setFichaId(null)} onGuardado={id => { cargar(); setFichaId(id) }} onRenovar={onRenovar} />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 no-print">
        {[['directorio', '📇 Directorio'], ['vencimientos', '⏰ Vencimientos']].map(([id, label]) => (
          <button key={id} onClick={() => setVista(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95
              ${vista === id ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            {label}
          </button>
        ))}
        <button onClick={() => setFichaId('nuevo')}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-200 active:scale-95">+ Nuevo alumno</button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {cargando ? <p className="text-zinc-500 text-sm">Cargando...</p>
        : vista === 'directorio' ? <Directorio filas={filas} onAbrir={setFichaId} />
        : <Vencimientos filas={filas} onAbrir={setFichaId} />}
    </div>
  )
}

function Directorio({ filas, onAbrir }) {
  const [q, setQ] = useState('')
  const [estatus, setEstatus] = useState('todos')
  const [verInactivos, setVerInactivos] = useState(false)

  const texto = q.trim().toLowerCase()
  const digitos = normalizarTel(q)
  const lista = filas.filter(f =>
    (verInactivos || f.estatus !== 'inactivo') &&
    (estatus === 'todos' || f.vig.estatus === estatus) &&
    (!texto || f.nombre.toLowerCase().includes(texto) || (digitos.length >= 3 && normalizarTel(f.telefono).includes(digitos))))
  const conteo = Object.fromEntries(Object.keys(ESTATUS).map(k => [k, filas.filter(f => f.vig.estatus === k && f.estatus !== 'inactivo').length]))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input placeholder="Buscar por nombre o celular..." value={q} onChange={e => setQ(e.target.value)}
          className={`${selCls} flex-1 min-w-[180px]`} />
        <select value={estatus} onChange={e => setEstatus(e.target.value)} className={selCls}>
          <option value="todos">Todos los estatus</option>
          {Object.entries(ESTATUS).map(([k, e]) => <option key={k} value={k}>{e.label} ({conteo[k]})</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <input type="checkbox" checked={verInactivos} onChange={e => setVerInactivos(e.target.checked)} className="accent-yellow-400" />
          Ver inactivos
        </label>
      </div>
      <p className="text-zinc-500 text-xs">{lista.length} alumnos</p>
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="w-full min-w-[640px] text-xs">
          <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="text-left font-bold px-2 py-2">Alumno</th>
              <th className="text-left font-bold px-2 py-2">Celular</th>
              <th className="text-left font-bold px-2 py-2">Plan</th>
              <th className="text-left font-bold px-2 py-2">Vence</th>
              <th className="text-left font-bold px-2 py-2">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5} className="px-2 py-4 text-center text-zinc-600">Sin resultados.</td></tr>}
            {lista.map((f, i) => (
              <tr key={f.id} onClick={() => onAbrir(f.id)}
                className={`border-t border-zinc-800/70 cursor-pointer hover:bg-zinc-800/60 ${i % 2 ? 'bg-zinc-900/40' : ''} ${f.estatus === 'inactivo' ? 'opacity-50' : ''}`}>
                <td className="px-2 py-1.5 text-white font-semibold">
                  {f.nombre}{f.estatus === 'inactivo' && <span className="ml-1.5 text-[10px] text-zinc-500 font-bold">INACTIVO</span>}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{f.telefono ? formatoTel(f.telefono) : '—'}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{f.vig.plan ?? '—'}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{fecha(f.vig.vence)}</td>
                <td className="px-2 py-1.5"><Chip estatus={f.vig.estatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Vencimientos({ filas, onAbrir }) {
  const activos = filas.filter(f => f.estatus !== 'inactivo')
  const grupos = [
    { id: 'vencido', titulo: 'Vencidos', orden: (a, b) => b.vig.restantes - a.vig.restantes },
    { id: 'por_vencer', titulo: 'Por vencer (7 días)', orden: (a, b) => a.vig.restantes - b.vig.restantes },
    { id: 'vigente', titulo: 'Vigentes', orden: (a, b) => a.vig.restantes - b.vig.restantes },
  ]
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <p className="text-zinc-500 text-xs flex-1">
          Calculado con los pagos del POS. Los alumnos marcados como inactivos no aparecen aquí.
        </p>
        <button onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold active:scale-95">🖨️ Imprimir / PDF</button>
      </div>
      {grupos.map(g => {
        const lista = activos.filter(f => f.vig.estatus === g.id).sort(g.orden)
        return (
          <section key={g.id} className="flex flex-col gap-2">
            <h4 className="flex items-center gap-2 text-zinc-300 text-xs uppercase tracking-widest font-bold">
              <Chip estatus={g.id} /> {g.titulo} <span className="text-zinc-500">· {lista.length}</span>
            </h4>
            {lista.length === 0 ? <p className="text-zinc-600 text-xs">Nadie.</p> : (
              <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                <table className="w-full min-w-[600px] text-xs">
                  <tbody>
                    {lista.map((f, i) => (
                      <tr key={f.id} className={`border-t border-zinc-800/70 first:border-t-0 ${i % 2 ? 'bg-zinc-900/40' : ''}`}>
                        <td className="px-2 py-1.5">
                          <button onClick={() => onAbrir(f.id)} className="text-white font-semibold text-left hover:underline">{f.nombre}</button>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{f.vig.plan}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{fecha(f.vig.vence)}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-zinc-300 font-bold">{textoRestantes(f.vig.restantes)}</td>
                        <td className="px-2 py-1.5"><Contacto tel={f.telefono} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Ficha({ alumno, pagos, todos, onVolver, onGuardado, onRenovar }) {
  const nuevo = !alumno.id
  const [nombre, setNombre] = useState(alumno.nombre)
  const [telefono, setTelefono] = useState(alumno.telefono ?? '')
  const [estatus, setEstatus] = useState(alumno.estatus)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  const tel = normalizarTel(telefono)
  const compartido = tel.length === 10
    ? todos.filter(f => f.id !== alumno.id && normalizarTel(f.telefono) === tel) : []
  const cambios = nombre.trim() !== alumno.nombre || tel !== normalizarTel(alumno.telefono) || estatus !== alumno.estatus
  const historial = [...pagos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const v = alumno.vig

  async function guardar() {
    if (!nombre.trim()) { setMsg('El nombre es obligatorio'); return }
    if (tel && tel.length !== 10) { setMsg('El celular debe tener 10 dígitos'); return }
    setGuardando(true)
    setMsg('')
    const fila = { nombre: nombre.trim().toUpperCase(), telefono: tel || null, estatus }
    const { data, error } = nuevo
      ? await supabase.from('alumnos').insert(fila).select()
      : await supabase.from('alumnos').update(fila).eq('id', alumno.id).select()
    setGuardando(false)
    if (error) {
      setMsg(/estatus/.test(error.message)
        ? 'Falta correr supabase/pos_alumnos.sql en Supabase.'
        : 'Error: ' + error.message)
      return
    }
    if (!data?.length) { setMsg('No se guardó: tu cuenta no tiene permiso para editar alumnos.'); return }
    onGuardado(data[0].id)
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onVolver} className="text-zinc-500 text-sm text-left no-print">← Alumnos</button>

      {!nuevo && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex-1 min-w-[180px]">
            <p className="text-white font-black text-lg leading-tight">{alumno.nombre}</p>
            <div className="mt-1 flex items-center gap-2"><Chip estatus={v.estatus} />
              {alumno.estatus === 'inactivo' && <span className="text-[10px] font-bold text-zinc-500">INACTIVO</span>}
            </div>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Vence</p>
            <p className="text-white font-bold">{fecha(v.vence)}</p>
            <p className="text-zinc-400 text-xs">{textoRestantes(v.restantes)}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Plan actual</p>
            <p className="text-white font-bold">{v.plan ?? '—'}</p>
          </div>
          {onRenovar && (
            <button onClick={() => onRenovar({ id: alumno.id, nombre: alumno.nombre, telefono: alumno.telefono })}
              className="bg-yellow-400 text-zinc-950 font-black px-5 py-3 rounded-xl active:scale-95 no-print">Renovar</button>
          )}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 no-print">
        <p className="text-white text-sm font-bold">{nuevo ? 'Nuevo alumno' : 'Datos del alumno'}</p>
        <div>
          <Etiqueta>Nombre completo</Etiqueta>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
        </div>
        <div>
          <Etiqueta>Celular (10 dígitos)</Etiqueta>
          <input value={telefono} inputMode="tel" placeholder="442 123 4567" onChange={e => setTelefono(e.target.value)} className={inputCls} />
          {compartido.length > 0 && (
            <p className="text-yellow-500 text-xs mt-1">
              Este celular ya lo tiene: {compartido.map(f => f.nombre).join(', ')}. Si son hermanos está bien; si es la misma persona, no la registres dos veces.
            </p>
          )}
        </div>
        <label className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-3">
          <span className="text-sm text-white">
            Activo <span className="text-zinc-500 text-xs block">Desmárcalo si ya se dio de baja: sale de vencimientos.</span>
          </span>
          <input type="checkbox" checked={estatus === 'activo'} onChange={e => setEstatus(e.target.checked ? 'activo' : 'inactivo')}
            className="w-5 h-5 accent-yellow-400" />
        </label>
        {msg && <p className="text-red-400 text-xs">{msg}</p>}
        <button onClick={guardar} disabled={guardando || (!nuevo && !cambios)}
          className="w-full bg-yellow-400 text-zinc-950 font-black py-3 rounded-2xl active:scale-[0.98] disabled:opacity-40">
          {guardando ? 'Guardando...' : nuevo ? 'Registrar alumno' : 'Guardar cambios'}
        </button>
      </div>

      {!nuevo && (
        <section className="flex flex-col gap-2">
          <h4 className="text-zinc-300 text-xs uppercase tracking-widest font-bold">Historial de membresías · {historial.length}</h4>
          {historial.length === 0 ? <p className="text-zinc-600 text-xs">Sin pagos de membresía registrados.</p> : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden text-xs">
              {historial.map(p => (
                <div key={p.id} className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2 border-t border-zinc-800 first:border-t-0 ${p.anulada ? 'opacity-50' : ''}`}>
                  <span className="text-zinc-400 w-24">{fecha(p.created_at)}</span>
                  <span className={`text-white font-semibold flex-1 ${p.anulada ? 'line-through' : ''}`}>{p.concepto}</span>
                  {p.es_alta === true && <span className="text-[10px] font-bold text-green-400">ALTA</span>}
                  {p.es_alta === false && <span className="text-[10px] font-bold text-blue-400">RENOV</span>}
                  {p.anulada && <span className="text-[10px] font-bold text-red-500" title={p.anulada_motivo ?? ''}>ANULADA</span>}
                  <span className="text-zinc-400">{metodoLabel(p.metodo_pago)}</span>
                  <span className={`text-white font-bold ${p.anulada ? 'line-through' : ''}`}>{fmt(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
