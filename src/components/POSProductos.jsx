import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { CATEGORIAS, fmt } from '../posConfig'
import POSModal, { Etiqueta, inputCls, Chips } from './POSModal'

const catLabel = id => CATEGORIAS.find(c => c.id === id)?.label ?? id

export default function POSProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null) // null | {} (nuevo) | producto

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data, error: err } = await supabase.from('productos').select('*').order('categoria').order('nombre')
    if (err) setError('Error al cargar: ' + err.message)
    else setProductos(data)
    setCargando(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-base">Productos</h3>
        <button onClick={() => setEditando({})}
          className="bg-yellow-400 text-zinc-950 font-bold text-sm px-4 py-2 rounded-xl active:scale-95">
          + Nuevo
        </button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {cargando && <p className="text-zinc-500 text-sm">Cargando...</p>}

      {productos.map(p => (
        <button key={p.id} onClick={() => setEditando(p)}
          className={`tap-card flex items-center justify-between gap-3 text-left rounded-2xl border border-zinc-800 p-3
            ${p.activo ? 'bg-zinc-900' : 'bg-zinc-950 opacity-60'}`}>
          <div>
            <p className="text-white text-sm font-bold">{p.nombre}</p>
            <p className="text-zinc-500 text-xs">
              {catLabel(p.categoria)}{!p.activo && <span className="text-red-400 font-bold"> · Oculto</span>}
            </p>
          </div>
          <span className="text-yellow-400 font-black">{fmt(p.precio)}</span>
        </button>
      ))}

      {editando && (
        <EditarProducto producto={editando} onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); cargar() }} />
      )}
    </div>
  )
}

function EditarProducto({ producto, onClose, onSaved }) {
  const nuevo = !producto.id
  const [nombre, setNombre] = useState(producto.nombre ?? '')
  const [categoria, setCategoria] = useState(producto.categoria ?? 'bebida')
  const [precio, setPrecio] = useState(producto.precio ?? '')
  const [activo, setActivo] = useState(producto.activo ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar() {
    const precioNum = parseFloat(precio)
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (isNaN(precioNum) || precioNum < 0) { setError('Precio inválido'); return }
    setGuardando(true)
    setError('')
    const fila = { nombre: nombre.trim(), categoria, precio: precioNum, es_membresia: categoria === 'membresia', activo }
    const q = nuevo
      ? supabase.from('productos').insert(fila).select()
      : supabase.from('productos').update(fila).eq('id', producto.id).select()
    const { data, error: err } = await q
    setGuardando(false)
    if (err) { setError('Error: ' + err.message); return }
    if (!data?.length) { setError('No se guardó por permisos de Supabase.'); return }
    onSaved()
  }

  return (
    <POSModal titulo={nuevo ? 'Nuevo producto' : 'Editar producto'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <Etiqueta>Nombre</Etiqueta>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Vendas 4.5m" className={inputCls} />
        </div>
        <div>
          <Etiqueta>Categoría</Etiqueta>
          <Chips opciones={CATEGORIAS} valor={categoria} onChange={setCategoria} />
          {categoria === 'membresia' && (
            <p className="text-zinc-500 text-xs mt-1">Al venderlo pedirá alumno (alta o renovación).</p>
          )}
        </div>
        <div>
          <Etiqueta>Precio</Etiqueta>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={precio}
            onChange={e => setPrecio(e.target.value)} className={inputCls} />
        </div>
        <label className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-3">
          <span className="text-white text-sm">Visible en Venta</span>
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="w-5 h-5 accent-yellow-400" />
        </label>
        {!nuevo && (
          <p className="text-zinc-500 text-xs">Cambiar el precio no modifica ventas anteriores.</p>
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={guardar} disabled={guardando}
          className="w-full bg-yellow-400 text-zinc-950 font-black py-3 rounded-2xl active:scale-[0.98] disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </POSModal>
  )
}
