import { useEffect, useState } from 'react'

export default function Splash({ onDone }) {
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setSaliendo(true), 1100)
    const t2 = setTimeout(() => onDone(), 1450)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center"
      style={{
        transition: 'opacity 0.35s ease',
        opacity: saliendo ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      <img
        src="/LOGONKBOX.png"
        alt="NK BOX"
        className="animate-scale-in"
        style={{ width: 120, height: 120, borderRadius: 24 }}
      />
      <p
        className="animate-fade-in font-display text-yellow-400 tracking-[0.3em] uppercase text-sm mt-4"
        style={{ animationDelay: '0.2s' }}
      >
        NK BOX
      </p>
    </div>
  )
}
