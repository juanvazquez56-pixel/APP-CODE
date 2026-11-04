import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PERMISOS, METAS_CAMPOS, CONCEPTOS_COSTO, fmt } from '../posConfig'
import { Etiqueta, inputCls } from './POSModal'

const SIN_PERMISO = 'No se guardó: solo la cuenta admin puede cambiar esto. Si eres admin, revisa que hayas corrido supabase/pos_roles.sql.'

export default function POSAjustes({ onPermisosCambiados }) {
  const [seccion, setSeccion] = useState('permisos')
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[['permisos', '👥 Permisos de recepción'], ['metas', '🎯 Metas'], ['costos', '🏠 Costos fijos']].map(([id, label]) => (
          <button key={id} onClick={() => setSeccion(id)}
            className={`shrink-0 px-3 py-2 rounded-xl font-bold text-sm whitespace-nowrap active:scale-95
              ${seccion === id ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
            {label}
          </button>
        ))}
      </div>
      {seccion === 'permisos' && <Permisos onGuardado={onPermisosCambiados} />}
      {seccion === 'metas' && <Metas />}
      {seccion === 'costos' && <CostosFijos />}
    </div>
  )
}

function useConfig(clave) {
  const [valor, setValor] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    supabase.from('pos_config').select('valor').eq('clave', clave).maybeSingle().then(({ data, error: err }) => {
      if (err) setError('Error al cargar: ' + err.message)
      else setValor(data?.valor ?? {})
    })
  }, [clave])
  async function guardar(nuevo) {
    const { data, error: err } = await supabase.from('pos_config')
      .update({ valor: nuevo, updated_at: new Date().toISOString() }).eq('clave', clave).select()
    if (err) return 'Error: ' + err.message
    if (!data?.length) return SIN_PERMISO
    setValor(nuevo)
    return null
  }
  return { valor, setValor, error, guardar }
}

function Permisos({ onGuardado }) {
  const { valor, setValor, error, guardar } = useConfig('permisos_recepcion')
  const [msg, setMsg] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function onGuardar() {
    setGuardando(true)
    const err = await guardar(valor)
    setGuardando(false)
    setMsg(err ?? '✓ Permisos guardados')
    if (!err) onGuardado?.()
  }

  if (error) return <p className="text-red-400 text-xs">{error}</p>
  if (!valor) return <p className="text-zinc-500 text-sm">Cargando...</p>

  return (
    <div className="flex flex-col gap-4">
      <p className="text-zinc-400 text-xs">
        Elige qué puede hacer la cuenta de <b className="text-white">recepción</b>. La cuenta admin siempre puede todo.
        Para crear la cuenta de recepción: Supabase → Authentication → Add user.
      </p>
      {PERMISOS.map(g => (
        <div key={g.grupo}>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">{g.grupo}</p>
          <div className="flex flex-col divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
            {g.items.map(p => (
              <label key={p.id} className="flex items-center justify-between gap-3 bg-zinc-900 px-3 py-2.5">
                <span className="text-sm text-white">{p.label}</span>
                <input type="checkbox" checked={!!valor[p.id]}
                  onChange={e => { setValor({ ...valor, [p.id]: e.target.checked }); setMsg('') }}
                  className="w-5 h-5 accent-yellow-400" />
              </label>
            ))}
          </div>
        </div>
      ))}
      {valor.movimientos && (
        <p className="text-yellow-600 text-xs">Con "Ver movimientos" activo, recepción también ve la nómina registrada.</p>
      )}
      {msg && <p className={`text-xs ${msg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
      <button onClick={onGuardar} disabled={guardando}
        className="w-full bg-yellow-400 text-zinc-950 font-black py-3 rounded-2xl active:scale-[0.98] disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar permisos'}
      </button>
    </div>
  )
}

function Metas() {
  const { valor, setValor, error, guardar } = useConfig('metas')
  const [msg, setMsg] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function onGuardar() {
    const limpio = {}
    for (const c of METAS_CAMPOS) {
      const n = parseFloat(valor[c.id])
      if (isNaN(n) || n < 0) { setMsg(`Valor inválido en "${c.label}"`); return }
      limpio[c.id] = n
    }
    if (limpio.nomina_verde > limpio.nomina_rojo) { setMsg('Nómina: el verde debe ser menor o igual que el rojo'); return }
    if (limpio.margen_rojo > limpio.margen_verde) { setMsg('Margen: el rojo debe ser menor o igual que el verde'); return }
    setGuardando(true)
    const err = await guardar(limpio)
    setGuardando(false)
    setMsg(err ?? '✓ Metas guardadas')
  }

  if (error) return <p className="text-red-400 text-xs">{error}</p>
  if (!valor) return <p className="text-zinc-500 text-sm">Cargando...</p>

  return (
    <div className="flex flex-col gap-3">
      <p className="text-zinc-400 text-xs">Se usan en los reportes para pintar los semáforos (verde / amarillo / rojo).</p>
      {METAS_CAMPOS.map(c => (
        <div key={c.id}>
          <Etiqueta>{c.label}</Etiqueta>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{c.sufijo}</span>
            <input type="number" min="0" step="any" inputMode="decimal" value={valor[c.id] ?? ''}
              onChange={e => { setValor({ ...valor, [c.id]: e.target.value }); setMsg('') }}
              className={`${inputCls} pl-8`} />
          </div>
        </div>
      ))}
      {msg && <p className={`text-xs ${msg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
      <button onClick={onGuardar} disabled={guardando}
        className="w-full bg-yellow-400 text-zinc-950 font-black py-3 rounded-2xl active:scale-[0.98] disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Guardar metas'}
      </button>
    </div>
  )
}

function mesActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function CostosFijos() {
  const [mes, setMes] = useState(mesActual())
  const [filas, setFilas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id: null, concepto: 'renta', monto: '', nota: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [mes])

  async function cargar() {
    setCargando(true)
    setError('')
    const { data, error: err } = await supabase.from('costos_fijos').select('*').eq('mes', `${mes}-01`).order('id')
    if (err) setError('Error al cargar: ' + err.message)
    else setFilas(data)
    setCargando(false)
  }

  async function guardar() {
    const monto = parseFloat(form.monto)
    if (isNaN(monto) || monto < 0) { setError('Monto inválido'); return }
    setGuardando(true)
    setError('')
    const fila = { mes: `${mes}-01`, concepto: form.concepto, monto, nota: form.nota.trim() || null }
    const { data, error: err } = form.id
      ? await supabase.from('costos_fijos').update(fila).eq('id', form.id).select()
      : await supabase.from('costos_fijos').insert(fila).select()
    setGuardando(false)
    if (err) { setError('Error: ' + err.message); return }
    if (!data?.length) { setError(SIN_PERMISO); return }
    setForm({ id: null, concepto: 'renta', monto: '', nota: '' })
    cargar()
  }

  async function borrar(f) {
    if (!confirm(`¿Borrar ${f.concepto} de ${fmt(f.monto)}?`)) return
    const { data, error: err } = await supabase.from('costos_fijos').delete().eq('id', f.id).select()
    if (err) { setError('Error: ' + err.message); return }
    if (!data?.length) { setError(SIN_PERMISO); return }
    cargar()
  }

  const total = filas.reduce((s, f) => s + Number(f.monto), 0)
  const label = id => CONCEPTOS_COSTO.find(c => c.id === id)?.label ?? id

  return (
    <div className="flex flex-col gap-3">
      <p className="text-zinc-400 text-xs">Gastos del mes que se pagan por banco y no pasan por caja.</p>
      <input type="month" value={mes} onChange={e => e.target.value && setMes(e.target.value)}
        className={inputCls} style={{ colorScheme: 'dark' }} />

      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        {cargando && <p className="text-zinc-500 text-sm p-3">Cargando...</p>}
        {!cargando && filas.length === 0 && <p className="text-zinc-600 text-sm p-3">Sin costos capturados en este mes.</p>}
        {filas.map(f => (
          <div key={f.id} className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900 text-sm">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">{label(f.concepto)}</p>
              {f.nota && <p className="text-zinc-500 text-xs truncate">{f.nota}</p>}
            </div>
            <span className="text-white font-bold">{fmt(f.monto)}</span>
            <button onClick={() => setForm({ id: f.id, concepto: f.concepto, monto: String(f.monto), nota: f.nota ?? '' })}
              className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-bold">Editar</button>
            <button onClick={() => borrar(f)} className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold">Borrar</button>
          </div>
        ))}
        {filas.length > 0 && (
          <div className="flex justify-between px-3 py-2 bg-zinc-950 text-sm">
            <span className="text-zinc-400">Total del mes</span>
            <span className="text-yellow-400 font-black">{fmt(total)}</span>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2">
        <p className="text-white text-sm font-bold">{form.id ? 'Editar costo' : 'Agregar costo'}</p>
        <select value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} className={inputCls}>
          {CONCEPTOS_COSTO.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Monto $" value={form.monto}
          onChange={e => setForm({ ...form, monto: e.target.value })} className={inputCls} />
        <input placeholder="Nota (opcional)" value={form.nota}
          onChange={e => setForm({ ...form, nota: e.target.value })} className={inputCls} />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          {form.id && (
            <button onClick={() => setForm({ id: null, concepto: 'renta', monto: '', nota: '' })}
              className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl">Cancelar</button>
          )}
          <button onClick={guardar} disabled={guardando}
            className="flex-1 bg-yellow-400 text-zinc-950 font-black py-2.5 rounded-xl active:scale-[0.98] disabled:opacity-50">
            {guardando ? 'Guardando...' : form.id ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
