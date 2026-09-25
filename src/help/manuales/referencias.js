// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/referencias\/nueva$/,
    titulo: 'Nueva referencia',
    proposito: 'Registre una solicitud de remisión hacia otro establecimiento de salud.',
    acciones: [
      'Seleccionar paciente y destino.',
      'Registrar información clínica y administrativa.',
      'Adjuntar o relacionar la información requerida.',
    ],
    pasos: [
      'Identifique al paciente.',
      'Complete motivo, prioridad y establecimiento.',
      'Revise y envíe la referencia.',
    ],
    notas: [],
  },
  {
    ruta: /^\/referencias\/autorizaciones$/,
    titulo: 'Autorizaciones de referencia',
    proposito: 'Revise y gestione las referencias que requieren decisión administrativa.',
    acciones: [
      'Consultar solicitudes.',
      'Revisar detalle y prioridad.',
      'Autorizar o gestionar la solicitud.',
    ],
    pasos: [
      'Seleccione el caso.',
      'Valide la información.',
      'Registre la decisión correspondiente.',
    ],
    notas: [],
  },
  {
    ruta: /^\/referencias\/establecimientos$/,
    titulo: 'Establecimientos de salud',
    proposito: 'Administre los establecimientos utilizados como origen o destino de referencias.',
    acciones: [
      'Buscar establecimientos.',
      'Crear nuevos registros.',
      'Editar información de contacto y ubicación.',
    ],
    pasos: [
      'Busque antes de crear.',
      'Complete los datos institucionales.',
      'Guarde y compruebe que quede disponible.',
    ],
    notas: [],
  },
  {
    ruta: /^\/referencias\/[^/]+\/contrareferencia$/,
    titulo: 'Crear contrarreferencia',
    proposito: 'Registre la respuesta clínica y el retorno asistencial de una referencia.',
    acciones: [
      'Consultar la referencia original.',
      'Registrar resumen, conducta y recomendaciones.',
      'Guardar la contrarreferencia.',
    ],
    pasos: [
      'Revise el caso de origen.',
      'Complete la información clínica.',
      'Confirme el registro.',
    ],
    notas: [],
  },
  {
    ruta: /^\/referencias\/[^/]+$/,
    titulo: 'Detalle de referencia',
    proposito: 'Consulte la información, estado y seguimiento de una referencia.',
    acciones: [
      'Revisar información clínica y administrativa.',
      'Consultar trazabilidad.',
      'Continuar con autorización o contrarreferencia.',
    ],
    pasos: [
      'Confirme paciente y destino.',
      'Revise estado y eventos.',
      'Ejecute la siguiente acción disponible.',
    ],
    notas: [],
  },
  {
    ruta: /^\/referencias$/,
    titulo: 'Referencias',
    proposito: 'Consulte y dé seguimiento a las remisiones registradas.',
    acciones: [
      'Buscar y filtrar referencias.',
      'Abrir el detalle.',
      'Crear una nueva referencia.',
    ],
    pasos: [
      'Aplique filtros.',
      'Seleccione el registro.',
      'Abra su detalle o cree una nueva solicitud.',
    ],
    notas: [],
  },
  {
    ruta: /^\/contrareferencias\/seguimiento$/,
    titulo: 'Seguimiento de contrarreferencias',
    proposito: 'Priorice casos urgentes y acciones de seguimiento pendientes.',
    acciones: [
      'Consultar casos prioritarios.',
      'Revisar estado y fechas.',
      'Acceder al registro para continuar la gestión.',
    ],
    pasos: [
      'Revise primero los casos urgentes.',
      'Abra el detalle.',
      'Registre la acción de seguimiento.',
    ],
    notas: [],
  },
  {
    ruta: /^\/contrareferencias\/[^/]+\/documentos$/,
    titulo: 'Documentos de contrarreferencia',
    proposito: 'Consulte y gestione los documentos relacionados con una contrarreferencia.',
    acciones: [
      'Visualizar documentos.',
      'Adjuntar archivos permitidos.',
      'Verificar la documentación del caso.',
    ],
    pasos: [
      'Confirme el caso.',
      'Seleccione el documento.',
      'Cargue y compruebe el resultado.',
    ],
    notas: [],
  },
  {
    ruta: /^\/contrareferencias$/,
    titulo: 'Contrarreferencias',
    proposito: 'Consulte las respuestas y retornos asociados a referencias.',
    acciones: [
      'Buscar contrarreferencias.',
      'Revisar estado y paciente.',
      'Acceder a documentos y seguimiento.',
    ],
    pasos: [
      'Aplique filtros.',
      'Seleccione el registro.',
      'Abra la opción requerida.',
    ],
    notas: [],
  },
]
