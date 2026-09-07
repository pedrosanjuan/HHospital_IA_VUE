import { apiRequest, toQuery } from './api'

// El backend exige just_id incluso para la consulta completa de la tabla.
export const buscarUsuarios = (filters = {}, signal) =>
  apiRequest(`/v1/Users${toQuery({ just_id: 0, ...filters })}`, { signal })

export const consultarUsuario = id => apiRequest(`/v1/User/${encodeURIComponent(id)}`)
export const consultarPerfiles = () => apiRequest('/v1/System/perfiles')
export const consultarPerfilesUsuario = id => apiRequest(`/v1/User/${encodeURIComponent(id)}/getperfiles`)
export const actualizarPerfilesUsuario = (id, perfiles, remove) => apiRequest('/v1/User/Perfiles/updates', {
  method: 'POST', body: JSON.stringify({ id_user: Number(id), perfiles, remove }),
})
export const consultarRoles = () => apiRequest('/v1/System/roles')
export const consultarRolesUsuario = id => apiRequest(`/v1/User/${encodeURIComponent(id)}/getroles`)
export const actualizarRolesUsuario = (id, add, remove) => apiRequest(`/v1/User/${encodeURIComponent(id)}/roles`, {
  method: 'POST', body: JSON.stringify({ permisos_add: add, permisos_remove: remove }),
})
export const consultarPermisos = () => apiRequest('/v1/System/permisos')
export const consultarPermisosUsuario = id => apiRequest(`/v1/User/${encodeURIComponent(id)}/permisos`)
export const actualizarPermisosUsuario = (id, add, remove) => apiRequest(`/v1/User/${encodeURIComponent(id)}/permisos`, {
  method: 'POST', body: JSON.stringify({ permisos_add: add, permisos_remove: remove }),
})
export const actualizarParametrosUsuario = (id, planta, facturador) => apiRequest(`/v1/User/${encodeURIComponent(id)}/general_parameters/update`, {
  method: 'POST', body: JSON.stringify({ _planta: Number(planta), is_facturador: Number(facturador) }),
})
export const restablecerPasswordUsuario = id => apiRequest(`/v1/User/${encodeURIComponent(id)}/parametrizacion/password/reset`, { method: 'POST' })
export const consultarDepartamentosUsuarios = () => apiRequest('/v1/System/departamentos')
export const consultarMunicipiosUsuarios = id => apiRequest(`/v1/System/departamento/${encodeURIComponent(id)}/municipios`)
export const consultarBarriosUsuarios = () => apiRequest('/v1/System/barrios')
