# Pruebas de pantalla automatizadas (Playwright)

Estas pruebas abren un navegador, inician sesión y llenan los formularios igual que lo haría una persona. Al final verifican que la pantalla muestre el resultado esperado. Corren contra el backend local y la base de datos de **QA**, así que **sí crean datos**. Los datos de prueba se reconocen porque el documento del paciente empieza por `E2E`.

## Requisitos (una sola vez)

1. Instale las dependencias: `npm install`.
2. Instale el navegador de pruebas: `npx playwright install chromium`.
3. Cree el archivo `e2e/.env.e2e` con el usuario de pruebas de QA. El archivo no se sube al repositorio:
   ```
   E2E_EMAIL=e2e@sofingtech.test
   E2E_PASSWORD=la-contraseña
   ```
4. Revise que el backend (`../HHospital_IA`) tenga su `.env` apuntando a QA.

No hace falta levantar nada a mano. Si el backend (puerto 8000) y el frontend (puerto 3000) no están corriendo, Playwright los arranca, y si ya están corriendo, los reutiliza.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run test:e2e` | Corre todas las pruebas sin mostrar el navegador. |
| `npm run test:e2e:ver` | Corre las pruebas **mostrando el navegador** para ver cómo se llenan los formularios. |
| `npm run test:e2e:ui` | Abre el panel de Playwright para elegir y repetir pruebas paso a paso. |
| `npm run test:e2e:reporte` | Abre el informe HTML de la última corrida. |
| `npx playwright test e2e/pacientes.spec.js` | Corre solo un archivo. |

## Cuando una prueba falla

Playwright guarda en `test-results/` una **captura**, un **video** y una **traza** de la prueba que falló. Para revisar la traza paso a paso, con cada clic y cada respuesta de la API:

```
npx playwright show-trace test-results/<carpeta-de-la-prueba>/trace.zip
```

## Cómo están organizadas

| Archivo | Qué prueba |
|---|---|
| `auth.setup.js` | Inicia sesión una vez y guarda la sesión para las demás pruebas. |
| `helpers.js` | Utilidades: documento de prueba único, elegir opciones en listas y buscadores. |
| `pacientes.spec.js` | Crear un paciente desde el formulario. |

Cada flujo nuevo va en su propio archivo `<modulo>.spec.js`. Para ubicar los campos se usa su `id` (`#primernombre`) o su texto visible (`getByLabel('Correo electrónico')`). Por eso, cuando se crea una pantalla, conviene que cada campo tenga `id` y etiqueta.
