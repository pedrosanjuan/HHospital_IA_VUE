<template>
  <div class="patient-form-page hh-page">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div><p class="text-primary fw-semibold mb-1">Pacientes</p><h2 class="mb-1">Crear paciente</h2><p class="text-muted mb-0">Registre la información básica, de contacto y aseguramiento del paciente.</p></div>
      <div class="d-flex gap-2"><button class="btn btn-light" :disabled="saving" @click="cancel">Cancelar</button><button class="btn btn-primary" :disabled="!canSave" @click="save"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>{{ saving ? 'Guardando...' : 'Guardar paciente' }}</button></div>
    </div>

    <div v-if="catalogError" class="alert alert-danger d-flex justify-content-between align-items-center"><span><strong>No fue posible cargar los catálogos.</strong> {{ catalogError }}</span><button class="btn btn-sm btn-outline-danger" @click="loadCatalogs">Reintentar</button></div>
    <div v-if="generalError" class="alert alert-danger" role="alert">{{ generalError }}</div>
    <div v-if="createdId" class="alert alert-success"><strong>Paciente creado correctamente.</strong> Identificador interno: #{{ createdId }}</div>
    <div v-if="loadingCatalogs" class="card card-body text-center py-5"><span class="spinner-border text-primary mx-auto"></span><p class="text-muted mt-3 mb-0">Cargando catálogos del hospital…</p></div>

    <form v-else ref="formElement" novalidate @submit.prevent="save" @input="dirty = true">
      <p class="small text-muted">Los campos marcados con <span class="text-danger">*</span> son obligatorios.</p>

      <FormSection icon="ri-fingerprint-line" title="1. Identificación" subtitle="Verifique la identificación antes de continuar.">
        <div class="row g-3">
          <FieldSelect id="tipo_doc" v-model="form.tipo_doc" class-name="col-md-5" label="Tipo de documento" required :options="catalogs.documentTypes" :error="errors.tipo_doc" @change="invalidateVerification" />
          <div class="col-md-7"><label for="identificacion" class="form-label">Número de identificación <span class="text-danger">*</span></label><div class="input-group"><input id="identificacion" v-model.trim="form.identificacion" class="form-control" :class="{ 'is-invalid': errors.identificacion }" maxlength="30" required @change="invalidateVerification" @blur="verifyIfValid"><button type="button" class="btn btn-outline-primary" :disabled="verifying || !form.identificacion" @click="verifyIdentity"><span v-if="verifying" class="spinner-border spinner-border-sm me-1"></span>Verificar</button></div><div v-if="errors.identificacion" class="invalid-feedback d-block">{{ errors.identificacion }}</div></div>
        </div>
        <div v-if="verification === 'available'" class="alert alert-success mt-3 mb-0"><i class="ri-checkbox-circle-line me-1"></i> No encontramos un paciente con esta identificación. Puede continuar con el registro.</div>
        <div v-if="verification === 'exists'" class="alert alert-info mt-3 mb-0"><strong>Este paciente ya se encuentra registrado.</strong><div class="mt-2">{{ existingPatient?.nombre }} — {{ existingPatient?.identificacion }}</div><div class="mt-2 d-flex gap-2"><button v-if="fromAdmission" type="button" class="btn btn-sm btn-primary" @click="selectExisting">Seleccionar paciente</button></div></div>
      </FormSection>

      <FormSection icon="ri-user-3-line" title="2. Información personal">
        <div class="row g-3">
          <FieldInput id="primernombre" v-model="form.primernombre" class-name="col-md-6" label="Primer nombre" required autocomplete="given-name" :error="errors.primernombre" />
          <FieldInput id="segundonombre" v-model="form.segundonombre" class-name="col-md-6" label="Segundo nombre" autocomplete="additional-name" :error="errors.segundonombre" />
          <FieldInput id="primerapellido" v-model="form.primerapellido" class-name="col-md-6" label="Primer apellido" required autocomplete="family-name" :error="errors.primerapellido" />
          <FieldInput id="segundoapellido" v-model="form.segundoapellido" class-name="col-md-6" label="Segundo apellido" :error="errors.segundoapellido" />
          <FieldInput id="fecha_de_nacimiento" v-model="form.fecha_de_nacimiento" class-name="col-md-4" label="Fecha de nacimiento" type="date" required :max="today" :error="errors.fecha_de_nacimiento" />
          <FieldSelect id="sexo" v-model="form.sexo" class-name="col-md-4" label="Sexo" required :options="catalogs.genders" :error="errors.sexo" />
          <FieldSelect id="id_estado_civil" v-model="form.id_estado_civil" class-name="col-md-4" label="Estado civil" :options="catalogs.maritalStatuses" :error="errors.id_estado_civil" />
          <FieldSelect id="id_ocupacion" v-model="form.id_ocupacion" class-name="col-md-6" label="Ocupación RIPS" :options="catalogs.occupations" :error="errors.id_ocupacion" />
          <FieldInput id="alias" v-model="form.alias" class-name="col-md-6" label="Alias / nombre preferido" :error="errors.alias" />
        </div>
      </FormSection>

      <FormSection icon="ri-map-pin-line" title="3. Contacto y ubicación">
        <div class="row g-3">
          <FieldInput id="email" v-model="form.email" class-name="col-md-6" label="Correo electrónico" type="email" required autocomplete="email" :error="errors.email" />
          <FieldInput id="celular1" v-model="form.celular1" class-name="col-md-3" label="Celular principal" type="tel" required autocomplete="tel" :error="errors.celular1" />
          <FieldInput id="celular2" v-model="form.celular2" class-name="col-md-3" label="Celular alterno" type="tel" :error="errors.celular2" />
          <FieldSelect id="pais" v-model="form.pais" class-name="col-md-4" label="País" required :options="catalogs.countries" :error="errors.pais" @change="countryChanged" />
          <FieldSelect id="id_departamento" v-model="form.id_departamento" class-name="col-md-4" label="Departamento" :options="catalogs.departments" :disabled="!form.pais || loadingDepartments" :loading="loadingDepartments" :error="errors.id_departamento" @change="departmentChanged" />
          <FieldSelect id="id_municipio" v-model="form.id_municipio" class-name="col-md-4" label="Municipio" :options="catalogs.cities" :disabled="!form.id_departamento || loadingCities" :loading="loadingCities" :error="errors.id_municipio" />
          <FieldInput id="dir" v-model="form.dir" class-name="col-md-8" label="Dirección" autocomplete="street-address" :error="errors.dir" />
          <FieldInput id="postal_code" v-model="form.postal_code" class-name="col-md-4" label="Código postal" autocomplete="postal-code" :error="errors.postal_code" />
        </div>
      </FormSection>

      <FormSection icon="ri-shield-check-line" title="4. Aseguramiento">
        <div class="row g-3">
          <div class="col-md-6"><label for="id_tercero_principal" class="form-label">Tercero contratante / EPS <span class="text-danger">*</span></label><SearchSelect id="id_tercero_principal" v-model="form.id_tercero_principal" :options="catalogs.contractingParties" :disabled="loadingCatalogs" placeholder="Seleccione un tercero contratante" search-placeholder="Buscar entidad o EPS…" @change="contractingPartyChanged"/><div v-if="errors.id_tercero_principal" class="invalid-feedback d-block">{{ errors.id_tercero_principal }}</div></div>
          <div class="col-md-6"><label for="id_contrato" class="form-label">Contrato <span class="text-danger">*</span></label><SearchSelect id="id_contrato" v-model="form.id_contrato" :options="catalogs.contracts" :disabled="!form.id_tercero_principal||loadingContracts" :placeholder="loadingContracts?'Consultando contratos…':form.id_tercero_principal?'Seleccione un contrato':'Seleccione primero el tercero'" search-placeholder="Buscar contrato…"/><div v-if="errors.id_contrato" class="invalid-feedback d-block">{{ errors.id_contrato }}</div><small v-if="form.id_tercero_principal&&!loadingContracts&&!catalogs.contracts.length" class="text-danger">El tercero seleccionado no tiene contratos disponibles.</small></div>
          <FieldSelect id="id_tipo_usuario" v-model="form.id_tipo_usuario" class-name="col-md-4" label="Tipo de usuario" :options="catalogs.userTypes" :error="errors.id_tipo_usuario" />
          <FieldSelect id="id_rango" v-model="form.id_rango" class-name="col-md-4" label="Rango" :options="catalogs.ranges" :error="errors.id_rango" />
          <FieldSelect id="via_de_ingreso" v-model="form.via_de_ingreso" class-name="col-md-4" label="Vía de ingreso" :options="catalogs.entryRoutes" :error="errors.via_de_ingreso" />
        </div>
      </FormSection>

      <FormSection icon="ri-capsule-line" title="5. Diagnósticos CIE-10" subtitle="Busque por código o nombre y agregue uno o más diagnósticos.">
        <div class="row g-2"><div class="col-md-9"><input v-model.trim="diagnosisSearch" class="form-control" placeholder="Buscar diagnóstico…" @input="searchDiagnoses"></div><div class="col-md-3"><select v-model="diagnosisToAdd" class="form-select"><option value="">Seleccione</option><option v-for="option in filteredDiagnoses" :key="option.id" :value="option.id">{{ option.label }}</option></select></div></div>
        <button type="button" class="btn btn-sm btn-outline-primary mt-2" :disabled="!diagnosisToAdd" @click="addDiagnosis">Agregar diagnóstico</button>
        <div class="d-flex flex-wrap gap-2 mt-3"><span v-for="item in selectedDiagnoses" :key="item.id" class="diagnosis-tag">{{ item.label }} <button type="button" aria-label="Eliminar diagnóstico" @click="removeDiagnosis(item.id)">×</button></span><span v-if="!selectedDiagnoses.length" class="text-muted small">Sin diagnósticos seleccionados.</span></div>
      </FormSection>

      <FormSection icon="ri-contacts-line" title="6. Contactos familiares">
        <div v-for="(relative, index) in form.parientes" :key="relative.key" class="relative-row row g-3 mb-3">
          <FieldSelect :id="`relative-type-${index}`" v-model="relative.id_tipo_pariente" class-name="col-md-3" label="Parentesco" required :options="catalogs.relationshipTypes" />
          <FieldInput :id="`relative-name-${index}`" v-model="relative.nombre" class-name="col-md-3" label="Nombre completo" required />
          <FieldInput :id="`relative-phone-${index}`" v-model="relative.telefono" class-name="col-md-2" label="Teléfono" type="tel" required />
          <FieldInput :id="`relative-note-${index}`" v-model="relative.observacion" class-name="col-md-3" label="Observación" required />
          <div class="col-md-1 d-flex align-items-end"><button type="button" class="btn btn-outline-danger w-100" title="Eliminar contacto" @click="removeRelative(index)"><i class="ri-delete-bin-line"></i></button></div>
        </div>
        <button type="button" class="btn btn-outline-primary" @click="addRelative"><i class="ri-add-line me-1"></i>Agregar contacto</button>
      </FormSection>

      <div class="d-flex justify-content-end gap-2 mb-5"><button type="button" class="btn btn-light" :disabled="saving" @click="cancel">Cancelar</button><button type="submit" class="btn btn-primary" :disabled="!canSave">{{ saving ? 'Guardando...' : 'Guardar paciente' }}</button></div>
    </form>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchSelect from '@/components/form/SearchSelect.vue'
import { obtenerMensajeError } from '@/services/api'
import { buscarPaciente, consultarCatalogo, crearPaciente } from '@/services/hospitalizacion'

// Componentes de campo locales: garantizan etiquetas, mensajes y atributos accesibles uniformes.
const FieldInput = defineComponent({ props: { modelValue: [String, Number], id: String, label: String, className: String, type: { default: 'text' }, required: Boolean, error: String, autocomplete: String, max: String }, emits: ['update:modelValue'], setup(p, { emit }) { return () => h('div', { class: p.className }, [h('label', { for: p.id, class: 'form-label' }, [p.label, p.required ? h('span', { class: 'text-danger' }, ' *') : null]), h('input', { id: p.id, value: p.modelValue, type: p.type, required: p.required, autocomplete: p.autocomplete, max: p.max, class: ['form-control', { 'is-invalid': p.error }], 'aria-describedby': p.error ? `${p.id}-error` : null, onInput: e => emit('update:modelValue', e.target.value) }), p.error ? h('div', { id: `${p.id}-error`, class: 'invalid-feedback' }, p.error) : null]) } })
const FieldSelect = defineComponent({ props: { modelValue: [String, Number], id: String, label: String, className: String, options: Array, required: Boolean, disabled: Boolean, loading: Boolean, error: String }, emits: ['update:modelValue', 'change'], setup(p, { emit }) { return () => h('div', { class: p.className }, [h('label', { for: p.id, class: 'form-label' }, [p.label, p.required ? h('span', { class: 'text-danger' }, ' *') : null]), h('select', { id: p.id, value: p.modelValue, required: p.required, disabled: p.disabled, class: ['form-select', { 'is-invalid': p.error }], onChange: e => { emit('update:modelValue', e.target.value); emit('change', e.target.value) } }, [h('option', { value: '' }, p.loading ? 'Cargando…' : 'Seleccione'), ...(p.options || []).map(o => h('option', { value: o.id }, o.label))]), p.error ? h('div', { class: 'invalid-feedback' }, p.error) : null]) } })
const FormSection = defineComponent({ props: { icon: String, title: String, subtitle: String }, setup(p, { slots }) { return () => h('section', { class: 'card mb-4' }, [h('div', { class: 'card-header d-flex gap-3 align-items-center' }, [h('span', { class: 'section-icon' }, [h('i', { class: p.icon })]), h('div', [h('h4', { class: 'mb-0' }, p.title), p.subtitle ? h('small', { class: 'text-muted' }, p.subtitle) : null])]), h('div', { class: 'card-body' }, slots.default?.())]) } })

const router = useRouter(), route = useRoute(), today = new Date().toISOString().slice(0, 10)
const loadingCatalogs = ref(true), catalogError = ref(''), generalError = ref(''), saving = ref(false), verifying = ref(false), verification = ref('pending'), existingPatient = ref(null), createdId = ref(null), dirty = ref(false), formElement = ref(null)
const diagnosisSearch = ref(''), diagnosisToAdd = ref(''), selectedDiagnoses = ref([])
const fromAdmission = computed(() => route.query.from === 'admission')
const catalogs = reactive({ documentTypes: [], genders: [], countries: [], departments: [], cities: [], maritalStatuses: [], occupations: [], diagnoses: [], relationshipTypes: [], userTypes: [], ranges: [], entryRoutes: [], contractingParties: [], contracts: [] })
const form = reactive({ tipo_doc: '', identificacion: '', primernombre: '', segundonombre: '', primerapellido: '', segundoapellido: '', fecha_de_nacimiento: '', sexo: '', id_estado_civil: '', id_ocupacion: '', alias: '', email: '', celular1: '', celular2: '', pais: '', id_departamento: '', id_municipio: '', dir: '', postal_code: '', id_contrato: '', id_tercero_principal: '', id_tipo_usuario: '', id_rango: '', via_de_ingreso: '', lat: null, lng: null, parientes: [] })
const errors = reactive({})
const canSave = computed(() => !saving.value && !loadingCatalogs.value && !catalogError.value && verification.value === 'available')
const filteredDiagnoses = computed(() => { const term = diagnosisSearch.value.toLowerCase(); return catalogs.diagnoses.filter(item => !selectedDiagnoses.value.some(selected => selected.id === item.id) && (!term || item.label.toLowerCase().includes(term))).slice(0, 100) })

const labelOf = item => item.nombre || item.razon_social || item.nombre_tercero || item.nombre_contrato || item.tag || item.descripcion || item.codigo || item.name || `Registro ${item.id}`
const responseList = response => { if (Array.isArray(response)) return response; for (const key of ['data', 'terceros', 'terceros_contratantes', 'contratos', 'items']) { if (Array.isArray(response?.[key])) return response[key]; if (response?.[key] && response[key] !== response) { const nested = responseList(response[key]); if (nested.length) return nested } } return [] }
const normalize = response => responseList(response).map(item => ({ ...item, id: item.id ?? item.id_tercero ?? item.id_contrato ?? item.value, label: [item.codigo, item.nit, labelOf(item)].filter((v, i, a) => v && a.indexOf(v) === i).join(' — ') }))
async function loadCatalogs() {
  loadingCatalogs.value = true; catalogError.value = ''
  const definitions = { documentTypes: 'System/tipodocumentos', genders: 'System/generos', countries: 'System/paises', maritalStatuses: 'System/estadosciviles', occupations: 'System/rips/ocupaciones', diagnoses: 'System/diagnosticos/cie10', relationshipTypes: 'System/tipo_pariente', userTypes: 'System/tipo_paciente_aseguramiento', ranges: 'System/tipo_paciente_rango', entryRoutes: 'System/rips/tipoIngresoAtencion', contractingParties: 'TerceroContratante' }
  try { const results = await Promise.all(Object.entries(definitions).map(async ([key, path]) => [key, normalize(await consultarCatalogo(path))])); results.forEach(([key, value]) => { catalogs[key] = value }) }
  catch (error) { catalogError.value = obtenerMensajeError(error) } finally { loadingCatalogs.value = false }
}
function invalidateVerification() { verification.value = 'pending'; existingPatient.value = null }
function verifyIfValid() { if (form.identificacion.trim() && form.tipo_doc) verifyIdentity() }
async function verifyIdentity() { if (verifying.value) return; verifying.value = true; generalError.value = ''; verification.value = 'pending'; try { existingPatient.value = await buscarPaciente(form.identificacion.trim()); verification.value = 'exists' } catch (error) { if ([400, 404].includes(error.status) && /no existe/i.test(error.payload?.message || '')) verification.value = 'available'; else generalError.value = obtenerMensajeError(error) } finally { verifying.value = false } }
async function countryChanged() { form.id_departamento = ''; form.id_municipio = ''; catalogs.departments = []; catalogs.cities = []; if (!form.pais) return; loadingDepartments.value = true; try { catalogs.departments = normalize(await consultarCatalogo(`System/pais/${form.pais}/departamentos`)) } catch (error) { generalError.value = obtenerMensajeError(error) } finally { loadingDepartments.value = false } }
async function departmentChanged() { form.id_municipio = ''; catalogs.cities = []; if (!form.id_departamento) return; loadingCities.value = true; try { catalogs.cities = normalize(await consultarCatalogo(`System/departamento/${form.id_departamento}/municipios`)) } catch (error) { generalError.value = obtenerMensajeError(error) } finally { loadingCities.value = false } }
const loadingDepartments = ref(false), loadingCities = ref(false)
const loadingContracts = ref(false)
async function contractingPartyChanged(id) { form.id_contrato = ''; catalogs.contracts = []; delete errors.id_tercero_principal; delete errors.id_contrato; if (!id) return; loadingContracts.value = true; generalError.value = ''; try { catalogs.contracts = normalize(await consultarCatalogo(`TerceroContratante/${id}/contratos`)) } catch (error) { generalError.value = obtenerMensajeError(error) } finally { loadingContracts.value = false } }
function searchDiagnoses() { diagnosisToAdd.value = '' }
function addDiagnosis() { const item = catalogs.diagnoses.find(value => String(value.id) === String(diagnosisToAdd.value)); if (item && !selectedDiagnoses.value.some(value => value.id === item.id)) selectedDiagnoses.value.push(item); diagnosisToAdd.value = '' }
function removeDiagnosis(id) { selectedDiagnoses.value = selectedDiagnoses.value.filter(item => item.id !== id) }
function addRelative() { form.parientes.push({ key: crypto.randomUUID?.() || Date.now(), id_tipo_pariente: '', nombre: '', telefono: '', observacion: '' }); dirty.value = true }
function removeRelative(index) { form.parientes.splice(index, 1); dirty.value = true }
function selectExisting() { sessionStorage.setItem('selected_patient', JSON.stringify(existingPatient.value)); router.back() }

function validate() {
  Object.keys(errors).forEach(key => delete errors[key]); const required = { tipo_doc: 'Seleccione el tipo de documento.', identificacion: 'Ingrese la identificación.', primernombre: 'Ingrese el primer nombre.', primerapellido: 'Ingrese el primer apellido.', fecha_de_nacimiento: 'Seleccione la fecha de nacimiento.', sexo: 'Seleccione el sexo.', email: 'Ingrese el correo electrónico.', celular1: 'Ingrese el celular principal.', pais: 'Seleccione el país.', id_tercero_principal: 'Seleccione el tercero contratante.', id_contrato: 'Seleccione el contrato.' }
  Object.entries(required).forEach(([key, message]) => { if (!String(form[key] ?? '').trim()) errors[key] = message })
  if (form.fecha_de_nacimiento > today) errors.fecha_de_nacimiento = 'La fecha no puede estar en el futuro.'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Ingrese un correo válido.'
  if (verification.value !== 'available') errors.identificacion = verification.value === 'exists' ? 'La identificación ya pertenece a un paciente.' : 'Debe verificar la identificación.'
  if (form.parientes.some(item => !item.id_tipo_pariente || !item.nombre.trim() || !item.telefono.trim() || !item.observacion.trim())) generalError.value = 'Complete todos los campos de cada contacto familiar.'
  const first = Object.keys(errors)[0]; if (first) requestAnimationFrame(() => document.getElementById(first)?.focus())
  return !first && !generalError.value
}
const optionalKeys = ['segundonombre', 'segundoapellido', 'id_estado_civil', 'id_ocupacion', 'alias', 'celular2', 'id_departamento', 'id_municipio', 'dir', 'postal_code', 'id_tercero_principal', 'id_tipo_usuario', 'id_rango', 'via_de_ingreso']
const idKeys = ['tipo_doc', 'sexo', 'pais', 'id_estado_civil', 'id_ocupacion', 'id_departamento', 'id_municipio', 'id_contrato', 'id_tercero_principal', 'id_tipo_usuario', 'id_rango']
function payload() { const data = { ...form, identificacion: form.identificacion.trim(), cie: selectedDiagnoses.value.map(item => Number(item.id)), parientes: form.parientes.map(({ key, ...item }) => ({ ...item, id_tipo_pariente: Number(item.id_tipo_pariente), nombre: item.nombre.trim(), telefono: item.telefono.trim(), observacion: item.observacion.trim() })) }; Object.keys(data).forEach(key => { if (typeof data[key] === 'string') data[key] = data[key].trim() }); optionalKeys.forEach(key => { if (data[key] === '') data[key] = null }); idKeys.forEach(key => { if (data[key] !== null && data[key] !== '') data[key] = Number(data[key]) }); return data }
function assignBackendErrors(error) {
  let fieldErrors = error.payload?.errors
  if (!fieldErrors && typeof error.payload?.message === 'string') {
    try { fieldErrors = JSON.parse(error.payload.message) } catch { /* El mensaje no contiene errores por campo. */ }
  }
  if (!fieldErrors || Array.isArray(fieldErrors) || typeof fieldErrors !== 'object') return false
  Object.entries(fieldErrors).forEach(([field, messages]) => { errors[field] = Array.isArray(messages) ? messages.join(', ') : String(messages) })
  const first = Object.keys(fieldErrors)[0]
  requestAnimationFrame(() => document.getElementById(first)?.focus())
  return true
}
async function save() { if (saving.value) return; generalError.value = ''; if (!validate()) return; saving.value = true; try { const response = await crearPaciente(payload()); createdId.value = response.id_paciente; dirty.value = false; if (fromAdmission.value) { sessionStorage.setItem('selected_patient', JSON.stringify({ paciente_id: response.id_paciente, nombre: `${form.primernombre} ${form.primerapellido}`, identificacion: form.identificacion })); router.back() } else window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (error) { const hasFieldErrors = assignBackendErrors(error); generalError.value = hasFieldErrors ? 'Revise los campos señalados e intente nuevamente.' : obtenerMensajeError(error); if (/ya existe/i.test(generalError.value)) { errors.identificacion = generalError.value; verification.value = 'pending' } } finally { saving.value = false } }
function cancel() { if (!dirty.value || window.confirm('Hay cambios sin guardar. ¿Desea salir?')) router.back() }
function beforeUnload(event) { if (dirty.value) event.preventDefault() }
onMounted(() => { loadCatalogs(); window.addEventListener('beforeunload', beforeUnload) }); onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<style scoped>
:deep(.section-icon){width:42px;height:42px;flex:none;border-radius:.65rem;display:grid;place-items:center;background:rgba(var(--bs-primary-rgb),.12);color:var(--bs-primary);font-size:1.25rem}.relative-row{padding:1rem;border:1px solid var(--bs-border-color);border-radius:.75rem}.diagnosis-tag{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem .7rem;border-radius:2rem;background:rgba(var(--bs-primary-rgb),.12);color:var(--bs-primary)}.diagnosis-tag button{border:0;background:none;color:inherit;font-size:1.2rem;line-height:1}.card-header{background:var(--bs-body-bg)}
</style>
