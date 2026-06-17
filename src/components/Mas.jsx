import content from '../content'

// Lista de accesos editable en src/content.js (campo "masAccesos")

export default function Mas({ onNav }) {
  const { masAccesos } = content

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Más
      </h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">Otras secciones de la app</p>

      <div className="flex flex-col gap-2">
        {masAccesos.map(acceso => (
          <button
            key={acceso.id}
            onClick={() => onNav(acceso.id)}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800
              hover:border-yellow-500/50 active:scale-[0.98] rounded-xl p-4
              transition-all text-left"
          >
            <span className="text-2xl shrink-0">{acceso.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{acceso.label}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{acceso.descripcion}</p>
            </div>
            <ChevronIcon className="w-5 h-5 text-zinc-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
