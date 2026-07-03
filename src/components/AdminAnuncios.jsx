import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenFile, setImagenFile] = useState(null)
  const [destacado, setDestacado] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    cargarAnuncios()
  }, [])

  async function cargarAnuncios() {
    const { data } = await supabase
      .from('anuncios')
      .select('*')
      .order('creado_en', { ascending: false })
    if (data) setAnuncios(data)
  }

  async function handlePublicar(e) {
    e.preventDefault()
    setPublicando(true)
    setMsg('')

    let imagen_url = null

    if (imagenFile) {
      const nombreArchivo = `${Date.now()}_${imagenFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('anuncios')
        .upload(nombreArchivo, imagenFile)

      if (uploadError) {
        setMsg('Error al subir la imagen: ' + uploadError.message)
        setPublicando(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('anuncios')
        .getPublicUrl(nombreArchivo)

      imagen_url = urlData.publicUrl
    }

    const { error: insertError } = await supabase.from('anuncios').insert({
      titulo,
      descripcion,
      imagen_url,
      destacado,
      activo: true,
    })

    if (insertError) {
      setMsg('Error al publicar: ' + insertError.message)
    } else {
      setMsg('¡Publicado!')
      setTitulo('')
      setDescripcion('')
      setImagenFile(null)
      setDestacado(false)
      cargarAnuncios()
    }

    setPublicando(false)
  }

  async function handleEliminar(id) {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este anuncio?')
    if (!confirmar) return
    await supabase.from('anuncios').delete().eq('id', id)
    cargarAnuncios()
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handlePublicar} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
        <p className="text-yellow-400 font-bold text-sm mb-1">Nuevo anuncio</p>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm"
          required
        />
        <textarea
          placeholder="Escribe tu anuncio..."
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm min-h-[80px]"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setImagenFile(e.target.files[0])}
          className="text-zinc-400 text-xs"
        />
        <label className="flex items-center gap-2 text-zinc-400 text-xs">
          <input
            type="checkbox"
            checked={destacado}
            onChange={e => setDestacado(e.target.checked)}
          />
          Marcar como destacado (aparece primero, con fondo dorado)
        </label>
        {msg && <p className="text-xs text-yellow-400">{msg}</p>}
        <button
          type="submit"
          disabled={publicando}
          className="bg-yellow-500 text-zinc-950 font-bold rounded-xl p-3 mt-1 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {publicando ? 'Publicando...' : 'Publicar'}
        </button>
      </form>

      <div>
        <p className="text-zinc-300 font-bold text-sm mb-3">Anuncios publicados</p>
        <div className="flex flex-col gap-2">
          {anuncios.length === 0 && (
            <p className="text-zinc-600 text-xs">Todavía no hay anuncios.</p>
          )}
          {anuncios.map(a => (
            <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{a.titulo}</p>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{a.descripcion}</p>
              </div>
              <button
                onClick={() => handleEliminar(a.id)}
                className="text-red-500 text-xs shrink-0"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
