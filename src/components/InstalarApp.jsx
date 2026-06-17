import { useEffect, useState } from 'react'

// Muestra un aviso para instalar la app a pantalla completa.
// Solo aparece en navegadores que soportan el evento "beforeinstallprompt"
// (Android/Chrome). En iPhone no existe ese evento — Apple requiere que
// el usuario lo haga manualmente desde Safari (ver instrucciones en el README).
export default function InstalarApp() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      setPromptEvent(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!promptEvent || !visible) return null

  async function instalar() {
    promptEvent.prompt()
    await promptEvent.userChoice
    setVisible(false)
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-zinc-900 border border-yellow-500/40
      rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/50">
      <span className="text-2xl shrink-0">📲</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm">Instala NK BOX en tu celular</p>
        <p className="text-zinc-500 text-xs">Acceso rápido desde tu pantalla de inicio</p>
      </div>
      <button
        onClick={instalar}
        className="bg-yellow-400 text-zinc-950 font-bold text-xs px-3 py-2 rounded-xl shrink-0"
      >
        Instalar
      </button>
      <button
        onClick={() => setVisible(false)}
        className="text-zinc-500 hover:text-zinc-300 text-lg shrink-0 px-1"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}
