import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const abreviaturas = { Lunes: 'LUN', Martes: 'MAR', Miércoles: 'MIÉ', Jueves: 'JUE', Viernes: 'VIE', Sábado: 'SÁB' }

const leyenda = [
  { tipo: 'boxfit',  label: 'Box Fit',     color: 'bg-green-500' },
  { tipo: 'combat',  label: 'Combat Box',  color: 'bg-blue-500' },
  { tipo: 'control', label: 'Box Control', color: 'bg-zinc-500' },
  { tipo: 'elite',   label: 'Elite Box',   color: 'bg-red-500' },
  { tipo: 'kids',    label: 'Kids',        color: 'bg-purple-500' },
  { tipo: 'mma',     label: 'MMA',         color: 'bg-yellow-500' },
]

export default function Horarios() {
  const [clases, setClases] = useState([])
  const [cargando, setCargando] = useState(true)
  const [diaActivo, setDiaActivo] = useState(0)

  useEffect(() => {
    cargarClases()

    const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long' })
    const diaHoy = hoy.charAt(0).toUpperCase() + hoy.slice(1)
    const indexHoy = diasOrden.findIndex(d =>
      diaHoy.startsWith(d.slice(0, 3).normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )
    if (indexHoy >= 0) setDiaActivo(indexHoy)
  }, [])

  async function cargarClases() {
    const { data } = await supabase
      .from('horario_clases')
      .select('*')
      .eq('activo', true)
      .order('dia_orden', { ascending: true })
      .order('hora_orden', { ascending: true })
    if (data) setClases(data)
    setCargando(false)
  }

  const clasesDelDia = clases.filter(c => c.dia === diasOrden[diaActivo])

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Horarios
      </h2>
      <p className="text-zinc-500 text-xs mb-4 tracking-wide">Lunes a Sábado · Mañana y Tarde</p>

      {/* TABS DE DÍAS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-1 px-1">
        {diasOrden.map((d, i) => (
          <button
            key={d}
            onClick={() => setDiaActivo(i)}
            className={`shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all
              ${diaActivo === i
                ? 'bg-yellow-400 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            {abreviaturas[d]}
          </button>
        ))}
      </div>

      {/* LISTA DE CLASES */}
      <div className="flex flex-col gap-2">
        {cargando ? (
          <p className="text-zinc-500 text-center py-10">Cargando...</p>
        ) : clasesDelDia.length === 0 ? (
          <p className="text-zinc-500 text-center py-10">Sin clases este día</p>
        ) : (
          clasesDelDia.map((clase) => (
            <div
              key={clase.id}
              className={`flex items-center gap-3 bg-zinc-900 rounded-xl p-3 border-l-4 clase-${clase.tipo}`}
            >
              <div className="text-center min-w-[60px]">
                <p className="text-yellow-400 font-bold text-sm leading-tight">{clase.hora}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm leading-tight">{clase.nombre}</p>
                {clase.subetiqueta && (
                  <p className={`text-xs mt-0.5 font-medium rounded px-1.5 py-0.5 inline-block badge-${clase.tipo}`}>
                    {clase.subetiqueta}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* LEYENDA */}
      <div className="mt-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Leyenda</p>
        <div className="grid grid-cols-2 gap-2">
          {leyenda.map(l => (
            <div key={l.tipo} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full shrink-0 ${l.color}`} />
              <span className="text-xs text-zinc-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
