// Limpieza del directorio de alumnos (solo admin): sin pagos, repetidos y +2 meses sin renovar.
import { useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { textoRestantes } from '../posAlumnos'
import POSModal from './POSModal'

const DIAS_BAJA = 60

const clave = n => String(n ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

export default function POSLimpieza({ filas, pagos, onCambio }) {
  const [aviso, setAviso] = useState('')
  const [confirmar, setConfirmar] = useState(null)   // { titulo, texto, boton, peligro, accion }
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')

  const sinPagos = useMemo(() => filas.filter(f => f.vig.estatus === 'sin_membresia'), [filas])
  const bajas = useMemo(() => filas.filter(f => f.estatus !== 'inactivo' && f.vig.estatus === 'vencido' && f.vig.restantes < -DIAS_BAJA)
    .sort((a, b) => a.vig.restantes - b.vig.restantes), [filas])
  const grupos = useMemo(() => {
    const por = {}
    for (const f of filas) { const k = clave(f.nombre); if (k) (por[k] ??= []).push(f) }
    return Object.values(por).filter(g => g.length > 1)
  }, [filas])

  async function ejecutar() {
    setTrabajando(true); setError('')
    try {
      const msg = await confirmar.accion()
      setAviso(msg); setConfirmar(null)
      await onCambio()
    } catch (e) {
      setError(/function .* does not exist|alumnos_eliminar|alumnos_fusionar/.test(e.message ?? '')
        ? 'Falta correr supabase/pos_limpieza_alumnos.sql en Supabase.' : 'Error: ' + (e.message ?? e))
    }
    setTrabajando(false)
  }

  const pedir = c => { setError(''); setAviso(''); setConfirmar(c) }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-zinc-400 text-xs">
        Solo la cuenta admin ve esta pantalla. Nunca se borran pagos ni ventas: lo que ya cobraste siempre queda en los reportes.
      </p>
      {aviso && <p role="status" className="text-green-400 text-sm font-bold">{aviso}</p>}

      <SinPagos lista={sinPagos} pedir={pedir} />
      <Repetidos grupos={grupos} pagos={pagos} pedir={pedir} />
      <Bajas lista={bajas} pedir={pedir} />

      {confirmar && (
        <POSModal titulo={confirmar.titulo} onClose={() => !trabajando && setConfirmar(null)}>
          <p className="text-zinc-300 text-sm whitespace-pre-line">{confirmar.texto}</p>
          {confirmar.lista && (
            <ul className="mt-3 max-h-40 overflow-y-auto text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-0.5">
              {confirmar.lista.map(n => <li key={n}>{n}</li>)}
            </ul>
          )}
          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
          <div className="flex gap-2 mt-5">
            <button onClick={() => setConfirmar(null)} disabled={trabajando}
              className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl active:scale-95">Cancelar</button>
            <button onClick={ejecutar} disabled={trabajando}
              className={`flex-1 font-black py-3 rounded-xl active:scale-95 disabled:opacity-50 ${confirmar.peligro ? 'bg-red-500 text-white' : 'bg-yellow-400 text-zinc-950'}`}>
              {trabajando ? 'Trabajando...' : confirmar.boton}
            </button>
          </div>
        </POSModal>
      )}
    </div>
  )
}

function Seccion({ titulo, ayuda, cuenta, children }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <h3 className="text-white font-bold text-sm">{titulo} <span className="text-zinc-500 font-normal">· {cuenta}</span></h3>
      <p className="text-zinc-400 text-xs mt-1 mb-3">{ayuda}</p>
      {children}
    </section>
  )
}

// Lista con casillas (todas desmarcadas al inicio) y un botón de acción para las marcadas.
function ListaMarcable({ lista, detalle, boton, onAccion, peligro }) {
  const [marcados, setMarcados] = useState(() => new Set())
  const alternar = id => setMarcados(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const elegidos = lista.filter(f => marcados.has(f.id))
  const todos = elegidos.length === lista.length && lista.length > 0
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setMarcados(todos ? new Set() : new Set(lista.map(f => f.id)))}
          className="text-xs text-yellow-400 font-bold">{todos ? 'Quitar selección' : 'Seleccionar todos'}</button>
        <span className="text-xs text-zinc-500">{elegidos.length} seleccionados</span>
      </div>
      <ul className="max-h-72 overflow-y-auto border border-zinc-800 rounded-xl divide-y divide-zinc-800">
        {lista.map(f => (
          <li key={f.id}>
            <label className="flex items-center gap-3 px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={marcados.has(f.id)} onChange={() => alternar(f.id)} className="w-5 h-5 accent-yellow-400 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-white truncate">
                  {f.nombre}
                  {f.estatus === 'inactivo' && <span className="ml-1.5 text-[10px] text-zinc-500 font-bold">INACTIVO</span>}
                </span>
                <span className="block text-xs text-zinc-500">{detalle(f)}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button disabled={!elegidos.length} onClick={() => onAccion(elegidos, () => setMarcados(new Set()))}
        className={`mt-3 w-full font-black py-3 rounded-xl text-sm active:scale-[0.98] disabled:opacity-40 ${peligro ? 'bg-red-500 text-white' : 'bg-yellow-400 text-zinc-950'}`}>
        {boton}{elegidos.length ? ` (${elegidos.length})` : ''}
      </button>
    </>
  )
}

function SinPagos({ lista, pedir }) {
  return (
    <Seccion titulo="Sin ningún pago en el POS" cuenta={lista.length}
      ayuda="Alumnos que nunca han pagado una membresía aquí. OJO: también salen alumnos que siguen entrenando pero pagaron antes de que existiera el POS y todavía no han renovado. Revisa cada nombre y marca solo a quien ya no es alumno.">
      {lista.length === 0 ? <p className="text-zinc-500 text-sm">Nadie por revisar.</p> : (
        <ListaMarcable lista={lista} boton="Eliminar" peligro
          detalle={f => f.telefono ? `Cel. ${f.telefono}` : 'Sin celular'}
          onAccion={(sel, limpiar) => pedir({
            titulo: 'Eliminar alumnos',
            texto: `Vas a eliminar ${plural(sel.length, 'alumno', 'alumnos')} y también su avance de Tu ruta. Esto no se puede deshacer.`,
            lista: sel.map(f => f.nombre), boton: 'Sí, eliminar', peligro: true,
            accion: async () => {
              const { data, error } = await supabase.rpc('alumnos_eliminar', { p_ids: sel.map(f => f.id) })
              if (error) throw error
              limpiar()
              const om = data?.omitidos?.length ?? 0
              return `Eliminados: ${data?.eliminados ?? 0}.` + (om ? ` ${plural(om, 'se omitió porque tiene pagos registrados', 'se omitieron porque tienen pagos registrados')}.` : '')
            },
          })} />
      )}
    </Seccion>
  )
}

function Repetidos({ grupos, pagos, pedir }) {
  return (
    <Seccion titulo="Alumnos repetidos" cuenta={grupos.length}
      ayuda="Mismo nombre registrado más de una vez. Elige cuál se queda: sus pagos y su avance de Tu ruta pasan a ese y el repetido se elimina. No se detectan nombres con errores de escritura distintos.">
      {grupos.length === 0 ? <p className="text-zinc-500 text-sm">No hay nombres repetidos.</p> : (
        <div className="flex flex-col gap-3">
          {grupos.map(g => <GrupoRepetido key={clave(g[0].nombre)} grupo={g} pagos={pagos} pedir={pedir} />)}
        </div>
      )}
    </Seccion>
  )
}

function GrupoRepetido({ grupo, pagos, pedir }) {
  const sugerido = [...grupo].sort((a, b) => (pagos[b.id]?.length ?? 0) - (pagos[a.id]?.length ?? 0) || a.id - b.id)[0].id
  const [queda, setQueda] = useState(sugerido)
  const sobran = grupo.filter(f => f.id !== queda)
  return (
    <div className="border border-zinc-800 rounded-xl p-3">
      <p className="text-white text-sm font-bold mb-2">{grupo[0].nombre}</p>
      <div role="radiogroup" aria-label={`Cuál se queda: ${grupo[0].nombre}`} className="flex flex-col gap-1.5">
        {grupo.map(f => (
          <label key={f.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer border ${queda === f.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-zinc-800'}`}>
            <input type="radio" name={`rep-${grupo[0].id}`} checked={queda === f.id} onChange={() => setQueda(f.id)} className="accent-yellow-400" />
            <span className="flex-1 text-xs text-zinc-300">
              {plural(pagos[f.id]?.length ?? 0, 'pago', 'pagos')} · {f.telefono ? `Cel. ${f.telefono}` : 'sin celular'}
              {f.vig.vence ? ` · ${f.vig.estatus === 'vencido' ? 'vencido' : 'vigente'}` : ' · sin membresía'}
              {f.estatus === 'inactivo' ? ' · inactivo' : ''}
            </span>
            {queda === f.id && <span className="text-[10px] font-bold text-yellow-400">SE QUEDA</span>}
          </label>
        ))}
      </div>
      <button onClick={() => pedir({
        titulo: 'Fusionar repetidos',
        texto: `Se queda el registro marcado "SE QUEDA". ${plural(sobran.length, 'registro repetido pasa', 'registros repetidos pasan')} sus pagos y su avance a ese y después se elimina. No se pierde ningún pago.`,
        lista: sobran.map(f => `${f.nombre} (se elimina)`), boton: 'Sí, fusionar', peligro: true,
        accion: async () => {
          for (const f of sobran) {
            const { error } = await supabase.rpc('alumnos_fusionar', { p_conservar: queda, p_eliminar: f.id })
            if (error) throw error
          }
          return `Fusionado: ${grupo[0].nombre}.`
        },
      })} className="mt-3 w-full bg-yellow-400 text-zinc-950 font-black py-2.5 rounded-xl text-sm active:scale-[0.98]">
        Fusionar en el que se queda
      </button>
    </div>
  )
}

function Bajas({ lista, pedir }) {
  return (
    <Seccion titulo={`Más de ${DIAS_BAJA / 30} meses sin renovar`} cuenta={lista.length}
      ayuda="Su membresía venció hace más de 60 días. Como ya tienen pagos, no se borran: se dan de baja (quedan inactivos y salen de vencimientos, directorio y Menú Coach). Su historial de pagos se conserva y puedes reactivarlos en su ficha.">
      {lista.length === 0 ? (
        <p className="text-zinc-500 text-sm">Nadie por ahora. El POS lleva pagos desde noviembre de 2026, así que los primeros pueden aparecer hacia febrero de 2027.</p>
      ) : (
        <ListaMarcable lista={lista} boton="Dar de baja"
          detalle={f => `${f.vig.plan ?? 'Membresía'} · ${textoRestantes(f.vig.restantes)}`}
          onAccion={(sel, limpiar) => pedir({
            titulo: 'Dar de baja',
            texto: `Vas a dar de baja ${plural(sel.length, 'alumno', 'alumnos')}. No se borra nada: quedan inactivos y se pueden reactivar.`,
            lista: sel.map(f => f.nombre), boton: 'Sí, dar de baja',
            accion: async () => {
              const { error } = await supabase.from('alumnos').update({ estatus: 'inactivo' }).in('id', sel.map(f => f.id))
              if (error) throw error
              limpiar()
              return `Dados de baja: ${sel.length}.`
            },
          })} />
      )}
    </Seccion>
  )
}
