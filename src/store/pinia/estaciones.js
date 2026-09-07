import { defineStore } from 'pinia'
import { obtenerMensajeError } from '@/services/api'
import { consultarEstacion, consultarEstacionesConReservas } from '@/services/hospitalizacion'

const CACHE_TTL = 45 * 1000
const pendingDetails = new Map()

const emptyCapacity = () => ({ total_salas: null, total_habitaciones: null, total_camas: null, ocupadas: null, disponibles: null, camas_reservadas: null, pacientes_activos: null })

export const useStationsStore = defineStore('nursingStations', {
  state: () => ({ items: [], detailsById: {}, loading: false, refreshing: false, loaded: false, error: null, lastUpdatedAt: null }),
  getters: {
    getStation: state => id => state.items.find(item => String(item.id) === String(id)),
  },
  actions: {
    async loadStations() {
      const fresh = this.loaded && this.lastUpdatedAt && Date.now() - this.lastUpdatedAt < CACHE_TTL
      if (fresh) return this.items
      return this.fetchStations(this.loaded)
    },
    refreshStations() { return this.fetchStations(true) },
    async fetchStations(keepVisible = false) {
      if (this.loading || this.refreshing) return this.items
      keepVisible ? this.refreshing = true : this.loading = true
      this.error = null
      try {
        const response = await consultarEstacionesConReservas()
        const stations = (Array.isArray(response) ? response : []).map(station => ({ id: station.id, nombre: station.nombre, reservas_pendientes: Number(station.reservas ?? 0), ...emptyCapacity(), detalle_cargado: false, cargando_detalle: true, error_detalle: null }))
        this.items = stations
        this.loaded = true

        // allSettled mantiene utilizables las tarjetas cuyo detalle sí respondió.
        await Promise.allSettled(stations.map(station => this.loadStationDetail(station.id, true)))
        this.lastUpdatedAt = Date.now()
        return this.items
      } catch (error) {
        this.error = obtenerMensajeError(error)
        throw error
      } finally { this.loading = false; this.refreshing = false }
    },
    async loadStationDetail(id, force = false) {
      const station = this.getStation(id)
      if (station?.detalle_cargado && !force) return this.detailsById[id]
      if (pendingDetails.has(String(id))) return pendingDetails.get(String(id))
      const request = (async () => {
        if (station) { station.cargando_detalle = true; station.error_detalle = null }
        try {
          const detail = await consultarEstacion(id)
          this.detailsById[id] = detail
          if (station) Object.assign(station, {
            total_salas: Number(detail.resumen?.total_salas ?? 0), total_habitaciones: Number(detail.resumen?.total_habitaciones ?? 0), total_camas: Number(detail.resumen?.total_camas ?? 0), ocupadas: Number(detail.resumen?.ocupadas ?? 0), disponibles: Number(detail.resumen?.disponibles ?? 0), camas_reservadas: Number(detail.resumen?.reservadas ?? 0), pacientes_activos: Number(detail.resumen?.pacientes_activos ?? 0), detalle_cargado: true, error_detalle: null,
          })
          return detail
        } catch (error) { if (station) station.error_detalle = obtenerMensajeError(error); throw error }
        finally { if (station) station.cargando_detalle = false }
      })().finally(() => pendingDetails.delete(String(id)))
      pendingDetails.set(String(id), request)
      return request
    },
    retryStation(id) { return this.loadStationDetail(id, true) },
    clearStations() { this.items = []; this.detailsById = {}; this.loading = false; this.refreshing = false; this.loaded = false; this.error = null; this.lastUpdatedAt = null; pendingDetails.clear() },
  },
})
