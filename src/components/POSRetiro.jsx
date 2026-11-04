import { useState } from 'react'
import { supabase } from '../supabaseClient'

const TIPOS = ['nomina', 'gasto']
const METODOS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia']

export default function POSRetiro() {
  const [tipo, setTipo] = useState('nomina')
  const [concepto, setConcepto] = useState('')
  const [beneficiario, setBeneficiario] = useState('')
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState('Efectivo')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [ultimoRetiro, setUltimoRetiro] = useState(null)

  async function guardar(e) {
    e.preventDefault()
    if (!concepto.trim()) { setError('El concepto es obligatorio'); return }
    const montoNum = parseFloat(monto)
    if (!monto || isNaN(montoNum) || montoNum <= 0) { setError('Ingresa un monto válido'); return }

    setGuardando(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase.from('retiros').insert({
      tipo,
      concepto: concepto.trim(),
      beneficiario: beneficiario.trim() || null,
      monto: montoNum,
      metodo_pago: metodo,
      usuario_id: user.id,
    }).select().single()

    if (err) { setError('Error al guardar: ' + err.message); setGuardando(false); return }

    setUltimoRetiro(data)
    setConfirmado(true)
    setGuardando(false)
  }

  function nuevo() {
    setTipo('nomina')
    setConcepto('')
    setBeneficiario('')
    setMonto('')
    setMetodo('Efectivo')
    setError('')
    setConfirmado(false)
    setUltimoRetiro(null)
  }

  if (confirmado) return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="font-black text-white text-xl mb-1">Retiro registrado</h3>
      <p className="text-red-400 font-bold text-2xl mb-1">−${Number(ultimoRetiro.monto).toLocaleString('es-MX')}</p>
      <p className="text-zinc-400 text-sm">{ultimoRetiro.concepto} · {ultimoRetiro.metodo_pago}</p>
      <p className="text-zinc-500 text-xs mt-1 capitalize">{ultimoRetiro.tipo}</p>
      <button onClick={nuevo}
        className="mt-8 bg-zinc-800 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-all">
        Nuevo retiro
      </button>
    </div>
  )

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-2">
        <p className="text-red-400 text-xs font-bold">⚠️ Esta pantalla es para nómina y gastos — salidas de dinero. No la uses para ventas.</p>
      </div>

      <h3 className="font-bold text-white text-base">Retiro</h3>

      {/* Tipo */}
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block">Tipo</label>
        <div className="flex gap-2">
          {TIPOS.map(t => (
            <button key={t} type="button" onClick={() => setTipo(t)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm capitalize transition-all
                ${tipo === t ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
              {t === 'nomina' ? 'Nómina' : 'Gasto'}
            </button>
          ))}
        </div>
      </div>

      {/* Concepto */}
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1 block">
          Concepto *
        </label>
        <input
          placeholder={tipo === 'nomina' ? 'Ej: Nómina Iker' : 'Ej: Renta, Luz, Consumibles'}
          value={concepto}
          onChange={e => setConcepto(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm"
          required
        />
      </div>

      {/* Beneficiario */}
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1 block">
          Beneficiario
        </label>
        <input
          placeholder="Ej: Iker, Propietario, CFE"
          value={beneficiario}
          onChange={e => setBeneficiario(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm"
        />
      </div>

      {/* Monto */}
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1 block">
          Monto *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-7 text-white text-sm"
            required
          />
        </div>
      </div>

      {/* Método */}
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block">Método de pago</label>
        <div className="flex flex-wrap gap-2">
          {METODOS.map(m => (
            <button key={m} type="button" onClick={() => setMetodo(m)}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-all
                ${metodo === m ? 'bg-zinc-200 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button type="submit" disabled={guardando}
        className="w-full bg-red-500 text-white font-black py-4 rounded-2xl text-base mt-2 active:scale-[0.98] transition-all disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Registrar retiro'}
      </button>
    </form>
  )
}
