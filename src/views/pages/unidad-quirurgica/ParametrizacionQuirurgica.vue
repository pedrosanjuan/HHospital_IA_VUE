<template>
  <main class="hh-page surgical-settings">
    <router-link to="/parametrizacion/general" class="hh-back-link d-inline-flex align-items-center mb-3">
      <i class="ph ph-arrow-left me-1"></i>Volver a parametrización general
    </router-link>

    <section class="settings-hero">
      <div>
        <span>CONFIGURACIÓN QUIRÚRGICA</span>
        <h1>Quirófanos y funcionamiento</h1>
        <p>Configure tipos, espacios y horarios iniciales de operación.</p>
      </div>
      <div>
        <button class="btn btn-outline-light" @click="openType"><i class="ph ph-plus me-1"></i>Nuevo tipo</button>
        <button class="btn btn-light text-primary" @click="openRoom"><i class="ph ph-plus me-1"></i>Nuevo quirófano</button>
      </div>
    </section>

    <div v-if="notice.text" class="alert mt-3" :class="`alert-${notice.type}`">{{ notice.text }}</div>

    <div class="settings-grid mt-4">
      <section>
        <header><div><small>CATÁLOGO</small><h2>Tipos de quirófano</h2></div><span>{{ types.length }}</span></header>
        <div v-if="!types.length" class="empty">Sin tipos configurados.</div>
        <div class="type-list">
          <article v-for="item in types" :key="item.id">
            <span><i class="ph ph-tag"></i></span>
            <strong>{{ item.nombre_tipo_quirofano }}</strong>
          </article>
        </div>
      </section>

      <section>
        <header><div><small>ESPACIOS FÍSICOS</small><h2>Quirófanos</h2></div><span>{{ rooms.length }}</span></header>
        <div v-if="!rooms.length" class="empty">Sin quirófanos configurados.</div>
        <div class="room-list">
          <article v-for="item in rooms" :key="item.id">
            <span><i class="ph ph-door-open"></i></span>
            <div>
              <strong>{{ item.nombre_quirofano }}</strong>
              <small>{{ typeName(item.id_tipo_quirofano) }} · {{ floorName(item.id_piso) }}</small>
            </div>
            <button class="btn btn-sm btn-outline-primary" @click="openDetail(item)">
              <i class="ph ph-eye me-1"></i>Ver configuración
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="openSchedule(item)">
              <i class="ph ph-clock me-1"></i>Horario
            </button>
          </article>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="modal" class="modal-layer" @mousedown.self="close">
        <section class="settings-modal" role="dialog" aria-modal="true" :aria-label="modalTitle">
          <header>
            <div><small>UNIDAD QUIRÚRGICA</small><h3>{{ modalTitle }}</h3></div>
            <button class="btn-close" :disabled="saving" @click="close"></button>
          </header>
          <form @submit.prevent="save">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>

              <template v-if="modal === 'type'">
                <label class="form-label">Nombre del tipo *</label>
                <input v-model.trim="form.name" maxlength="255" class="form-control" required>
              </template>

              <template v-else-if="modal === 'room'">
                <label class="form-label">Nombre del quirófano *</label>
                <input v-model.trim="form.name" maxlength="255" class="form-control" required>
                <label class="form-label mt-3">Tipo *</label>
                <select v-model="form.typeId" class="form-select" required>
                  <option value="" disabled>Seleccione</option>
                  <option v-for="item in types" :key="item.id" :value="item.id">{{ item.nombre_tipo_quirofano }}</option>
                </select>
                <label class="form-label mt-3">Piso *</label>
                <select v-model="form.floorId" class="form-select" required>
                  <option value="" disabled>Seleccione</option>
                  <option v-for="item in floors" :key="item.id" :value="item.id">{{ floorName(item.id) }}</option>
                </select>
              </template>

              <template v-else-if="modal === 'schedule'">
                <p>Defina el horario inicial para <strong>{{ selected.nombre_quirofano }}</strong>.</p>
                <div class="schedule-grid">
                  <label v-for="(day, index) in days" :key="day">
                    <input v-model="form.days" type="checkbox" :value="index + 1" class="form-check-input">
                    <span>{{ day }}</span>
                  </label>
                </div>
                <div class="row g-3 mt-0">
                  <div class="col-6"><label class="form-label">Hora inicial</label><input v-model="form.start" type="time" class="form-control" required></div>
                  <div class="col-6"><label class="form-label">Hora final</label><input v-model="form.end" type="time" class="form-control" required></div>
                </div>
                <small class="text-warning d-block mt-2">La API disponible permite registrar el horario inicial del quirófano.</small>
              </template>

              <template v-else-if="modal === 'detail'">
                <section class="room-summary">
                  <div class="room-identity"><span><i class="ph ph-door-open"></i></span><div><small>QUIRÓFANO</small><h4>{{ selected.nombre_quirofano }}</h4></div></div>
                  <span class="state-badge" :class="{ active: isActive(selected) }">{{ stateName(selected) }}</span>
                </section>
                <div class="detail-grid">
                  <article><span><i class="ph ph-hash"></i></span><div><small>IDENTIFICADOR</small><strong>#{{ selected.id }}</strong></div></article>
                  <article><span><i class="ph ph-tag"></i></span><div><small>TIPO</small><strong>{{ typeName(selected.id_tipo_quirofano) }}</strong></div></article>
                  <article><span><i class="ph ph-buildings"></i></span><div><small>UBICACIÓN</small><strong>{{ floorName(selected.id_piso) }}</strong></div></article>
                  <article><span><i class="ph ph-user"></i></span><div><small>OCUPACIÓN ACTUAL</small><strong>{{ patientName(selected) }}</strong></div></article>
                </div>
                <div class="trace-block">
                  <header><div><small>TRAZABILIDAD</small><strong>Historial de configuración</strong></div><span>{{ trace.length }} eventos</span></header>
                  <div v-if="loadingTrace" class="trace-loading"><span class="spinner-border spinner-border-sm text-primary"></span>Consultando historial…</div>
                  <div v-else-if="!trace.length" class="empty compact">No hay eventos de trazabilidad registrados.</div>
                  <div v-else class="timeline">
                    <article v-for="(item, index) in trace" :key="item.id || index">
                      <span></span><div><small>{{ traceDate(item) }}</small><strong>{{ item.titulo || item.accion || 'Actualización' }}</strong><p>{{ item.descripcion || item.detalle || 'Sin detalle adicional.' }}</p></div>
                    </article>
                  </div>
                </div>
              </template>
            </div>
            <footer>
              <button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="close">Cerrar</button>
              <button v-if="!['detail'].includes(modal)" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Guardar
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import {
  consultarTrazabilidadQuirofano,
  crearQuirofano,
  crearTipoQuirofano,
  guardarHorarioQuirofano,
  listarPisosQuirofano,
  listarQuirofanos,
  listarTiposQuirofano,
} from '@/services/unidadQuirurgica'

const types = ref([])
const rooms = ref([])
const floors = ref([])
const modal = ref(null)
const selected = ref(null)
const trace = ref([])
const loadingTrace = ref(false)
const saving = ref(false)
const modalError = ref('')
const notice = reactive({ text: '', type: 'success' })
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const form = reactive({ name: '', typeId: '', floorId: '', days: [], start: '07:00', end: '19:00' })

const array = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : []
const typeName = id => types.value.find(item => Number(item.id) === Number(id))?.nombre_tipo_quirofano || `Tipo #${id || '—'}`
const floorName = id => {
  const floor = floors.value.find(item => Number(item.id) === Number(id))
  return floor?.nombre || floor?.nombre_piso || `Piso #${id || '—'}`
}
const isActive = room => Number(room?.id_estado) === 1 || /activ|dispon/i.test(String(room?.estado || room?.nombre_estado || ''))
const stateName = room => room?.estado || room?.nombre_estado || (Number(room?.id_estado) === 1 ? 'Activo' : room?.id_estado ? `Estado #${room.id_estado}` : 'Sin estado')
const patientName = room => room?.paciente?.nombre || room?.nombre_paciente || (room?.id_paciente ? `Paciente #${room.id_paciente}` : 'Sin paciente asignado')
const traceDate = item => item.fecha || item.created_at || item.fecha_creacion || 'Fecha no informada'
const modalTitle = computed(() => ({
  type: 'Crear tipo de quirófano',
  room: 'Crear quirófano',
  schedule: 'Configurar horario',
  detail: selected.value ? `Configuración de ${selected.value.nombre_quirofano}` : 'Configuración del quirófano',
}[modal.value]))

async function load() {
  const [typeResult, roomResult, floorResult] = await Promise.allSettled([
    listarTiposQuirofano(),
    listarQuirofanos(),
    listarPisosQuirofano(),
  ])
  if (typeResult.status === 'fulfilled') types.value = array(typeResult.value)
  if (roomResult.status === 'fulfilled') rooms.value = array(roomResult.value)
  if (floorResult.status === 'fulfilled') floors.value = array(floorResult.value)
}

function reset() {
  Object.assign(form, { name: '', typeId: '', floorId: '', days: [], start: '07:00', end: '19:00' })
  modalError.value = ''
}
function openType() { reset(); modal.value = 'type' }
function openRoom() { reset(); modal.value = 'room' }
function openSchedule(item) { reset(); selected.value = item; modal.value = 'schedule' }
async function openDetail(item) {
  selected.value = item
  trace.value = []
  modal.value = 'detail'
  loadingTrace.value = true
  try {
    trace.value = array(await consultarTrazabilidadQuirofano(item.id))
  } catch {
    trace.value = []
  } finally {
    loadingTrace.value = false
  }
}
function close() {
  if (!saving.value) {
    modal.value = null
    selected.value = null
  }
}

async function save() {
  saving.value = true
  modalError.value = ''
  try {
    if (modal.value === 'type') await crearTipoQuirofano(form.name)
    if (modal.value === 'room') {
      await crearQuirofano({
        nombre_quirofano: form.name,
        id_tipo_quirofano: Number(form.typeId),
        id_piso: Number(form.floorId),
      })
    }
    if (modal.value === 'schedule') {
      if (!form.days.length) throw new Error('Seleccione al menos un día.')
      if (form.end <= form.start) throw new Error('La hora final debe ser posterior a la inicial.')
      await guardarHorarioQuirofano({
        id_quirofano: Number(selected.value.id),
        horarios: form.days.map(id_dia => ({ id_dia, hora_inicio: `${form.start}:00`, hora_fin: `${form.end}:00` })),
      })
    }
    modal.value = null
    notice.type = 'success'
    notice.text = 'Configuración guardada correctamente.'
    await load()
  } catch (error) {
    modalError.value = obtenerMensajeError(error)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.settings-hero{display:flex;align-items:center;justify-content:space-between;padding:1.4rem 1.5rem;border-radius:1rem;background:linear-gradient(120deg,#124b76,#1187ac);color:#fff}.settings-hero span,.settings-grid header small,.settings-modal header small{font-size:.72rem;font-weight:800;letter-spacing:.08em}.settings-hero h1{margin:.2rem 0;font-size:1.55rem}.settings-hero p{margin:0;opacity:.82}.settings-hero>div:last-child{display:flex;gap:.5rem}.settings-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:1rem}.settings-grid>section{overflow:hidden;border:1px solid #dfe7ee;border-radius:1rem;background:#fff}.settings-grid section>header{display:flex;align-items:center;justify-content:space-between;padding:1rem;border-bottom:1px solid #e3e9ef;background:#fbfcfe}.settings-grid h2{margin:.1rem 0;font-size:1.05rem}.settings-grid header>span{display:grid;place-items:center;min-width:30px;height:30px;border-radius:9px;background:#e8f4fc;color:var(--bs-primary)}.type-list,.room-list{display:grid;padding:.7rem}.type-list article,.room-list article{display:flex;align-items:center;gap:.6rem;padding:.7rem;border-bottom:1px solid #e9edf1}.type-list article>span,.room-list article>span{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#e8f4fc;color:var(--bs-primary)}.type-list strong{font-size:.82rem}.room-list article>div{min-width:0;flex:1}.room-list strong,.room-list small{display:block}.room-list strong{font-size:.82rem}.room-list small{color:#6f7f90;font-size:.72rem}.empty{text-align:center;padding:2rem;color:#7c8998}.empty.compact{padding:1.2rem}.modal-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:#071522b8;backdrop-filter:blur(5px)}.settings-modal{width:min(680px,100%);max-height:94vh;overflow:auto;border-radius:1rem;background:#fff;box-shadow:0 28px 80px #0005}.settings-modal>header{display:flex;justify-content:space-between;padding:1rem 1.2rem;border-bottom:1px solid #e3e9ef}.settings-modal h3{margin:.1rem 0;font-size:1.08rem}.settings-modal .modal-body{padding:1.2rem}.settings-modal footer{display:flex;justify-content:flex-end;gap:.6rem;padding:1rem 1.2rem;border-top:1px solid #e3e9ef}.schedule-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}.schedule-grid label{display:flex;gap:.4rem;padding:.55rem;border:1px solid #e3e9ef;border-radius:.55rem}.room-summary{display:flex;align-items:center;justify-content:space-between;padding:1rem;border-radius:.8rem;background:linear-gradient(120deg,#eff8fd,#f7fbfd)}.room-identity{display:flex;align-items:center;gap:.7rem}.room-identity>span{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#fff;color:var(--bs-primary);font-size:1.2rem;box-shadow:0 5px 15px #215b7e18}.room-identity small,.room-identity h4{display:block;margin:0}.room-identity h4{font-size:1rem}.state-badge{padding:.35rem .65rem;border-radius:20px;background:#eef1f4;color:#647587;font-size:.72rem;font-weight:700}.state-badge.active{background:#e6f7ef;color:#21815a}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.65rem;margin-top:.8rem}.detail-grid article{display:flex;align-items:center;gap:.6rem;padding:.8rem;border:1px solid #e2e9ef;border-radius:.7rem}.detail-grid article>span{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#edf6fc;color:var(--bs-primary)}.detail-grid small,.detail-grid strong{display:block}.detail-grid small{color:#7b8998;font-size:.68rem;font-weight:700}.detail-grid strong{font-size:.8rem}.trace-block{margin-top:1rem;border-top:1px solid #e3e9ef;padding-top:1rem}.trace-block>header{display:flex;align-items:center;justify-content:space-between}.trace-block>header small,.trace-block>header strong{display:block}.trace-block>header span{color:#738394;font-size:.72rem}.trace-loading{display:flex;align-items:center;justify-content:center;gap:.5rem;padding:1.5rem;color:#738394}.timeline{display:grid;gap:.55rem;margin-top:.8rem}.timeline article{display:grid;grid-template-columns:12px 1fr;gap:.6rem}.timeline article>span{width:10px;height:10px;margin-top:.35rem;border-radius:50%;background:var(--bs-primary)}.timeline small,.timeline strong{display:block}.timeline p{margin:.2rem 0;font-size:.74rem;color:#68798a}@media(max-width:800px){.settings-grid{grid-template-columns:1fr}.settings-hero{align-items:flex-start;flex-direction:column;gap:1rem}.room-list article{align-items:flex-start;flex-wrap:wrap}.room-list article>div{min-width:calc(100% - 50px)}.detail-grid{grid-template-columns:1fr}.schedule-grid{grid-template-columns:repeat(2,1fr)}}
</style>
