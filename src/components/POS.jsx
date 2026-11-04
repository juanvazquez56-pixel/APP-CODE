import { useState } from 'react'
import POSVenta from './POSVenta'
import POSRetiro from './POSRetiro'
import POSCorte from './POSCorte'

const TABS = [
  { id: 'venta', label: '💵 Venta' },
  { id: 'retiro', label: '📤 Retiro' },
  { id: 'corte', label: '🔒 Corte' },
]

export default function POS() {
  const [tab, setTab] = useState('venta')
  return (
    <div>
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all active:scale-95
              ${tab === t.id ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'venta' && <POSVenta />}
      {tab === 'retiro' && <POSRetiro />}
      {tab === 'corte' && <POSCorte />}
    </div>
  )
}
