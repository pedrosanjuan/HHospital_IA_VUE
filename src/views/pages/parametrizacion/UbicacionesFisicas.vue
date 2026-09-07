<template>
  <main class="container-fluid hh-page locations-page" aria-labelledby="locations-title">
    <section class="hh-page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <span class="hh-eyebrow">Configuración hospitalaria</span>
        <h1 id="locations-title" class="mb-1">Ubicaciones físicas</h1>
        <p class="mb-0 opacity-75">Administra la estructura, capacidad y estaciones de cada sede.</p>
      </div>
      <button class="btn btn-light" :disabled="refreshing" @click="refresh">
        <i class="ph ph-arrows-clockwise me-2" :class="{ 'spin': refreshing }"></i>Actualizar
      </button>
    </section>

    <nav class="location-tabs mb-4" aria-label="Secciones de parametrización">
      <button v-for="item in tabs" :key="item.id" class="location-tab" :class="{ active: tab === item.id }" @click="tab = item.id">
        <i :class="item.icon"></i><span>{{ item.label }}</span>
      </button>
    </nav>

    <div v-if="notice.text" class="alert" :class="`alert-${notice.type}`" role="status">
      {{ notice.text }}
      <button type="button" class="btn-close float-end" aria-label="Cerrar" @click="notice.text = ''"></button>
    </div>

    <section v-if="tab === 'structure'" class="row g-4">
      <div class="col-xl-5">
        <div class="card h-100">
          <div class="card-header bg-transparent d-flex align-items-center justify-content-between">
            <div><h2 class="h5 mb-1">Estructura física</h2><small class="text-muted">Selecciona un elemento para ver su detalle</small></div>
            <button class="btn btn-primary btn-sm" @click="openCreate('sucursales')"><i class="ph ph-plus me-1"></i>Nueva sede</button>
          </div>
          <div class="card-body location-tree" :aria-busy="initialLoading">
            <div v-if="initialLoading" class="text-center py-5"><span class="spinner-border text-primary"></span><p class="text-muted mt-3">Cargando estructura…</p></div>
            <div v-else-if="!store.sucursales.length" class="empty-state"><i class="ph ph-buildings"></i><h3 class="h6">Aún no hay sedes</h3><p>Comienza creando la primera sucursal del hospital.</p></div>
            <template v-else>
              <div class="tree-toolbar mb-3">
                <div><i class="ph ph-git-branch"></i><span><strong>Mapa de ubicaciones</strong><small>{{ store.sucursales.length }} {{ store.sucursales.length === 1 ? 'sede registrada' : 'sedes registradas' }}</small></span></div>
                <label class="form-check form-switch"><input v-model="showInactive" class="form-check-input" type="checkbox"> <span class="form-check-label">Inactivos</span></label>
              </div>
              <ul class="tree-root">
                <TreeNode v-for="node in tree" :key="node.key" :node="node" :selected-key="selected?.key" @select="selectNode" @create="openCreate" />
              </ul>
            </template>
          </div>
          <div v-if="loadErrors.length" class="card-footer bg-transparent">
            <div class="small text-danger mb-2">Algunos niveles no pudieron cargarse.</div>
            <button class="btn btn-outline-danger btn-sm" @click="retryFailed">Reintentar pendientes</button>
          </div>
        </div>
      </div>

      <div class="col-xl-7">
        <div v-if="selected" class="card location-detail">
          <div class="card-header bg-transparent d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div class="d-flex align-items-center gap-3">
              <span class="detail-icon"><i :class="selected.icon"></i></span>
              <div><span class="text-uppercase small text-primary fw-semibold">{{ resourceConfig[selected.resource].singular }}</span><h2 class="h4 mb-0">{{ selected.name }}</h2></div>
            </div>
            <div class="d-flex gap-2">
              <button v-if="selected.childResource" class="btn btn-primary btn-sm" @click="openCreate(selected.childResource, selected)"><i class="ph ph-plus me-1"></i>Crear {{ resourceConfig[selected.childResource].singular.toLowerCase() }}</button>
              <button class="btn btn-outline-primary btn-sm" @click="openEdit(selected)"><i class="ph ph-pencil-simple"></i><span class="visually-hidden">Editar</span></button>
              <button v-if="resourceConfig[selected.resource].deletable" class="btn btn-outline-danger btn-sm" @click="askDelete(selected)"><i class="ph ph-trash"></i><span class="visually-hidden">Eliminar</span></button>
            </div>
          </div>
          <div class="card-body">
            <nav v-if="breadcrumbs.length > 1" class="breadcrumb-location mb-4" aria-label="Ubicación">
              <button v-for="(crumb, index) in breadcrumbs" :key="crumb.key" @click="selectNode(crumb)">{{ crumb.name }}<i v-if="index < breadcrumbs.length - 1" class="ph ph-caret-right"></i></button>
            </nav>
            <div class="row g-3 mb-4">
              <div class="col-sm-4"><div class="metric"><span>Estado</span><strong :class="isActive(selected.raw) ? 'text-success' : 'text-secondary'">{{ isActive(selected.raw) ? 'Activo' : 'Inactivo' }}</strong></div></div>
              <div class="col-sm-4"><div class="metric"><span>Elementos creados</span><strong>{{ selected.children.length }}</strong></div></div>
              <div v-if="capacity(selected) !== null" class="col-sm-4"><div class="metric"><span>Capacidad configurada</span><strong>{{ capacity(selected) }}</strong></div></div>
            </div>
            <h3 class="h6 mb-3">Datos principales</h3>
            <dl class="row detail-list mb-4">
              <template v-for="item in details(selected)" :key="item.label"><dt class="col-sm-5">{{ item.label }}</dt><dd class="col-sm-7">{{ item.value || '—' }}</dd></template>
            </dl>
            <div class="d-flex justify-content-between align-items-center"><h3 class="h6 mb-0">{{ selected.childResource ? resourceConfig[selected.childResource].label : 'Nivel final' }}</h3><span class="badge bg-primary-subtle text-primary">{{ selected.children.length }} creados</span></div>
            <div v-if="selected.children.length" class="children-grid mt-3"><button v-for="child in selected.children" :key="child.key" @click="selectNode(child)"><i :class="child.icon"></i><span>{{ child.name }}</span><i class="ph ph-caret-right ms-auto"></i></button></div>
            <p v-else class="text-muted small mt-3 mb-0">No hay elementos creados en este nivel.</p>
          </div>
        </div>
        <div v-else class="card empty-detail"><i class="ph ph-tree-structure"></i><h2 class="h5">Explora la estructura hospitalaria</h2><p>Selecciona un nodo del árbol para consultar sus datos y administrar sus niveles inferiores.</p></div>
      </div>
    </section>

    <ResourceGrid v-else :title="tab === 'stations' ? 'Estaciones de enfermería' : 'Tipos y estados'" :resources="tabResources" :config="resourceConfig" @create="openCreate" @edit="openEditRaw" @remove="askDeleteRaw" />

    <div v-if="dialog.open" class="modal-backdrop-custom" role="presentation" @mousedown.self="closeDialog">
      <section class="location-modal" role="dialog" aria-modal="true" :aria-labelledby="'form-title'">
        <header><div><span class="hh-eyebrow">{{ dialog.id ? 'Editar registro' : 'Nuevo registro' }}</span><h2 id="form-title" class="h4 mb-0">{{ resourceConfig[dialog.resource].singular }}</h2></div><button class="btn-close" :disabled="saving" aria-label="Cerrar" @click="closeDialog"></button></header>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div v-if="dialog.parent" class="parent-context"><i class="ph ph-map-pin"></i><div><small>Se creará dentro de</small><strong>{{ dialog.parent.name }}</strong></div></div>
            <div class="row g-3">
              <div v-for="field in currentFields" :key="field.key" :class="field.col || 'col-12'">
                <label class="form-label" :for="`field-${field.key}`">{{ field.label }} <span v-if="field.required" class="text-danger">*</span></label>
                <select v-if="field.type === 'select'" :id="`field-${field.key}`" v-model="form[field.key]" class="form-select" :class="{ 'is-invalid': errors[field.key] }" @change="field.key === 'id_departamento' && departmentChanged()">
                  <option value="">Selecciona una opción</option><option v-for="option in optionsFor(field)" :key="option.id" :value="option.id">{{ optionName(option) }}</option>
                </select>
                <div v-else-if="field.type === 'switch'" class="form-check form-switch pt-2"><input :id="`field-${field.key}`" v-model="form[field.key]" class="form-check-input" type="checkbox"><label class="form-check-label" :for="`field-${field.key}`">{{ form[field.key] ? 'Activo' : 'Inactivo' }}</label></div>
                <input v-else :id="`field-${field.key}`" v-model="form[field.key]" class="form-control" :class="{ 'is-invalid': errors[field.key] }" :type="field.type || 'text'" :min="field.min" :maxlength="field.maxlength" :placeholder="field.placeholder">
                <div v-if="errors[field.key]" class="invalid-feedback">{{ errors[field.key][0] || errors[field.key] }}</div>
                <small v-if="field.help" class="form-text text-muted">{{ field.help }}</small>
              </div>
            </div>
            <div v-if="formError" class="alert alert-danger mt-3 mb-0">{{ formError }}</div>
          </div>
          <footer><button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="closeDialog">Cancelar</button><button class="btn btn-primary" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>{{ saving ? 'Guardando…' : 'Guardar cambios' }}</button></footer>
        </form>
      </section>
    </div>

    <div v-if="deleteDialog.open" class="modal-backdrop-custom" role="presentation" @mousedown.self="deleteDialog.open = false"><section class="location-modal compact" role="alertdialog" aria-modal="true"><div class="modal-body text-center"><span class="delete-icon"><i class="ph ph-warning"></i></span><h2 class="h5">Confirmar eliminación</h2><p>{{ deleteMessage }}</p><div class="alert alert-warning small text-start">Esta acción no elimina elementos relacionados en cascada. Si existen dependencias, el servidor impedirá la operación.</div></div><footer><button class="btn btn-outline-secondary" :disabled="deleting" @click="deleteDialog.open = false">Cancelar</button><button class="btn btn-danger" :disabled="deleting" @click="confirmDelete">{{ deleting ? 'Eliminando…' : 'Sí, eliminar' }}</button></footer></section></div>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { listarDepartamentos, listarMunicipios, listarPaises } from '@/services/hospitalizacion'
import { CATALOGS, RESOURCES, useLocationsStore } from '@/store/pinia/ubicaciones'

const store = useLocationsStore()
const tab = ref('structure'), selected = ref(null), showInactive = ref(false), refreshing = ref(false), saving = ref(false), deleting = ref(false)
const notice = reactive({ text: '', type: 'success' }), errors = ref({}), formError = ref(''), form = reactive({})
const geography = reactive({ paises: [], departamentos: [], municipios: [] })
const dialog = reactive({ open: false, resource: 'sucursales', id: null, parent: null })
const deleteDialog = reactive({ open: false, resource: null, id: null, name: '', node: null })
const tabs = [{ id: 'structure', label: 'Estructura física', icon: 'ph ph-tree-structure' }, { id: 'stations', label: 'Estaciones de enfermería', icon: 'ph ph-nurse' }, { id: 'catalogs', label: 'Tipos y estados', icon: 'ph ph-sliders-horizontal' }]

const resourceConfig = {
  sucursales: { label: 'Sucursales', singular: 'Sucursal', icon: 'ph ph-buildings', deletable: true },
  torres: { label: 'Torres', singular: 'Torre', icon: 'ph ph-building-apartment', deletable: false },
  pisos: { label: 'Pisos', singular: 'Piso', icon: 'ph ph-stack', deletable: true },
  estaciones: { label: 'Estaciones', singular: 'Estación de enfermería', icon: 'ph ph-nurse', deletable: true },
  salas: { label: 'Salas', singular: 'Sala', icon: 'ph ph-first-aid-kit', deletable: true },
  habitaciones: { label: 'Habitaciones', singular: 'Habitación', icon: 'ph ph-door', deletable: true },
  camas: { label: 'Camas', singular: 'Cama', icon: 'ph ph-bed', deletable: true },
  tiposPiso: { label: 'Tipos de piso', singular: 'Tipo de piso', icon: 'ph ph-stack', deletable: false },
  tiposSala: { label: 'Tipos de sala', singular: 'Tipo de sala', icon: 'ph ph-tag', deletable: false },
  tiposHabitacion: { label: 'Tipos de habitación', singular: 'Tipo de habitación', icon: 'ph ph-tag', deletable: false },
  estadosUso: { label: 'Estados de uso', singular: 'Estado de uso', icon: 'ph ph-toggle-right', deletable: false },
}
const fields = {
  sucursales: [{ key: 'nombre', label: 'Nombre', required: true, maxlength: 180 }, { key: 'telefono', label: 'Teléfono', required: true, maxlength: 10, col: 'col-md-6' }, { key: 'direccion', label: 'Dirección', required: true, maxlength: 255 }, { key: 'id_departamento', label: 'Departamento', type: 'select', source: 'departamentos', required: true, col: 'col-md-6' }, { key: 'id_municipio', label: 'Municipio', type: 'select', source: 'municipios', required: true, col: 'col-md-6' }, { key: 'status', label: 'Estado', type: 'switch' }],
  torres: [{ key: 'nombre', label: 'Nombre', required: true }, { key: 'cant_pisos', label: 'Capacidad configurada de pisos', type: 'number', min: 1, required: true }, { key: 'sucursal_id', label: 'Sucursal', type: 'select', source: 'sucursales', required: true }, { key: 'status', label: 'Estado', type: 'switch' }],
  pisos: [{ key: 'nombre', label: 'Nombre', required: true, maxlength: 255 }, { key: 'cant_salas', label: 'Capacidad configurada de salas', type: 'number', min: 0, required: true }, { key: 'torre_id', label: 'Torre', type: 'select', source: 'torres', required: true }, { key: 'status', label: 'Estado', type: 'switch' }],
  estaciones: [{ key: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej. Estación norte' }],
  salas: [{ key: 'nombre', label: 'Nombre', required: true }, { key: 'cant_habitacion', label: 'Capacidad configurada de habitaciones', type: 'number', min: 0, required: true }, { key: 'piso_id', label: 'Piso', type: 'select', source: 'pisos', required: true }, { key: 'estacion_id', label: 'Estación de enfermería', type: 'select', source: 'estaciones', required: true }, { key: 'tipo_sala_id', label: 'Tipo de sala', type: 'select', source: 'tiposSala', required: true }],
  habitaciones: [{ key: 'nombre', label: 'Nombre', required: true }, { key: 'cant_camas', label: 'Capacidad configurada de camas', type: 'number', min: 0, required: true }, { key: 'sala_id', label: 'Sala', type: 'select', source: 'salas', required: true }, { key: 'estado_uso_id', label: 'Estado de uso', type: 'select', source: 'estadosUso', required: true }, { key: 'tipo_habitacion_id', label: 'Tipo de habitación', type: 'select', source: 'tiposHabitacion', required: true }],
  camas: [{ key: 'nombre', label: 'Nombre', required: true, maxlength: 255 }, { key: 'habitacion_id', label: 'Habitación', type: 'select', source: 'habitaciones', required: true }, { key: 'estado_uso_id', label: 'Estado de uso', type: 'select', source: 'estadosUso', required: true }, { key: 'reserva_tipo', label: 'Tipo de reserva', type: 'number', min: 0, required: true, help: 'Valor numérico definido por la operación hospitalaria.' }],
  tiposPiso: [{ key: 'nombre', label: 'Nombre', required: true }], tiposSala: [{ key: 'nombre', label: 'Nombre', required: true }], tiposHabitacion: [{ key: 'nombre', label: 'Nombre', required: true }], estadosUso: [{ key: 'nombre', label: 'Nombre', required: true }],
}
const relation = { sucursales: ['torres', 'sucursal_id'], torres: ['pisos', 'torre_id'], pisos: ['salas', 'piso_id'], salas: ['habitaciones', 'sala_id'], habitaciones: ['camas', 'habitacion_id'] }
const nameOf = (raw, resource) => raw.nombre || raw[`nombre_${resource === 'salas' ? 'sala' : resource === 'habitaciones' ? 'habitacion' : 'cama'}`] || `Registro ${raw.id}`
const isActive = raw => !('status' in raw || 'estado' in raw) || Boolean(Number(raw.status ?? raw.estado))
const makeNode = (raw, resource, parent = null) => {
  const next = relation[resource]
  const children = next ? store[next[0]].filter(item => String(item[next[1]]) === String(raw.id)).filter(item => showInactive.value || isActive(item)).map(item => makeNode(item, next[0])) : []
  const node = { key: `${resource}-${raw.id}`, id: raw.id, resource, raw, name: nameOf(raw, resource), icon: resourceConfig[resource].icon, children, childResource: next?.[0] || null, parent }
  children.forEach(child => child.parent = node)
  return node
}
const tree = computed(() => store.sucursales.filter(item => showInactive.value || isActive(item)).map(item => makeNode(item, 'sucursales')))
const findNode = (nodes, key) => { for (const node of nodes) { if (node.key === key) return node; const found = findNode(node.children, key); if (found) return found } return null }
const initialLoading = computed(() => !store.loaded && Object.values(store.loadingByResource).some(Boolean))
const loadErrors = computed(() => Object.entries(store.errorByResource).filter(([, value]) => value))
const breadcrumbs = computed(() => { const result = []; let node = selected.value; while (node) { result.unshift(node); node = node.parent } return result })
const tabResources = computed(() => (tab.value === 'stations' ? ['estaciones'] : CATALOGS).map(key => ({ key, items: store[key], loading: store.loadingByResource[key], error: store.errorByResource[key] })))
const currentFields = computed(() => fields[dialog.resource] || [])
const deleteMessage = computed(() => `¿Desea eliminar ${resourceConfig[deleteDialog.resource]?.singular.toLowerCase()} “${deleteDialog.name}”? Esta acción puede afectar sus elementos asociados.`)
const capacity = node => ({ torres: node.raw.cant_pisos, pisos: node.raw.cant_salas, salas: node.raw.cant_habitacion, habitaciones: node.raw.cant_camas }[node.resource] ?? null)
const details = node => Object.entries(node.raw).filter(([key]) => !['id', 'status', 'estado'].includes(key) && !key.endsWith('_id')).slice(0, 8).map(([key, value]) => ({ label: key.replaceAll('_', ' ').replace(/^./, char => char.toUpperCase()), value }))
const optionName = item => item.nombre || item.name || item.descripcion || `Registro ${item.id}`
const optionsFor = field => field.source === 'departamentos' || field.source === 'municipios' ? geography[field.source] : store[field.source] || []

function selectNode(node) { selected.value = findNode(tree.value, node.key) || node }
function parentValue(resource, parent) { return ({ torres: ['sucursal_id', parent?.id], pisos: ['torre_id', parent?.id], salas: ['piso_id', parent?.id], habitaciones: ['sala_id', parent?.id], camas: ['habitacion_id', parent?.id] })[resource] }
async function openCreate(resource, parent = null) {
  Object.keys(form).forEach(key => delete form[key]); Object.assign(form, { status: true })
  const value = parentValue(resource, parent); if (value) form[value[0]] = value[1]
  dialog.resource = resource; dialog.id = null; dialog.parent = parent; errors.value = {}; formError.value = ''; dialog.open = true
  if (resource === 'sucursales' && !geography.departamentos.length) await loadGeography()
}
async function openEdit(node) { return openEditRaw(node.resource, node.raw, node) }
async function openEditRaw(resource, raw, node = null) {
  Object.keys(form).forEach(key => delete form[key]); for (const field of fields[resource]) form[field.key] = raw[field.key] ?? (field.key === 'nombre' ? nameOf(raw, resource) : '')
  if ('status' in form) form.status = isActive(raw)
  dialog.resource = resource; dialog.id = raw.id; dialog.parent = node?.parent || null; errors.value = {}; formError.value = ''; dialog.open = true
  if (resource === 'sucursales') { await loadGeography(); if (form.id_departamento) geography.municipios = normalize(await listarMunicipios(form.id_departamento)) }
}
function closeDialog() { if (!saving.value) dialog.open = false }
function normalize(response) { return Array.isArray(response) ? response : response?.data || [] }
async function loadGeography() { try { geography.paises = normalize(await listarPaises()); const country = geography.paises.find(item => Number(item.id) === 47) || geography.paises[0]; if (country) geography.departamentos = normalize(await listarDepartamentos(country.id)) } catch { /* Los selects conservan el estado y el guardado mostrará el error correspondiente. */ } }
async function departmentChanged() { form.id_municipio = ''; geography.municipios = form.id_departamento ? normalize(await listarMunicipios(form.id_departamento)) : [] }
function payload() { const result = {}; for (const field of currentFields.value) { let value = form[field.key]; if (typeof value === 'string') value = value.trim(); if (field.type === 'number' || field.type === 'select') value = value === '' ? null : Number(value); if (field.type === 'switch') value = Boolean(value); result[field.key] = value } return result }
async function submitForm() {
  saving.value = true; errors.value = {}; formError.value = ''
  try {
    await store.save(dialog.resource, payload(), dialog.id); const resource = dialog.resource; const id = dialog.id
    dialog.open = false; notice.type = 'success'; notice.text = `${resourceConfig[resource].singular} ${id ? 'actualizado' : 'creado'} correctamente.`
    if (selected.value) selected.value = findNode(tree.value, selected.value.key) || selected.value
  } catch (error) { if (error.status === 422) errors.value = error.payload?.errors || {}; formError.value = obtenerMensajeError(error) }
  finally { saving.value = false }
}
function askDelete(node) { askDeleteRaw(node.resource, node.raw, node) }
function askDeleteRaw(resource, raw, node = null) { Object.assign(deleteDialog, { open: true, resource, id: raw.id, name: nameOf(raw, resource), node }) }
async function confirmDelete() { deleting.value = true; try { await store.remove(deleteDialog.resource, deleteDialog.id); if (deleteDialog.node && selected.value?.key === deleteDialog.node.key) selected.value = deleteDialog.node.parent; deleteDialog.open = false; notice.type = 'success'; notice.text = 'Registro eliminado correctamente.' } catch (error) { deleteDialog.open = false; notice.type = 'danger'; notice.text = obtenerMensajeError(error) } finally { deleting.value = false } }
async function refresh() { refreshing.value = true; await store.loadAll(); refreshing.value = false; if (selected.value) selected.value = findNode(tree.value, selected.value.key) }
async function retryFailed() { await Promise.allSettled(loadErrors.value.map(([resource]) => store.load(resource))) }

const TreeNode = defineComponent({
  name: 'TreeNode', props: { node: Object, selectedKey: String }, emits: ['select', 'create'],
  setup(props, { emit }) {
    const open = ref(true)
    return () => h('li', { class: ['tree-node', `tree-${props.node.resource}`] }, [
      h('div', { class: ['tree-row', { selected: props.selectedKey === props.node.key, inactive: !isActive(props.node.raw) }] }, [
        h('button', { class: ['tree-toggle', { invisible: !props.node.children.length }], 'aria-label': open.value ? 'Contraer' : 'Expandir', onClick: () => open.value = !open.value }, [h('i', { class: `ph ph-caret-${open.value ? 'down' : 'right'}` })]),
        h('button', { class: 'tree-label', onClick: () => emit('select', props.node) }, [
          h('span', { class: 'tree-node-icon' }, [h('i', { class: props.node.icon })]),
          h('span', { class: 'tree-node-copy' }, [h('strong', props.node.name), h('small', [h('span', { class: ['status-dot', { off: !isActive(props.node.raw) }] }), resourceConfig[props.node.resource].singular])]),
          props.node.childResource
            ? h('span', { class: 'tree-count' }, [String(props.node.children.length), h('span', ` ${resourceConfig[props.node.childResource].label.toLowerCase()}`)])
            : h('span', { class: 'tree-end', title: 'Nivel final' }, [h('i', { class: 'ph ph-check' })]),
        ]),
        props.node.childResource && h('button', { class: 'tree-add', title: `Crear ${resourceConfig[props.node.childResource].singular}`, 'aria-label': `Crear ${resourceConfig[props.node.childResource].singular}`, onClick: () => emit('create', props.node.childResource, props.node) }, [h('i', { class: 'ph ph-plus' })]),
      ]),
      open.value && props.node.children.length ? h('ul', props.node.children.map(child => h(TreeNode, { key: child.key, node: child, selectedKey: props.selectedKey, onSelect: value => emit('select', value), onCreate: (resource, parent) => emit('create', resource, parent) }))) : null,
    ])
  },
})
const ResourceGrid = defineComponent({
  props: { title: String, resources: Array, config: Object },
  emits: ['create', 'edit', 'remove'],
  setup(props, { emit }) {
    const actions = (resource, item) => h('td', { class: 'text-end' }, [
      h('button', { class: 'btn btn-outline-primary btn-sm me-2', title: 'Editar', onClick: () => emit('edit', resource.key, item) }, [h('i', { class: 'ph ph-pencil-simple' })]),
      props.config[resource.key].deletable
        ? h('button', { class: 'btn btn-outline-danger btn-sm', title: 'Eliminar', onClick: () => emit('remove', resource.key, item) }, [h('i', { class: 'ph ph-trash' })])
        : null,
    ])
    const body = resource => {
      if (resource.loading) return h('div', { class: 'text-center p-5' }, 'Cargando…')
      if (resource.error) return h('div', { class: 'alert alert-danger m-3' }, resource.error)
      if (!resource.items.length) return h('div', { class: 'empty-state py-5' }, [h('i', { class: props.config[resource.key].icon }), h('p', 'No hay registros creados.')])
      return h('div', { class: 'table-responsive' }, [h('table', { class: 'table align-middle mb-0' }, [
        h('thead', [h('tr', [h('th', 'Nombre'), h('th', { class: 'text-end' }, 'Acciones')])]),
        h('tbody', resource.items.map(item => h('tr', { key: item.id }, [
          h('td', [h('i', { class: `${props.config[resource.key].icon} text-primary me-2` }), optionName(item)]), actions(resource, item),
        ]))),
      ])])
    }
    const card = resource => h('div', { class: props.resources.length === 1 ? 'col-12' : 'col-xl-6', key: resource.key }, [
      h('div', { class: 'card h-100' }, [
        h('div', { class: 'card-header bg-transparent d-flex justify-content-between align-items-center' }, [
          h('h3', { class: 'h5 mb-0' }, props.config[resource.key].label),
          h('button', { class: 'btn btn-primary btn-sm', onClick: () => emit('create', resource.key) }, [h('i', { class: 'ph ph-plus me-1' }), 'Nuevo']),
        ]),
        h('div', { class: 'card-body p-0' }, [body(resource)]),
      ]),
    ])
    return () => h('section', [
      h('div', { class: 'mb-3' }, [
        h('h2', { class: 'h4 mb-1' }, props.title),
        h('p', { class: 'text-muted mb-0' }, props.title.startsWith('Estaciones') ? 'Las estaciones supervisan una o varias salas.' : 'Catálogos utilizados por habitaciones, salas y camas.'),
      ]),
      h('div', { class: 'row g-4' }, props.resources.map(card)),
    ])
  },
})

onMounted(() => { if (!store.loaded) store.loadAll() })
</script>

<style scoped>
.location-tabs{display:flex;gap:.5rem;background:#fff;padding:.45rem;border-radius:1rem;box-shadow:0 8px 30px rgba(29,53,87,.06);width:max-content;max-width:100%;overflow:auto}.location-tab{border:0;background:transparent;border-radius:.7rem;padding:.7rem 1rem;color:#667085;font-weight:600;white-space:nowrap}.location-tab i{margin-right:.45rem;font-size:1.1rem}.location-tab.active{background:var(--bs-primary);color:#fff}.location-tree{min-height:540px;background:linear-gradient(180deg,#fbfdff 0,#fff 30%)}
.tree-toolbar{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1rem;border:1px solid #e8eef5;border-radius:14px;background:#fff}.tree-toolbar>div{display:flex;align-items:center;gap:.65rem}.tree-toolbar>div>i{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#edf6ff;color:var(--bs-primary);font-size:1.1rem}.tree-toolbar strong,.tree-toolbar small{display:block}.tree-toolbar small{color:#8a98aa;font-size:.72rem}.tree-toolbar .form-check{margin:0}.tree-toolbar .form-check-label{font-size:.78rem;color:#667085}
.tree-root,.tree-node ul{list-style:none;margin:0;padding:0}.tree-node{position:relative}.tree-node ul{position:relative;padding-left:2.5rem;margin-left:1.2rem}.tree-node ul::before{content:"";position:absolute;top:-.5rem;bottom:1.75rem;left:.7rem;width:1px;background:#dce6f0}.tree-node ul>.tree-node::before{content:"";position:absolute;top:1.55rem;left:-1.8rem;width:1.8rem;height:1px;background:#dce6f0}
.tree-row{position:relative;display:flex;align-items:center;gap:.3rem;margin:.38rem 0;padding:.3rem;border:1px solid transparent;border-radius:14px;transition:border-color .18s,box-shadow .18s,transform .18s,background .18s}.tree-row:hover{z-index:2;background:#fff;border-color:#dce8f4;box-shadow:0 8px 24px rgba(34,74,115,.09);transform:translateX(2px)}.tree-row.selected{z-index:1;background:linear-gradient(100deg,#edf7ff,#f8fbff);border-color:#9dcef5;box-shadow:0 8px 24px rgba(22,119,196,.12)}.tree-row.selected::after{content:"";position:absolute;inset:10px auto 10px -1px;width:3px;border-radius:3px;background:var(--bs-primary)}.tree-row.inactive{opacity:.58}
.tree-toggle,.tree-add,.tree-label{border:0;background:transparent}.tree-toggle{display:grid;place-items:center;width:26px;height:26px;flex:0 0 26px;border-radius:8px;color:#8493a5;transition:background .18s,color .18s}.tree-toggle:hover{background:#e9f3fc;color:var(--bs-primary)}.tree-label{display:flex;min-width:0;align-items:center;gap:.7rem;padding:.35rem .2rem;flex:1;text-align:left;color:#344054}.tree-node-icon{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border-radius:11px;background:#edf5fc;color:#327eb9;font-size:1.15rem}.tree-sucursales>.tree-row .tree-node-icon{background:linear-gradient(135deg,#1565a8,#2996d6);color:#fff;box-shadow:0 5px 12px rgba(25,112,175,.22)}.tree-torres>.tree-row .tree-node-icon{background:#e9efff;color:#586bd8}.tree-pisos>.tree-row .tree-node-icon{background:#e9faf4;color:#21966c}.tree-salas>.tree-row .tree-node-icon{background:#fff3e5;color:#db7b1d}.tree-habitaciones>.tree-row .tree-node-icon{background:#f6edff;color:#8a55c5}.tree-camas>.tree-row .tree-node-icon{background:#ffedf0;color:#d9586c}.tree-node-copy{min-width:0}.tree-node-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.88rem}.tree-node-copy small{display:flex;align-items:center;gap:.35rem;margin-top:.12rem;color:#8a98aa;font-size:.68rem;font-weight:500}.status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#31b77a;box-shadow:0 0 0 3px rgba(49,183,122,.1)}.status-dot.off{background:#98a2b3;box-shadow:none}.tree-count{margin-left:auto;padding:.25rem .55rem;border-radius:20px;background:#f0f4f8;color:#65758a;font-size:.68rem;font-weight:700;white-space:nowrap}.tree-end{display:grid;place-items:center;margin-left:auto;width:23px;height:23px;border-radius:50%;background:#e9f9f1;color:#28a66d;font-size:.7rem}.tree-add{display:grid;place-items:center;width:30px;height:30px;flex:0 0 30px;border-radius:9px;background:#eef6fd;color:var(--bs-primary);opacity:0;transform:scale(.85);transition:opacity .18s,transform .18s,background .18s}.tree-row:hover .tree-add,.tree-add:focus{opacity:1;transform:scale(1)}.tree-add:hover{background:var(--bs-primary);color:#fff}
.empty-state,.empty-detail{text-align:center;color:#667085;padding:4rem 2rem}.empty-state>i,.empty-detail>i{display:block;font-size:3rem;color:#9eb7d2;margin-bottom:1rem}.detail-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:#e9f4ff;color:var(--bs-primary);font-size:1.5rem}.breadcrumb-location{display:flex;gap:.25rem;overflow:auto}.breadcrumb-location button{display:flex;align-items:center;gap:.25rem;border:0;background:none;color:#667085;white-space:nowrap;font-size:.84rem}.metric{background:#f7f9fc;border:1px solid #edf1f5;border-radius:.8rem;padding:1rem}.metric span{display:block;color:#667085;font-size:.78rem;margin-bottom:.25rem}.metric strong{font-size:1.15rem}.detail-list dt{color:#667085;font-weight:500}.children-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}.children-grid button{display:flex;align-items:center;gap:.6rem;border:1px solid #e8edf3;background:#fff;border-radius:.75rem;padding:.8rem;text-align:left}.children-grid button:hover{border-color:var(--bs-primary);color:var(--bs-primary)}.modal-backdrop-custom{position:fixed;inset:0;z-index:1080;background:rgba(10,24,43,.58);backdrop-filter:blur(4px);display:grid;place-items:center;padding:1rem;overflow:auto}.location-modal{background:#fff;border-radius:1.1rem;width:min(680px,100%);box-shadow:0 24px 70px rgba(0,0,0,.25);animation:modal-in .18s ease-out}.location-modal.compact{width:min(500px,100%)}.location-modal>header,.location-modal footer{display:flex;justify-content:space-between;align-items:center;padding:1.2rem 1.4rem;border-bottom:1px solid #edf0f4}.location-modal footer{justify-content:flex-end;gap:.65rem;border-top:1px solid #edf0f4;border-bottom:0}.location-modal .modal-body{padding:1.4rem}.parent-context{display:flex;align-items:center;gap:.8rem;background:#edf7ff;color:#175a91;border-radius:.75rem;padding:.8rem 1rem;margin-bottom:1.25rem}.parent-context i{font-size:1.4rem}.parent-context small,.parent-context strong{display:block}.delete-icon{display:grid;place-items:center;margin:0 auto 1rem;width:62px;height:62px;border-radius:50%;background:#fff1e8;color:#dc6b1f;font-size:2rem}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes modal-in{from{opacity:0;transform:translateY(10px) scale(.98)}}@media(max-width:767px){.location-tabs{width:100%}.location-tab{flex:1}.location-tab span{display:none}.children-grid{grid-template-columns:1fr}.location-tree{min-height:auto}.tree-toolbar{align-items:flex-start}.tree-toolbar>div>span{display:none}.tree-node ul{padding-left:1.4rem;margin-left:.8rem}.tree-node ul::before{left:.2rem}.tree-node ul>.tree-node::before{left:-1.2rem;width:1.2rem}.tree-count span{display:none}.tree-add{opacity:1;transform:none}.location-modal{margin:auto}.location-modal>header,.location-modal footer,.location-modal .modal-body{padding:1rem}}
</style>
