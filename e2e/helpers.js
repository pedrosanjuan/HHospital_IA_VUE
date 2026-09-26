// Utilidades compartidas por las pruebas de pantalla.
import { expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

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

// Mismo backend local que usa el frontend de pruebas (ver playwright.config.js).
export const API = 'http://127.0.0.1:8000/api/v1'

/** Token guardado por auth.setup.js en el localStorage del navegador de pruebas. */
export function tokenGuardado() {
  const estado = JSON.parse(readFileSync('e2e/.auth/usuario.json', 'utf8'))
  return estado.origins.flatMap(origin => origin.localStorage).find(item => item.name === 'access_token').value
}

/** Crea por la API un paciente de prueba hospitalizado y devuelve sus datos. */
export async function pacienteHospitalizado(request) {
  const headers = { Authorization: `Bearer ${tokenGuardado()}`, Accept: 'application/json' }
  const documento = documentoPrueba()
  const llamar = async (method, url, data) => {
    const response = await request[method](`${API}${url}`, { headers, data })
    const body = await response.json().catch(() => ({}))
    expect(response.ok(), `${method.toUpperCase()} ${url} → ${response.status()} ${JSON.stringify(body).slice(0, 300)}`).toBeTruthy()
    return body
  }

  // Mismos datos de referencia que la prueba de API del backend (paquete 19 con estancia 1200).
  await llamar('post', '/Paciente', {
    identificacion: documento, tipo_doc: 20, primernombre: 'Pantalla', primerapellido: 'Estancia',
    fecha_de_nacimiento: '1985-03-10', email: 'e2e@example.com', sexo: 5, celular1: '3000000000',
    pais: 248, id_contrato: 20, cie: [], parientes: [],
  })
  const paciente = await llamar('get', `/Paciente/buscar/porcedula/${documento}`)
  const orden = await llamar('post', '/OrdendeTrabajo', {
    id_paquete: 19, id_paquete_manual_tarifario: 19, id_paciente: paciente.paciente_id,
    valida_desde: new Date().toISOString().slice(0, 10), servicios: [{ id_servicio: 1200, cantidad: 2 }],
  })
  const camas = await llamar('get', '/Hospitalizacion/CamasHospitalDisponibles')
  const ingreso = await llamar('post', '/hospitalizaciones/ingresar', {
    id_paciente: paciente.paciente_id, id_cama: camas.camas_disponibles[0].id,
    id_orden_trabajo: orden.data.id_orden_trabajo, observaciones: 'Ingreso de prueba de pantalla',
  })
  return { documento, idHospitalizacion: ingreso.data.hospitalizacion.id, llamar }
}
