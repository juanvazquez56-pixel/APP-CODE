import { useState } from 'react'
import NavBar from './components/NavBar'
import Inicio from './components/Inicio'
import Horarios from './components/Horarios'
import Planes from './components/Planes'
import Contacto from './components/Contacto'

const SECCIONES = ['inicio', 'horarios', 'planes', 'contacto']

export default function App() {
  const [seccion, setSeccion] = useState('inicio')

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {seccion === 'inicio'   && <Inicio   onNav={setSeccion} />}
      {seccion === 'horarios' && <Horarios />}
      {seccion === 'planes'   && <Planes   onNav={setSeccion} />}
      {seccion === 'contacto' && <Contacto />}
      <NavBar seccion={seccion} setSeccion={setSeccion} />
    </div>
  )
}
