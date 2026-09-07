import { apiRequest, toQuery } from './api'

export const login = (credentials) =>
  apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })

export const buscarPaciente = (dni) =>
  apiRequest(`/v1/Paciente/buscar/porcedula/${encodeURIComponent(dni)}`)

export const crearPaciente = (patient) =>
  apiRequest('/v1/Paciente', { method: 'POST', body: JSON.stringify(patient) })

export const crearOrden = (order) =>
  apiRequest('/v1/OrdendeTrabajo', { method: 'POST', body: JSON.stringify(order) })

export async function consultarCamas(filters) {
  const response = await apiRequest(
    `/v1/Hospitalizacion/CamasHospitalDisponibles${toQuery({ ...filters, detalle: 'completo' })}`,
  )
  return response.camas_disponibles || []
}

export const ingresarPaciente = (admission) =>
  apiRequest('/v1/hospitalizaciones/ingresar', {
    method: 'POST',
    body: JSON.stringify(admission),
  })

export const consultarCenso = (filters = {}) =>
  apiRequest(`/v1/censo-hospitalario/pacientes${toQuery(filters)}`)

export const consultarDetalle = (hospitalizationId) =>
  apiRequest(`/v1/hospitalizaciones/${hospitalizationId}/detalle`)

/** Catálogos requeridos por el formulario completo de pacientes. */
export const consultarCatalogo = (path) => apiRequest(`/v1/${path}`)

// El backend identifica al usuario mediante el Bearer token y devuelve sus
// menús con los submenús ya filtrados por permiso.
export const consultarMenuUsuario = () => apiRequest('/v1/User/Menus/list')

export const consultarEstacionesConReservas = () =>
  apiRequest('/v1/Hospitalizacion/EstacionEnfermeriawithReserva')

export const consultarEstacion = (stationId) =>
  apiRequest(`/v1/Hospitalizacion/EstacionEnfermeria/${encodeURIComponent(stationId)}/pacientes`)

export const buscarPacientes = (filters, signal) =>
  apiRequest(`/v1/Pacientes${toQuery(filters)}`, { signal })

export const buscarPacienteExacto = (dni, signal) =>
  apiRequest(`/v1/Paciente/buscar/porcedula/${encodeURIComponent(dni)}`, { signal })

export const consultarPaciente = (patientId) =>
  apiRequest(`/v1/Paciente/${encodeURIComponent(patientId)}`)

/** Catálogos específicos para crear una admisión sobre un paciente existente. */
export const consultarTiposIngresoAtencion = () =>
  apiRequest('/v1/System/rips/tipoIngresoAtencion')

export const consultarContratosPaciente = patientId =>
  apiRequest(`/v1/Paciente/${encodeURIComponent(patientId)}/contratos`)

export const consultarContratosDisponibles = () =>
  apiRequest('/v1/TercerosContratantes/contratos')

export const agregarContratoPaciente = (patientId, contractId) =>
  apiRequest(`/v1/Paciente/${encodeURIComponent(patientId)}/addContrato`, {
    method: 'POST',
    body: JSON.stringify({ id_contrato: Number(contractId) }),
  })

export const cambiarEstadoContratoPaciente = (patientId, relationId, status) =>
  apiRequest(`/v1/Paciente/${encodeURIComponent(patientId)}/contrato/update`, {
    method: 'POST',
    body: JSON.stringify({ id: Number(relationId), status: Boolean(status) }),
  })

export const consultarManualesContrato = contractId =>
  apiRequest(`/v1/TerceroContratante/contrato/${encodeURIComponent(contractId)}/Manuales`)

export const consultarPaquetesActivosManual = manualId =>
  apiRequest(`/v1/TerceroContratante/${encodeURIComponent(manualId)}/paquetesActivos`)

export const consultarOrdenTrabajo = (orderId) =>
  apiRequest(`/v1/OrdendeTrabajo/${encodeURIComponent(orderId)}`)

/** Agrega manualmente un servicio a una orden de trabajo existente. */
export const agregarServicioOrden = (orderId, serviceId, quantity) =>
  apiRequest(`/v1/OrdendeTrabajo/${encodeURIComponent(orderId)}/addServicio`, {
    method: 'POST',
    body: JSON.stringify({
      id_servicio: Number(serviceId),
      cantidad: Number(quantity),
    }),
  })

/** Servicios habilitados contractualmente para el paquete de la admisión. */
export const consultarServiciosPaquete = packageId =>
  apiRequest(`/v1/TerceroContratante/Paquete/${encodeURIComponent(packageId)}/servicios`)

// CRUD de parametrización física. Se mantiene aquí la traducción entre el
// nombre usado por la interfaz y la ruta PascalCase publicada por el backend.
const PHYSICAL_ROUTES = {
  sucursales: 'SucursalHospital', torres: 'TorreHospital', pisos: 'PisoHospital',
  estaciones: 'EstacionEnfermeria', salas: 'SalaHospital',
  habitaciones: 'HabitacionHospital', camas: 'CamaHospital',
  tiposPiso: 'TipoEstadoPiso', tiposSala: 'TipoSala',
  tiposHabitacion: 'TipoHabitacion', estadosUso: 'EstadoUsoHospital',
}

export const listarUbicaciones = (resource, filters = {}) =>
  apiRequest(`/v1/Hospitalizacion/${PHYSICAL_ROUTES[resource]}${toQuery(filters)}`)

export const guardarUbicacion = (resource, data, id = null) =>
  apiRequest(`/v1/Hospitalizacion/${PHYSICAL_ROUTES[resource]}${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(data),
  })

export const eliminarUbicacion = (resource, id) =>
  apiRequest(`/v1/Hospitalizacion/${PHYSICAL_ROUTES[resource]}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })

export const listarPaises = () => apiRequest('/v1/System/paises')
export const listarDepartamentos = id => apiRequest(`/v1/System/pais/${encodeURIComponent(id)}/departamentos`)
export const listarMunicipios = id => apiRequest(`/v1/System/departamento/${encodeURIComponent(id)}/municipios`)

// Flujo de reservas de cama: admisión crea y hace seguimiento; enfermería
// responde y, cuando el paciente llega, consume la reserva al asignar la cama.
export const consultarTiposReserva = () => apiRequest('/v1/Hospitalizacion/Cama/reserva/tipos')
export const consultarEstadosReserva = () => apiRequest('/v1/Hospitalizacion/ReservasCama/estados')
export const consultarOrdenesPaciente = patientId => apiRequest(`/v1/Paciente/${encodeURIComponent(patientId)}/ordenesdetrabajo`)
export const crearReservaCama = payload => apiRequest('/v1/Hospitalizacion/ReservaCama', { method: 'POST', body: JSON.stringify(payload) })
export const consultarReservas = (filters = {}) => apiRequest(`/v1/Hospitalizacion/ReservaCama${toQuery(filters)}`)
export const consultarReservasEstacion = stationId => apiRequest(`/v1/Hospitalizacion/ReservasCama/byEstacion/${encodeURIComponent(stationId)}`)
/**
 * Acepta o rechaza una reserva. Al aceptar, el backend realiza de forma
 * atómica el ingreso hospitalario y la ocupación de la cama.
 * `id_orden_de_servicio` solo se envía cuando existen varias estancias.
 */
export const responderReserva = (reservationId, estado, observacion = '', serviceOrderId = null) =>
  apiRequest(`/v1/Hospitalizacion/ReservaCama/${encodeURIComponent(reservationId)}/responder`, {
    method: 'POST',
    body: JSON.stringify({
      estado: Number(estado),
      observacion: observacion.trim(),
      ...(serviceOrderId ? { id_orden_de_servicio: Number(serviceOrderId) } : {}),
    }),
  })

export const solicitarTraslado = payload => apiRequest('/v1/tranfer-requests', { method: 'POST', body: JSON.stringify(payload) })
export const egresarHospitalizacion = (hospitalizationId, observaciones) => apiRequest(`/v1/hospitalizaciones/${encodeURIComponent(hospitalizationId)}/egresar`, { method: 'POST', body: JSON.stringify({ observaciones: observaciones.trim() }) })

export const consultarFormulariosEvolucion = (patientId, serviceOrderId) => apiRequest(`/v1/RegistroClinico/getRegistersForEvolution${toQuery({ id_paciente: patientId, id_orden_servicio: serviceOrderId })}`)
export const consultarTiposEvolucionRegistrados = serviceOrderId => apiRequest(`/v1/RegistroClinico/${encodeURIComponent(serviceOrderId)}/getRegisters`)
export const consultarEvolucionesAnteriores = (serviceOrderId, masterId) => apiRequest(`/v1/RegistroClinico/${encodeURIComponent(serviceOrderId)}/getRegisters/${encodeURIComponent(masterId)}`)
export const guardarEvolucionClinica = (endpoint, payload) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) })

export const consultarPlanMedicamentosActivo = (patientId, workOrderId) => apiRequest(`/v1/Hospitalizacion/Paciente/${encodeURIComponent(patientId)}/PlanMedicamentos/activo${toQuery({ id_orden_trabajo: workOrderId })}`)
export const consultarPlanProcedimientosActivo = (patientId, workOrderId) => apiRequest(`/v1/Hospitalizacion/Paciente/${encodeURIComponent(patientId)}/PlanProcedimientos/activo${toQuery({ id_orden_trabajo: workOrderId })}`)
export const consultarMedicamentosGenericos = () => apiRequest('/v1/Almacen/medicamento/generico')
export const consultarViasMedicamento = () => apiRequest('/v1/System/general_medicamentos_via')
export const consultarFrecuenciasMedicamento = () => apiRequest('/v1/System/general_medicamentos_frecuencia')
export const consultarServicios = () => apiRequest('/v1/Servicios')
export const crearPlanMedicamentos = payload => apiRequest('/v1/Hospitalizacion/PlanMedicamentos/crear', { method: 'POST', body: JSON.stringify(payload) })
export const crearPlanProcedimientos = payload => apiRequest('/v1/Hospitalizacion/PlanProcedimientos/crear', { method: 'POST', body: JSON.stringify(payload) })
export const consultarUltimosSignosVitales = patientId => apiRequest(`/v1/Hospitalizacion/SignosVitales/${encodeURIComponent(patientId)}/ultimos`)
export const registrarAdministracionMedicamento = (itemId, payload) => apiRequest(`/v1/Hospitalizacion/PlanMedicamentos/item/${encodeURIComponent(itemId)}/administrar`, { method: 'POST', body: JSON.stringify(payload) })
