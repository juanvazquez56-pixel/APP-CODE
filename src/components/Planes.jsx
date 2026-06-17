import { useState } from 'react'
import content from '../content'
import Calculadora from './Calculadora'

function whatsappPlan(c, plan) {
  const msg = `Hola, me interesa el plan ${plan.nombre} (${plan.precio}). ¿Me pueden dar más info?`
  return `https://wa.me/${c.contacto.whatsapp}?text=${encodeURIComponent(msg)}`
}

export default function Planes({ onNav }) {
  const c = content
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false)

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Planes
      </h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">Sin inscripción · Pago mensual</p>

      {/* BOTÓN CALCULADORA DE PLAN IDEAL */}
      <button
        onClick={() => setMostrarCalculadora(true)}
        className="mb-5 flex items-center justify-center gap-2 w-full py-4 rounded-2xl
          bg-gradient-to-r from-yellow-500 to-yellow-400 text-zinc-950 font-bold text-sm
          shadow-lg shadow-yellow-900/30 transition-all active:scale-96"
      >
        <span className="text-lg"></span >
        ¿NO SABES CUÁL ELEGIR? CALCULA TU PLAN IDEAL
      </button>

      {mostrarCalculadora && (
        <Calculadora onClose={() => setMostrarCalculadora(false)} />
      )}

      <div className="flex flex-col gap-4">
        {c.planes.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-2xl border overflow-hidden
              ${plan.popular
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-950/60 to-zinc-900'
                : 'border-zinc-800 bg-zinc-900'
              }`}
          >
            {plan.popular && (
              <div className="bg-yellow-400 text-zinc-950 text-xs font-black uppercase tracking-widest
                text-center py-1 px-3">
                ⭐ Más popular
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className={`font-display text-xl font-black uppercase tracking-wide
                    ${plan.popular ? 'text-yellow-400' : 'text-white'}`}>
                    {plan.nombre}
                  </h3>
                  {plan.nota && (
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      {plan.nota}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-3xl font-black
                    ${plan.popular ? 'text-yellow-400' : 'text-white'}`}>
                    {plan.precio}
                  </span>
                  <span className="text-zinc-500 text-sm">{plan.periodo}</span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm mb-3 leading-relaxed">{plan.descripcion}</p>

              <ul className="flex flex-col gap-1.5 mb-4">
                {plan.incluye.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className={`text-base ${plan.popular ? 'text-yellow-400' : 'text-green-500'}`}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={whatsappPlan(c, plan)}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-all active:scale-95
                  ${plan.popular
                    ? 'bg-yellow-400 text-zinc-950 hover:bg-yellow-300'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  }`}
              >
                Quiero este plan
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Nota al pie */}
      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
        <p className="text-zinc-400 text-sm leading-relaxed">
          {c.planesNota}
        </p>
      </div>
    </div>
  )
}
