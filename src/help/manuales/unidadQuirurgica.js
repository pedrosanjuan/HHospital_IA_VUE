// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/unidad-quirurgica\/programar$/,
    titulo: 'Programar cirugía',
    proposito: 'Reserve un quirófano para una cirugía activa del paciente y asigne el equipo requerido.',
    acciones: [
      'Buscar el paciente.',
      'Seleccionar una cirugía activa.',
      'Consultar equipo requerido.',
      'Asignar profesionales por perfil.',
      'Seleccionar sala, fecha y horario.',
    ],
    pasos: [
      'Busque al paciente por identificación.',
      'Seleccione una cirugía.',
      'Asigne el equipo y complete la programación.',
      'Confirme la reserva.',
    ],
    notas: [
      'El formulario permanece bloqueado cuando el paciente no tiene cirugías activas.',
    ],
  },
  {
    ruta: /^\/unidad-quirurgica\/parametrizacion$/,
    titulo: 'Parametrización quirúrgica',
    proposito: 'Configure quirófanos, tipos, horarios y características operativas.',
    acciones: [
      'Consultar salas configuradas.',
      'Crear o editar quirófanos.',
      'Configurar horarios.',
      'Revisar detalle y trazabilidad.',
    ],
    pasos: [
      'Seleccione el tipo o quirófano.',
      'Complete la configuración.',
      'Guarde y verifique el resultado.',
    ],
    notas: [],
  },
  {
    ruta: /^\/unidad-quirurgica\/cirugias\/[^/]+$/,
    titulo: 'Detalle de cirugía',
    proposito: 'Consulte la programación, equipo y evolución administrativa de una cirugía.',
    acciones: [
      'Revisar paciente y procedimiento.',
      'Consultar sala, horario y equipo.',
      'Ejecutar acciones permitidas por el estado.',
    ],
    pasos: [
      'Valide la cirugía.',
      'Revise equipo y programación.',
      'Continúe con la acción habilitada.',
    ],
    notas: [],
  },
  {
    ruta: /^\/unidad-quirurgica\/(agenda|historial)$/,
    titulo: 'Agenda e historial quirúrgico',
    proposito: 'Consulte la programación quirúrgica por fecha, sala y estado.',
    acciones: [
      'Filtrar cirugías.',
      'Diferenciar agenda activa e historial.',
      'Abrir el detalle del procedimiento.',
    ],
    pasos: [
      'Seleccione período y filtros.',
      'Ubique la cirugía.',
      'Abra su detalle.',
    ],
    notas: [],
  },
  {
    ruta: /^\/unidad-quirurgica$/,
    titulo: 'Unidad quirúrgica',
    proposito: 'Supervise ocupación, programación y actividad diaria de los quirófanos.',
    acciones: [
      'Consultar indicadores.',
      'Revisar actividad por quirófano.',
      'Abrir agenda e historial.',
      'Programar una cirugía.',
    ],
    pasos: [
      'Revise el resumen del día.',
      'Seleccione una sala o cirugía.',
      'Acceda al detalle o programe un nuevo procedimiento.',
    ],
    notas: [],
  },
]
