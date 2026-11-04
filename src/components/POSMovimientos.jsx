import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { METODOS, METODOS_RETIRO, metodoLabel, fmt, SQL_PENDIENTE } from '../posConfig'
import POSModal, { Etiqueta, inputCls, Chips } from './POSModal'

function iso(d) {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}

function rangoRapido(id) {
  const hoy = new Date()
  const y = hoy.getFullYear(), m = hoy.getMonth()
  if (id === 'hoy') return [iso(hoy), iso(hoy)]
  if (id === 'semana') {
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    return [iso(lunes), iso(hoy)]
  }
  if (id === 'mes') return [iso(new Date(y, m, 1)), iso(hoy)]
  return [iso(new Date(y, m - 1, 1)), iso(new Date(y, m, 0))]
}

const RAPIDOS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'mespasado', label: 'Mes pasado' },
]

const hora = iso => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
const dia = iso => new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })

// Supabase devuelve máximo 1000 filas por consulta: se pide por páginas.
async function traerTodo(consulta) {
  const filas = []
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await consulta().order('id').range(desde, desde + 999)
    if (error) return { error }
    filas.push(...data)
    if (data.length < 1000) return { data: filas }
  }
}

export default function POSMovimientos({ puedeEditar = true }) {
  const [[desde, hasta], setRango] = useState(rangoRapido('hoy'))
  const [tipo, setTipo] = useState('todos')
  const [metodo, setMetodo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [verAnuladas, setVerAnuladas] = useState(true)
  const [movs, setMovs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [anulando, setAnulando] = useState(null)

  useEffect(() => { cargar() }, [desde, hasta])

  function cambiarFecha(campo, valor) {
    if (!valor) return
    let d = campo === 'desde' ? valor : desde
    let h = campo === 'hasta' ? valor : hasta
    if (d > h) [d, h] = campo === 'desde' ? [d, d] : [h, h]
    setRango([d, h])
  }

  async function cargar() {
    setCargando(true)
    setError('')
    const inicio = new Date(`${desde}T00:00:00`).toISOString()
    const finD = new Date(`${hasta}T00:00:00`)
    finD.setDate(finD.getDate() + 1)
    const fin = finD.toISOString()
    const [v, r] = await Promise.all([
      traerTodo(() => supabase.from('ventas').select('*, alumnos(nombre)').gte('created_at', inicio).lt('created_at', fin)),
      traerTodo(() => supabase.from('retiros').select('*').gte('created_at', inicio).lt('created_at', fin)),
    ])
    if (v.error || r.error) {
      setError('Error al cargar: ' + (v.error || r.error).message)
      setCargando(false)
      return
    }
    setMovs([
      ...v.data.map(x => ({ ...x, _tipo: 'venta', _monto: Number(x.total), _quien: x.alumnos?.nombre })),
      ...r.data.map(x => ({ ...x, _tipo: 'retiro', _monto: Number(x.monto), _quien: x.beneficiario })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setCargando(false)
  }

  const q = busqueda.trim().toLowerCase()
  const filtrados = movs.filter(m =>
    (verAnuladas || !m.anulada) &&
    (tipo === 'todos' || m._tipo === tipo) &&
    (metodo === 'todos' || m.metodo_pago === metodo) &&
    (!q || [m.concepto, m._quien].some(s => s?.toLowerCase().includes(q))))

  const validos = filtrados.filter(m => !m.anulada)
  const suma = arr => arr.reduce((s, m) => s + m._monto, 0)
  const vendido = suma(validos.filter(m => m._tipo === 'venta'))
  const retirado = suma(validos.filter(m => m._tipo === 'retiro'))
  const porMetodo = METODOS
    .map(mt => ({ ...mt, total: suma(validos.filter(m => m._tipo === 'venta' && m.metodo_pago === mt.id)) }))
    .filter(x => x.total > 0)
  const rapidoActivo = RAPIDOS.find(r => { const [d, h] = rangoRapido(r.id); return d === desde && h === hasta })?.id

  const selCls = 'bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs'

  return (
    <div className="flex flex-col gap-3">
      {/* Rango de fechas */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Desde</span>
          <input type="date" value={desde} max={hasta} onChange={e => cambiarFecha('desde', e.target.value)}
            className={selCls} style={{ colorScheme: 'dark' }} />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Hasta</span>
          <input type="date" value={hasta} min={desde} onChange={e => cambiarFecha('hasta', e.target.value)}
            className={selCls} style={{ colorScheme: 'dark' }} />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RAPIDOS.map(r => (
            <button key={r.id} onClick={() => setRango(rangoRapido(r.id))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95
                ${rapidoActivo === r.id ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <input placeholder="Buscar alumno, concepto..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} className={`${selCls} flex-1 min-w-[160px]`} />
        <select value={tipo} onChange={e => setTipo(e.target.value)} className={selCls}>
          <option value="todos">Ventas y retiros</option>
          <option value="venta">Solo ventas</option>
          <option value="retiro">Solo retiros</option>
        </select>
        <select value={metodo} onChange={e => setMetodo(e.target.value)} className={selCls}>
          <option value="todos">Todos los métodos</option>
          {METODOS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <input type="checkbox" checked={verAnuladas} onChange={e => setVerAnuladas(e.target.checked)}
            className="accent-yellow-400" />
          Ver anuladas
        </label>
      </div>

      {/* Totales */}
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
        <span className="text-zinc-400">Vendido <b className="text-green-400 text-sm">{fmt(vendido)}</b></span>
        <span className="text-zinc-400">Retirado <b className="text-red-400 text-sm">{fmt(retirado)}</b></span>
        <span className="text-zinc-400">Neto <b className="text-white text-sm">{fmt(vendido - retirado)}</b></span>
        <span className="text-zinc-600">|</span>
        {porMetodo.map(m => <span key={m.id} className="text-zinc-500">{m.label} <b className="text-zinc-300">{fmt(m.total)}</b></span>)}
        <span className="text-zinc-600 ml-auto">{filtrados.length} movimientos</span>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Tabla */}
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="w-full min-w-[760px] text-xs">
          <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="text-left font-bold px-2 py-2">Fecha</th>
              <th className="text-left font-bold px-2 py-2">Hora</th>
              <th className="text-left font-bold px-2 py-2">Tipo</th>
              <th className="text-left font-bold px-2 py-2">Concepto</th>
              <th className="text-left font-bold px-2 py-2">Alumno / Beneficiario</th>
              <th className="text-left font-bold px-2 py-2">Método</th>
              <th className="text-right font-bold px-2 py-2">Monto</th>
              <th className="text-left font-bold px-2 py-2">Capturó</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan={9} className="px-2 py-4 text-center text-zinc-500">Cargando...</td></tr>
            )}
            {!cargando && filtrados.length === 0 && (
              <tr><td colSpan={9} className="px-2 py-4 text-center text-zinc-600">Sin movimientos en este rango.</td></tr>
            )}
            {!cargando && filtrados.map((m, i) => (
              <tr key={`${m._tipo}-${m.id}`}
                className={`border-t border-zinc-800/70 ${i % 2 ? 'bg-zinc-900/40' : ''} ${m.anulada ? 'opacity-45' : ''}`}>
                <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{dia(m.created_at)}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{hora(m.created_at)}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                    ${m._tipo === 'venta' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {m._tipo === 'venta' ? 'Venta' : m.tipo === 'nomina' ? 'Nómina' : 'Gasto'}
                  </span>
                </td>
                <td className="px-2 py-1.5 max-w-[240px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`truncate text-white font-semibold ${m.anulada ? 'line-through' : ''}`} title={m.concepto}>
                      {m.concepto}{m._tipo === 'venta' && m.cantidad > 1 ? ` ×${m.cantidad}` : ''}
                    </span>
                    {m.es_alta === true && <span className="shrink-0 text-[10px] font-bold text-green-400">ALTA</span>}
                    {m.es_alta === false && <span className="shrink-0 text-[10px] font-bold text-blue-400">RENOV</span>}
                    {m.anulada && (
                      <span className="shrink-0 text-[10px] font-bold text-red-500" title={m.anulada_motivo ?? ''}>ANULADA</span>
                    )}
                    {m.updated_at && !m.anulada && (
                      <span className="shrink-0 text-yellow-600" title={`Editado ${dia(m.updated_at)} ${hora(m.updated_at)}${m.editado_por ? ` por ${m.editado_por}` : ''}`}>✎</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1.5 max-w-[200px] truncate text-zinc-400" title={m._quien ?? ''}>{m._quien ?? '—'}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-zinc-400">{metodoLabel(m.metodo_pago)}</td>
                <td className={`px-2 py-1.5 whitespace-nowrap text-right font-bold
                  ${m._tipo === 'venta' ? 'text-green-400' : 'text-red-400'} ${m.anulada ? 'line-through' : ''}`}>
                  {m._tipo === 'retiro' ? '−' : ''}{fmt(m._monto)}
                </td>
                <td className="px-2 py-1.5 max-w-[140px] truncate text-zinc-600" title={m.usuario_email ?? ''}>
                  {m.usuario_email?.split('@')[0] ?? '—'}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-right">
                  {!m.anulada && puedeEditar && (
                    <>
                      <button onClick={() => setEditando(m)} title="Editar"
                        className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 font-bold active:scale-95">Editar</button>
                      <button onClick={() => setAnulando(m)} title="Anular"
                        className="ml-1 px-2 py-1 rounded-md bg-red-500/10 text-red-400 font-bold active:scale-95">Anular</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && <EditarMov mov={editando} onClose={() => setEditando(null)} onSaved={() => { setEditando(null); cargar() }} />}
      {anulando && <AnularMov mov={anulando} onClose={() => setAnulando(null)} onSaved={() => { setAnulando(null); cargar() }} />}
    </div>
  )
}

function EditarMov({ mov, onClose, onSaved }) {
  const esVenta = mov._tipo === 'venta'
  const [f, setF] = useState({
    concepto: mov.concepto,
    cantidad: mov.cantidad ?? 1,
    precio_unit: mov.precio_unit ?? '',
    tipo: mov.tipo,
    beneficiario: mov.beneficiario ?? '',
    monto: mov.monto ?? '',
    metodo_pago: mov.metodo_pago,
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  async function guardar() {
    if (!f.concepto.trim()) { setError('El concepto es obligatorio'); return }
    let cambios
    if (esVenta) {
      const cant = parseInt(f.cantidad, 10)
      const precio = parseFloat(f.precio_unit)
      if (!(cant > 0) || !(precio >= 0)) { setError('Cantidad o precio inválido'); return }
      cambios = { concepto: f.concepto.trim(), cantidad: cant, precio_unit: precio, total: cant * precio, metodo_pago: f.metodo_pago }
    } else {
      const monto = parseFloat(f.monto)
      if (!(monto > 0)) { setError('Monto inválido'); return }
      cambios = { tipo: f.tipo, concepto: f.concepto.trim(), beneficiario: f.beneficiario.trim() || null, monto, metodo_pago: f.metodo_pago }
    }
    setGuardando(true)
    setError('')
    const { data, error: err } = await supabase.from(esVenta ? 'ventas' : 'retiros')
      .update(cambios).eq('id', mov.id).select()
    setGuardando(false)
    if (err) { setError('Error: ' + err.message); return }
    if (!data?.length) { setError(SQL_PENDIENTE); return }
    onSaved()
  }

  return (
    <POSModal titulo={esVenta ? 'Editar venta' : 'Editar retiro'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-zinc-500 text-xs">
          Registrado: {new Date(mov.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })} (no se puede cambiar)
        </p>
        {!esVenta && (
          <div>
            <Etiqueta>Tipo</Etiqueta>
            <Chips valor={f.tipo} onChange={v => set('tipo', v)} activoCls="bg-red-500 text-white"
              opciones={[{ id: 'nomina', label: 'Nómina' }, { id: 'gasto', label: 'Gasto' }]} />
          </div>
        )}
        <div>
          <Etiqueta>Concepto</Etiqueta>
          <input value={f.concepto} onChange={e => set('concepto', e.target.value)} className={inputCls} />
        </div>
        {esVenta ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Etiqueta>Cantidad</Etiqueta>
              <input type="number" min="1" inputMode="numeric" value={f.cantidad}
                onChange={e => set('cantidad', e.target.value)} className={inputCls} />
            </div>
            <div>
              <Etiqueta>Precio unitario</Etiqueta>
              <input type="number" min="0" step="0.01" inputMode="decimal" value={f.precio_unit}
                onChange={e => set('precio_unit', e.target.value)} className={inputCls} />
            </div>
          </div>
        ) : (
          <>
            <div>
              <Etiqueta>Beneficiario</Etiqueta>
              <input value={f.beneficiario} onChange={e => set('beneficiario', e.target.value)} className={inputCls} />
            </div>
            <div>
              <Etiqueta>Monto</Etiqueta>
              <input type="number" min="0" step="0.01" inputMode="decimal" value={f.monto}
                onChange={e => set('monto', e.target.value)} className={inputCls} />
            </div>
          </>
        )}
        <div>
          <Etiqueta>Método de pago</Etiqueta>
          <Chips valor={f.metodo_pago} onChange={v => set('metodo_pago', v)}
            opciones={esVenta ? METODOS : METODOS_RETIRO} />
        </div>
        {esVenta && (
          <p className="text-zinc-400 text-sm">
            Nuevo total: <b className="text-white">{fmt((parseInt(f.cantidad, 10) || 0) * (parseFloat(f.precio_unit) || 0))}</b>
          </p>
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={guardar} disabled={guardando}
          className="w-full bg-yellow-400 text-zinc-950 font-black py-3 rounded-2xl active:scale-[0.98] disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </POSModal>
  )
}

function AnularMov({ mov, onClose, onSaved }) {
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function anular() {
    if (!motivo.trim()) { setError('Escribe el motivo'); return }
    setGuardando(true)
    setError('')
    const { data, error: err } = await supabase.from(mov._tipo === 'venta' ? 'ventas' : 'retiros')
      .update({ anulada: true, anulada_motivo: motivo.trim() }).eq('id', mov.id).select()
    setGuardando(false)
    if (err) { setError('Error: ' + err.message); return }
    if (!data?.length) { setError(SQL_PENDIENTE); return }
    onSaved()
  }

  return (
    <POSModal titulo="Anular movimiento" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
          <p className="text-white text-sm font-bold">{mov.concepto}</p>
          <p className="text-zinc-400 text-xs">{fmt(mov._monto)} · {metodoLabel(mov.metodo_pago)}</p>
        </div>
        <p className="text-zinc-400 text-xs">
          No se borra: queda en el historial marcado como anulado y deja de contar en totales y corte. No se puede deshacer.
        </p>
        <div>
          <Etiqueta>Motivo *</Etiqueta>
          <textarea rows={2} value={motivo} onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: capturado dos veces" className={inputCls} />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={anular} disabled={guardando}
          className="w-full bg-red-500 text-white font-black py-3 rounded-2xl active:scale-[0.98] disabled:opacity-50">
          {guardando ? 'Anulando...' : 'Anular'}
        </button>
      </div>
    </POSModal>
  )
}
