export const METODOS = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'debito', label: 'Débito' },
  { id: 'credito', label: 'Crédito' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'cortesia', label: 'Cortesía' },
]

export const METODOS_RETIRO = METODOS.filter(m => m.id !== 'cortesia')

export const CATEGORIAS = [
  { id: 'membresia', label: 'Membresía' },
  { id: 'pase', label: 'Pase/Visita' },
  { id: 'bebida', label: 'Bebida' },
  { id: 'equipo', label: 'Equipo' },
]

export const PERMISOS = [
  { grupo: 'Punto de venta', items: [
    { id: 'venta', label: 'Cobrar (Venta)' },
    { id: 'retiro', label: 'Registrar retiros (nómina y gastos)' },
    { id: 'corte', label: 'Hacer corte de caja' },
    { id: 'movimientos', label: 'Ver movimientos' },
    { id: 'editar', label: 'Editar y anular movimientos' },
    { id: 'productos', label: 'Productos y precios' },
    { id: 'reportes', label: 'Ver reportes y costos fijos' },
  ] },
  { grupo: 'App pública', items: [
    { id: 'anuncios', label: 'Anuncios' },
    { id: 'horarios', label: 'Horarios' },
    { id: 'planes', label: 'Planes' },
  ] },
]

export const METAS_CAMPOS = [
  { id: 'ingreso_mensual', label: 'Meta de ingreso mensual', sufijo: '$' },
  { id: 'arpu', label: 'Meta de ARPU (ingreso por alumno)', sufijo: '$' },
  { id: 'nomina_verde', label: 'Nómina: verde hasta', sufijo: '%' },
  { id: 'nomina_rojo', label: 'Nómina: rojo a partir de', sufijo: '%' },
  { id: 'margen_verde', label: 'Margen operativo: verde desde', sufijo: '%' },
  { id: 'margen_rojo', label: 'Margen operativo: rojo debajo de', sufijo: '%' },
]

export const CONCEPTOS_COSTO = [
  { id: 'renta', label: 'Renta' },
  { id: 'servicios', label: 'Servicios (luz, agua, internet)' },
  { id: 'suscripciones', label: 'Suscripciones' },
  { id: 'otro', label: 'Otro' },
]

export const metodoLabel = id => METODOS.find(m => m.id === id)?.label ?? id

export const fmt = n =>
  `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const SQL_PENDIENTE =
  'No se guardó por permisos. Corre en Supabase el archivo supabase/pos_movimientos.sql y vuelve a intentar.'
