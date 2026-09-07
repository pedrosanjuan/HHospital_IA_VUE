import { defineStore } from 'pinia'
import { obtenerMensajeError } from '@/services/api'
import { consultarEvolucionesAnteriores, consultarFormulariosEvolucion, consultarTiposEvolucionRegistrados, guardarEvolucionClinica } from '@/services/hospitalizacion'

const array = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : []
const normalizeForms = response => [...new Map((Array.isArray(response?.formularios) ? response.formularios : []).map(item => [Number(item.id), { id: Number(item.id), nombre: item.nombre_actividad || `Registro ${item.id}`, tabla: item.nombre_tabla_mysql || null, raw: item }])).values()]

export const useOpenCareStore = defineStore('openCare', {
  state: () => ({ context: null, patient: null, forms: [], selectedFormId: null, previousTypes: [], previousRecordsByForm: {}, loading: false, saving: false, loaded: false, error: null }),
  getters: { selectedForm: state => state.forms.find(item => item.id === state.selectedFormId) || null },
  actions: {
    async loadOpenCare(context) {
      this.context = context; this.loading = true; this.error = null
      try {
        const response = await consultarFormulariosEvolucion(context.patientId, context.serviceOrderId)
        this.patient = response?.paciente || null
        this.forms = normalizeForms(response)
        this.loaded = true
        return response
      } catch (error) { this.error = obtenerMensajeError(error); throw error }
      finally { this.loading = false }
    },
    selectClinicalForm(id) { this.selectedFormId = Number(id) },
    async loadPreviousTypes() { this.previousTypes = array(await consultarTiposEvolucionRegistrados(this.context.serviceOrderId)); return this.previousTypes },
    async loadPreviousRecords(masterId) { const records = array(await consultarEvolucionesAnteriores(this.context.serviceOrderId, masterId)); this.previousRecordsByForm[masterId] = records; return records },
    async saveEvolution(config, values) {
      this.saving = true
      try {
        const payload = { ...values, id_paciente: Number(this.context.patientId), id_orden_servicio: Number(this.context.serviceOrderId), id_master_registro: Number(this.selectedFormId), id_actividad: this.context.activityId || null }
        const result = await guardarEvolucionClinica(config.endpoint, payload)
        delete this.previousRecordsByForm[this.selectedFormId]
        return result
      } finally { this.saving = false }
    },
    clearOpenCare() { this.$reset() },
  },
})
