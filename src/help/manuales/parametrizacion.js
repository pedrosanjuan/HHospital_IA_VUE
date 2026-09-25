// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
export default [
  {
    ruta: /^\/parametrizacion\/ubicaciones-fisicas$/,
    titulo: 'Ubicaciones físicas',
    proposito: 'Administre la estructura jerárquica de sedes, áreas, estaciones y camas.',
    acciones: [
      'Consultar el árbol físico.',
      'Crear y editar ubicaciones.',
      'Navegar por niveles de la estructura.',
    ],
    pasos: [
      'Seleccione un nodo del árbol.',
      'Revise sus datos.',
      'Utilice la acción de creación o edición requerida.',
    ],
    notas: [],
  },
  {
    ruta: /^\/parametrizacion\/usuarios\/[^/]+$/,
    titulo: 'Configuración de usuario',
    proposito: 'Consulte y configure perfiles, accesos y condiciones de contratación de un usuario.',
    acciones: [
      'Revisar información del usuario.',
      'Asignar perfiles, roles y permisos.',
      'Configurar la disponibilidad semanal en Contratación.',
      'Consultar relaciones y parámetros.',
    ],
    pasos: [
      'Confirme el usuario seleccionado.',
      'Abra la pestaña requerida.',
      'Para profesionales, registre sus franjas en Contratación.',
      'Guarde y compruebe el resultado.',
    ],
    notas: [
      'Las vacaciones, incapacidades y permisos no deben eliminar el horario recurrente.',
    ],
  },
  {
    ruta: /^\/parametrizacion\/usuarios$/,
    titulo: 'Usuarios',
    proposito: 'Busque usuarios del sistema y acceda a su configuración.',
    acciones: [
      'Buscar y filtrar usuarios.',
      'Abrir el detalle.',
      'Consultar estado y datos básicos.',
    ],
    pasos: [
      'Ingrese el criterio.',
      'Seleccione el usuario.',
      'Abra su configuración.',
    ],
    notas: [],
  },
  {
    ruta: /^\/(parametrizacion\/general|consulta-externa\/consultorios|parametrizar-consultorio)$/,
    titulo: 'Parametrización general',
    proposito: 'Administre catálogos y configuraciones generales utilizadas por los módulos del hospital.',
    acciones: [
      'Configurar perfiles, seguridad y documentos.',
      'Administrar especialidades y servicios.',
      'Configurar consultorios y horarios.',
      'Gestionar asociaciones entre catálogos.',
    ],
    pasos: [
      'Seleccione una sección del menú lateral.',
      'Busque o seleccione el registro.',
      'Cree o modifique la configuración y guarde.',
    ],
    notas: [
      'Los cambios pueden afectar formularios y permisos de otros módulos.',
    ],
  },
]
