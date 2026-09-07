<template>
  <div class="hh-page">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div><p class="text-primary fw-semibold mb-1">Hospitalización</p><h2 class="mb-1">Censo hospitalario</h2><p class="text-muted mb-0">Pacientes con estancia activa y su ubicación actual.</p></div>
      <router-link to="/hospitalizacion/nuevo-ingreso" class="btn btn-primary"><i class="ri-user-add-line me-1"></i> Nuevo ingreso</router-link>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <b-card no-body class="mb-4"><b-card-body>
      <form class="row g-3 align-items-end" @submit.prevent="loadCensus(1)">
        <div class="col-lg-5"><label class="form-label">Buscar paciente</label><div class="input-group"><span class="input-group-text"><i class="ri-search-line"></i></span><input v-model.trim="filters.buscar" class="form-control" maxlength="100" placeholder="Nombre o identificación"></div></div>
        <div class="col-md-3 col-lg-2"><label class="form-label">Estación (ID)</label><input v-model.number="filters.id_estacion" type="number" min="1" class="form-control" placeholder="Todas"></div>
        <div class="col-md-3 col-lg-2"><label class="form-label">Sala (ID)</label><input v-model.number="filters.id_sala" type="number" min="1" class="form-control" placeholder="Todas"></div>
        <div class="col-md-4 col-lg-2"><label class="form-label">Estado</label><select v-model="filters.estado" class="form-select"><option value="">Todos</option><option value="activo">Activo</option><option value="en_traslado">En traslado</option></select></div>
        <div class="col-md-2 col-lg-1 d-grid"><button class="btn btn-outline-primary" title="Aplicar filtros"><i class="ri-filter-3-line"></i></button></div>
      </form>
    </b-card-body></b-card>

    <div class="row g-3 mb-4">
      <div class="col-md-4"><div class="metric"><span class="metric-icon bg-primary-subtle text-primary"><i class="ri-group-line"></i></span><div><small>Hospitalizados</small><strong>{{ meta.total }}</strong></div></div></div>
      <div class="col-md-4"><div class="metric"><span class="metric-icon bg-success-subtle text-success"><i class="ri-heart-pulse-line"></i></span><div><small>Activos en esta página</small><strong>{{ activeCount }}</strong></div></div></div>
      <div class="col-md-4"><div class="metric"><span class="metric-icon bg-warning-subtle text-warning"><i class="ri-arrow-left-right-line"></i></span><div><small>En traslado</small><strong>{{ transferCount }}</strong></div></div></div>
    </div>

    <b-card no-body><b-card-body class="p-0">
      <div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Paciente</th><th>Ingreso</th><th>Estancia</th><th>Ubicación actual</th><th>Estado</th><th class="text-end">Acción</th></tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-5"><span class="spinner-border text-primary"></span><p class="text-muted mt-2 mb-0">Consultando censo…</p></td></tr>
          <tr v-else-if="!patients.length"><td colspan="6" class="text-center py-5"><i class="ri-user-search-line fs-1 text-muted"></i><p class="text-muted mt-2 mb-0">No hay pacientes que coincidan con los filtros.</p></td></tr>
          <tr v-for="item in patients" v-else :key="item.id_hospitalizacion">
            <td><div class="d-flex align-items-center gap-3"><span class="avatar">{{ initials(item.paciente?.nombre) }}</span><div><strong class="d-block">{{ item.paciente?.nombre || 'Sin nombre' }}</strong><small class="text-muted">{{ item.paciente?.tipo_documento }} {{ item.paciente?.identificacion }}</small></div></div></td>
            <td>{{ formatDateTime(item.fecha_ingreso) }}</td><td><strong>{{ item.dias_estancia }}</strong> {{ item.dias_estancia === 1 ? 'día' : 'días' }}</td>
            <td><strong class="d-block">{{ locationName(item) }}</strong><small class="text-muted">{{ locationDetail(item) }}</small></td>
            <td><span class="badge" :class="item.estado_hospitalizacion === 'activo' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'">{{ statusLabel(item.estado_hospitalizacion) }}</span></td>
            <td class="text-end"><router-link :to="`/hospitalizacion/${item.id_hospitalizacion}`" class="btn btn-sm btn-outline-primary">Ver detalle</router-link></td>
          </tr>
        </tbody></table></div>
    </b-card-body><b-card-footer v-if="meta.ultima_pagina > 1" class="d-flex justify-content-between align-items-center"><small>Página {{ meta.pagina_actual }} de {{ meta.ultima_pagina }}</small><div class="btn-group"><button class="btn btn-sm btn-outline-secondary" :disabled="meta.pagina_actual <= 1" @click="loadCensus(meta.pagina_actual - 1)">Anterior</button><button class="btn btn-sm btn-outline-secondary" :disabled="meta.pagina_actual >= meta.ultima_pagina" @click="loadCensus(meta.pagina_actual + 1)">Siguiente</button></div></b-card-footer></b-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { consultarCenso } from '@/services/hospitalizacion'

const loading = ref(false), errorMessage = ref(''), patients = ref([])
const filters = reactive({ buscar: '', id_estacion: '', id_sala: '', estado: '', por_pagina: 25 })
const meta = reactive({ pagina_actual: 1, ultima_pagina: 1, por_pagina: 25, total: 0 })
const activeCount = computed(() => patients.value.filter(item => item.estado_hospitalizacion === 'activo').length)
const transferCount = computed(() => patients.value.filter(item => item.estado_hospitalizacion === 'en_traslado').length)
const initials = (name = '') => name.split(' ').slice(0, 2).map(value => value[0]).join('').toUpperCase()
const statusLabel = value => value === 'en_traslado' ? 'En traslado' : 'Activo'
const formatDateTime = value => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin fecha'
function currentLocation(item) { return item.ubicacion_clinica_actual || item.ubicacion || {} }
function locationName(item) { const value = currentLocation(item); return value.nombre_cama || value.cama || value.habitacion || 'Sin cama asignada' }
function locationDetail(item) { const value = currentLocation(item); return [value.sala, value.estacion, value.piso].filter(Boolean).join(' · ') || 'Sin detalle de ubicación' }

/** Mantiene la paginación en el servidor para que el censo pueda crecer sin cargar todo en memoria. */
async function loadCensus(page = 1) {
  loading.value = true; errorMessage.value = ''
  try {
    const response = await consultarCenso({ ...filters, page })
    patients.value = response.data || []; Object.assign(meta, response.meta || {})
  } catch (error) { errorMessage.value = obtenerMensajeError(error) } finally { loading.value = false }
}
onMounted(() => loadCensus())
</script>

<style scoped>
.metric{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;background:var(--bs-body-bg);border:1px solid var(--bs-border-color);border-radius:.75rem}.metric-icon{width:48px;height:48px;border-radius:.65rem;display:grid;place-items:center;font-size:1.4rem}.metric div{display:flex;flex-direction:column}.metric small{color:var(--bs-secondary-color)}.metric strong{font-size:1.5rem;line-height:1.2}.avatar{width:42px;height:42px;flex:none;border-radius:50%;display:grid;place-items:center;background:rgba(var(--bs-primary-rgb),.12);color:var(--bs-primary);font-weight:700}th{white-space:nowrap;color:var(--bs-secondary-color);font-size:.75rem;text-transform:uppercase;letter-spacing:.03em}td{padding:1rem}
</style>
