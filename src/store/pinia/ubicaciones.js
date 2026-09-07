import { defineStore } from 'pinia'
import { obtenerMensajeError } from '@/services/api'
import { eliminarUbicacion, guardarUbicacion, listarUbicaciones } from '@/services/hospitalizacion'

export const RESOURCES = ['sucursales', 'torres', 'pisos', 'estaciones', 'salas', 'habitaciones', 'camas']
export const CATALOGS = ['tiposPiso', 'tiposSala', 'tiposHabitacion', 'estadosUso']

// Algunos controladores devuelven arrays directamente y otros los envuelven
// en `data`. Esta función mantiene el resto del módulo ajeno a esa diferencia.
const collection = response => Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []

export const useLocationsStore = defineStore('physicalLocations', {
  state: () => ({
    ...Object.fromEntries([...RESOURCES, ...CATALOGS].map(key => [key, []])),
    loadingByResource: {}, errorByResource: {}, loaded: false,
    selected: { sucursalId: null, torreId: null, pisoId: null, salaId: null, habitacionId: null, camaId: null },
  }),
  actions: {
    async load(resource, filters = {}) {
      this.loadingByResource[resource] = true
      this.errorByResource[resource] = null
      try {
        this[resource] = collection(await listarUbicaciones(resource, filters))
        return this[resource]
      } catch (error) {
        this.errorByResource[resource] = obtenerMensajeError(error)
        throw error
      } finally { this.loadingByResource[resource] = false }
    },
    async loadAll() {
      const results = await Promise.allSettled([...RESOURCES, ...CATALOGS].map(resource => this.load(resource)))
      this.loaded = results.some(result => result.status === 'fulfilled')
      return results
    },
    async save(resource, payload, id = null) {
      const response = await guardarUbicacion(resource, payload, id)
      await this.load(resource)
      return response
    },
    async remove(resource, id) {
      await eliminarUbicacion(resource, id)
      await this.load(resource)
    },
  },
})
