import { apiRequest, toQuery } from './api'

const post = (path, body = {}) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) })

export const listarConsultorios = () => apiRequest('/v1/Intramural/Consultorios')
export const consultarAgendaConsultorio = (id, filters) =>
  apiRequest(`/v1/Intramural/Consultorio/${encodeURIComponent(id)}/agenda${toQuery(filters)}`)
export const listarHorariosConsultorio = id =>
  apiRequest(`/v1/Intramural/Consultorio/${encodeURIComponent(id)}/horarios`)
export const listarEspecialidades = () => apiRequest('/v1/Especialidades')
export const listarProfesionalesEspecialidad = id =>
  apiRequest(`/v1/Especialidad/${encodeURIComponent(id)}/users`)
export const consultarActividadesPaciente = (specialtyId, professionalId, patientId) =>
  apiRequest(`/v1/Intramural/CitaMedica/${encodeURIComponent(specialtyId)}/${encodeURIComponent(professionalId)}/${encodeURIComponent(patientId)}/findOrdendeServicio`)

export const agendarCita = payload => post('/v1/Intramural/Consultorio/cita/store', payload)
export const consultarCita = id => apiRequest(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}`)
export const consultarTrazabilidadCita = id => apiRequest(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}/getHistory`)
export const reagendarCita = (id, payload) => post(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}/reagendar`, payload)
export const cambiarEstadoCita = payload => post('/v1/Intramural/CitaMedica/callCitaMedica', payload)
export const cancelarCita = payload => post('/v1/Intramural/CitaMedica/anular', payload)
export const marcarNoAtendida = id => post(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}/update/NoAsiste`)
export const llamarPaciente = id => post('/v1/System/turnos/CallPatient', { id_cita: Number(id) })
export const registrarHoraLlegada = (id, hora) => post(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}/update/Horallegada`, { hora })
export const cerrarAdministrativamente = id => post(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}/cierreAdministrativo`)

// Disponibilidad y parametrización profesional
export const consultarProfesionalesDisponibles = (specialtyId, filters) =>
  apiRequest(`/v1/Intramural/${encodeURIComponent(specialtyId)}/profesionales/disponibles${toQuery(filters)}`)
export const consultarConsultoriosDisponibles = date =>
  apiRequest(`/v1/Intramural/Consultorios/DisponiblesXfecha${toQuery({ fecha: date })}`)
export const consultarResumenConsultorios = month =>
  apiRequest(`/v1/Intramural/Consultorios/Resumen${toQuery({ mes: month })}`)
export const consultarHorariosProfesional = id => apiRequest(`/v1/User/${encodeURIComponent(id)}/horarios`)
export const guardarHorariosProfesional = (id, blocks) => post(`/v1/User/${encodeURIComponent(id)}/horarios/store`, { horarios: blocks })
export const actualizarHorarioProfesional = (userId, scheduleId, payload) =>
  apiRequest(`/v1/User/${encodeURIComponent(userId)}/horarios/${encodeURIComponent(scheduleId)}`, {
    method: 'PUT', body: JSON.stringify(payload),
  })
export const eliminarHorarioProfesional = (userId, scheduleId) =>
  apiRequest(`/v1/User/${encodeURIComponent(userId)}/horarios/${encodeURIComponent(scheduleId)}`, { method: 'DELETE' })
export const consultarAgendaProfesional = (id, filters) =>
  apiRequest(`/v1/User/${encodeURIComponent(id)}/agendaIntramural/Consultar${toQuery(filters)}`)
export const bloquearEspacioProfesional = payload => post('/v1/Intramural/Profesional/citas/inhabilitarEspacio', payload)

// Bandejas administrativas y agenda clínica autenticada
export const listarSolicitudesCitas = () => apiRequest('/v1/Intramural/CitasMedicas/Solicitudes')
export const asignarSolicitudCita = (id, payload) => post(`/v1/Intramural/Consultorio/cita/${encodeURIComponent(id)}/asignarCita`, payload)
export const listarCitasNoAtendidas = () => apiRequest('/v1/Intramural/CitasMedicas/noAtendidas')
export const listarCitasPaciente = id => apiRequest(`/v1/Intramural/citas/paciente${toQuery({ id_paciente: id })}`)
export const consultarAgendaClinica = filters => apiRequest(`/v1/Hospitalizacion/AgendaProfesional${toQuery(filters)}`)
export const completarActividadClinica = (id, payload) =>
  post(`/v1/Hospitalizacion/AgendaProfesional/actividades/${encodeURIComponent(id)}/completar`, payload)

// Documento y personal de apoyo. Se envían ambos nombres mientras el backend unifica el contrato.
export const adjuntarDocumentoCita = (id, file) => post(`/v1/Intramural/${encodeURIComponent(id)}/uploadDocumentoCita`, { file })
export const actualizarPersonalApoyo = (id, supportId) => post(`/v1/Intramural/CitaMedica/${encodeURIComponent(id)}/editar/PersonalApoyo`, {
  id_personal_apoyo: Number(supportId),
  id_profesional_apoyo: Number(supportId),
})
export const removerPersonalApoyo = (id, observation) =>
  post(`/v1/Intramural/${encodeURIComponent(id)}/personalapoyo/remover`, { observacion: observation })
