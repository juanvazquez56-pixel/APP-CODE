import { useState } from 'react'
import content from '../content'

export default function Calculadora({ onClose }) {
  const { calculadora, planes, contacto } = content
  const [quien, setQuien] = useState(null)
  const [objetivo, setObjetivo] = useState(null)
  const [gym, setGym] = useState(null)
  const [resultado, setResultado] = useState(null)

  function buscarPlan(q, o, g) {
    const regla = calculadora.reglas.find(r =>
      r.quien === q &&
      (r.objetivo === undefined || r.objetivo === o) &&
      (r.gym === undefined || r.gym === g)
    )
    return regla ? (planes.find(p => p.nombre === regla.plan) ?? null) : null
  }

  function elegirQuien(valor) {
    setQuien(valor)
    if (!calculadora.pregunta2.soloSiInteresEs.includes(valor)) {
      setResultado(buscarPlan(valor, null, null))
    }
  }

  function elegirObjetivo(valor) {
    setObjetivo(valor)
    if (!calculadora.pregunta3.soloSiObjetivoEs.includes(valor)) {
      setResultado(buscarPlan(quien, valor, null))
    }
  }

  function elegirGym(valor) {
    setGym(valor)
    setResultado(buscarPlan(quien, objetivo, valor))
  }

  function reiniciar() {
    setQuien(null)
    setObjetivo(null)
    setGym(null)
    setResultado(null)
  }

  const mostrarP2 = quien && calculadora.pregunta2.soloSiInteresEs.includes(quien) && !objetivo
  const mostrarP3 = objetivo && calculadora.pregunta3.soloSiObjetivoEs.includes(objetivo) && !gym

  const waUrl = resultado
    ? `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(
        `Hola, hice la calculadora de plan ideal y me recomendo ${resultado.nombre}. Quiero inscribirme.`
      )}`
    : '#'

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-zinc-900 border border-yellow-500/30 rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-black uppercase tracking-wide text-yellow-400">
            Calcula tu plan ideal
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-2xl leading-none">
            &times;
          </button>
        </div>

        {resultado ? (
          <div>
            <p className="text-zinc-400 text-sm mb-3">Con base en tus respuestas, te recomendamos:</p>
            <div className="rounded-xl border border-yellow-400 bg-gradient-to-br from-yellow-950/60 to-zinc-900 p-4 mb-4">
              <p className="font-display text-2xl font-black uppercase text-yellow-400">{resultado.nombre}</p>
              <p className="text-white text-2xl font-black mt-1">
                {resultado.precio}<span className="text-zinc-500 text-sm">{resultado.periodo}</span>
              </p>
              <p className="text-zinc-400 text-sm mt-2">{resultado.descripcion}</p>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 rounded-xl font-bold text-sm bg-green-500 hover:bg-green-400 text-white transition-all active:scale-95 mb-2"
            >
              Inscribirme por WhatsApp
            </a>
            <button
              onClick={reiniciar}
              className="block w-full text-center py-2 rounded-xl text-zinc-400 text-sm border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              Volver a calcular
            </button>
          </div>
        ) : mostrarP3 ? (
          <Pregunta data={calculadora.pregunta3} onElegir={elegirGym} />
        ) : mostrarP2 ? (
          <Pregunta data={calculadora.pregunta2} onElegir={elegirObjetivo} />
        ) : (
          <Pregunta data={calculadora.pregunta1} onElegir={elegirQuien} />
        )}
      </div>
    </div>
  )
}

function Pregunta({ data, onElegir }) {
  return (
    <div>
      <p className="text-zinc-300 text-sm font-semibold mb-3">{data.texto}</p>
      <div className="flex flex-col gap-2">
        {data.opciones.map(op => (
          <button
            key={op.valor}
            onClick={() => onElegir(op.valor)}
            className="text-left py-3 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:border-yellow-500/50 text-white text-sm transition-colors"
          >
            {op.etiqueta}
          </button>
        ))}
      </div>
    </div>
  )
}
