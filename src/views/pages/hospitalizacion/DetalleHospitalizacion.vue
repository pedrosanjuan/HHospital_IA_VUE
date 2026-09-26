<template>
  <main class="hh-page hh-detail-page">
    <router-link to="/hospitalizacion/censo" class="hh-back-link text-primary d-inline-flex align-items-center mb-3">
      <i class="ri-arrow-left-line me-1"></i> Volver al censo
    </router-link>

    <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span></div>
    <div v-else-if="errorMessage && !detail" class="alert alert-danger">{{ errorMessage }}</div>

    <template v-else-if="detail">
      <!-- Encabezado con la identidad del paciente y el estado del episodio -->
      <section class="stay-hero">
        <span class="stay-avatar">{{ initials(patient.name) }}</span>
        <div class="flex-grow-1">
          <small>HOSPITALIZACIÓN #{{ hospitalization.id }}</small>
          <h1>{{ patient.name || 'Paciente' }}</h1>
          <p>{{ patient.identificacion || 'Sin identificación' }} · Ingreso {{ formatDateTime(hospitalization.fecha_ingreso) }}</p>
        </div>
        <span class="stay-status" :class="`is-${hospitalization.estado}`" data-testid="estado-hospitalizacion">{{ statusLabel }}</span>
      </section>

      <div v-if="notice" class="alert alert-success mt-3">{{ notice }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <!-- Acciones disponibles mientras el paciente sigue hospitalizado -->
      <section v-if="isActive" class="stay-actions">
        <div><small>ACCIONES</small><h2>Gestión de la estancia</h2></div>
        <div class="d-flex flex-wrap gap-2">
          <router-link :to="attentionRoute" class="btn btn-outline-primary"><i class="ph ph-stethoscope me-1"></i>Abrir atención</router-link>
          <button v-if="puede('hospitalizacion.traslados.solicitar')" type="button" class="btn btn-outline-primary" :disabled="Boolean(openTransfers.length)" :title="openTransfers.length ? 'Ya hay un traslado en curso' : ''" @click="showTransfer = true">
            <i class="ph ph-arrows-left-right me-1"></i>Solicitar traslado
          </button>
          <button v-if="puede('hospitalizacion.egreso.registrar')" type="button" class="btn btn-danger" @click="openDischarge"><i class="ph ph-sign-out me-1"></i>Egresar paciente</button>
        </div>
      </section>

      <div class="row g-3 mt-1">
        <div class="col-lg-8">
          <b-card no-body class="mb-3">
            <b-card-header><h4 class="mb-0">Resumen de la estancia</h4></b-card-header>
            <b-card-body>
              <div class="summary-grid">
                <div><small>Días hospitalizado</small><strong>{{ detail.dias_hospitalizacion ?? 0 }} días</strong></div>
                <div><small>Fecha de ingreso</small><strong>{{ formatDateTime(hospitalization.fecha_ingreso) }}</strong></div>
                <div><small>Admisión (orden de trabajo)</small><strong>#{{ hospitalization.id_orden_trabajo || '—' }}</strong></div>
                <div><small>Responsable</small><strong>{{ hospitalization.usuario_responsable?.name || 'No asignado' }}</strong></div>
                <div v-if="hospitalization.fecha_egreso"><small>Fecha de egreso</small><strong>{{ formatDateTime(hospitalization.fecha_egreso) }}</strong></div>
              </div>
            </b-card-body>
          </b-card>

          <!-- Traslados que aún no terminan: se gestionan en la bandeja -->
          <b-card no-body class="mb-3">
            <b-card-header class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Traslados en curso</h4>
              <router-link to="/hospitalizacion/traslados" class="btn btn-sm btn-outline-primary">Ir a la bandeja</router-link>
            </b-card-header>
            <b-card-body>
              <div v-if="!openTransfers.length" class="empty-state"><i class="ph ph-arrows-left-right"></i><p class="mb-0">No hay traslados en curso.</p></div>
              <article v-for="transfer in openTransfers" :key="transfer.id" class="transfer-row">
                <span class="badge" :class="transferBadge(transfer.status)">{{ transfer.status }}</span>
                <div>
                  <strong>{{ transfer.cama_origen?.nombre || 'Sin cama' }} → {{ transfer.cama_destino?.nombre || 'Cama destino' }}</strong>
                  <small>{{ transfer.reason || 'Sin motivo' }} · Prioridad {{ transfer.prioridad || 'media' }}</small>
                </div>
              </article>
            </b-card-body>
          </b-card>

          <!-- Recorrido del paciente: ingreso, traslados y egreso -->
          <b-card no-body>
            <b-card-header><h4 class="mb-0">Historial de ubicaciones</h4></b-card-header>
            <b-card-body>
              <div v-if="!locations.length" class="empty-state"><p class="mb-0">Sin movimientos registrados.</p></div>
              <ol class="timeline">
                <li v-for="log in locations" :key="log.id">
                  <span class="dot" :class="`is-${log.tipo_movimiento}`"></span>
                  <div>
                    <strong class="text-capitalize">{{ log.tipo_movimiento || 'movimiento' }}</strong>
                    <small>{{ formatDateTime(log.arrival_time) }}{{ log.cama?.nombre ? ` · ${log.cama.nombre}` : '' }}</small>
                    <p v-if="log.observaciones">{{ log.observaciones }}</p>
                  </div>
                </li>
              </ol>
            </b-card-body>
          </b-card>
        </div>

        <div class="col-lg-4">
          <b-card no-body>
            <b-card-header><h4 class="mb-0">Ubicación actual</h4></b-card-header>
            <b-card-body>
              <template v-if="isActive">
                <div class="location-icon"><i class="ri-hotel-bed-line"></i></div>
                <h4 class="text-center mb-1">{{ currentLocation.cama?.numero || 'Cama asignada' }}</h4>
                <p class="text-muted text-center">{{ currentLocation.cama?.habitacion || 'Habitación sin especificar' }}</p>
                <hr>
                <dl class="location-list">
                  <dt>Estación</dt><dd>{{ currentLocation.estacion_enfermeria?.nombre || 'No informada' }}</dd>
                </dl>
              </template>
              <p v-else class="text-muted text-center mb-0">El paciente ya no ocupa una cama.</p>
            </b-card-body>
          </b-card>
        </div>
      </div>
    </template>

    <!-- Traslado: se reutiliza el mismo modal de la estación de enfermería -->
    <SolicitarTrasladoModal v-if="showTransfer" :bed="transferBed" @close="showTransfer = false" @saved="transferSaved" />

    <!-- Egreso: acción irreversible, por eso muestra qué va a pasar y pide confirmación -->
    <Teleport to="body">
      <div v-if="showDischarge" class="discharge-layer" @mousedown.self="closeDischarge">
        <section class="discharge-modal" role="dialog" aria-modal="true" aria-labelledby="discharge-title">
          <header>
            <div><small>EGRESO HOSPITALARIO</small><h3 id="discharge-title">Egresar a {{ patient.name }}</h3><p class="mb-0">{{ patient.identificacion }} · {{ currentLocation.cama?.numero || 'Sin cama' }}</p></div>
            <button type="button" class="btn-close" :disabled="discharging" aria-label="Cerrar" @click="closeDischarge"></button>
          </header>
          <form @submit.prevent="discharge">
            <div class="modal-body">
              <div v-if="dischargeError" class="alert alert-danger">{{ dischargeError }}</div>
              <div class="discharge-warning">
                <i class="ph ph-warning"></i>
                <div>
                  <strong>Al confirmar el egreso:</strong>
                  <ul>
                    <li>La cama queda libre para otro paciente.</li>
                    <li>Las dosis de medicamentos pendientes y los procedimientos sin iniciar se suspenden.</li>
                    <li>La admisión se cierra y no se pueden registrar más atenciones en ella.</li>
                  </ul>
                </div>
              </div>
              <label class="form-label mt-3" for="discharge-notes">Observaciones del egreso <span class="text-danger">*</span></label>
              <textarea id="discharge-notes" v-model.trim="dischargeForm.notes" class="form-control" rows="3" maxlength="1000" required placeholder="Ej.: Alta médica, paciente estable, sale con acompañante."></textarea>
              <div class="form-check mt-3">
                <input id="discharge-confirm" v-model="dischargeForm.confirmed" class="form-check-input" type="checkbox">
                <label class="form-check-label" for="discharge-confirm">Confirmo que el paciente tiene orden médica de salida.</label>
              </div>
            </div>
            <footer>
              <button type="button" class="btn btn-outline-secondary" :disabled="discharging" @click="closeDischarge">Cancelar</button>
              <button type="submit" class="btn btn-danger" :disabled="discharging || !dischargeForm.confirmed || dischargeForm.notes.length < 5">
                <span v-if="discharging" class="spinner-border spinner-border-sm me-1"></span>Confirmar egreso
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
import { useRoute, useRouter } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { consultarDetalle, egresarHospitalizacion } from '@/services/hospitalizacion'
import SolicitarTrasladoModal from '@/views/clinical/SolicitarTrasladoModal.vue'
import { usePermisos } from '@/store/pinia/permisos'
// Oculta las acciones que el usuario no tiene permiso de hacer (el backend igual lo valida).
const { puede } = usePermisos()


const route = useRoute()
const router = useRouter()
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')
const detail = ref(null)
const showTransfer = ref(false)
const showDischarge = ref(false)
const discharging = ref(false)
const dischargeError = ref('')
const dischargeForm = reactive({ notes: '', confirmed: false })

const hospitalization = computed(() => detail.value?.hospitalizacion || {})
const patient = computed(() => hospitalization.value.paciente || {})
const currentLocation = computed(() => detail.value?.ubicacion_actual?.ubicacion || {})
const openTransfers = computed(() => detail.value?.traslados_pendientes || [])
const locations = computed(() => [...(hospitalization.value.ubicaciones || [])].sort((a, b) => String(b.arrival_time).localeCompare(String(a.arrival_time))))
// "Vigente" = activo o en traslado: solo entonces se puede trasladar o egresar.
const isActive = computed(() => ['activo', 'en_traslado'].includes(hospitalization.value.estado))
const statusLabel = computed(() => ({ activo: 'Hospitalizado', en_traslado: 'En traslado', egresado: 'Egresado', suspendido: 'Suspendido' }[hospitalization.value.estado] || 'Sin estado'))

// Misma ruta de atención que se usa desde la estación de enfermería.
const attentionRoute = computed(() => ({
  path: `/hospitalizacion/pacientes/${hospitalization.value.id_paciente}/atencion`,
  query: {
    hospitalizacion: hospitalization.value.id,
    orden: hospitalization.value.id_orden_trabajo,
    ordenServicio: hospitalization.value.cama_actual?.id_orden_servicio,
    cama: hospitalization.value.id_cama_actual,
    estacion: hospitalization.value.id_estacion_actual,
  },
}))

// El modal de traslado espera la "cama" tal como la entrega la estación de enfermería.
const transferBed = computed(() => ({
  id_cama: hospitalization.value.id_cama_actual,
  nombre: currentLocation.value.cama?.numero,
  info_paciente: {
    id_paciente: hospitalization.value.id_paciente,
    nombre: patient.value.name,
    identificacion: patient.value.identificacion,
    hospitalizacion: { id: hospitalization.value.id },
  },
}))

const initials = value => String(value || 'P').split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
const formatDateTime = value => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'No informada'
const transferBadge = status => ({ Pendiente: 'bg-warning-subtle text-warning', Aprobada: 'bg-info-subtle text-info', 'En Tránsito': 'bg-primary-subtle text-primary' }[status] || 'bg-secondary-subtle text-secondary')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await consultarDetalle(route.params.id)
    detail.value = response.data
  } catch (error) {
    errorMessage.value = obtenerMensajeError(error)
  } finally {
    loading.value = false
  }
}

function openDischarge() {
  Object.assign(dischargeForm, { notes: '', confirmed: false })
  dischargeError.value = ''
  showDischarge.value = true
}

function closeDischarge() {
  if (discharging.value) return
  showDischarge.value = false
  // Si se llegó con ?accion=egreso, se limpia para que al recargar no se abra otra vez.
  if (route.query.accion) router.replace({ query: { ...route.query, accion: undefined } })
}

async function discharge() {
  discharging.value = true
  dischargeError.value = ''
  try {
    await egresarHospitalizacion(hospitalization.value.id, dischargeForm.notes)
    showDischarge.value = false
    notice.value = 'Paciente egresado. La cama quedó disponible y la admisión se cerró.'
    await load()
  } catch (error) {
    // Por ejemplo: "No se puede egresar con un traslado en curso (#8, Aprobada)…"
    dischargeError.value = obtenerMensajeError(error)
  } finally {
    discharging.value = false
  }
}

async function transferSaved() {
  showTransfer.value = false
  notice.value = 'Solicitud de traslado creada. Gestiónela desde la bandeja de traslados.'
  await load()
}

onMounted(async () => {
  await load()
  // Desde la estación de enfermería, "Egresar paciente" llega con ?accion=egreso.
  if (route.query.accion === 'egreso' && isActive.value && puede('hospitalizacion.egreso.registrar')) openDischarge()
})
</script>

<style scoped>
.stay-hero{display:flex;align-items:center;gap:.9rem;padding:1.2rem 1.4rem;border-radius:1rem;background:linear-gradient(120deg,#124c76,#148bac);color:#fff}
.stay-hero small,.stay-hero h1,.stay-hero p{display:block;margin:0}
.stay-hero small{font-size:.68rem;font-weight:800;letter-spacing:.08em;opacity:.8}
.stay-hero h1{font-size:1.3rem}
.stay-hero p{opacity:.85}
.stay-avatar{display:grid;place-items:center;width:52px;height:52px;border-radius:14px;background:#ffffff26;font-weight:800}
.stay-status{padding:.4rem .8rem;border-radius:20px;background:#ffffff26;font-weight:700}
.stay-status.is-egresado{background:#ffffffe6;color:#5a6b78}
.stay-status.is-en_traslado{background:#fff3cd;color:#8a5a00}
.stay-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.8rem;margin-top:1rem;padding:.9rem 1rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}
.stay-actions small{color:#7b8997;font-size:.67rem;font-weight:800}
.stay-actions h2{margin:0;font-size:1rem}
.summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1rem}
.summary-grid small,.summary-grid strong{display:block}
.summary-grid small{color:var(--bs-secondary-color)}
.transfer-row{display:flex;align-items:center;gap:.8rem;padding:.7rem;border:1px solid #e3e9ed;border-radius:.6rem;margin-bottom:.5rem}
.transfer-row small,.transfer-row strong{display:block}
.transfer-row small{color:#718292}
.timeline{list-style:none;margin:0;padding:0;display:grid;gap:.7rem}
.timeline li{display:grid;grid-template-columns:12px 1fr;gap:.7rem}
.timeline small,.timeline strong{display:block}
.timeline small{color:#718292}
.timeline p{margin:.2rem 0 0;color:#5f7180;font-size:.8rem;white-space:pre-line}
.dot{width:10px;height:10px;margin-top:.35rem;border-radius:50%;background:#2780aa}
.dot.is-egreso{background:#c0392b}.dot.is-traslado{background:#e0a100}.dot.is-ingreso{background:#1e9e5a}
.empty-state{padding:1.2rem;text-align:center;color:#788897}
.empty-state i{font-size:1.8rem}
.location-icon{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;margin:0 auto 1rem;background:rgba(var(--bs-primary-rgb),.12);color:var(--bs-primary);font-size:2rem}
.location-list{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin:0}
.location-list dt{color:var(--bs-secondary-color);font-weight:500}
.location-list dd{text-align:right;margin:0;font-weight:600}
.discharge-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:#071522bd}
.discharge-modal{width:min(560px,100%);max-height:94vh;overflow:auto;border-radius:1rem;background:#fff}
.discharge-modal>header{display:flex;justify-content:space-between;gap:1rem;padding:1rem 1.2rem;border-bottom:1px solid #e3e9ed}
.discharge-modal header small{font-size:.68rem;font-weight:800;color:#c0392b}
.discharge-modal h3{margin:0;font-size:1.05rem}
.discharge-modal .modal-body{padding:1.2rem}
.discharge-modal footer{display:flex;justify-content:flex-end;gap:.5rem;padding:1rem 1.2rem;border-top:1px solid #e3e9ed}
.discharge-warning{display:flex;gap:.7rem;padding:.8rem;border-radius:.7rem;background:#fff3df;color:#8a5a1e}
.discharge-warning i{font-size:1.3rem}
.discharge-warning ul{margin:.3rem 0 0;padding-left:1.1rem}
@media (max-width:575px){.stay-hero{flex-wrap:wrap}}
</style>
