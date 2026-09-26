// Parametrización → Roles → Permisos: los permisos se ven agrupados por módulo, con nombre
// legible, buscador y su descripción. La prueba solo consulta: no guarda cambios en el rol.
import { test, expect } from '@playwright/test'

test('ver los permisos de un rol agrupados y con su descripción', async ({ page }) => {
  await page.goto('/parametrizacion/general?seccion=security')

  const fila = page.locator('article', { hasText: 'Administrador' }).first()
  await fila.getByRole('button', { name: 'Permisos' }).click()

  // Grupos por módulo y nombre legible del permiso
  await expect(page.locator('.perm-group header', { hasText: 'Hospitalización' })).toBeVisible()
  await expect(page.getByText('Egresar pacientes')).toBeVisible()

  // El buscador filtra por nombre, código o módulo
  await page.getByPlaceholder('Buscar permiso por nombre, código o módulo…').fill('egreso')
  await expect(page.locator('.perm-item')).toHaveCount(1)

  // La descripción se despliega con "¿Qué permite?"
  await page.locator('.perm-item').getByText('¿Qué permite?').click()
  await expect(page.locator('.perm-help')).toContainText('El egreso no se puede deshacer.')
})
