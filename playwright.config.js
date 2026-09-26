// Configuración de las pruebas de pantalla con Playwright.
// Guía completa: e2e/README.md
import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

// Credenciales del usuario de pruebas (E2E_EMAIL, E2E_PASSWORD). El archivo no se sube al repo.
if (existsSync('e2e/.env.e2e')) process.loadEnvFile('e2e/.env.e2e')

export default defineConfig({
  testDir: './e2e',
  // Los flujos clínicos comparten datos (camas, reservas): se ejecutan uno a la vez.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    // Evidencia de cada fallo: captura, video y traza paso a paso (npx playwright show-trace).
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },
  projects: [
    // Inicia sesión una vez y guarda el token para las demás pruebas.
    { name: 'sesion', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/usuario.json' },
      dependencies: ['sesion'],
    },
  ],
  // Levanta backend y frontend si no están corriendo; si ya lo están, los reutiliza.
  webServer: [
    {
      command: 'php artisan serve --port=8000',
      cwd: '../HHospital_IA',
      url: 'http://127.0.0.1:8000/up',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
})
