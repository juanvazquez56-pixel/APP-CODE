// Cálculo del cierre mensual. Funciones puras: reciben filas y devuelven métricas.

export const METAS_DEFAULT = { ingreso_mensual: 40000, arpu: 530, nomina_verde: 45, nomina_rojo: 50, margen_verde: 50, margen_rojo: 40 }

const suma = (arr, campo) => arr.reduce((s, x) => s + Number(x[campo] || 0), 0)

export const claveMes = fecha => {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function rangoMes(mes, mesesAtras = 0) {
  const [y, m] = mes.split('-').map(Number)
  return { inicio: new Date(y, m - 1 - mesesAtras, 1), fin: new Date(y, m, 1) }
}

export function mesesHasta(mes, n) {
  const [y, m] = mes.split('-').map(Number)
  return Array.from({ length: n }, (_, i) => claveMes(new Date(y, m - n + i, 1)))
}

function agrupar(filas, clave, campo) {
  const mapa = new Map()
  for (const f of filas) {
    const k = clave(f)
    const prev = mapa.get(k) ?? { clave: k, total: 0, cantidad: 0 }
    prev.total += Number(f[campo] || 0)
    prev.cantidad += 1
    mapa.set(k, prev)
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total)
}

// verde/amarillo/rojo según la meta. Ingreso y ARPU: amarillo desde 85% / 90% de la meta.
export function semaforos(r, metas) {
  const nivel = (bien, regular) => (bien ? 'bien' : regular ? 'atencion' : 'mal')
  return {
    ingreso: nivel(r.ingreso >= metas.ingreso_mensual, r.ingreso >= metas.ingreso_mensual * 0.85),
    nomina: r.nominaPct == null ? null : nivel(r.nominaPct <= metas.nomina_verde, r.nominaPct <= metas.nomina_rojo),
    margen: r.margenPct == null ? null : nivel(r.margenPct >= metas.margen_verde, r.margenPct >= metas.margen_rojo),
    utilidad: r.ingreso === 0 ? null : r.utilidad > 0 ? 'bien' : 'mal',
    arpu: r.arpu == null ? null : nivel(r.arpu >= metas.arpu, r.arpu >= metas.arpu * 0.9),
  }
}

export function calcularMes({ ventas, retiros, costos, cortes }) {
  const validas = ventas.filter(v => !v.anulada)
  const pagadas = validas.filter(v => v.metodo_pago !== 'cortesia')
  const cortesias = validas.filter(v => v.metodo_pago === 'cortesia')
  const retValidos = retiros.filter(r => !r.anulada)

  const ingreso = suma(pagadas, 'total')
  const nomina = suma(retValidos.filter(r => r.tipo === 'nomina'), 'monto')
  const gastos = suma(retValidos.filter(r => r.tipo === 'gasto'), 'monto')
  const costosPor = { renta: 0, servicios: 0, suscripciones: 0, otro: 0 }
  for (const c of costos) costosPor[c.concepto] = (costosPor[c.concepto] ?? 0) + Number(c.monto)
  const costosTotal = suma(costos, 'monto')
  const operativo = ingreso - nomina - gastos
  const utilidad = operativo - costosTotal
  const pct = x => (ingreso > 0 ? (x / ingreso) * 100 : null)

  const membresias = pagadas.filter(v => v.categoria === 'membresia')
  const ingresoMembresias = suma(membresias, 'total')
  const miembros = new Set(membresias.filter(v => v.alumno_id != null).map(v => v.alumno_id)).size
  const membValidas = validas.filter(v => v.categoria === 'membresia')

  return {
    ingreso,
    nomina,
    gastos,
    costosPor,
    costosTotal,
    operativo,
    utilidad,
    nominaPct: pct(nomina),
    margenPct: pct(operativo),
    utilidadPct: pct(utilidad),
    cortesias: { total: suma(cortesias, 'total'), cantidad: cortesias.length },
    ingresoMembresias,
    miembros,
    arpu: miembros > 0 ? ingresoMembresias / miembros : null,
    altas: membValidas.filter(v => v.es_alta === true).length,
    renovaciones: membValidas.filter(v => v.es_alta === false).length,
    sinDatoAlta: membValidas.filter(v => v.es_alta == null).length,
    numVentas: pagadas.length,
    porCategoria: agrupar(pagadas, v => v.categoria, 'total'),
    porPlan: agrupar(membresias, v => v.concepto, 'total'),
    porMetodo: agrupar(pagadas, v => v.metodo_pago, 'total'),
    alertas: {
      membSinAlumno: membValidas.filter(v => v.alumno_id == null).length,
      cortesConDiferencia: cortes.filter(c => Number(c.diferencia) !== 0),
      sinCostos: costosTotal === 0,
      sinRenta: costosPor.renta === 0,
    },
  }
}

export function tendencia(ventas, meses) {
  const porMes = Object.fromEntries(meses.map(m => [m, 0]))
  for (const v of ventas) {
    if (v.anulada || v.metodo_pago === 'cortesia') continue
    const k = claveMes(v.created_at)
    if (k in porMes) porMes[k] += Number(v.total)
  }
  return meses.map(m => ({ mes: m, ingreso: porMes[m] }))
}
