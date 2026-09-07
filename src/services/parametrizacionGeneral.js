import { apiRequest } from './api'

const post = (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) })

export const listarPerfilesSistema = () => apiRequest('/v1/System/perfiles')
export const crearPerfilSistema = name => post('/v1/System/perfil', { name })
export const listarDocumentosPerfil = id => apiRequest(`/v1/System/perfil/${encodeURIComponent(id)}/gettipo_documentos`)
export const actualizarDocumentosPerfil = (id, documentos, remove) => post('/v1/System/perfil/update_tipo_documento', { id_perfil: Number(id), documentos: documentos.map(Number), remove })
export const listarUsuariosPerfil = id => apiRequest(`/v1/System/UsersxPerfil?id_perfil=${encodeURIComponent(id)}`)

export const listarRolesSistema = () => apiRequest('/v1/System/roles')
export const crearRolSistema = name => post('/v1/System/rol', { name })
export const listarPermisosSistema = () => apiRequest('/v1/System/permisos')
export const crearPermisoSistema = name => post('/v1/System/permiso', { name })
export const listarPermisosRol = id => apiRequest(`/v1/System/rol/${encodeURIComponent(id)}/permisos`)
export const actualizarPermisosRol = (id, permisos, remove) => post('/v1/System/rol/permiso/update', { roleId: Number(id), permisos, remove })
export const listarUsuariosPermiso = id => apiRequest(`/v1/System/permisos/${encodeURIComponent(id)}/users`)
export const listarRolesPermiso = id => apiRequest(`/v1/System/permisos/${encodeURIComponent(id)}/roles`)
export const listarMenusSistema = () => apiRequest('/v1/System/menus')
export const listarMenusRol = id => apiRequest(`/v1/System/rol/${encodeURIComponent(id)}/menus`)
export const actualizarMenusRol = (id, menus, remove) => post('/v1/System/rol/menu/update', { roleId: Number(id), menus: menus.map(Number), remove })

export const listarCategoriasServicios = () => apiRequest('/v1/CategoriasServicios')
export const listarServiciosSistema = () => apiRequest('/v1/Servicios')
export const listarServiciosCategoria = id => apiRequest(`/v1/Servicios/Categoria/${encodeURIComponent(id)}`)
export const consultarServicioSistema = id => apiRequest(`/v1/Servicio/${encodeURIComponent(id)}`)
export const crearServicioSistema = payload => post('/v1/Servicio', payload)
export const actualizarServicioSistema = (id, payload) => post(`/v1/Servicio/${encodeURIComponent(id)}/update`, payload)
export const listarRegistrosMaestros = () => apiRequest('/v1/System/master/registros')
export const listarRegistrosServicio = id => apiRequest(`/v1/Servicio/${encodeURIComponent(id)}/registrosclinicos`)
export const agregarRegistroServicio = (id, registerId) => post(`/v1/Servicio/${encodeURIComponent(id)}/registrosclinicos/addRegister`, { id_registro: Number(registerId) })
export const retirarRegistroServicio = (id, associationId) => post(`/v1/Servicio/${encodeURIComponent(id)}/registrosclinicos/removeRegister`, { id: Number(associationId) })
export const listarValidacionesRegistros = id => apiRequest(`/v1/Servicio/${encodeURIComponent(id)}/validaciones/registrosclinicos`)
export const agregarValidacionRegistro = (id, payload) => post(`/v1/Servicio/${encodeURIComponent(id)}/registrosclinicos/service_Registros_addvalidation`, payload)
export const retirarValidacionRegistro = (id, type, masterId) => {
  const routes = { at_leastOne: 'service_Registros_validations_remove_atleastone', all_One: 'service_Registros_validations_remove_allOne', frecuencias: 'service_Registros_validations_remove_frecuencia' }
  return post(`/v1/Servicio/${encodeURIComponent(id)}/registrosclinicos/${routes[type]}`, { id_master: Number(masterId) })
}

export const listarEspecialidadesSistema = () => apiRequest('/v1/Especialidades')
export const crearEspecialidadSistema = especialidad => post('/v1/Especialidad', { especialidades: [especialidad] })
export const listarProfesionalesEspecialidad = id => apiRequest(`/v1/Especialidad/${encodeURIComponent(id)}/users`)

export const listarTiposDocumentoTalento = () => apiRequest('/v1/TalentoHumano/getTiposDocumentos')
export const crearTipoDocumentoTalento = payload => post('/v1/TalentoHumano/documento', payload)

export const listarConsultoriosSistema = () => apiRequest('/v1/Intramural/Consultorios')
export const crearConsultorioSistema = nombre => post('/v1/Intramural/Consultorio/store', { nombre })
export const listarHorariosConsultorio = id => apiRequest(`/v1/Intramural/Consultorio/${encodeURIComponent(id)}/horarios`)
export const crearHorarioConsultorio = (id, blocks) => post(`/v1/Intramural/Consultorio/${encodeURIComponent(id)}/horario/store`, blocks)

export const consultarCatalogoSistema = path => apiRequest(`/v1/System/${path}`)

export const CATALOGOS_GENERALES = [
  { id: 'paises', label: 'Países' }, { id: 'tipodocumentos', label: 'Tipos de identificación' },
  { id: 'departamentos', label: 'Departamentos' }, { id: 'municipios', label: 'Municipios' },
  { id: 'barrios', label: 'Barrios' }, { id: 'generos', label: 'Géneros' },
  { id: 'tipo_usuario', label: 'Tipos de usuario' }, { id: 'tipo_pariente', label: 'Parentescos' },
  { id: 'language', label: 'Idiomas' }, { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'etnias', label: 'Etnias' }, { id: 'estadosciviles', label: 'Estados civiles' },
  { id: 'dondeconocen', label: 'Cómo nos conocen' }, { id: 'redes_sociales', label: 'Redes sociales' },
  { id: 'estadosCliente', label: 'Estados de cliente' }, { id: 'filesTypes', label: 'Tipos de archivo' },
  { id: 'getSystemFileTypes', label: 'Archivos del sistema' }, { id: 'diagnosticos/cie10', label: 'Diagnósticos CIE-10' },
  { id: 'tipo_paciente_aseguramiento', label: 'Aseguramiento' }, { id: 'tipo_paciente_rango', label: 'Rangos de paciente' },
  { id: 'general_medicamentos_via', label: 'Vías de administración' }, { id: 'general_medicamentos_frecuencia', label: 'Frecuencias de medicamentos' },
  { id: 'general_medicamentos_atc', label: 'Clasificación ATC' }, { id: 'general_medicamentos_forma_farmaceutica', label: 'Formas farmacéuticas' },
  { id: 'general_medicamentos_concentracion', label: 'Concentraciones' },
]
