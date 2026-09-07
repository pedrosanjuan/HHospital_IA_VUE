import { defineStore } from 'pinia'
import { obtenerMensajeError } from '@/services/api'
import { consultarEstadosReserva, consultarReservas, consultarReservasEstacion, consultarTiposReserva, crearReservaCama, responderReserva } from '@/services/hospitalizacion'
import { useStationsStore } from './estaciones'

const list = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : []

export const useReservationsStore = defineStore('bedReservations', {
  state: () => ({ tipos: [], estados: [], catalogsLoaded: false, pendientesByEstacion: {}, aceptadasByEstacion: {}, seguimientoAdmision: [], loadingByEstacion: {}, respondingById: {}, assigningById: {}, errorByEstacion: {}, lastUpdatedByEstacion: {}, loadingTracking: false }),
  getters: {
    pendingCount: state => stationId => (state.pendientesByEstacion[stationId] || []).reduce((total, room) => total + (room.reservas?.length || 0), 0),
  },
  actions: {
    async loadCatalogs() {
      if (this.catalogsLoaded) return
      const [types, states] = await Promise.all([consultarTiposReserva(), consultarEstadosReserva()])
      this.tipos = list(types); this.estados = list(states); this.catalogsLoaded = true
    },
    async create(payload) { const result = await crearReservaCama(payload); await this.refreshRelated(); return result },
    async loadTracking(estado = 'todos') { this.loadingTracking = true; try { this.seguimientoAdmision = list(await consultarReservas({ estado })); return this.seguimientoAdmision } finally { this.loadingTracking = false } },
    async loadStation(stationId) {
      if (this.loadingByEstacion[stationId]) return
      this.loadingByEstacion[stationId] = true; this.errorByEstacion[stationId] = null
      try {
        const [pending, accepted] = await Promise.all([consultarReservasEstacion(stationId), consultarReservas({ estado: 2 })])
        this.pendientesByEstacion[stationId] = list(pending)
        this.aceptadasByEstacion[stationId] = list(accepted).filter(item => String(item.id_estacion ?? item.estacion_id ?? item.estacion?.id) === String(stationId))
        this.lastUpdatedByEstacion[stationId] = Date.now()
      }
      catch (error) { this.errorByEstacion[stationId] = obtenerMensajeError(error); throw error }
      finally { this.loadingByEstacion[stationId] = false }
    },
    async respond(stationId, reservationId, status, observation, serviceOrderId = null) {
      this.respondingById[reservationId] = true
      try { await responderReserva(reservationId, status, observation, serviceOrderId); await this.loadStation(stationId); await this.refreshRelated() }
      finally { this.respondingById[reservationId] = false }
    },
    async refreshRelated() { const stations = useStationsStore(); stations.lastUpdatedAt = null; this.seguimientoAdmision = [] },
  },
})
