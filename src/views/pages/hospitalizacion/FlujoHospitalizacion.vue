<template>
  <div class="hospital-flow hh-page">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <p class="text-primary fw-semibold mb-1">Admisiones</p>
        <h2 class="mb-1">Nuevo ingreso hospitalario</h2>
        <p class="text-muted mb-0">Identifique al paciente, cree la admisión y asigne una cama.</p>
      </div>
      <router-link to="/hospitalizacion/censo" class="btn btn-outline-primary">
        <i class="ri-group-line me-1"></i> Ver censo
      </router-link>
    </div>

    <b-card no-body class="mb-4">
      <b-card-body>
        <div class="stepper">
          <div v-for="item in steps" :key="item.id" class="step" :class="{ active: step === item.id, done: step > item.id }">
            <span>{{ step > item.id ? '✓' : item.id }}</span>
            <div><small>Paso {{ item.id }}</small><strong>{{ item.label }}</strong></div>
          </div>
        </div>
      </b-card-body>
    </b-card>

    <div v-if="notice.text" class="alert" :class="`alert-${notice.type}`" role="alert">
      {{ notice.text }}
    </div>

    <!-- Paso 1: la búsqueda evita crear pacientes duplicados. -->
    <b-card v-if="step === 1" no-body>
      <b-card-header><h4 class="mb-0">Identificación del paciente</h4></b-card-header>
      <b-card-body>
        <form class="row g-3 align-items-end" @submit.prevent="findPatient">
          <div class="col-lg-8">
            <label for="dni" class="form-label">Número de identificación</label>
            <input id="dni" v-model.trim="dni" class="form-control" required maxlength="30" placeholder="Ej. 123456789">
          </div>
          <div class="col-lg-4 d-grid">
            <button class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>Buscar paciente
            </button>
          </div>
        </form>

        <div v-if="patient" class="patient-summary mt-4">
          <div class="patient-avatar">{{ initials(patient.nombre) }}</div>
          <div class="flex-grow-1">
            <small class="text-muted">Paciente encontrado</small>
            <h5 class="mb-1">{{ patient.nombre }}</h5>
            <span>{{ patient.tipo_identificacion }} {{ patient.identificacion }}</span>
            <span class="mx-2">•</span><span>{{ formatDate(patient.fecha_nacimiento) }}</span>
          </div>
          <button class="btn btn-primary" @click="step = 2">Continuar</button>
        </div>

        <div v-if="patientNotFound" class="mt-4 p-4 rounded bg-body-tertiary">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <div><h5 class="mb-1">Paciente nuevo</h5><p class="text-muted mb-0">Complete los datos obligatorios para registrarlo.</p></div>
            <span class="badge bg-warning-subtle text-warning">No encontrado</span>
          </div>
          <div class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span>¿Necesita registrar aseguramiento, diagnósticos o contactos familiares?</span>
            <router-link to="/pacientes/nuevo?from=admission" class="btn btn-sm btn-outline-primary">Abrir formulario completo</router-link>
          </div>
          <form class="row g-3" @submit.prevent="savePatient">
            <div class="col-md-4"><label class="form-label">Tipo de documento *</label><select v-model.number="patientForm.tipo_doc" class="form-select" required><option :value="1">Cédula de ciudadanía</option><option :value="2">Tarjeta de identidad</option><option :value="3">Pasaporte</option></select></div>
            <div class="col-md-4"><label class="form-label">Primer nombre *</label><input v-model.trim="patientForm.primernombre" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Segundo nombre</label><input v-model.trim="patientForm.segundonombre" class="form-control"></div>
            <div class="col-md-4"><label class="form-label">Primer apellido *</label><input v-model.trim="patientForm.primerapellido" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Segundo apellido</label><input v-model.trim="patientForm.segundoapellido" class="form-control"></div>
            <div class="col-md-4"><label class="form-label">Fecha de nacimiento *</label><input v-model="patientForm.fecha_de_nacimiento" type="date" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Sexo *</label><select v-model.number="patientForm.sexo" class="form-select" required><option :value="1">Masculino</option><option :value="2">Femenino</option></select></div>
            <div class="col-md-4"><label class="form-label">Correo electrónico *</label><input v-model.trim="patientForm.email" type="email" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Celular *</label><input v-model.trim="patientForm.celular1" class="form-control" required></div>
            <div class="col-md-8"><label class="form-label">Dirección</label><input v-model.trim="patientForm.dir" class="form-control"></div>
            <div class="col-md-4"><label class="form-label">Contrato (ID) *</label><input v-model.number="patientForm.id_contrato" type="number" min="1" class="form-control" required></div>
            <div class="col-12 d-flex justify-content-end"><button class="btn btn-primary" :disabled="loading">Registrar y continuar</button></div>
          </form>
        </div>
      </b-card-body>
    </b-card>

    <!-- Paso 2: los ID se capturan manualmente hasta disponer de catálogos en la API. -->
    <b-card v-if="step === 2" no-body>
      <b-card-header><h4 class="mb-0">Orden de trabajo / admisión</h4></b-card-header>
      <b-card-body>
        <div class="alert alert-info">Los catálogos aún no están publicados. Temporalmente ingrese los identificadores suministrados por el hospital.</div>
        <form class="row g-3" @submit.prevent="saveOrder">
          <div class="col-md-4"><label class="form-label">Paquete (ID) *</label><input v-model.number="order.id_paquete" type="number" min="1" class="form-control" required></div>
          <div class="col-md-4"><label class="form-label">Manual tarifario (ID) *</label><input v-model.number="order.id_paquete_manual_tarifario" type="number" min="1" class="form-control" required></div>
          <div class="col-md-4"><label class="form-label">Válida desde *</label><input v-model="order.valida_desde" type="date" class="form-control" required></div>
          <div class="col-md-4"><label class="form-label">Vía de ingreso</label><input v-model.trim="order.rips_minsalud_via_ingreso_usuario" class="form-control" maxlength="2" placeholder="01"></div>
          <div class="col-md-4"><label class="form-label">Servicio (ID) *</label><input v-model.number="service.id_servicio" type="number" min="1" class="form-control" required></div>
          <div class="col-md-4"><label class="form-label">Cantidad *</label><input v-model.number="service.cantidad" type="number" min="1" class="form-control" required></div>
          <div class="col-12 d-flex justify-content-between"><button type="button" class="btn btn-light" @click="step = 1">Atrás</button><button class="btn btn-primary" :disabled="loading">Crear orden</button></div>
        </form>
      </b-card-body>
    </b-card>

    <b-card v-if="step === 3" no-body>
      <b-card-header><h4 class="mb-0">Selección de cama</h4></b-card-header>
      <b-card-body>
        <form class="row g-3 align-items-end mb-4" @submit.prevent="loadBeds">
          <div class="col-md-4"><label class="form-label">Fecha y hora de ingreso *</label><input v-model="bedFilters.fecha_inicio" type="datetime-local" class="form-control" required></div>
          <div class="col-md-2"><label class="form-label">Días *</label><input v-model.number="bedFilters.periodo" type="number" min="1" class="form-control" required></div>
          <div class="col-md-3"><label class="form-label">Tipo habitación (ID) *</label><input v-model.number="bedFilters.tipo_habitacion" type="number" min="1" class="form-control" required></div>
          <div class="col-md-3 d-grid"><button class="btn btn-outline-primary" :disabled="loading">Consultar disponibilidad</button></div>
        </form>
        <div v-if="!beds.length && !loading" class="empty-state"><i class="ri-hotel-bed-line"></i><h5>Consulte las camas disponibles</h5><p>Use los filtros para encontrar una ubicación adecuada.</p></div>
        <div v-else class="row g-3">
          <div v-for="bed in beds" :key="bed.id" class="col-md-6 col-xl-4">
            <button type="button" class="bed-card" :class="{ selected: selectedBed?.id === bed.id }" @click="selectedBed = bed">
              <div class="d-flex justify-content-between"><i class="ri-hotel-bed-line"></i><span class="badge bg-success-subtle text-success">Disponible</span></div>
              <h5>{{ bed.nombre_cama }}</h5><p>{{ bed.habitacion }}</p>
              <small>{{ locationLabel(bed.ubicacion) }}</small>
            </button>
          </div>
        </div>
        <div class="d-flex justify-content-between mt-4"><button class="btn btn-light" @click="step = 2">Atrás</button><button class="btn btn-primary" :disabled="!selectedBed" @click="step = 4">Asignar esta cama</button></div>
      </b-card-body>
    </b-card>

    <b-card v-if="step === 4" no-body>
      <b-card-header><h4 class="mb-0">Confirmar ingreso</h4></b-card-header>
      <b-card-body>
        <div class="row g-3 mb-4">
          <div class="col-md-4"><div class="confirm-tile"><small>Paciente</small><strong>{{ patient?.nombre }}</strong><span>{{ patient?.identificacion }}</span></div></div>
          <div class="col-md-4"><div class="confirm-tile"><small>Cama</small><strong>{{ selectedBed?.nombre_cama }}</strong><span>{{ selectedBed?.habitacion }}</span></div></div>
          <div class="col-md-4"><div class="confirm-tile"><small>Orden de trabajo</small><strong>#{{ orderId || 'Sin ID' }}</strong><span>Admisión creada</span></div></div>
        </div>
        <label class="form-label">Observaciones</label><textarea v-model.trim="observations" class="form-control" rows="4" maxlength="500" placeholder="Motivo o notas relevantes del ingreso"></textarea><div class="text-end text-muted small mt-1">{{ observations.length }}/500</div>
        <div class="d-flex justify-content-between mt-4"><button class="btn btn-light" @click="step = 3">Atrás</button><button class="btn btn-primary" :disabled="loading" @click="confirmAdmission">Confirmar ingreso hospitalario</button></div>
      </b-card-body>
    </b-card>

    <b-card v-if="step === 5" no-body class="text-center"><b-card-body class="py-5"><div class="success-icon"><i class="ri-check-line"></i></div><h3>Ingreso realizado correctamente</h3><p class="text-muted">{{ patient?.nombre }} fue asignado a {{ selectedBed?.nombre_cama }}.</p><div class="d-flex justify-content-center gap-2"><button class="btn btn-light" @click="resetFlow">Registrar otro ingreso</button><router-link to="/hospitalizacion/censo" class="btn btn-primary">Ir al censo hospitalario</router-link></div></b-card-body></b-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { obtenerMensajeError } from '@/services/api'
import { buscarPaciente, crearPaciente, crearOrden, consultarCamas, ingresarPaciente } from '@/services/hospitalizacion'
import { useStationsStore } from '@/store/pinia/estaciones'

const today = new Date().toISOString().slice(0, 10)
const localDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
const steps = [{ id: 1, label: 'Paciente' }, { id: 2, label: 'Admisión' }, { id: 3, label: 'Cama' }, { id: 4, label: 'Confirmar' }]
const step = ref(1), loading = ref(false), dni = ref(''), patient = ref(null), patientNotFound = ref(false)
const beds = ref([]), selectedBed = ref(null), orderId = ref(null), observations = ref('')
const notice = reactive({ text: '', type: 'danger' })
const patientForm = reactive({ identificacion: '', tipo_doc: 1, primernombre: '', segundonombre: '', primerapellido: '', segundoapellido: '', fecha_de_nacimiento: '', email: '', sexo: 2, celular1: '', celular2: null, pais: 1, dir: '', postal_code: null, id_estado_civil: null, via_de_ingreso: null, id_departamento: null, id_municipio: null, lat: null, lng: null, id_tercero_principal: null, id_tipo_usuario: null, id_rango: null, id_ocupacion: null, id_contrato: 1, cie: [], parientes: [] })
const order = reactive({ id_paquete: 1, id_paquete_manual_tarifario: 1, valida_desde: today, rips_minsalud_via_ingreso_usuario: '01' })
const service = reactive({ id_servicio: 1, cantidad: 1 })
const bedFilters = reactive({ fecha_inicio: localDateTime, periodo: 5, tipo_habitacion: 1 })

function showNotice(text, type = 'danger') { notice.text = text; notice.type = type }
function initials(name = '') { return name.split(' ').slice(0, 2).map(value => value[0]).join('').toUpperCase() }
function formatDate(value) { return value ? new Intl.DateTimeFormat('es-CO').format(new Date(`${value}T00:00:00`)) : 'Sin fecha' }
function locationLabel(location = {}) { return [location.sala, location.piso, location.torre].filter(Boolean).join(' · ') || 'Ubicación sin detalle' }

async function findPatient() {
  loading.value = true; notice.text = ''; patient.value = null; patientNotFound.value = false
  try { patient.value = await buscarPaciente(dni.value) }
  catch (error) {
    // "No encontrado": el backend responde 404 (antes 400); se aceptan ambos durante la transición.
    if ([400, 404].includes(error.status) && /no existe/i.test(error.payload?.message || '')) { patientNotFound.value = true; patientForm.identificacion = dni.value }
    else showNotice(obtenerMensajeError(error))
  } finally { loading.value = false }
}

async function savePatient() {
  loading.value = true; notice.text = ''
  try {
    const response = await crearPaciente(patientForm)
    patient.value = { paciente_id: response.id_paciente, nombre: `${patientForm.primernombre} ${patientForm.primerapellido}`, identificacion: patientForm.identificacion, tipo_identificacion: 'Documento', fecha_nacimiento: patientForm.fecha_de_nacimiento }
    step.value = 2; showNotice('Paciente registrado correctamente.', 'success')
  } catch (error) { showNotice(obtenerMensajeError(error)) } finally { loading.value = false }
}

async function saveOrder() {
  loading.value = true; notice.text = ''
  try {
    const response = await crearOrden({ ...order, id_paciente: patient.value.paciente_id || patient.value.id, servicios: [{ ...service }] })
    orderId.value = response.id_orden_trabajo || null; step.value = 3
    if (!orderId.value) showNotice('Orden creada. La API no devolvió su ID; el ingreso continuará sin asociarlo.', 'warning')
  } catch (error) { showNotice(obtenerMensajeError(error)) } finally { loading.value = false }
}

async function loadBeds() {
  loading.value = true; notice.text = ''; selectedBed.value = null
  try {
    beds.value = await consultarCamas({ ...bedFilters, fecha_inicio: bedFilters.fecha_inicio.replace('T', ' ') + ':00' })
    if (!beds.value.length) showNotice('No se encontraron camas con estos filtros.', 'warning')
  } catch (error) { showNotice(obtenerMensajeError(error)) } finally { loading.value = false }
}

async function confirmAdmission() {
  loading.value = true; notice.text = ''
  try {
    const payload = { id_paciente: patient.value.paciente_id || patient.value.id, id_cama: selectedBed.value.id, observaciones: observations.value || null }
    if (orderId.value) payload.id_orden_trabajo = orderId.value
    await ingresarPaciente(payload)
    // El ingreso cambia ocupación y disponibilidad; invalida el resumen en memoria.
    useStationsStore().clearStations()
    step.value = 5
  } catch (error) { showNotice(obtenerMensajeError(error)) } finally { loading.value = false }
}

function resetFlow() { step.value = 1; dni.value = ''; patient.value = null; patientNotFound.value = false; beds.value = []; selectedBed.value = null; orderId.value = null; observations.value = ''; notice.text = '' }

// El formulario completo devuelve el paciente mediante sessionStorage porque
// ambas pantallas no comparten todavía un store de admisiones persistente.
onMounted(() => {
  const selected = sessionStorage.getItem('selected_patient')
  if (!selected) return
  try {
    patient.value = JSON.parse(selected)
    dni.value = patient.value.identificacion || ''
    step.value = 2
    showNotice('Paciente seleccionado para esta admisión.', 'success')
  } finally {
    sessionStorage.removeItem('selected_patient')
  }
})
</script>

<style scoped>
.stepper{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}.step{display:flex;align-items:center;gap:.75rem;color:var(--bs-secondary-color)}.step>span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--bs-tertiary-bg);font-weight:700}.step div{display:flex;flex-direction:column}.step small{font-size:.7rem;text-transform:uppercase}.step strong{font-size:.9rem}.step.active>span,.step.done>span{background:var(--bs-primary);color:#fff}.step.active strong{color:var(--bs-primary)}.patient-summary{display:flex;align-items:center;gap:1rem;padding:1.25rem;border:1px solid var(--bs-border-color);border-radius:.75rem}.patient-avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:rgba(var(--bs-primary-rgb),.12);color:var(--bs-primary);font-weight:700}.empty-state{text-align:center;padding:3rem;color:var(--bs-secondary-color)}.empty-state i{font-size:3rem;color:var(--bs-primary)}.bed-card{width:100%;height:100%;text-align:left;border:1px solid var(--bs-border-color);border-radius:.75rem;background:var(--bs-body-bg);padding:1.25rem;color:inherit}.bed-card>div>i{font-size:1.7rem;color:var(--bs-primary)}.bed-card h5{margin:.8rem 0 .25rem}.bed-card p,.bed-card small{margin:0;color:var(--bs-secondary-color)}.bed-card.selected{border:2px solid var(--bs-primary);box-shadow:0 0 0 3px rgba(var(--bs-primary-rgb),.12)}.confirm-tile{height:100%;display:flex;flex-direction:column;padding:1rem;border-radius:.75rem;background:var(--bs-tertiary-bg)}.confirm-tile small{color:var(--bs-secondary-color)}.confirm-tile strong{font-size:1.05rem;margin:.3rem 0}.success-icon{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;margin:0 auto 1rem;background:rgba(var(--bs-success-rgb),.15);color:var(--bs-success);font-size:2rem}@media(max-width:767px){.stepper{grid-template-columns:repeat(2,1fr)}.step div{display:none}.patient-summary{align-items:flex-start;flex-wrap:wrap}}
</style>
