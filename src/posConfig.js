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

export const metodoLabel = id => METODOS.find(m => m.id === id)?.label ?? id

export const fmt = n =>
  `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const SQL_PENDIENTE =
  'No se guardó por permisos. Corre en Supabase el archivo supabase/pos_movimientos.sql y vuelve a intentar.'
