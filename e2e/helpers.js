// Utilidades compartidas por las pruebas de pantalla.
import { expect } from '@playwright/test'

/** Documento único con prefijo E2E para reconocer (y limpiar) los datos de prueba en QA. */
export const documentoPrueba = () => `E2E${Date.now().toString().slice(-9)}`

/** Elige la primera opción con valor de un <select> normal (FieldSelect). */
export async function elegirPrimera(page, selector) {
  const select = page.locator(selector)
  await expect(select.locator('option:not([value=""])').first()).toBeAttached()
  const valor = await select.locator('option:not([value=""])').first().getAttribute('value')
  await select.selectOption(valor)
}

/** Abre un SearchSelect, escribe un texto opcional y elige la primera opción visible. */
export async function elegirEnBuscador(page, selector, texto = '') {
  const disparador = page.locator(selector)
  await expect(disparador).toBeEnabled()
  await disparador.click()
  const menu = page.locator('.search-select.open')
  if (texto) await menu.getByRole('searchbox').fill(texto)
  await menu.getByRole('option').first().click()
}
