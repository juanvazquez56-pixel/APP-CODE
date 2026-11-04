import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { fmt, metodoLabel, traerTodo } from '../posConfig'
import { calcularMes, tendencia, semaforos, rangoMes, mesesHasta, METAS_DEFAULT } from '../posReportes'

// Paleta categórica (modo oscuro), validada en orden fijo contra el fondo zinc-900.
const SERIE = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9']
const ESTADO = {
  bien: { color: '#0ca30c', icono: '✓', texto: 'Bien' },
  atencion: { color: '#fab219', icono: '!', texto: 'Atención' },
  mal: { color: '#d03b3b', icono: '✕', texto: 'Revisar' },
}
const CATEGORIA = { membresia: 'Membresías', pase: 'Pases y visitas', bebida: 'Bebidas', equipo: 'Equipo y renta de guantes' }
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const pct = x => (x == null ? '—' : `${x.toFixed(1)}%`)
const conSigno = v => (Number(v) < 0 ? `−${fmt(-v)}` : fmt(Math.abs(v)))
const nombreMes = (m, largo) => {
  const [y, mm] = m.split('-').map(Number)
  return largo
    ? new Date(y, mm - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    : `${MESES[mm - 1]} ${String(y).slice(2)}`
}
const isoDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function mesActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function POSReportes() {
  const [mes, setMes] = useState(mesActual())
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { cargar() }, [mes])

  async function cargar() {
    setCargando(true)
    setError('')
    const { inicio, fin } = rangoMes(mes)
    const { inicio: inicio6 } = rangoMes(mes, 5)
    const [v, r, c, k, m] = await Promise.all([
      traerTodo(() => supabase.from('ventas')
        .select('id, created_at, total, metodo_pago, anulada, categoria, concepto, alumno_id, es_alta')
        .gte('created_at', inicio6.toISOString()).lt('created_at', fin.toISOString())),
      traerTodo(() => supabase.from('retiros').select('id, created_at, tipo, monto, anulada')
        .gte('created_at', inicio.toISOString()).lt('created_at', fin.toISOString())),
      supabase.from('costos_fijos').select('concepto, monto').eq('mes', `${mes}-01`),
      supabase.from('corte_caja').select('fecha, diferencia').gte('fecha', isoDia(inicio)).lt('fecha', isoDia(fin)),
      supabase.from('pos_config').select('valor').eq('clave', 'metas').maybeSingle(),
    ])
    const err = v.error || r.error || c.error || k.error
    if (err) { setError('Error al cargar: ' + err.message); setCargando(false); return }
    const ventasMes = v.data.filter(x => new Date(x.created_at) >= inicio)
    const res = calcularMes({ ventas: ventasMes, retiros: r.data, costos: c.data, cortes: k.data })
    const metas = { ...METAS_DEFAULT, ...(m.data?.valor ?? {}) }
    const tend = tendencia(v.data, mesesHasta(mes, 6))
    const primero = tend.findIndex(t => t.ingreso > 0)
    setDatos({ res, metas, sem: semaforos(res, metas), tend: primero < 0 ? [] : tend.slice(primero) })
    setCargando(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <input type="month" value={mes} onChange={e => e.target.value && setMes(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm" style={{ colorScheme: 'dark' }} />
        <button onClick={() => window.print()}
          className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-bold active:scale-95">🖨️ Imprimir / PDF</button>
      </div>

      <h3 className="font-display text-xl font-black uppercase tracking-widest text-white">
        Cierre de {nombreMes(mes, true)}
      </h3>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {cargando && <p className="text-zinc-500 text-sm">Calculando...</p>}
      {!cargando && datos && <Reporte {...datos} />}
    </div>
  )
}

function Reporte({ res, metas, sem, tend }) {
  const sinDatos = res.ingreso === 0 && res.nomina === 0 && res.gastos === 0
  if (sinDatos) return <p className="text-zinc-500 text-sm">No hay movimientos registrados en este mes.</p>
  return (
    <>
      <Alertas res={res} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi titulo="Ingreso" valor={fmt(res.ingreso)} estado={sem.ingreso}
          detalle={`Meta ${fmt(metas.ingreso_mensual)} · ${((res.ingreso / metas.ingreso_mensual) * 100).toFixed(0)}%`}
          progreso={res.ingreso / metas.ingreso_mensual} />
        <Kpi titulo="Nómina" valor={pct(res.nominaPct)} estado={sem.nomina}
          detalle={`${fmt(res.nomina)} · verde ≤ ${metas.nomina_verde}%`} />
        <Kpi titulo="Margen operativo" valor={pct(res.margenPct)} estado={sem.margen}
          detalle={`Antes de costos fijos · verde ≥ ${metas.margen_verde}%`} />
        <Kpi titulo="Utilidad real" valor={conSigno(res.utilidad)} estado={res.alertas.sinCostos ? null : sem.utilidad}
          detalle={res.alertas.sinCostos ? 'Incompleta: faltan costos fijos' : `${pct(res.utilidadPct)} del ingreso · antes de marketing`} />
        <Kpi titulo="ARPU" valor={res.arpu == null ? '—' : fmt(res.arpu)} estado={sem.arpu}
          detalle={`Meta ${fmt(metas.arpu)} · por alumno`} />
        <Kpi titulo="Miembros activos" valor={res.miembros} detalle={`Pagaron membresía · ${fmt(res.ingresoMembresias)}`} />
        <Kpi titulo="Altas / Renovaciones"
          valor={res.altas + res.renovaciones === 0 ? '—' : `${res.altas} / ${res.renovaciones}`}
          detalle={res.sinDatoAlta > 0 ? `${res.sinDatoAlta} sin dato (antes del POS)` : 'Altas nuevas / renovaciones'} />
        <Kpi titulo="Cortesías" valor={res.cortesias.cantidad} detalle={`${fmt(res.cortesias.total)} no cuentan como ingreso`} />
      </div>

      <Peso res={res} />
      <EstadoResultados res={res} />

      {tend.length > 0 && (
        <Seccion titulo="Tendencia de ingreso">
          <Barras filas={tend.map(t => ({ etiqueta: nombreMes(t.mes), valor: t.ingreso }))} meta={metas.ingreso_mensual} />
        </Seccion>
      )}
      <div className="grid lg:grid-cols-3 gap-5">
        <Seccion titulo="Ingreso por categoría">
          <Barras filas={res.porCategoria.map(c => ({ etiqueta: CATEGORIA[c.clave] ?? c.clave, valor: c.total, nota: `${c.cantidad} ventas` }))} total={res.ingreso} />
        </Seccion>
        <Seccion titulo="Membresías por plan">
          <Barras filas={res.porPlan.map(p => ({ etiqueta: p.clave, valor: p.total, nota: `${p.cantidad} pagos` }))} total={res.ingresoMembresias} />
        </Seccion>
        <Seccion titulo="Métodos de pago">
          <Barras filas={res.porMetodo.map(p => ({ etiqueta: metodoLabel(p.clave), valor: p.total, nota: `${p.cantidad} ventas` }))} total={res.ingreso} />
        </Seccion>
      </div>
    </>
  )
}

function Seccion({ titulo, children }) {
  return (
    <section className="flex flex-col gap-3 break-inside-avoid">
      <h4 className="text-zinc-300 text-xs uppercase tracking-widest font-bold">{titulo}</h4>
      {children}
    </section>
  )
}

function Estado({ estado }) {
  if (!estado) return null
  const e = ESTADO[estado]
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
      style={{ backgroundColor: `${e.color}33`, boxShadow: `inset 0 0 0 1px ${e.color}` }}>
      <span style={{ color: e.color }}>{e.icono}</span>{e.texto}
    </span>
  )
}

function Kpi({ titulo, valor, detalle, estado, progreso }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-1 break-inside-avoid">
      <div className="flex items-center justify-between gap-2">
        <span className="text-zinc-400 text-xs">{titulo}</span>
        <Estado estado={estado} />
      </div>
      <span className="text-white font-black text-xl leading-tight">{valor}</span>
      {progreso != null && (
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(progreso, 1) * 100}%`, backgroundColor: SERIE[0] }} />
        </div>
      )}
      <span className="text-zinc-500 text-[11px] leading-snug">{detalle}</span>
    </div>
  )
}

function Alertas({ res }) {
  const a = res.alertas
  const lista = [
    a.sinCostos && 'No hay costos fijos capturados en este mes: la utilidad real está incompleta (Admin → Costos fijos).',
    !a.sinCostos && a.sinRenta && 'No hay renta capturada en este mes.',
    a.membSinAlumno > 0 && `${a.membSinAlumno} venta(s) de membresía sin alumno: no cuentan en miembros ni ARPU.`,
    a.cortesConDiferencia.length > 0 && `${a.cortesConDiferencia.length} corte(s) de caja con diferencia: ${a.cortesConDiferencia
      .map(c => `${c.fecha.slice(8, 10)}/${c.fecha.slice(5, 7)} ${Number(c.diferencia) > 0 ? '+' : ''}${conSigno(c.diferencia)}`).join(', ')}.`,
  ].filter(Boolean)
  if (!lista.length) return null
  return (
    <div className="rounded-2xl p-3 flex flex-col gap-1.5 break-inside-avoid"
      style={{ backgroundColor: `${ESTADO.atencion.color}14`, boxShadow: `inset 0 0 0 1px ${ESTADO.atencion.color}66` }}>
      {lista.map(t => (
        <p key={t} className="text-zinc-200 text-xs flex gap-2">
          <span style={{ color: ESTADO.atencion.color }} className="font-black">!</span>{t}
        </p>
      ))}
    </div>
  )
}

function Peso({ res }) {
  const partes = [
    { id: 'Nómina', valor: res.nomina },
    { id: 'Gastos operativos', valor: res.gastos },
    { id: 'Renta', valor: res.costosPor.renta },
    { id: 'Servicios', valor: res.costosPor.servicios },
    { id: 'Suscripciones', valor: res.costosPor.suscripciones },
    { id: 'Otros costos', valor: res.costosPor.otro },
    { id: res.utilidad >= 0 ? 'Utilidad' : 'Pérdida', valor: Math.abs(res.utilidad), utilidad: true },
  ].map((p, i) => ({ ...p, color: SERIE[i] })).filter(p => p.valor > 0)
  const perdida = res.utilidad < 0
  const base = perdida ? partes.filter(p => !p.utilidad).reduce((s, p) => s + p.valor, 0) : res.ingreso
  const barra = perdida ? partes.filter(p => !p.utilidad) : partes
  if (!base) return null
  return (
    <Seccion titulo="¿A dónde va cada peso?">
      <div className="flex h-7 gap-[2px]">
        {barra.map((p, i) => (
          <div key={p.id} title={`${p.id}: ${fmt(p.valor)} (${((p.valor / base) * 100).toFixed(1)}%)`}
            className={`h-full ${i === 0 ? 'rounded-l' : ''} ${i === barra.length - 1 ? 'rounded-r' : ''}`}
            style={{ width: `${(p.valor / base) * 100}%`, backgroundColor: p.color }} />
        ))}
      </div>
      {perdida && <p className="text-xs text-zinc-300">Los egresos superan el ingreso: la barra muestra cómo se reparten los egresos.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
        {partes.map(p => (
          <div key={p.id} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-zinc-400 truncate">{p.id}</span>
            <span className="text-white font-bold ml-auto">{res.ingreso ? `${((p.valor / res.ingreso) * 100).toFixed(1)}%` : '—'}</span>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function EstadoResultados({ res }) {
  const filas = [
    { label: 'Ingreso', valor: res.ingreso, fuerte: true },
    { label: '− Nómina', valor: -res.nomina },
    { label: '− Gastos operativos (caja)', valor: -res.gastos },
    { label: '= Utilidad operativa', valor: res.operativo, fuerte: true, extra: pct(res.margenPct) },
    { label: '− Renta', valor: -res.costosPor.renta },
    { label: '− Servicios', valor: -res.costosPor.servicios },
    { label: '− Suscripciones', valor: -res.costosPor.suscripciones },
    { label: '− Otros costos fijos', valor: -res.costosPor.otro },
    { label: '= Utilidad real (antes de marketing)', valor: res.utilidad, fuerte: true, extra: pct(res.utilidadPct) },
  ]
  return (
    <Seccion titulo={`Estado de resultados${res.alertas.sinCostos ? ' · incompleto' : ''}`}>
      <div className="border border-zinc-800 rounded-xl overflow-hidden text-sm">
        {filas.map(f => (
          <div key={f.label} className={`flex justify-between gap-3 px-3 py-1.5 border-t border-zinc-800 first:border-t-0
            ${f.fuerte ? 'bg-zinc-900 font-bold' : ''}`}>
            <span className={f.fuerte ? 'text-white' : 'text-zinc-400'}>{f.label}</span>
            <span className="text-white whitespace-nowrap">
              {f.extra && <span className="text-zinc-500 font-normal mr-2">{f.extra}</span>}
              {conSigno(f.valor)}
            </span>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function Barras({ filas, total, meta }) {
  if (!filas.length) return <p className="text-zinc-600 text-xs">Sin datos.</p>
  const max = Math.max(...filas.map(f => f.valor), meta ?? 0) * 1.05
  return (
    <div className="flex flex-col gap-2">
      {filas.map(f => (
        <div key={f.etiqueta} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-2 text-xs"
          title={`${f.etiqueta}: ${fmt(f.valor)}${f.nota ? ` · ${f.nota}` : ''}`}>
          <span className="text-zinc-400 truncate">{f.etiqueta}</span>
          <div className="relative h-4">
            <div className="h-full rounded-r" style={{ width: `${(f.valor / max) * 100}%`, backgroundColor: SERIE[0] }} />
            {meta != null && (
              <div className="absolute top-[-3px] bottom-[-3px] border-l-2 border-dashed border-zinc-400"
                style={{ left: `${(meta / max) * 100}%` }} />
            )}
          </div>
          <span className="text-white font-bold whitespace-nowrap text-right min-w-[5.5rem]">
            {fmt(f.valor)}
            {total ? <span className="text-zinc-500 font-normal"> {((f.valor / total) * 100).toFixed(0)}%</span> : null}
          </span>
        </div>
      ))}
      {meta != null && <p className="text-zinc-500 text-[11px]">Línea punteada: meta {fmt(meta)}</p>}
    </div>
  )
}
