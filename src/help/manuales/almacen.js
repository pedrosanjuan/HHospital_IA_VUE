// Manuales de usuario final del módulo. Ver src/help/manuales/index.js para el formato.
// Cada sección de AlmacenModulo.vue tiene su propia ruta y, por lo tanto, su propio manual.
export default [
  {
    ruta: /^\/almacen-parametrizacion$/,
    titulo: 'Parametrización de almacenes',
    proposito: 'Cree y consulte los almacenes de la institución: los lugares físicos o de paso donde se guardan medicamentos e insumos.',
    acciones: [
      'Ver la lista de almacenes configurados.',
      'Crear un almacén nuevo con el botón de la parte superior.',
      'Marcar un almacén como transitorio (lugar de paso, no de almacenamiento permanente).',
      'Abrir el detalle de un almacén.',
    ],
    pasos: [
      'Revise la lista para confirmar que el almacén no exista.',
      'Pulse el botón para crear un almacén.',
      'Escriba el nombre y el número de la ubicación o departamento al que pertenece.',
      'Active "transitorio" solo si el almacén es un punto de paso.',
      'Guarde y verifique que aparezca en la lista.',
    ],
    notas: [
      'Los almacenes creados aquí aparecen en las demás secciones del módulo para consultar inventario, traslados y cierres.',
    ],
  },
  {
    ruta: /^\/solicitudes-almacen$/,
    titulo: 'Solicitudes de almacén',
    proposito: 'Consulte los pedidos de medicamentos e insumos que llegan al almacén desde los servicios clínicos.',
    acciones: [
      'Ver todas las solicitudes con paciente, orden, paquete, quién solicitó y estado.',
      'Filtrar la lista escribiendo cualquier dato en el buscador.',
      'Identificar las solicitudes pendientes o con alerta.',
      'Abrir el detalle de una solicitud.',
    ],
    pasos: [
      'Revise primero las solicitudes pendientes o marcadas con alerta.',
      'Use el buscador para ubicar un paciente o una orden.',
      'Abra el detalle para ver el contexto de la solicitud.',
      'Pulse actualizar para ver las solicitudes nuevas.',
    ],
    notas: [
      'La lista no se actualiza sola; use el botón de actualizar durante el turno.',
    ],
  },
  {
    ruta: /^\/inventario-almacen$/,
    titulo: 'Inventario disponible',
    proposito: 'Consulte qué hay en cada almacén: productos, lotes, fechas de vencimiento, existencias y costos.',
    acciones: [
      'Seleccionar el almacén a consultar.',
      'Ver producto comercial, genérico, lote, vencimiento, existencia y costo.',
      'Filtrar los resultados por cualquier dato.',
      'Ver cuántos elementos hay disponibles y cuántos tienen alerta, como un vencimiento.',
      'Abrir el detalle de un producto.',
    ],
    pasos: [
      'Seleccione el almacén.',
      'Pulse consultar.',
      'Revise las alertas de vencimiento.',
      'Use el filtro para ubicar un producto o lote.',
    ],
    notas: [
      'Los productos vencidos se cuentan como alerta; retírelos con el proceso de baja.',
    ],
  },
  {
    ruta: /^\/traslados-almacen$/,
    titulo: 'Traslados entre almacenes',
    proposito: 'Consulte lo que hay disponible en un almacén de origen para preparar su traslado a otro almacén.',
    acciones: [
      'Seleccionar el almacén de origen y el de destino.',
      'Ver los productos disponibles en el origen, con lote y cantidad.',
      'Filtrar los productos.',
      'Abrir el detalle de un producto.',
    ],
    pasos: [
      'Seleccione el almacén de origen.',
      'Seleccione el almacén de destino; el origen no aparece en esta lista.',
      'Pulse consultar y revise las cantidades disponibles.',
      'Confirme producto, lote y cantidad antes de mover físicamente la mercancía.',
    ],
    notas: [
      'Esta pantalla muestra la disponibilidad para el traslado; verifique con su coordinador el procedimiento de registro del movimiento.',
    ],
  },
  {
    ruta: /^\/baja-inventario-almacen$/,
    titulo: 'Baja de inventario',
    proposito: 'Identifique los productos que deben retirarse del inventario, por ejemplo por vencimiento o daño.',
    acciones: [
      'Seleccionar el almacén.',
      'Ver los productos candidatos a baja con lote, vencimiento y cantidad.',
      'Filtrar los productos.',
      'Abrir el detalle de un producto.',
    ],
    pasos: [
      'Seleccione el almacén.',
      'Pulse consultar.',
      'Revise primero los productos vencidos o próximos a vencer.',
      'Confirme lote y cantidad antes de gestionar la baja.',
    ],
    notas: [
      'Una baja retira existencias de forma definitiva; revise bien lote y cantidad.',
    ],
  },
  {
    ruta: /^\/devoluciones-almacen$/,
    titulo: 'Devoluciones',
    proposito: 'Consulte lo que el almacén despachó para una orden de trabajo y revise qué puede devolverse.',
    acciones: [
      'Buscar por número de orden de trabajo.',
      'Ver cada despacho con fecha, almacén, responsable y estado.',
      'Filtrar los despachos.',
      'Abrir el detalle de un despacho.',
    ],
    pasos: [
      'Escriba el número de la orden de trabajo.',
      'Pulse Enter o el botón consultar.',
      'Revise los despachos de esa orden.',
      'Abra el detalle del despacho que se va a devolver.',
    ],
    notas: [
      'Si no conoce el número de la orden, búsquelo en el detalle del paciente o de la admisión.',
    ],
  },
  {
    ruta: /^\/consumo-interno-almacen$/,
    titulo: 'Consumo interno',
    proposito: 'Consulte lo que hay en el almacén para registrar lo que usa la propia institución, sin asignarlo a un paciente.',
    acciones: [
      'Seleccionar el almacén de origen.',
      'Ver productos disponibles con lote, cantidad y costo.',
      'Filtrar los productos.',
      'Abrir el detalle de un producto.',
    ],
    pasos: [
      'Seleccione el almacén.',
      'Pulse consultar.',
      'Ubique el producto que se va a consumir.',
      'Confirme lote y cantidad disponible.',
    ],
    notas: [
      'El consumo interno es para uso institucional, por ejemplo aseo o áreas administrativas; lo que se usa en un paciente se solicita por su orden.',
    ],
  },
  {
    ruta: /^\/entregas-locales-almacen$/,
    titulo: 'Entregas locales',
    proposito: 'Haga seguimiento a los pedidos preparados por el almacén que deben entregarse en los servicios.',
    acciones: [
      'Ver las entregas con paciente, orden, fecha, responsable y estado.',
      'Distinguir las entregas pendientes de las realizadas.',
      'Filtrar la lista.',
      'Abrir el detalle de una entrega.',
    ],
    pasos: [
      'Revise las entregas pendientes.',
      'Abra el detalle para confirmar qué se entrega y a quién.',
      'Pulse actualizar para ver los cambios de estado.',
    ],
    notas: [],
  },
  {
    ruta: /^\/almacen-compras$/,
    titulo: 'Compras y abastecimiento',
    proposito: 'Consulte las órdenes de compra hechas a los proveedores y su estado.',
    acciones: [
      'Ver las órdenes de compra con proveedor, fecha, total, responsable y estado.',
      'Filtrar por proveedor, número u otro dato.',
      'Abrir el detalle de una orden de compra.',
    ],
    pasos: [
      'Use el filtro para ubicar la orden o el proveedor.',
      'Revise el estado de la orden.',
      'Abra el detalle para confirmar valores y productos.',
    ],
    notas: [],
  },
  {
    ruta: /^\/almacen-cierre$/,
    titulo: 'Cierre de inventario',
    proposito: 'Revise cómo estaba y cómo se movió el inventario de un almacén en un período, como apoyo al cierre.',
    acciones: [
      'Seleccionar el almacén y el rango de fechas.',
      'Ver producto, lote, existencia, fecha y tipo de movimiento.',
      'Filtrar los movimientos.',
      'Abrir el detalle de un movimiento.',
    ],
    pasos: [
      'Seleccione el almacén.',
      'Indique la fecha inicial y la fecha final.',
      'Pulse consultar.',
      'Compare las existencias con el conteo físico.',
    ],
    notas: [
      'Por defecto se consulta el día de hoy; cambie las fechas para ver otro período.',
    ],
  },
]
