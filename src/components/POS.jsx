import { useState } from 'react'
import POSVenta from './POSVenta'
import POSRetiro from './POSRetiro'
import POSCorte from './POSCorte'
import POSMovimientos from './POSMovimientos'
import POSProductos from './POSProductos'

const TABS = [
  { id: 'venta', label: '💵 Venta' },
  { id: 'retiro', label: '📤 Retiro' },
  { id: 'corte', label: '🔒 Corte' },
  { id: 'movimientos', label: '📋 Movimientos' },
  { id: 'productos', label: '🏷️ Productos' },
]

export default function POS() {
  const [tab, setTab] = useState('venta')
  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 flex-1 px-3 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all active:scale-95
              ${tab === t.id ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'venta' && <POSVenta />}
      {tab === 'retiro' && <POSRetiro />}
      {tab === 'corte' && <POSCorte />}
      {tab === 'movimientos' && <POSMovimientos />}
      {tab === 'productos' && <POSProductos />}
    </div>
  )
}
