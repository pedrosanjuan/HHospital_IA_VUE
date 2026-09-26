# Pruebas de pantalla automatizadas (Playwright)

Estas pruebas abren un navegador, inician sesión y llenan los formularios igual que lo haría una persona. Al final verifican que la pantalla muestre el resultado esperado. **Sí crean datos** en la base de QA. Los datos de prueba se reconocen porque el documento del paciente empieza por `E2E`.

Siempre prueban el **backend local** (`../HHospital_IA` en `http://127.0.0.1:8000`), es decir, el código que se está desarrollando. Para eso levantan su propio frontend en el puerto **3100**, con la API fijada al backend local, sin importar a dónde apunte el `.env` del frontend (por ejemplo, al servidor de QA). Así se evita probar sin darse cuenta un backend desplegado que no tiene los cambios.

## Requisitos (una sola vez)

1. Instale las dependencias: `npm install`.
2. Instale el navegador de pruebas: `npx playwright install chromium`.
3. Cree el archivo `e2e/.env.e2e` con el usuario de pruebas de QA. El archivo no se sube al repositorio:
   ```
   E2E_EMAIL=e2e@sofingtech.test
   E2E_PASSWORD=la-contraseña
   ```
4. Revise que el backend (`../HHospital_IA`) tenga su `.env` apuntando a QA.

No hace falta levantar nada a mano. Playwright arranca el backend (puerto 8000, con 4 procesos) y el frontend de pruebas (puerto 3100) si no están corriendo, y los reutiliza si ya lo están. Su `npm run dev` normal, en el puerto 3000, no interfiere.

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
| `hospitalizacion.spec.js` | Estancia completa por pantalla: detalle de la hospitalización, solicitar traslado, aprobarlo y completarlo en la bandeja, y egresar. El paciente hospitalizado se prepara por la API. |

Cada flujo nuevo va en su propio archivo `<modulo>.spec.js`. Para ubicar los campos se usa su `id` (`#primernombre`) o su texto visible (`getByLabel('Correo electrónico')`). Por eso, cuando se crea una pantalla, conviene que cada campo tenga `id` y etiqueta.
