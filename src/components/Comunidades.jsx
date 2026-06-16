import { useState } from 'react'
import content from '../content'

const acentoClases = {
  blue: {
    borde:       'border-blue-500/50',
    bordeFocus:  'focus:border-blue-400',
    bg:          'bg-blue-900/20',
    texto:       'text-blue-400',
    boton:       'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
    badge:       'bg-blue-900/50 border-blue-500/30 text-blue-300',
    aviso:       'border-blue-500/30 bg-blue-950/30',
    avisoTitulo: 'text-blue-300',
  },
  red: {
    borde:       'border-red-500/50',
    bordeFocus:  'focus:border-red-400',
    bg:          'bg-red-900/20',
    texto:       'text-red-400',
    boton:       'bg-red-700 hover:bg-red-600 active:bg-red-800',
    badge:       'bg-red-900/50 border-red-500/30 text-red-300',
    aviso:       'border-red-500/30 bg-red-950/30',
    avisoTitulo: 'text-red-300',
  },
}

function TarjetaComunidad({ comunidad }) {
  const [abierta, setAbierta] = useState(false)
  const [intentando, setIntentando] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [mostrarPass, setMostrarPass] = useState(false)

  const ac = acentoClases[comunidad.acento] ?? acentoClases.blue

  function intentarAcceso(e) {
    e.preventDefault()
    if (input.trim() === comunidad.password) {
      setAbierta(true)
      setError(false)
      setIntentando(false)
      setInput('')
    } else {
      setError(true)
      setInput('')
    }
  }

  function cerrar() {
    setAbierta(false)
    setIntentando(false)
    setInput('')
    setError(false)
  }

  // Vista: DESBLOQUEADA — muestra avisos
  if (abierta) {
    return (
      <div className={`rounded-2xl border ${ac.borde} ${ac.bg} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{comunidad.emoji}</span>
            <div>
              <p className={`font-display font-black uppercase tracking-wide text-base ${ac.texto}`}>
                {comunidad.nombre}
              </p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span>🔓</span> Acceso activo
              </p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="text-zinc-500 hover:text-zinc-300 text-xs border border-zinc-700
              rounded-lg px-2 py-1 transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Avisos */}
        <div className="p-4 flex flex-col gap-3">
          {comunidad.avisos.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No hay avisos por ahora. Vuelve pronto.
            </p>
          ) : (
            comunidad.avisos.map((aviso, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${ac.aviso}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`font-bold text-sm leading-tight ${ac.avisoTitulo}`}>
                    {aviso.titulo}
                  </p>
                  <span className="text-xs text-zinc-500 shrink-0">{aviso.fecha}</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{aviso.texto}</p>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // Vista: PIDIENDO CONTRASEÑA
  if (intentando) {
    return (
      <div className={`rounded-2xl border ${ac.borde} ${ac.bg} p-4`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{comunidad.emoji}</span>
          <p className={`font-display font-black uppercase tracking-wide ${ac.texto}`}>
            {comunidad.nombre}
          </p>
        </div>

        <p className="text-zinc-400 text-sm mb-4">
          Ingresa la contraseña de tu comunidad:
        </p>

        <form onSubmit={intentarAcceso} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={mostrarPass ? 'text' : 'password'}
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="Contraseña"
              autoFocus
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-white
                text-sm outline-none transition-colors pr-12
                ${error ? 'border-red-500' : `border-zinc-700 ${ac.bordeFocus}`}`}
            />
            <button
              type="button"
              onClick={() => setMostrarPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500
                hover:text-zinc-300 transition-colors text-xs"
              tabIndex={-1}
            >
              {mostrarPass ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">
              Contraseña incorrecta. Intenta de nuevo o pide la clave a tu instructor.
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setIntentando(false); setInput(''); setError(false) }}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400
                text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl text-white text-sm font-bold
                transition-all active:scale-95 ${ac.boton}`}
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Vista: BLOQUEADA (default)
  return (
    <button
      onClick={() => setIntentando(true)}
      className={`w-full text-left rounded-2xl border border-zinc-800 bg-zinc-900
        hover:border-zinc-600 active:scale-[0.98] transition-all p-4 flex items-center gap-4`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
        ${ac.bg} border ${ac.borde} shrink-0`}>
        {comunidad.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-display font-black uppercase tracking-wide text-base ${ac.texto}`}>
          {comunidad.nombre}
        </p>
        <p className="text-zinc-500 text-xs mt-0.5 truncate">{comunidad.descripcion}</p>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-1">
        <LockIcon className="w-5 h-5 text-zinc-500" />
        <span className="text-xs text-zinc-600">Acceder</span>
      </div>
    </button>
  )
}

export default function Comunidades() {
  const { comunidades } = content

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Comunidades
      </h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">
        Zonas privadas para planes especiales · Acceso con contraseña
      </p>

      <div className="flex flex-col gap-4">
        {comunidades.map((c, i) => (
          <TarjetaComunidad key={i} comunidad={c} />
        ))}
      </div>

      {/* Aviso de seguridad visible al usuario */}
      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-zinc-500 text-xs leading-relaxed text-center">
          🔒 El acceso es por contraseña básica. No compartas información personal ni financiera en esta sección.
          Pide tu clave a tu instructor por WhatsApp.
        </p>
      </div>
    </div>
  )
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
