import { defineStore } from 'pinia'
import { obtenerMensajeError } from '@/services/api'
import { consultarMenuUsuario } from '@/services/hospitalizacion'

// Versión 2 corresponde a la respuesta jerárquica de /v1/User/Menus/list.
const CACHE_VERSION = 2
const CACHE_TTL = 8 * 60 * 60 * 1000
const CACHE_PREFIX = 'hhospital:navigation:'

// Las promesas no pertenecen al estado reactivo ni se persisten. Este mapa hace
// que dos componentes que pidan la misma ubicación compartan una sola consulta.
const pendingRequests = new Map()

function readCurrentUser() {
  try { return JSON.parse(localStorage.getItem('user_info') || '{}') } catch { return {} }
}

function cacheKey(userId) { return `${CACHE_PREFIX}${userId}` }

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    itemsByLocation: {},
    loadedLocations: {},
    loadingLocations: {},
    errorByLocation: {},
    ownerUserId: null,
  }),
  getters: {
    getMenu: state => location => state.itemsByLocation[location] || [],
    hasLoaded: state => location => state.loadedLocations[location] === true,
    isLoading: state => location => state.loadingLocations[location] === true,
    getError: state => location => state.errorByLocation[location] || null,
  },
  actions: {
    /** Restaura únicamente la caché que pertenece al usuario autenticado. */
    restore(userId) {
      if (userId === null || userId === undefined) return false
      if (this.ownerUserId !== null && String(this.ownerUserId) !== String(userId)) this.clearMenus()

      let cached
      try { cached = JSON.parse(localStorage.getItem(cacheKey(userId)) || 'null') } catch { return false }
      const valid = cached && cached.version === CACHE_VERSION &&
        String(cached.ownerUserId) === String(userId) &&
        cached.itemsByLocation && cached.loadedLocations &&
        Object.values(cached.itemsByLocation).every(Array.isArray)
      if (!valid) return false

      this.ownerUserId = userId
      this.itemsByLocation = cached.itemsByLocation
      this.loadedLocations = cached.loadedLocations
      return Date.now() - Number(cached.savedAt || 0) <= CACHE_TTL
    },
    persist() {
      if (this.ownerUserId === null) return
      localStorage.setItem(cacheKey(this.ownerUserId), JSON.stringify({
        ownerUserId: this.ownerUserId,
        itemsByLocation: this.itemsByLocation,
        loadedLocations: this.loadedLocations,
        savedAt: Date.now(),
        version: CACHE_VERSION,
      }))
    },
    async loadMenu(location, userId = readCurrentUser().id) {
      if (!location || userId === null || userId === undefined) return []
      if (this.ownerUserId === null) {
        const cacheIsFresh = this.restore(userId)
        if (!cacheIsFresh && this.hasLoaded(location)) this.refreshMenu(location).catch(() => {})
      }
      if (String(this.ownerUserId) !== String(userId)) {
        this.clearMenus()
        this.ownerUserId = userId
      }
      if (this.hasLoaded(location)) return this.getMenu(location)
      if (pendingRequests.has(location)) return pendingRequests.get(location)

      const request = this.fetchMenu(location).finally(() => pendingRequests.delete(location))
      pendingRequests.set(location, request)
      return request
    },
    async fetchMenu(location) {
      this.loadingLocations[location] = true
      this.errorByLocation[location] = null
      try {
        const response = await consultarMenuUsuario()
        // Una respuesta vacía sigue siendo una carga exitosa y debe quedar marcada.
        this.itemsByLocation[location] = Array.isArray(response) ? response : []
        this.loadedLocations[location] = true
        this.persist()
        return this.itemsByLocation[location]
      } catch (error) {
        this.errorByLocation[location] = obtenerMensajeError(error) || 'No fue posible cargar el menú de navegación.'
        throw error
      } finally {
        this.loadingLocations[location] = false
      }
    },
    async refreshMenu(location) {
      this.loadedLocations[location] = false
      return this.loadMenu(location, this.ownerUserId ?? readCurrentUser().id)
    },
    clearMenus() {
      if (this.ownerUserId !== null) localStorage.removeItem(cacheKey(this.ownerUserId))
      this.itemsByLocation = {}
      this.loadedLocations = {}
      this.loadingLocations = {}
      this.errorByLocation = {}
      this.ownerUserId = null
      pendingRequests.clear()
    },
  },
})
