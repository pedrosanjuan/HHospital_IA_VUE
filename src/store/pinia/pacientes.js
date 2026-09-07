import { defineStore } from 'pinia'
import { obtenerMensajeError } from '@/services/api'
import { buscarPacienteExacto, buscarPacientes, consultarCatalogo } from '@/services/hospitalizacion'

let activeController = null

function normalizePatient(item) {
  return {
    id: Number(item.id ?? item.paciente_id),
    nombre: item.name ?? item.nombre ?? '',
    tipoDocumento: item.tipo_documento ?? item.tipo_identificacion ?? null,
    identificacion: String(item.identificacion ?? ''),
    fechaNacimiento: item.fecha_de_nacimiento ?? item.fecha_nacimiento ?? null,
    edad: item.edad == null ? null : Number(item.edad),
    estado: item.estado ?? null,
    correo: item.correo ?? item.email ?? null,
    celular: item.celular ?? item.celular1 ?? null,
    celularAlterno: item.celular2 ?? null,
    direccion: item.direccion ?? item.dir ?? null,
  }
}

export const usePatientsSearchStore = defineStore('patientsSearch', {
  state: () => ({
    filters: { identificacion: '', primerNombre: '', primerApellido: '', estados: [], paisId: '' },
    results: [], loading: false, searched: false, error: null, lastRequestKey: null, selectedPatient: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 25, total: 0 },
    links: { primera: null, ultima: null, anterior: null, siguiente: null },
    countries: [], countriesLoaded: false, countriesError: null,
  }),
  actions: {
    async loadCountries() {
      if (this.countriesLoaded) return this.countries
      try {
        const response = await consultarCatalogo('System/paises')
        this.countries = (Array.isArray(response) ? response : []).map(item => ({ id: item.id, nombre: item.nombre ?? item.name ?? item.tag }))
        this.countriesLoaded = true
      } catch (error) { this.countriesError = obtenerMensajeError(error) }
      return this.countries
    },
    buildParams() {
      const params = {}
      const dni = this.filters.identificacion.trim(), firstName = this.filters.primerNombre.trim(), lastName = this.filters.primerApellido.trim()
      if (dni) params.identificacion = dni
      if (firstName) params.primernombre = firstName
      if (lastName) params.primerapellido = lastName
      if (this.filters.estados.length) params.id_estado = this.filters.estados.map(Number)
      if (this.filters.paisId) params.id_pais = Number(this.filters.paisId)
      return params
    },
    async searchPatients(page = 1) {
      const params = this.buildParams()
      const hasOnlyDni = params.identificacion && Object.keys(params).length === 1
      // La búsqueda exacta no pagina; los demás filtros siempre incluyen el
      // tamaño y la página para consumir el nuevo contrato del backend.
      if (!hasOnlyDni) {
        params.page = Number(page) || 1
        params.por_pagina = Number(this.pagination.perPage) || 25
      }
      activeController?.abort()
      activeController = new AbortController()
      const requestKey = JSON.stringify(params)
      this.lastRequestKey = requestKey; this.loading = true; this.error = null; this.searched = true
      try {
        let response
        if (hasOnlyDni) {
          try {
            response = [await buscarPacienteExacto(params.identificacion, activeController.signal)]
            if (this.lastRequestKey === requestKey) {
              this.pagination = { currentPage: 1, lastPage: 1, perPage: this.pagination.perPage, total: 1 }
              this.links = { primera: null, ultima: null, anterior: null, siguiente: null }
            }
          }
          catch (error) {
            if (error.status === 400 && /no existe/i.test(error.payload?.message || '')) {
              response = []
              if (this.lastRequestKey === requestKey) {
                this.pagination = { currentPage: 1, lastPage: 1, perPage: this.pagination.perPage, total: 0 }
                this.links = { primera: null, ultima: null, anterior: null, siguiente: null }
              }
            }
            else throw error
          }
        } else {
          const payload = await buscarPacientes(params, activeController.signal)
          response = Array.isArray(payload?.data) ? payload.data : []
          if (this.lastRequestKey === requestKey) {
            const meta = payload?.meta || {}
            this.pagination = {
              currentPage: Number(meta.pagina_actual ?? params.page),
              lastPage: Number(meta.ultima_pagina ?? 1),
              perPage: Number(meta.por_pagina ?? params.por_pagina),
              total: Number(meta.total ?? response.length),
            }
            this.links = payload?.links || { primera: null, ultima: null, anterior: null, siguiente: null }
          }
        }
        if (this.lastRequestKey === requestKey) this.results = response.map(normalizePatient)
        return this.results
      } catch (error) {
        if (error.name !== 'AbortError' && this.lastRequestKey === requestKey) this.error = obtenerMensajeError(error)
        throw error
      } finally { if (this.lastRequestKey === requestKey) this.loading = false }
    },
    cancelPendingSearch() { activeController?.abort(); activeController = null; this.loading = false },
    clearSearch() { const perPage = this.pagination.perPage; this.cancelPendingSearch(); this.filters = { identificacion: '', primerNombre: '', primerApellido: '', estados: [], paisId: '' }; this.results = []; this.pagination = { currentPage: 1, lastPage: 1, perPage, total: 0 }; this.links = { primera: null, ultima: null, anterior: null, siguiente: null }; this.searched = false; this.error = null; this.lastRequestKey = null },
    selectPatient(patient) { this.selectedPatient = { id: patient.id, nombre: patient.nombre, identificacion: patient.identificacion } },
  },
})
