<template>
  <main class="hh-page user-detail">
    <router-link to="/parametrizacion/usuarios" class="hh-back-link d-inline-flex align-items-center mb-3"><i class="ph ph-arrow-left me-1"></i>Volver a usuarios</router-link>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span><p class="text-muted mt-2">Consultando configuración…</p></div>
    <div v-else-if="error && !user" class="alert alert-danger"><strong>No fue posible consultar el usuario.</strong> {{ error }}</div>
    <template v-else-if="user">
      <section class="profile-header">
        <div class="profile-avatar">{{ initials(userName) }}</div>
        <div class="profile-copy"><span>USUARIO #{{ user.id }}</span><h1>{{ userName }}</h1><p>{{ documentText }} · {{ user.correo || 'Correo no informado' }}</p></div>
        <div class="profile-states"><span :class="user.estado_sistema ? 'active' : 'inactive'"><i class="ph ph-circle-fill"></i>{{ user.estadoSistemaName || 'Estado sistema' }}</span><span :class="user.estado_rh ? 'active' : 'inactive'">RR. HH.: {{ user.estadoRHName || 'Sin estado' }}</span></div>
      </section>
      <div v-if="notice.text" class="alert mt-3" :class="`alert-${notice.type}`">{{ notice.text }}</div>

      <div class="detail-layout mt-4">
        <aside class="detail-nav">
          <button v-for="item in tabs" :key="item.id" :class="{ active: tab === item.id }" @click="tab = item.id"><i :class="item.icon"></i><span><strong>{{ item.label }}</strong><small>{{ item.help }}</small></span><i class="ph ph-caret-right"></i></button>
          <button class="password-action" @click="confirmReset = true"><i class="ph ph-key"></i><span><strong>Restablecer contraseña</strong><small>Generar una nueva credencial</small></span></button>
        </aside>

        <section class="configuration-panel">
          <header><div><small>CONFIGURACIÓN</small><h2>{{ currentTab.label }}</h2><p>{{ currentTab.help }}</p></div><button class="btn btn-sm btn-outline-primary" :disabled="sectionLoading" @click="loadTab"><i class="ph ph-arrows-clockwise me-1"></i>Actualizar</button></header>
          <div class="panel-body">
            <div v-if="sectionLoading" class="section-loading"><span class="spinner-border text-primary"></span><p>Consultando información…</p></div>

            <template v-else-if="tab === 'summary'">
              <div class="summary-grid"><article v-for="item in summary" :key="item.label"><i :class="item.icon"></i><span><small>{{ item.label }}</small><strong>{{ item.value }}</strong></span></article></div>
              <div class="info-note"><i class="ph ph-info"></i><span><strong>Datos personales en modo consulta</strong>La edición está deshabilitada porque el detalle actual no entrega todos los campos obligatorios exigidos por el endpoint de actualización.</span></div>
            </template>

            <template v-else-if="tab === 'profiles'">
              <SelectionGrid :options="profileCatalog" :selected="selectedProfiles" id-key="id_perfil" name-key="nombre" @change="selectedProfiles = $event" />
              <SaveBar :saving="saving" @save="saveProfiles" />
            </template>

            <template v-else-if="tab === 'roles'">
              <SelectionGrid :options="roleCatalog" :selected="selectedRoles" id-key="name" name-key="name" @change="selectedRoles = $event" />
              <SaveBar :saving="saving" @save="saveRoles" />
            </template>

            <template v-else-if="tab === 'permissions'">
              <div class="permission-legend"><span><i class="direct"></i>Directo y editable</span><span><i class="inherited"></i>Heredado del rol</span></div>
              <input v-model.trim="permissionSearch" type="search" class="form-control mb-3" placeholder="Buscar permiso por nombre, código o módulo…">
              <!-- Agrupados por módulo, con nombre legible y descripción del permiso -->
              <section v-for="group in permissionGroups" :key="group.modulo" class="permission-module">
                <h3>{{ group.modulo }}</h3>
                <div class="permission-grid"><div v-for="permission in group.items" :key="permission.name" class="permission-card" :class="{ inherited: inheritedPermissions.includes(permission.name) }"><label><input type="checkbox" :checked="selectedPermissions.includes(permission.name) || inheritedPermissions.includes(permission.name)" :disabled="inheritedPermissions.includes(permission.name)" @change="togglePermission(permission.name, $event.target.checked)"><span><strong>{{ permission.nombre_visible || permission.name }}</strong><small>{{ inheritedPermissions.includes(permission.name) ? 'Heredado del rol' : 'Permiso directo' }} · <code>{{ permission.name }}</code></small></span></label><details v-if="permission.html_descripcion"><summary>¿Qué permite?</summary><div class="permission-help" v-html="limpiarHtml(permission.html_descripcion)"></div></details></div></div>
              </section>
              <p v-if="!permissionGroups.length" class="text-muted small">Ningún permiso coincide con la búsqueda.</p>
              <SaveBar :saving="saving" @save="savePermissions" />
            </template>

            <template v-else-if="tab === 'parameters'">
              <div class="parameter-grid"><label><span><i class="ph ph-buildings"></i><strong>Usuario de planta</strong><small>Identifica al colaborador vinculado a la planta institucional.</small></span><input v-model="parameters.planta" type="checkbox" class="form-check-input"></label><label><span><i class="ph ph-receipt"></i><strong>Puede actuar como facturador</strong><small>Habilita el comportamiento general de facturación para este usuario.</small></span><input v-model="parameters.facturador" type="checkbox" class="form-check-input"></label></div>
              <SaveBar :saving="saving" @save="saveParameters" />
            </template>

            <template v-else-if="tab === 'contracting'">
              <div class="contract-heading"><div><span><i class="ph ph-calendar-check"></i></span><div><h3>Disponibilidad semanal</h3><p>Franjas recurrentes en las que este profesional puede recibir citas.</p></div></div><button class="btn btn-primary" @click="openSchedule()"><i class="ph ph-plus me-1"></i>Nueva franja</button></div>
              <div class="week-grid"><article v-for="day in professionalWeek" :key="day.id"><header><span>{{ day.short }}</span><div><strong>{{ day.name }}</strong><small>{{ day.blocks.length }} {{ day.blocks.length===1?'franja':'franjas' }}</small></div><button class="btn btn-sm btn-light" @click="openSchedule(day.id)"><i class="ph ph-plus"></i></button></header><div v-if="!day.blocks.length" class="day-empty">Sin disponibilidad</div><div v-else class="schedule-list"><div v-for="schedule in day.blocks" :key="schedule.id"><i class="ph ph-clock"></i><strong>{{ hour(schedule.hora_inicio) }}–{{ hour(schedule.hora_fin) }}</strong><button class="icon-action edit" title="Editar" @click="editSchedule(schedule)"><i class="ph ph-pencil-simple"></i></button><button class="icon-action remove" title="Eliminar" :disabled="deletingSchedule===schedule.id" @click="removeSchedule(schedule)"><span v-if="deletingSchedule===schedule.id" class="spinner-border spinner-border-sm"></span><i v-else class="ph ph-trash"></i></button></div></div></article></div>
              <div class="info-note"><i class="ph ph-info"></i><span><strong>Disponibilidad contractual recurrente</strong>Las vacaciones, incapacidades y permisos se manejan como excepciones de agenda, sin eliminar estas franjas.</span></div>
            </template>
          </div>
        </section>
      </div>
    </template>

    <Teleport to="body"><div v-if="confirmReset" class="confirm-layer" @mousedown.self="confirmReset = false"><section role="alertdialog" aria-modal="true"><span><i class="ph ph-key"></i></span><h3>¿Restablecer la contraseña?</h3><p>Se generará una nueva contraseña para <strong>{{ userName }}</strong>. El sistema intentará enviarla al correo registrado y nunca la mostrará en pantalla.</p><div><button class="btn btn-outline-secondary" :disabled="saving" @click="confirmReset = false">Cancelar</button><button class="btn btn-danger" :disabled="saving" @click="resetPassword"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Sí, restablecer</button></div></section></div></Teleport>
    <Teleport to="body"><div v-if="scheduleModal" class="confirm-layer" @mousedown.self="closeSchedule"><section class="schedule-modal" role="dialog" aria-modal="true"><div class="schedule-modal-head"><span><i class="ph ph-calendar-check"></i></span><div><small>CONTRATACIÓN</small><h3>{{ editingScheduleId ? 'Editar disponibilidad' : 'Nueva disponibilidad' }}</h3></div><button class="btn-close" :disabled="saving" @click="closeSchedule"></button></div><form @submit.prevent="saveSchedule"><div v-if="scheduleError" class="alert alert-danger">{{ scheduleError }}</div><label class="form-label">Día *</label><select v-model.number="scheduleForm.day" class="form-select" required><option v-for="(day,index) in scheduleDays" :key="day" :value="index+1">{{ day }}</option></select><div class="row g-3 mt-0"><div class="col-6"><label class="form-label">Hora inicial *</label><input v-model="scheduleForm.start" type="time" class="form-control" required></div><div class="col-6"><label class="form-label">Hora final *</label><input v-model="scheduleForm.end" type="time" class="form-control" required></div></div><div class="schedule-actions"><button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="closeSchedule">Cancelar</button><button class="btn btn-primary" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>{{ saving?'Guardando…':'Guardar franja' }}</button></div></form></section></div></Teleport>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { actualizarHorarioProfesional, consultarHorariosProfesional, eliminarHorarioProfesional, guardarHorariosProfesional } from '@/services/intramural'
import { actualizarParametrosUsuario, actualizarPerfilesUsuario, actualizarPermisosUsuario, actualizarRolesUsuario, consultarPerfiles, consultarPerfilesUsuario, consultarPermisos, consultarPermisosUsuario, consultarRoles, consultarRolesUsuario, consultarUsuario, restablecerPasswordUsuario } from '@/services/usuarios'
import { limpiarHtml } from '@/utilities/limpiarHtml'

const SelectionGrid = defineComponent({ props: { options: Array, selected: Array, idKey: String, nameKey: String }, emits: ['change'], setup(props, { emit }) { const id = item => item[props.idKey] ?? item.id; const name = item => item[props.nameKey] ?? item.nombre; return () => h('div', { class: 'selection-grid' }, props.options.map(item => h('label', { class: { selected: props.selected.includes(id(item)) } }, [h('input', { type: 'checkbox', checked: props.selected.includes(id(item)), onChange: event => emit('change', event.target.checked ? [...props.selected, id(item)] : props.selected.filter(value => value !== id(item))) }), h('span', [h('strong', name(item)), h('small', `Código: ${id(item)}`)]), h('i', { class: 'ph ph-check' })]))) } })
const SaveBar = defineComponent({ props: { saving: Boolean }, emits: ['save'], setup(props, { emit }) { return () => h('div', { class: 'save-bar' }, [h('span', 'Los cambios se aplican únicamente al guardar.'), h('button', { class: 'btn btn-primary', disabled: props.saving, onClick: () => emit('save') }, props.saving ? 'Guardando…' : 'Guardar cambios')]) } })

const route = useRoute(), userId = Number(route.params.id)
const user = ref(null), loading = ref(true), sectionLoading = ref(false), saving = ref(false), error = ref(''), tab = ref('summary'), confirmReset = ref(false)
const notice = reactive({ text: '', type: 'success' })
const profileCatalog = ref([]), assignedProfiles = ref([]), selectedProfiles = ref([])
const roleCatalog = ref([]), assignedRoles = ref([]), selectedRoles = ref([])
const permissionCatalog = ref([]), directPermissions = ref([]), inheritedPermissions = ref([]), selectedPermissions = ref([])

// Permisos del usuario agrupados por módulo y filtrados por el buscador.
const permissionSearch = ref('')
const normalizarTexto = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const permissionGroups = computed(() => {
  const termino = normalizarTexto(permissionSearch.value)
  const grupos = new Map()
  for (const permission of permissionCatalog.value) {
    if (termino && ![permission.nombre_visible, permission.name, permission.modulo].some(valor => normalizarTexto(valor).includes(termino))) continue
    const modulo = permission.modulo || 'Otros'
    if (!grupos.has(modulo)) grupos.set(modulo, [])
    grupos.get(modulo).push(permission)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a === 'Menú') - (b === 'Menú') || a.localeCompare(b, 'es'))
    .map(([modulo, items]) => ({ modulo, items }))
})
const parameters = reactive({ planta: false, facturador: false })
const professionalSchedules = ref([]), scheduleModal = ref(false), editingScheduleId = ref(null), deletingSchedule = ref(null), scheduleError = ref('')
const scheduleForm = reactive({ day: 1, start: '08:00', end: '17:00' })
const scheduleDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const tabs = [{ id: 'summary', label: 'Resumen', help: 'Información general y laboral', icon: 'ph ph-user-circle' }, { id: 'profiles', label: 'Perfiles', help: 'Áreas funcionales asignadas', icon: 'ph ph-identification-card' }, { id: 'roles', label: 'Roles', help: 'Roles de seguridad', icon: 'ph ph-shield-chevron' }, { id: 'permissions', label: 'Permisos', help: 'Accesos directos y heredados', icon: 'ph ph-lock-key' }, { id: 'contracting', label: 'Contratación', help: 'Disponibilidad profesional', icon: 'ph ph-briefcase' }, { id: 'parameters', label: 'Parámetros', help: 'Comportamientos generales', icon: 'ph ph-sliders-horizontal' }]
const currentTab = computed(() => tabs.find(item => item.id === tab.value))
const array = value => {
  if (Array.isArray(value)) return value
  for (const key of ['data', 'perfiles', 'roles', 'permisos']) if (Array.isArray(value?.[key])) return value[key]
  return []
}
const userName = computed(() => user.value?.nombre || user.value?.name || 'Usuario')
const documentText = computed(() => `${user.value?.tipo_documento || 'Documento'} ${user.value?.identifcacion || user.value?.identificacion || 'no informado'}`)
const initials = name => String(name || 'U').split(' ').slice(0, 2).map(value => value[0]).join('').toUpperCase()
const summary = computed(() => [{ label: 'Correo', value: user.value.correo || 'No informado', icon: 'ph ph-envelope' }, { label: 'Celular', value: user.value.celular || 'No informado', icon: 'ph ph-device-mobile' }, { label: 'Ubicación', value: [user.value.municipio, user.value.departamento].filter(Boolean).join(', ') || 'No informada', icon: 'ph ph-map-pin' }, { label: 'Barrio', value: user.value.barrio || 'No informado', icon: 'ph ph-house-line' }, { label: 'Perfiles', value: user.value.perfiles?.map(item => item.nombre).join(', ') || 'Sin perfiles', icon: 'ph ph-identification-badge' }, { label: 'Cuenta bancaria', value: user.value.cuenta ? `${user.value.banco || ''} · ${user.value.cuenta}` : 'No informada', icon: 'ph ph-bank' }])
const hour = value => String(value || '').slice(0, 5)
const sortedSchedules = computed(() => [...professionalSchedules.value].sort((a, b) => Number(a.id_dia) - Number(b.id_dia) || hour(a.hora_inicio).localeCompare(hour(b.hora_inicio))))
const professionalWeek = computed(() => scheduleDays.map((name, index) => ({ id: index + 1, name, short: name.slice(0, 2).toUpperCase(), blocks: sortedSchedules.value.filter(item => Number(item.id_dia) === index + 1) })))

async function loadUser() { const response = await consultarUsuario(userId); user.value = response?.data || response; parameters.planta = Boolean(user.value._planta); parameters.facturador = Boolean(user.value.esFacturador ?? user.value.is_facturador) }
async function loadTab() {
  notice.text = ''; sectionLoading.value = true
  try {
    if (tab.value === 'summary' || tab.value === 'parameters') await loadUser()
    if (tab.value === 'profiles') { const [catalog, assigned] = await Promise.all([consultarPerfiles(), consultarPerfilesUsuario(userId)]); profileCatalog.value = array(catalog); assignedProfiles.value = array(assigned); selectedProfiles.value = assignedProfiles.value.map(item => item.id_perfil ?? item.id) }
    if (tab.value === 'roles') { const [catalog, assigned] = await Promise.all([consultarRoles(), consultarRolesUsuario(userId)]); roleCatalog.value = array(catalog).map(item => ({ ...item, name: item.name ?? item.nombre })); assignedRoles.value = array(assigned); selectedRoles.value = assignedRoles.value.map(item => item.name ?? item.nombre) }
    if (tab.value === 'permissions') { const [catalog, assigned] = await Promise.all([consultarPermisos(), consultarPermisosUsuario(userId)]); permissionCatalog.value = array(catalog).map(item => ({ ...item, name: item.name ?? item.nombre })); const data = assigned?.data || assigned || {}; directPermissions.value = array(data.permisos_directos).map(item => item.name); inheritedPermissions.value = array(data.permisos_via_roles).map(item => item.name); selectedPermissions.value = [...directPermissions.value] }
    if (tab.value === 'contracting') professionalSchedules.value = array(await consultarHorariosProfesional(userId))
  } catch (reason) { showError(reason) }
  finally { sectionLoading.value = false }
}
const difference = (current, original) => current.filter(value => !original.includes(value))
async function saveProfiles() { await save(async () => { const add = difference(selectedProfiles.value, assignedProfiles.value.map(item => item.id_perfil ?? item.id)); const remove = difference(assignedProfiles.value.map(item => item.id_perfil ?? item.id), selectedProfiles.value); if (add.length) await actualizarPerfilesUsuario(userId, add.map(Number), false); if (remove.length) await actualizarPerfilesUsuario(userId, remove.map(Number), true); await loadTab(); await loadUser() }) }
async function saveRoles() { await save(async () => { const original = assignedRoles.value.map(item => item.name ?? item.nombre); await actualizarRolesUsuario(userId, difference(selectedRoles.value, original), difference(original, selectedRoles.value)); await loadTab() }) }
function togglePermission(name, checked) { selectedPermissions.value = checked ? [...new Set([...selectedPermissions.value, name])] : selectedPermissions.value.filter(value => value !== name) }
async function savePermissions() { await save(async () => { await actualizarPermisosUsuario(userId, difference(selectedPermissions.value, directPermissions.value), difference(directPermissions.value, selectedPermissions.value)); await loadTab() }) }
async function saveParameters() { await save(async () => { await actualizarParametrosUsuario(userId, parameters.planta ? 1 : 0, parameters.facturador ? 1 : 0); await loadUser() }) }
function openSchedule(day = 1) { editingScheduleId.value = null; Object.assign(scheduleForm, { day, start: '08:00', end: '17:00' }); scheduleError.value = ''; scheduleModal.value = true }
function editSchedule(item) { editingScheduleId.value = item.id; Object.assign(scheduleForm, { day: Number(item.id_dia), start: hour(item.hora_inicio), end: hour(item.hora_fin) }); scheduleError.value = ''; scheduleModal.value = true }
function closeSchedule() { if (!saving.value) scheduleModal.value = false }
function schedulePayload() { const [startHour, startMinute] = scheduleForm.start.split(':').map(Number), [endHour, endMinute] = scheduleForm.end.split(':').map(Number); return { dia: Number(scheduleForm.day), hora_inicio: startHour, minuto_inicio: startMinute, hora_fin: endHour, minuto_fin: endMinute } }
async function saveSchedule() { if (scheduleForm.end <= scheduleForm.start) { scheduleError.value = 'La hora final debe ser posterior a la inicial.'; return } saving.value = true; scheduleError.value = ''; try { const payload = schedulePayload(); if (editingScheduleId.value) await actualizarHorarioProfesional(userId, editingScheduleId.value, payload); else await guardarHorariosProfesional(userId, [payload]); scheduleModal.value = false; await loadTab(); notice.type = 'success'; notice.text = editingScheduleId.value ? 'Disponibilidad actualizada correctamente.' : 'Disponibilidad creada correctamente.' } catch (reason) { scheduleError.value = obtenerMensajeError(reason) } finally { saving.value = false } }
async function removeSchedule(item) { if (!window.confirm(`¿Eliminar la franja ${hour(item.hora_inicio)}–${hour(item.hora_fin)} del ${item.dia || scheduleDays[Number(item.id_dia) - 1]}?`)) return; deletingSchedule.value = item.id; notice.text = ''; try { await eliminarHorarioProfesional(userId, item.id); await loadTab(); notice.type = 'success'; notice.text = 'Disponibilidad eliminada correctamente.' } catch (reason) { showError(reason) } finally { deletingSchedule.value = null } }
async function resetPassword() { await save(async () => { await restablecerPasswordUsuario(userId); confirmReset.value = false }, 'Contraseña restablecida correctamente. El sistema gestionará su envío al correo registrado.') }
async function save(action, success = 'Configuración actualizada correctamente.') { saving.value = true; notice.text = ''; try { await action(); notice.type = 'success'; notice.text = success } catch (reason) { showError(reason) } finally { saving.value = false } }
function showError(reason) { notice.type = 'danger'; notice.text = obtenerMensajeError(reason) }
watch(tab, loadTab)
onMounted(async () => { try { await loadUser() } catch (reason) { error.value = obtenerMensajeError(reason) } finally { loading.value = false } })
</script>

<style scoped>
.profile-header{display:flex;align-items:center;gap:1rem;padding:1.35rem 1.5rem;border-radius:1rem;background:linear-gradient(120deg,#0c568e,#168fc5);color:#fff;box-shadow:0 14px 34px rgba(12,88,141,.18)}.profile-avatar{display:grid;place-items:center;width:62px;height:62px;flex:none;border-radius:18px;background:#ffffff25;font-size:1.1rem;font-weight:800}.profile-copy{min-width:0}.profile-copy>span{font-size:.6rem;font-weight:800;letter-spacing:.08em}.profile-copy h1{margin:.15rem 0;font-size:1.45rem}.profile-copy p{margin:0;opacity:.82}.profile-states{display:flex;gap:.5rem;margin-left:auto}.profile-states span{display:flex;align-items:center;gap:.35rem;padding:.38rem .65rem;border-radius:20px;background:#ffffff20;font-size:.68rem;font-weight:700}.profile-states .active i{color:#65e0a4}.profile-states .inactive i{color:#ffacac}.detail-layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:1rem;align-items:start}.detail-nav,.configuration-panel{overflow:hidden;border:1px solid #dfe7ee;border-radius:1rem;background:#fff;box-shadow:0 10px 30px rgba(27,65,98,.06)}.detail-nav{padding:.55rem}.detail-nav button{display:flex;align-items:center;gap:.65rem;width:100%;padding:.75rem;border:1px solid transparent;border-radius:.7rem;background:transparent;color:#465568;text-align:left}.detail-nav button:hover,.detail-nav button.active{border-color:#d4e6f3;background:#f2f8fc;color:var(--bs-primary)}.detail-nav button>i:first-child{font-size:1.1rem}.detail-nav button span{min-width:0;flex:1}.detail-nav strong,.detail-nav small{display:block}.detail-nav strong{font-size:.77rem}.detail-nav small{color:#8491a1;font-size:.6rem}.detail-nav .password-action{margin-top:.5rem;border-top:1px solid #f0dfe1;border-radius:.5rem;color:#bd3e4a}.configuration-panel>header{display:flex;justify-content:space-between;align-items:start;padding:1.1rem 1.25rem;border-bottom:1px solid #e4ebf1;background:#fbfcfe}.configuration-panel header small{color:var(--bs-primary);font-size:.58rem;font-weight:800}.configuration-panel h2{margin:.15rem 0;font-size:1.15rem}.configuration-panel header p{margin:0;color:#748396;font-size:.7rem}.panel-body{min-height:430px;padding:1.25rem}.section-loading{display:grid;place-items:center;padding:5rem;color:#718096}.summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.summary-grid article{display:flex;align-items:center;gap:.65rem;padding:.85rem;border:1px solid #e4eaf0;border-radius:.75rem}.summary-grid article>i{color:var(--bs-primary);font-size:1.2rem}.summary-grid small,.summary-grid strong{display:block}.summary-grid small{color:#8491a1;font-size:.62rem}.summary-grid strong{font-size:.76rem}.info-note{display:flex;gap:.65rem;margin-top:1rem;padding:.8rem;border-radius:.7rem;background:#fff8e7;color:#7e6526;font-size:.7rem}.info-note strong{display:block}.selection-grid,.permission-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}.selection-grid label,.permission-grid label{display:flex;align-items:center;gap:.65rem;padding:.75rem;border:1px solid #e1e8ee;border-radius:.7rem;cursor:pointer}.selection-grid label.selected{border-color:#8bc4eb;background:#f2f9fd}.selection-grid input{display:none}.selection-grid label>span,.permission-grid label>span{min-width:0;flex:1}.selection-grid strong,.selection-grid small,.permission-grid strong,.permission-grid small{display:block}.selection-grid strong,.permission-grid strong{overflow:hidden;font-size:.75rem;text-overflow:ellipsis}.selection-grid small,.permission-grid small{color:#8491a1;font-size:.6rem}.selection-grid label>i{display:none;color:var(--bs-primary)}.selection-grid label.selected>i{display:block}.permission-grid label.inherited{background:#f7f8fa;cursor:not-allowed}.permission-legend{display:flex;gap:1rem;margin-bottom:.8rem;font-size:.66rem}.permission-legend span{display:flex;align-items:center;gap:.35rem}.permission-legend i{width:9px;height:9px;border-radius:50%}.permission-legend .direct{background:#3088c4}.permission-legend .inherited{background:#98a2b3}.save-bar{display:flex;justify-content:flex-end;align-items:center;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid #e6ebf0}.save-bar span{color:#7b8999;font-size:.68rem}.parameter-grid{display:grid;gap:.7rem}.parameter-grid label{display:flex;align-items:center;justify-content:space-between;padding:1rem;border:1px solid #e1e8ef;border-radius:.8rem}.parameter-grid label>span{display:grid;grid-template-columns:32px 1fr;align-items:center}.parameter-grid label i{grid-row:1/3;color:var(--bs-primary);font-size:1.2rem}.parameter-grid strong,.parameter-grid small{display:block}.parameter-grid strong{font-size:.8rem}.parameter-grid small{color:#7d8b9c;font-size:.67rem}.confirm-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:#071522b8;backdrop-filter:blur(5px)}.confirm-layer section{width:min(450px,100%);padding:1.5rem;border-radius:1rem;background:#fff;text-align:center;box-shadow:0 28px 80px #0005}.confirm-layer section>span{display:grid;place-items:center;width:54px;height:54px;margin:0 auto .8rem;border-radius:16px;background:#fff0f1;color:#c43d49;font-size:1.4rem}.confirm-layer h3{font-size:1.1rem}.confirm-layer p{color:#667085;font-size:.76rem}.confirm-layer section>div{display:flex;justify-content:center;gap:.6rem;margin-top:1rem}@media(max-width:850px){.detail-layout{grid-template-columns:1fr}.detail-nav{display:flex;overflow:auto}.detail-nav button{min-width:190px}.profile-states{display:none}}@media(max-width:575px){.profile-header{padding:1rem}.summary-grid,.selection-grid,.permission-grid{grid-template-columns:1fr}.save-bar{align-items:stretch;flex-direction:column}.confirm-layer section>div{flex-direction:column-reverse}}
.contract-heading{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem}.contract-heading>div{display:flex;align-items:center;gap:.7rem}.contract-heading>div>span{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#e9f5fb;color:#197daa;font-size:1.25rem}.contract-heading h3,.contract-heading p{margin:0}.contract-heading h3{font-size:1rem}.contract-heading p{color:#758496;font-size:.72rem}.week-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.week-grid>article{overflow:hidden;border:1px solid #dfe7ed;border-radius:.75rem}.week-grid article>header{display:flex;align-items:center;gap:.6rem;padding:.65rem;border-bottom:1px solid #edf1f4;background:#fbfcfd}.week-grid article>header>span{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#e9f5fb;color:#197daa;font-weight:800}.week-grid article>header>div{flex:1}.week-grid header strong,.week-grid header small{display:block}.week-grid header small{color:#8190a0;font-size:.64rem}.day-empty{padding:1rem;color:#98a4b1;text-align:center}.schedule-list{display:grid;gap:.4rem;padding:.55rem}.schedule-list>div{display:flex;align-items:center;gap:.45rem;padding:.55rem;border-radius:.55rem;background:#f5f8fb}.schedule-list>div>i{color:var(--bs-primary)}.schedule-list strong{flex:1}.icon-action{display:grid;place-items:center;width:29px;height:29px;border:0;border-radius:8px}.icon-action.edit{background:#e5f1fa;color:#277aa7}.icon-action.remove{background:#fff0f1;color:#bd4450}.confirm-layer .schedule-modal{width:min(520px,100%);padding:0;text-align:left;overflow:hidden}.schedule-modal-head{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:.7rem!important;margin:0!important;padding:1rem 1.2rem;border-bottom:1px solid #e3e9ed}.schedule-modal-head>span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#e9f5fb;color:#197daa}.schedule-modal-head>div{display:block!important;margin:0!important;flex:1}.schedule-modal-head small{color:var(--bs-primary);font-size:.62rem;font-weight:800}.schedule-modal-head h3{margin:.1rem 0}.schedule-modal-head .btn-close{width:auto;height:auto;margin:0}.schedule-modal form{padding:1.2rem}.schedule-actions{display:flex;justify-content:flex-end;gap:.5rem;margin-top:1.2rem}@media(max-width:575px){.week-grid{grid-template-columns:1fr}.contract-heading{align-items:flex-start;flex-direction:column}.contract-heading .btn{width:100%}}
.permission-module{margin-bottom:1rem}.permission-module h3{margin:0 0 .5rem;font-size:.85rem;color:#294d63}.permission-card{padding:.55rem;border:1px solid #e4e9ef;border-radius:.6rem;background:#fff}.permission-card.inherited{background:#f4f8fb}.permission-card label{display:flex;gap:.5rem;align-items:flex-start}.permission-card code{color:#7b8997;font-size:.62rem}.permission-card details{margin:.3rem 0 0 1.5rem}.permission-card summary{color:#287fa9;font-size:.7rem;cursor:pointer}.permission-help{margin-top:.3rem;padding:.5rem .6rem;border-radius:.5rem;background:#f7fafc;color:#4d6071;font-size:.72rem}.permission-help :deep(p){margin:0 0 .3rem}.permission-help :deep(ul){margin:0 0 .3rem;padding-left:1.1rem}
</style>
