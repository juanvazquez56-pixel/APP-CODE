import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import AdminAnuncios from './AdminAnuncios'
import AdminHorarios from './AdminHorarios'

export default function MenuMaestro({ onNav }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('anuncios')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
        <button onClick={() => onNav('mas')} className="text-zinc-500 text-sm mb-6 text-left">
          ← Volver
        </button>
        <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
          Menú Maestro
        </h2>
        <p className="text-zinc-500 text-xs mb-6 tracking-wide">Acceso solo para administradores</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm"
            required
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="bg-yellow-500 text-zinc-950 font-bold rounded-xl p-3 mt-2 active:scale-[0.98] transition-all"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-4">
      <button onClick={() => onNav('mas')} className="text-zinc-500 text-sm mb-6 text-left">
        ← Volver
      </button>
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Menú Maestro
      </h2>
      <p className="text-zinc-500 text-xs mb-4 tracking-wide">Conectado como {session.user.email}</p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('anuncios')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all
            ${tab === 'anuncios' ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
        >
          Anuncios
        </button>
        <button
          onClick={() => setTab('horarios')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all
            ${tab === 'horarios' ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
        >
          Horarios
        </button>
      </div>

      {tab === 'anuncios' && <AdminAnuncios />}
      {tab === 'horarios' && <AdminHorarios />}

      <button
        onClick={handleLogout}
        className="text-red-500 text-sm mt-6"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
