// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/hospitalizacion\/nuevo-ingreso$/,
    titulo: 'Nuevo ingreso hospitalario',
    proposito: 'Realice el flujo inicial de ingreso y hospitalización de un paciente.',
    acciones: [
      'Identificar al paciente.',
      'Seleccionar admisión, servicio y datos del ingreso.',
      'Completar el proceso de hospitalización.',
    ],
    pasos: [
      'Busque al paciente.',
      'Valide la admisión y la información clínica.',
      'Confirme el ingreso.',
    ],
    notas: [],
  },
  {
    ruta: /^\/hospitalizacion\/estaciones\/[^/]+\/reservas$/,
    titulo: 'Reservas de la estación',
    proposito: 'Revise y gestione las solicitudes de cama correspondientes a una estación de enfermería.',
    acciones: [
      'Consultar reservas pendientes y aceptadas.',
      'Aceptar una reserva disponible.',
      'Revisar paciente, orden y cama solicitada.',
    ],
    pasos: [
      'Seleccione una reserva pendiente.',
      'Verifique paciente y cama.',
      'Confirme la aceptación.',
    ],
    notas: [],
  },
  {
    ruta: /^\/hospitalizacion\/estaciones\/[^/]+$/,
    titulo: 'Detalle de estación',
    proposito: 'Supervise las camas, pacientes y tareas asistenciales de una estación.',
    acciones: [
      'Consultar disponibilidad y ocupación.',
      'Abrir opciones de una cama ocupada.',
      'Registrar la administración de una dosis, o marcarla como "No administrada" con su motivo.',
      'Ver la última toma de signos vitales y registrar una nueva.',
      'Solicitar un traslado de cama.',
      'Egresar al paciente.',
      'Abrir la atención del paciente.',
    ],
    pasos: [
      'Ubique la cama.',
      'Abra sus opciones.',
      'Seleccione la tarea clínica requerida y complete el formulario.',
    ],
    notas: [
      'Una dosis se puede registrar desde una hora antes de su hora programada.',
      'Antes de confirmar una dosis, verifique el nombre del paciente que aparece en la ventana.',
      'Si los signos vitales generan una alerta, el sistema lo indica al guardar: informe al médico.',
      'Los traslados solicitados se aprueban y completan en la Bandeja de traslados.',
    ],
  },
  {
    ruta: /^\/hospitalizacion\/estaciones$/,
    titulo: 'Estaciones de enfermería',
    proposito: 'Consulte el estado operativo de las estaciones, sus camas y reservas.',
    acciones: [
      'Visualizar estaciones y ocupación.',
      'Ingresar al detalle de una estación.',
      'Consultar reservas pendientes.',
    ],
    pasos: [
      'Seleccione la estación.',
      'Revise sus indicadores.',
      'Abra el detalle para gestionar camas y pacientes.',
    ],
    notas: [],
  },
  {
    ruta: /^\/hospitalizacion\/censo$/,
    titulo: 'Censo hospitalario',
    proposito: 'Consulte la ocupación hospitalaria y la ubicación actual de los pacientes.',
    acciones: [
      'Revisar pacientes hospitalizados.',
      'Filtrar la información disponible.',
      'Abrir el detalle de una hospitalización.',
    ],
    pasos: [
      'Aplique los filtros necesarios.',
      'Ubique al paciente.',
      'Abra su hospitalización para ampliar la información.',
    ],
    notas: [],
  },
  {
    ruta: /^\/hospitalizacion\/pacientes\/[^/]+\/atencion$/,
    titulo: 'Atención y evolución',
    proposito: 'Registre y consulte la evolución clínica del paciente hospitalizado.',
    acciones: [
      'Seleccionar un registro asistencial.',
      'Consultar su contenido en el panel derecho.',
      'Crear planes de medicamentos y procedimientos.',
      'Registrar nueva información clínica.',
    ],
    pasos: [
      'Seleccione el registro de la izquierda.',
      'Revise el detalle.',
      'Use las acciones superiores para agregar información.',
    ],
    notas: [],
  },
  {
    // Va antes del detalle (/hospitalizacion/:id), porque "traslados" también coincidiría con él.
    ruta: /^\/hospitalizacion\/traslados$/,
    titulo: 'Bandeja de traslados',
    proposito: 'Gestione los traslados de cama que están en curso: apruébelos, ejecútelos o cancélelos.',
    acciones: [
      'Ver los traslados pendientes, aprobados y en tránsito, con paciente, cama de origen y de destino.',
      'Filtrar por estación de enfermería.',
      'Aprobar o rechazar una solicitud pendiente.',
      'Marcar que el paciente va en camino.',
      'Completar el traslado cuando el paciente ya está en la cama nueva.',
      'Cancelar un traslado que ya no se hará.',
    ],
    pasos: [
      'Seleccione su estación (o deje "Todas las estaciones").',
      'Revise primero los traslados urgentes: aparecen de primeros.',
      'Apruebe la solicitud si la cama destino está lista.',
      'Cuando el paciente salga, márquelo "en camino".',
      'Al llegar el paciente a la nueva cama, pulse "Completar".',
    ],
    notas: [
      'Rechazar solo es posible mientras la solicitud está pendiente; después use "Cancelar".',
      'El rechazo y la cancelación exigen un motivo.',
      'Al completar, la cama de origen queda libre. Si la cama destino fue ocupada mientras tanto, el sistema no deja completar.',
      'Mientras un traslado esté en curso, el paciente no se puede egresar.',
    ],
  },
  {
    ruta: /^\/hospitalizacion\/[^/]+$/,
    titulo: 'Detalle de hospitalización',
    proposito: 'Consulte la estancia de un paciente y gestione su traslado o su egreso.',
    acciones: [
      'Ver paciente, días de estancia, admisión, responsable y cama actual.',
      'Ver los traslados en curso y el historial de ubicaciones (ingreso, traslados, egreso).',
      'Abrir la atención clínica del paciente.',
      'Solicitar un traslado de cama.',
      'Egresar al paciente.',
    ],
    pasos: [
      'Confirme que es el paciente correcto en el encabezado.',
      'Para egresar, pulse "Egresar paciente", escriba las observaciones y confirme que existe orden médica de salida.',
      'Si hay un traslado en curso, resuélvalo primero en la Bandeja de traslados.',
    ],
    notas: [
      'El egreso no se puede deshacer: libera la cama, suspende las dosis pendientes y cierra la admisión.',
      'Una vez egresado, el paciente puede volver a ser admitido con una nueva admisión.',
    ],
  },
  {
    ruta: /^\/admision\/reservas\/nueva$/,
    titulo: 'Nueva reserva de cama',
    proposito: 'Solicite una cama utilizando el paciente y la orden de servicio de la admisión.',
    acciones: [
      'Revisar el paciente recibido desde la admisión.',
      'Seleccionar estación o cama disponible.',
      'Enviar la solicitud de reserva.',
    ],
    pasos: [
      'Confirme paciente y orden.',
      'Seleccione la ubicación disponible.',
      'Registre y confirme la solicitud.',
    ],
    notas: [],
  },
  {
    ruta: /^\/admision\/reservas$/,
    titulo: 'Reservas de admisión',
    proposito: 'Consulte y gestione las reservas de cama asociadas a procesos de admisión.',
    acciones: [
      'Identificar paciente, solicitante, fecha y cama.',
      'Consultar la información completa de la reserva.',
      'Aceptar solicitudes pendientes desde la bandeja.',
    ],
    pasos: [
      'Localice la reserva.',
      'Abra Detalle y verifique toda la información.',
      'Pulse Aceptar, seleccione la estancia cuando sea necesario y confirme.',
    ],
    notas: [
      'Aceptar realiza el ingreso hospitalario y ocupa la cama de forma automática.',
    ],
  },
]
