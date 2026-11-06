// "Mi Ruta": plan de desarrollo + avance personal del alumno.
// Tres vistas: inicio (público o personal), detalle de una fase y "tu semana".
import { useState, useEffect } from 'react'
import content from '../content'
import { useAvance } from '../useAvance'
import { Cabecera, ORO } from './RutaUI'
import RutaInicio from './RutaInicio'
import RutaFase from './RutaFase'
import RutaSemana from './RutaSemana'

const { ruta } = content

export default function Ruta({ onNav }) {
  const a = useAvance()
  const [vista, setVista] = useState('inicio')   // inicio | fase | semana
  const [faseSel, setFaseSel] = useState(1)
  const waUrl = `https://wa.me/${ruta.whatsapp}?text=${encodeURIComponent(ruta.waMensaje)}`
  const personal = !!a.avance

  // Al cambiar de vista o de fase, siempre arrancar desde arriba.
  useEffect(() => { window.scrollTo(0, 0) }, [vista, faseSel])

  function abrirFase(n) { setFaseSel(n); setVista('fase') }

  const atras = vista === 'inicio'
    ? { texto: 'Más', ir: () => onNav('mas') }
    : { texto: personal ? 'Mi avance' : 'Tu ruta', ir: () => setVista('inicio') }
  const titulo = vista === 'inicio' ? 'Tu ruta'
    : vista === 'fase' ? (personal ? 'Mi fase' : 'Las fases')
    : 'Tu semana'

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50">
      <Cabecera
        atras={atras.texto} onAtras={atras.ir} titulo={titulo}
        derecha={vista === 'inicio' && personal ? (
          <span role="img" aria-label={`Perfil de ${a.nombre}`}
            className="font-display w-[34px] h-[34px] rounded-full flex items-center justify-center text-[17px] text-zinc-950"
            style={{ background: ORO }}>{a.nombre.charAt(0)}</span>
        ) : null}
      />
      {vista === 'inicio' && <RutaInicio a={a} onFase={abrirFase} onSemana={() => setVista('semana')} waUrl={waUrl} />}
      {vista === 'fase' && <RutaFase n={faseSel} av={a.avance} onSelect={setFaseSel} />}
      {vista === 'semana' && <RutaSemana />}
    </div>
  )
}
