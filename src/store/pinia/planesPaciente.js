import { defineStore } from 'pinia'
import { crearPlanMedicamentos, crearPlanProcedimientos, consultarFrecuenciasMedicamento, consultarMedicamentosGenericos, consultarPlanMedicamentosActivo, consultarPlanProcedimientosActivo, consultarServicios, consultarViasMedicamento, registrarAdministracionMedicamento } from '@/services/hospitalizacion'

const list = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : []

export const usePatientPlansStore = defineStore('patientPlans', {
  state: () => ({ medicationPlan: null, procedurePlan: null, medicamentos: [], vias: [], frecuencias: [], servicios: [], medicationCatalogsLoaded: false, serviceCatalogsLoaded: false, loadingMedicationPlan: false, loadingProcedurePlan: false, savingMedicationPlan: false, savingProcedurePlan: false, administeringById: {} }),
  actions: {
    async checkMedication(context) { this.loadingMedicationPlan = true; try { const r = await consultarPlanMedicamentosActivo(context.patientId, context.workOrderId); this.medicationPlan = r?.plan || r?.data?.plan || null } catch (e) { if (e.status === 404) this.medicationPlan = null; else throw e } finally { this.loadingMedicationPlan = false } return this.medicationPlan },
    async checkProcedure(context) { this.loadingProcedurePlan = true; try { const r = await consultarPlanProcedimientosActivo(context.patientId, context.workOrderId); this.procedurePlan = r?.plan || r?.data?.plan || null } catch (e) { if (e.status === 404) this.procedurePlan = null; else throw e } finally { this.loadingProcedurePlan = false } return this.procedurePlan },
    async loadMedicationCatalogs() { if (this.medicationCatalogsLoaded) return; const [m, v, f] = await Promise.all([consultarMedicamentosGenericos(), consultarViasMedicamento(), consultarFrecuenciasMedicamento()]); this.medicamentos = list(m); this.vias = list(v); this.frecuencias = list(f); this.medicationCatalogsLoaded = true },
    /** Recarga el catálogo al abrir el creador para no trabajar con servicios desactualizados. */
    async loadServiceCatalogs(force = false) { if (this.serviceCatalogsLoaded && !force) return this.servicios; this.servicios = list(await consultarServicios()); this.serviceCatalogsLoaded = true; return this.servicios },
    async saveMedication(payload) { this.savingMedicationPlan = true; try { const result = await crearPlanMedicamentos(payload); this.medicationPlan = result?.plan || null; return result } finally { this.savingMedicationPlan = false } },
    async saveProcedure(payload) { this.savingProcedurePlan = true; try { const result = await crearPlanProcedimientos(payload); this.procedurePlan = result?.plan || null; return result } finally { this.savingProcedurePlan = false } },
    async administerMedication(itemId, payload, context) { this.administeringById[itemId] = true; try { const result = await registrarAdministracionMedicamento(itemId, payload); await this.checkMedication(context); return result } finally { this.administeringById[itemId] = false } },
  },
})
