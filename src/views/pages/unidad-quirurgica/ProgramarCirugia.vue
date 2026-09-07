<template>
  <main class="hh-page schedule-surgery">
    <router-link to="/unidad-quirurgica/agenda" class="hh-back-link d-inline-flex align-items-center mb-3">
      <i class="ph ph-arrow-left me-1"></i>Volver a agenda
    </router-link>

    <section class="page-hero">
      <div><span>NUEVA PROGRAMACIÓN</span><h1>Programar cirugía</h1><p>Reserve el quirófano y asigne el contexto clínico inicial.</p></div>
      <i class="ph ph-calendar-plus"></i>
    </section>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <form class="schedule-form mt-4" @submit.prevent="save">
      <header>
        <div><small>DATOS OBLIGATORIOS</small><h2>Programación quirúrgica</h2></div>
        <label><input v-model="form.preSeparacion" type="checkbox" class="form-check-input">Preseparación sin orden</label>
      </header>

      <div class="form-body">
        <section class="patient-section">
          <div class="section-title">
            <span><i class="ph ph-user-focus"></i></span>
            <div><small>PACIENTE</small><h3>Identificación y cirugías activas</h3></div>
          </div>

          <div v-if="!patient" class="row g-3 align-items-end mt-0">
            <div class="col-md-8">
              <label class="form-label">Cédula del paciente *</label>
              <div class="input-group">
                <input v-model.trim="dni" class="form-control" inputmode="numeric" autocomplete="off"
                  placeholder="Digite el número de identificación" @keyup.enter.prevent="findPatient">
                <button type="button" class="btn btn-outline-primary" :disabled="searchingPatient || !dni" @click="findPatient">
                  <span v-if="searchingPatient" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="ph ph-magnifying-glass me-1"></i>{{ searchingPatient ? 'Consultando…' : 'Buscar paciente' }}
                </button>
              </div>
            </div>
            <div class="col-md-4"><p class="search-help"><i class="ph ph-info"></i>La programación requiere validar primero al paciente.</p></div>
          </div>

          <template v-else>
            <article class="patient-card">
              <span class="patient-avatar">{{ initials(patientName) }}</span>
              <div class="patient-main">
                <small>PACIENTE IDENTIFICADO</small>
                <h3>{{ patientName }}</h3>
                <p>{{ patient.identificacion || patient.numero_documento || dni }}</p>
              </div>
              <div class="patient-data">
                <div><small>Paciente ID</small><strong>#{{ form.id_paciente }}</strong></div>
                <div><small>Edad</small><strong>{{ patientAge }}</strong></div>
                <div><small>Sexo</small><strong>{{ patientSex }}</strong></div>
                <div><small>Contacto</small><strong>{{ patientPhone }}</strong></div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="clearPatient">
                <i class="ph ph-arrows-clockwise me-1"></i>Cambiar
              </button>
            </article>

            <section class="active-surgeries">
              <header>
                <div><small>RESULTADO CLÍNICO</small><h4>Cirugías activas del paciente</h4></div>
                <span>{{ activeSurgeries.length }}</span>
              </header>
              <div v-if="loadingSurgeries" class="loading-surgeries">
                <span class="spinner-border spinner-border-sm text-primary"></span>Consultando cirugías activas…
              </div>
              <div v-else-if="!activeSurgeries.length" class="no-surgeries">
                <i class="ph ph-check-circle"></i>
                <div><strong>Sin cirugías activas</strong><small>No se encontraron procedimientos quirúrgicos vigentes. La programación permanecerá bloqueada.</small></div>
              </div>
              <div v-else class="surgery-options">
                <button v-for="(surgery, index) in activeSurgeries" :key="surgeryId(surgery) || index" type="button"
                  :class="{ selected: selectedSurgery === surgery }" @click="selectSurgery(surgery)">
                  <span><i class="ph ph-first-aid-kit"></i></span>
                  <div>
                    <small>{{ surgeryStatus(surgery) }}</small>
                    <strong>{{ surgeryName(surgery) }}</strong>
                    <p>{{ surgeryDetail(surgery) }}</p>
                  </div>
                  <i :class="selectedSurgery === surgery ? 'ph ph-check-circle' : 'ph ph-caret-right'"></i>
                </button>
              </div>
              <div v-if="loadingService" class="service-equipment loading-equipment">
                <span class="spinner-border spinner-border-sm text-primary"></span>
                Consultando requisitos del servicio…
              </div>
              <section v-else-if="selectedSurgery && serviceDetail" class="service-equipment">
                <header>
                  <span><i class="ph ph-toolbox"></i></span>
                  <div><small>SERVICIO A PRESTAR</small><h5>{{ serviceDetailName }}</h5></div>
                </header>
                <div v-if="teamAssignments.length" class="equipment-list">
                  <p><i class="ph ph-info"></i>Personal requerido para esta cirugía</p>
                  <div class="staff-grid">
                    <article v-for="item in teamAssignments" :key="item.key" :class="{ assigned: item.userId }">
                      <span><i class="ph ph-user-circle"></i></span>
                      <div>
                        <small>PERFIL REQUERIDO</small>
                        <strong>{{ item.profileName }}</strong>
                        <select v-model="item.userId" class="form-select form-select-sm mt-2" :disabled="item.loading || !item.profileId">
                          <option value="">{{ item.loading ? 'Consultando profesionales…' : 'Seleccione un profesional' }}</option>
                          <option v-for="user in item.users" :key="userId(user)" :value="userId(user)">{{ userName(user) }}</option>
                        </select>
                        <em v-if="item.error">{{ item.error }}</em>
                      </div>
                      <button type="button" class="remove-member" :disabled="!item.userId" title="Remover profesional" aria-label="Remover profesional" @click="item.userId = ''">
                        <i class="ph ph-x"></i>
                      </button>
                    </article>
                  </div>
                </div>
                <div v-else class="no-equipment"><i class="ph ph-check-circle"></i>El servicio no informa personal adicional requerido.</div>
              </section>
            </section>
          </template>
        </section>

        <fieldset :disabled="!canSchedule" class="programming-fields">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Quirófano *</label>
              <select v-model="form.id_quirofano" class="form-select" required>
                <option value="" disabled>Seleccione</option>
                <option v-for="item in rooms" :key="item.id" :value="item.id">{{ item.nombre_quirofano }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Cirujano *</label>
              <select v-model="form.id_cirujano" class="form-select" required>
                <option value="" disabled>Seleccione</option>
                <option v-for="item in professionals" :key="item.id" :value="item.id">{{ item.name || item.nombre }} · {{ item.identificacion }}</option>
              </select>
            </div>
            <div class="col-md-4"><label class="form-label">Fecha *</label><input v-model="form.fecha" type="date" :min="today" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Hora inicial *</label><input v-model="form.hora_inicio" type="time" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Hora final *</label><input v-model="form.hora_fin" type="time" class="form-control" required></div>
            <div class="col-12"><label class="form-label">Observación</label><textarea v-model.trim="form.observacion" rows="3" class="form-control"></textarea></div>
          </div>

          <div v-if="form.preSeparacion" class="info-note"><i class="ph ph-info"></i>La preseparación se enviará sin orden de servicio, equipo ni reservas de cama.</div>
          <div v-else class="reservation-options">
            <label><input v-model="form.req_hospitalizacion" type="checkbox" class="form-check-input">Requiere hospitalización</label>
            <label><input v-model="form.requiere_recuperacion" type="checkbox" class="form-check-input">Requiere recuperación</label>
            <small>Las camas se gestionan desde el flujo de reservas después de crear la programación.</small>
          </div>
        </fieldset>
      </div>

      <footer>
        <router-link to="/unidad-quirurgica/agenda" class="btn btn-outline-secondary">Cancelar</router-link>
        <button class="btn btn-primary" :disabled="saving || !canSchedule">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Programar cirugía
        </button>
      </footer>
    </form>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { buscarPacienteExacto } from '@/services/hospitalizacion'
import {
  consultarCirugiasActivasPaciente,
  consultarServicioQuirurgico,
  listarProfesionalesActivos,
  listarQuirofanos,
  listarUsuariosPerfil,
  programarCirugia,
} from '@/services/unidadQuirurgica'

const router = useRouter()
const rooms = ref([])
const professionals = ref([])
const dni = ref('')
const patient = ref(null)
const activeSurgeries = ref([])
const selectedSurgeryId = ref(null)
const selectedSurgery = ref(null)
const serviceDetail = ref(null)
const teamAssignments = ref([])
const loadingService = ref(false)
const searchingPatient = ref(false)
const loadingSurgeries = ref(false)
const saving = ref(false)
const error = ref('')
const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  preSeparacion: false, id_quirofano: '', id_paciente: '', id_orden_servicio: '',
  id_cirujano: '', fecha: today, hora_inicio: '08:00', hora_fin: '10:00',
  observacion: '', equipo: [], req_hospitalizacion: false, requiere_recuperacion: false,
})

const array = value => {
  if (Array.isArray(value)) return value
  for (const key of ['data', 'cirugias', 'cirugias_activas', 'procedimientos', 'usuarios', 'users', 'items']) {
    if (Array.isArray(value?.[key])) return value[key]
  }
  return []
}
const patientId = value => value?.paciente_id ?? value?.id_paciente ?? value?.id
const patientName = computed(() => patient.value?.nombre || patient.value?.nombre_completo || patient.value?.name ||
  [patient.value?.primer_nombre, patient.value?.segundo_nombre, patient.value?.primer_apellido, patient.value?.segundo_apellido].filter(Boolean).join(' ') || 'Paciente')
const patientAge = computed(() => patient.value?.edad ? `${patient.value.edad} años` : patient.value?.fecha_nacimiento ? ageFromDate(patient.value.fecha_nacimiento) : 'No informada')
const patientSex = computed(() => patient.value?.sexo?.nombre || patient.value?.sexo || patient.value?.genero || 'No informado')
const patientPhone = computed(() => patient.value?.telefono || patient.value?.celular || patient.value?.numero_telefono || 'No informado')
// Solo se permite reservar una sala cuando el paciente fue validado y el
// backend confirmó que tiene al menos una cirugía activa.
const canSchedule = computed(() => Boolean(patient.value) && !loadingSurgeries.value && activeSurgeries.value.length > 0 &&
  Boolean(selectedSurgery.value))
const initials = value => String(value || 'P').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
const surgeryId = item => item?.id_procedimiento ?? item?.procedimiento_id ?? item?.id_cirugia ?? item?.id
const surgeryName = item => item?.procedimiento || item?.servicio || item?.nombre_procedimiento || item?.nombre || `Cirugía #${surgeryId(item)}`
const surgeryStatus = item => item?.estado_procedimiento || item?.estado_programacion || item?.estado?.nombre || 'Cirugía activa'
const surgeryOrderId = item => item?.id_orden_servicio ?? item?.id_orden_de_servicio ?? item?.orden_servicio_id ?? item?.id_orden_trabajo ?? item?.orden_trabajo_id
const surgeryServiceId = item => item?.id_servicio ?? item?.servicio_id ?? item?.servicio?.id ?? item?.orden_de_servicio?.id_servicio
const surgeryDetail = item => [
  item?.fecha || item?.fecha_programada,
  item?.hora_inicio ? `${String(item.hora_inicio).slice(0, 5)}–${String(item.hora_fin || '').slice(0, 5)}` : '',
  surgeryOrderId(item) ? `Orden #${surgeryOrderId(item)}` : '',
].filter(Boolean).join(' · ') || 'Sin información adicional'
const serviceDetailName = computed(() => serviceDetail.value?.nombre || serviceDetail.value?.name ||
  serviceDetail.value?.descripcion || surgeryName(selectedSurgery.value))
const requiredEquipment = computed(() => normalizeEquipment(
  serviceDetail.value?.equipo ?? serviceDetail.value?.equipo_requerido ?? serviceDetail.value?.perfiles_equipo,
))
const equipmentKey = (item, index) => typeof item === 'object' ? item.id_perfil ?? item.perfil_id ?? item.id ?? item.id_equipo ?? index : `${item}-${index}`
const equipmentName = item => typeof item === 'string' ? item : item?.perfil?.nombre ?? item?.nombre_perfil ??
  item?.perfil ?? item?.nombre ?? item?.name ?? item?.descripcion ?? `Perfil #${item?.id_perfil ?? item?.perfil_id ?? item?.id ?? ''}`
const equipmentProfileId = item => typeof item === 'object' ? item?.id_perfil ?? item?.perfil_id ?? item?.perfil?.id ?? item?.id : item
const userId = user => user?.id_usuario ?? user?.user_id ?? user?.id
const userName = user => {
  const name = user?.nombre_completo || user?.name || user?.nombre ||
    [user?.primer_nombre, user?.primer_apellido].filter(Boolean).join(' ') || `Usuario #${userId(user)}`
  return user?.identificacion ? `${name} · ${user.identificacion}` : name
}

function normalizeEquipment(value) {
  if (value === null || value === undefined || value === '') return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') {
    for (const key of ['items', 'equipo', 'equipos', 'perfiles', 'data']) if (Array.isArray(value[key])) return value[key]
    return Object.values(value).filter(item => item !== null && item !== false && item !== '')
  }
  if (typeof value === 'string') {
    try { return normalizeEquipment(JSON.parse(value)) } catch { return value.split(',').map(item => item.trim()).filter(Boolean) }
  }
  return [value]
}

async function prepareTeam() {
  teamAssignments.value = requiredEquipment.value.map((item, index) => ({
    key: equipmentKey(item, index),
    profileId: equipmentProfileId(item),
    profileName: equipmentName(item),
    userId: '',
    users: [],
    loading: Boolean(equipmentProfileId(item)),
    error: '',
  }))
  await Promise.all(teamAssignments.value.map(async assignment => {
    if (!assignment.profileId) return
    try {
      assignment.users = array(await listarUsuariosPerfil(assignment.profileId))
    } catch (profileError) {
      assignment.error = obtenerMensajeError(profileError)
    } finally {
      assignment.loading = false
    }
  }))
}

function ageFromDate(value) {
  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return 'No informada'
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) years--
  return `${years} años`
}

async function findPatient() {
  if (!dni.value) return
  searchingPatient.value = true
  error.value = ''
  clearPatient(false)
  try {
    const response = await buscarPacienteExacto(dni.value)
    patient.value = response?.data || response
    form.id_paciente = patientId(patient.value)
    if (!form.id_paciente) throw new Error('La respuesta no contiene el ID del paciente.')
    loadingSurgeries.value = true
    try {
      activeSurgeries.value = array(await consultarCirugiasActivasPaciente(form.id_paciente))
    } catch (surgeryError) {
      error.value = `Paciente encontrado, pero no fue posible consultar sus cirugías activas: ${obtenerMensajeError(surgeryError)}`
    } finally {
      loadingSurgeries.value = false
    }
  } catch (patientError) {
    clearPatient(false)
    error.value = obtenerMensajeError(patientError)
  } finally {
    searchingPatient.value = false
  }
}

async function selectSurgery(item) {
  selectedSurgeryId.value = surgeryId(item)
  selectedSurgery.value = item
  serviceDetail.value = null
  teamAssignments.value = []
  const orderId = surgeryOrderId(item)
  form.id_orden_servicio = orderId ? Number(orderId) : ''
  const serviceId = surgeryServiceId(item)
  if (!serviceId) {
    error.value = 'La cirugía seleccionada no contiene el ID del servicio requerido.'
    return
  }
  loadingService.value = true
  error.value = ''
  try {
    const response = await consultarServicioQuirurgico(serviceId)
    const detail = response?.data || response
    serviceDetail.value = detail?.servicio || detail
    await prepareTeam()
  } catch (serviceError) {
    error.value = `No fue posible consultar la información del servicio: ${obtenerMensajeError(serviceError)}`
  } finally {
    loadingService.value = false
  }
}
function clearPatient(clearDni = true) {
  patient.value = null
  activeSurgeries.value = []
  selectedSurgeryId.value = null
  selectedSurgery.value = null
  serviceDetail.value = null
  teamAssignments.value = []
  form.id_paciente = ''
  form.id_orden_servicio = ''
  if (clearDni) dni.value = ''
}

watch(() => form.preSeparacion, value => {
  if (value) {
    form.id_orden_servicio = ''
    form.req_hospitalizacion = false
    form.requiere_recuperacion = false
  }
})

async function save() {
  if (!canSchedule.value || !form.id_paciente) {
    error.value = 'El paciente debe tener al menos una cirugía activa para reservar una sala.'
    return
  }
  if (form.hora_fin <= form.hora_inicio) {
    error.value = 'La hora final debe ser posterior a la inicial.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form,
      id_quirofano: Number(form.id_quirofano),
      id_paciente: Number(form.id_paciente),
      id_cirujano: Number(form.id_cirujano),
      equipo: teamAssignments.value
        .filter(item => item.userId && item.profileId)
        .map(item => ({ id_profesional: Number(item.userId), id_perfil: Number(item.profileId) })),
    }
    if (!form.preSeparacion) payload.id_orden_servicio = Number(form.id_orden_servicio)
    else delete payload.id_orden_servicio
    await programarCirugia(payload)
    router.push('/unidad-quirurgica/agenda')
  } catch (saveError) {
    error.value = obtenerMensajeError(saveError)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [roomsResult, professionalsResult] = await Promise.all([listarQuirofanos(), listarProfesionalesActivos()])
  rooms.value = array(roomsResult)
  professionals.value = array(professionalsResult)
})
</script>

<style scoped>
.page-hero{display:flex;align-items:center;justify-content:space-between;padding:1.4rem 1.5rem;border-radius:1rem;background:linear-gradient(120deg,#124b76,#1187ac);color:#fff}.page-hero span,.schedule-form>header small{font-size:.72rem;font-weight:800;letter-spacing:.08em}.page-hero h1{margin:.2rem 0;font-size:1.55rem}.page-hero p{margin:0;opacity:.82}.page-hero>i{font-size:2.5rem;opacity:.35}.schedule-form{overflow:hidden;border:1px solid #dfe7ee;border-radius:1rem;background:#fff}.schedule-form>header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;border-bottom:1px solid #e3e9ef;background:#fbfcfe}.schedule-form h2{margin:.1rem 0;font-size:1.05rem}.schedule-form>header label,.reservation-options label{display:flex;align-items:center;gap:.4rem}.form-body{padding:1.2rem}.patient-section{padding:1rem;border:1px solid #dce7ee;border-radius:.85rem;background:#fbfdfe}.section-title{display:flex;align-items:center;gap:.65rem}.section-title>span{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:#e6f4fc;color:var(--bs-primary);font-size:1.1rem}.section-title small,.section-title h3{display:block;margin:0}.section-title small{color:var(--bs-primary);font-size:.7rem;font-weight:800}.section-title h3{font-size:.95rem}.search-help{display:flex;align-items:center;gap:.45rem;margin:0;padding:.65rem;color:#657688;font-size:.75rem}.patient-card{display:flex;align-items:center;gap:.8rem;margin-top:1rem;padding:.9rem;border:1px solid #b9ddf1;border-radius:.8rem;background:linear-gradient(120deg,#eff8fd,#fff)}.patient-avatar{display:grid;place-items:center;width:46px;height:46px;border-radius:13px;background:var(--bs-primary);color:#fff;font-weight:800}.patient-main{min-width:150px}.patient-main small,.patient-main h3,.patient-main p{display:block;margin:0}.patient-main small{color:#21815a;font-size:.67rem;font-weight:800}.patient-main h3{font-size:.95rem}.patient-main p{color:#708092;font-size:.75rem}.patient-data{display:grid;grid-template-columns:repeat(4,minmax(80px,1fr));flex:1;gap:.45rem}.patient-data div{padding:.45rem .55rem;border-left:1px solid #d5e6f0}.patient-data small,.patient-data strong{display:block}.patient-data small{color:#788898;font-size:.65rem}.patient-data strong{font-size:.76rem}.active-surgeries{margin-top:.8rem;overflow:hidden;border:1px solid #e1e8ee;border-radius:.75rem;background:#fff}.active-surgeries>header{display:flex;align-items:center;justify-content:space-between;padding:.75rem .85rem;border-bottom:1px solid #e7edf1}.active-surgeries header small,.active-surgeries header h4{display:block;margin:0}.active-surgeries header small{color:#778899;font-size:.65rem;font-weight:800}.active-surgeries header h4{font-size:.83rem}.active-surgeries header>span{display:grid;place-items:center;min-width:28px;height:28px;border-radius:9px;background:#e8f4fc;color:var(--bs-primary);font-weight:700}.loading-surgeries,.no-surgeries{display:flex;align-items:center;justify-content:center;gap:.65rem;padding:1.1rem;color:#708092}.no-surgeries>i{color:#27875f;font-size:1.4rem}.no-surgeries strong,.no-surgeries small{display:block}.no-surgeries small{font-size:.7rem}.surgery-options{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem;padding:.65rem}.surgery-options button{display:flex;align-items:center;gap:.6rem;padding:.7rem;border:1px solid #dfe7ed;border-radius:.65rem;background:#fff;color:#405267;text-align:left}.surgery-options button.selected{border-color:#63add7;background:#f0f8fd;box-shadow:0 0 0 2px #d9eef9}.surgery-options button>span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#e9f4fb;color:var(--bs-primary)}.surgery-options button>div{min-width:0;flex:1}.surgery-options small,.surgery-options strong,.surgery-options p{display:block;margin:0}.surgery-options small{color:#27815e;font-size:.66rem;font-weight:800}.surgery-options strong{font-size:.79rem}.surgery-options p{color:#748496;font-size:.69rem}.programming-fields{margin:1rem 0 0;padding:0;border:0}.programming-fields:disabled{opacity:.55}.field-confirm{display:block;margin-top:.25rem;color:#25825c}.info-note,.reservation-options{display:flex;gap:.6rem;margin-top:1rem;padding:.8rem;border-radius:.7rem;background:#f2f8fc;color:#4f687c}.reservation-options{align-items:center}.reservation-options small{margin-left:auto}.schedule-form footer{display:flex;justify-content:flex-end;gap:.6rem;padding:1rem 1.2rem;border-top:1px solid #e3e9ef}@media(max-width:900px){.patient-card{align-items:flex-start;flex-wrap:wrap}.patient-data{grid-template-columns:repeat(2,1fr);min-width:100%}}@media(max-width:650px){.schedule-form>header,.reservation-options{align-items:flex-start;flex-direction:column}.surgery-options{grid-template-columns:1fr}.patient-data{grid-template-columns:1fr}.patient-data div{border-left:0;border-top:1px solid #d5e6f0}}
</style>

<style scoped>
/* Resumen institucional del paciente: ancho completo y lectura horizontal. */
.patient-card {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(220px, 1.35fr) minmax(440px, 2fr) auto;
  width: 100%;
  min-height: 112px;
  margin-top: 1rem;
  padding: 0;
  overflow: hidden;
  border: 1px solid #cbdce7;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 28px rgba(24, 66, 96, .08);
}

.patient-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: linear-gradient(180deg, #168fbd, #124b76);
  content: "";
}

.patient-avatar {
  width: 48px;
  height: 48px;
  margin-left: 1rem;
  border: 3px solid rgba(255, 255, 255, .75);
  border-radius: 14px;
  background: linear-gradient(145deg, #168fbd, #124b76);
  box-shadow: 0 7px 18px rgba(18, 75, 118, .2);
  font-size: .82rem;
}

.patient-main {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 1rem 1.1rem;
  border-right: 1px solid #e5edf2;
}

.patient-main small {
  display: flex;
  align-items: center;
  gap: .35rem;
  color: #23815d;
  font-size: .7rem;
  letter-spacing: .06em;
}

.patient-main small::before {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ca66f;
  box-shadow: 0 0 0 4px rgba(44, 166, 111, .12);
  content: "";
}

.patient-main h3 {
  margin-top: .25rem;
  overflow: hidden;
  color: #263e52;
  font-size: 1.05rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.patient-main p {
  margin-top: .12rem;
  color: #6c7f90;
  font-size: .78rem;
}

.patient-data {
  align-self: stretch;
  display: grid;
  grid-template-columns: repeat(4, minmax(95px, 1fr));
  gap: 0;
  min-width: 0;
}

.patient-data div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: .85rem 1rem;
  border-left: 0;
  border-right: 1px solid #e8eef2;
  background: linear-gradient(180deg, #fff, #fbfdfe);
}

.patient-data div:last-child {
  border-right: 0;
}

.patient-data small {
  margin-bottom: .28rem;
  color: #7a8997;
  font-size: .67rem;
  font-weight: 700;
  letter-spacing: .035em;
}

.patient-data strong {
  overflow: hidden;
  color: #314b60;
  font-size: .81rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.patient-card > button {
  align-self: center;
  margin: 0 1rem;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .patient-card {
    grid-template-columns: 64px 1fr auto;
  }

  .patient-main {
    border-right: 0;
  }

  .patient-data {
    grid-column: 1 / -1;
    width: 100%;
    border-top: 1px solid #e5edf2;
  }
}

@media (max-width: 650px) {
  .patient-card {
    grid-template-columns: 58px 1fr auto;
  }

  .patient-avatar {
    width: 42px;
    height: 42px;
    margin-left: .8rem;
  }

  .patient-main {
    padding: .85rem .7rem;
  }

  .patient-card > button {
    width: 36px;
    height: 36px;
    margin: 0 .7rem;
    overflow: hidden;
    padding: .45rem;
    font-size: 0;
  }

  .patient-card > button i {
    margin: 0 !important;
    font-size: 1rem;
  }

  .patient-data {
    grid-template-columns: repeat(2, 1fr);
  }

  .patient-data div {
    border-right: 1px solid #e8eef2;
    border-bottom: 1px solid #e8eef2;
  }
}
</style>

<style scoped>
.service-equipment {
  margin: 0 .65rem .65rem;
  overflow: hidden;
  border: 1px solid #cfe0ea;
  border-radius: .75rem;
  background: #fbfdfe;
}

.service-equipment > header {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .75rem .85rem;
  border-bottom: 1px solid #e2ebf0;
  background: linear-gradient(120deg, #edf7fc, #fff);
}

.service-equipment > header > span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  color: var(--bs-primary);
  box-shadow: 0 4px 12px rgba(30, 93, 132, .1);
}

.service-equipment header small,
.service-equipment header h5 {
  display: block;
  margin: 0;
}

.service-equipment header small {
  color: var(--bs-primary);
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .05em;
}

.service-equipment header h5 {
  color: #304b60;
  font-size: .86rem;
}

.loading-equipment {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  padding: 1rem;
  color: #6d7f90;
}

.equipment-list {
  padding: .8rem .9rem;
}

.equipment-list p {
  display: flex;
  align-items: center;
  gap: .4rem;
  margin: 0 0 .6rem;
  color: #52697c;
  font-size: .75rem;
  font-weight: 700;
}

.equipment-list > div {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
}

.equipment-list > div > span {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .42rem .65rem;
  border: 1px solid #d5e4ec;
  border-radius: .55rem;
  background: #fff;
  color: #40596d;
  font-size: .74rem;
  font-weight: 600;
}

.equipment-list > div > span i {
  color: #25845e;
}

.staff-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .55rem !important;
}

.staff-grid article {
  display: flex;
  align-items: center;
  gap: .6rem;
  min-width: 0;
  padding: .7rem;
  border: 1px solid #d8e4eb;
  border-radius: .65rem;
  background: #fff;
  box-shadow: 0 4px 12px rgba(30, 78, 107, .05);
}

.staff-grid article > span {
  display: grid;
  flex: 0 0 36px;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eaf5fb;
  color: var(--bs-primary);
  font-size: 1.1rem;
}

.staff-grid article > div {
  min-width: 0;
  flex: 1;
}

.staff-grid article small,
.staff-grid article strong {
  display: block;
}

.staff-grid article small {
  color: #7a8997;
  font-size: .63rem;
  font-weight: 800;
  letter-spacing: .04em;
}

.staff-grid article strong {
  overflow: hidden;
  color: #344e63;
  font-size: .78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.staff-grid article > i {
  color: #28865f;
  font-size: 1rem;
}

.staff-grid article.assigned {
  border-color: #9bd1b8;
  background: linear-gradient(120deg, #f3fbf7, #fff);
}

.staff-grid article em {
  display: block;
  margin-top: .3rem;
  color: #b34f4f;
  font-size: .66rem;
  font-style: normal;
}

.staff-grid .form-select {
  min-width: 0;
  color: #40576a;
  font-size: .72rem;
}

.remove-member {
  display: grid;
  flex: 0 0 30px;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid #e5c7c7;
  border-radius: 9px;
  background: #fff5f5;
  color: #bd5454;
}

.remove-member:disabled {
  border-color: #e4e9ed;
  background: #f5f7f8;
  color: #abb5bd;
}

.no-equipment {
  display: flex;
  align-items: center;
  gap: .45rem;
  padding: .8rem .9rem;
  color: #587062;
  font-size: .75rem;
}

.no-equipment i {
  color: #27875f;
  font-size: 1.05rem;
}

@media (max-width: 650px) {
  .staff-grid {
    grid-template-columns: 1fr;
  }
}
</style>
