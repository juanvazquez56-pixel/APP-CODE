// Logo placeholder — reemplaza esta imagen por tu logo real
// Para usar tu logo: pon el archivo en /public/logo.png y cambia esto por:
//   <img src="/logo.png" alt="NK BOX" className={className} />

export default function Logo({ size = 80 }) {
  const r = size / 2
  // Hexágono regular orientado con vértice arriba
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return `${r + r * 0.88 * Math.cos(angle)},${r + r * 0.88 * Math.sin(angle)}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Sombra/glow */}
      <polygon points={points} fill="rgba(251,191,36,0.15)" filter="url(#glow)" />
      {/* Hexágono */}
      <polygon points={points} fill="url(#goldGrad)" stroke="#F59E0B" strokeWidth="1.5" />
      {/* NK */}
      <text
        x={r} y={r * 1.05}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="Impact, Arial Narrow, Arial, sans-serif"
        fontWeight="bold"
        fontSize={size * 0.3}
        fill="#0a0a0a"
        letterSpacing="-1"
      >
        NK
      </text>
    </svg>
  )
}
