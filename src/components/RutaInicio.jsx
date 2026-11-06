// Pantalla principal de "Mi Ruta": una versión pública (sin entrar) y otra personal (con su avance).
import content from '../content'
import { FASES, estadoFase } from '../rutaAvance'
import RutaEntrar from './RutaEntrar'
import {
  ORO, tinte, Resplandor, Anillo, Barra, Ficha, Titulo,
  IcoPalomita, IcoCandado, IcoBandera, IcoFlecha, IcoChevron, IcoRayo, IcoWhatsApp,
} from './RutaUI'

const { ruta } = content
const nombreFase = n => FASES.find(f => f.n === n)
const cuando = n => ruta.fases.find(f => f.n === n).cuando

function EnlaceSemana({ onSemana }) {
  return (
    <button onClick={onSemana}
      className="w-full flex items-center justify-between min-h-[56px] px-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-[15px] font-semibold active:opacity-80">
      Tu semana y los 8 golpes
      <span className="text-zinc-400"><IcoChevron /></span>
    </button>
  )
}

function BotonWhatsApp({ waUrl }) {
  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center gap-2.5 min-h-[52px] rounded-2xl bg-green-500 text-green-950 font-bold text-[15px] active:scale-[0.98]">
      <IcoWhatsApp />Pregúntale a tu entrenador
    </a>
  )
}

// ────────────────────────── SIN ENTRAR ──────────────────────────
function Publica({ a, onFase, onSemana, waUrl }) {
  const palabras = ruta.hero.titulo.split(' ')
  return (
    <>
      <section className="relative px-5 pt-[34px] text-center">
        <p className="text-[11px] font-bold tracking-[0.22em] text-zinc-400 uppercase">{ruta.hero.eyebrow}</p>
        <h2 className="font-display text-[54px] leading-[0.98] tracking-[0.03em] uppercase mt-2.5 gold-glow whitespace-nowrap" style={{ color: ORO }}>
          {palabras.slice(0, 2).join(' ')}<br />{palabras.slice(2).join(' ')}
        </h2>
        <p className="mt-3 text-sm text-zinc-300">{ruta.hero.subtitulo}</p>
        <div className="grid grid-cols-3 gap-2 mt-[22px]">
          {ruta.hero.stats.map(s => (
            <div key={s.etiqueta} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-1.5 py-3">
              <b className="block font-display text-[26px] font-normal">{s.valor}</b>
              <span className="text-[11px] font-bold tracking-[0.1em] text-zinc-400 uppercase">{s.etiqueta}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="relative px-4 mt-6"><RutaEntrar a={a} /></div>

      <section className="relative px-4 pt-7">
        <Titulo sub="Toca una fase para ver qué aprendes y qué te piden.">Así es el camino</Titulo>
        <div className="relative grid grid-cols-4 gap-1.5">
          <div aria-hidden="true" className="absolute rounded-full opacity-50"
            style={{ left: '12.5%', right: '12.5%', top: 20, height: 5, background: `linear-gradient(90deg, ${FASES.map(f => f.color).join(',')})` }} />
          {FASES.map(f => (
            <button key={f.n} onClick={() => onFase(f.n)} className="relative text-center active:opacity-80">
              <span className="font-display flex items-center justify-center w-[46px] h-[46px] mx-auto rounded-full text-[22px] text-zinc-950"
                style={{ background: f.color }}>{f.n}</span>
              <span className="block mt-2 text-xs font-bold text-white">{f.nombre}</span>
              <span className="block mt-0.5 text-[11px] text-zinc-400">{cuando(f.n)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="relative px-4 mt-7 flex flex-col gap-3">
        <div className="flex gap-3 items-start rounded-[18px] p-4 bg-zinc-900 border" style={{ borderColor: tinte(ORO, 0.33) }}>
          <span className="font-display flex-none w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: tinte(ORO, 0.15), color: ORO }}>!</span>
          <p className="text-[13px] leading-normal text-zinc-300">
            <b style={{ color: ORO }}>Subes de fase por examen, no por tiempo.</b>{' '}
            {ruta.regla.split('.').slice(1).join('.').trim()}
          </p>
        </div>
        <EnlaceSemana onSemana={onSemana} />
        <BotonWhatsApp waUrl={waUrl} />
        <p className="text-center text-xs text-zinc-500">Los tiempos y exigencias los confirma tu entrenador según tu avance.</p>
      </section>
    </>
  )
}

// ────────────────────────── CON SESIÓN ──────────────────────────
function siguientePaso(av) {
  const fase = nombreFase(av.faseActual)
  const af = av.fases.find(f => f.n === av.faseActual)
  if (av.completo) {
    return { titulo: 'Completaste la ruta', texto: 'Terminaste las 4 fases. Sigue entrenando con tu entrenador.', pendientes: [], boton: 'Ver mi fase' }
  }
  const faltanTemas = fase.temas.map((t, i) => ({ ...t, i })).filter(t => !av.temaMarcado(fase.n, t.i))
  if (faltanTemas.length) {
    const n = faltanTemas.length
    const meta = fase.criterios.length ? 'para tu examen' : 'para completar tu ruta'
    return {
      titulo: `${n === 1 ? 'Te falta 1 tema' : `Te faltan ${n} temas`} ${meta}`,
      pendientes: faltanTemas.slice(0, 3).map(t => t.texto),
      boton: 'Ver mi fase completa',
    }
  }
  const faltanCriterios = fase.criterios.filter(c => !av.criterioMarcado(fase.n, c.id))
  return {
    titulo: 'Ya estás listo para tu examen',
    texto: `Tienes todos los temas. Te falta aprobar ${af.criteriosTotal - af.criteriosHechos === 1 ? 'un criterio' : `${af.criteriosTotal - af.criteriosHechos} criterios`} del examen.`,
    pendientes: faltanCriterios.slice(0, 3).map(c => `${c.etiqueta}: ${c.texto}`),
    boton: 'Ver mi fase completa',
  }
}

function FilaCamino({ f, av, ultima, onFase }) {
  const est = estadoFase(av, f.n)
  const af = av.fases.find(x => x.n === f.n)
  const sig = FASES.find(x => x.n === f.n + 1)
  const esMeta = f.criterios.length === 0

  const nodo = {
    ok: { background: f.color, color: '#09090b', border: 'none' },
    actual: { background: '#09090b', color: '#fff', border: `3px solid ${f.color}`, boxShadow: `0 0 0 5px #09090b, 0 0 24px ${tinte(f.color, 0.67)}` },
    bloqueada: { background: '#18181b', color: '#a1a1aa', border: '2px solid #3f3f46' },
  }[est]
  const sombra = est === 'actual' ? {} : { boxShadow: '0 0 0 5px #09090b' }

  const tarjeta = {
    ok: { background: '#18181b', border: '1px solid #27272a' },
    actual: { background: `linear-gradient(160deg, ${tinte(f.color, 0.16)} 0%, #18181b 60%)`, border: `1px solid ${f.color}` },
    bloqueada: { background: '#111113', border: `1px dashed ${esMeta ? tinte(ORO, 0.33) : '#3f3f46'}` },
  }[est]

  return (
    <li className="relative flex gap-3.5 items-start">
      {!ultima && (
        <span aria-hidden="true" className="absolute z-0" style={{
          left: 21, top: 24, bottom: -14, width: 0,
          ...(est === 'ok'
            ? { width: 3, borderRadius: 2, background: `linear-gradient(${f.color}, ${sig.color})` }
            : { borderLeft: '3px dashed #3f3f46' }),
        }} />
      )}
      <span className="font-display relative z-10 flex-none w-[46px] h-[46px] rounded-full flex items-center justify-center text-[22px] box-border"
        style={{ ...nodo, ...sombra }} aria-hidden="true">
        {est === 'ok' ? <IcoPalomita size={24} grosor={3} />
          : est === 'bloqueada' ? (esMeta ? <span style={{ color: ORO }}><IcoBandera size={20} /></span> : <IcoCandado size={20} />)
          : f.n}
      </span>

      <button onClick={() => onFase(f.n)} aria-label={`Fase ${f.n}, ${f.nombre}`}
        className="flex-1 min-w-0 text-left rounded-[18px] active:opacity-85"
        style={{ ...tarjeta, padding: est === 'actual' ? 16 : 14 }}>
        {est === 'actual' && (
          <span className="inline-block text-[11px] font-bold tracking-[0.16em] rounded-full px-2.5 py-1 mb-2.5 text-zinc-950"
            style={{ background: f.color }}>ESTÁS AQUÍ</span>
        )}
        <div className="flex justify-between items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: f.color }}>
            FASE {f.n} · {cuando(f.n).toUpperCase()}
          </span>
          {est === 'ok' && (
            <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5 border whitespace-nowrap"
              style={{ color: f.color, borderColor: tinte(f.color, 0.53) }}>APROBADA</span>
          )}
        </div>
        <h3 className={`font-display tracking-[0.03em] uppercase mt-1.5 ${est === 'actual' ? 'text-[26px] text-white' : 'text-[22px]'} ${est === 'bloqueada' ? 'text-zinc-300' : est === 'ok' ? 'text-white' : ''}`}>
          {f.nombre}
        </h3>

        {est === 'ok' && (
          <p className="mt-1 text-xs text-zinc-400">
            {af.temasHechos === af.temasTotal
              ? `${af.temasTotal} temas${f.criterios.length ? ' y examen completos' : ' completos'}`
              : 'Examen aprobado'}
          </p>
        )}
        {est === 'bloqueada' && (
          <p className="mt-1 text-xs leading-snug text-zinc-400">
            {esMeta ? ruta.fases.find(x => x.n === f.n).metaFinal : `Se abre al aprobar el examen de la Fase ${f.n - 1}.`}
          </p>
        )}
        {est === 'actual' && (
          <>
            <p className="mt-2 mb-3.5 text-[13px] leading-snug text-zinc-300">{ruta.fases.find(x => x.n === f.n).meta}</p>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Temas</span><b className="text-white">{af.temasHechos} de {af.temasTotal}</b>
            </div>
            <Barra pct={(af.temasHechos / af.temasTotal) * 100} color={f.color} etiqueta={`${af.temasHechos} de ${af.temasTotal} temas`} />
            {f.criterios.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-[11px] font-bold tracking-[0.16em] text-zinc-400">EXAMEN PARA LA FASE {f.examenPara}</p>
                <div className="flex gap-2 flex-wrap">
                  {f.criterios.map(c => {
                    const hecho = av.criterioMarcado(f.n, c.id)
                    return (
                      <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 border-[1.5px]"
                        style={hecho
                          ? { background: '#22c55e22', borderColor: '#22c55e', color: '#86efac' }
                          : { borderColor: '#71717a', color: '#d4d4d8' }}>
                        {hecho && <IcoPalomita size={13} grosor={3.4} />}{c.etiqueta}
                        <span className="sr-only">{hecho ? ' aprobado' : ' pendiente'}</span>
                      </span>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </button>
    </li>
  )
}

function Personal({ a, onFase, onSemana, waUrl }) {
  const { avance: av, nombre } = a
  const fase = nombreFase(av.faseActual)
  const af = av.fases.find(f => f.n === av.faseActual)
  const sp = siguientePaso(av)
  const aprobadas = av.fases.filter(f => f.aprobada).length
  const colorFase = fase.color

  return (
    <>
      <section className="relative px-5 pt-[26px] pb-2 text-center">
        <p className="text-[11px] font-bold tracking-[0.22em] text-zinc-400 uppercase">NK BOX · De cero a competidor</p>
        <h2 className="font-display text-[50px] leading-none tracking-[0.03em] uppercase mt-2">
          Hola, <span style={{ color: ORO, textShadow: '0 0 28px rgba(251,191,36,0.55)' }}>{nombre}</span>
        </h2>
        <p className="mt-2.5 text-sm text-zinc-300 flex items-center justify-center gap-2">
          <span className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: colorFase }} />
          {av.completo
            ? <>Completaste la ruta · <b className="text-white">Competidor</b></>
            : <>Vas en la <b className="text-white">Fase {fase.n} · {fase.nombre}</b></>}
        </p>

        <div className="mt-[22px]"><Anillo pct={av.pct} /></div>

        <div className="grid grid-cols-3 gap-2 mt-[22px]">
          <Ficha valor={fase.n} total={FASES.length} etiqueta="FASE" />
          <Ficha valor={af.temasHechos} total={af.temasTotal} etiqueta="TEMAS" />
          {af.criteriosTotal > 0
            ? <Ficha valor={af.criteriosHechos} total={af.criteriosTotal} etiqueta="EXAMEN" />
            : <Ficha valor={aprobadas} total={FASES.length} etiqueta="APROBADAS" />}
        </div>
      </section>

      <section className="relative mx-4 mt-[22px] rounded-[22px] p-[18px] border"
        style={{ background: 'linear-gradient(160deg,#27210b 0%,#18181b 55%)', borderColor: tinte(ORO, 0.4) }}>
        <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em]" style={{ color: ORO }}>
          <IcoRayo />TU SIGUIENTE PASO
        </p>
        <h2 className="font-display text-[27px] leading-[1.1] tracking-[0.02em] uppercase mt-2 mb-3">{sp.titulo}</h2>
        {sp.texto && <p className="text-[13px] leading-snug text-zinc-300 mb-3">{sp.texto}</p>}
        {sp.pendientes.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {sp.pendientes.map((t, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span aria-hidden="true" className="flex-none w-5 h-5 rounded-full border-2 border-zinc-500 mt-px box-border" />
                <span className="text-[13px] leading-snug text-zinc-200">{t}</span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => onFase(fase.n)}
          className="mt-4 w-full flex items-center justify-center gap-2 min-h-[48px] rounded-[14px] text-zinc-950 font-bold text-[15px] active:scale-[0.98]"
          style={{ background: ORO }}>
          {sp.boton}<IcoFlecha />
        </button>
      </section>

      <section className="relative px-4 pt-7">
        <Titulo sub="Subes de fase por examen, no por tiempo.">Tu camino</Titulo>
        <ol className="relative flex flex-col gap-3.5">
          {FASES.map((f, i) => (
            <FilaCamino key={f.n} f={f} av={av} ultima={i === FASES.length - 1} onFase={onFase} />
          ))}
        </ol>
      </section>

      <section className="relative px-4 pt-6 flex flex-col gap-3">
        <EnlaceSemana onSemana={onSemana} />
        <BotonWhatsApp waUrl={waUrl} />
        <p className="text-center text-xs text-zinc-400">
          Tu entrenador actualiza tu avance en cada evaluación.{' '}
          <button onClick={a.salir} className="underline underline-offset-2 min-h-[44px] px-1">No soy {nombre}</button>
        </p>
      </section>
    </>
  )
}

export default function RutaInicio({ a, onFase, onSemana, waUrl }) {
  const entro = a.sesion
  return (
    <div className="relative overflow-hidden pb-8">
      <Resplandor />
      {!entro && <Publica a={a} onFase={onFase} onSemana={onSemana} waUrl={waUrl} />}
      {entro && !a.avance && (
        <p className="relative px-6 pt-16 text-center text-sm text-zinc-400" role="status">
          {a.errorCarga || 'Cargando tu avance...'}
        </p>
      )}
      {entro && a.avance && <Personal a={a} onFase={onFase} onSemana={onSemana} waUrl={waUrl} />}
    </div>
  )
}
