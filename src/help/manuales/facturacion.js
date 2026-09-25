// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
// Las bandejas de FacturacionModulo.vue comparten filtros (buscador y estado), por eso
// los pasos se repiten; lo que cambia es qué muestra cada bandeja y qué se hace con ella.
export default [
  {
    ruta: /^\/facturacion\/cuentas\/[^/]+$/,
    titulo: 'Detalle de cuenta hospitalaria',
    proposito: 'Revise y controle todo lo que se le va a cobrar al pagador por una atención: estancia, procedimientos, medicamentos e insumos.',
    acciones: [
      'Traer a la cuenta los cargos generados por la atención asistencial (sincronizar).',
      'Agregar un cargo manual o anular uno existente.',
      'Liquidar, cerrar o reabrir la cuenta.',
      'Generar la factura cuando la cuenta está cerrada.',
      'Revisar los bloqueos y que los valores cuadren.',
    ],
    pasos: [
      'Revise el contrato, la modalidad de pago y el pagador.',
      'Sincronice los cargos y revíselos uno por uno.',
      'Corrija los hallazgos que muestre la cuenta.',
      'Liquide y cierre la cuenta.',
      'Genere la factura.',
    ],
    notas: [
      'Una cuenta cerrada no recibe cargos nuevos. Para reabrirla debe indicar el motivo y tener autorización.',
    ],
  },
  {
    ruta: /^\/facturacion\/facturas\/[^/]+$/,
    titulo: 'Detalle de factura',
    proposito: 'Consulte una factura y lleve su gestión hasta el pago: envío electrónico, radicación ante el pagador, glosas y pagos.',
    acciones: [
      'Ver los datos de la factura y su estado.',
      'Transmitir la factura electrónica y los RIPS para su validación.',
      'Radicar la factura ante el pagador con su número o referencia.',
      'Registrar una glosa (objeción del pagador).',
      'Registrar un pago recibido.',
    ],
    pasos: [
      'Verifique el pagador, el valor y el estado de la factura.',
      'Transmita la factura y espere la validación.',
      'Radique la factura e ingrese la referencia de radicación.',
      'Si el pagador objeta valores, registre la glosa con la observación.',
      'Cuando llegue el dinero, registre el pago con su valor.',
    ],
    notas: [
      'Cada acción queda registrada. Revise bien la referencia y los valores antes de confirmar.',
    ],
  },
  {
    ruta: /^\/facturacion\/glosas\/[^/]+$/,
    titulo: 'Detalle de glosa',
    proposito: 'Consulte una glosa, es decir una objeción del pagador a una factura, y registre la respuesta de la institución.',
    acciones: [
      'Ver los datos de la glosa y su estado.',
      'Responder la glosa con la justificación de la institución.',
    ],
    pasos: [
      'Lea el motivo de la glosa.',
      'Reúna los soportes de la atención: historia clínica, autorizaciones y contrato.',
      'Pulse "Responder glosa" y escriba la justificación.',
      'Confirme y verifique que cambie el estado.',
    ],
    notas: [
      'Las glosas tienen plazos legales de respuesta; atiéndalas lo antes posible.',
    ],
  },
  {
    ruta: /^\/facturacion$/,
    titulo: 'Centro de facturación',
    proposito: 'Vea de un vistazo las cuentas que necesitan atención y entre a cualquier parte del módulo.',
    acciones: [
      'Ver los indicadores: cuentas abiertas, en auditoría, por facturar y con alertas.',
      'Consultar las cuentas que requieren atención.',
      'Buscar por paciente, orden, factura o pagador.',
      'Ir a cualquier sección desde la barra de navegación.',
    ],
    pasos: [
      'Revise los indicadores de la parte superior.',
      'Abra primero las cuentas con alertas.',
      'Use la barra de navegación para ir a la sección que necesita.',
    ],
    notas: [],
  },
  {
    ruta: /^\/facturacion\/cuentas$/,
    titulo: 'Cuentas hospitalarias',
    proposito: 'Consulte las cuentas de cada atención, que reúnen todo lo que se cobrará a un pagador por una orden de trabajo.',
    acciones: [
      'Buscar por paciente, orden, factura o pagador.',
      'Filtrar por estado: abierta, en auditoría, cerrada, facturada, reabierta o anulada.',
      'Ver el valor de cada cuenta.',
      'Abrir el detalle de una cuenta para gestionarla.',
    ],
    pasos: [
      'Escriba el dato a buscar y pulse Enter.',
      'Seleccione el estado si quiere acotar la lista.',
      'Pulse "Ver detalle" en la cuenta que va a gestionar.',
    ],
    notas: [],
  },
  {
    ruta: /^\/facturacion\/cargos$/,
    titulo: 'Libro de cargos',
    proposito: 'Consulte cada cobro individual generado por la atención: procedimientos, medicamentos, insumos y estancia.',
    acciones: [
      'Buscar cargos por paciente, orden o pagador.',
      'Filtrar por estado: borrador, validado, liquidado, facturado, rechazado o anulado.',
      'Ver el valor de cada cargo.',
    ],
    pasos: [
      'Busque el paciente o la orden.',
      'Filtre por estado para ver, por ejemplo, los rechazados.',
      'Para corregir un cargo, entre a la cuenta a la que pertenece.',
    ],
    notas: [
      'Los cargos se corrigen o anulan desde el detalle de la cuenta, no desde esta lista.',
    ],
  },
  {
    ruta: /^\/facturacion\/auditoria$/,
    titulo: 'Auditoría de cuentas',
    proposito: 'Encuentre las cuentas con inconsistencias para corregirlas antes de cerrarlas y facturarlas.',
    acciones: [
      'Ver las cuentas pendientes de auditoría, con hallazgos o validadas.',
      'Buscar por paciente, orden o pagador.',
      'Filtrar por estado de auditoría.',
    ],
    pasos: [
      'Filtre por "CON_HALLAZGOS".',
      'Revise cada cuenta y corrija lo encontrado desde su detalle.',
      'Confirme que la cuenta quede validada.',
    ],
    notas: [
      'Una cuenta con hallazgos sin resolver no debería cerrarse.',
    ],
  },
  {
    ruta: /^\/facturacion\/facturas$/,
    titulo: 'Facturas',
    proposito: 'Consulte las facturas emitidas y el punto en que va cada una, desde la emisión hasta el pago.',
    acciones: [
      'Buscar por paciente, número de factura u orden.',
      'Filtrar por estado: borrador, emitida, validada ante la DIAN, validada en RIPS, radicada, glosada o pagada.',
      'Ver el valor de cada factura.',
      'Abrir el detalle para transmitir, radicar, registrar glosas o pagos.',
    ],
    pasos: [
      'Busque la factura o filtre por estado.',
      'Pulse "Ver detalle".',
      'Continúe la gestión desde el detalle.',
    ],
    notas: [],
  },
  {
    ruta: /^\/facturacion\/transmisiones$/,
    titulo: 'Transmisiones FEV/RIPS',
    proposito: 'Consulte los envíos de factura electrónica (FEV) y de RIPS, y la respuesta de validación de cada uno.',
    acciones: [
      'Ver los envíos pendientes, validados y rechazados.',
      'Buscar por paciente, factura o pagador.',
      'Filtrar por estado.',
    ],
    pasos: [
      'Filtre por "RECHAZADA".',
      'Identifique la factura rechazada.',
      'Corrija el motivo y vuelva a transmitir desde el detalle de la factura.',
    ],
    notas: [
      'Una factura rechazada no puede radicarse hasta que sea validada.',
    ],
  },
  {
    ruta: /^\/facturacion\/radicaciones$/,
    titulo: 'Radicaciones',
    proposito: 'Controle las facturas entregadas formalmente al pagador: número de radicado, quién la recibió y en qué fecha.',
    acciones: [
      'Ver las facturas pendientes de radicar, radicadas y devueltas.',
      'Buscar por paciente, factura o pagador.',
      'Filtrar por estado.',
    ],
    pasos: [
      'Filtre por "PENDIENTE" para ver lo que falta radicar.',
      'Radique cada factura desde su detalle.',
      'Revise las devueltas y corrija el motivo.',
    ],
    notas: [
      'La fecha de radicación es la que cuenta para los plazos de pago y de glosas.',
    ],
  },
  {
    ruta: /^\/facturacion\/glosas$/,
    titulo: 'Glosas y devoluciones',
    proposito: 'Consulte las objeciones de los pagadores a las facturas y el estado de su respuesta.',
    acciones: [
      'Ver las glosas abiertas, respondidas, aceptadas y conciliadas.',
      'Buscar por paciente, factura o pagador.',
      'Filtrar por estado.',
      'Abrir el detalle de una glosa para responderla.',
    ],
    pasos: [
      'Filtre por "ABIERTA".',
      'Abra cada glosa con "Ver detalle".',
      'Responda con la justificación y los soportes.',
    ],
    notas: [
      'Atienda primero las glosas más antiguas; tienen plazos legales de respuesta.',
    ],
  },
  {
    ruta: /^\/facturacion\/cartera$/,
    titulo: 'Pagos y cartera',
    proposito: 'Consulte cuánto se ha recaudado y cuánto falta por cobrar de cada factura.',
    acciones: [
      'Ver los saldos pendientes, pagados parcialmente y pagados.',
      'Buscar por paciente, factura o pagador.',
      'Filtrar por estado de pago.',
    ],
    pasos: [
      'Filtre por "PENDIENTE" o "PAGADA_PARCIAL".',
      'Identifique las facturas con saldo.',
      'Registre los pagos recibidos desde el detalle de la factura.',
    ],
    notas: [],
  },
  {
    ruta: /^\/facturacion\/parametrizacion$/,
    titulo: 'Parametrización de facturación',
    proposito: 'Consulte las reglas y ajustes generales con los que trabaja el módulo de facturación.',
    acciones: [
      'Ver los parámetros activos e inactivos.',
      'Buscar un parámetro.',
      'Filtrar por estado.',
    ],
    pasos: [
      'Busque el parámetro que necesita revisar.',
      'Verifique si está activo.',
    ],
    notas: [
      'Los cambios de parametrización afectan todas las facturas nuevas; consulte con el administrador antes de modificarlos.',
    ],
  },
  {
    // Respaldo para cualquier ruta de facturación que aún no tenga manual propio.
    ruta: /^\/facturacion(\/.*)?$/,
    titulo: 'Facturación hospitalaria',
    proposito: 'Gestione cuentas, cargos, facturas, RIPS, radicaciones, glosas, pagos y cartera.',
    acciones: [
      'Consultar bandejas por estado.',
      'Auditar cuentas y cargos.',
      'Controlar transmisión y radicación.',
      'Gestionar glosas y pagos.',
    ],
    pasos: [
      'Seleccione la sección en la navegación superior.',
      'Aplique los filtros.',
      'Abra el registro que requiera gestión.',
    ],
    notas: [
      'Las operaciones de dinero quedan registradas para auditoría.',
    ],
  },
]
