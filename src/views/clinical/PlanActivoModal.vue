<template><div class="viewer-layer" @mousedown.self="close"><section class="viewer"><header><div><small>PLAN CLÍNICO ACTUAL</small><h2>Plan de {{ medication ? 'medicamentos' : 'procedimientos' }}</h2><p>{{ patientName }} · Orden #{{ context.workOrderId }}</p></div><button class="btn-close" @click="close"></button></header><div class="modal-body"><div v-if="notice" class="alert alert-success">{{ notice }}</div><div v-if="error" class="alert alert-danger">{{ error }}</div><div v-if="plan" class="plan-meta"><div><small>Plan</small><strong>#{{ plan.id }}</strong></div><div><small>Estado</small><strong class="text-success">{{ plan.estado || (plan.status ? 'Activo' : 'Inactivo') }}</strong></div><div><small>Fecha de creación</small><strong>{{ formatDate(plan.fecha_creacion || plan.created_at) }}</strong></div><div><small>Profesional</small><strong>{{ plan.profesional?.name || 'No informado' }}</strong></div></div>
<template v-if="plan"><div class="items-heading"><div><h3>{{ medication ? 'Tomas programadas' : 'Servicios y procedimientos' }}</h3><p>{{ medication ? 'Cada tarjeta corresponde a una dosis individual del tratamiento.' : 'Elementos incluidos en el plan activo.' }}</p></div><span>{{ items.length }} registros</span></div><div v-if="!items.length" class="empty-items">El plan activo no contiene elementos en la respuesta del servidor.</div>
<div v-else-if="medication" class="dose-timeline"><article v-for="(item,index) in sortedItems" :key="item.id || index" :class="doseClass(item)"><div class="timeline-mark"><i :class="item.estado==='administrado'?'ph ph-check':'ph ph-pill'"></i></div><div class="dose-card"><div class="dose-top"><div><span class="dose-number">Toma {{ item.numero_administracion || index+1 }}</span><h4>{{ itemName(item) }}</h4><p><strong>{{ item.dosis || 'Dosis no informada' }}</strong> · vía {{ item.via?.nombre || item.via_administracion || 'no informada' }}</p></div><span class="dose-status" :class="item.estado">{{ statusLabel(item.estado) }}</span></div><div class="dose-details"><div><i class="ph ph-calendar-check"></i><span><small>Programada para</small><strong>{{ formatDateTime(item.fecha_hora_programada) }}</strong></span></div><div><i class="ph ph-timer"></i><span><small>Frecuencia</small><strong>{{ frequencyText(item) }}</strong></span></div><div><i class="ph ph-calendar-span"></i><span><small>Duración</small><strong>{{ durationText(item) }}</strong></span></div></div><div v-if="item.estado==='administrado'" class="administered-info"><i class="ph ph-check-circle"></i><span>Administrado {{ formatDateTime(item.fecha_hora_administracion) }}<small v-if="item.administrado_por"> por {{ item.administrado_por.name || item.administrado_por }}</small></span></div><div v-else-if="['omitido','suspendido'].includes(item.estado)" class="administered-info not-given"><i class="ph ph-prohibit"></i><span>{{ item.estado==='omitido' ? 'No administrada' : 'Suspendida' }}<small v-if="item.observaciones_administracion"> · {{ item.observaciones_administracion }}</small></span></div><div v-else class="dose-action"><span v-if="!isDue(item)"><i class="ph ph-clock"></i>Disponible desde {{ formatDateTime(windowStart(item)) }}.</span><button v-if="puede('enfermeria.medicamentos.omitir')" class="btn btn-outline-secondary btn-sm" :disabled="plans.administeringById[item.id]" @click="openOmission(item)"><i class="ph ph-prohibit me-1"></i>No administrada</button><button v-if="puede('enfermeria.medicamentos.administrar')" class="btn btn-primary btn-sm" :disabled="!canAdminister(item) || plans.administeringById[item.id]" @click="openAdministration(item)"><span v-if="plans.administeringById[item.id]" class="spinner-border spinner-border-sm me-1"></span><i v-else class="ph ph-syringe me-1"></i>Registrar toma</button></div></div></article></div>
<div v-else class="items"><article v-for="(item,index) in items" :key="item.id || index"><span>{{ index+1 }}</span><div><strong>{{ itemName(item) }}</strong><small>{{ item.cantidad || 1 }} actividades · {{ item.prioridad || 'Prioridad media' }}</small><p>{{ item.observaciones || item.indicaciones || '' }}</p></div><em>{{ item.estado || 'Activo' }}</em></article></div><div v-if="plan.observaciones" class="observations"><small>Observaciones generales</small><p>{{ plan.observaciones }}</p></div></template><div v-else class="no-plan"><i :class="medication?'ph ph-pill':'ph ph-clipboard-text'"></i><h3>Sin plan activo</h3><p>El paciente no tiene un plan activo de este tipo para la orden actual.</p></div></div><footer><button class="btn btn-outline-secondary" @click="close">Cerrar</button><button v-if="puede(medication ? 'ordenes_medicas.medicamentos.prescribir' : 'ordenes_medicas.procedimientos.ordenar')" class="btn btn-primary" @click="$emit('create')"><i class="ph ph-plus me-1"></i>{{ plan?'Suspender y crear nuevo':'Crear plan' }}</button></footer></section>
<Teleport to="body"><div v-if="administration" class="administration-layer"><section class="administration-modal" role="dialog" aria-modal="true" aria-labelledby="administration-title"><header><span><i class="ph ph-syringe"></i></span><div><small>REGISTRO DE ADMINISTRACIÓN</small><h3 id="administration-title">Confirmar toma</h3></div><button type="button" class="btn-close ms-auto" aria-label="Cerrar" :disabled="administering" @click="administration=null"></button></header><div class="modal-body"><div class="patient-check"><i class="ph ph-identification-card"></i><span><small>Verifique que sea el paciente correcto</small><strong>{{ patientName }}</strong></span></div><div class="medicine-summary mt-2"><strong>{{ itemName(administration) }}</strong><span>{{ administration.dosis }} · vía {{ administration.via_administracion || administration.via?.nombre }}</span><small>Programada: {{ formatDateTime(administration.fecha_hora_programada) }}</small></div><label class="form-label mt-3">Hora real de administración</label><input v-model="administrationForm.date" type="datetime-local" class="form-control"><small class="text-muted">Déjela vacía si la está administrando ahora. Si la dio antes, indique la hora real (no puede ser futura).</small><label class="form-label mt-3">Observaciones</label><textarea v-model.trim="administrationForm.observations" class="form-control" rows="2" placeholder="Ej. Paciente toleró bien el medicamento"></textarea><label class="form-label mt-3">Efectos adversos</label><textarea v-model.trim="administrationForm.adverse" class="form-control" rows="2" placeholder="Deje vacío si no se presentaron"></textarea><div class="confirmation-note"><i class="ph ph-info"></i>Este medicamento no podrá registrarse dos veces.</div></div><footer><button class="btn btn-outline-secondary" :disabled="administering" @click="administration=null">Cancelar</button><button class="btn btn-primary" :disabled="administering" @click="administer"><span v-if="administering" class="spinner-border spinner-border-sm me-2"></span>Sí, registrar toma</button></footer></section></div><div v-if="omission" class="administration-layer"><section class="administration-modal" role="dialog" aria-modal="true" aria-labelledby="omission-title"><header><span><i class="ph ph-prohibit"></i></span><div><small>DOSIS NO ADMINISTRADA</small><h3 id="omission-title">Registrar dosis no administrada</h3></div><button type="button" class="btn-close ms-auto" aria-label="Cerrar" :disabled="omitting" @click="omission=null"></button></header><form @submit.prevent="omit"><div class="modal-body"><div class="patient-check"><i class="ph ph-identification-card"></i><span><small>Paciente</small><strong>{{ patientName }}</strong></span></div><div class="medicine-summary mt-2"><strong>{{ itemName(omission) }}</strong><span>{{ omission.dosis }}</span><small>Programada: {{ formatDateTime(omission.fecha_hora_programada) }}</small></div><label class="form-label mt-3" for="omission-reason">Motivo <span class="text-danger">*</span></label><textarea id="omission-reason" v-model.trim="omissionReason" class="form-control" rows="3" maxlength="500" required placeholder="Ej.: Paciente en ayuno para cirugía, se niega, medicamento no disponible"></textarea><div class="confirmation-note"><i class="ph ph-info"></i>La dosis quedará registrada como no administrada, con su motivo, y ya no se podrá administrar.</div></div><footer><button type="button" class="btn btn-outline-secondary" :disabled="omitting" @click="omission=null">Volver</button><button type="submit" class="btn btn-secondary" :disabled="omitting || omissionReason.length < 5"><span v-if="omitting" class="spinner-border spinner-border-sm me-1"></span>Registrar como no administrada</button></footer></form></section></div></Teleport></div></template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { usePatientPlansStore } from '@/store/pinia/planesPaciente'
import { omitirDosisMedicamento } from '@/services/hospitalizacion'
import { usePermisos } from '@/store/pinia/permisos'
// Oculta las acciones que el usuario no tiene permiso de hacer (el backend igual lo valida).
const { puede } = usePermisos()


const props = defineProps({ type: String, plan: Object, patientName: String, context: Object })
const emit = defineEmits(['close', 'create', 'administered'])
const plans = usePatientPlansStore()
const notice = ref('')
const error = ref('')
const administration = ref(null)
const administering = ref(false)
const administrationForm = reactive({ date: '', observations: '', adverse: '' })

const medication = computed(() => props.type === 'medication')
const items = computed(() => medication.value
  ? (props.plan?.medicamentos || props.plan?.items || [])
  : (props.plan?.items || props.plan?.servicios || []))
const sortedItems = computed(() => [...items.value].sort((a, b) =>
  String(a.fecha_hora_programada || '').localeCompare(String(b.fecha_hora_programada || ''))))

const itemName = item => item.medicamento?.nombre || item.servicio?.nombre ||
  item.nombre_medicamento || item.nombre_servicio || item.nombre || `Elemento #${item.id || ''}`
const parseDate = value => value ? new Date(String(value).replace(' ', 'T')) : null
const formatDate = value => value
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(parseDate(value))
  : 'No informada'
const formatDateTime = value => value
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(parseDate(value))
  : 'No informada'
const statusLabel = status => ({ pendiente: 'Pendiente', administrado: 'Administrado', omitido: 'Omitido', suspendido: 'Suspendido' }[status] || status || 'Pendiente')
const frequencyText = item => item.frecuencia_nombre
  ? `${item.frecuencia_nombre} ${item.frecuencia_valor || ''}`
  : `Cada ${item.frecuencia_valor || '—'} ${item.frecuencia?.nombre || 'horas'}`
const durationText = item => item.duracion_nombre
  ? `${item.duracion_valor || ''} ${item.duracion_nombre}`
  : `${item.duracion_valor || '—'} ${item.duracion?.nombre || 'días'}`

// Una dosis se puede dar desde 60 minutos antes de su hora programada (misma regla que el
// backend, VENTANA_ANTICIPACION_MINUTOS). Una dosis atrasada se puede dar en cualquier momento.
const WINDOW_MINUTES = 60
const windowStart = item => {
  const date = parseDate(item.fecha_hora_programada)
  return date && !Number.isNaN(date.getTime()) ? new Date(date.getTime() - WINDOW_MINUTES * 60000) : null
}
const isDue = item => {
  const start = windowStart(item)
  return Boolean(start && start.getTime() <= Date.now())
}
const canAdminister = item => String(item.estado || 'pendiente').toLowerCase() === 'pendiente' && isDue(item)
const doseClass = item => ({
  due: canAdminister(item),
  future: String(item.estado || 'pendiente') === 'pendiente' && !isDue(item),
  done: item.estado === 'administrado'
})

// Convierte la programación del backend al formato local requerido por datetime-local.
function inputDateTime(value) {
  if (!value) return ''
  const normalized = String(value).trim().replace(' ', 'T')
  const match = normalized.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/)
  return match?.[1] || ''
}

function openAdministration(item) {
  if (!canAdminister(item)) return
  administration.value = item
  Object.assign(administrationForm, {
    // Vacía = se usa la hora actual del servidor. Antes se precargaba la hora programada
    // y era fácil registrar una hora que no correspondía a la real.
    date: '',
    observations: '',
    adverse: ''
  })
}

function apiDate(value) {
  return value ? `${value.replace('T', ' ')}:00` : undefined
}

async function administer() {
  administering.value = true
  error.value = ''
  try {
    await plans.administerMedication(administration.value.id, {
      ...(administrationForm.date ? { fecha_hora_administracion_real: apiDate(administrationForm.date) } : {}),
      observaciones: administrationForm.observations,
      efectos_adversos: administrationForm.adverse || null
    }, props.context)
    administration.value = null
    notice.value = 'Toma registrada correctamente.'
    emit('administered')
  } catch (e) {
    error.value = obtenerMensajeError(e)
  } finally {
    administering.value = false
  }
}

// Dosis no administrada (omitida), con motivo obligatorio.
const omission = ref(null)
const omissionReason = ref('')
const omitting = ref(false)

function openOmission(item) {
  omission.value = item
  omissionReason.value = ''
  error.value = ''
}

async function omit() {
  omitting.value = true
  error.value = ''
  try {
    await omitirDosisMedicamento(omission.value.id, omissionReason.value)
    await plans.checkMedication(props.context)
    omission.value = null
    notice.value = 'Dosis registrada como no administrada.'
    emit('administered')
  } catch (e) {
    error.value = obtenerMensajeError(e)
    omission.value = null
  } finally {
    omitting.value = false
  }
}

function close() {
  if (!administering.value && !omitting.value) emit('close')
}
</script>
<style scoped>.viewer-layer{position:fixed;inset:0;z-index:1080;display:grid;place-items:center;padding:1rem;background:rgba(6,19,33,.65);backdrop-filter:blur(5px)}.viewer{width:min(850px,100%);max-height:94vh;overflow:auto;border-radius:1rem;background:#fff;box-shadow:0 30px 90px rgba(0,0,0,.3)}.viewer>header,.viewer>footer{display:flex;justify-content:space-between;padding:1.1rem 1.3rem;border-bottom:1px solid #e6ecf1}.viewer>footer{justify-content:flex-end;gap:.6rem;border-top:1px solid #e6ecf1;border-bottom:0}.viewer header small{color:var(--bs-primary);font-size:.62rem;font-weight:800}.viewer h2{font-size:1.2rem;margin:.15rem 0}.viewer header p{margin:0;color:#758497;font-size:.7rem}.modal-body{padding:1.3rem}.plan-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem}.plan-meta>div{padding:.7rem;border-radius:.65rem;background:#f5f8fb}.plan-meta small,.plan-meta strong{display:block}.plan-meta small{color:#8290a2;font-size:.62rem}.plan-meta strong{font-size:.75rem}.items-heading{display:flex;justify-content:space-between;align-items:end;margin:1.2rem 0 .7rem}.items-heading h3{font-size:1rem;margin:0}.items-heading p{margin:0;color:#718096;font-size:.7rem}.items-heading>span{padding:.3rem .6rem;border-radius:20px;background:#e8f3fc;color:#2475ae;font-size:.65rem}.dose-timeline{position:relative;display:grid;gap:.7rem;padding-left:1rem}.dose-timeline::before{content:"";position:absolute;left:1.85rem;top:1rem;bottom:1rem;width:2px;background:#e0e8ef}.dose-timeline article{position:relative;display:grid;grid-template-columns:38px 1fr;gap:.7rem}.timeline-mark{z-index:1;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#eef3f7;color:#718096;border:4px solid #fff}.due .timeline-mark{background:#fff0df;color:#ca761d}.done .timeline-mark{background:#e6f7ef;color:#21865e}.dose-card{padding:.85rem;border:1px solid #e1e8ee;border-radius:.8rem;background:#fff}.due .dose-card{border-color:#efc88d;background:#fffcf7}.done .dose-card{border-color:#bfe4d1}.dose-top{display:flex;justify-content:space-between;gap:.8rem}.dose-number{color:#718096;font-size:.6rem;font-weight:800}.dose-top h4{font-size:.9rem;margin:.1rem 0}.dose-top p{margin:0;color:#5f6e80;font-size:.7rem}.dose-status{height:max-content;padding:.25rem .5rem;border-radius:20px;background:#eef1f4;color:#667085;font-size:.6rem;font-weight:800}.dose-status.pendiente{background:#fff3df;color:#b76b18}.dose-status.administrado{background:#e7f7ef;color:#21845d}.dose-details{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-top:.7rem}.dose-details>div{display:flex;gap:.4rem;padding:.5rem;border-radius:.55rem;background:#f6f8fa}.dose-details i{color:var(--bs-primary)}.dose-details small,.dose-details strong{display:block}.dose-details small{color:#8794a4;font-size:.56rem}.dose-details strong{font-size:.65rem}.dose-action,.administered-info{display:flex;justify-content:space-between;align-items:center;margin-top:.65rem;padding-top:.65rem;border-top:1px solid #e8edf1}.dose-action>span{color:#7a8796;font-size:.65rem}.administered-info{justify-content:flex-start;gap:.5rem;color:#247e59;font-size:.7rem}.administered-info small{display:inline}.items{display:grid;gap:.5rem}.items article{display:grid;grid-template-columns:28px 1fr auto;gap:.7rem;padding:.8rem;border:1px solid #e3e9ef;border-radius:.7rem}.items article>span{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#e7f3fc;color:var(--bs-primary);font-size:.7rem;font-weight:800}.items small{display:block;color:#748396;font-size:.7rem}.items p{margin:.25rem 0 0;font-size:.7rem}.items em{font-size:.66rem;color:#29815e;font-style:normal}.observations,.empty-items{margin-top:1rem;padding:.8rem;border-radius:.65rem;background:#f6f8fa;color:#667085}.no-plan{text-align:center;padding:2.5rem;color:#718096}.no-plan i{font-size:2.8rem}.administration-layer{position:fixed;inset:0;z-index:1090;display:grid;place-items:center;padding:1rem;background:rgba(5,16,27,.72)}.administration-modal{width:min(520px,100%);background:#fff;border-radius:1rem;box-shadow:0 25px 70px rgba(0,0,0,.35)}.administration-modal>header{display:flex;gap:.7rem;padding:1.1rem 1.25rem;border-bottom:1px solid #e5ebf0}.administration-modal header>span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#e8f3fc;color:var(--bs-primary);font-size:1.2rem}.administration-modal header small{color:var(--bs-primary);font-size:.58rem;font-weight:800}.administration-modal h3{font-size:1.05rem;margin:.1rem 0}.administration-modal>footer{display:flex;justify-content:flex-end;gap:.6rem;padding:1rem 1.25rem;border-top:1px solid #e5ebf0}.medicine-summary{padding:.8rem;border-radius:.7rem;background:#f4f8fb}.medicine-summary strong,.medicine-summary span,.medicine-summary small{display:block}.medicine-summary span{color:#526174;font-size:.76rem}.medicine-summary small{color:#8592a2;font-size:.66rem}.confirmation-note{display:flex;gap:.45rem;margin-top:1rem;padding:.65rem;border-radius:.6rem;background:#fff6df;color:#8b681e;font-size:.68rem}@media(max-width:650px){.plan-meta{grid-template-columns:1fr 1fr}.dose-details{grid-template-columns:1fr}.dose-action{align-items:stretch;flex-direction:column;gap:.5rem}.viewer>footer,.administration-modal>footer{flex-direction:column-reverse}.viewer>footer .btn,.administration-modal>footer .btn{width:100%}}.patient-check{display:flex;align-items:center;gap:.6rem;padding:.6rem .75rem;border-radius:.65rem;background:#eef7fc;color:#1d5f80}.patient-check i{font-size:1.4rem}.patient-check small,.patient-check strong{display:block}.patient-check small{font-size:.66rem}.administered-info.not-given{background:#f3f4f6;color:#5f6b76}.dose-action{gap:.4rem}
</style>
