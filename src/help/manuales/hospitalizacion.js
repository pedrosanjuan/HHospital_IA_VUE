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
      'Gestionar medicamentos, procedimientos y signos vitales.',
      'Solicitar traslados.',
      'Abrir la atención del paciente.',
    ],
    pasos: [
      'Ubique la cama.',
      'Abra sus opciones.',
      'Seleccione la tarea clínica requerida y complete el formulario.',
    ],
    notas: [
      'Medicamentos, procedimientos y signos vitales se gestionan en ventanas modales.',
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
    ruta: /^\/hospitalizacion\/[^/]+$/,
    titulo: 'Detalle de hospitalización',
    proposito: 'Consulte el estado y la información asistencial de una hospitalización.',
    acciones: [
      'Revisar paciente, admisión y ubicación.',
      'Consultar información clínica relacionada.',
      'Acceder a las acciones habilitadas.',
    ],
    pasos: [
      'Confirme el paciente.',
      'Revise el estado actual.',
      'Continúe con la acción asistencial correspondiente.',
    ],
    notas: [],
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
