import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const dias = [
  { nombre: 'Lunes', orden: 1 },
  { nombre: 'Martes', orden: 2 },
  { nombre: 'Miércoles', orden: 3 },
  { nombre: 'Jueves', orden: 4 },
  { nombre: 'Viernes', orden: 5 },
  { nombre: 'Sábado', orden: 6 },
]

const tipos = [
  { valor: 'boxfit', label: 'Box Fit' },
  { valor: 'combat', label: 'Combat Box' },
  { valor: 'control', label: 'Box Control' },
  { valor: 'elite', label: 'Elite Box' },
  { valor: 'kids', label: 'Kids' },
  { valor: 'mma', label: 'MMA' },
]

export default function AdminHorarios() {
  const [clases, setClases] = useState([])
  const [dia, setDia] = useState('Lunes')
  const [hora, setHora] = useState('')
  const [horaOrden, setHoraOrden] = useState(1)
  const [nombre, setNombre] = useState('')
  const [subetiqueta, setSubetiqueta] = useState('')
  const [tipo, setTipo] = useState('boxfit')
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    cargarClases()
  }, [])

  async function cargarClases() {
    const { data } = await supabase
      .from('horario_clases')
      .select('*')
      .order('dia_orden', { ascending: true })
      .order('hora_orden', { ascending: true })
    if (data) setClases(data)
  }

  async function handleAgregar(e) {
    e.preventDefault()
    setGuardando(true)
    setMsg('')

    const diaInfo = dias.find(d => d.nombre === dia)

    const { error } = await supabase.from('horario_clases').insert({
      dia,
      dia_orden: diaInfo.orden,
      hora,
      hora_orden: Number(horaOrden),
      nombre,
      subetiqueta,
      tipo,
      activo: true,
    })

    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('¡Clase agregada!')
      setHora('')
      setNombre('')
      setSubetiqueta('')
      cargarClases()
    }

    setGuardando(false)
  }

  async function handleEliminar(id) {
    const confirmar = window.confirm('¿Seguro que quieres eliminar esta clase?')
    if (!confirmar) return
    await supabase.from('horario_clases').delete().eq('id', id)
    cargarClases()
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAgregar} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
        <p className="text-yellow-400 font-bold text-sm mb-1">Nueva clase</p>

        <select
          value={dia}
          onChange={e => setDia(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
        >
          {dias.map(d => (
            <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Hora (ej. 7-8 am)"
          value={hora}
          onChange={e => setHora(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
          required
        />

        <input
          type="number"
          placeholder="Orden dentro del día (1, 2, 3...)"
          value={horaOrden}
          onChange={e => setHoraOrden(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
          required
        />

        <input
          type="text"
          placeholder="Nombre de la clase (ej. Box Fit)"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
          required
        />

        <input
          type="text"
          placeholder="Subetiqueta (opcional, ej. Técnica + 40% Fit)"
          value={subetiqueta}
          onChange={e => setSubetiqueta(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
        />

        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
        >
          {tipos.map(t => (
            <option key={t.valor} value={t.valor}>{t.label}</option>
          ))}
        </select>

        {msg && <p className="text-xs text-yellow-400">{msg}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="bg-yellow-500 text-zinc-950 font-bold rounded-xl p-3 mt-1 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Agregar clase'}
        </button>
      </form>

      <div>
        <p className="text-zinc-300 font-bold text-sm mb-3">Clases actuales</p>
        <div className="flex flex-col gap-2">
          {dias.map(d => {
            const clasesDelDia = clases.filter(c => c.dia === d.nombre)
            if (clasesDelDia.length === 0) return null
            return (
              <div key={d.nombre} className="mb-2">
                <p className="text-zinc-500 text-xs font-bold uppercase mb-1">{d.nombre}</p>
                {clasesDelDia.map(c => (
                  <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold">{c.hora} — {c.nombre}</p>
                      {c.subetiqueta && (
                        <p className="text-zinc-500 text-xs">{c.subetiqueta}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEliminar(c.id)}
                      className="text-red-500 text-xs shrink-0"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
