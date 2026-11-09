import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const NOMBRE_TURNO = { manana: 'Mañana', tarde: 'Tarde' }

function msgError(err) {
  return /turno|efectivo_inicial/.test(err.message ?? '')
    ? 'Falta correr supabase/pos_corte_turnos.sql en Supabase.'
    : 'Error al guardar: ' + err.message
}

const fmt = n => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function POSCorte() {
  const [cargando, setCargando] = useState(true)
  const [desde, setDesde] = useState(null)
  const [saldoInicial, setSaldoInicial] = useState(0)   // efectivo que se contó (y quedó en caja) en el corte anterior
  const [ventasEf, setVentasEf] = useState(0)
  const [retirosEf, setRetirosEf] = useState(0)
  const [totalVentas, setTotalVentas] = useState(0)
  const [numVentas, setNumVentas] = useState(0)
  const [contado, setContado] = useState('')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [corteGuardado, setCorteGuardado] = useState(null)
  const [turno, setTurno] = useState('')                    // 'manana' | 'tarde'
  const [ultimoCorte, setUltimoCorte] = useState(null)      // { created_at, turno, ... } del corte anterior
  const [arranque, setArranque] = useState('')              // efectivo con el que se empieza (solo la primera vez)

  useEffect(() => { calcular() }, [])

  async function calcular() {
    setCargando(true)
    setError('')
    // Periodo abierto: desde el último corte (o desde el inicio del día si no hay)
    const { data: ultimo } = await supabase.from('corte_caja')
      .select('created_at, efectivo_contado, turno').order('created_at', { ascending: false }).limit(1)
    const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0)
    const inicio = ultimo?.[0]?.created_at ?? inicioDia.toISOString()
    setDesde(inicio)
    // Lo que quedó en caja al cerrar el corte anterior es el punto de partida de este periodo.
    setSaldoInicial(Number(ultimo?.[0]?.efectivo_contado ?? 0))
    setUltimoCorte(ultimo?.[0] ?? null)

    const [{ data: ventas, error: ev }, { data: retiros, error: er }] = await Promise.all([
      supabase.from('ventas').select('total, metodo_pago').gt('created_at', inicio).eq('anulada', false),
      supabase.from('retiros').select('monto, metodo_pago').gt('created_at', inicio).eq('anulada', false),
    ])
    if (ev || er) { setError('Error al calcular: ' + (ev || er).message); setCargando(false); return }

    const vEf = ventas.filter(v => v.metodo_pago === 'efectivo').reduce((s, v) => s + Number(v.total), 0)
    const rEf = retiros.filter(r => r.metodo_pago === 'efectivo').reduce((s, r) => s + Number(r.monto), 0)
    setVentasEf(vEf)
    setRetirosEf(rEf)
    setTotalVentas(ventas.reduce((s, v) => s + Number(v.total), 0))
    setNumVentas(ventas.length)
    setCargando(false)
  }

  const esperado = saldoInicial + ventasEf - retirosEf
  const contadoNum = parseFloat(contado)
  const diferencia = isNaN(contadoNum) ? null : contadoNum - esperado

  // Se pide solo cuando todavía no hay ningún corte hecho por turno: fija con cuánto efectivo se empieza.
  const necesitaArranque = !cargando && (!ultimoCorte || !ultimoCorte.turno)

  async function empezar() {
    const n = parseFloat(arranque)
    if (arranque === '' || isNaN(n) || n < 0) { setError('Captura el efectivo que hay en caja ahorita'); return }
    setGuardando(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('corte_caja').insert({
      efectivo_esperado: n, efectivo_contado: n, diferencia: 0, efectivo_inicial: n,
      turno: 'inicio', notas: 'Arranque: efectivo inicial en caja', usuario_id: user.id,
    })
    setGuardando(false)
    if (err) { setError(msgError(err)); return }
    setArranque('')
    calcular()
  }

  async function cerrar() {
    if (!turno) { setError('Elige el turno: Mañana o Tarde'); return }
    if (contado === '' || isNaN(contadoNum) || contadoNum < 0) { setError('Captura el efectivo contado'); return }
    setGuardando(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase.from('corte_caja').insert({
      efectivo_esperado: esperado,
      efectivo_inicial: saldoInicial,
      turno,
      efectivo_contado: contadoNum,
      diferencia,
      notas: notas.trim() || null,
      usuario_id: user.id,
    }).select().single()
    if (err) { setError(msgError(err)); setGuardando(false); return }
    setCorteGuardado(data)
    setGuardando(false)
  }

  function nuevoPeriodo() {
    setCorteGuardado(null)
    setContado('')
    setNotas('')
    setTurno('')
    calcular()
  }

  if (corteGuardado) return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h3 className="font-black text-white text-xl mb-3">Caja cerrada · Turno {NOMBRE_TURNO[corteGuardado.turno] ?? ''}</h3>
      <p className="text-zinc-400 text-sm">Esperado: {fmt(corteGuardado.efectivo_esperado)}</p>
      <p className="text-zinc-400 text-sm">Contado: {fmt(corteGuardado.efectivo_contado)}</p>
      <p className={`font-black text-lg mt-2 ${Number(corteGuardado.diferencia) === 0 ? 'text-green-400' : 'text-red-400'}`}>
        Diferencia: {fmt(corteGuardado.diferencia)}
      </p>
      <button onClick={nuevoPeriodo}
        className="mt-8 bg-zinc-800 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-all">
        Listo
      </button>
    </div>
  )

  if (necesitaArranque) return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-white text-base">Corte de caja por turno</h3>
      <p className="text-zinc-300 text-sm">
        Ahora la caja se cierra en dos turnos: <b>Mañana</b> y <b>Tarde</b>. Para empezar, cuenta cuánto efectivo hay en la caja
        ahorita y captúralo. A partir de ese momento se lleva el control.
      </p>
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1 block">Efectivo en caja ahorita *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
            value={arranque} onChange={e => setArranque(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-7 text-white text-sm" />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button onClick={empezar} disabled={guardando}
        className="w-full bg-yellow-400 text-zinc-950 font-black py-4 rounded-2xl text-base active:scale-[0.98] transition-all disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Empezar'}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-white text-base">Corte de caja</h3>
      {cargando ? <p className="text-zinc-500 text-sm">Calculando...</p> : (
        <>
          <p className="text-zinc-500 text-xs">
            Periodo desde{ultimoCorte?.turno && NOMBRE_TURNO[ultimoCorte.turno] ? ` (corte de ${NOMBRE_TURNO[ultimoCorte.turno].toLowerCase()})` : ''}: {new Date(desde).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 text-sm">
            <Fila label={`Ventas totales (${numVentas})`} valor={fmt(totalVentas)} tenue />
            <Fila label="En caja desde el corte anterior" valor={`+${fmt(saldoInicial)}`} />
            <Fila label="Ventas en efectivo" valor={`+${fmt(ventasEf)}`} color="text-green-400" />
            <Fila label="Retiros en efectivo" valor={`−${fmt(retirosEf)}`} color="text-red-400" />
            <div className="border-t border-zinc-800 pt-2">
              <Fila label="Efectivo esperado" valor={fmt(esperado)} color="text-yellow-400" fuerte />
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1">Turno que cierras *</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Turno">
              {[['manana', 'Mañana'], ['tarde', 'Tarde']].map(([id, nombre]) => (
                <button key={id} type="button" role="radio" aria-checked={turno === id} onClick={() => setTurno(id)}
                  className={`py-3 rounded-xl text-sm font-bold border active:scale-95 transition-all
                    ${turno === id ? 'bg-yellow-400 text-zinc-950 border-yellow-400' : 'bg-zinc-900 text-zinc-300 border-zinc-800'}`}>
                  {nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1 block">Efectivo contado *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
                value={contado} onChange={e => setContado(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-7 text-white text-sm" />
            </div>
          </div>

          {diferencia !== null && (
            <p className={`text-center font-black text-lg ${diferencia === 0 ? 'text-green-400' : 'text-red-400'}`}>
              Diferencia: {diferencia > 0 ? '+' : ''}{fmt(diferencia)}
              {diferencia === 0 ? ' ✓ Cuadra' : diferencia > 0 ? ' (sobra)' : ' (falta)'}
            </p>
          )}

          <textarea placeholder="Notas (opcional)" value={notas} onChange={e => setNotas(e.target.value)} rows={2}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm" />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button onClick={cerrar} disabled={guardando}
            className="w-full bg-yellow-400 text-zinc-950 font-black py-4 rounded-2xl text-base active:scale-[0.98] transition-all disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Cerrar caja'}
          </button>
        </>
      )}
    </div>
  )
}

function Fila({ label, valor, color = 'text-white', tenue, fuerte }) {
  return (
    <div className="flex justify-between">
      <span className={tenue ? 'text-zinc-500' : 'text-zinc-300'}>{label}</span>
      <span className={`${color} ${fuerte ? 'font-black text-base' : 'font-bold'}`}>{valor}</span>
    </div>
  )
}
