/**
 * Limpia un fragmento HTML que viene de la base de datos antes de mostrarlo con v-html.
 *
 * Solo deja etiquetas de texto simples (párrafos, listas, negrita…) y quita TODOS los
 * atributos. Así, aunque alguien guarde en la base un <script>, un onclick o un enlace
 * "javascript:", no se ejecuta en el navegador de quien lo lee.
 */
const ETIQUETAS_PERMITIDAS = new Set(['P', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'BR', 'SMALL'])

export function limpiarHtml(html) {
  if (!html) return ''
  const documento = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const raiz = documento.body.firstChild

  const limpiar = nodo => {
    for (const hijo of [...nodo.childNodes]) {
      if (hijo.nodeType === Node.TEXT_NODE) continue
      if (hijo.nodeType !== Node.ELEMENT_NODE || !ETIQUETAS_PERMITIDAS.has(hijo.tagName)) {
        // Etiqueta no permitida: se conserva solo su texto (script y style se eliminan completos).
        if (['SCRIPT', 'STYLE'].includes(hijo.tagName)) hijo.remove()
        else hijo.replaceWith(documento.createTextNode(hijo.textContent || ''))
        continue
      }
      for (const atributo of [...hijo.attributes]) hijo.removeAttribute(atributo.name)
      limpiar(hijo)
    }
  }

  limpiar(raiz)
  return raiz.innerHTML
}
