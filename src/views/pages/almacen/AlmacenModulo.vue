<template>
  <main class="hh-page warehouse-page">
    <section class="warehouse-hero">
      <div class="hero-copy">
        <span>GESTIÓN DE SUMINISTROS</span>
        <h1>{{ config.title }}</h1>
        <p>{{ config.description }}</p>
      </div>
      <div class="hero-actions">
        <button v-if="section === 'warehouses'" class="btn btn-light text-primary" @click="openWarehouse">
          <i class="ph ph-plus me-1"></i>Nuevo almacén
        </button>
        <button class="btn btn-outline-light" :disabled="loading" @click="load">
          <i class="ph ph-arrows-clockwise me-1"></i>Actualizar
        </button>
      </div>
    </section>

    <nav class="warehouse-nav">
      <router-link v-for="item in navigation" :key="item.path" :to="item.path" :class="{ active: section === item.section }">
        <span><i :class="item.icon"></i></span><div><strong>{{ item.label }}</strong><small>{{ item.help }}</small></div>
      </router-link>
    </nav>

    <section v-if="config.requiresWarehouse || config.requiresOrder || config.history" class="filter-panel">
      <div v-if="config.requiresWarehouse">
        <label class="form-label">Almacén</label>
        <select v-model="filters.id_almacen" class="form-select" @change="load">
          <option value="">Seleccione un almacén</option>
          <option v-for="item in warehouses" :key="id(item)" :value="id(item)">{{ name(item) }}</option>
        </select>
      </div>
      <div v-if="section === 'transfers'">
        <label class="form-label">Almacén destino</label>
        <select v-model="filters.id_almacen_destino" class="form-select">
          <option value="">Seleccione destino</option>
          <option v-for="item in destinationWarehouses" :key="id(item)" :value="id(item)">{{ name(item) }}</option>
        </select>
      </div>
      <div v-if="config.requiresOrder">
        <label class="form-label">Orden de trabajo</label>
        <input v-model.trim="filters.order" type="number" min="1" class="form-control" placeholder="Número de orden" @keyup.enter="load">
      </div>
      <template v-if="config.history">
        <div><label class="form-label">Desde</label><input v-model="filters.desde" type="date" class="form-control"></div>
        <div><label class="form-label">Hasta</label><input v-model="filters.hasta" type="date" class="form-control"></div>
      </template>
      <button class="btn btn-primary align-self-end" :disabled="loading || !canSearch" @click="load">
        <i class="ph ph-magnifying-glass me-1"></i>Consultar
      </button>
    </section>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <section class="metrics">
      <article><span class="blue"><i class="ph ph-package"></i></span><div><small>Registros visibles</small><strong>{{ visibleRows.length }}</strong></div></article>
      <article><span class="green"><i class="ph ph-check-circle"></i></span><div><small>Disponibles</small><strong>{{ availableCount }}</strong></div></article>
      <article><span class="amber"><i class="ph ph-warning"></i></span><div><small>Requieren atención</small><strong>{{ alertCount }}</strong></div></article>
      <article><span class="purple"><i class="ph ph-buildings"></i></span><div><small>Almacenes</small><strong>{{ warehouses.length }}</strong></div></article>
    </section>

    <section class="warehouse-content">
      <header>
        <div><small>OPERACIÓN DE ALMACÉN</small><h2>{{ config.listTitle }}</h2><p>{{ config.listHelp }}</p></div>
        <label class="local-search"><i class="ph ph-magnifying-glass"></i><input v-model="search" placeholder="Filtrar resultados"><span>{{ visibleRows.length }}</span></label>
      </header>

      <div v-if="loading" class="loading-state"><span class="spinner-border text-primary"></span><p>Consultando información de almacén…</p></div>
      <div v-else-if="!hasSearched && (config.requiresWarehouse || config.requiresOrder)" class="empty-state">
        <i :class="config.icon"></i><h3>Seleccione los filtros</h3><p>{{ config.emptyBefore }}</p>
      </div>
      <div v-else-if="!visibleRows.length" class="empty-state">
        <i class="ph ph-package"></i><h3>Sin registros</h3><p>No se encontró información para los criterios seleccionados.</p>
      </div>

      <template v-else-if="section === 'warehouses'">
        <div class="warehouse-grid">
          <article v-for="item in visibleRows" :key="id(item)" @click="showDetail(item)">
            <header><span><i class="ph ph-warehouse"></i></span><em :class="{ active: isActive(item) }">{{ status(item) }}</em></header>
            <h3>{{ name(item) }}</h3>
            <p>{{ item.departamento || item.ubicacion || 'Ubicación no informada' }}</p>
            <footer><span><i class="ph ph-package"></i>{{ item.numero_items ?? item.items_count ?? 'Inventario disponible' }}</span><i class="ph ph-arrow-right"></i></footer>
          </article>
        </div>
      </template>

      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead><tr><th v-for="column in columns" :key="column.key">{{ column.label }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(row, index) in visibleRows" :key="id(row) || index">
              <td v-for="column in columns" :key="column.key">
                <template v-if="column.key === 'estado'"><span class="status-pill" :class="{ active: isActive(row), warning: isWarning(row) }"><i class="ph ph-circle-fill"></i>{{ cell(row, column) }}</span></template>
                <template v-else><strong v-if="column.primary">{{ cell(row, column) }}</strong><span v-else>{{ cell(row, column) }}</span></template>
              </td>
              <td class="text-end"><button class="btn btn-sm btn-outline-primary" @click="showDetail(row)">Ver detalle</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="modal" class="warehouse-layer" @mousedown.self="closeModal">
        <section class="warehouse-modal" role="dialog" aria-modal="true">
          <header><div><small>MÓDULO DE ALMACÉN</small><h3>{{ modal === 'create' ? 'Crear almacén' : 'Información del registro' }}</h3></div><button class="btn-close" :disabled="saving" @click="closeModal"></button></header>
          <form v-if="modal === 'create'" @submit.prevent="saveWarehouse">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
              <label class="form-label">Nombre del almacén *</label><input v-model.trim="warehouseForm.nombre" class="form-control" maxlength="255" required placeholder="Ej. Almacén central">
              <label class="form-label mt-3">ID de ubicación/departamento *</label><input v-model.number="warehouseForm.id_departamento" type="number" min="1" class="form-control" required>
              <label class="switch-row mt-3"><span><strong>Almacén transitorio</strong><small>Utilizado para movimientos temporales de inventario.</small></span><input v-model="warehouseForm.transitorio" type="checkbox" class="form-check-input"></label>
            </div>
            <footer><button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancelar</button><button class="btn btn-primary" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Crear almacén</button></footer>
          </form>
          <template v-else>
            <div class="modal-body detail-list"><div v-for="entry in detailEntries" :key="entry[0]"><small>{{ label(entry[0]) }}</small><strong>{{ format(entry[1]) }}</strong></div></div>
            <footer><button class="btn btn-outline-secondary" @click="closeModal">Cerrar</button></footer>
          </template>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import * as warehouseApi from '@/services/almacen'

const route = useRoute()
const loading = ref(false), saving = ref(false), error = ref(''), modalError = ref(''), search = ref('')
const rows = ref([]), warehouses = ref([]), hasSearched = ref(false), modal = ref(null), selected = ref(null)
const today = new Date().toISOString().slice(0, 10)
const filters = reactive({ id_almacen: '', id_almacen_destino: '', order: '', desde: today, hasta: today })
const warehouseForm = reactive({ nombre: '', id_departamento: '', transitorio: false })
const section = computed(() => route.meta.warehouseSection || 'warehouses')

const configs = {
  warehouses: { title:'Parametrización de almacenes', description:'Administre las ubicaciones responsables del inventario institucional.', listTitle:'Almacenes configurados', listHelp:'Seleccione un almacén para consultar su información.', icon:'ph ph-warehouse' },
  requests: { title:'Solicitudes de almacén', description:'Priorice solicitudes clínicas y consulte su contexto asistencial.', listTitle:'Solicitudes pendientes y gestionadas', listHelp:'Bandeja central de requerimientos enviados al almacén.', icon:'ph ph-clipboard-text' },
  inventory: { title:'Inventario disponible', description:'Consulte existencias, lotes, vencimientos y costos por almacén.', listTitle:'Existencias del almacén', listHelp:'Medicamentos e insumos disponibles.', icon:'ph ph-package', requiresWarehouse:true, emptyBefore:'Seleccione un almacén para consultar sus existencias.' },
  transfers: { title:'Traslados entre almacenes', description:'Prepare movimientos controlados entre ubicaciones de inventario.', listTitle:'Inventario disponible para traslado', listHelp:'Seleccione origen y destino para preparar el movimiento.', icon:'ph ph-arrows-left-right', requiresWarehouse:true, emptyBefore:'Seleccione el almacén de origen.' },
  writeoffs: { title:'Baja de inventario', description:'Identifique elementos candidatos a baja y conserve su trazabilidad.', listTitle:'Elementos disponibles para baja', listHelp:'Revise lote, vencimiento y existencias antes de gestionar la baja.', icon:'ph ph-arrow-circle-down', requiresWarehouse:true, emptyBefore:'Seleccione un almacén para consultar los elementos.' },
  returns: { title:'Devoluciones', description:'Consulte despachos por orden de trabajo y gestione devoluciones.', listTitle:'Despachos de la orden', listHelp:'Resultados disponibles para devolución.', icon:'ph ph-arrow-u-up-left', requiresOrder:true, emptyBefore:'Ingrese una orden de trabajo para consultar sus despachos.' },
  consumption: { title:'Consumo interno', description:'Consulte inventario para registrar consumos institucionales.', listTitle:'Elementos disponibles para consumo', listHelp:'Existencias del almacén seleccionado.', icon:'ph ph-handbag', requiresWarehouse:true, emptyBefore:'Seleccione un almacén de origen.' },
  deliveries: { title:'Entregas locales', description:'Realice seguimiento a las solicitudes preparadas para entrega.', listTitle:'Entregas pendientes y realizadas', listHelp:'Bandeja operativa de entregas del almacén.', icon:'ph ph-truck' },
  purchases: { title:'Compras y abastecimiento', description:'Consulte órdenes de compra, proveedores y recepción de suministros.', listTitle:'Órdenes de compra', listHelp:'Seguimiento administrativo del abastecimiento institucional.', icon:'ph ph-shopping-cart' },
  close: { title:'Cierre de inventario', description:'Revise la fotografía histórica y variaciones del inventario.', listTitle:'Histórico de inventario', listHelp:'Movimientos consolidados dentro del período.', icon:'ph ph-calendar-check', requiresWarehouse:true, history:true, emptyBefore:'Seleccione almacén y período para consultar el cierre.' },
}
const config = computed(() => configs[section.value] || configs.warehouses)
const navigation = [
  {section:'warehouses',path:'/almacen-parametrizacion',label:'Almacenes',help:'Configuración',icon:'ph ph-warehouse'},
  {section:'requests',path:'/solicitudes-almacen',label:'Solicitudes',help:'Despachos clínicos',icon:'ph ph-clipboard-text'},
  {section:'inventory',path:'/inventario-almacen',label:'Inventario',help:'Existencias y lotes',icon:'ph ph-package'},
  {section:'transfers',path:'/traslados-almacen',label:'Traslados',help:'Entre almacenes',icon:'ph ph-arrows-left-right'},
  {section:'writeoffs',path:'/baja-inventario-almacen',label:'Bajas',help:'Retiro de existencias',icon:'ph ph-arrow-circle-down'},
  {section:'returns',path:'/devoluciones-almacen',label:'Devoluciones',help:'Por orden',icon:'ph ph-arrow-u-up-left'},
  {section:'consumption',path:'/consumo-interno-almacen',label:'Consumo',help:'Uso institucional',icon:'ph ph-handbag'},
  {section:'deliveries',path:'/entregas-locales-almacen',label:'Entregas',help:'Seguimiento local',icon:'ph ph-truck'},
  {section:'purchases',path:'/almacen-compras',label:'Compras',help:'Abastecimiento',icon:'ph ph-shopping-cart'},
  {section:'close',path:'/almacen-cierre',label:'Cierre',help:'Histórico',icon:'ph ph-calendar-check'},
]
const columnSets = {
  requests:[{key:'id',label:'Solicitud',primary:true},{key:'paciente',label:'Paciente',primary:true},{key:'id_orden_trabajo',label:'Orden'},{key:'paquete',label:'Paquete'},{key:'usuario',label:'Solicitó'},{key:'estado',label:'Estado'}],
  inventory:[{key:'comercial',label:'Producto',primary:true},{key:'generico',label:'Genérico'},{key:'lote',label:'Lote'},{key:'fecha_vencimiento',label:'Vencimiento'},{key:'kardex',label:'Existencia'},{key:'costo',label:'Costo'}],
  transfers:[{key:'comercial',label:'Producto',primary:true},{key:'generico',label:'Genérico'},{key:'lote',label:'Lote'},{key:'kardex',label:'Disponible'},{key:'almacen',label:'Origen'}],
  writeoffs:[{key:'comercial',label:'Producto',primary:true},{key:'generico',label:'Genérico'},{key:'lote',label:'Lote'},{key:'fecha_vencimiento',label:'Vencimiento'},{key:'kardex',label:'Disponible'}],
  returns:[{key:'id',label:'Despacho',primary:true},{key:'fecha',label:'Fecha'},{key:'almacen',label:'Almacén'},{key:'usuario',label:'Responsable'},{key:'estado',label:'Estado'}],
  consumption:[{key:'comercial',label:'Producto',primary:true},{key:'generico',label:'Genérico'},{key:'lote',label:'Lote'},{key:'kardex',label:'Disponible'},{key:'costo',label:'Costo'}],
  deliveries:[{key:'id',label:'Entrega',primary:true},{key:'paciente',label:'Paciente'},{key:'id_orden_trabajo',label:'Orden'},{key:'fecha',label:'Fecha'},{key:'usuario',label:'Responsable'},{key:'estado',label:'Estado'}],
  purchases:[{key:'id',label:'Orden de compra',primary:true},{key:'proveedor',label:'Proveedor',primary:true},{key:'fecha',label:'Fecha'},{key:'total',label:'Total'},{key:'usuario',label:'Responsable'},{key:'estado',label:'Estado'}],
  close:[{key:'comercial',label:'Producto',primary:true},{key:'generico',label:'Genérico'},{key:'lote',label:'Lote'},{key:'kardex',label:'Existencia'},{key:'fecha',label:'Fecha'},{key:'movimiento',label:'Movimiento'}],
}
const columns = computed(() => columnSets[section.value] || [])
const flatten = value => {
  const source = value?.data ?? value
  if (Array.isArray(source)) return source
  if (!source || typeof source !== 'object') return []
  const groups = ['insumos','medicamentos','items','solicitudes','entregas','despachos','data']
  const result = groups.flatMap(key => Array.isArray(source[key]) ? source[key].map(row => ({...row,_group:key})) : [])
  return result.length ? result : []
}
const id = item => item?.id ?? item?.id_almacen ?? item?.id_kardex
const name = item => item?.nombre ?? item?.name ?? item?.almacen ?? `Almacén #${id(item)}`
const status = item => item?.estado ?? item?.status_name ?? (Number(item?.status) === 0 ? 'Inactivo' : 'Activo')
const isActive = item => /activ|dispon|entreg/i.test(String(status(item))) || Number(item?.status) === 1
const isWarning = item => /pend|venc|alert/i.test(String(status(item))) || Number(item?._alertsolicitudalmacen) > 0
const cell = (row, column) => {
  const value = row[column.key] ?? (column.key === 'estado' ? status(row) : null)
  if (column.key === 'id') return value ? `#${value}` : '—'
  if (column.key === 'id_orden_trabajo') return value ? `#${value}` : '—'
  if (column.key === 'costo' && value !== null && value !== undefined) return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value))
  return value ?? '—'
}
const visibleRows = computed(() => {
  const term = search.value.toLowerCase()
  return rows.value.filter(row => Object.values(row).join(' ').toLowerCase().includes(term))
})
const availableCount = computed(() => rows.value.filter(row => Number(row.kardex) > 0 || isActive(row)).length)
const alertCount = computed(() => rows.value.filter(row => isWarning(row) || (row.fecha_vencimiento && new Date(row.fecha_vencimiento) < new Date())).length)
const destinationWarehouses = computed(() => warehouses.value.filter(item => String(id(item)) !== String(filters.id_almacen)))
const canSearch = computed(() => (!config.value.requiresWarehouse || filters.id_almacen) && (!config.value.requiresOrder || filters.order))
const detailEntries = computed(() => Object.entries(selected.value || {}).filter(([,value]) => ['string','number','boolean'].includes(typeof value)).slice(0,18))
const label = key => String(key).replaceAll('_',' ').replace(/\b\w/g, char => char.toUpperCase())
const format = value => value === null || value === undefined || value === '' ? 'No informado' : String(value)

async function loadWarehouses() {
  warehouses.value = flatten(await warehouseApi.listarAlmacenes())
}
async function load() {
  if ((config.value.requiresWarehouse || config.value.requiresOrder) && !canSearch.value) return
  loading.value = true
  error.value = ''
  try {
    let response
    const warehouseId = Number(filters.id_almacen)
    if (section.value === 'warehouses') response = await warehouseApi.listarAlmacenes()
    if (section.value === 'requests') response = await warehouseApi.consultarSolicitudes({})
    if (['inventory','transfers','consumption'].includes(section.value)) response = await warehouseApi.consultarInventario({id_almacen:warehouseId})
    if (section.value === 'writeoffs') response = await warehouseApi.consultarItemsParaBaja(warehouseId)
    if (section.value === 'returns') response = await warehouseApi.consultarDevolucionesOrden(filters.order)
    if (section.value === 'deliveries') response = await warehouseApi.consultarEntregasLocales()
    if (section.value === 'purchases') response = await warehouseApi.consultarOrdenesCompra()
    if (section.value === 'close') response = await warehouseApi.consultarHistoricoInventario({id_almacen:warehouseId,desde:filters.desde,hasta:filters.hasta})
    rows.value = flatten(response)
    hasSearched.value = true
  } catch (reason) {
    rows.value = []
    error.value = obtenerMensajeError(reason)
  } finally {
    loading.value = false
  }
}
function showDetail(item) { selected.value = item; modal.value = 'detail' }
function openWarehouse() { Object.assign(warehouseForm,{nombre:'',id_departamento:'',transitorio:false}); modalError.value=''; modal.value='create' }
function closeModal() { if (!saving.value) modal.value = null }
async function saveWarehouse() {
  saving.value = true; modalError.value = ''
  try {
    await warehouseApi.crearAlmacen({...warehouseForm,id_departamento:Number(warehouseForm.id_departamento),transitorio:warehouseForm.transitorio ? 1 : 0})
    modal.value = null
    await Promise.all([loadWarehouses(),load()])
  } catch (reason) { modalError.value = obtenerMensajeError(reason) } finally { saving.value = false }
}
async function initialize() {
  try { await loadWarehouses() } catch {}
  if (!config.value.requiresWarehouse && !config.value.requiresOrder) await load()
}
watch(section, () => { rows.value=[];search.value='';hasSearched.value=false;error.value='';initialize() })
onMounted(initialize)
</script>

<style scoped>
.warehouse-hero{display:flex;align-items:center;justify-content:space-between;padding:1.45rem 1.55rem;border-radius:1rem;background:linear-gradient(120deg,#104d75,#168eae);color:#fff;box-shadow:0 14px 34px rgba(15,75,117,.18)}.hero-copy>span,.warehouse-content>header small,.warehouse-modal header small{font-size:.7rem;font-weight:800;letter-spacing:.08em}.warehouse-hero h1{margin:.2rem 0;font-size:1.65rem}.warehouse-hero p{margin:0;opacity:.82}.hero-actions{display:flex;gap:.55rem}.warehouse-nav{display:grid;grid-template-columns:repeat(9,minmax(105px,1fr));gap:.55rem;margin-top:1rem;overflow:auto;padding-bottom:.25rem}.warehouse-nav a{display:flex;align-items:center;gap:.5rem;min-width:120px;padding:.65rem;border:1px solid #dfe7ed;border-radius:.72rem;background:#fff;color:#536678}.warehouse-nav a.active{border-color:#68b1d7;background:#eef8fd;color:#176f9d;box-shadow:0 5px 16px rgba(33,111,154,.1)}.warehouse-nav a>span{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#edf5fa}.warehouse-nav strong,.warehouse-nav small{display:block}.warehouse-nav strong{font-size:.72rem}.warehouse-nav small{font-size:.62rem;color:#81909e}.filter-panel{display:flex;align-items:end;gap:.7rem;margin-top:1rem;padding:.9rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}.filter-panel>div{min-width:180px;flex:1}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;margin-top:1rem}.metrics article{display:flex;align-items:center;gap:.65rem;padding:.85rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}.metrics article>span{display:grid;place-items:center;width:39px;height:39px;border-radius:11px;font-size:1.05rem}.metrics small,.metrics strong{display:block}.metrics small{color:#798897;font-size:.69rem}.metrics strong{font-size:1.22rem}.blue{background:#e7f3fb;color:#267eae}.green{background:#e7f7ef;color:#25825d}.amber{background:#fff3df;color:#bb741e}.purple{background:#efedfc;color:#6d61cf}.warehouse-content{overflow:hidden;margin-top:1rem;border:1px solid #dfe7ed;border-radius:1rem;background:#fff;box-shadow:0 8px 25px rgba(28,65,93,.05)}.warehouse-content>header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.15rem;border-bottom:1px solid #e4eaee;background:#fbfcfd}.warehouse-content h2{margin:.1rem 0;font-size:1.05rem}.warehouse-content header p{margin:0;color:#788898;font-size:.73rem}.local-search{display:flex;align-items:center;gap:.4rem;padding:.4rem .55rem;border:1px solid #d9e2e8;border-radius:.65rem;background:#fff}.local-search input{width:190px;border:0;outline:0}.local-search span{display:grid;place-items:center;min-width:24px;height:24px;border-radius:8px;background:#edf5fa;color:#287ba7;font-size:.68rem}.loading-state,.empty-state{display:grid;place-items:center;padding:3.5rem;text-align:center;color:#728394}.loading-state p,.empty-state p{margin:.5rem 0 0}.empty-state>i{font-size:2.5rem;color:#9db9c9}.empty-state h3{margin:.6rem 0 0;font-size:1rem}.warehouse-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;padding:1rem}.warehouse-grid>article{padding:1rem;border:1px solid #e0e7ec;border-radius:.8rem;cursor:pointer;transition:.2s}.warehouse-grid>article:hover{transform:translateY(-2px);border-color:#82bddc;box-shadow:0 8px 22px rgba(28,82,116,.09)}.warehouse-grid article>header,.warehouse-grid article>footer{display:flex;align-items:center;justify-content:space-between}.warehouse-grid header>span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#e9f5fb;color:#247da9;font-size:1.15rem}.warehouse-grid em{padding:.25rem .5rem;border-radius:20px;background:#eef1f3;color:#687887;font-size:.65rem;font-style:normal}.warehouse-grid em.active{background:#e7f7ef;color:#25815d}.warehouse-grid h3{margin:.8rem 0 .15rem;font-size:.9rem}.warehouse-grid p{color:#7b8a98;font-size:.72rem}.warehouse-grid footer{padding-top:.7rem;border-top:1px solid #e8edf0;color:#637587;font-size:.7rem}.table th{padding:.75rem 1rem;background:#f8fafb;color:#778694;font-size:.68rem;text-transform:uppercase}.table td{padding:.85rem 1rem;color:#526477;font-size:.75rem}.status-pill{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .55rem;border-radius:20px;background:#eef1f3;color:#647483}.status-pill.active{background:#e6f7ee;color:#237f59}.status-pill.warning{background:#fff2dc;color:#ad6b19}.status-pill i{font-size:.45rem}.warehouse-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:#071522b8;backdrop-filter:blur(5px)}.warehouse-modal{width:min(590px,100%);max-height:92vh;overflow:auto;border-radius:1rem;background:#fff;box-shadow:0 28px 80px #0005}.warehouse-modal>header{display:flex;justify-content:space-between;padding:1.05rem 1.2rem;border-bottom:1px solid #e3e9ee}.warehouse-modal h3{margin:.1rem 0;font-size:1.05rem}.warehouse-modal .modal-body{padding:1.2rem}.warehouse-modal footer{display:flex;justify-content:flex-end;gap:.5rem;padding:1rem 1.2rem;border-top:1px solid #e3e9ee}.switch-row{display:flex;align-items:center;justify-content:space-between;padding:.75rem;border:1px solid #e0e7ec;border-radius:.7rem}.switch-row strong,.switch-row small{display:block}.switch-row small{color:#7d8c99;font-size:.68rem}.detail-list{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem}.detail-list>div{padding:.7rem;border:1px solid #e2e8ed;border-radius:.65rem}.detail-list small,.detail-list strong{display:block}.detail-list small{color:#81909d;font-size:.65rem}.detail-list strong{overflow-wrap:anywhere;font-size:.76rem}@media(max-width:1000px){.warehouse-nav{grid-template-columns:repeat(9,125px)}.warehouse-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.warehouse-hero,.warehouse-content>header,.filter-panel{align-items:flex-start;flex-direction:column}.hero-actions,.local-search{width:100%}.metrics,.warehouse-grid{grid-template-columns:1fr}.filter-panel>div{width:100%}.detail-list{grid-template-columns:1fr}}
</style>
<style scoped>
.warehouse-nav { grid-template-columns: repeat(10, minmax(105px, 1fr)); }
@media (max-width: 1000px) {
  .warehouse-nav { grid-template-columns: repeat(10, 125px); }
}
</style>
