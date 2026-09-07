<template>
  <main class="hh-page users-page">
    <section class="users-hero">
      <div><span>ADMINISTRACIÓN Y SEGURIDAD</span><h1>Configuración de usuarios</h1><p>Consulte colaboradores y administre sus accesos al sistema.</p></div>
      <div class="hero-icon"><i class="ph ph-users-three"></i></div>
    </section>

    <b-card no-body class="filter-card mb-4">
      <b-card-header><div><small>CRITERIOS DE CONSULTA</small><h4 class="mb-0">Buscar usuarios</h4></div><button class="btn btn-sm btn-link" @click="clearFilters">Limpiar filtros</button></b-card-header>
      <b-card-body><form class="row g-3" @submit.prevent="search">
        <div class="col-md-4 col-xl-3"><label class="form-label">Identificación</label><input v-model.trim="filters.identificacion" class="form-control" inputmode="numeric" placeholder="Número de documento"></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Primer nombre</label><input v-model.trim="filters.primernombre" class="form-control" placeholder="Ej. ANA"></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Primer apellido</label><input v-model.trim="filters.primerapellido" class="form-control" placeholder="Ej. PÉREZ"></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Estado sistema</label><select v-model="filters.active" class="form-select"><option value="">Todos</option><option value="1">Activo</option><option value="0">Inactivo</option></select></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Estado RR. HH.</label><select v-model="filters.rh_validate" class="form-select"><option value="">Todos</option><option value="1">Activo</option><option value="0">Inactivo</option></select></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Usuario de planta</label><select v-model="filters.planta" class="form-select"><option value="">Todos</option><option value="1">Sí</option><option value="0">No</option></select></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Departamento</label><select v-model="filters.id_departamento" class="form-select" @change="departmentChanged"><option value="">Todos</option><option v-for="item in departments" :key="optionId(item)" :value="optionId(item)">{{ optionName(item) }}</option></select></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Municipio</label><select v-model="filters.id_municipio" class="form-select" :disabled="!filters.id_departamento || loadingMunicipalities"><option value="">Todos</option><option v-for="item in municipalities" :key="optionId(item)" :value="optionId(item)">{{ optionName(item) }}</option></select></div>
        <div class="col-md-4 col-xl-3"><label class="form-label">Barrio</label><select v-model="filters.id_barrio" class="form-select"><option value="">Todos</option><option v-for="item in neighborhoods" :key="optionId(item)" :value="optionId(item)">{{ optionName(item) }}</option></select></div>
        <div class="col-12 d-flex justify-content-end gap-2"><button type="button" class="btn btn-outline-secondary" @click="clearFilters">Limpiar</button><button class="btn btn-primary px-4" :disabled="loading"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span><i v-else class="ph ph-magnifying-glass me-1"></i>Buscar</button></div>
      </form></b-card-body>
    </b-card>

    <div v-if="error" class="alert alert-danger"><strong>No fue posible consultar los usuarios.</strong> {{ error }}</div>
    <b-card no-body class="results-card">
      <b-card-header><div><small>RESULTADOS</small><h4 class="mb-0">Usuarios encontrados</h4></div><span class="result-count">{{ users.length }}</span></b-card-header>
      <div v-if="!searched && !loading" class="empty-state"><i class="ph ph-magnifying-glass"></i><h3>Inicie una búsqueda</h3><p>Puede consultar todos los usuarios o utilizar uno o varios filtros.</p></div>
      <div v-else-if="!users.length && !loading" class="empty-state"><i class="ph ph-user-minus"></i><h3>Sin coincidencias</h3><p>No encontramos usuarios con los criterios seleccionados.</p></div>
      <div v-else class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Usuario</th><th>Perfiles</th><th>Ubicación</th><th>Sistema</th><th>RR. HH.</th><th>Planta</th><th class="text-end">Acción</th></tr></thead><tbody><tr v-for="user in users" :key="user.id"><td><div class="user-cell"><span>{{ initials(user.name) }}</span><div><strong>{{ user.name }}</strong><small>{{ user.tag || 'DOC' }} {{ user.identificacion }}</small></div></div></td><td><span class="profiles">{{ user.perfiles || 'Sin perfiles' }}</span></td><td><strong class="table-main">{{ user.municipio || 'Sin municipio' }}</strong><small class="table-sub">{{ user.departamento || 'Sin departamento' }}</small></td><td><span class="state-pill" :class="user.active ? 'active' : 'inactive'"><i class="ph ph-circle-fill"></i>{{ user.estado_sistema || (user.active ? 'Activo' : 'Inactivo') }}</span></td><td><span class="state-pill" :class="user.rh_validate ? 'active' : 'inactive'">{{ user.estado_rh || (user.rh_validate ? 'Activo' : 'Inactivo') }}</span></td><td>{{ user.es_de_planta || (user._planta ? 'Sí' : 'No') }}</td><td class="text-end"><router-link :to="`/parametrizacion/usuarios/${user.id}`" class="btn btn-sm btn-outline-primary"><i class="ph ph-sliders-horizontal me-1"></i>Ver/configurar</router-link></td></tr></tbody></table></div>
    </b-card>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { buscarUsuarios, consultarBarriosUsuarios, consultarDepartamentosUsuarios, consultarMunicipiosUsuarios } from '@/services/usuarios'

const filters = reactive({ identificacion: '', primernombre: '', primerapellido: '', active: '', rh_validate: '', planta: '', id_departamento: '', id_municipio: '', id_barrio: '' })
const users = ref([]), departments = ref([]), municipalities = ref([]), neighborhoods = ref([])
const loading = ref(false), loadingMunicipalities = ref(false), searched = ref(false), error = ref('')
let controller = null
const array = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.usuarios) ? value.usuarios : []
const optionId = item => item.id ?? item.id_departamento ?? item.id_municipio ?? item.id_barrio
const optionName = item => item.nombre ?? item.name ?? item.departamento ?? item.municipio ?? item.barrio
const initials = name => String(name || 'U').split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()

async function search() {
  controller?.abort(); controller = new AbortController(); loading.value = true; error.value = ''
  try { users.value = array(await buscarUsuarios({ ...filters }, controller.signal)); searched.value = true }
  catch (reason) { if (reason.name !== 'AbortError') error.value = obtenerMensajeError(reason) }
  finally { loading.value = false }
}
async function departmentChanged() {
  filters.id_municipio = ''; municipalities.value = []
  if (!filters.id_departamento) return
  loadingMunicipalities.value = true
  try { municipalities.value = array(await consultarMunicipiosUsuarios(filters.id_departamento)) }
  catch (reason) { error.value = obtenerMensajeError(reason) }
  finally { loadingMunicipalities.value = false }
}
function clearFilters() { Object.keys(filters).forEach(key => { filters[key] = '' }); users.value = []; municipalities.value = []; searched.value = false; error.value = '' }
onMounted(async () => { const result = await Promise.allSettled([consultarDepartamentosUsuarios(), consultarBarriosUsuarios()]); if (result[0].status === 'fulfilled') departments.value = array(result[0].value); if (result[1].status === 'fulfilled') neighborhoods.value = array(result[1].value) })
onBeforeUnmount(() => controller?.abort())
</script>

<style scoped>
.users-hero{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding:1.5rem;border-radius:1rem;background:linear-gradient(120deg,#0b568d,#168fc5);color:#fff;box-shadow:0 14px 34px rgba(12,88,141,.18)}.users-hero span,.filter-card small,.results-card small{font-size:.62rem;font-weight:800;letter-spacing:.08em}.users-hero h1{margin:.2rem 0;font-size:1.65rem}.users-hero p{margin:0;opacity:.82}.hero-icon{display:grid;place-items:center;width:68px;height:68px;border-radius:20px;background:#ffffff20;font-size:2rem}.filter-card,.results-card{overflow:hidden;border:1px solid #e0e8ef;border-radius:1rem;box-shadow:0 8px 26px rgba(27,65,98,.06)}.filter-card .card-header,.results-card .card-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;background:#fbfcfe}.filter-card .card-header small,.results-card .card-header small{color:#78899a}.result-count{display:grid;place-items:center;min-width:32px;height:32px;border-radius:10px;background:#e7f3fc;color:var(--bs-primary);font-weight:800}.empty-state{text-align:center;padding:4rem 1rem;color:#718096}.empty-state>i{font-size:3rem;color:#a6bfd2}.empty-state h3{margin:.7rem 0 .2rem;font-size:1.05rem}.table th{padding:.75rem 1rem;background:#f7f9fb;color:#718096;font-size:.65rem;text-transform:uppercase}.table td{padding:.8rem 1rem}.user-cell{display:flex;align-items:center;gap:.65rem;min-width:210px}.user-cell>span{display:grid;place-items:center;width:38px;height:38px;flex:none;border-radius:11px;background:#e6f3fc;color:var(--bs-primary);font-size:.72rem;font-weight:800}.user-cell strong,.user-cell small,.table-main,.table-sub{display:block}.user-cell small,.table-sub{color:#8290a0;font-size:.68rem}.profiles{display:block;max-width:190px;color:#536477;font-size:.72rem}.table-main{font-size:.74rem}.state-pill{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .55rem;border-radius:20px;font-size:.65rem;font-weight:700}.state-pill i{font-size:.4rem}.state-pill.active{background:#e8f8f0;color:#25865e}.state-pill.inactive{background:#f2f3f5;color:#7c8794}@media(max-width:575px){.users-hero{padding:1.2rem}.hero-icon{display:none}}
</style>
