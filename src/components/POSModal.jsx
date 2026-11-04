export default function POSModal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}>
      <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto"
        style={{ maxHeight: '90dvh', paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">{titulo}</h3>
          <button onClick={onClose} className="text-zinc-500 text-xl w-8 h-8">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Etiqueta({ children }) {
  return <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1 block">{children}</label>
}

export const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm'

export function Chips({ opciones, valor, onChange, activoCls = 'bg-yellow-400 text-zinc-950' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map(o => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)}
          className={`px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95
            ${valor === o.id ? activoCls : 'bg-zinc-800 text-zinc-400'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
