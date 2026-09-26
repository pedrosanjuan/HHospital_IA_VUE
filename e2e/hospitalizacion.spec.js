// Flujo de pantalla de una estancia: detalle → solicitar traslado → bandeja (aprobar y
// completar) → egreso. La preparación (paciente, admisión e ingreso) se hace por la API para
// no depender de los formularios de admisión, que ya tienen su propia prueba.
import { test, expect } from '@playwright/test'
import { pacienteHospitalizado } from './helpers'

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
