import content from '../content'

export default function Campeones({ onNav }) {
  const { campeones } = content

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <button
        onClick={() => onNav('mas')}
        className="flex items-center gap-1 text-zinc-500 hover:text-yellow-400 text-sm mb-3 transition-colors"
      >
        <BackIcon className="w-4 h-4" /> Más
      </button>

      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Muro de Campeones
      </h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">Nuestros alumnos destacados</p>

      <div className="flex flex-col gap-4">
        {campeones.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-yellow-500/30
              bg-gradient-to-br from-yellow-950/40 to-zinc-900 p-4"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-yellow-400 shrink-0">
              <img
                src={c.foto}
                alt={c.nombre}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-display font-black uppercase tracking-wide text-yellow-400 text-base leading-tight">
                {c.nombre}
              </p>
              <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{c.logro}</p>
            </div>
            <span className="ml-auto text-2xl shrink-0">🏆</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BackIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
