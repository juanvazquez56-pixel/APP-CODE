import { useState } from 'react'
import content from '../content'

function ItemFAQ({ item, abierto, onToggle }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="font-bold text-white text-sm">{item.pregunta}</span>
        <ChevronIcon className={`w-5 h-5 text-yellow-400 shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div className="px-4 pb-4 -mt-1">
          <p className="text-zinc-400 text-sm leading-relaxed">{item.respuesta}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ({ onNav }) {
  const { faq } = content
  const [abierto, setAbierto] = useState(null)

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <button
        onClick={() => onNav('mas')}
        className="flex items-center gap-1 text-zinc-500 hover:text-yellow-400 text-sm mb-3 transition-colors"
      >
        <BackIcon className="w-4 h-4" /> Más
      </button>

      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Preguntas Frecuentes
      </h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">Toca una pregunta para ver la respuesta</p>

      <div className="flex flex-col gap-2">
        {faq.map((item, i) => (
          <ItemFAQ
            key={i}
            item={item}
            abierto={abierto === i}
            onToggle={() => setAbierto(abierto === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function BackIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
