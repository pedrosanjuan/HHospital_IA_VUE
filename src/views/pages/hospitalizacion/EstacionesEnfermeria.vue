<template>
  <div class="hh-page">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"><div><p class="text-primary fw-semibold mb-1">Hospitalización</p><h2 class="mb-1">Estaciones de enfermería</h2><p class="text-muted mb-0">Consulte la capacidad, ocupación y reservas de camas por estación.</p></div><div class="d-flex flex-wrap gap-2"><router-link to="/admision/reservas" class="btn btn-primary"><i class="ph ph-calendar-check me-1"></i>Todas las reservas<span v-if="reservations" class="badge bg-light text-primary ms-2">{{ reservations }}</span></router-link><button class="btn btn-outline-primary" :disabled="store.refreshing" @click="refresh"><span v-if="store.refreshing" class="spinner-border spinner-border-sm me-2"></span><i v-else class="ri-refresh-line me-1"></i>Actualizar</button></div></div>
    <div v-if="store.error" class="alert alert-danger d-flex justify-content-between align-items-center"><span>No fue posible consultar las estaciones de enfermería. {{ store.error }}</span><button class="btn btn-sm btn-outline-danger" @click="load">Reintentar</button></div>

    <template v-if="store.loading">
      <div class="row g-3 mb-4"><div v-for="i in 5" :key="i" class="col-md-6 col-xl"><div class="skeleton metric-skeleton"></div></div></div>
      <div class="row g-4"><div v-for="i in 6" :key="i" class="col-md-6 col-xl-4"><div class="skeleton card-skeleton"></div></div></div>
    </template>
    <template v-else-if="store.loaded">
      <div class="d-flex justify-content-between align-items-center mb-3"><small class="text-muted">Última actualización: {{ updatedAt }}</small><span v-if="isPartial" class="badge bg-warning-subtle text-warning">Resumen parcial</span></div>
      <div class="row g-3 mb-4">
        <div v-for="metric in metrics" :key="metric.label" class="col-6 col-md-4 col-xl"><div class="metric"><span :class="metric.class"><i :class="metric.icon"></i></span><div><small>{{ metric.label }}</small><strong>{{ metric.value }}</strong></div></div></div>
      </div>
      <b-card no-body class="mb-4"><b-card-body><div class="row g-3"><div class="col-md-8"><label class="form-label">Buscar estación</label><div class="input-group"><span class="input-group-text"><i class="ri-search-line"></i></span><input v-model.trim="search" class="form-control" placeholder="Nombre de la estación"></div></div><div class="col-md-4"><label class="form-label">Ordenar por</label><select v-model="sortBy" class="form-select"><option value="name">Nombre A–Z</option><option value="occupancy">Mayor ocupación</option><option value="available">Más camas disponibles</option><option value="reservations">Más reservas pendientes</option></select></div></div></b-card-body></b-card>
      <div v-if="!store.items.length" class="empty-state"><i class="ri-hospital-line"></i><h4>No hay estaciones de enfermería registradas.</h4></div>
      <div v-else-if="!visibleStations.length" class="empty-state"><i class="ri-search-line"></i><h4>No hay resultados para esta búsqueda.</h4></div>
      <div v-else class="row g-4">
        <div v-for="station in visibleStations" :key="station.id" class="col-md-6 col-xl-4"><b-card no-body class="station-card h-100"><b-card-body>
          <div class="d-flex justify-content-between align-items-start"><div class="station-icon"><i class="ri-nurse-line"></i></div><span class="badge bg-warning-subtle text-warning">{{ station.reservas_pendientes }} reservas pendientes</span></div><h4 class="mt-3 mb-1">{{ station.nombre }}</h4><small class="text-muted">Estación #{{ station.id }}</small>
          <div v-if="station.cargando_detalle" class="capacity-loading"><span class="spinner-border spinner-border-sm text-primary"></span> Consultando capacidad…</div>
          <div v-else-if="station.error_detalle" class="alert alert-danger mt-3 mb-0"><small>No fue posible consultar la capacidad de esta estación.</small><button class="btn btn-sm btn-link text-danger p-0 d-block mt-1" @click="retry(station.id)">Reintentar</button></div>
          <template v-else><div class="capacity-grid"><div><strong>{{ station.total_camas }}</strong><small>Camas totales</small></div><div><strong class="text-primary">{{ station.ocupadas }}</strong><small>Ocupadas</small></div><div><strong class="text-success">{{ station.disponibles }}</strong><small>Disponibles</small></div></div><div class="d-flex justify-content-between small mb-1"><span>Ocupación</span><strong>{{ occupancy(station) }} %</strong></div><div class="progress" style="height:7px"><div class="progress-bar" :style="{ width: `${occupancy(station)}%` }"></div></div><div class="d-flex justify-content-between text-muted small mt-3"><span>{{ station.total_salas }} salas · {{ station.total_habitaciones }} habitaciones</span><span>{{ station.camas_reservadas }} camas con reserva activa</span></div></template>
        </b-card-body><b-card-footer><div class="d-grid gap-2"><router-link :to="`/hospitalizacion/estaciones/${station.id}/reservas`" class="btn btn-primary"><i class="ph ph-bell me-1"></i>Gestionar reservas <span v-if="station.reservas_pendientes" class="badge bg-light text-primary ms-1">{{ station.reservas_pendientes }}</span></router-link><router-link :to="`/hospitalizacion/estaciones/${station.id}`" class="btn btn-outline-primary">Ver estación <i class="ri-arrow-right-line ms-1"></i></router-link></div></b-card-footer></b-card></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStationsStore } from '@/store/pinia/estaciones'
const store = useStationsStore(), search = ref(''), sortBy = ref('name')
const successfullyLoaded = computed(() => store.items.filter(item => item.detalle_cargado))
const totals = computed(() => successfullyLoaded.value.reduce((sum, item) => ({ beds: sum.beds + item.total_camas, occupied: sum.occupied + item.ocupadas, available: sum.available + item.disponibles }), { beds: 0, occupied: 0, available: 0 }))
const reservations = computed(() => store.items.reduce((sum, item) => sum + item.reservas_pendientes, 0))
const isPartial = computed(() => store.items.some(item => !item.detalle_cargado))
const metrics = computed(() => [{ label: 'Estaciones', value: store.items.length, icon: 'ri-nurse-line', class: 'bg-info-subtle text-info' }, { label: 'Camas totales', value: totals.value.beds, icon: 'ri-hotel-bed-line', class: 'bg-primary-subtle text-primary' }, { label: 'Ocupadas', value: totals.value.occupied, icon: 'ri-user-heart-line', class: 'bg-primary-subtle text-primary' }, { label: 'Disponibles', value: totals.value.available, icon: 'ri-checkbox-circle-line', class: 'bg-success-subtle text-success' }, { label: 'Reservas pendientes', value: reservations.value, icon: 'ri-calendar-check-line', class: 'bg-warning-subtle text-warning' }])
const updatedAt = computed(() => store.lastUpdatedAt ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(store.lastUpdatedAt) : 'En proceso')
const visibleStations = computed(() => { const term = search.value.toLowerCase(); const list = store.items.filter(item => item.nombre?.toLowerCase().includes(term)); return [...list].sort((a, b) => sortBy.value === 'occupancy' ? occupancy(b) - occupancy(a) : sortBy.value === 'available' ? (b.disponibles ?? -1) - (a.disponibles ?? -1) : sortBy.value === 'reservations' ? b.reservas_pendientes - a.reservas_pendientes : a.nombre.localeCompare(b.nombre, 'es')) })
function occupancy(item) { return item.total_camas > 0 ? Math.round(item.ocupadas / item.total_camas * 100) : 0 }
async function load() { try { await store.loadStations() } catch { /* El store expone el error general. */ } }
async function refresh() { try { await store.refreshStations() } catch { /* Los datos previos permanecen visibles. */ } }
async function retry(id) { try { await store.retryStation(id) } catch { /* La tarjeta mantiene el reintento. */ } }
onMounted(load)
</script>

<style scoped>
.metric{display:flex;gap:.8rem;align-items:center;height:100%;padding:1rem;background:var(--bs-body-bg);border:1px solid var(--bs-border-color);border-radius:.75rem}.metric>span,.station-icon{width:44px;height:44px;flex:none;border-radius:.65rem;display:grid;place-items:center;font-size:1.3rem}.metric div{display:flex;flex-direction:column}.metric small{color:var(--bs-secondary-color)}.metric strong{font-size:1.35rem}.station-card{border:1px solid var(--bs-border-color)}.capacity-loading{margin-top:1rem;padding:2rem;text-align:center;color:var(--bs-secondary-color)}.capacity-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:1.25rem 0}.capacity-grid div{display:flex;flex-direction:column;padding:.75rem;background:var(--bs-tertiary-bg);border-radius:.6rem}.capacity-grid strong{font-size:1.3rem}.capacity-grid small{font-size:.72rem;color:var(--bs-secondary-color)}.empty-state{text-align:center;padding:4rem;color:var(--bs-secondary-color)}.empty-state i{font-size:3rem}.skeleton{border-radius:.75rem;background:linear-gradient(90deg,var(--bs-tertiary-bg),var(--bs-secondary-bg),var(--bs-tertiary-bg));background-size:200% 100%;animation:pulse 1.4s infinite}.metric-skeleton{height:80px}.card-skeleton{height:330px}@keyframes pulse{to{background-position:-200% 0}}
</style>
