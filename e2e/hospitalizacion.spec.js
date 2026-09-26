// Flujo de pantalla de una estancia: detalle → solicitar traslado → bandeja (aprobar y
// completar) → egreso. La preparación (paciente, admisión e ingreso) se hace por la API para
// no depender de los formularios de admisión, que ya tienen su propia prueba.
import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { documentoPrueba } from './helpers'

// Mismo backend local que usa el frontend de pruebas (ver playwright.config.js).
const API = 'http://127.0.0.1:8000/api/v1'

/** Token guardado por auth.setup.js en el localStorage del navegador de pruebas. */
function tokenGuardado() {
  const estado = JSON.parse(readFileSync('e2e/.auth/usuario.json', 'utf8'))
  return estado.origins.flatMap(origin => origin.localStorage).find(item => item.name === 'access_token').value
}

/** Crea por la API un paciente de prueba hospitalizado y devuelve sus datos. */
async function pacienteHospitalizado(request) {
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
  return { documento, idHospitalizacion: ingreso.data.hospitalizacion.id }
}

test('trasladar y egresar a un paciente desde las pantallas', async ({ page, request }) => {
  const { documento, idHospitalizacion } = await pacienteHospitalizado(request)

  // 1. Detalle de la hospitalización
  await page.goto(`/hospitalizacion/${idHospitalizacion}`)
  await expect(page.getByTestId('estado-hospitalizacion')).toHaveText('Hospitalizado')
  await expect(page.getByText(documento)).toBeVisible()

  // 2. Solicitar traslado: el modal debe cargar camas disponibles
  await page.getByRole('button', { name: 'Solicitar traslado' }).click()
  const camaDestino = page.locator('#transfer-bed')
  await expect(camaDestino.locator('option:not([disabled])').first()).toBeAttached()
  await camaDestino.selectOption({ index: 1 })
  await page.locator('#transfer-reason').fill('Traslado de prueba automatizada')
  await page.locator('.transfer-modal').getByRole('button', { name: 'Solicitar traslado' }).click()
  await expect(page.getByText('Solicitud de traslado creada')).toBeVisible()

  // 3. Bandeja (se abre desde el menú lateral Estancia → Traslados): aprobar y completar
  const menu = page.getByRole('navigation', { name: 'Navegación principal' })
  await menu.getByRole('button', { name: /Estancia/ }).click()
  await menu.getByRole('link', { name: /Traslados/ }).click()
  await expect(page).toHaveURL(/\/hospitalizacion\/traslados$/)
  const tarjeta = page.locator('.tray-card', { hasText: documento })
  await expect(tarjeta).toBeVisible()
  await tarjeta.getByRole('button', { name: 'Aprobar' }).click()
  await page.locator('.tray-modal').getByRole('button', { name: 'Aprobar' }).click()
  await expect(page.locator('.tray-modal')).toBeHidden()
  await tarjeta.getByRole('button', { name: 'Completar' }).click()
  await page.locator('.tray-modal').getByRole('button', { name: 'Completar traslado' }).click()
  await expect(page.locator('.tray-card', { hasText: documento })).toHaveCount(0)

  // 4. Egreso desde el detalle
  await page.goto(`/hospitalizacion/${idHospitalizacion}`)
  await expect(page.getByText('Traslado desde cama')).toBeVisible() // historial de ubicaciones
  await page.getByRole('button', { name: 'Egresar paciente' }).click()
  const confirmar = page.getByRole('button', { name: 'Confirmar egreso' })
  await page.locator('#discharge-notes').fill('Alta médica de prueba')
  await expect(confirmar).toBeDisabled() // falta confirmar la orden médica de salida
  await page.getByLabel('Confirmo que el paciente tiene orden médica de salida.').check()
  await confirmar.click()
  await expect(page.getByTestId('estado-hospitalizacion')).toHaveText('Egresado')
  await expect(page.getByRole('button', { name: 'Egresar paciente' })).toHaveCount(0)
})
