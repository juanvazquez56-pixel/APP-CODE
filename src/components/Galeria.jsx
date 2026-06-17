import { useState } from 'react'
import content from '../content'

export default function Galeria({ onNav }) {
  const { galeria } = content
  const [seleccionada, setSeleccionada] = useState(null)

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <button
        onClick={() => onNav('mas')}
        className="flex items-center gap-1 text-zinc-500 hover:text-yellow-400 text-sm mb-3 transition-colors"
      >
        <BackIcon className="w-4 h-4" /> Más
      </button>

      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Galería
      </h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">Toca una foto para verla más grande</p>

      <div className="grid grid-cols-2 gap-3">
        {galeria.map((foto, i) => (
          <button
            key={i}
            onClick={() => setSeleccionada(foto)}
            className="aspect-square rounded-xl overflow-hidden border border-zinc-800
              hover:border-yellow-500/50 transition-colors"
          >
            <img
              src={foto.imagen}
              alt={foto.descripcion}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* MODAL */}
      {seleccionada && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSeleccionada(null)}
        >
          <div className="max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={seleccionada.imagen}
              alt={seleccionada.descripcion}
              className="max-w-full max-h-[75vh] rounded-xl border border-yellow-500/30 object-contain"
            />
            <p className="text-zinc-300 text-sm mt-3 text-center">{seleccionada.descripcion}</p>
            <button
              onClick={() => setSeleccionada(null)}
              className="mt-4 px-5 py-2 rounded-xl bg-yellow-400 text-zinc-950 font-bold text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
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
