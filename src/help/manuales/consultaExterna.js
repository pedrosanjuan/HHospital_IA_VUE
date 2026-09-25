// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/consulta-externa\/citas\/[^/]+$/,
    titulo: 'Detalle de cita',
    proposito: 'Consulte y administre toda la información de una cita de consulta externa.',
    acciones: [
      'Consultar datos e historial.',
      'Reprogramar la cita.',
      'Adjuntar un documento PDF.',
      'Realizar cierre administrativo.',
    ],
    pasos: [
      'Revise el estado y la trazabilidad.',
      'Seleccione la acción administrativa.',
      'Complete los datos y confirme.',
    ],
    notas: [
      'La reprogramación vuelve a validar profesional y consultorio.',
    ],
  },
  {
    ruta: /^\/consulta-externa\/solicitudes$/,
    titulo: 'Solicitudes de citas',
    proposito: 'Gestione solicitudes pendientes y conviértalas en citas programadas.',
    acciones: [
      'Consultar solicitudes.',
      'Revisar el detalle.',
      'Asignar una solicitud en la agenda.',
    ],
    pasos: [
      'Seleccione la solicitud.',
      'Pulse Asignar en agenda.',
      'Defina horario y consultorio y confirme.',
    ],
    notas: [],
  },
  {
    ruta: /^\/consulta-externa\/no-atendidas$/,
    titulo: 'Citas no atendidas',
    proposito: 'Revise inasistencias y casos que requieren cierre administrativo.',
    acciones: [
      'Consultar citas no atendidas.',
      'Revisar información del paciente.',
      'Ejecutar el cierre administrativo.',
    ],
    pasos: [
      'Abra el registro.',
      'Verifique su estado.',
      'Confirme el cierre cuando corresponda.',
    ],
    notas: [],
  },
  {
    ruta: /^\/consulta-externa\/horarios-profesionales$/,
    titulo: 'Horarios de profesionales',
    proposito: 'Configure la disponibilidad semanal recurrente y las excepciones de agenda de cada profesional.',
    acciones: [
      'Filtrar por especialidad y profesional.',
      'Agregar varias franjas por día.',
      'Editar o eliminar una franja.',
      'Bloquear fechas específicas sin alterar el horario base.',
    ],
    pasos: [
      'Seleccione especialidad y profesional.',
      'Revise la cuadrícula semanal.',
      'Agregue o edite las franjas necesarias.',
      'Use Excepción de agenda para vacaciones, permisos o incapacidades.',
    ],
    notas: [
      'No se podrán editar o eliminar intervalos cuando el cambio afecte citas activas futuras.',
    ],
  },
  {
    ruta: /^\/mi-agenda$/,
    titulo: 'Mi agenda profesional',
    proposito: 'Consulte por separado sus citas programadas y actividades clínicas asignadas.',
    acciones: [
      'Filtrar citas por fechas.',
      'Consultar actividades por estado.',
      'Abrir una cita.',
      'Completar actividades clínicas.',
    ],
    pasos: [
      'Seleccione Citas programadas o Actividades clínicas.',
      'Aplique los filtros.',
      'Abra o complete el registro correspondiente.',
    ],
    notas: [],
  },
  {
    ruta: /^\/(consulta-externa(\/agenda)?|agenda-intramural|programacion-consultorio)$/,
    titulo: 'Agenda de consultorios',
    proposito: 'Consulte disponibilidad y gestione la programación diaria de consulta externa.',
    acciones: [
      'Filtrar por consultorio y fechas.',
      'Agendar citas en espacios libres.',
      'Gestionar citas ocupadas.',
      'Registrar llegada, llamado, confirmación, cancelación o inasistencia.',
      'Abrir el detalle y la trazabilidad.',
    ],
    pasos: [
      'Seleccione consultorio y período.',
      'Ubique el día y el turno.',
      'Pulse Agendar o Gestionar y complete la acción.',
    ],
    notas: [
      'Antes de guardar, el sistema vuelve a validar la disponibilidad.',
    ],
  },
]
