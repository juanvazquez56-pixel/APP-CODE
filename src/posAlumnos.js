// Vigencia de membresías calculada desde los pagos reales del POS.

export const DIAS_DEFAULT = 30
export const DIAS_POR_VENCER = 7

export const ESTATUS = {
  vigente: { label: 'Vigente', color: '#0ca30c', icono: '✓' },
  por_vencer: { label: 'Por vencer', color: '#fab219', icono: '!' },
  vencido: { label: 'Vencido', color: '#d03b3b', icono: '✕' },
  sin_membresia: { label: 'Sin membresía', color: '#71717a', icono: '–' },
}

export function normalizarTel(t) {
  const d = String(t ?? '').replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('521')) return d.slice(3)
  if (d.length === 12 && d.startsWith('52')) return d.slice(2)
  return d
}

export function formatoTel(t) {
  const d = normalizarTel(t)
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : t ?? ''
}

export const diaLocal = f => { const d = new Date(f); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
const sumarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// Cada pago cubre sus días a partir de que termina la membresía anterior
// (si renovó antes de vencer) o desde el día de pago (si ya estaba vencido).
export function calcularVigencia(pagos, diasPorProducto = {}, hoy = new Date()) {
  const orden = pagos.filter(p => !p.anulada).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  let vence = null
  let ultimo = null
  for (const p of orden) {
    const dia = diaLocal(p.created_at)
    const inicio = vence && vence > dia ? vence : dia
    vence = sumarDias(inicio, diasPorProducto[p.producto_id] ?? DIAS_DEFAULT)
    ultimo = p
  }
  if (!vence) return { estatus: 'sin_membresia', vence: null, restantes: null, plan: null, ultimoPago: null }
  const restantes = Math.round((vence - diaLocal(hoy)) / 86400000)
  return {
    estatus: restantes < 0 ? 'vencido' : restantes <= DIAS_POR_VENCER ? 'por_vencer' : 'vigente',
    vence,
    restantes,
    plan: ultimo.concepto,
    ultimoPago: ultimo,
  }
}

export function textoRestantes(r) {
  if (r == null) return '—'
  if (r < 0) return `venció hace ${-r} día${r === -1 ? '' : 's'}`
  if (r === 0) return 'vence hoy'
  return `${r} día${r === 1 ? '' : 's'}`
}
