import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from '../supabaseClient'
import { usePermisos } from '../usePermisos'

const POS = lazy(() => import('./POS'))
const PanelAdmin = lazy(() => import('./PanelAdmin'))

const PERMISOS_POS = ['venta', 'retiro', 'corte', 'movimientos', 'productos']
const PERMISOS_ADMIN = ['anuncios', 'horarios', 'planes', 'reportes']

export default function MenuMaestro({ onNav }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pos')
  const permisos = usePermisos(session)

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
        <button onClick={() => onNav('mas')} className="text-zinc-500 text-sm mb-6 text-left no-print">
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
      <button onClick={() => onNav('mas')} className="text-zinc-500 text-sm mb-6 text-left no-print">
        ← Volver
      </button>
      <h2 className="font-display text-2xl font-black uppercase tracking-widest text-yellow-400 mb-1">
        Menú Maestro
      </h2>
      <p className="text-zinc-500 text-xs mb-4 tracking-wide">
        Conectado como {session.user.email}
        {!permisos.cargando && !permisos.sinConfigurar && (
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
            ${permisos.rol === 'admin' ? 'bg-yellow-400/15 text-yellow-400' : 'bg-zinc-800 text-zinc-300'}`}>
            {permisos.rol === 'admin' ? 'Admin' : 'Recepción'}
          </span>
        )}
      </p>

      {permisos.sinConfigurar && (
        <p className="text-yellow-600 text-xs mb-4">
          Cuentas admin/recepción sin activar: corre supabase/pos_roles.sql en Supabase.
        </p>
      )}

      {permisos.cargando ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : (() => {
        const esAdmin = permisos.rol === 'admin'
        const visibles = [
          PERMISOS_POS.some(p => permisos.puede(p)) && { id: 'pos', label: '💵 POS' },
          (esAdmin || PERMISOS_ADMIN.some(p => permisos.puede(p))) && { id: 'admin', label: '⚙️ Admin' },
        ].filter(Boolean)
        const activa = visibles.some(t => t.id === tab) ? tab : visibles[0]?.id
        if (!activa) return <p className="text-zinc-500 text-sm">Tu cuenta todavía no tiene permisos. Pide al admin que te los active.</p>
        return (
          <>
            <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide no-print">
              {visibles.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95
                    ${activa === t.id ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Suspense fallback={<p className="text-zinc-500 text-sm">Cargando...</p>}>
              {activa === 'pos' && <POS puede={permisos.puede} />}
              {activa === 'admin' && (
                <PanelAdmin puede={permisos.puede} esAdmin={esAdmin} configurado={!permisos.sinConfigurar}
                  onPermisosCambiados={permisos.recargar} />
              )}
            </Suspense>
          </>
        )
      })()}

      <button
        onClick={handleLogout}
        className="text-red-500 text-sm mt-6 no-print"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
