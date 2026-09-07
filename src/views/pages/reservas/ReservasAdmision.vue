<template>
  <main class="hh-page">
    <section class="hh-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <span class="hh-eyebrow">Admisión</span>
        <h1 class="mb-1">Reservas de cama</h1>
        <p class="mb-0 opacity-75">Consulta y acepta las solicitudes enviadas a enfermería.</p>
      </div>
      <router-link to="/admision/reservas/nueva" class="btn btn-light">
        <i class="ph ph-plus me-1"></i>Nueva reserva
      </router-link>
    </section>

    <section class="card border-0 shadow-sm">
      <div class="card-body border-bottom">
        <div class="row g-3">
          <div class="col-lg-5">
            <label class="form-label">Buscar reserva</label>
            <div class="input-group">
              <span class="input-group-text"><i class="ph ph-magnifying-glass"></i></span>
              <input v-model.trim="search" class="form-control" placeholder="Paciente, identificación, cama o solicitante">
            </div>
          </div>
          <div class="col-lg-4">
            <label class="form-label">Estado</label>
            <SearchSelect v-model="status" :options="statusOptions" label-key="nombre" value-key="id" @change="load" />
          </div>
          <div class="col-lg-3 d-flex align-items-end">
            <button class="btn btn-outline-primary w-100" :disabled="store.loadingTracking" @click="load">
              <span v-if="store.loadingTracking" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ph ph-arrows-clockwise me-1"></i>
              {{ store.loadingTracking ? 'Cargando...' : 'Actualizar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="notice" class="alert alert-success m-3 mb-0">{{ notice }}</div>
      <div v-if="error" class="alert alert-danger m-3 mb-0">{{ error }}</div>
      <div v-if="store.loadingTracking" class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      <div v-else-if="!visible.length" class="text-center text-muted py-5">
        <i class="ph ph-calendar-x fs-1"></i>
        <h2 class="h6 mt-2">No hay reservas para mostrar</h2>
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle table-hover mb-0">
          <thead><tr><th>Paciente</th><th>Solicitada por</th><th>Fecha de solicitud</th><th>Cama solicitada</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="item in visible" :key="reservationId(item)">
              <td><strong>{{ patientName(item) }}</strong><small class="d-block text-muted">{{ patientDocument(item) }}</small></td>
              <td><strong>{{ requesterName(item) }}</strong><small class="d-block text-muted">{{ requesterRole(item) }}</small></td>
              <td>{{ formatDate(requestDate(item)) }}</td>
              <td><strong>{{ bedName(item) }}</strong><small class="d-block text-muted">{{ locationName(item) }}</small></td>
              <td><span class="badge rounded-pill px-3 py-2" :class="statusClass(item)">{{ statusName(item) }}</span></td>
              <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="openDetail(item)"><i class="ph ph-eye me-1"></i>Detalle</button>
                <button v-if="isPending(item)" class="btn btn-sm btn-primary" :disabled="responding" @click="openAccept(item)"><i class="ph ph-check-circle me-1"></i>Aceptar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selected" class="modal-backdrop-custom" @click.self="closeModal">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
        <header class="modal-header-custom">
          <div><span class="hh-eyebrow">Reserva #{{ reservationId(selected) }}</span><h2 id="reservation-title" class="h4 mb-0">{{ accepting ? 'Confirmar aceptación' : 'Detalle de la reserva' }}</h2></div>
          <button class="btn btn-sm btn-light rounded-circle" :disabled="responding" aria-label="Cerrar" @click="closeModal"><i class="ph ph-x fs-5"></i></button>
        </header>
        <div class="modal-body-custom">
          <div class="patient-summary mb-4">
            <div class="summary-icon"><i class="ph ph-user"></i></div>
            <div><small>Paciente</small><h3 class="h5 mb-1">{{ patientName(selected) }}</h3><span>{{ patientDocument(selected) }}</span></div>
          </div>
          <div class="detail-grid">
            <div class="detail-item"><i class="ph ph-user-circle"></i><div><small>Solicitada por</small><strong>{{ requesterName(selected) }}</strong><span>{{ requesterRole(selected) }}</span></div></div>
            <div class="detail-item"><i class="ph ph-calendar-check"></i><div><small>Fecha de solicitud</small><strong>{{ formatDate(requestDate(selected)) }}</strong></div></div>
            <div class="detail-item"><i class="ph ph-bed"></i><div><small>Cama solicitada</small><strong>{{ bedName(selected) }}</strong><span>{{ locationName(selected) }}</span></div></div>
            <div class="detail-item"><i class="ph ph-clock"></i><div><small>Ocupación programada</small><strong>{{ formatDate(selected.fecha_ocupacion_inicio) }}</strong><span>{{ selected.periodo ? `${selected.periodo} días` : 'Sin periodo registrado' }}</span></div></div>
            <div class="detail-item"><i class="ph ph-clipboard-text"></i><div><small>Orden de trabajo</small><strong>#{{ selected.orden_trabajo_id || selected.id_orden_trabajo || '—' }}</strong><span>{{ selected.servicio?.nombre || selected.nombre_servicio || 'Servicio no informado' }}</span></div></div>
            <div class="detail-item"><i class="ph ph-info"></i><div><small>Estado actual</small><strong>{{ statusName(selected) }}</strong><span>{{ selected.tipo_reserva?.nombre || selected.nombre_tipo_reserva || 'Reserva de cama' }}</span></div></div>
          </div>
          <div v-if="selected.observacion || selected.observaciones" class="observation mt-3"><small>Observaciones de la solicitud</small><p class="mb-0">{{ selected.observacion || selected.observaciones }}</p></div>
          <div v-if="accepting" class="accept-box mt-4">
            <div class="d-flex gap-2 mb-3"><i class="ph ph-info text-primary fs-4"></i><p class="mb-0">Al aceptar, el sistema ingresará al paciente, ocupará la cama y registrará su ubicación de forma automática.</p></div>
            <div v-if="requiresServiceSelection || serviceOptions.length > 1" class="mb-3">
              <label class="form-label">Servicio de estancia *</label>
              <SearchSelect v-if="serviceOptions.length" v-model="serviceOrderId" :options="serviceOptions" placeholder="Seleccione el servicio de estancia" />
              <input v-else v-model.number="serviceOrderId" type="number" min="1" class="form-control" placeholder="ID de la orden de servicio">
              <small class="text-muted">La orden tiene varias estancias; seleccione cuál se utilizará para el ingreso.</small>
            </div>
            <label class="form-label" for="accept-observation">Observación de respuesta <span class="text-muted">(opcional)</span></label>
            <textarea id="accept-observation" v-model.trim="observation" class="form-control" rows="3" placeholder="Agrega una observación para enfermería"></textarea>
          </div>
          <details v-if="extraDetails.length" class="mt-3"><summary>Ver información adicional</summary><dl class="extra-grid mt-3 mb-0"><template v-for="field in extraDetails" :key="field.key"><dt>{{ field.label }}</dt><dd>{{ field.value }}</dd></template></dl></details>
          <div v-if="modalError" class="alert alert-danger mt-3 mb-0">{{ modalError }}</div>
        </div>
        <footer class="modal-footer-custom">
          <button class="btn btn-outline-secondary" :disabled="responding" @click="closeModal">Cerrar</button>
          <button v-if="accepting" class="btn btn-primary px-4" :disabled="responding" @click="confirmAccept">
            <span v-if="responding" class="spinner-border spinner-border-sm me-2"></span><i v-else class="ph ph-check-circle me-1"></i>{{ responding ? 'Guardando...' : 'Confirmar aceptación' }}
          </button>
        </footer>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SearchSelect from '@/components/form/SearchSelect.vue'
import { obtenerMensajeError } from '@/services/api'
import { responderReserva } from '@/services/hospitalizacion'
import { useReservationsStore } from '@/store/pinia/reservas'

const store = useReservationsStore()
const search = ref('')
const status = ref('todos')
const error = ref('')
const notice = ref('')
const selected = ref(null)
const accepting = ref(false)
const responding = ref(false)
const observation = ref('')
const modalError = ref('')
const serviceOrderId = ref('')
const serviceOptions = ref([])
const requiresServiceSelection = ref(false)

const statusOptions = computed(() => [{ id: 'todos', nombre: 'Todos los estados' }, ...store.estados])
const searchable = item => [patientName(item), patientDocument(item), requesterName(item), bedName(item), locationName(item), item.orden_trabajo_id, item.id_orden_trabajo].join(' ').toLowerCase()
const visible = computed(() => { const query = search.value.toLowerCase(); return store.seguimientoAdmision.filter(item => searchable(item).includes(query)) })
const reservationId = item => item?.id_reserva ?? item?.id
const patientName = item => item?.paciente_nombre ||  'Paciente no informado'
const patientDocument = item => item?.paciente_identificacion || 'Identificación no informada'
const requesterName = item => item?.reserved_by_nombre  || 'No informado'
const requesterRole = item => item?.usuario_solicita?.perfil || item?.usuario_solicitud?.perfil || item?.perfil_solicitante || ''
const requestDate = item => item?.created_at 
const bedName = item => item?.cama_nombre ||'Cama no informada'
const locationName = item => [item?.habitacion_nombre , item?.sala_nombre , item?.estacion_nombre].filter(Boolean).join(' · ') || 'Ubicación no informada'
const statusId = item => Number(item?.id_estado ?? item?.estado_id ?? item?.estado?.id)
const statusName = item => item?.estado_nombre  || store.estados.find(stateItem => String(stateItem.id) === String(statusId(item)))?.nombre || 'Sin estado'
const isPending = item => statusId(item) === 1 || /pendiente|solicitud/i.test(statusName(item))
const statusClass = item => statusId(item) === 1 ? 'bg-warning-subtle text-warning-emphasis' : statusId(item) === 2 ? 'bg-success-subtle text-success-emphasis' : statusId(item) === 3 ? 'bg-danger-subtle text-danger-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'
const formatDate = value => { if (!value) return '—'; const date = new Date(String(value).replace(' ', 'T')); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
const extraDetails = computed(() => selected.value ? Object.entries(selected.value).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value) && value !== '' && value !== null).map(([key, value]) => ({ key, label: key.replaceAll('_', ' '), value: typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value })) : [])

async function load() { error.value = ''; try { await store.loadTracking(status.value) } catch (exception) { error.value = obtenerMensajeError(exception) } }
const asArray = value => Array.isArray(value) ? value : value ? [value] : []
const serviceId = item => item?.id_orden_de_servicio ?? item?.orden_de_servicio_id ?? item?.id
const serviceLabel = item => item?.nombre_servicio || item?.servicio?.nombre || item?.nombre || `Servicio de estancia #${serviceId(item)}`
function extractServiceOptions(source) {
  const candidates = source?.ordenes_de_servicio || source?.servicios_estancia || source?.estancias || source?.data?.ordenes_de_servicio || source?.data?.servicios_estancia || source?.data?.estancias || []
  return asArray(candidates).map(item => ({ ...item, id: serviceId(item), nombre: serviceLabel(item) })).filter(item => item.id)
}
function resetServiceSelection(item) {
  serviceOptions.value = extractServiceOptions(item)
  requiresServiceSelection.value = serviceOptions.value.length > 1
  serviceOrderId.value = serviceOptions.value.length === 1 ? serviceOptions.value[0].id : ''
}
function openDetail(item) { selected.value = item; accepting.value = false; observation.value = ''; modalError.value = ''; resetServiceSelection(item) }
function openAccept(item) { selected.value = item; accepting.value = true; observation.value = ''; modalError.value = ''; resetServiceSelection(item) }
function closeModal() { if (responding.value) return; selected.value = null; accepting.value = false }
async function confirmAccept() {
  if (!selected.value || responding.value) return
  if (requiresServiceSelection.value && !serviceOrderId.value) { modalError.value = 'Seleccione el servicio de estancia que se utilizará para ingresar al paciente.'; return }
  responding.value = true
  modalError.value = ''
  try {
    const response = await responderReserva(reservationId(selected.value), 2, observation.value, serviceOrderId.value)
    closeModalAfterSave()
    await load()
    notice.value = response?.message || 'Reserva aceptada y paciente ingresado en la cama correctamente.'
  } catch (exception) {
    if (exception?.status === 422) {
      const options = extractServiceOptions(exception?.payload)
      if (options.length) serviceOptions.value = options
      requiresServiceSelection.value = true
      modalError.value = options.length ? 'La orden tiene varias estancias. Seleccione el servicio que se utilizará para el ingreso.' : obtenerMensajeError(exception)
    } else modalError.value = obtenerMensajeError(exception)
  } finally { responding.value = false }
}
function closeModalAfterSave() { selected.value = null; accepting.value = false; observation.value = ''; serviceOrderId.value = ''; serviceOptions.value = []; requiresServiceSelection.value = false }

onMounted(async () => { try { await store.loadCatalogs() } catch {} await load() })
</script>

<style scoped>
.modal-backdrop-custom{position:fixed;inset:0;z-index:1060;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:1rem;backdrop-filter:blur(3px)}
.modal-card{width:min(880px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:1rem;box-shadow:0 25px 60px rgba(15,23,42,.28)}
.modal-header-custom,.modal-footer-custom{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 1.5rem}.modal-header-custom{border-bottom:1px solid #e9edf3}.modal-footer-custom{border-top:1px solid #e9edf3;justify-content:flex-end}.modal-body-custom{padding:1.5rem}
.patient-summary{display:flex;align-items:center;gap:1rem;padding:1.15rem;border-radius:.9rem;background:linear-gradient(135deg,#eef6ff,#f8fbff);border:1px solid #dbeafe}.summary-icon{width:50px;height:50px;border-radius:.8rem;display:grid;place-items:center;background:#fff;color:var(--bs-primary);font-size:1.65rem;box-shadow:0 5px 15px rgba(37,99,235,.12)}.patient-summary small,.detail-item small,.observation small{display:block;color:#64748b;font-weight:600}.patient-summary span,.detail-item span{display:block;color:#64748b;margin-top:.15rem}
.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem}.detail-item{display:flex;gap:.75rem;padding:1rem;border:1px solid #e7ebf0;border-radius:.75rem;background:#fff}.detail-item>i{color:var(--bs-primary);font-size:1.3rem;margin-top:.1rem}.detail-item strong{display:block;color:#1e293b}.observation,.accept-box{padding:1rem;border-radius:.75rem;background:#f8fafc;border:1px solid #e2e8f0}.extra-grid{display:grid;grid-template-columns:minmax(140px,.45fr) 1fr;gap:.45rem 1rem}.extra-grid dt{text-transform:capitalize;color:#64748b}.extra-grid dd{overflow-wrap:anywhere}summary{cursor:pointer;color:var(--bs-primary);font-weight:600}
@media(max-width:700px){.detail-grid{grid-template-columns:1fr}.modal-header-custom,.modal-footer-custom,.modal-body-custom{padding:1rem}.modal-footer-custom{position:sticky;bottom:0;background:#fff}}
</style>
