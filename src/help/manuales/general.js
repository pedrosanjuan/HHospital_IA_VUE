// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/$/,
    titulo: 'Inicio del sistema',
    proposito: 'Acceda a los módulos habilitados para su usuario y consulte la información general de la operación.',
    acciones: [
      'Abrir módulos desde el menú lateral.',
      'Consultar accesos disponibles según su perfil.',
      'Volver al inicio desde cualquier proceso.',
    ],
    pasos: [
      'Revise el menú asignado a su usuario.',
      'Seleccione el módulo requerido.',
      'Utilice esta ayuda dentro de cada pantalla para conocer sus acciones.',
    ],
    notas: [
      'Las opciones del menú dependen de los permisos del usuario autenticado.',
    ],
  },
]
