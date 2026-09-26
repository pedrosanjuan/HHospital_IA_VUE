<template>
  <div class="hh-page hh-detail-page"><button class="btn btn-link hh-back-link ps-0 mb-3" @click="router.back()"><i
        class="ri-arrow-left-line me-1"></i>Volver</button>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div><template v-else-if="admission">
      <div class="d-flex flex-wrap justify-content-between gap-3 mb-4">
        <div>
          <p class="text-primary fw-semibold mb-1">Admisión activa</p>
          <h2 class="mb-1">Orden de trabajo #{{ admission.id }}</h2>
          <p class="text-muted mb-0">{{ admission.paciente?.nombre || admission.paciente?.name }} · {{
            admission.paciente?.identificacion }}</p>
        </div><span class="badge bg-success-subtle text-success align-self-center px-3 py-2">{{ admission.estadoName || 'Activa' }}</span>
      </div>
      <div class="row g-4">
        <div class="col-lg-8"><b-card no-body><b-card-header class="d-flex align-items-center justify-content-between gap-3">
              <div><small class="text-primary fw-semibold">ORDEN DE TRABAJO #{{ admission.id }}</small><h4 class="mb-0">Servicios asociados</h4></div>
              <button v-if="puede('admisiones.servicios.agregar')" type="button" class="btn btn-primary btn-sm" @click="openAddService"><i class="ri-add-line me-1"></i>Agregar servicio</button>
            </b-card-header><b-card-body class="p-0">
              <div v-if="!admission.ordenesdeservicio?.length" class="text-center text-muted py-5">No hay servicios
                asociados.</div>
              <div v-else class="table-responsive">
                <table class="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Servicio</th>
                      <th>Estado</th>
                      <th>Profesional</th>
                      <th class="text-end">Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="service in admission.ordenesdeservicio" :key="service.id">
                      <tr>
                        <td>{{ service.servicio || service.servicioName || `Servicio #${service.id}` }}</td>
                        <td>{{ service.estado || service.estadoName || '—' }}</td>
                        <td>{{ service.nombre_profesional_asignado || service.profesional || service.profesionalName || 'No asignado' }}</td>
                        <td class="text-end"><button type="button" class="btn btn-sm btn-outline-primary" :disabled="!service.opciones?.length" :aria-expanded="expandedServices.has(service.id)" :aria-controls="`service-options-${service.id}`" @click="toggleOptions(service.id)"><i class="ri-settings-3-line me-1"></i>Opciones <span class="badge bg-primary ms-1">{{ service.opciones?.length || 0 }}</span><i class="ri-arrow-down-s-line ms-1 option-arrow" :class="{ rotated: expandedServices.has(service.id) }"></i></button></td>
                      </tr>
                      <tr v-if="expandedServices.has(service.id)" :id="`service-options-${service.id}`" class="options-row">
                        <td colspan="4"><div class="service-options"><p class="small text-muted mb-2">Acciones disponibles para {{ service.servicioName || `el servicio #${service.id}` }}</p><div class="d-flex flex-wrap gap-2"><button v-for="(option, index) in service.opciones" :key="`${option.id}-${index}`" type="button" class="btn btn-sm option-button" :class="isSelectedOption(service, option) ? 'btn-primary' : 'btn-light'" :aria-pressed="isSelectedOption(service, option)" @click="selectOption(service, option)"><i :class="optionIcon(option.icon)" class="me-1"></i>{{ option.name || option.nombre || `Opción ${option.id}` }}</button></div><small v-if="admission.selectedOption?.serviceId === service.id" class="d-block text-primary mt-2">Opción seleccionada: {{ admission.selectedOption.name }}</small></div></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </b-card-body></b-card></div>
        <div class="col-lg-4"><b-card no-body><b-card-header>
              <h4 class="mb-0">Información administrativa</h4>
            </b-card-header><b-card-body>
              <Info label="Paquete" :value="admission.paqueteName" />
              <hr>
              <Info label="Contrato" :value="admission.contrato" />
              <hr>
              <Info label="Tercero contratante" :value="admission.tercero_contratante" />
              <hr>
              <Info label="Manual tarifario" :value="admission.manual_tarifario" />
              <hr>
              <Info label="Válida desde" :value="formatDate(admission.valida_desde)" />
              <hr>
              <Info label="Creada por" :value="admission.created_byName" />
            </b-card-body></b-card></div>
      </div>
      <Teleport to="body">
        <div v-if="serviceModal" class="service-modal-layer" @mousedown.self="closeServiceModal">
          <section class="add-service-modal" role="dialog" aria-modal="true" aria-labelledby="add-service-title">
            <header>
              <div><small>ORDEN DE TRABAJO #{{ admission.id }}</small><h3 id="add-service-title">Agregar servicio manualmente</h3><p>El servicio quedará asociado a la admisión actual.</p></div>
              <button type="button" class="btn-close" :disabled="savingService" @click="closeServiceModal"></button>
            </header>
            <form @submit.prevent="addService">
              <div class="modal-body">
                <div v-if="serviceError" class="alert alert-danger">{{ serviceError }}</div>
                <label class="form-label">Servicio *</label>
                <select v-model="serviceForm.id_servicio" class="form-select" required :disabled="loadingServices">
                  <option value="" disabled>{{ loadingServices ? 'Consultando servicios…' : 'Seleccione un servicio' }}</option>
                  <option v-for="item in serviceCatalog" :key="entityId(item)" :value="entityId(item)">{{ entityName(item) }}</option>
                </select>
                <small class="field-help">Catálogo institucional de servicios disponibles.</small>

                <label class="form-label mt-3">Cantidad *</label>
                <div class="quantity-control">
                  <button type="button" :disabled="serviceForm.cantidad <= 1" @click="serviceForm.cantidad--"><i class="ri-subtract-line"></i></button>
                  <input v-model.number="serviceForm.cantidad" type="number" min="1" step="1" class="form-control" required>
                  <button type="button" @click="serviceForm.cantidad++"><i class="ri-add-line"></i></button>
                </div>

                <div class="order-context">
                  <i class="ri-information-line"></i>
                  <span><strong>Contexto de la admisión</strong>Paciente: {{ admission.paciente?.nombre || admission.paciente?.name }} · Orden #{{ admission.id }}</span>
                </div>
              </div>
              <footer>
                <button type="button" class="btn btn-outline-secondary" :disabled="savingService" @click="closeServiceModal">Cancelar</button>
                <button class="btn btn-primary" :disabled="savingService || loadingServices">
                  <span v-if="savingService" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="ri-add-circle-line me-1"></i>{{ savingService ? 'Agregando…' : 'Agregar servicio' }}
                </button>
              </footer>
            </form>
          </section>
        </div>
      </Teleport>
    </template>
  </div>
</template>
<script setup>
import { defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { agregarServicioOrden, consultarOrdenTrabajo, consultarServiciosPaquete } from '@/services/hospitalizacion'
import { usePermisos } from '@/store/pinia/permisos'
// Oculta las acciones que el usuario no tiene permiso de hacer (el backend igual lo valida).
const { puede } = usePermisos()

const Info = defineComponent({ props: { label: String, value: [String, Number] }, setup: p => () => h('div', [h('small', { class: 'text-muted d-block' }, p.label), h('strong', p.value || 'No registrado')]) })
const route = useRoute(), router = useRouter(), admission = ref(null), loading = ref(true), error = ref('')
const expandedServices = reactive(new Set())
const serviceModal = ref(false), serviceCatalog = ref([]), loadingServices = ref(false), savingService = ref(false), serviceError = ref('')
const serviceForm = reactive({ id_servicio: '', cantidad: 1 })
const normalizeArray = value => {
  if (Array.isArray(value)) return value
  for (const key of ['data', 'servicios', 'items']) {
    if (Array.isArray(value?.[key])) return value[key]
    if (Array.isArray(value?.data?.[key])) return value.data[key]
  }
  return []
}
const entityId = item => item?.id_servicio ?? item?.servicio_id ?? item?.servicio?.id ?? item?.id
const entityName = item => item?.servicio?.nombre ?? item?.nombre_servicio ?? item?.nombre ?? item?.name ?? item?.descripcion ?? `Servicio #${entityId(item)}`
const packageId = () => admission.value?.id_paquete ?? admission.value?.paquete_id ?? admission.value?.paquete?.id
const formatDate = value => value ? new Intl.DateTimeFormat('es-CO').format(new Date(`${value}T00:00:00`)) : 'No registrada'
function toggleOptions(serviceId) { expandedServices.has(serviceId) ? expandedServices.delete(serviceId) : expandedServices.add(serviceId) }
function optionIcon(value) { const icon = String(value || '').trim().toLowerCase(); return /^ri-[a-z0-9-]+$/.test(icon) ? icon : 'ri-arrow-right-circle-line' }
function isSelectedOption(service, option) { return admission.value?.selectedOption?.serviceId === service.id && admission.value?.selectedOption?.optionId === option.id && admission.value?.selectedOption?.name === option.name }
function selectOption(service, option) {
  const optionName = String(option.name || option.nombre || '').trim().toLowerCase()

  // La reserva nace desde la orden de servicio, pero el endpoint requiere la
  // orden de trabajo y el paciente. Ambos ya pertenecen a esta admisión, por
  // lo que se transportan como contexto y no se vuelven a solicitar.
  if (optionName.includes('reserv') && optionName.includes('cama')) {
    router.push({
      path: '/admision/reservas/nueva',
      query: {
        paciente: admission.value.paciente?.paciente_id || admission.value.paciente?.id || admission.value.paciente_id,
        orden: admission.value.id,
        servicio: service.id,
      },
    })
    return
  }

  // Las demás opciones permanecen seleccionables hasta que el backend
  // publique el contrato de navegación o acción correspondiente.
  admission.value.selectedOption = { serviceId: service.id, optionId: option.id, name: option.name || option.nombre }
}
async function loadAdmission() {
  const response = await consultarOrdenTrabajo(route.params.id)
  admission.value = response?.data || response
}
async function openAddService() {
  serviceForm.id_servicio = ''
  serviceForm.cantidad = 1
  serviceError.value = ''
  serviceModal.value = true
  if (serviceCatalog.value.length) return
  if (!packageId()) {
    serviceError.value = 'La admisión no contiene un paquete asociado para consultar sus servicios.'
    return
  }
  loadingServices.value = true
  try {
    serviceCatalog.value = normalizeArray(await consultarServiciosPaquete(packageId()))
  } catch (reason) {
    serviceError.value = obtenerMensajeError(reason)
  } finally {
    loadingServices.value = false
  }
}
function closeServiceModal() {
  if (!savingService.value) serviceModal.value = false
}
async function addService() {
  if (!serviceForm.id_servicio || Number(serviceForm.cantidad) < 1) return
  savingService.value = true
  serviceError.value = ''
  try {
    await agregarServicioOrden(admission.value.id || route.params.id, serviceForm.id_servicio, serviceForm.cantidad)
    await loadAdmission()
    serviceModal.value = false
  } catch (reason) {
    serviceError.value = obtenerMensajeError(reason)
  } finally {
    savingService.value = false
  }
}
onMounted(async () => { try { await loadAdmission() } catch (reason) { error.value = obtenerMensajeError(reason) } finally { loading.value = false } })
</script>
<style scoped>
th {
  font-size: .75rem;
  text-transform: uppercase;
  color: var(--bs-secondary-color)
}

td {
  padding: 1rem
}

.options-row td{padding-top:0;background:var(--bs-tertiary-bg)}
.service-options{padding:1rem;border-left:3px solid var(--bs-primary)}
.option-button{border:1px solid var(--bs-border-color)}
.option-arrow{display:inline-block;transition:transform .2s}.option-arrow.rotated{transform:rotate(180deg)}
.service-modal-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:rgba(7,21,34,.72);backdrop-filter:blur(5px)}
.add-service-modal{width:min(560px,100%);overflow:hidden;border-radius:1rem;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.32)}
.add-service-modal>header{display:flex;align-items:flex-start;justify-content:space-between;padding:1.15rem 1.25rem;border-bottom:1px solid #e3e9ef;background:linear-gradient(120deg,#f5fafd,#fff)}
.add-service-modal header small{color:var(--bs-primary);font-size:.7rem;font-weight:800;letter-spacing:.06em}
.add-service-modal h3{margin:.18rem 0;font-size:1.08rem}.add-service-modal header p{margin:0;color:#748394;font-size:.76rem}
.add-service-modal .modal-body{padding:1.25rem}.add-service-modal footer{display:flex;justify-content:flex-end;gap:.6rem;padding:1rem 1.25rem;border-top:1px solid #e3e9ef}
.field-help{display:block;margin-top:.3rem;color:#7c8b99}
.quantity-control{display:grid;grid-template-columns:42px 1fr 42px;max-width:230px;overflow:hidden;border:1px solid #ced9e1;border-radius:.65rem}
.quantity-control button{border:0;background:#eef6fb;color:var(--bs-primary);font-size:1.05rem}.quantity-control input{border:0;border-right:1px solid #dbe5eb;border-left:1px solid #dbe5eb;border-radius:0;text-align:center;font-weight:700}
.order-context{display:flex;align-items:flex-start;gap:.6rem;margin-top:1rem;padding:.75rem;border-radius:.7rem;background:#eef7fc;color:#526a7d}
.order-context>i{color:var(--bs-primary);font-size:1.2rem}.order-context span,.order-context strong{display:block}.order-context span{font-size:.74rem}.order-context strong{margin-bottom:.1rem;color:#304c61}
</style>
