# HHospital IA — Frontend

Interfaz Vue 3 para el flujo de hospitalización: autenticación, identificación y
registro de pacientes, creación de admisiones, asignación de camas, censo y
detalle de estancia.

## Requisitos y ejecución

- Node.js 18 o superior.
- Copiar `.env.example` como `.env` y ajustar `VITE_API_URL`.
- Ejecutar `npm install` y posteriormente `npm run dev`.

## Módulo de hospitalización

Las pantallas están bajo `src/views/pages/hospitalizacion`. La integración se
divide en `src/services/api.js` (token, HTTP y normalización de errores) y
`src/services/hospitalizacion.js` (operaciones del dominio). Las rutas clínicas
requieren el token `access_token`, almacenado después del inicio de sesión.

Los identificadores de catálogos se capturan manualmente mientras el backend
publica sus endpoints. Si la creación de una orden no devuelve
`id_orden_trabajo`, el flujo informa la limitación y realiza el ingreso sin ese
campo opcional.

La pantalla independiente `/pacientes/nuevo` carga los catálogos oficiales,
verifica duplicidad, administra ubicación dependiente, diagnósticos CIE-10 y
contactos familiares. Cuando se abre con `?from=admission`, guarda el paciente
seleccionado temporalmente en `sessionStorage` y regresa al flujo anterior.

La ruta `/pacientes` permite buscar sin descargar inicialmente el directorio
completo. Conserva filtros y resultados en memoria al visitar `/pacientes/{id}`
y admite `?mode=select` para devolver un paciente al flujo que abrió el selector.
La búsqueda general usa paginación del servidor con tamaños de 10, 25, 50 o 100
registros y presenta el total informado por `meta.total`.

Desde `/pacientes/{id}`, la acción de admisión abre `/admisiones/{id}` cuando el
paciente ya tiene una orden activa. Si no la tiene, muestra un modal contextual
que crea la orden usando directamente el ID del paciente visible.

El sidebar consulta `/v1/User/Menus/list` después del login. El backend devuelve
menús con sus submenús ya filtrados por los permisos del usuario. El resultado
se conserva en el store Pinia de navegación y se persiste
por ocho horas bajo `hhospital:navigation:{userId}`. Una respuesta vacía se
considera una carga válida; los errores muestran un reintento manual. El cierre
de sesión elimina el menú antes de borrar las credenciales.

La ruta `/hospitalizacion/estaciones` presenta capacidad y reservas pendientes
por estación. Los datos viven 45 segundos en memoria, admiten actualización
manual y toleran fallos parciales al consultar los detalles. La ruta
`/hospitalizacion/estaciones/{id}` muestra salas, habitaciones, camas y pacientes.

## Template original

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur
