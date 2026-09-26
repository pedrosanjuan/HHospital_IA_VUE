// Inicia sesión por la pantalla real y guarda el estado (token en localStorage)
// para que las demás pruebas empiecen ya autenticadas.
import { test as setup, expect } from '@playwright/test'

setup('iniciar sesión', async ({ page }) => {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD
  if (!email || !password) throw new Error('Faltan E2E_EMAIL y E2E_PASSWORD en e2e/.env.e2e')

  await page.goto('/auth/sign-in')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: /ingresar|iniciar/i }).click()

  // Tras el login la aplicación redirige al censo hospitalario.
  await expect(page).toHaveURL(/hospitalizacion\/censo/)
  await page.context().storageState({ path: 'e2e/.auth/usuario.json' })
})
