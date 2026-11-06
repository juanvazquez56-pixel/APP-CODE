import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from '../supabaseClient'
import { usePermisos } from '../usePermisos'

const CoachSeguimiento = lazy(() => import('./CoachSeguimiento'))

export default function MenuCoach({ onNav }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const permisos = usePermisos(session)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos')
  }

  const volver = (
    <button onClick={() => onNav('mas')} className="text-zinc-500 text-sm mb-6 text-left no-print">← Volver</button>
  )

  if (loading) {
    return <div className="flex flex-col min-h-screen items-center justify-center px-4">
      <p className="text-zinc-500 text-sm">Cargando...</p>
    </div>
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
        {volver}
        <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">Menú Coach</h2>
        <p className="text-zinc-500 text-xs mb-6 tracking-wide">Acceso solo para entrenadores</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm" required />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm" required />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit"
            className="bg-yellow-500 text-zinc-950 font-bold rounded-xl p-3 mt-2 active:scale-[0.98] transition-all">
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      {volver}
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">Menú Coach</h2>
      <p className="text-zinc-500 text-xs mb-5 tracking-wide">Conectado como {session.user.email}</p>

      {permisos.cargando ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : permisos.puede('evaluaciones') ? (
        <Suspense fallback={<p className="text-zinc-500 text-sm">Cargando...</p>}>
          <CoachSeguimiento />
        </Suspense>
      ) : (
        <p className="text-zinc-500 text-sm">
          Tu cuenta todavía no tiene permiso para evaluar alumnos. Pide al admin que te lo active.
        </p>
      )}

      <button onClick={() => supabase.auth.signOut()} className="text-red-500 text-sm mt-6 no-print">
        Cerrar sesión
      </button>
    </div>
  )
}
