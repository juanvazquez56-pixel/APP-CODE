// Cálculo del avance en "Tu ruta". Los temas y exámenes salen de content.js → ruta.fases,
// así que si editas ahí el texto de un tema, el avance guardado se conserva.
// OJO: no cambies el ORDEN ni agregues temas en medio: el avance se guarda por posición (0, 1, 2...).
import content from './content'

const SLUG = { 'Técnica': 'tecnica', 'Físico': 'fisico', 'Actitud': 'actitud', 'Requisito': 'requisito' }

export const FASES = content.ruta.fases.map(f => {
  const temas = []
  f.bloques.forEach(b => b.items.forEach(texto => temas.push({ grupo: b.titulo, texto })))
  const criterios = f.examen
    ? f.examen.filas.map(([etiqueta, texto]) => ({ id: SLUG[etiqueta] ?? etiqueta.toLowerCase(), etiqueta, texto }))
    : []
  return { n: f.n, nombre: f.nombre, color: f.color, temas, criterios, metaFinal: f.metaFinal, examenPara: f.examen?.para ?? null }
})

const TOTAL_UNIDADES = FASES.reduce((s, f) => s + f.temas.length + f.criterios.length, 0)

// temas: [[fase, tema], ...]   criterios: [[fase, 'tecnica'], ...]
export function calcularAvance(temas = [], criterios = []) {
  const t = new Set(temas.map(([f, i]) => `${f}:${i}`))
  const c = new Set(criterios.map(([f, id]) => `${f}:${id}`))
  let hechas = 0
  const fases = FASES.map(f => {
    const temasHechos = f.temas.filter((_, i) => t.has(`${f.n}:${i}`)).length
    const criteriosHechos = f.criterios.filter(x => c.has(`${f.n}:${x.id}`)).length
    hechas += temasHechos + criteriosHechos
    // Fases 1-3 se aprueban con el examen completo; la 4 (sin examen) cuando se marcan todos sus temas.
    const aprobada = f.criterios.length
      ? criteriosHechos === f.criterios.length
      : temasHechos === f.temas.length
    return {
      n: f.n, temasHechos, temasTotal: f.temas.length,
      criteriosHechos, criteriosTotal: f.criterios.length,
      aprobada,
      pct: Math.round(((temasHechos + criteriosHechos) / (f.temas.length + f.criterios.length)) * 100),
    }
  })
  const primeraPendiente = fases.find(f => !f.aprobada)
  return {
    fases,
    faseActual: primeraPendiente ? primeraPendiente.n : FASES[FASES.length - 1].n,
    completo: !primeraPendiente,
    pct: Math.round((hechas / TOTAL_UNIDADES) * 100),
    temaMarcado: (fase, i) => t.has(`${fase}:${i}`),
    criterioMarcado: (fase, id) => c.has(`${fase}:${id}`),
  }
}
