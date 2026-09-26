<template>
  <div class="vital-layer" @mousedown.self="close">
    <section class="vital-modal" role="dialog" aria-modal="true" aria-labelledby="vital-title">
      <header>
        <div class="title">
          <span><i class="ph ph-heartbeat"></i></span>
          <div><small>SIGNOS VITALES</small><h2 id="vital-title">{{ patient.nombre }}</h2><p>{{ patient.identificacion }}</p></div>
        </div>
        <button type="button" class="btn-close" :disabled="saving" aria-label="Cerrar" @click="close"></button>
      </header>

      <!-- Pestañas: ver la última toma o registrar una nueva -->
      <nav class="vital-tabs">
        <button type="button" :class="{ active: tab === 'ultima' }" @click="tab = 'ultima'"><i class="ph ph-clock-counter-clockwise me-1"></i>Última toma</button>
        <button v-if="puede('historia_clinica.signos_vitales.registrar')" type="button" :class="{ active: tab === 'registrar' }" :disabled="!canRegister" :title="canRegister ? '' : 'El paciente no tiene una admisión activa'" @click="tab = 'registrar'"><i class="ph ph-plus me-1"></i>Registrar toma</button>
      </nav>

      <div class="modal-body">
        <div v-if="notice" class="alert alert-success">{{ notice }}</div>

        <!-- Última toma -->
        <template v-if="tab === 'ultima'">
          <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span></div>
          <div v-else-if="error" class="alert alert-danger">{{ error }} <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="load">Reintentar</button></div>
          <template v-else>
            <div v-if="latest?.tiene_alertas" class="alert alert-danger"><i class="ph ph-warning me-2"></i><strong>Los últimos signos vitales presentan alertas clínicas.</strong></div>
            <div v-if="latest" class="vitals">
              <div><i class="ph ph-wave-sine"></i><small>Presión arterial</small><strong>{{ latest.presion_arterial?.texto || `${latest.sv_pa_sistolica ?? '—'}/${latest.sv_pa_diastolica ?? '—'}` }}</strong></div>
              <div><i class="ph ph-heart"></i><small>Frecuencia cardiaca</small><strong>{{ latest.frecuencia_cardiaca ?? '—' }} <em>lpm</em></strong></div>
              <div><i class="ph ph-wind"></i><small>Frecuencia respiratoria</small><strong>{{ latest.frecuencia_respiratoria ?? '—' }} <em>rpm</em></strong></div>
              <div><i class="ph ph-thermometer"></i><small>Temperatura</small><strong>{{ latest.temperatura ?? '—' }} <em>°C</em></strong></div>
              <div><i class="ph ph-drop"></i><small>Saturación</small><strong>{{ latest.saturacion_oxigeno ?? latest.saturacion ?? '—' }} <em>%</em></strong></div>
              <div><i class="ph ph-clock"></i><small>Última toma</small><strong class="date">{{ formatDate(latest.fecha_hora_toma || latest.fecha_actividad) }}</strong></div>
            </div>
            <div v-else class="empty"><i class="ph ph-heartbeat"></i><h3>Sin signos vitales registrados</h3><p>Use "Registrar toma" para agregar la primera.</p></div>
          </template>
        </template>

        <!-- Registrar una toma nueva -->
        <form v-else id="vital-form" novalidate @submit.prevent="submit">
          <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
          <p class="small text-muted">Registre al menos un signo. Los campos vacíos no se guardan.</p>
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-sistolica">PA sistólica <em>mmHg</em></label>
              <input id="sv-sistolica" v-model="form.presion_arterial_sistolica" type="number" min="30" max="300" class="form-control" :class="{ 'is-invalid': fieldErrors.presion_arterial_sistolica }">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-diastolica">PA diastólica <em>mmHg</em></label>
              <input id="sv-diastolica" v-model="form.presion_arterial_diastolica" type="number" min="10" max="200" class="form-control" :class="{ 'is-invalid': fieldErrors.presion_arterial_diastolica }">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-fc">Frec. cardiaca <em>lpm</em></label>
              <input id="sv-fc" v-model="form.frecuencia_cardiaca" type="number" min="0" max="300" class="form-control">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-fr">Frec. respiratoria <em>rpm</em></label>
              <input id="sv-fr" v-model="form.frecuencia_respiratoria" type="number" min="0" max="100" class="form-control">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-temp">Temperatura <em>°C</em></label>
              <input id="sv-temp" v-model="form.temperatura" type="number" step="0.1" min="30" max="45" class="form-control" :class="{ 'is-invalid': fieldErrors.temperatura }">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-spo2">Saturación <em>%</em></label>
              <input id="sv-spo2" v-model="form.saturacion_oxigeno" type="number" min="0" max="100" class="form-control">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-gluco">Glucometría <em>mg/dL</em></label>
              <input id="sv-gluco" v-model="form.glucometria" type="number" min="0" max="1000" class="form-control">
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="sv-dolor">Dolor <em>0 a 10</em></label>
              <input id="sv-dolor" v-model="form.dolor_escala" type="number" min="0" max="10" class="form-control">
            </div>
            <div class="col-12">
              <label class="form-label" for="sv-obs">Observaciones</label>
              <textarea id="sv-obs" v-model.trim="form.observaciones" class="form-control" rows="2" maxlength="1000"></textarea>
            </div>
          </div>
        </form>
      </div>

      <footer>
        <span v-if="tab === 'ultima'">{{ total }} registros recientes</span><span v-else></span>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="close">Cerrar</button>
          <button v-if="tab === 'registrar'" type="submit" form="vital-form" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Guardar toma
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { consultarUltimosSignosVitales, registrarSignosVitales } from '@/services/hospitalizacion'
import { usePermisos } from '@/store/pinia/permisos'
// Oculta las acciones que el usuario no tiene permiso de hacer (el backend igual lo valida).
const { puede } = usePermisos()


// patient: el paciente de la cama (info_paciente de la estación de enfermería).
const props = defineProps({ patient: { type: Object, required: true } })
const emit = defineEmits(['close', 'saved'])

const tab = ref('ultima')
const data = ref(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const formError = ref('')
const fieldErrors = ref({})
const notice = ref('')
const emptyForm = () => ({
  presion_arterial_sistolica: '', presion_arterial_diastolica: '', frecuencia_cardiaca: '',
  frecuencia_respiratoria: '', temperatura: '', saturacion_oxigeno: '', glucometria: '',
  dolor_escala: '', observaciones: '',
})
const form = reactive(emptyForm())

const workOrderId = computed(() => props.patient?.hospitalizacion?.id_orden_trabajo)
const canRegister = computed(() => Boolean(props.patient?.id_paciente && workOrderId.value))
const rows = computed(() => Array.isArray(data.value) ? data.value : data.value?.data || data.value?.registros || [])
const latest = computed(() => data.value?.ultimo || rows.value[0] || props.patient?.signos_vitales?.ultimo || null)
const total = computed(() => data.value?.total_registros ?? rows.value.length ?? props.patient?.signos_vitales?.total_registros ?? 0)
const formatDate = value => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(String(value).replace(' ', 'T'))) : 'No informada'

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await consultarUltimosSignosVitales(props.patient.id_paciente)
  } catch (reason) {
    error.value = obtenerMensajeError(reason)
  } finally {
    loading.value = false
  }
}

function close() {
  if (!saving.value) emit('close')
}

// Revisión rápida antes de enviar: los mismos controles que hace el backend, para avisar
// sin esperar la respuesta (el backend los vuelve a validar de todas formas).
function validate() {
  const errors = {}
  const hasAny = Object.entries(form).some(([key, value]) => key !== 'observaciones' && value !== '' && value !== null)
  if (!hasAny) return 'Registre al menos un signo vital.'
  const sys = Number(form.presion_arterial_sistolica), dia = Number(form.presion_arterial_diastolica)
  if (form.presion_arterial_sistolica !== '' && form.presion_arterial_diastolica !== '' && dia >= sys) {
    errors.presion_arterial_diastolica = true
    fieldErrors.value = errors
    return 'La presión diastólica debe ser menor que la sistólica. Revise si los valores están invertidos.'
  }
  fieldErrors.value = errors
  return ''
}

async function submit() {
  formError.value = validate()
  if (formError.value) return
  saving.value = true
  try {
    // Solo se envían los campos diligenciados, como números.
    const payload = { id_paciente: Number(props.patient.id_paciente), id_orden_trabajo: Number(workOrderId.value) }
    for (const [key, value] of Object.entries(form)) {
      if (value === '' || value === null) continue
      payload[key] = key === 'observaciones' ? value : Number(value)
    }
    const response = await registrarSignosVitales(payload)
    notice.value = response?.tiene_alertas
      ? `Toma registrada. ¡Atención! ${response.alertas.length} alerta(s) clínica(s): informe al médico.`
      : 'Toma registrada correctamente.'
    Object.assign(form, emptyForm())
    tab.value = 'ultima'
    await load()
    emit('saved')
  } catch (reason) {
    formError.value = obtenerMensajeError(reason)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.vital-layer{position:fixed;inset:0;z-index:1080;display:grid;place-items:center;padding:1rem;background:rgba(6,19,33,.65);backdrop-filter:blur(5px)}
.vital-modal{width:min(720px,100%);max-height:94vh;overflow:auto;border-radius:1rem;background:#fff;box-shadow:0 30px 90px rgba(0,0,0,.3)}
.vital-modal>header,.vital-modal>footer{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;border-bottom:1px solid #e5ebf0}
.vital-modal>footer{border-top:1px solid #e5ebf0;border-bottom:0}
.title{display:flex;gap:.7rem}
.title>span{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;background:#ffebee;color:#d34452;font-size:1.3rem}
.title small{color:#d34452;font-size:.6rem;font-weight:800}
.title h2{font-size:1.1rem;margin:.1rem 0}
.title p{margin:0;color:#718096;font-size:.7rem}
.vital-tabs{display:flex;gap:.4rem;padding:.6rem 1.25rem 0}
.vital-tabs button{padding:.45rem .8rem;border:1px solid #dfe7ed;border-radius:.6rem;background:#fff;color:#536678;font-size:.8rem}
.vital-tabs button.active{border-color:#68b1d7;background:#eef8fd;color:#176f9d}
.vital-tabs button:disabled{opacity:.5}
.modal-body{padding:1.25rem}
.vitals{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem}
.vitals>div{position:relative;padding:.9rem;border:1px solid #e3eaf0;border-radius:.75rem}
.vitals>div>i{color:var(--bs-primary);font-size:1.2rem}
.vitals small,.vitals strong{display:block}
.vitals small{margin-top:.4rem;color:#7b899a;font-size:.63rem}
.vitals strong{font-size:1rem}
.vitals em,.form-label em{color:#8491a1;font-size:.6rem;font-style:normal}
.vitals .date{font-size:.72rem}
.empty{text-align:center;padding:2.5rem;color:#718096}
.empty i{font-size:2.8rem;color:#aec1d0}
.empty h3{font-size:1.05rem}
.vital-modal>footer span{color:#718096;font-size:.7rem}
@media(max-width:600px){.vitals{grid-template-columns:1fr 1fr}}
</style>
