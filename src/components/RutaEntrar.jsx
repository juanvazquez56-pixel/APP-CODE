// Tarjeta para que el alumno entre con su celular (reemplaza a MiAvance.jsx).
import { ORO } from './RutaUI'

export default function RutaEntrar({ a }) {
  const { celular, setCelular, msg, ocupado, candidato, buscar, confirmar, volver } = a
  const caja = 'relative rounded-[22px] p-[18px] border'
  const estilo = { background: 'linear-gradient(160deg,#27210b 0%,#18181b 60%)', borderColor: '#fbbf2466' }

  if (candidato) {
    return (
      <section className={caja} style={estilo}>
        <p className="text-[11px] font-bold tracking-[0.2em]" style={{ color: ORO }}>CONFIRMA QUE ERES TÚ</p>
        <h2 className="font-display text-[27px] leading-[1.1] tracking-wide uppercase mt-2">¿Eres {candidato.nombre}?</h2>
        <p className="text-[13px] text-zinc-300 mt-2">Solo te lo preguntamos esta vez. Te quedas dentro en este celular.</p>
        <div className="flex gap-2 mt-4">
          <button onClick={volver}
            className="flex-1 min-h-[50px] rounded-[14px] bg-zinc-800 text-zinc-300 font-bold active:scale-95">No, volver</button>
          <button onClick={confirmar}
            className="flex-1 min-h-[50px] rounded-[14px] text-zinc-950 font-bold active:scale-95" style={{ background: ORO }}>Sí, soy yo</button>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={buscar} className={caja} style={estilo}>
      <p className="text-[11px] font-bold tracking-[0.2em]" style={{ color: ORO }}>TU AVANCE</p>
      <h2 className="font-display text-[27px] leading-[1.1] tracking-wide uppercase mt-2 mb-1.5">Entra con tu celular</h2>
      <p className="text-[13px] leading-snug text-zinc-300 mb-3.5">
        Escribe el número que registraste en recepción para ver en qué fase vas y qué te falta.
      </p>
      <label htmlFor="ruta-celular" className="block text-[11px] font-bold tracking-[0.14em] text-zinc-400 mb-1.5">CELULAR</label>
      <input id="ruta-celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="442 123 4567" maxLength={20}
        value={celular} onChange={e => setCelular(e.target.value)} required
        className="w-full min-h-[52px] bg-zinc-950 border-[1.5px] border-zinc-700 rounded-[14px] px-4 text-white text-xl tracking-[0.06em]
          placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400" />
      {msg && <p role="alert" className="mt-3 text-[13px] leading-snug" style={{ color: ORO }}>{msg}</p>}
      <button type="submit" disabled={ocupado}
        className="mt-3 w-full min-h-[50px] rounded-[14px] text-zinc-950 font-bold text-base active:scale-[0.98] disabled:opacity-50"
        style={{ background: ORO }}>
        {ocupado ? 'Buscando...' : 'Entrar'}
      </button>
      <p className="mt-3 text-xs leading-snug text-zinc-400">
        Te preguntamos tu nombre una sola vez y te quedas dentro en este celular.
      </p>
    </form>
  )
}
