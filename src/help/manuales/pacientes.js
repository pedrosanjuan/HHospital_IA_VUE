// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/pacientes\/nuevo$/,
    titulo: 'Crear paciente',
    proposito: 'Registre la información demográfica y de contacto necesaria para identificar al paciente.',
    acciones: [
      'Completar datos personales y de identificación.',
      'Registrar información de contacto y residencia.',
      'Guardar el paciente para utilizarlo en admisiones y citas.',
    ],
    pasos: [
      'Diligencie los campos obligatorios.',
      'Revise que la identificación sea correcta.',
      'Guarde el registro y confirme el mensaje del sistema.',
    ],
    notas: [
      'Evite crear pacientes duplicados; realice primero una búsqueda.',
    ],
  },
  {
    ruta: /^\/pacientes\/[^/]+$/,
    titulo: 'Detalle del paciente',
    proposito: 'Consulte la información integral del paciente e inicie su proceso asistencial.',
    acciones: [
      'Revisar información básica.',
      'Consultar, agregar, activar o inactivar contratos desde Aseguramiento.',
      'Consultar admisiones relacionadas.',
      'Continuar una admisión activa o crear una nueva.',
    ],
    pasos: [
      'Confirme la identidad del paciente.',
      'Revise su aseguramiento y contratos.',
      'Valide si existe una admisión activa.',
      'Utilice la acción requerida desde la ficha.',
    ],
    notas: [],
  },
  {
    ruta: /^\/pacientes$/,
    titulo: 'Buscar pacientes',
    proposito: 'Localice pacientes registrados utilizando identificación, nombre u otros filtros disponibles.',
    acciones: [
      'Buscar y paginar resultados.',
      'Abrir la ficha de un paciente.',
      'Crear un paciente cuando no existe.',
      'Iniciar o continuar una admisión.',
    ],
    pasos: [
      'Ingrese un criterio de búsqueda.',
      'Seleccione el paciente correcto en los resultados.',
      'Abra su detalle o la acción asistencial necesaria.',
    ],
    notas: [],
  },
  {
    ruta: /^\/admisiones\/[^/]+$/,
    titulo: 'Detalle de admisión',
    proposito: 'Administre los servicios y acciones asociados a una admisión hospitalaria.',
    acciones: [
      'Consultar datos de la admisión y del paciente.',
      'Revisar servicios asociados.',
      'Agregar servicios manualmente.',
      'Ejecutar las opciones habilitadas por cada servicio.',
      'Solicitar una reserva de cama.',
    ],
    pasos: [
      'Verifique el estado de la admisión.',
      'Ubique el servicio requerido.',
      'Abra Opciones y seleccione la acción autorizada.',
    ],
    notas: [
      'Las opciones visibles son suministradas por el backend según el estado del servicio.',
    ],
  },
]
