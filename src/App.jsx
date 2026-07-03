import { useState } from 'react'
import NavBar from './components/NavBar'
import Inicio from './components/Inicio'
import Horarios from './components/Horarios'
import Planes from './components/Planes'
import Contacto from './components/Contacto'
import Comunidades from './components/Comunidades'
import Mas from './components/Mas'
import FAQ from './components/FAQ'
import Galeria from './components/Galeria'
import Campeones from './components/Campeones'
import InstalarApp from './components/InstalarApp'
import MenuMaestro from './components/MenuMaestro'

export default function App() {
  const [seccion, setSeccion] = useState('inicio')

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {seccion === 'inicio'      && <Inicio      onNav={setSeccion} />}
      {seccion === 'horarios'    && <Horarios />}
      {seccion === 'planes'      && <Planes      onNav={setSeccion} />}
      {seccion === 'mas'         && <Mas         onNav={setSeccion} />}
      {seccion === 'contacto'    && <Contacto    onNav={setSeccion} />}
      {seccion === 'comunidades' && <Comunidades onNav={setSeccion} />}
      {seccion === 'faq'         && <FAQ         onNav={setSeccion} />}
      {seccion === 'galeria'     && <Galeria     onNav={setSeccion} />}
      {seccion === 'campeones'   && <Campeones   onNav={setSeccion} />}
      {seccion === 'menumaestro' && <MenuMaestro onNav={setSeccion} />}
      <InstalarApp />
      <NavBar seccion={seccion} setSeccion={setSeccion} />
    </div>
  )
}
