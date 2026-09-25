/**
 * Manuales de pantalla para el usuario final (botón "Ayuda" de ContextHelp.vue).
 *
 * Cada módulo tiene su archivo en esta carpeta y exporta una lista de manuales:
 *
 *   {
 *     ruta: /^\/modulo\/pantalla$/,   // expresión que se compara con route.path
 *     titulo: 'Nombre de la pantalla',
 *     proposito: 'Para qué sirve, en una o dos frases.',
 *     acciones: ['Qué puede hacer el usuario…'],   // sección "¿Qué puede hacer?"
 *     pasos: ['Uso recomendado, en orden…'],       // sección "Uso recomendado"
 *     notas: ['Advertencias o reglas…'],           // sección "Tenga en cuenta" (opcional)
 *   }
 *
 * Se usa el primer manual cuya ruta coincida, así que dentro de cada archivo las rutas
 * específicas (p. ej. /facturacion/cuentas/:id) van antes que las generales (/facturacion).
 * Al crear o modificar una pantalla, cree o actualice su manual en el mismo cambio.
 */
import general from './general'
import pacientes from './pacientes'
import hospitalizacion from './hospitalizacion'
import consultaExterna from './consultaExterna'
import unidadQuirurgica from './unidadQuirurgica'
import referencias from './referencias'
import almacen from './almacen'
import facturacion from './facturacion'
import parametrizacion from './parametrizacion'

export const manuales = [
  ...general,
  ...pacientes,
  ...hospitalizacion,
  ...consultaExterna,
  ...unidadQuirurgica,
  ...referencias,
  ...almacen,
  ...facturacion,
  ...parametrizacion,
]

/** Devuelve el manual de la ruta actual o null si la pantalla no tiene manual. */
export const buscarManual = path => manuales.find(manual => manual.ruta.test(path)) || null
