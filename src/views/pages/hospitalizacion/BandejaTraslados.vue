<template>
  <main class="hh-page">
    <section class="tray-hero">
      <div>
        <span>HOSPITALIZACIÓN</span>
        <h1>Bandeja de traslados</h1>
        <p>Apruebe, ejecute o cancele los traslados de cama que están en curso.</p>
      </div>
      <button type="button" class="btn btn-light text-primary" :disabled="loading" title="Actualizar" @click="load">
        <i class="ph ph-arrows-clockwise"></i>
      </button>
    </section>

    <section class="tray-filters">
      <div>
        <label class="form-label" for="tray-station">Estación de enfermería</label>
        <select id="tray-station" v-model="stationId" class="form-select" @change="load">
          <option value="">Todas las estaciones</option>
          <option v-for="station in stations" :key="station.id" :value="station.id">{{ station.nombre }}</option>
        </select>
      </div>
      <div class="tray-counters">
        <span v-for="counter in counters" :key="counter.status" :class="counter.css"><strong>{{ counter.total }}</strong>{{ counter.label }}</span>
      </div>
    </section>

    <div v-if="notice" class="alert alert-success mt-3">{{ notice }}</div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span></div>
    <div v-else-if="!transfers.length" class="tray-empty">
      <i class="ph ph-arrows-left-right"></i>
      <h3>No hay traslados en curso</h3>
      <p>Los traslados se solicitan desde la estación de enfermería o desde el detalle de la hospitalización.</p>
    </div>

    <section v-else class="tray-list">
      <article v-for="transfer in transfers" :key="transfer.id" class="tray-card" :data-testid="`traslado-${transfer.id}`">
        <header>
          <span class="badge" :class="statusCss(transfer.status)">{{ transfer.status }}</span>
          <span class="priority" :class="`is-${transfer.prioridad}`">Prioridad {{ transfer.prioridad || 'media' }}</span>
          <small class="ms-auto">#{{ transfer.id }} · {{ formatDateTime(transfer.created_at) }}</small>
        </header>

        <div class="patient">
          <strong>{{ transfer.patient?.name || 'Paciente' }}</strong>
          <small>{{ transfer.patient?.identificacion }}</small>
        </div>

        <!-- Origen → destino, con la estación de cada cama -->
        <div class="route">
          <div><small>Desde</small><strong>{{ transfer.cama_origen?.nombre || 'Sin cama' }}</strong><em>{{ bedPlace(transfer.cama_origen) }}</em></div>
          <i class="ph ph-arrow-right"></i>
          <div><small>Hacia</small><strong>{{ transfer.cama_destino?.nombre || 'Cama destino' }}</strong><em>{{ bedPlace(transfer.cama_destino) }}</em></div>
        </div>

        <p class="reason"><i class="ph ph-chat-text me-1"></i>{{ transfer.reason || 'Sin motivo registrado' }}</p>
        <small class="requested">Solicitado por {{ transfer.requested_by?.name || 'Sistema' }}</small>

        <!-- Solo se muestran las acciones permitidas para el estado actual -->
        <footer>
          <router-link v-if="transfer.id_hospitalizacion" :to="`/hospitalizacion/${transfer.id_hospitalizacion}`" class="btn btn-sm btn-link">Ver hospitalización</router-link>
          <div class="ms-auto d-flex flex-wrap gap-2">
            <button v-for="action in actionsFor(transfer)" :key="action.key" type="button" class="btn btn-sm" :class="action.css" @click="openAction(transfer, action)">
              <i :class="action.icon" class="me-1"></i>{{ action.label }}
            </button>
          </div>
        </footer>
      </article>
    </section>

    <!-- Confirmación de la acción elegida -->
    <Teleport to="body">
      <div v-if="pending" class="tray-layer" @mousedown.self="closeAction">
        <section class="tray-modal" role="dialog" aria-modal="true" aria-labelledby="tray-modal-title">
          <header>
            <div>
              <small>TRASLADO #{{ pending.transfer.id }}</small>
              <h3 id="tray-modal-title">{{ pending.action.title }}</h3>
              <p class="mb-0">{{ pending.transfer.patient?.name }} · {{ pending.transfer.cama_origen?.nombre || 'Sin cama' }} → {{ pending.transfer.cama_destino?.nombre }}</p>
            </div>
            <button type="button" class="btn-close" :disabled="saving" aria-label="Cerrar" @click="closeAction"></button>
          </header>
          <form @submit.prevent="executeAction">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
              <p class="mb-0">{{ pending.action.explanation }}</p>
              <template v-if="pending.action.note">
                <label class="form-label mt-3" for="tray-note">{{ pending.action.note }} <span v-if="pending.action.noteRequired" class="text-danger">*</span></label>
                <textarea id="tray-note" v-model.trim="note" class="form-control" rows="3" maxlength="500" :required="pending.action.noteRequired"></textarea>
              </template>
            </div>
            <footer>
              <button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="closeAction">Volver</button>
              <button type="submit" class="btn" :class="pending.action.css" :disabled="saving || (pending.action.noteRequired && note.length < 5)">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>{{ pending.action.confirm }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import {
  aprobarTraslado, cancelarTraslado, completarTraslado, iniciarTransitoTraslado,
  listarEstaciones, listarTrasladosAbiertos, rechazarTraslado,
} from '@/services/hospitalizacion'
import { usePermisos } from '@/store/pinia/permisos'
// Oculta las acciones que el usuario no tiene permiso de hacer (el backend igual lo valida).
const { puede } = usePermisos()


const transfers = ref([])
const stations = ref([])
const stationId = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const modalError = ref('')
const pending = ref(null) // { transfer, action } que se está confirmando
const note = ref('')

// Qué se puede hacer en cada estado. Es el mismo ciclo que valida el backend:
// Pendiente → Aprobada → En Tránsito → Completada; rechazar solo si está pendiente;
// cancelar mientras no haya terminado.
const ACTIONS = {
  approve: { key: 'approve', label: 'Aprobar', icon: 'ph ph-check', css: 'btn-primary', title: 'Aprobar traslado', confirm: 'Aprobar', explanation: 'La cama destino queda asignada a este traslado. El paciente sigue en su cama actual hasta que se complete.', note: 'Observaciones (opcional)', run: (t, n) => aprobarTraslado(t.id, n) },
  reject: { key: 'reject', label: 'Rechazar', icon: 'ph ph-x', css: 'btn-outline-danger', title: 'Rechazar traslado', confirm: 'Rechazar', explanation: 'La solicitud se cierra y el paciente permanece en su cama actual.', note: 'Motivo del rechazo', noteRequired: true, run: (t, n) => rechazarTraslado(t.id, n) },
  transit: { key: 'transit', label: 'Paciente en camino', icon: 'ph ph-person-simple-walk', css: 'btn-outline-primary', title: 'Marcar en tránsito', confirm: 'Marcar en tránsito', explanation: 'Indica que el paciente ya salió de su cama y va hacia la cama destino.', run: t => iniciarTransitoTraslado(t.id) },
  complete: { key: 'complete', label: 'Completar', icon: 'ph ph-flag-checkered', css: 'btn-success', title: 'Completar traslado', confirm: 'Completar traslado', explanation: 'El paciente queda en la cama destino y la cama de origen se libera. Hágalo solo cuando el paciente ya esté en la nueva cama.', note: 'Observaciones (opcional)', run: (t, n) => completarTraslado(t.id, n) },
  cancel: { key: 'cancel', label: 'Cancelar', icon: 'ph ph-prohibit', css: 'btn-outline-secondary', title: 'Cancelar traslado', confirm: 'Cancelar traslado', explanation: 'El traslado no se realizará. El paciente permanece en su cama actual.', note: 'Motivo de la cancelación', noteRequired: true, run: (t, n) => cancelarTraslado(t.id, n) },
}
const BY_STATUS = {
  Pendiente: ['approve', 'reject', 'cancel'],
  Aprobada: ['transit', 'complete', 'cancel'],
  'En Tránsito': ['complete', 'cancel'],
}
// Permiso que exige cada acción (el mismo que valida el backend).
const PERMISO_ACCION = {
  approve: 'hospitalizacion.traslados.aprobar', reject: 'hospitalizacion.traslados.aprobar',
  transit: 'hospitalizacion.traslados.ejecutar', complete: 'hospitalizacion.traslados.ejecutar',
  cancel: 'hospitalizacion.traslados.cancelar',
}
const actionsFor = transfer => (BY_STATUS[transfer.status] || [])
  .filter(key => puede(PERMISO_ACCION[key]))
  .map(key => ACTIONS[key])

const counters = computed(() => [
  { status: 'Pendiente', label: 'pendientes', css: 'is-pending' },
  { status: 'Aprobada', label: 'aprobados', css: 'is-approved' },
  { status: 'En Tránsito', label: 'en tránsito', css: 'is-transit' },
].map(counter => ({ ...counter, total: transfers.value.filter(t => t.status === counter.status).length })))

const statusCss = status => ({ Pendiente: 'bg-warning-subtle text-warning', Aprobada: 'bg-info-subtle text-info', 'En Tránsito': 'bg-primary-subtle text-primary' }[status] || 'bg-secondary-subtle text-secondary')
const bedPlace = bed => [bed?.habitacion?.nombre, bed?.habitacion?.sala?.estacion_enfermeria?.nombre].filter(Boolean).join(' · ') || 'Ubicación no informada'
const formatDateTime = value => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : ''

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await listarTrasladosAbiertos(stationId.value)
    transfers.value = response?.data || []
  } catch (reason) {
    error.value = obtenerMensajeError(reason)
  } finally {
    loading.value = false
  }
}

function openAction(transfer, action) {
  pending.value = { transfer, action }
  note.value = ''
  modalError.value = ''
  notice.value = ''
}

function closeAction() {
  if (!saving.value) pending.value = null
}

async function executeAction() {
  saving.value = true
  modalError.value = ''
  try {
    const { transfer, action } = pending.value
    await action.run(transfer, note.value)
    notice.value = `${action.title}: listo para ${transfer.patient?.name || 'el paciente'}.`
    pending.value = null
    await load()
  } catch (reason) {
    // Ej.: "La cama destino ya no está disponible" si otra persona la ocupó mientras tanto.
    modalError.value = obtenerMensajeError(reason)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    stations.value = await listarEstaciones()
  } catch {
    // Sin la lista de estaciones la bandeja sigue funcionando con "Todas las estaciones".
  }
  await load()
})
</script>

<style scoped>
.tray-hero{display:flex;align-items:center;justify-content:space-between;padding:1.3rem 1.5rem;border-radius:1rem;background:linear-gradient(120deg,#104d75,#168eae);color:#fff}
.tray-hero span{font-size:.7rem;font-weight:800;letter-spacing:.08em}
.tray-hero h1{margin:.2rem 0;font-size:1.5rem}
.tray-hero p{margin:0;opacity:.85}
.tray-filters{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:1rem;margin-top:1rem;padding:.9rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}
.tray-filters>div:first-child{min-width:260px}
.tray-counters{display:flex;gap:.5rem;flex-wrap:wrap}
.tray-counters span{padding:.45rem .75rem;border-radius:.6rem;font-size:.8rem}
.tray-counters strong{margin-right:.3rem;font-size:1rem}
.is-pending{background:#fff4d6;color:#8a5a00}.is-approved{background:#e3f4fa;color:#1a6f8d}.is-transit{background:#e8eefc;color:#3553a5}
.tray-empty{margin-top:1rem;padding:2.5rem;text-align:center;color:#788897;border:1px dashed #cfdae2;border-radius:.8rem;background:#fff}
.tray-empty i{font-size:2.2rem}
.tray-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:.8rem;margin-top:1rem}
.tray-card{display:flex;flex-direction:column;gap:.6rem;padding:1rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}
.tray-card header,.tray-card footer{display:flex;align-items:center;gap:.5rem}
.tray-card header small{color:#7b8997}
.priority{font-size:.72rem;font-weight:700;text-transform:capitalize;color:#5f7180}
.priority.is-urgente{color:#c0392b}.priority.is-alta{color:#b86b00}
.patient strong,.patient small{display:block}
.patient small{color:#718292}
.route{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:.5rem;padding:.6rem;border-radius:.6rem;background:#f4f8fb}
.route small,.route strong,.route em{display:block}
.route small{color:#7b8997;font-size:.68rem}
.route em{font-style:normal;color:#718292;font-size:.72rem}
.route i{color:#287fa9;font-size:1.2rem}
.reason{margin:0;color:#4d6071;font-size:.85rem}
.requested{color:#8593a0}
.tray-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:#071522bd}
.tray-modal{width:min(520px,100%);border-radius:1rem;background:#fff}
.tray-modal>header{display:flex;justify-content:space-between;gap:1rem;padding:1rem 1.2rem;border-bottom:1px solid #e3e9ed}
.tray-modal header small{font-size:.68rem;font-weight:800;color:#287fa9}
.tray-modal h3{margin:0;font-size:1.05rem}
.tray-modal .modal-body{padding:1.2rem}
.tray-modal footer{display:flex;justify-content:flex-end;gap:.5rem;padding:1rem 1.2rem;border-top:1px solid #e3e9ed}
</style>
