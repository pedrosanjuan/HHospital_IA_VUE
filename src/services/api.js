// Quita la barra final para que cada endpoint pueda comenzar con `/` sin generar `//`.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')

/** Convierte una ruta de archivo de la API en una URL navegable. */
export function resolverUrlArchivo(value) {
  const path = String(value || '').trim()
  if (!path) return ''
  if (/^(https?:|data:|blob:)/i.test(path)) return path

  const configuredBase = String(import.meta.env.VITE_FILES_URL || '').replace(/\/+$/, '')
  const serverBase = configuredBase || API_URL.replace(/\/api(?:\/v\d+)?$/i, '')
  try {
    return new URL(path.replace(/^\/+/, ''), `${serverBase}/`).href
  } catch {
    return `${serverBase}/${path.replace(/^\/+/, '')}`
  }
}

/**
 * Convierte las distintas estructuras de error del backend en un solo mensaje.
 * La API actual puede devolver `message` como texto, JSON serializado o `errors`.
 */
export function obtenerMensajeError(error) {
  const payload = error?.payload

  if (!payload) return error?.message || 'No fue posible conectar con el servidor'
  if (payload.error) return payload.error

  if (typeof payload.message === 'string') {
    try {
      const errores = JSON.parse(payload.message)
      return Object.values(errores).flat().join(', ')
    } catch {
      return payload.message
    }
  }

  if (payload.errors) return Object.values(payload.errors).flat().join(', ')
  return 'Ocurrió un error inesperado'
}

let activeRequests = 0
let activeMutations = 0

function notifyRequestState(path) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hhospital:request-state', {
      detail: { active: activeRequests, mutations: activeMutations, path },
    }))
  }
}

function notifyMutationSuccess(path, method, payload) {
  if (typeof window !== 'undefined') {
    const backendMessage = payload?.message || payload?.mensaje
    window.dispatchEvent(new CustomEvent('hhospital:request-success', {
      detail: {
        path,
        method,
        message: typeof backendMessage === 'string' ? backendMessage : 'Acción realizada correctamente.',
      },
    }))
  }
}

/** Ejecución interna. El wrapper público registra su ciclo en el cargador global. */
async function performRequest(path, options = {}) {
  const token = localStorage.getItem('access_token')
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  }

  // Con FormData el navegador debe construir Content-Type junto con su boundary.
  if (isFormData) delete headers['Content-Type']

  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    throw Object.assign(new Error('No fue posible conectar con el servidor'), { cause })
  }

  const payload = await response.json().catch(() => null)

  // Un 401 invalida la sesión completa para evitar seguir enviando un token vencido.
  if (response.status === 401) {
    let expiredUserId = null
    try { expiredUserId = JSON.parse(localStorage.getItem('user_info') || '{}').id } catch { /* Sesión corrupta. */ }
    if (expiredUserId !== null && expiredUserId !== undefined) {
      localStorage.removeItem(`hhospital:navigation:${expiredUserId}`)
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('permissions')

    // No redirige un fallo del propio login para que esa pantalla pueda mostrar
    // "credenciales incorrectas" sin entrar en un ciclo de navegación.
    if (window.location.pathname !== '/auth/sign-in') {
      const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
      window.location.assign(`/auth/sign-in?redirect=${redirect}`)
    }
  }

  if (!response.ok) {
    throw Object.assign(new Error(`Error HTTP ${response.status}`), {
      status: response.status,
      payload,
    })
  }

  return payload
}

/**
 * Cliente HTTP compartido por HHospital. El contador permite representar
 * correctamente solicitudes paralelas: el cargador desaparece únicamente
 * cuando todas han finalizado, incluso si alguna falla o es cancelada.
 */
export async function apiRequest(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase()
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  activeRequests += 1
  if (isMutation) activeMutations += 1
  notifyRequestState(path)
  try {
    const payload = await performRequest(path, options)
    if (isMutation) notifyMutationSuccess(path, method, payload)
    return payload
  } finally {
    activeRequests = Math.max(0, activeRequests - 1)
    if (isMutation) activeMutations = Math.max(0, activeMutations - 1)
    notifyRequestState(path)
  }
}

export function toQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => query.append(`${key}[]`, item))
    } else if (value !== '' && value !== null && value !== undefined) query.set(key, value)
  })
  const value = query.toString()
  return value ? `?${value}` : ''
}
