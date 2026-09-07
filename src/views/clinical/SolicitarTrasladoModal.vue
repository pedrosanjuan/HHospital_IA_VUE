<template>
  <Teleport to="body">
    <div class="transfer-layer" @mousedown.self="close">
      <section class="transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-title">
        <header>
          <span class="transfer-icon"><i class="ph ph-arrows-left-right"></i></span>
          <div>
            <small>GESTIÓN DE HOSPITALIZACIÓN</small>
            <h2 id="transfer-title">Solicitar traslado</h2>
            <p>{{ patient.nombre }} · {{ patient.identificacion }}</p>
          </div>
          <button type="button" class="btn-close ms-auto" aria-label="Cerrar" :disabled="saving" @click="close"></button>
        </header>

        <form @submit.prevent="submit">
          <div class="modal-body">
            <div class="current-location">
              <i class="ph ph-bed"></i>
              <span><small>Ubicación actual</small><strong>{{ bed.nombre }}</strong></span>
              <em>{{ patient.hospitalizacion?.servicio || 'Servicio hospitalario' }}</em>
            </div>

            <div v-if="error" class="alert alert-danger mt-3 mb-0">{{ error }}</div>

            <label class="form-label mt-3" for="transfer-bed">Cama destino <span class="text-danger">*</span></label>
            <div v-if="loadingBeds" class="beds-loading"><span class="spinner-border spinner-border-sm text-primary"></span>Consultando camas disponibles…</div>
            <select v-else id="transfer-bed" v-model="form.destinationBedId" class="form-select" required>
              <option value="" disabled>Seleccione una cama disponible</option>
              <option v-for="option in availableBeds" :key="bedId(option)" :value="bedId(option)">
                {{ bedLabel(option) }}
              </option>
            </select>
            <small v-if="!loadingBeds && !availableBeds.length" class="text-warning d-block mt-1">No se encontraron camas disponibles para el traslado.</small>

            <div class="row g-3 mt-0">
              <div class="col-md-6">
                <label class="form-label" for="transfer-priority">Prioridad <span class="text-danger">*</span></label>
                <select id="transfer-priority" v-model="form.priority" class="form-select" required>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label" for="transfer-date">Fecha estimada <span class="text-danger">*</span></label>
                <input id="transfer-date" v-model="form.estimatedDate" type="datetime-local" class="form-control" required>
              </div>
            </div>

            <label class="form-label mt-3" for="transfer-reason">Motivo del traslado <span class="text-danger">*</span></label>
            <textarea id="transfer-reason" v-model.trim="form.reason" class="form-control" rows="3" maxlength="500" required placeholder="Describa la razón clínica o administrativa del traslado"></textarea>

            <label class="automatic-option mt-3">
              <input v-model="form.automaticApproval" class="form-check-input" type="checkbox">
              <span><strong>Aprobación automática</strong><small>Solicitar que el traslado sea aprobado inmediatamente, si el flujo lo permite.</small></span>
            </label>
          </div>

          <footer>
            <button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="close">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving || loadingBeds || !availableBeds.length">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="ph ph-paper-plane-tilt me-1"></i>Solicitar traslado
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { consultarCamas, solicitarTraslado } from '@/services/hospitalizacion'

const props = defineProps({ bed: { type: Object, required: true } })
const emit = defineEmits(['close', 'saved'])
const patient = props.bed.info_paciente || {}
const loadingBeds = ref(true)
const saving = ref(false)
const error = ref('')
const availableBeds = ref([])

const initialDate = new Date(Date.now() + 60 * 60 * 1000)
initialDate.setSeconds(0, 0)
const localDateTime = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
const form = reactive({ destinationBedId: '', priority: 'media', estimatedDate: localDateTime(initialDate), reason: '', automaticApproval: false })

const bedId = item => Number(item.id_cama ?? item.id)
function bedLabel(item) {
  const location = item.ubicacion || {}
  const path = [location.sucursal, location.torre, location.piso, location.sala, location.habitacion].filter(Boolean).join(' · ')
  return `${item.nombre || `Cama #${bedId(item)}`}${path ? ` — ${path}` : ''}`
}

async function loadBeds() {
  loadingBeds.value = true
  error.value = ''
  try {
    const beds = await consultarCamas({})
    availableBeds.value = beds.filter(item => bedId(item) !== Number(props.bed.id_cama))
  } catch (reason) {
    error.value = obtenerMensajeError(reason)
  } finally {
    loadingBeds.value = false
  }
}

function close() {
  if (!saving.value) emit('close')
}

async function submit() {
  if (!form.destinationBedId || !form.reason || !form.estimatedDate) return
  saving.value = true
  error.value = ''
  try {
    await solicitarTraslado({
      patient_id: Number(patient.id_paciente),
      id_cama_destino: Number(form.destinationBedId),
      reason: form.reason,
      prioridad: form.priority,
      fecha_estimada: `${form.estimatedDate.replace('T', ' ')}:00`,
      aprobacion_automatica: form.automaticApproval
    })
    emit('saved')
  } catch (reason) {
    error.value = obtenerMensajeError(reason)
  } finally {
    saving.value = false
  }
}

onMounted(loadBeds)
</script>

<style scoped>
.transfer-layer{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:1rem;background:rgba(5,16,27,.72);backdrop-filter:blur(5px)}
.transfer-modal{width:min(650px,100%);max-height:94vh;overflow:auto;border-radius:1rem;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.35)}
.transfer-modal>header{display:flex;align-items:center;gap:.8rem;padding:1.1rem 1.25rem;border-bottom:1px solid #e5ebf0}
.transfer-icon{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:13px;background:#e8f3fc;color:var(--bs-primary);font-size:1.25rem}
.transfer-modal header small{color:var(--bs-primary);font-size:.6rem;font-weight:800;letter-spacing:.06em}.transfer-modal h2{margin:.1rem 0;font-size:1.15rem}.transfer-modal header p{margin:0;color:#748396;font-size:.72rem}
.modal-body{padding:1.25rem}.current-location{display:flex;align-items:center;gap:.7rem;padding:.8rem;border:1px solid #dce9f2;border-radius:.75rem;background:#f5faff}.current-location>i{color:var(--bs-primary);font-size:1.3rem}.current-location span{min-width:0}.current-location small,.current-location strong{display:block}.current-location small{color:#7d8b9c;font-size:.62rem}.current-location em{margin-left:auto;color:#4f6578;font-size:.7rem;font-style:normal}
.beds-loading{display:flex;align-items:center;gap:.55rem;padding:.7rem;border:1px solid #dfe7ee;border-radius:.55rem;color:#677789;font-size:.76rem}.automatic-option{display:flex;align-items:flex-start;gap:.65rem;padding:.75rem;border:1px solid #e3e9ef;border-radius:.7rem;cursor:pointer}.automatic-option input{margin-top:.2rem}.automatic-option strong,.automatic-option small{display:block}.automatic-option strong{font-size:.78rem}.automatic-option small{color:#788698;font-size:.68rem}
.transfer-modal footer{display:flex;justify-content:flex-end;gap:.6rem;padding:1rem 1.25rem;border-top:1px solid #e5ebf0}
@media(max-width:575px){.current-location em{display:none}.transfer-modal footer{flex-direction:column-reverse}.transfer-modal footer .btn{width:100%}}
</style>
