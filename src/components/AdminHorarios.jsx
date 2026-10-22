import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

// ─────────────────────────────────────────────────────────────
// FRANJAS HORARIAS POSIBLES (amplía esta lista para abrir nuevos horarios)
// El texto debe coincidir EXACTAMENTE con el que usas en la base de datos.
// ─────────────────────────────────────────────────────────────
const FRANJAS_POSIBLES = [
  '6-7 am', '7-8 am', '8-9 am', '9-10 am', '10-11 am', '11-12 am',
  '12-1 pm', '1-2 pm', '2-3 pm', '3-4 pm', '4-5 pm',
  '5-6 pm', '6-7 pm', '7-8 pm', '8-9 pm', '9-10 pm', '10-11 pm',
]

const DIAS = [
  { nombre: 'Lunes',     orden: 1 },
  { nombre: 'Martes',    orden: 2 },
  { nombre: 'Miércoles', orden: 3 },
  { nombre: 'Jueves',    orden: 4 },
  { nombre: 'Viernes',   orden: 5 },
  { nombre: 'Sábado',    orden: 6 },
  { nombre: 'Domingo',   orden: 7 },
]

const TIPOS = [
  { valor: 'boxfit',  label: 'Box Fit',     bg: 'bg-green-900/80',  border: 'border-green-700',  texto: 'text-green-300' },
  { valor: 'combat',  label: 'Combat Box',  bg: 'bg-blue-900/80',   border: 'border-blue-700',   texto: 'text-blue-300' },
  { valor: 'control', label: 'Box Control', bg: 'bg-zinc-700/80',   border: 'border-zinc-600',   texto: 'text-zinc-200' },
  { valor: 'elite',   label: 'Elite Box',   bg: 'bg-red-900/80',    border: 'border-red-700',    texto: 'text-red-300' },
  { valor: 'kids',    label: 'Kids',        bg: 'bg-purple-900/80', border: 'border-purple-700', texto: 'text-purple-300' },
  { valor: 'mma',     label: 'MMA',         bg: 'bg-yellow-900/80', border: 'border-yellow-700', texto: 'text-yellow-300' },
]

// Convierte texto de hora a número para ordenar cronológicamente.
// "7-8 am" → 7, "5-6 pm" → 17, "12-1 pm" → 12, "10-11 pm" → 22
function horaA24(texto) {
  const m = texto.match(/^(\d+)/)
  if (!m) return 0
  const h = parseInt(m[1])
  const pm = /pm/i.test(texto)
  if (pm) return h === 12 ? 12 : h + 12
  return h === 12 ? 0 : h
}

// Dado el array de clases de UN día, devuelve un mapa { id → nuevo_hora_orden }
// ordenando cronológicamente por texto de hora.
function calcularHoraOrden(clasesDelDia) {
  const sorted = [...clasesDelDia].sort((a, b) => horaA24(a.hora) - horaA24(b.hora))
  const mapa = {}
  sorted.forEach((c, i) => { mapa[c.id] = i + 1 })
  return mapa
}

// Clases de colores para cada tipo
function tipoEstilo(tipoValor) {
  return TIPOS.find(t => t.valor === tipoValor) ?? TIPOS[2]
}

export default function AdminHorarios() {
  const [clases, setClases]               = useState([])
  const [cargando, setCargando]           = useState(true)
  const [mostrarTodas, setMostrarTodas]   = useState(false)
  const [mostrarDom, setMostrarDom]       = useState(false)
  const [franjasExtra, setFranjasExtra]   = useState([])   // horas nuevas escritas por el admin
  const [msg, setMsg]                     = useState(null)  // { texto, error }

  // Modal edición / creación
  const [modal, setModal]           = useState(null)  // { dia, hora, clase|null }
  const [fNombre, setFNombre]       = useState('')
  const [fSub, setFSub]             = useState('')
  const [fTipo, setFTipo]           = useState('boxfit')
  const [guardando, setGuardando]   = useState(false)
  const [previewOrden, setPreviewOrden] = useState(null) // clases cuyo hora_orden cambia

  // Modal copiar día
  const [modCopiar, setModCopiar]         = useState(false)
  const [copOrigen, setCopOrigen]         = useState('Lunes')
  const [copDestinos, setCopDestinos]     = useState([])
  const [copPreview, setCopPreview]       = useState(null)
  const [copiando, setCopiando]           = useState(false)

  // Nueva franja custom
  const [nuevaFranja, setNuevaFranja] = useState('')
  const [agregandoFranja, setAgregandoFranja] = useState(false)

  const scrollRef = useRef(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data, error } = await supabase
      .from('horario_clases')
      .select('*')
      .order('dia_orden')
      .order('hora_orden')
    if (error) mostrarMsg('Error al cargar: ' + error.message, true)
    else setClases(data ?? [])
    setCargando(false)
  }

  function mostrarMsg(texto, error = false) {
    setMsg({ texto, error })
    setTimeout(() => setMsg(null), 4000)
  }

  // ─── Franjas a mostrar ────────────────────────────────────────
  const horasEnDB = [...new Set(clases.map(c => c.hora))]
  const todasLasFranjas = [...new Set([...FRANJAS_POSIBLES, ...franjasExtra, ...horasEnDB])]
    .sort((a, b) => horaA24(a) - horaA24(b))

  const franjasVisibles = mostrarTodas
    ? todasLasFranjas
    : todasLasFranjas.filter(f => horasEnDB.includes(f) || franjasExtra.includes(f))

  // ─── Días a mostrar ───────────────────────────────────────────
  const diasVisibles = mostrarDom ? DIAS : DIAS.filter(d => d.nombre !== 'Domingo')

  // ─── Abrir modal de celda ─────────────────────────────────────
  function abrirCelda(dia, hora) {
    const clase = clases.find(c => c.dia === dia.nombre && c.hora === hora) ?? null
    setModal({ dia, hora, clase })
    setFNombre(clase?.nombre ?? '')
    setFSub(clase?.subetiqueta ?? '')
    setFTipo(clase?.tipo ?? 'boxfit')
    setPreviewOrden(null)
  }

  // Calcula y muestra preview de cambios en hora_orden al crear nueva clase
  function calcularPreviewOrden(diaNombre, horaTexto, idExcluir = null) {
    const clasesDelDia = clases.filter(c => c.dia === diaNombre && c.id !== idExcluir)
    const ficticia = { id: '__nueva__', hora: horaTexto }
    const mapaOrden = calcularHoraOrden([...clasesDelDia, ficticia])
    // Solo mostrar las que cambian respecto al estado actual
    const cambios = clasesDelDia
      .filter(c => c.hora_orden !== mapaOrden[c.id])
      .map(c => ({ hora: c.hora, nombre: c.nombre, antes: c.hora_orden, despues: mapaOrden[c.id] }))
    setPreviewOrden(cambios.length > 0 ? cambios : null)
    return mapaOrden
  }

  // Recalcula hora_orden en la DB para todas las clases de un día
  async function aplicarHoraOrden(diaNombre, clasesDelDiaActualizadas) {
    const mapaOrden = calcularHoraOrden(clasesDelDiaActualizadas)
    const updates = clasesDelDiaActualizadas
      .filter(c => c.id !== '__nueva__' && c.hora_orden !== mapaOrden[c.id])
      .map(c => supabase.from('horario_clases').update({ hora_orden: mapaOrden[c.id] }).eq('id', c.id))
    await Promise.all(updates)
  }

  // ─── GUARDAR (crear o editar) ─────────────────────────────────
  async function handleGuardar() {
    if (!fNombre.trim()) return
    setGuardando(true)
    const { dia, hora, clase } = modal

    try {
      if (clase) {
        // EDITAR
        const { error } = await supabase
          .from('horario_clases')
          .update({ nombre: fNombre.trim(), subetiqueta: fSub.trim(), tipo: fTipo })
          .eq('id', clase.id)
        if (error) throw error
        mostrarMsg('Clase actualizada ✓')
      } else {
        // CREAR — primero insertar, luego recalcular hora_orden del día
        const { data: inserted, error } = await supabase
          .from('horario_clases')
          .insert({
            dia: dia.nombre,
            dia_orden: dia.orden,
            hora,
            hora_orden: 99, // temporal; se recalcula abajo
            nombre: fNombre.trim(),
            subetiqueta: fSub.trim(),
            tipo: fTipo,
            activo: true,
          })
          .select()
          .single()
        if (error) throw error

        // Recalcular hora_orden de todo el día con la nueva clase incluida
        const { data: clasesDelDia } = await supabase
          .from('horario_clases').select('*').eq('dia', dia.nombre)
        if (clasesDelDia) await aplicarHoraOrden(dia.nombre, clasesDelDia)
        mostrarMsg('Clase agregada ✓')
      }

      setModal(null)
      await cargar()
    } catch (err) {
      mostrarMsg('Error: ' + err.message, true)
      if (err.message?.includes('permission') || err.message?.includes('policy') || err.message?.includes('RLS')) {
        mostrarMsg(`❌ Permiso denegado (RLS). Ejecuta en Supabase:\n\nALTER POLICY "..." ON horario_clases ...\n\nMensaje original: ${err.message}`, true)
      }
    }
    setGuardando(false)
  }

  // ─── ELIMINAR ─────────────────────────────────────────────────
  async function handleEliminar() {
    const { clase, dia } = modal
    if (!clase) return
    setGuardando(true)
    try {
      const { error } = await supabase.from('horario_clases').delete().eq('id', clase.id)
      if (error) throw error

      // Recalcular hora_orden del día sin esta clase
      const { data: clasesDelDia } = await supabase
        .from('horario_clases').select('*').eq('dia', dia.nombre)
      if (clasesDelDia?.length) await aplicarHoraOrden(dia.nombre, clasesDelDia)

      mostrarMsg('Clase eliminada ✓')
      setModal(null)
      await cargar()
    } catch (err) {
      mostrarMsg('Error al eliminar: ' + err.message, true)
    }
    setGuardando(false)
  }

  // ─── COPIAR DÍA ───────────────────────────────────────────────
  function abrirCopiar() {
    setCopOrigen('Lunes')
    setCopDestinos([])
    setCopPreview(null)
    setModCopiar(true)
  }

  function toggleDestino(diaNombre) {
    setCopDestinos(prev =>
      prev.includes(diaNombre) ? prev.filter(d => d !== diaNombre) : [...prev, diaNombre]
    )
    setCopPreview(null)
  }

  function calcularPreviewCopiar() {
    const clasesOrigen = clases.filter(c => c.dia === copOrigen)
    const preview = copDestinos.map(diaNombre => ({
      dia: diaNombre,
      clasesOrigen: clasesOrigen.length,
      clasesAReemplazar: clases.filter(c => c.dia === diaNombre).length,
    }))
    setCopPreview(preview)
  }

  async function ejecutarCopiar() {
    if (!copPreview || copDestinos.length === 0) return
    setCopiando(true)
    const clasesOrigen = clases.filter(c => c.dia === copOrigen)

    try {
      for (const diaNombre of copDestinos) {
        const diaInfo = DIAS.find(d => d.nombre === diaNombre)
        const clasesDestino = clases.filter(c => c.dia === diaNombre)

        // 1. INSERTAR copias primero
        const copias = clasesOrigen.map(c => ({
          dia: diaNombre,
          dia_orden: diaInfo.orden,
          hora: c.hora,
          hora_orden: c.hora_orden,
          nombre: c.nombre,
          subetiqueta: c.subetiqueta,
          tipo: c.tipo,
          activo: true,
        }))
        const { error: errInsert } = await supabase.from('horario_clases').insert(copias)
        if (errInsert) throw new Error(`Error insertando en ${diaNombre}: ${errInsert.message}`)

        // 2. BORRAR clases anteriores del destino SOLO si el insert funcionó
        if (clasesDestino.length > 0) {
          const idsABorrar = clasesDestino.map(c => c.id)
          const { error: errDelete } = await supabase
            .from('horario_clases').delete().in('id', idsABorrar)
          if (errDelete) throw new Error(`Error borrando en ${diaNombre}: ${errDelete.message}`)
        }
      }
      mostrarMsg(`Días copiados: ${copDestinos.join(', ')} ✓`)
      setModCopiar(false)
      await cargar()
    } catch (err) {
      mostrarMsg('⚠️ ' + err.message + '\n(Las copias ya insertadas no se borraron — recarga y revisa.)', true)
    }
    setCopiando(false)
  }

  // ─── Agregar franja custom ────────────────────────────────────
  function handleAgregarFranja(e) {
    e.preventDefault()
    const texto = nuevaFranja.trim()
    if (!texto) return
    if (!franjasExtra.includes(texto) && !FRANJAS_POSIBLES.includes(texto)) {
      setFranjasExtra(prev => [...prev, texto])
    }
    setNuevaFranja('')
    setAgregandoFranja(false)
    setMostrarTodas(true)
  }

  // ─── Render ───────────────────────────────────────────────────
  if (cargando) {
    return <p className="text-zinc-500 text-center py-10">Cargando horarios...</p>
  }

  return (
    <div className="flex flex-col gap-4">

      {/* MENSAJE GLOBAL */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm whitespace-pre-line
          ${msg.error ? 'bg-red-950 border border-red-700 text-red-300' : 'bg-green-950 border border-green-700 text-green-300'}`}>
          {msg.texto}
        </div>
      )}

      {/* CONTROLES SUPERIORES */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMostrarTodas(v => !v)}
          className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg"
        >
          {mostrarTodas ? 'Ocultar franjas vacías' : 'Mostrar todas las franjas'}
        </button>
        <button
          onClick={() => setMostrarDom(v => !v)}
          className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg"
        >
          {mostrarDom ? 'Ocultar Domingo' : 'Mostrar Domingo'}
        </button>
        <button
          onClick={() => setAgregandoFranja(v => !v)}
          className="text-xs bg-zinc-800 border border-yellow-700 text-yellow-400 px-3 py-2 rounded-lg"
        >
          + Agregar franja
        </button>
        <button
          onClick={abrirCopiar}
          className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg"
        >
          Copiar día →
        </button>
      </div>

      {/* FORMULARIO NUEVA FRANJA */}
      {agregandoFranja && (
        <form onSubmit={handleAgregarFranja} className="flex gap-2">
          <input
            type="text"
            placeholder="ej. 11-12 am"
            value={nuevaFranja}
            onChange={e => setNuevaFranja(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
          />
          <button type="submit" className="bg-yellow-500 text-zinc-950 font-bold px-3 py-2 rounded-lg text-sm">
            Agregar
          </button>
          <button type="button" onClick={() => setAgregandoFranja(false)} className="text-zinc-500 px-2">×</button>
        </form>
      )}

      {/* ─── CUADRÍCULA SEMANAL ─── */}
      <div
        ref={scrollRef}
        className="overflow-x-auto -mx-4 px-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="border-collapse text-xs" style={{ minWidth: `${80 + diasVisibles.length * 100}px` }}>
          <thead>
            <tr>
              {/* Columna hora — fija */}
              <th
                className="sticky left-0 z-10 bg-zinc-950 border border-zinc-800 px-2 py-2 text-zinc-500 font-bold text-left"
                style={{ minWidth: 64, width: 64 }}
              >
                Hora
              </th>
              {diasVisibles.map(d => (
                <th
                  key={d.nombre}
                  className="border border-zinc-800 px-1 py-2 text-zinc-300 font-bold text-center"
                  style={{ minWidth: 90 }}
                >
                  {d.nombre.slice(0, 3).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {franjasVisibles.map(franja => (
              <tr key={franja}>
                {/* Hora fija */}
                <td
                  className="sticky left-0 z-10 bg-zinc-950 border border-zinc-800 px-2 py-1.5 text-zinc-400 font-bold whitespace-nowrap"
                  style={{ minWidth: 64, fontSize: 10 }}
                >
                  {franja}
                </td>
                {diasVisibles.map(dia => {
                  const clase = clases.find(c => c.dia === dia.nombre && c.hora === franja)
                  const estilo = clase ? tipoEstilo(clase.tipo) : null
                  return (
                    <td
                      key={dia.nombre}
                      onClick={() => abrirCelda(dia, franja)}
                      className="border border-zinc-800/50 p-1 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                      style={{ minWidth: 90 }}
                    >
                      {clase ? (
                        <div className={`rounded-lg px-1.5 py-1.5 border ${estilo.bg} ${estilo.border} ${estilo.texto} leading-tight`}>
                          <p className="font-bold truncate" style={{ fontSize: 11 }}>{clase.nombre}</p>
                          {clase.subetiqueta && (
                            <p className="opacity-70 truncate" style={{ fontSize: 9 }}>{clase.subetiqueta}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-8 text-zinc-700 hover:text-zinc-500 text-lg">
                          +
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── LEYENDA ─── */}
      <div className="grid grid-cols-3 gap-1.5">
        {TIPOS.map(t => (
          <div key={t.valor} className={`rounded-lg px-2 py-1 border text-center ${t.bg} ${t.border} ${t.texto}`}
            style={{ fontSize: 10 }}>
            {t.label}
          </div>
        ))}
      </div>

      {/* ─── MODAL EDICIÓN / CREACIÓN ─── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center p-0"
          onClick={() => !guardando && setModal(null)}>
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-t-2xl p-5 flex flex-col gap-4"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 font-black text-base uppercase tracking-wide">
                  {modal.clase ? 'Editar clase' : 'Nueva clase'}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {modal.dia.nombre} · {modal.hora}
                </p>
              </div>
              <button onClick={() => setModal(null)} className="text-zinc-500 text-2xl px-2">×</button>
            </div>

            {/* Nombre */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Nombre de la clase</label>
              <input
                type="text"
                value={fNombre}
                onChange={e => setFNombre(e.target.value)}
                placeholder="ej. Box Fit"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
                onFocus={() => !modal.clase && calcularPreviewOrden(modal.dia.nombre, modal.hora)}
              />
            </div>

            {/* Subetiqueta */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Subetiqueta <span className="text-zinc-600">(opcional)</span></label>
              <input
                type="text"
                value={fSub}
                onChange={e => setFSub(e.target.value)}
                placeholder="ej. Técnica + 40% Fit"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Tipo de clase</label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS.map(t => (
                  <button
                    key={t.valor}
                    onClick={() => setFTipo(t.valor)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all
                      ${fTipo === t.valor ? `${t.bg} ${t.border} ${t.texto}` : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview cambios hora_orden */}
            {!modal.clase && previewOrden && previewOrden.length > 0 && (
              <div className="bg-yellow-950/50 border border-yellow-700/50 rounded-xl px-3 py-2">
                <p className="text-yellow-400 text-xs font-bold mb-1">⚠️ Esto cambiará el orden de otras clases del día:</p>
                {previewOrden.map((c, i) => (
                  <p key={i} className="text-yellow-300 text-xs">
                    {c.hora} {c.nombre}: orden {c.antes} → {c.despues}
                  </p>
                ))}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleGuardar}
                disabled={guardando || !fNombre.trim()}
                className="flex-1 bg-yellow-400 text-zinc-950 font-black py-3.5 rounded-xl text-sm
                  active:scale-95 transition-all disabled:opacity-40"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              {modal.clase && (
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${modal.clase.nombre}" del ${modal.dia.nombre} ${modal.hora}?`)) {
                      handleEliminar()
                    }
                  }}
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

      {/* ─── MODAL COPIAR DÍA ─── */}
      {modCopiar && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => !copiando && setModCopiar(false)}>
          <div
            className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-yellow-400 font-black text-base uppercase tracking-wide">Copiar día</p>
              <button onClick={() => setModCopiar(false)} className="text-zinc-500 text-2xl px-2">×</button>
            </div>

            {/* Día origen */}
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Copiar desde:</label>
              <select
                value={copOrigen}
                onChange={e => { setCopOrigen(e.target.value); setCopPreview(null) }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
              >
                {DIAS.filter(d => d.nombre !== 'Domingo').map(d => (
                  <option key={d.nombre} value={d.nombre}>{d.nombre} ({clases.filter(c => c.dia === d.nombre).length} clases)</option>
                ))}
              </select>
            </div>

            {/* Días destino */}
            <div>
              <label className="text-zinc-400 text-xs mb-2 block">Pegar en: (selecciona uno o más días)</label>
              <div className="grid grid-cols-3 gap-2">
                {DIAS.filter(d => d.nombre !== copOrigen).map(d => (
                  <button
                    key={d.nombre}
                    onClick={() => { toggleDestino(d.nombre) }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all
                      ${copDestinos.includes(d.nombre)
                        ? 'bg-yellow-400 border-yellow-400 text-zinc-950'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
                  >
                    {d.nombre.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {!copPreview && copDestinos.length > 0 && (
              <button
                onClick={calcularPreviewCopiar}
                className="bg-zinc-700 text-white font-bold py-3 rounded-xl text-sm"
              >
                Ver resumen antes de copiar
              </button>
            )}

            {copPreview && (
              <div className="bg-zinc-800 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-yellow-400 text-xs font-bold mb-1">Resumen del cambio:</p>
                {copPreview.map(p => (
                  <p key={p.dia} className="text-zinc-300 text-xs">
                    <span className="font-bold">{p.dia}</span>: {p.clasesAReemplazar} clases actuales → reemplazadas por {p.clasesOrigen} de {copOrigen}
                  </p>
                ))}
                <button
                  onClick={ejecutarCopiar}
                  disabled={copiando}
                  className="mt-3 bg-yellow-400 text-zinc-950 font-black py-3 rounded-xl text-sm
                    active:scale-95 transition-all disabled:opacity-40"
                >
                  {copiando ? 'Copiando...' : 'Confirmar y copiar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
