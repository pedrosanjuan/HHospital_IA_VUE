<template>
  <div class="hh-page hh-detail-page">
    <router-link to="/hospitalizacion/censo" class="hh-back-link text-primary d-inline-flex align-items-center mb-3"><i class="ri-arrow-left-line me-1"></i> Volver al censo</router-link>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span></div>
    <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <template v-else-if="detail">
      <div class="d-flex flex-wrap justify-content-between gap-3 mb-4"><div><p class="text-primary fw-semibold mb-1">Hospitalización #{{ route.params.id }}</p><h2 class="mb-1">Detalle de estancia</h2><p class="text-muted mb-0">Información clínica y ubicación vigente del paciente.</p></div><span class="badge bg-success-subtle text-success align-self-center px-3 py-2">Hospitalización activa</span></div>
      <div class="row g-4">
        <div class="col-lg-8">
          <b-card no-body class="mb-4"><b-card-header><h4 class="mb-0">Resumen de hospitalización</h4></b-card-header><b-card-body><div class="row g-4">
            <div class="col-md-4"><small class="label">Paciente</small><strong class="value">{{ field(hospitalization, ['paciente.nombre', 'nombre_paciente']) }}</strong></div>
            <div class="col-md-4"><small class="label">Identificación</small><strong class="value">{{ field(hospitalization, ['paciente.identificacion', 'identificacion']) }}</strong></div>
            <div class="col-md-4"><small class="label">Días hospitalizado</small><strong class="value">{{ detail.dias_hospitalizacion ?? 0 }} días</strong></div>
            <div class="col-md-4"><small class="label">Fecha de ingreso</small><strong class="value">{{ formatDateTime(hospitalization.fecha_ingreso) }}</strong></div>
            <div class="col-md-4"><small class="label">Orden de trabajo</small><strong class="value">#{{ hospitalization.id_orden_trabajo || 'No asociada' }}</strong></div>
            <div class="col-md-4"><small class="label">Estado</small><strong class="value text-success">{{ hospitalization.estado || 'Activo' }}</strong></div>
          </div></b-card-body></b-card>
          <b-card no-body><b-card-header><h4 class="mb-0">Traslados pendientes</h4></b-card-header><b-card-body><div v-if="!detail.traslados_pendientes?.length" class="text-center text-muted py-4"><i class="ri-arrow-left-right-line fs-1"></i><p class="mb-0">No hay traslados pendientes.</p></div><div v-for="transfer in detail.traslados_pendientes" v-else :key="transfer.id" class="border rounded p-3 mb-2">{{ transfer }}</div></b-card-body></b-card>
        </div>
        <div class="col-lg-4"><b-card no-body><b-card-header><h4 class="mb-0">Ubicación actual</h4></b-card-header><b-card-body><div class="location-icon"><i class="ri-hotel-bed-line"></i></div><h4 class="text-center">{{ location.nombre_cama || location.cama || 'Cama asignada' }}</h4><p class="text-muted text-center">{{ location.habitacion || 'Habitación sin especificar' }}</p><hr><dl class="location-list"><template v-for="item in locationRows" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value || 'No informado' }}</dd></template></dl></b-card-body></b-card></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { consultarDetalle } from '@/services/hospitalizacion'
const route = useRoute(), loading = ref(true), errorMessage = ref(''), detail = ref(null)
const hospitalization = computed(() => detail.value?.hospitalizacion || {})
const location = computed(() => detail.value?.ubicacion_actual || {})
const locationRows = computed(() => [{ label: 'Habitación', value: location.value.habitacion }, { label: 'Sala', value: location.value.sala }, { label: 'Estación', value: location.value.estacion }, { label: 'Piso', value: location.value.piso }, { label: 'Torre', value: location.value.torre }, { label: 'Sede', value: location.value.sucursal }])
function field(object, paths) { for (const path of paths) { const value = path.split('.').reduce((current, key) => current?.[key], object); if (value) return value } return 'No informado' }
const formatDateTime = value => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'No informada'
onMounted(async () => { try { const response = await consultarDetalle(route.params.id); detail.value = response.data } catch (error) { errorMessage.value = obtenerMensajeError(error) } finally { loading.value = false } })
</script>

<style scoped>
.label{display:block;color:var(--bs-secondary-color);margin-bottom:.3rem}.value{display:block;text-transform:capitalize}.location-icon{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;margin:0 auto 1rem;background:rgba(var(--bs-primary-rgb),.12);color:var(--bs-primary);font-size:2rem}.location-list{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin:0}.location-list dt{color:var(--bs-secondary-color);font-weight:500}.location-list dd{text-align:right;margin:0;font-weight:600}
</style>
