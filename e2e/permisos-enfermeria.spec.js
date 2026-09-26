// Un usuario con permisos limitados (rol de prueba "E2E Enfermería (pruebas)") solo ve las
// acciones que puede hacer, y el backend le responde 403 en las demás.
// Puede: solicitar y ejecutar traslados, administrar dosis, signos vitales.
// No puede: egresar, aprobar traslados, prescribir.
import { test, expect } from '@playwright/test'
import { API, pacienteHospitalizado } from './helpers'

// Sin la sesión del administrador: esta prueba inicia sesión como la enfermera.
test.use({ storageState: { cookies: [], origins: [] } })

test('enfermería no ve las acciones que no tiene permitidas', async ({ page, request }) => {
  // Preparación con el usuario administrador (token de auth.setup.js).
  const { documento, idHospitalizacion, llamar } = await pacienteHospitalizado(request)

  // Inicio de sesión como enfermera
  await page.goto('/auth/sign-in')
  await page.getByLabel('Correo electrónico').fill(process.env.E2E_ENFERMERIA_EMAIL)
  await page.locator('#password').fill(process.env.E2E_ENFERMERIA_PASSWORD)
  await page.getByRole('button', { name: /iniciar/i }).click()
  await expect(page).toHaveURL(/hospitalizacion\/censo/)
  const tokenEnfermera = await page.evaluate(() => localStorage.getItem('access_token'))

  // Detalle: puede solicitar traslado, pero no ve "Egresar paciente"
  await page.goto(`/hospitalizacion/${idHospitalizacion}`)
  await expect(page.getByText(documento)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Solicitar traslado' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Egresar paciente' })).toHaveCount(0)

  // Aunque intente egresar directamente por la API, el backend lo bloquea
  const egreso = await request.post(`${API}/hospitalizaciones/${idHospitalizacion}/egresar`, {
    headers: { Authorization: `Bearer ${tokenEnfermera}`, Accept: 'application/json' },
    data: { observaciones: 'Intento sin permiso' },
  })
  expect(egreso.status()).toBe(403)
  expect((await egreso.json()).message).toBe('No tiene permiso para: Egresar pacientes.')

  // Solicita el traslado desde la pantalla
  await page.getByRole('button', { name: 'Solicitar traslado' }).click()
  await page.locator('#transfer-bed').selectOption({ index: 1 })
  await page.locator('#transfer-reason').fill('Traslado solicitado por enfermería')
  await page.locator('.transfer-modal').getByRole('button', { name: 'Solicitar traslado' }).click()
  await expect(page.getByText('Solicitud de traslado creada')).toBeVisible()

  // En la bandeja ve la solicitud, pero NO puede aprobarla ni rechazarla
  await page.goto('/hospitalizacion/traslados')
  const tarjeta = page.locator('.tray-card', { hasText: documento })
  await expect(tarjeta).toBeVisible()
  await expect(tarjeta.getByRole('button', { name: 'Aprobar' })).toHaveCount(0)
  await expect(tarjeta.getByRole('button', { name: 'Rechazar' })).toHaveCount(0)

  // La coordinación (administrador) aprueba por la API; enfermería ya puede completarlo
  const abiertos = await llamar('get', '/tranfer-requests/abiertos')
  const traslado = abiertos.data.find(t => t.patient?.identificacion === documento)
  await llamar('patch', `/tranfer-requests/${traslado.id}/approve`, { observaciones: 'Aprobado en prueba' })
  await page.reload()
  await tarjeta.getByRole('button', { name: 'Completar' }).click()
  await page.locator('.tray-modal').getByRole('button', { name: 'Completar traslado' }).click()
  await expect(page.locator('.tray-card', { hasText: documento })).toHaveCount(0)

  // Limpieza: el administrador egresa al paciente de prueba
  await llamar('post', `/hospitalizaciones/${idHospitalizacion}/egresar`, { observaciones: 'Fin de prueba de permisos' })
})
