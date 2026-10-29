import { useState } from 'react'
import content from '../content'

const { ruta } = content

// Color del número según clase del golpe
const colorGolpe = {
  recto:   'text-blue-400',
  curvo:   'text-red-400',
  uppercut:'text-green-400',
  cuerpo:  'text-purple-400',
}

export default function Ruta({ onNav }) {
  const [faseActiva, setFaseActiva] = useState(0)
  const fase = ruta.fases[faseActiva]
  const waUrl = `https://wa.me/${ruta.whatsapp}?text=${encodeURIComponent(ruta.waMensaje)}`
  const totalPeso = ruta.sesion.reduce((s, b) => s + b.peso, 0)

  return (
    <div className="flex flex-col min-h-screen">

      {/* ENCABEZADO STICKY */}
      <header className="sticky top-0 z-20 flex items-center gap-2 px-4 py-3
        bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <button
          onClick={() => onNav('mas')}
          className="flex items-center gap-1 text-yellow-400 text-sm font-semibold py-1 pr-3 active:opacity-70 transition-opacity"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Más
        </button>
        <h1 className="font-display font-bold text-base tracking-widest uppercase text-zinc-400
          mx-auto" style={{ transform: 'translateX(-18px)' }}>
          Tu ruta
        </h1>
      </header>

      <div className="px-4 pb-8 flex flex-col gap-0">

        {/* HERO */}
        <section className="relative text-center py-7 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
          </div>
          <p className="relative text-xs tracking-[0.24em] uppercase text-zinc-500">
            {ruta.hero.eyebrow}
          </p>
          <h2 className="relative font-display font-black text-5xl leading-none tracking-wide
            uppercase text-yellow-400 gold-glow mt-2">
            {ruta.hero.titulo.split(' ').slice(0, 2).join(' ')}<br />
            {ruta.hero.titulo.split(' ').slice(2).join(' ')}
          </h2>
          <p className="relative text-zinc-400 mt-2 text-sm">{ruta.hero.subtitulo}</p>
          <div className="relative grid grid-cols-3 gap-2 mt-5">
            {ruta.hero.stats.map(s => (
              <div key={s.etiqueta} className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-2">
                <b className="block font-display text-2xl font-bold text-white">{s.valor}</b>
                <span className="block text-xs text-zinc-400 mt-0.5">{s.etiqueta}</span>
              </div>
            ))}
          </div>
        </section>

        {/* REGLA */}
        <div className="flex gap-3 items-start bg-amber-500/8 border border-amber-500/35 rounded-2xl p-4 mb-6">
          <div className="w-8 h-8 shrink-0 rounded-full bg-yellow-400/15 flex items-center justify-center
            text-yellow-400 font-black text-sm">!</div>
          <p className="text-sm text-zinc-300">
            <strong className="text-yellow-400">Subes de fase por examen, no por tiempo.</strong>{' '}
            {ruta.regla.split('.').slice(1).join('.').trim()}
          </p>
        </div>

        {/* FASES */}
        <h3 className="font-display font-bold text-xl tracking-[0.14em] uppercase text-zinc-300 mb-1">
          Las 4 fases
        </h3>
        <p className="text-zinc-500 text-sm mb-4">Toca una fase para ver qué aprendes y qué te piden para avanzar.</p>

        {/* STEPPER */}
        <div className="relative grid grid-cols-4 gap-1.5 mb-4">
          {/* línea de fondo */}
          <div className="absolute top-[21px] left-[12.5%] right-[12.5%] h-0.5 bg-zinc-700" />
          {ruta.fases.map((f, i) => {
            const activo = i === faseActiva
            return (
              <button
                key={f.n}
                onClick={() => setFaseActiva(i)}
                className="relative flex flex-col items-center gap-1.5 pb-1"
              >
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center
                    font-display font-bold text-lg transition-all duration-150 z-10"
                  style={activo ? {
                    background: f.color, color: '#0a0a0a',
                    transform: 'scale(1.08)',
                    boxShadow: `0 0 0 4px ${f.color}38`,
                  } : {
                    background: '#18181b', border: '2px solid #3f3f46',
                    color: '#71717a',
                  }}
                >
                  {f.n}
                </span>
                <span className={`text-xs font-semibold text-center leading-tight
                  ${activo ? 'text-white' : 'text-zinc-500'}`}>
                  {f.nombre}
                </span>
                <span className="text-[10px] text-zinc-600 leading-tight">{f.cuando}</span>
              </button>
            )
          })}
        </div>

        {/* PANEL DE FASE */}
        <div
          key={faseActiva}
          className="animate-fade-in-up rounded-2xl p-4 border bg-zinc-900 mb-6"
          style={{ borderColor: fase.color, borderTopWidth: 3 }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: fase.color }}>
                FASE {fase.n}
              </p>
              <h4 className="font-display font-bold text-2xl uppercase leading-tight text-white">
                {fase.nombre}
              </h4>
            </div>
            <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full border"
              style={{ color: fase.color, borderColor: `${fase.color}70`, background: `${fase.color}18` }}>
              {fase.tag}
            </span>
          </div>
          <p className="text-sm text-zinc-300 mb-4">
            <strong style={{ color: fase.color }}>Meta: </strong>{fase.meta}
          </p>

          {/* Bloques */}
          {fase.bloques.map(b => (
            <div key={b.titulo} className="mb-4">
              <p className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold mb-2">{b.titulo}</p>
              <ul className="space-y-0.5">
                {b.items.map((item, j) => (
                  <li key={j} className="relative pl-5 py-1 text-sm text-zinc-300
                    border-b border-zinc-800 last:border-0">
                    <span
                      className="absolute left-0.5 top-[10px] w-2 h-2 rounded-sm rotate-45"
                      style={{ background: fase.color }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Facts: sparring + físico */}
          <div className="grid grid-cols-1 gap-2 mt-2">
            <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
              <p className="text-[11px] tracking-widest uppercase text-zinc-500 mb-1">Sparring</p>
              <p className="text-sm text-zinc-200 font-semibold">{fase.sparring}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{fase.sparringNota}</p>
            </div>
            <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
              <p className="text-[11px] tracking-widest uppercase text-zinc-500 mb-1">Tu físico</p>
              <p className="text-sm text-zinc-200">{fase.fisico}</p>
            </div>
          </div>

          {/* Examen / meta final */}
          {fase.examen ? (
            <div className="mt-4 rounded-xl p-4 border border-dashed"
              style={{ borderColor: `${fase.color}88`, background: `${fase.color}10` }}>
              <p className="font-display font-bold text-base tracking-wide uppercase mb-3"
                style={{ color: fase.color }}>
                Examen para pasar a la Fase {fase.examen.para}
              </p>
              <div className="space-y-3">
                {fase.examen.filas.map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[11px] tracking-widest uppercase text-zinc-500">{k}</p>
                    <p className="text-sm text-zinc-200 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl p-4 text-center
              bg-gradient-to-br from-yellow-400/16 to-zinc-900 border border-yellow-400/45">
              <p className="font-display font-bold text-lg tracking-wide uppercase text-yellow-400">
                Tu meta final
              </p>
              <p className="text-sm text-zinc-300 mt-1">{fase.metaFinal}</p>
            </div>
          )}
        </div>

        {/* TU SEMANA */}
        <h3 className="font-display font-bold text-xl tracking-[0.14em] uppercase text-zinc-300 mb-1">
          Tu semana
        </h3>
        <p className="text-zinc-500 text-sm mb-4">Cada día tiene un enfoque fijo. Lo que cambia entre fases es el contenido y la intensidad.</p>
        <div className="flex flex-col gap-2 mb-4">
          {ruta.semana.map(d => (
            <div key={d.dia} className="grid gap-3 items-center bg-zinc-900 border border-zinc-800
              rounded-2xl p-3" style={{ gridTemplateColumns: '46px 1fr auto' }}>
              <div className="font-display font-bold text-base text-yellow-400 text-center
                bg-yellow-400/10 rounded-xl py-2">
                {d.dia}
              </div>
              <p className="text-sm leading-snug text-zinc-200">{d.descripcion}</p>
              <div className="flex flex-col items-end gap-1 text-xs text-zinc-500 shrink-0">
                <span>{d.intensidad}</span>
                <span className="flex gap-0.5">
                  {[1, 2, 3].map(k => (
                    <span key={k} className={`w-2 h-2 rounded-full ${k <= d.nivel ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* SESIÓN */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <p className="text-[11px] tracking-widest uppercase text-zinc-500 mb-3">
            Así es cada sesión · 75–90 min
          </p>
          {/* Barra proporcional */}
          <div className="flex h-3.5 rounded-full overflow-hidden gap-0.5">
            {ruta.sesion.map(b => (
              <div key={b.nombre} style={{ flex: b.peso, background: b.color }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {ruta.sesion.map(b => (
              <li key={b.nombre} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: b.color }} />
                <span className="flex-1">{b.nombre}</span>
                <span className="text-zinc-500 text-xs font-medium whitespace-nowrap">{b.duracion}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            Los rounds son de 3 min de trabajo y 1 min de descanso. Para menores de 15 años: 2 min y 1 min.
          </p>
        </div>

        {/* LOS 8 GOLPES */}
        <h3 className="font-display font-bold text-xl tracking-[0.14em] uppercase text-zinc-300 mb-1">
          Los 8 golpes NK
        </h3>
        <p className="text-zinc-500 text-sm mb-4">
          Todo el plan se habla en números. Apréndete los 8 y entenderás cualquier combinación.
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {ruta.golpes.map(g => (
            <div key={g.numero} className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-1 text-center">
              <b className={`block font-display text-3xl font-bold leading-none ${colorGolpe[g.clase]}`}>
                {g.numero}
              </b>
              <span className="block text-[11px] text-zinc-300 mt-1 leading-tight">{g.nombre}</span>
            </div>
          ))}
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 mb-6 text-sm text-zinc-300">
          <strong className="text-yellow-400">Ejemplo:</strong> "1-2-3" es jab, cross y volado izquierdo.
          El entrenador te las canta a la voz y por número.
        </div>

        {/* SPARRING Y SEGURIDAD */}
        <h3 className="font-display font-bold text-xl tracking-[0.14em] uppercase text-zinc-300 mb-1">
          Sparring y seguridad
        </h3>
        <p className="text-zinc-500 text-sm mb-4">
          Quieres llegar sano a la pelea y seguir entrenando después de ella.
        </p>
        <div className="flex flex-col gap-2 mb-8">
          {/* Equipo */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-2">Equipo obligatorio para sparring</p>
            <div className="flex flex-wrap gap-2">
              {ruta.seguridad.equipo.map(e => (
                <span key={e} className="text-xs border border-zinc-700 rounded-full px-3 py-1 text-zinc-300 bg-zinc-800">
                  {e}
                </span>
              ))}
            </div>
          </div>
          {/* Reglas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-2">Reglas fijas</p>
            <ul className="space-y-1">
              {ruta.seguridad.reglas.map((r, i) => (
                <li key={i} className="relative pl-4 text-sm text-zinc-300 before:content-['•']
                  before:absolute before:left-0 before:text-yellow-400">
                  {r}
                </li>
              ))}
            </ul>
          </div>
          {/* Alerta */}
          <div className="bg-red-950/50 border border-red-800/60 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-300 mb-1.5">
              Si sientes esto después de un golpe, para
            </p>
            <p className="text-sm text-zinc-300">{ruta.seguridad.alerta}</p>
          </div>
          {/* Cuidado */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-2">Cuídate fuera del gym</p>
            <ul className="space-y-1">
              {ruta.seguridad.cuidado.map((c, i) => (
                <li key={i} className="relative pl-4 text-sm text-zinc-300 before:content-['•']
                  before:absolute before:left-0 before:text-yellow-400">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA WHATSAPP */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 py-4 rounded-2xl
            bg-green-500 text-white font-bold text-base
            shadow-lg shadow-green-900/35 active:scale-[0.97] transition-all"
        >
          <WhatsAppIcon />
          Pregúntale a tu entrenador
        </a>
        <p className="text-center text-xs text-zinc-600 mt-3">
          Los tiempos y exigencias los confirma tu entrenador según tu avance.
        </p>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88M20.46 3.49A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42"/>
    </svg>
  )
}
