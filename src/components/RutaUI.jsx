// Piezas visuales compartidas de "Mi Ruta" (íconos, encabezado, anillo de avance...).
import { useId } from 'react'

export const ORO = '#fbbf24'

// Color con transparencia: tinte('#3b82f6', 0.15) → '#3b82f626'
export function tinte(hex, alfa) {
  return hex + Math.round(alfa * 255).toString(16).padStart(2, '0')
}

const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const IcoPalomita = ({ size = 16, grosor = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={grosor} {...base}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
export const IcoCandado = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
)
export const IcoBandera = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M5 21V4m0 0h11l-2 4 2 4H5" /></svg>
)
export const IcoFlecha = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.6" {...base}><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
)
export const IcoChevron = ({ size = 18, dir = 'der' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.4" {...base}>
    <path d={dir === 'izq' ? 'M15 18l-6-6 6-6' : 'M9 5l7 7-7 7'} />
  </svg>
)
export const IcoRayo = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.4" {...base}><path d="M13 3L5 14h6l-1 7 8-11h-6z" /></svg>
)
export const IcoWhatsApp = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88M20.46 3.49A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42" />
  </svg>
)

// Resplandor dorado (o del color de la fase) detrás del encabezado de la pantalla.
export function Resplandor({ color = ORO, alto = 460 }) {
  return (
    <div aria-hidden="true" className="absolute left-1/2 pointer-events-none rounded-full"
      style={{ top: -80, width: 460, height: alto, marginLeft: -230,
        background: `radial-gradient(circle, ${tinte(color, 0.2)}, ${tinte(color, 0)} 65%)` }} />
  )
}

// Encabezado fijo: botón atrás a la izquierda, título al centro, algo opcional a la derecha.
export function Cabecera({ atras, onAtras, titulo, derecha }) {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center px-4 min-h-[52px]
      bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <button onClick={onAtras}
        className="justify-self-start flex items-center gap-0.5 min-h-[44px] pr-3 whitespace-nowrap text-sm font-bold active:opacity-70"
        style={{ color: ORO }}>
        <IcoChevron dir="izq" />{atras}
      </button>
      <h1 className="font-display text-[17px] tracking-[0.18em] uppercase text-zinc-400">{titulo}</h1>
      <div className="justify-self-end">{derecha}</div>
    </header>
  )
}

// Anillo grande con el porcentaje de la ruta completa.
export function Anillo({ pct }) {
  const id = useId().replace(/:/g, '')
  const R = 88
  const C = 2 * Math.PI * R
  return (
    <div className="relative mx-auto" style={{ width: 208, height: 208 }}>
      <svg width="208" height="208" viewBox="0 0 208 208" role="img" aria-label={`Avance total: ${pct} por ciento`}
        style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde68a" /><stop offset="0.55" stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle cx="104" cy="104" r={R} fill="none" stroke="#27272a" strokeWidth="16" />
        <circle cx="104" cy="104" r={R} fill="none" stroke={`url(#${id})`} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${(Math.max(pct, 0.5) / 100) * C} ${C}`}
          style={{ transition: 'stroke-dasharray 0.8s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span data-testid="pct" className="font-display text-[62px] leading-none text-white">
          {pct}<span className="text-[30px]" style={{ color: ORO }}>%</span>
        </span>
        <span className="mt-1 text-[11px] font-bold tracking-[0.16em] text-zinc-400">DE TU RUTA</span>
      </div>
    </div>
  )
}

// Barra de progreso fina con texto accesible.
export function Barra({ pct, color, alto = 10, etiqueta }) {
  return (
    <div role="img" aria-label={etiqueta} className="rounded-full bg-zinc-800 overflow-hidden" style={{ height: alto }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function Ficha({ valor, total, etiqueta }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-1.5 py-3">
      <b className="block font-display text-2xl font-normal">
        {valor}<span className="text-base text-zinc-400"> de {total}</span>
      </b>
      <span className="text-[11px] font-bold tracking-[0.1em] text-zinc-400">{etiqueta}</span>
    </div>
  )
}

export function Titulo({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-[26px] tracking-[0.12em] uppercase leading-tight">{children}</h2>
      {sub && <p className="mt-1 text-[13px] leading-snug text-zinc-400">{sub}</p>}
    </div>
  )
}
