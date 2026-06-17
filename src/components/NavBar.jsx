const tabs = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'horarios',
    label: 'Horarios',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'planes',
    label: 'Planes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'mas',
    label: 'Más',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
]

// Secciones que, aunque no tengan botón propio en la barra, deben
// dejar resaltado el botón "Más" porque se accede a ellas desde ahí.
// Si agregas una sección nueva en Mas.jsx, agrega su id aquí también.
const SECCIONES_DENTRO_DE_MAS = ['mas', 'contacto', 'comunidades', 'faq', 'galeria', 'campeones']

export default function NavBar({ seccion, setSeccion }) {
  const activarMas = SECCIONES_DENTRO_DE_MAS.includes(seccion)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 safe-area-pb">
      <div className="flex">
        {tabs.map(tab => {
          const activo = tab.id === 'mas' ? activarMas : seccion === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSeccion(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors
                ${activo ? 'text-yellow-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
              {activo && (
                <span className="absolute top-0 w-8 h-0.5 bg-yellow-400 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
