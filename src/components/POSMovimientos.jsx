import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { METODOS, METODOS_RETIRO, metodoLabel, fmt, SQL_PENDIENTE } from '../posConfig'
import POSModal, { Etiqueta, inputCls, Chips } from './POSModal'

function hoyISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

const hora = iso => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

export default function POSMovimientos() {
  const [fecha, setFecha] = useState(hoyISO())
  const [tipo, setTipo] = useState('todos')
  const [metodo, setMetodo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [movs, setMovs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [anulando, setAnulando] = useState(null)

  useEffect(() => { cargar() }, [fecha])

  async function cargar() {
    setCargando(true)
    setError('')
    const inicio = new Date(`${fecha}T00:00:00`)
    const fin = new Date(inicio)
    fin.setDate(fin.getDate() + 1)
    const [v, r] = await Promise.all([
      supabase.from('ventas').select('*, alumnos(nombre)')
        .gte('created_at', inicio.toISOString()).lt('created_at', fin.toISOString()),
      supabase.from('retiros').select('*')
        .gte('created_at', inicio.toISOString()).lt('created_at', fin.toISOString()),
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

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-white text-base">Movimientos</h3>

      {/* Filtros */}
      <div className="flex flex-col gap-2">
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
          className={inputCls} style={{ colorScheme: 'dark' }} />
        <input placeholder="Buscar alumno, concepto o beneficiario..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} className={inputCls} />
        <Chips valor={tipo} onChange={setTipo} activoCls="bg-zinc-100 text-zinc-950"
          opciones={[{ id: 'todos', label: 'Todo' }, { id: 'venta', label: 'Ventas' }, { id: 'retiro', label: 'Retiros' }]} />
        <Chips valor={metodo} onChange={setMetodo} activoCls="bg-zinc-100 text-zinc-950"
          opciones={[{ id: 'todos', label: 'Todos los métodos' }, ...METODOS]} />
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <p className="text-zinc-500 text-xs">Vendido</p>
          <p className="text-green-400 font-black text-lg">{fmt(vendido)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <p className="text-zinc-500 text-xs">Retirado</p>
          <p className="text-red-400 font-black text-lg">{fmt(retirado)}</p>
        </div>
      </div>
      {porMetodo.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
          {porMetodo.map(m => <span key={m.id}>{m.label}: <b className="text-white">{fmt(m.total)}</b></span>)}
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {cargando && <p className="text-zinc-500 text-sm">Cargando...</p>}
      {!cargando && filtrados.length === 0 && <p className="text-zinc-600 text-sm">Sin movimientos.</p>}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtrados.map(m => (
          <div key={`${m._tipo}-${m.id}`}
            className={`rounded-2xl border p-3 ${m.anulada ? 'border-zinc-800 bg-zinc-950 opacity-60' : 'border-zinc-800 bg-zinc-900'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="text-zinc-500 text-xs">{hora(m.created_at)}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                    ${m._tipo === 'venta' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {m._tipo === 'venta' ? 'Venta' : m.tipo === 'nomina' ? 'Nómina' : 'Gasto'}
                  </span>
                  {m.es_alta === true && <span className="text-[10px] font-bold text-green-400">🆕 Alta</span>}
                  {m.es_alta === false && <span className="text-[10px] font-bold text-blue-400">🔄 Renovación</span>}
                  {m.anulada && <span className="text-[10px] font-bold uppercase text-red-500">Anulada</span>}
                </div>
                <p className={`text-white text-sm font-bold ${m.anulada ? 'line-through' : ''}`}>
                  {m.concepto}{m._tipo === 'venta' && m.cantidad > 1 ? ` ×${m.cantidad}` : ''}
                </p>
                {m._quien && <p className="text-zinc-400 text-xs">{m._quien}</p>}
                <p className="text-zinc-600 text-xs">
                  {metodoLabel(m.metodo_pago)}{m.usuario_email ? ` · ${m.usuario_email}` : ''}
                </p>
                {m.updated_at && !m.anulada && (
                  <p className="text-yellow-600 text-xs">Editado {hora(m.updated_at)}{m.editado_por ? ` por ${m.editado_por}` : ''}</p>
                )}
                {m.anulada && m.anulada_motivo && <p className="text-red-400/80 text-xs">Motivo: {m.anulada_motivo}</p>}
              </div>
              <p className={`font-black shrink-0 ${m._tipo === 'venta' ? 'text-green-400' : 'text-red-400'} ${m.anulada ? 'line-through' : ''}`}>
                {m._tipo === 'retiro' ? '−' : ''}{fmt(m._monto)}
              </p>
            </div>
            {!m.anulada && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setEditando(m)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold active:scale-95">Editar</button>
                <button onClick={() => setAnulando(m)}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold active:scale-95">Anular</button>
              </div>
            )}
          </div>
        ))}
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
