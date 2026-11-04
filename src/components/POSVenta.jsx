import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { METODOS, metodoLabel } from '../posConfig'
const CATEGORIAS = ['todos', 'membresia', 'pase', 'bebida', 'equipo']

export default function POSVenta() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [paso, setPaso] = useState('catalogo') // catalogo | detalle | alumno | confirmado
  const [productoSel, setProductoSel] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [metodo, setMetodo] = useState('efectivo')
  const [alumnos, setAlumnos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [alumnoSel, setAlumnoSel] = useState(null)
  const [nuevoAlumno, setNuevoAlumno] = useState({ nombre: '', telefono: '' })
  const [modoAlumno, setModoAlumno] = useState('buscar') // buscar | nuevo
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [ultimaVenta, setUltimaVenta] = useState(null)

  useEffect(() => { cargarProductos() }, [])

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').eq('activo', true).order('categoria').order('nombre')
    if (data) setProductos(data)
    setCargando(false)
  }

  async function cargarAlumnos(q) {
    if (!q || q.length < 2) { setAlumnos([]); return }
    const { data } = await supabase.from('alumnos').select('id, nombre, telefono')
      .ilike('nombre', `%${q}%`).limit(10)
    if (data) setAlumnos(data)
  }

  function seleccionarProducto(p) {
    setProductoSel(p)
    setCantidad(1)
    setMetodo('efectivo')
    setAlumnoSel(null)
    setBusqueda('')
    setAlumnos([])
    setNuevoAlumno({ nombre: '', telefono: '' })
    setModoAlumno('buscar')
    setError('')
    setPaso('detalle')
  }

  function irAAlumno() {
    if (!metodo) { setError('Selecciona método de pago'); return }
    setError('')
    setPaso('alumno')
  }

  async function confirmarVenta() {
    setGuardando(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()

    let alumnoId = null
    let esAlta = null

    if (productoSel.es_membresia) {
      if (modoAlumno === 'nuevo') {
        if (!nuevoAlumno.nombre.trim()) { setError('El nombre del alumno es obligatorio'); setGuardando(false); return }
        const { data: a, error: ea } = await supabase.from('alumnos').insert({
          nombre: nuevoAlumno.nombre.trim(),
          telefono: nuevoAlumno.telefono.trim() || null,
        }).select().single()
        if (ea) { setError('Error al crear alumno: ' + ea.message); setGuardando(false); return }
        alumnoId = a.id
        esAlta = true
      } else {
        if (!alumnoSel) { setError('Selecciona o registra un alumno'); setGuardando(false); return }
        alumnoId = alumnoSel.id
        esAlta = false
      }
    }

    const total = productoSel.precio * cantidad
    const { data: v, error: ev } = await supabase.from('ventas').insert({
      producto_id: productoSel.id,
      concepto: productoSel.nombre,
      categoria: productoSel.categoria,
      cantidad,
      precio_unit: productoSel.precio,
      total,
      metodo_pago: metodo,
      alumno_id: alumnoId,
      es_alta: esAlta,
      usuario_id: user.id,
    }).select().single()

    if (ev) { setError('Error al guardar: ' + ev.message); setGuardando(false); return }

    setUltimaVenta({ ...v, producto: productoSel, alumno: alumnoSel || (modoAlumno === 'nuevo' ? nuevoAlumno : null) })
    setPaso('confirmado')
    setGuardando(false)
  }

  function nuevaVenta() {
    setProductoSel(null)
    setUltimaVenta(null)
    setPaso('catalogo')
  }

  const productosFiltrados = categoriaFiltro === 'todos'
    ? productos
    : productos.filter(p => p.categoria === categoriaFiltro)

  // ── CATÁLOGO ──────────────────────────────────────────────
  if (paso === 'catalogo') return (
    <div>
      <h3 className="font-bold text-white text-base mb-3">Venta</h3>
      {cargando && <p className="text-zinc-500 text-sm">Cargando productos...</p>}

      {/* filtro categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCategoriaFiltro(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all
              ${categoriaFiltro === c ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            {c === 'todos' ? 'Todos' : c === 'membresia' ? 'Membresías' : c === 'pase' ? 'Pase/Visita' : c === 'bebida' ? 'Bebidas' : 'Equipo'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {productosFiltrados.map(p => (
          <button key={p.id} onClick={() => seleccionarProducto(p)}
            className="tap-card flex flex-col items-start gap-1 bg-zinc-900 border border-zinc-800
              hover:border-yellow-500/40 rounded-2xl p-4 text-left active:scale-[0.97] transition-all">
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">{p.categoria}</span>
            <span className="text-sm font-bold text-white leading-tight">{p.nombre}</span>
            <span className="text-yellow-400 font-black text-lg mt-1">${Number(p.precio).toLocaleString('es-MX')}</span>
          </button>
        ))}
      </div>

      {!cargando && productosFiltrados.length === 0 && (
        <p className="text-zinc-600 text-sm mt-4">No hay productos en esta categoría.</p>
      )}
    </div>
  )

  // ── DETALLE ───────────────────────────────────────────────
  if (paso === 'detalle') return (
    <div>
      <button onClick={() => setPaso('catalogo')} className="text-zinc-500 text-sm mb-4">← Catálogo</button>
      <h3 className="font-bold text-white text-lg">{productoSel.nombre}</h3>
      <p className="text-yellow-400 font-black text-2xl mb-5">${Number(productoSel.precio).toLocaleString('es-MX')}</p>

      {/* Cantidad */}
      <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block">Cantidad</label>
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
          className="w-10 h-10 rounded-xl bg-zinc-800 text-white font-bold text-xl flex items-center justify-center active:scale-95 transition-all">−</button>
        <span className="text-white font-black text-2xl w-8 text-center">{cantidad}</span>
        <button onClick={() => setCantidad(c => c + 1)}
          className="w-10 h-10 rounded-xl bg-zinc-800 text-white font-bold text-xl flex items-center justify-center active:scale-95 transition-all">+</button>
      </div>

      {/* Método de pago */}
      <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block">Método de pago</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {METODOS.map(m => (
          <button key={m.id} onClick={() => setMetodo(m.id)}
            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95
              ${metodo === m.id ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="border-t border-zinc-800 pt-4 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Total</span>
          <span className="text-white font-black text-lg">${(productoSel.precio * cantidad).toLocaleString('es-MX')}</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button onClick={productoSel.es_membresia ? irAAlumno : confirmarVenta}
        disabled={guardando}
        className="w-full bg-yellow-400 text-zinc-950 font-black py-4 rounded-2xl text-base active:scale-[0.98] transition-all disabled:opacity-50">
        {productoSel.es_membresia ? 'Siguiente → Alumno' : guardando ? 'Guardando...' : 'Confirmar venta'}
      </button>
    </div>
  )

  // ── ALUMNO (solo para membresías) ─────────────────────────
  if (paso === 'alumno') return (
    <div>
      <button onClick={() => setPaso('detalle')} className="text-zinc-500 text-sm mb-4">← Volver</button>
      <h3 className="font-bold text-white text-base mb-1">¿Alumno nuevo o existente?</h3>
      <p className="text-zinc-500 text-xs mb-4">Membresía: {productoSel.nombre}</p>

      <div className="flex gap-2 mb-4">
        {['buscar', 'nuevo'].map(m => (
          <button key={m} onClick={() => setModoAlumno(m)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all
              ${modoAlumno === m ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            {m === 'buscar' ? 'Alumno existente' : 'Alumno nuevo'}
          </button>
        ))}
      </div>

      {modoAlumno === 'buscar' && (
        <div>
          <input
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); cargarAlumnos(e.target.value) }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm mb-2"
          />
          {alumnos.map(a => (
            <button key={a.id} onClick={() => setAlumnoSel(a)}
              className={`w-full text-left p-3 rounded-xl mb-2 border transition-all
                ${alumnoSel?.id === a.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-zinc-800 bg-zinc-900'}`}>
              <p className="text-white text-sm font-bold">{a.nombre}</p>
              {a.telefono && <p className="text-zinc-500 text-xs">{a.telefono}</p>}
            </button>
          ))}
          {busqueda.length >= 2 && alumnos.length === 0 && (
            <p className="text-zinc-600 text-xs">Sin resultados. ¿Alumno nuevo?</p>
          )}
        </div>
      )}

      {modoAlumno === 'nuevo' && (
        <div className="flex flex-col gap-3">
          <input
            placeholder="Nombre completo *"
            value={nuevoAlumno.nombre}
            onChange={e => setNuevoAlumno(n => ({ ...n, nombre: e.target.value }))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm"
          />
          <input
            placeholder="Teléfono (opcional)"
            value={nuevoAlumno.telefono}
            onChange={e => setNuevoAlumno(n => ({ ...n, telefono: e.target.value }))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm"
          />
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

      <button onClick={confirmarVenta} disabled={guardando}
        className="w-full bg-yellow-400 text-zinc-950 font-black py-4 rounded-2xl text-base mt-5 active:scale-[0.98] transition-all disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Confirmar venta'}
      </button>
    </div>
  )

  // ── CONFIRMADO ────────────────────────────────────────────
  if (paso === 'confirmado') return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="font-black text-white text-xl mb-1">¡Venta registrada!</h3>
      <p className="text-yellow-400 font-bold text-2xl mb-1">${(ultimaVenta.total).toLocaleString('es-MX')}</p>
      <p className="text-zinc-400 text-sm mb-1">{ultimaVenta.concepto} · {metodoLabel(ultimaVenta.metodo_pago)}</p>
      {ultimaVenta.es_alta === true && <p className="text-green-400 text-xs font-bold mt-1">🆕 Alta nueva</p>}
      {ultimaVenta.es_alta === false && <p className="text-blue-400 text-xs font-bold mt-1">🔄 Renovación</p>}
      <button onClick={nuevaVenta}
        className="mt-8 bg-zinc-800 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-all">
        Nueva venta
      </button>
    </div>
  )

  return null
}
