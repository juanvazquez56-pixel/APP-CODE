import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import content from '../content'

// Nombres que usa la calculadora (content.js → calculadora.reglas → plan).
// Si un admin cambia el nombre de un plan que aparece aquí, se avisa.
const NOMBRES_EN_CALCULADORA = content.calculadora.reglas.map(r => r.plan)

function msgError(err) {
  if (!err) return null
  const m = err.message ?? String(err)
  if (m.includes('permission') || m.includes('policy') || m.includes('RLS') || m.includes('denied')) {
    return `❌ Permiso denegado (RLS).\n\nEjecuta en Supabase → SQL Editor:\n\nGRANT ALL ON public.planes TO authenticated;\n\nMensaje original: ${m}`
  }
  return `Error: ${m}`
}

const PLAN_VACIO = {
  nombre: '', precio: '', periodo: '/mes',
  descripcion: '', nota: '', incluye: [''],
  popular: false, activo: true, orden: 99,
}

export default function AdminPlanes() {
  const [planes, setPlanes]       = useState([])
  const [cargando, setCargando]   = useState(true)
  const [msg, setMsg]             = useState(null) // { texto, error }
  const [panel, setPanel]         = useState(null) // plan en edición (obj) | 'nuevo'
  const [form, setForm]           = useState(PLAN_VACIO)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data, error } = await supabase
      .from('planes')
      .select('*')
      .order('orden')
    if (error) mostrarMsg(msgError(error) ?? error.message, true)
    else setPlanes(data ?? [])
    setCargando(false)
  }

  function mostrarMsg(texto, error = false) {
    setMsg({ texto, error })
    setTimeout(() => setMsg(null), 5000)
  }

  // ── Abrir panel ──────────────────────────────────────────────
  function abrirNuevo() {
    const maxOrden = planes.length > 0 ? Math.max(...planes.map(p => p.orden ?? 0)) + 1 : 1
    setForm({ ...PLAN_VACIO, orden: maxOrden })
    setPanel('nuevo')
  }

  function abrirEditar(plan) {
    setForm({
      ...plan,
      incluye: plan.incluye?.length ? plan.incluye : [''],
      nota: plan.nota ?? '',
    })
    setPanel(plan)
  }

  function cerrarPanel() { setPanel(null) }

  // ── Helpers de form ──────────────────────────────────────────
  function setField(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  function setIncluye(i, valor) {
    setForm(f => {
      const arr = [...f.incluye]
      arr[i] = valor
      return { ...f, incluye: arr }
    })
  }

  function addIncluye() {
    setForm(f => ({ ...f, incluye: [...f.incluye, ''] }))
  }

  function removeIncluye(i) {
    setForm(f => ({ ...f, incluye: f.incluye.filter((_, idx) => idx !== i) }))
  }

  // ── Guardar (crear o editar) ─────────────────────────────────
  async function handleGuardar() {
    if (!form.nombre.trim() || !form.precio.trim()) return
    setGuardando(true)

    const payload = {
      nombre:      form.nombre.trim(),
      precio:      form.precio.trim(),
      periodo:     form.periodo.trim(),
      descripcion: form.descripcion.trim(),
      nota:        form.nota.trim() || null,
      incluye:     form.incluye.map(x => x.trim()).filter(Boolean),
      popular:     form.popular,
      activo:      form.activo,
      orden:       Number(form.orden) || 99,
    }

    try {
      if (panel === 'nuevo') {
        const { error } = await supabase.from('planes').insert(payload)
        if (error) throw error
        mostrarMsg('Plan creado ✓')
      } else {
        const { error } = await supabase.from('planes').update(payload).eq('id', panel.id)
        if (error) throw error
        mostrarMsg('Plan actualizado ✓')
      }

      // Si se activó "popular", desactivarlo en los demás
      if (payload.popular && panel !== 'nuevo') {
        await supabase
          .from('planes')
          .update({ popular: false })
          .neq('id', panel.id)
          .eq('popular', true)
      }

      cerrarPanel()
      await cargar()
    } catch (err) {
      mostrarMsg(msgError(err) ?? err.message, true)
    }
    setGuardando(false)
  }

  // ── Eliminar ─────────────────────────────────────────────────
  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${form.nombre}" para siempre? Esta acción no se puede deshacer.`)) return
    setGuardando(true)
    try {
      const { error } = await supabase.from('planes').delete().eq('id', panel.id)
      if (error) throw error
      mostrarMsg('Plan eliminado.')
      cerrarPanel()
      await cargar()
    } catch (err) {
      mostrarMsg(msgError(err) ?? err.message, true)
    }
    setGuardando(false)
  }

  // ── Subir / Bajar orden ──────────────────────────────────────
  async function moverOrden(plan, direccion) {
    const sorted = [...planes].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex(p => p.id === plan.id)
    const swapIdx = idx + direccion
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const otro = sorted[swapIdx]
    const ordenA = sorted[idx].orden
    const ordenB = otro.orden

    try {
      await Promise.all([
        supabase.from('planes').update({ orden: ordenB }).eq('id', plan.id),
        supabase.from('planes').update({ orden: ordenA }).eq('id', otro.id),
      ])
      await cargar()
    } catch (err) {
      mostrarMsg(msgError(err) ?? err.message, true)
    }
  }

  // ── Render ───────────────────────────────────────────────────
  if (cargando) return <p className="text-zinc-500 text-sm text-center py-6">Cargando planes...</p>

  const sorted = [...planes].sort((a, b) => a.orden - b.orden)
  const nombreCambiado = panel && panel !== 'nuevo' &&
    form.nombre.trim() !== panel.nombre &&
    NOMBRES_EN_CALCULADORA.includes(panel.nombre)

  return (
    <div className="flex flex-col gap-4">

      {/* MENSAJE GLOBAL */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-xs whitespace-pre-line
          ${msg.error ? 'bg-red-950 border border-red-700 text-red-300' : 'bg-green-950 border border-green-700 text-green-300'}`}>
          {msg.texto}
        </div>
      )}

      {/* BOTÓN NUEVO */}
      <button
        onClick={abrirNuevo}
        className="w-full py-3 rounded-xl bg-yellow-500 text-zinc-950 font-bold text-sm active:scale-[0.98] transition-all"
      >
        + Nuevo plan
      </button>

      {/* LISTA DE PLANES */}
      {sorted.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-4">No hay planes. Agrega uno.</p>
      )}

      {sorted.map((plan, idx) => (
        <div
          key={plan.id}
          className={`rounded-xl border p-3 flex items-center gap-3
            ${plan.popular ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-zinc-900 border-zinc-800'}
            ${!plan.activo ? 'opacity-50' : ''}`}
        >
          {/* Flechas orden */}
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => moverOrden(plan, -1)}
              disabled={idx === 0}
              className="text-zinc-500 disabled:opacity-20 text-lg leading-none hover:text-zinc-300 active:scale-90 transition-all"
            >▲</button>
            <button
              onClick={() => moverOrden(plan, 1)}
              disabled={idx === sorted.length - 1}
              className="text-zinc-500 disabled:opacity-20 text-lg leading-none hover:text-zinc-300 active:scale-90 transition-all"
            >▼</button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" onClick={() => abrirEditar(plan)}>
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-sm ${plan.popular ? 'text-yellow-400' : 'text-white'}`}>
                {plan.nombre}
              </p>
              {plan.popular && (
                <span className="text-xs bg-yellow-400 text-zinc-950 px-2 py-0.5 rounded-full font-bold">⭐ Popular</span>
              )}
              {!plan.activo && (
                <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">Oculto</span>
              )}
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">{plan.precio}{plan.periodo}</p>
          </div>

          {/* Editar */}
          <button
            onClick={() => abrirEditar(plan)}
            className="text-yellow-400 text-xs font-bold shrink-0 px-2 py-1 rounded-lg bg-yellow-400/10 active:scale-95 transition-all"
          >
            Editar
          </button>
        </div>
      ))}

      {/* ── PANEL DE EDICIÓN (bottom-sheet) ── */}
      {panel && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-end justify-center"
          onClick={() => !guardando && cerrarPanel()}
        >
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-t-2xl p-5 flex flex-col gap-4 overflow-y-auto"
            style={{ maxHeight: '92dvh', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <p className="text-yellow-400 font-black text-base uppercase tracking-wide">
                {panel === 'nuevo' ? 'Nuevo plan' : 'Editar plan'}
              </p>
              <button onClick={cerrarPanel} className="text-zinc-500 text-2xl px-2">×</button>
            </div>

            {/* Aviso calculadora */}
            {nombreCambiado && (
              <div className="bg-yellow-950 border border-yellow-700 rounded-xl px-3 py-2 text-yellow-300 text-xs">
                ⚠️ La calculadora usa el nombre <strong>"{panel.nombre}"</strong>. Si lo cambias, actualiza también las reglas en <code>content.js</code> (campo <code>plan</code>).
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Nombre del plan *</label>
              <input
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                placeholder="ej. NK Básico"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
              />
            </div>

            {/* Precio + Periodo */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-zinc-400 text-xs mb-1 block">Precio *</label>
                <input
                  value={form.precio}
                  onChange={e => setField('precio', e.target.value)}
                  placeholder="$499"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <div className="w-28">
                <label className="text-zinc-400 text-xs mb-1 block">Periodo</label>
                <input
                  value={form.periodo}
                  onChange={e => setField('periodo', e.target.value)}
                  placeholder="/mes"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm resize-none"
              />
            </div>

            {/* Nota opcional */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Nota <span className="text-zinc-600">(opcional, ej. "Solo por invitación")</span></label>
              <input
                value={form.nota}
                onChange={e => setField('nota', e.target.value)}
                placeholder="Dejar vacío si no aplica"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
              />
            </div>

            {/* Incluye */}
            <div>
              <label className="text-zinc-400 text-xs mb-2 block">Incluye (renglones)</label>
              <div className="flex flex-col gap-2">
                {form.incluye.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={item}
                      onChange={e => setIncluye(i, e.target.value)}
                      placeholder={`Beneficio ${i + 1}`}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm"
                    />
                    <button
                      onClick={() => removeIncluye(i)}
                      disabled={form.incluye.length === 1}
                      className="text-red-500 disabled:opacity-20 px-2 text-lg leading-none"
                    >×</button>
                  </div>
                ))}
              </div>
              <button
                onClick={addIncluye}
                className="mt-2 text-yellow-400 text-xs font-bold border border-yellow-700 rounded-lg px-3 py-1.5"
              >
                + Agregar renglón
              </button>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              <Toggle
                label="⭐ Más popular"
                desc="Solo un plan puede tenerlo. Se desactiva en los demás."
                checked={form.popular}
                onChange={v => setField('popular', v)}
              />
              <Toggle
                label="👁 Visible en la app"
                desc="Si está apagado, el plan se oculta pero no se elimina."
                checked={form.activo}
                onChange={v => setField('activo', v)}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleGuardar}
                disabled={guardando || !form.nombre.trim() || !form.precio.trim()}
                className="flex-1 bg-yellow-400 text-zinc-950 font-black py-3.5 rounded-xl text-sm
                  active:scale-95 transition-all disabled:opacity-40"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
              {panel !== 'nuevo' && (
                <button
                  onClick={handleEliminar}
                  disabled={guardando}
                  className="bg-red-900 border border-red-700 text-red-300 font-bold py-3.5 px-4 rounded-xl text-sm
                    active:scale-95 transition-all disabled:opacity-40"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]
        ${checked ? 'bg-yellow-400/10 border-yellow-500/40' : 'bg-zinc-800 border-zinc-700'}`}
    >
      <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0
        ${checked ? 'bg-yellow-400' : 'bg-zinc-600'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all
          ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </div>
      <div>
        <p className={`text-sm font-bold ${checked ? 'text-yellow-400' : 'text-zinc-300'}`}>{label}</p>
        <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
      </div>
    </button>
  )
}
