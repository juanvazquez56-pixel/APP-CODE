// Detalle de una fase: qué se aprende, cómo es el examen y (si el alumno entró) qué lleva hecho.
import content from '../content'
import { FASES, estadoFase } from '../rutaAvance'
import { ORO, tinte, Resplandor, Barra, IcoPalomita, IcoCandado } from './RutaUI'

const { ruta } = content

function Pestanas({ n, av, onSelect }) {
  return (
    <div className="relative grid grid-cols-4 gap-2 px-4 pt-4" role="tablist" aria-label="Fases">
      {FASES.map(f => {
        const sel = f.n === n
        const est = av ? estadoFase(av, f.n) : null
        let estilo, contenido, etiqueta = `Fase ${f.n}, ${f.nombre}`
        if (sel) {
          estilo = { background: f.color, color: '#09090b', boxShadow: `0 0 20px ${tinte(f.color, 0.53)}` }
          contenido = <span className="font-display text-xl">{f.n}</span>
          etiqueta += ', la que estás viendo'
        } else if (est === 'ok') {
          estilo = { background: '#18181b', border: `1px solid ${tinte(f.color, 0.53)}`, color: f.color }
          contenido = <><IcoPalomita size={16} /><span className="font-display text-base ml-1">{f.n}</span></>
          etiqueta += ', aprobada'
        } else if (est === 'bloqueada') {
          estilo = { background: '#18181b', border: '1px solid #3f3f46', color: '#a1a1aa' }
          contenido = <IcoCandado size={17} />
          etiqueta += ', bloqueada'
        } else {
          estilo = { background: '#18181b', border: '1px solid #3f3f46', color: '#d4d4d8' }
          contenido = <span className="font-display text-xl">{f.n}</span>
        }
        return (
          <button key={f.n} role="tab" aria-selected={sel} aria-label={etiqueta} onClick={() => onSelect(f.n)}
            className="flex items-center justify-center min-h-[46px] rounded-[14px] active:opacity-80" style={estilo}>
            {contenido}
          </button>
        )
      })}
    </div>
  )
}

function Palomita({ color }) {
  return (
    <span className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-zinc-950" style={{ background: color }}>
      <IcoPalomita size={14} grosor={3.4} />
    </span>
  )
}

export default function RutaFase({ n, av, onSelect }) {
  const f = FASES.find(x => x.n === n)
  const datos = ruta.fases.find(x => x.n === n)
  const est = av ? estadoFase(av, n) : null
  const af = av ? av.fases.find(x => x.n === n) : null
  const conMarcas = !!av && est !== 'bloqueada'
  let indice = 0

  return (
    <div className="relative overflow-hidden pb-8">
      <Resplandor color={f.color} alto={420} />
      <Pestanas n={n} av={av} onSelect={onSelect} />

      <section className="relative mx-4 mt-3.5 rounded-[22px] p-[18px] border"
        style={{ background: `linear-gradient(160deg, ${tinte(f.color, 0.16)} 0%, #18181b 65%)`, borderColor: f.color }}>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: f.color }}>FASE {f.n}</span>
          <span className="text-[11px] font-bold rounded-full px-3 py-1 border uppercase"
            style={{ color: f.color, borderColor: tinte(f.color, 0.53) }}>{datos.tag}</span>
        </div>
        <h2 className="font-display text-[38px] leading-none tracking-[0.03em] uppercase mt-1.5">{f.nombre}</h2>
        <p className="mt-2.5 text-sm leading-normal text-zinc-300">
          <b style={{ color: f.color }}>Meta: </b>{datos.meta}
        </p>
        {conMarcas && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Temas de la fase</span><b className="text-white">{af.temasHechos} de {af.temasTotal}</b>
            </div>
            <Barra pct={(af.temasHechos / af.temasTotal) * 100} color={f.color} etiqueta={`${af.temasHechos} de ${af.temasTotal} temas`} />
          </div>
        )}
        {av && est === 'bloqueada' && (
          <p className="mt-4 flex items-center gap-2 text-xs leading-snug text-zinc-300">
            <span className="text-zinc-400"><IcoCandado size={16} /></span>
            Esta fase se abre al aprobar el examen de la Fase {n - 1}.
          </p>
        )}
      </section>

      <section className="relative px-4 pt-[26px]">
        <h2 className="font-display text-2xl tracking-[0.12em] uppercase">Lo que aprendes</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {conMarcas ? 'Tu entrenador los va marcando en cada evaluación.' : 'Esto es lo que trabajas en esta fase.'}
        </p>
        {datos.bloques.map(b => (
          <div key={b.titulo}>
            <h3 className="mt-5 text-[11px] font-bold tracking-[0.18em] text-zinc-400 uppercase">{b.titulo}</h3>
            <ul>
              {b.items.map(texto => {
                const i = indice++
                const hecho = conMarcas && av.temaMarcado(n, i)
                return (
                  <li key={i} className="flex gap-3 items-start py-3 border-b border-zinc-800 last:border-0">
                    {conMarcas
                      ? (hecho
                        ? <Palomita color={f.color} />
                        : <span aria-hidden="true" className="flex-none w-6 h-6 rounded-full border-2 border-zinc-500 box-border" />)
                      : <span aria-hidden="true" className="flex-none w-2 h-2 rounded-sm rotate-45 mt-2 mx-2" style={{ background: f.color }} />}
                    <span className={`text-sm leading-snug ${hecho ? 'text-zinc-400' : 'text-zinc-50'}`}>
                      {texto}
                      {conMarcas && <span className="sr-only">{hecho ? ' (hecho)' : ' (pendiente)'}</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>

      {f.criterios.length > 0 ? (
        <section className="relative mx-4 mt-[22px] rounded-[20px] p-[18px] border-[1.5px] border-dashed"
          style={{ borderColor: tinte(f.color, 0.67), background: tinte(f.color, 0.07) }}>
          <div className="flex justify-between items-center gap-2">
            <h2 className="font-display text-[21px] tracking-[0.05em] uppercase" style={{ color: f.color }}>
              Examen para la Fase {f.examenPara}
            </h2>
            {conMarcas && (
              <b className="text-xs rounded-full px-2.5 py-1 border whitespace-nowrap" style={{ borderColor: tinte(f.color, 0.53) }}>
                {af.criteriosHechos} de {af.criteriosTotal}
              </b>
            )}
          </div>
          <ul className="mt-3.5 flex flex-col gap-2.5">
            {f.criterios.map(c => {
              const hecho = conMarcas && av.criterioMarcado(n, c.id)
              return (
                <li key={c.id} className="rounded-[14px] px-3.5 py-3 border"
                  style={hecho ? { background: '#0d2417', borderColor: '#22c55e88' } : { background: '#18181b', borderColor: '#3f3f46' }}>
                  <div className="flex items-center gap-2">
                    {conMarcas && (hecho
                      ? <span className="flex-none w-[18px] h-[18px] rounded-full bg-green-500 text-zinc-950 flex items-center justify-center"><IcoPalomita size={11} grosor={4} /></span>
                      : <span aria-hidden="true" className="flex-none w-[18px] h-[18px] rounded-full border-2 border-zinc-500 box-border" />)}
                    <b className="text-xs tracking-[0.14em] uppercase" style={{ color: hecho ? '#86efac' : '#d4d4d8' }}>
                      {c.etiqueta}{hecho && ' · aprobado'}
                    </b>
                  </div>
                  <p className={`mt-1.5 text-[13px] leading-snug ${conMarcas ? 'ml-[26px]' : ''} ${hecho ? 'text-zinc-300' : 'text-zinc-200'}`}>{c.texto}</p>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs leading-snug text-zinc-400">
            Con los {f.criterios.length} criterios aprobados pasas a la Fase {f.examenPara}.
          </p>
        </section>
      ) : (
        <section className="relative mx-4 mt-[22px] rounded-[20px] p-[18px] text-center border"
          style={{ background: `linear-gradient(160deg, ${tinte(ORO, 0.16)}, #18181b)`, borderColor: tinte(ORO, 0.45) }}>
          <h2 className="font-display text-xl tracking-wide uppercase" style={{ color: ORO }}>Tu meta final</h2>
          <p className="mt-1 text-sm text-zinc-300">{datos.metaFinal}</p>
        </section>
      )}

      <section className="relative mx-4 mt-[22px] flex flex-col gap-2.5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
          <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">SPARRING</p>
          <p className="mt-1 text-[15px] font-bold text-white">{datos.sparring}</p>
          <p className="mt-1 text-[13px] leading-snug text-zinc-400">{datos.sparringNota}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
          <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">TU FÍSICO</p>
          <p className="mt-1 text-[13px] leading-snug text-zinc-200">{datos.fisico}</p>
        </div>
      </section>
    </div>
  )
}
