import { apiRequest, toQuery } from './api'

const json = (method, body) => ({ method, body: JSON.stringify(body) })
const form = (method, body) => ({ method, body })

export const consultarCatalogosReferencia = () => apiRequest('/v1/catalogos/todos')
export const consultarEstadosPermitidos = estado => apiRequest(`/v1/catalogos/estados-permitidos/${encodeURIComponent(estado)}`)
export const listarReferencias = (filters = {}, signal) => apiRequest(`/v1/referencias${toQuery(filters)}`, { signal })
export const listarReferenciasPendientes = (filters = {}, signal) => apiRequest(`/v1/referencias/pendientes${toQuery(filters)}`, { signal })
export const consultarReferencia = id => apiRequest(`/v1/referencias/${encodeURIComponent(id)}`)
export const crearReferencia = payload => apiRequest('/v1/referencias', json('POST', payload))
export const actualizarReferencia = (id, payload) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}`, json('PUT', payload))
export const cambiarEstadoReferencia = (id, payload) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/estado`, json('PUT', payload))
export const cancelarReferencia = (id, motivo) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}`, json('DELETE', { motivo_cancelacion: motivo }))
export const consultarHistorialReferencia = id => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/historial`)
export const consultarEstadisticasReferencias = filters => apiRequest(`/v1/referencias/estadisticas${toQuery(filters)}`)

export async function listarEstablecimientos(filters = {}) {
  const response = await apiRequest(`/v1/establecimientos-salud${toQuery(filters)}`)
  // Los selectores esperan una colección simple; la pantalla administrativa
  // solicita page/per_page y conserva el paginador completo del backend.
  if (!('page' in filters) && !('per_page' in filters) && Array.isArray(response?.data?.data)) {
    return { ...response, data: response.data.data }
  }
  return response
}
export const consultarEstablecimiento = id => apiRequest(`/v1/establecimientos-salud/${encodeURIComponent(id)}`)
export const crearEstablecimiento = payload => apiRequest('/v1/establecimientos-salud', json('POST', payload))
export const actualizarEstablecimiento = (id, payload) => apiRequest(`/v1/establecimientos-salud/${encodeURIComponent(id)}`, json('PUT', payload))
export const cambiarEstadoEstablecimiento = id => apiRequest(`/v1/establecimientos-salud/${encodeURIComponent(id)}/toggle-activo`, { method: 'PATCH' })
export const consultarEstadisticasEstablecimiento = id => apiRequest(`/v1/establecimientos-salud/${encodeURIComponent(id)}/estadisticas`)
export const consultarContactoEstablecimiento = id => apiRequest(`/v1/establecimientos-salud/${encodeURIComponent(id)}/contacto`)
export const listarNivelesAtencion = () => apiRequest('/v1/catalogos/niveles-atencion')
export const listarTiposEstablecimiento = () => apiRequest('/v1/catalogos/tipos-establecimiento')
export const listarPagadores = () => apiRequest('/v1/TerceroContratante')
export const listarMedicosReceptores = () => apiRequest('/v1/Users?just_id=1&active=1')
export const listarDiagnosticos = () => apiRequest('/v1/System/diagnosticos/cie10')
export const listarManualesPagador = id => apiRequest(`/v1/TerceroContratante/${encodeURIComponent(id)}/ManualesTarifarios`)
export const listarPaquetesManual = id => apiRequest(`/v1/TerceroContratante/${encodeURIComponent(id)}/paquetesActivos`)

export const listarPaquetesReferencia = id => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/paquetes-solicitados`)
export const agregarPaqueteReferencia = (id, payload) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/agregar-paquete`, json('POST', payload))
export const retirarPaqueteReferencia = (id, packageId) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/paquetes/${encodeURIComponent(packageId)}`, { method: 'DELETE' })
export const listarDocumentosReferencia = id => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/documentos`)
export const adjuntarDocumentoReferencia = (id, data) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/documentos`, form('POST', data))
export const eliminarDocumentoReferencia = (id, documentId) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/documentos/${encodeURIComponent(documentId)}`, { method: 'DELETE' })

export const listarAutorizacionesReferencia = id => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/autorizaciones`)
export const listarAutorizacionesPendientes = (filters = {}) => apiRequest(`/v1/referencias/autorizaciones/pendientes${toQuery(filters)}`)
export const aprobarAutorizacion = (referenceId, authorizationId, payload = {}) => apiRequest(`/v1/referencias/${encodeURIComponent(referenceId)}/autorizaciones/${encodeURIComponent(authorizationId)}/aprobar`, json('PUT', payload))
export const rechazarAutorizacion = (referenceId, authorizationId, payload) => apiRequest(`/v1/referencias/${encodeURIComponent(referenceId)}/autorizaciones/${encodeURIComponent(authorizationId)}/rechazar`, json('PUT', payload))

export const consultarContrareferencia = id => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/contrareferencia`)
export const crearContrareferencia = (id, payload) => apiRequest(`/v1/referencias/${encodeURIComponent(id)}/contrareferencia`, json('POST', payload))
export const actualizarContrareferencia = (id, payload) => apiRequest(`/v1/contrareferencias/${encodeURIComponent(id)}`, json('PUT', payload))
export const listarContrareferencias = filters => apiRequest(`/v1/contrareferencias${toQuery(filters)}`)
export const listarSeguimientoUrgente = () => apiRequest('/v1/contrareferencias/seguimiento-urgente')
export const listarDocumentosContrareferencia = id => apiRequest(`/v1/contrareferencias/${encodeURIComponent(id)}/documentos`)
export const adjuntarDocumentoContrareferencia = (id, data) => apiRequest(`/v1/contrareferencias/${encodeURIComponent(id)}/documentos`, form('POST', data))
export const eliminarDocumentoContrareferencia = (id, documentId) => apiRequest(`/v1/contrareferencias/${encodeURIComponent(id)}/documentos/${encodeURIComponent(documentId)}`, { method: 'DELETE' })
