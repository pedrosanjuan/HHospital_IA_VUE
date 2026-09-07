import { apiRequest, toQuery } from './api'

const post = (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) })

// Catálogos y parametrización
export const listarAlmacenes = () => apiRequest('/v1/Almacen/almacen_ubicaciones')
export const consultarAlmacen = id => apiRequest(`/v1/Almacen/${encodeURIComponent(id)}/show`)
export const crearAlmacen = payload => post('/v1/Almacen', payload)
export const listarInsumosGenericos = () => apiRequest('/v1/Almacen/insumo/generico')
export const listarMedicamentosGenericos = () => apiRequest('/v1/Almacen/medicamento/generico')

// Operación diaria
export const consultarInventario = filters => apiRequest(`/v1/Almacen/inventario${toQuery(filters)}`)
export const consultarSolicitudes = filters => apiRequest(`/v1/Almacen/solicitudes${toQuery(filters)}`)
export const consultarSolicitud = id => apiRequest(`/v1/Almacen/solicitud/${encodeURIComponent(id)}`)
export const consultarItemsParaBaja = id => apiRequest(`/v1/Almacen/${encodeURIComponent(id)}/ItemsParaBaja`)
export const consultarDevolucionesOrden = id => apiRequest(`/v1/Almacen/devoluciones/buscar/devolucionesXorden/${encodeURIComponent(id)}`)
export const consultarEntregasLocales = () => apiRequest('/v1/Almacen/DespachoEntregas')
export const trasladarInventario = payload => post('/v1/Almacen/trasladarInventario', payload)
export const registrarBaja = payload => post('/v1/Almacen/bajaInventario', payload)
export const registrarDevolucion = payload => post('/v1/Almacen/devolucion', payload)
export const registrarConsumoInterno = payload => post('/v1/Almacen/consumoInterno', payload)

// Historiales y cierre
export const consultarHistorialTraslados = filters => apiRequest(`/v1/Almacen/traslados/Historial${toQuery(filters)}`)
export const consultarHistorialDespachos = filters => apiRequest(`/v1/Almacen/despachos/Historial${toQuery(filters)}`)
export const consultarHistorialDevoluciones = filters => apiRequest(`/v1/Almacen/devoluciones/Historial${toQuery(filters)}`)
export const consultarHistoricoInventario = filters => apiRequest(`/v1/Almacen/screenshot/day${toQuery(filters)}`)

// Compras y abastecimiento
export const consultarOrdenesCompra = () => apiRequest('/v1/Almacen/Compras/Ordenesdecompra')
export const consultarSolicitudesCompra = () => apiRequest('/v1/Almacen/Compras/Solicitudesdecompra')
