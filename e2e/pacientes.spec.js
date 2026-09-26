// Pantalla "Crear paciente": llena el formulario como lo haría el personal de admisiones.
import { test, expect } from '@playwright/test'
import { documentoPrueba, elegirEnBuscador, elegirPrimera } from './helpers'

test('crear un paciente nuevo desde el formulario', async ({ page }) => {
  const documento = documentoPrueba()
  await page.goto('/pacientes/nuevo')
  // La pantalla carga varios catálogos (incluido todo el CIE-10); con el backend local y la
  // base remota puede tardar más que la espera normal de 15 s.
  await expect(page.getByText('Cargando catálogos del hospital…')).toBeHidden({ timeout: 60_000 })

  // Identificación: al salir del campo la pantalla verifica que el documento no exista.
  await elegirPrimera(page, '#tipo_doc')
  await page.locator('#identificacion').fill(documento)
  await page.locator('#identificacion').blur()

  await page.locator('#primernombre').fill('Prueba')
  await page.locator('#primerapellido').fill('Automatizada')
  await page.locator('#fecha_de_nacimiento').fill('1990-05-20')
  await elegirPrimera(page, '#sexo')
  await page.locator('#email').fill('e2e@example.com')
  await page.locator('#celular1').fill('3000000000')
  await elegirPrimera(page, '#pais')

  // Aseguramiento: tercero contratante (EPS) y luego uno de sus contratos.
  await elegirEnBuscador(page, '#id_tercero_principal')
  await elegirEnBuscador(page, '#id_contrato')

  // La pantalla tiene dos botones de guardar (encabezado y pie); se usa el del formulario.
  await page.locator('form').getByRole('button', { name: 'Guardar paciente' }).click()
  await expect(page.getByText('Paciente creado correctamente.')).toBeVisible()
})
