// "Tu semana y los 8 golpes": cómo es la semana, la sesión, los golpes y las reglas de seguridad.
import content from '../content'
import { ORO, tinte, Titulo } from './RutaUI'

const { ruta } = content

// Color del número según clase del golpe
const colorGolpe = { recto: '#60a5fa', curvo: '#f87171', uppercut: '#4ade80', cuerpo: '#c084fc' }

// getDay(): 0 domingo … 6 sábado  →  la abreviatura que usa content.js (fin de semana: ninguna)
const DIA_HOY = [null, 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', null]

export default function RutaSemana() {
  const hoy = DIA_HOY[new Date().getDay()]

  return (
    <div className="relative pb-8 px-4 pt-[26px]">
      <Titulo sub="Cada día tiene un enfoque fijo. Lo que cambia entre fases es el contenido y la intensidad.">Tu semana</Titulo>
      <ul className="flex flex-col gap-2 -mt-1">
        {ruta.semana.map(d => {
          const esHoy = d.dia === hoy
          return (
            <li key={d.dia} className="grid items-center gap-3 rounded-[18px] p-3 border"
              style={{
                gridTemplateColumns: '54px minmax(0,1fr) auto',
                background: esHoy ? 'linear-gradient(160deg,#27210b 0%,#18181b 70%)' : '#18181b',
                borderColor: esHoy ? tinte(ORO, 0.47) : '#27272a',
              }}>
              <span className="font-display text-xl text-center rounded-xl py-3"
                style={esHoy ? { background: ORO, color: '#09090b' } : { background: tinte(ORO, 0.09), color: ORO }}>{d.dia}</span>
              <div>
                {esHoy && <span className="block text-[10px] font-bold tracking-[0.16em] mb-0.5" style={{ color: ORO }}>HOY</span>}
                <p className={`text-[13px] leading-snug ${esHoy ? 'text-white' : 'text-zinc-200'}`}>{d.descripcion}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] text-zinc-400">{d.intensidad}</span>
                <span className="flex gap-[3px]" role="img" aria-label={`Intensidad ${d.nivel} de 3`}>
                  {[1, 2, 3].map(k => (
                    <i key={k} className="w-[9px] h-[9px] rounded-full" style={{ background: k <= d.nivel ? ORO : '#3f3f46' }} />
                  ))}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <section className="mt-[22px] rounded-[20px] p-[18px] bg-zinc-900 border border-zinc-800">
        <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-zinc-400">ASÍ ES CADA SESIÓN · 75–90 MIN</p>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5" aria-hidden="true">
          {ruta.sesion.map(b => <div key={b.nombre} style={{ flex: b.peso, background: b.color }} />)}
        </div>
        <ul className="mt-3.5 flex flex-col gap-[9px] text-[13px] text-zinc-200">
          {ruta.sesion.map(b => (
            <li key={b.nombre} className="flex items-center gap-2.5">
              <i className="w-[11px] h-[11px] rounded-[3px] flex-none" style={{ background: b.color }} />
              <span className="flex-1">{b.nombre}</span>
              <span className="text-xs text-zinc-400 whitespace-nowrap">{b.duracion}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          Los rounds son de 3 min de trabajo y 1 min de descanso. Para menores de 15 años: 2 min y 1 min.
        </p>
      </section>

      <section className="pt-7">
        <Titulo sub="Todo el plan se habla en números. Apréndete los 8 y entenderás cualquier combinación.">Los 8 golpes NK</Titulo>
        <ul className="grid grid-cols-4 gap-2 -mt-1">
          {ruta.golpes.map(g => (
            <li key={g.numero} className="bg-zinc-900 border border-zinc-800 rounded-[18px] px-1 pt-3.5 pb-3 text-center">
              <b className="block font-display text-[44px] leading-none font-normal" style={{ color: colorGolpe[g.clase] }}>{g.numero}</b>
              <span className="block mt-1.5 text-xs leading-tight text-zinc-200">{g.nombre}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 rounded-[14px] bg-zinc-900 border px-3.5 py-3 text-[13px] leading-snug text-zinc-200"
          style={{ borderColor: tinte(ORO, 0.33) }}>
          <b style={{ color: ORO }}>Ejemplo:</b> "1-2-3" es jab, cross y volado izquierdo. El entrenador te las canta a la voz y por número.
        </p>
      </section>

      <section className="pt-7">
        <Titulo sub="Quieres llegar sano a la pelea y seguir entrenando después de ella.">Sparring y seguridad</Titulo>
        <div className="flex flex-col gap-2.5 -mt-1">
          <div className="rounded-[20px] p-[18px] bg-zinc-900 border border-zinc-800">
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.18em] text-zinc-400">EQUIPO OBLIGATORIO PARA SPARRING</p>
            <ul className="flex flex-wrap gap-2">
              {ruta.seguridad.equipo.map(e => (
                <li key={e} className="text-xs text-zinc-200 border border-zinc-700 bg-zinc-950 rounded-full px-3 py-1.5">{e}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[20px] p-[18px] bg-zinc-900 border border-zinc-800">
            <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-zinc-400">REGLAS FIJAS</p>
            <Lista items={ruta.seguridad.reglas} />
          </div>
          <div className="rounded-[20px] p-[18px] border" style={{ background: '#2a0f12', borderColor: '#ef444466' }}>
            <p className="mb-1.5 text-sm font-bold text-red-300">Si sientes esto después de un golpe, para</p>
            <p className="text-[13px] leading-snug text-zinc-200">{ruta.seguridad.alerta}</p>
          </div>
          <div className="rounded-[20px] p-[18px] bg-zinc-900 border border-zinc-800">
            <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-zinc-400">CUÍDATE FUERA DEL GYM</p>
            <Lista items={ruta.seguridad.cuidado} />
          </div>
        </div>
      </section>
    </div>
  )
}

function Lista({ items }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((t, i) => (
        <li key={i} className="relative pl-4 text-[13px] leading-snug text-zinc-200">
          <span aria-hidden="true" className="absolute left-0 top-[7px] w-1.5 h-1.5 rounded-full" style={{ background: ORO }} />
          {t}
        </li>
      ))}
    </ul>
  )
}
