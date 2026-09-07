<template>
  <main class="hh-page general-settings">
    <section class="settings-hero">
      <div><span>CONFIGURACIÓN INSTITUCIONAL</span>
        <h1>Parametrización general</h1>
        <p>Administre estructuras funcionales, seguridad y catálogos centrales de HHospital.</p>
      </div>
      <div class="hero-mark"><i class="ph ph-gear-six"></i></div>
    </section>

    <div class="settings-shell mt-4">
      <aside class="settings-nav">
        <header><small>MÓDULOS</small><strong>Configuración</strong></header>
        <button v-for="item in modules" :key="item.id" :class="{ active: section === item.id }"
          @click="selectSection(item.id)"><span :style="{ '--tone': item.color }"><i :class="item.icon"></i></span>
          <div><strong>{{ item.label }}</strong><small>{{ item.help }}</small></div><i class="ph ph-caret-right"></i>
        </button>
        <router-link to="/parametrizacion/ubicaciones-fisicas"><span style="--tone:#7165d8"><i
              class="ph ph-buildings"></i></span>
          <div><strong>Ubicaciones físicas</strong><small>Sedes, torres, pisos y camas</small></div><i
            class="ph ph-arrow-square-out"></i>
        </router-link>
        <router-link to="/unidad-quirurgica/parametrizacion"><span style="--tone:#1686a6"><i
              class="ph ph-first-aid-kit"></i></span>
          <div><strong>Quirófanos</strong><small>Tipos, salas y horarios</small></div><i
            class="ph ph-arrow-square-out"></i>
        </router-link>
      </aside>

      <section class="settings-content">
        <header>
          <div><small>PARAMETRIZACIÓN</small>
            <h2>{{ activeModule.label }}</h2>
            <p>{{ activeModule.description }}</p>
          </div>
          <div class="header-actions">
            <SearchSelect v-if="section === 'services'" v-model="categoryFilter" :options="categoryFilterOptions"
              placeholder="Todas las categorías" @change="load" /><label v-if="section !== 'catalogs'"><i
                class="ph ph-magnifying-glass"></i><input v-model="search"
                placeholder="Filtrar resultados"></label><button v-if="canCreate" class="btn btn-primary"
              @click="openCreate"><i class="ph ph-plus me-1"></i>Crear</button><button class="btn btn-outline-primary"
              :disabled="loading" @click="load"><i class="ph ph-arrows-clockwise"></i></button>
          </div>
        </header>
        <div v-if="notice.text" class="alert mx-3 mt-3 mb-0" :class="`alert-${notice.type}`">{{ notice.text }}</div>
        <div v-if="loading" class="loading-state"><span class="spinner-border text-primary"></span>
          <p>Consultando parametrización…</p>
        </div>
        <div v-else class="content-body">
          <template v-if="section === 'catalogs'">
            <div class="catalog-picker"><button v-for="catalog in catalogs" :key="catalog.id"
                :class="{ active: selectedCatalog === catalog.id }" @click="openCatalog(catalog)"><i
                  class="ph ph-list-bullets"></i><span><strong>{{ catalog.label }}</strong><small>Catálogo de
                    consulta</small></span><i class="ph ph-caret-right"></i></button></div>
            <div class="catalog-results">
              <div v-if="!selectedCatalog" class="empty"><i class="ph ph-cursor-click"></i>
                <h3>Seleccione un catálogo</h3>
                <p>Los registros se mostrarán en este espacio en modo de solo lectura.</p>
              </div><template v-else>
                <div class="catalog-title"><strong>{{ selectedCatalogLabel }}</strong><span>{{ catalogRows.length }}
                    registros</span></div>
                <div v-if="!catalogRows.length" class="empty small">
                  <p>El catálogo no contiene registros.</p>
                </div>
                <div v-else class="simple-list">
                  <article v-for="(row, index) in catalogRows" :key="entityId(row) || index"><span>{{ index + 1
                      }}</span>
                    <div><strong>{{ entityName(row) }}</strong><small>{{ entityDetail(row) }}</small></div>
                  </article>
                </div>
              </template>
            </div>
          </template>

          <template v-else>
            <div v-if="!filteredRows.length" class="empty"><i :class="activeModule.icon"></i>
              <h3>Sin registros</h3>
              <p>No existen elementos o ninguno coincide con el filtro.</p>
            </div>
            <div v-else class="entity-grid">
              <article v-for="row in filteredRows" :key="entityId(row)"><span class="entity-icon"
                  :style="{ '--tone': activeModule.color }"><i :class="activeModule.icon"></i></span>
                <div class="entity-copy"><small>{{ entityCode(row) }}</small><strong>{{ entityName(row) }}</strong>
                  <p>{{ entityDetail(row) }}</p>
                </div>
                <div v-if="section === 'services'" class="d-flex gap-1"><button class="btn btn-sm btn-outline-primary"
                    @click="editService(row)"><i class="ph ph-pencil-simple"></i></button><button
                    class="btn btn-sm btn-outline-primary" @click="openClinicalRecords(row)"><i
                      class="ph ph-notebook me-1"></i>Registros</button></div><button
                  v-else-if="section === 'specialties'" class="btn btn-sm btn-outline-primary"
                  @click="showProfessionals(row)">Profesionales</button><button v-else-if="section === 'offices'"
                  class="btn btn-sm btn-outline-primary" @click="showSchedules(row)">Horarios</button>
                <div v-else-if="section === 'profiles'" class="d-flex gap-1"><button
                    class="btn btn-sm btn-outline-primary" @click="showProfileDocuments(row)">Documentos</button><button
                    class="btn btn-sm btn-outline-secondary" @click="showProfileUsers(row)">Usuarios</button></div>
                <div v-else-if="section === 'security' && row._kind === 'role'" class="d-flex gap-1"><button
                    class="btn btn-sm btn-outline-primary" @click="configureRole(row)"><i
                      class="ph ph-key me-1"></i>Permisos</button><button class="btn btn-sm btn-outline-primary"
                    @click="configureRoleMenus(row)"><i class="ph ph-list me-1"></i>Menús</button></div>
              </article>
            </div>
          </template>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="modal" class="form-layer" @mousedown.self="closeModal">
        <section class="config-modal" role="dialog" aria-modal="true">
          <header>
            <div><small>PARAMETRIZACIÓN GENERAL</small>
              <h3>{{ modalTitle }}</h3>
            </div><button class="btn-close" :disabled="saving" @click="closeModal"></button>
          </header>
          <form @submit.prevent="submitModal">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
              <template v-if="modal === 'simple'"><label class="form-label">Nombre <span
                    class="text-danger">*</span></label><input v-model.trim="form.name" class="form-control" required
                  :placeholder="activeModule.createPlaceholder"><small v-if="section === 'security'"
                  class="text-muted d-block mt-2">Después de crear el rol, utilice <strong>Accesos</strong> para asignar
                  o remover sus permisos.</small><template v-if="section === 'documents'"><label
                    class="form-label mt-3">Etiqueta <span class="text-danger">*</span></label><input
                    v-model.trim="form.tag" class="form-control" required placeholder="Ej. TP"><label
                    class="switch-row mt-3"><span><strong>Documento obligatorio</strong><small>Será requerido cuando se
                        asocie a un perfil.</small></span><input v-model="form.required" type="checkbox"
                      class="form-check-input"></label></template></template>
              <template v-else-if="modal === 'specialty'"><label class="form-label">Nombre</label><input
                  v-model.trim="form.name" class="form-control" required><label class="form-label mt-3">Servicio</label>
                <SearchSelect v-model="form.serviceId" :options="serviceCatalog" required /><label
                  class="form-label mt-3">Perfil</label>
                <SearchSelect v-model="form.profileId" :options="profileCatalog" required />
              </template>
              <template v-else-if="modal === 'service'">
                <div class="row g-3">
                  <div class="col-md-4"><label class="form-label">Código *</label><input
                      v-model.trim="serviceForm.codigo" class="form-control" :disabled="editing" required></div>
                  <div class="col-md-8"><label class="form-label">Nombre *</label><input
                      v-model.trim="serviceForm.nombre" class="form-control" required></div>
                  <div class="col-md-6"><label class="form-label">Etiqueta *</label><input
                      v-model.trim="serviceForm.tag" class="form-control" required></div>
                  <div class="col-md-6"><label class="form-label">Código CUPS</label><input
                      v-model.trim="serviceForm.cups" class="form-control"></div>
                  <div class="col-md-6"><label class="form-label">Costo interno *</label><input
                      v-model.number="serviceForm.costo" type="number" min="0" class="form-control" required></div>
                  <div class="col-md-6"><label class="form-label">Categoría *</label>
                    <SearchSelect v-model="serviceForm.id_categoria" :options="categoryCatalog" required />
                  </div>
                </div><label class="switch-row mt-3"><span><strong>Requiere asignación profesional</strong><small>Limita
                      quién puede realizar este servicio.</small></span><input v-model="serviceForm.required_asignacion"
                    type="checkbox" class="form-check-input"></label>
                <div v-if="serviceForm.required_asignacion" class="check-grid mt-2"><label
                    v-for="item in profileCatalog" :key="entityId(item)"><input v-model="serviceForm.json_perfiles"
                      type="checkbox" :value="Number(entityId(item))" class="form-check-input">{{ entityName(item)
                      }}</label></div><label class="switch-row mt-2"><span><strong>Requiere
                      equipo</strong><small>Seleccione los perfiles que integran el equipo y cuáles son
                      obligatorios.</small></span><input v-model="serviceForm.required_equipo" type="checkbox"
                    class="form-check-input"></label>
                <div v-if="serviceForm.required_equipo" class="team-grid mt-2">
                  <article v-for="item in profileCatalog" :key="entityId(item)"><label><input type="checkbox"
                        class="form-check-input" :checked="isTeamMember(item)"
                        @change="toggleTeam(item, $event.target.checked)"><strong>{{ entityName(item)
                        }}</strong></label><label v-if="isTeamMember(item)" class="required-check"><input
                        type="checkbox" class="form-check-input" :checked="teamRequired(item)"
                        @change="setTeamRequired(item, $event.target.checked)">Obligatorio</label></article>
                </div>
              </template>
              <template v-else-if="modal === 'association'">
                <p class="text-muted">Seleccione las opciones asociadas a <strong>{{ selectedEntity &&
                  entityName(selectedEntity) }}</strong>.</p>
                <div class="check-grid"><label v-for="item in associationOptions" :key="item.id"><input
                      v-model="associationSelected" type="checkbox" :value="item.id" class="form-check-input">{{
                        item.name }}</label></div>
                <div v-if="!associationOptions.length" class="empty small">
                  <p>No hay opciones disponibles.</p>
                </div>
              </template>
              <template v-else-if="modal === 'readonly'">
                <div v-if="!readonlyRows.length" class="empty small">
                  <p>No existen registros asociados.</p>
                </div>
                <div v-else class="simple-list">
                  <article v-for="(row, index) in readonlyRows" :key="entityId(row) || index"><span>{{ index + 1
                  }}</span>
                    <div><strong>{{ entityName(row) }}</strong><small>{{ entityDetail(row) }}</small></div>
                  </article>
                </div>
              </template>
              <template v-else-if="modal === 'schedule'">
                <div class="row g-3">
                  <div class="col-md-6"><label class="form-label">Día</label><select v-model.number="scheduleForm.dia"
                      class="form-select" required>
                      <option v-for="(day, index) in days" :key="day" :value="index + 1">{{ day }}</option>
                    </select></div>
                  <div class="col-md-6"><label class="form-label">Especialidad</label>
                    <SearchSelect v-model="scheduleForm.id_especialidad" :options="specialtyCatalog" required />
                  </div>
                  <div class="col-md-6"><label class="form-label">Hora inicial</label><input
                      v-model="scheduleForm.start" type="time" class="form-control" required></div>
                  <div class="col-md-6"><label class="form-label">Hora final</label><input v-model="scheduleForm.end"
                      type="time" class="form-control" required></div>
                </div>
                <div v-if="readonlyRows.length" class="mt-3"><small class="fw-bold">HORARIOS ACTUALES</small>
                  <div class="simple-list mt-2">
                    <article v-for="row in readonlyRows" :key="row.id"><span><i class="ph ph-clock"></i></span>
                      <div><strong>{{ row.dia || days[Number(row.id_dia) - 1] }}</strong><small>{{ row.hora_inicio }} –
                          {{
                            row.hora_fin }}</small></div>
                    </article>
                  </div>
                </div>
              </template>
              <template v-else-if="modal === 'records'">
                <p class="text-muted">Asocie registros clínicos y configure las reglas requeridas para <strong>{{
                  entityName(selectedEntity) }}</strong>.</p>
                <div class="records-add">
                  <SearchSelect v-model="clinical.registerId" :options="clinical.available"
                    placeholder="Seleccione un registro disponible" /><button type="button" class="btn btn-primary"
                    :disabled="saving || !clinical.registerId" @click="addClinicalRecord">Asociar</button>
                </div>
                <div class="simple-list mt-3">
                  <article v-for="row in clinical.assigned" :key="row.id"><span><i class="ph ph-notebook"></i></span>
                    <div><strong>{{ entityName(row) }}</strong><small>ID maestro: {{ row.id_master_registro }}</small>
                    </div><button type="button" class="btn btn-sm btn-outline-danger"
                      @click="removeClinicalRecord(row)"><i class="ph ph-trash"></i></button>
                  </article>
                  <div v-if="!clinical.assigned.length" class="empty small">
                    <p>No hay registros asociados.</p>
                  </div>
                </div>
                <hr>
                <h4 class="h6">Agregar validación</h4>
                <div class="row g-2">
                  <div class="col-md-6"><label class="form-label">Registro</label>
                    <SearchSelect v-model="clinical.validationRegisterId" :options="clinicalAssignedOptions" />
                  </div>
                  <div class="col-md-6"><label class="form-label">Regla</label><select v-model.number="clinical.section"
                      class="form-select">
                      <option :value="2">Al menos uno</option>
                      <option :value="3">Todos obligatorios</option>
                      <option :value="4">Frecuencia</option>
                    </select></div><template v-if="clinical.section === 4">
                    <div class="col-md-4"><label class="form-label">Tipo</label><select v-model.number="clinical.type"
                        class="form-select">
                        <option :value="1">Sucesivo</option>
                        <option :value="2">Periódico</option>
                      </select></div>
                    <div v-if="clinical.type === 2" class="col-md-4"><label class="form-label">Meses *</label><input
                        v-model.number="clinical.months" type="number" min="1" class="form-control"></div>
                    <div class="col-md-4"><label class="form-label">Pagador</label><input
                        v-model.number="clinical.payer" type="number" min="1" class="form-control"></div>
                  </template>
                  <div class="col-12"><button type="button" class="btn btn-outline-primary"
                      :disabled="saving || !clinical.validationRegisterId" @click="addClinicalValidation">Agregar
                      validación</button></div>
                </div>
                <div v-for="group in validationGroups" :key="group.key" class="mt-3"><small class="fw-bold">{{
                  group.label
                }}</small>
                  <div class="simple-list mt-2">
                    <article v-for="row in group.rows"
                      :key="`${group.key}-${row.id_master_registro || row.id_master || row.id}`">
                      <span><i class="ph ph-check-circle"></i></span>
                      <div><strong>{{ entityName(row) }}</strong><small>{{ validationDetail(row, group.key) }}</small>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-danger"
                        @click="removeClinicalValidation(group.key, row)"><i class="ph ph-trash"></i></button>
                    </article>
                  </div>
                </div>
              </template>
            </div>
            <footer><button type="button" class="btn btn-outline-secondary" :disabled="saving"
                @click="closeModal">Cerrar</button><button v-if="!['readonly', 'records'].includes(modal)"
                class="btn btn-primary" :disabled="saving"><span v-if="saving"
                  class="spinner-border spinner-border-sm me-2"></span>Guardar</button>
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
import SearchSelect from '@/components/form/SearchSelect.vue'
import { obtenerMensajeError } from '@/services/api'
import * as api from '@/services/parametrizacionGeneral'
import { useNavigationStore } from '@/store/pinia/navigation'

const route = useRoute(), router = useRouter()
const navigationStore = useNavigationStore()
const modules = [
  { id: 'profiles', label: 'Perfiles', help: 'Perfiles y documentos', description: 'Defina perfiles institucionales y los documentos requeridos para cada uno.', icon: 'ph ph-identification-card', color: '#197eb8', createPlaceholder: 'Ej. Enfermería' },
  { id: 'security', label: 'Roles', help: 'Seguridad y accesos', description: 'Administre los roles del sistema y configure sus permisos desde la opción Accesos.', icon: 'ph ph-shield-check', color: '#6d63d7', createPlaceholder: 'Ej. coordinador_hospitalizacion' },
  { id: 'services', label: 'Servicios', help: 'Oferta asistencial', description: 'Consulte y configure los servicios prestados por la institución.', icon: 'ph ph-first-aid-kit', color: '#15956f', createPlaceholder: '' },
  { id: 'specialties', label: 'Especialidades', help: 'Servicio y profesionales', description: 'Relacione especialidades con servicios, perfiles y profesionales habilitados.', icon: 'ph ph-stethoscope', color: '#cf7626', createPlaceholder: '' },
  { id: 'documents', label: 'Talento humano', help: 'Tipos documentales', description: 'Gestione los tipos de documentos exigibles al talento humano.', icon: 'ph ph-files', color: '#b64e78', createPlaceholder: 'Ej. Tarjeta profesional' },
  { id: 'offices', label: 'Consultorios', help: 'Espacios y horarios', description: 'Configure consultorios y bloques horarios de atención intramural.', icon: 'ph ph-door-open', color: '#38869b', createPlaceholder: 'Ej. Consultorio 101' },
  { id: 'catalogs', label: 'Catálogos generales', help: 'Consulta centralizada', description: 'Explore los catálogos centrales disponibles en modo de solo lectura.', icon: 'ph ph-books', color: '#65758b' },
]
const section = ref(modules.some(item => item.id === route.query.seccion) ? route.query.seccion : 'profiles')
const rows = ref([]), loading = ref(false), saving = ref(false), search = ref(''), modal = ref(null), modalError = ref(''), selectedEntity = ref(null)
const notice = reactive({ text: '', type: 'success' })
const form = reactive({ name: '', tag: '', required: true, serviceId: '', profileId: '' })
const emptyService = () => ({ codigo: '', nombre: '', tag: '', cups: '', costo: 0, id_categoria: '', required_asignacion: false, json_perfiles: [], required_equipo: false, equipo: [], almacen_alltrue: false })
const serviceForm = reactive(emptyService()), scheduleForm = reactive({ dia: 1, start: '08:00', end: '12:00', id_especialidad: '' })
const profileCatalog = ref([]), serviceCatalog = ref([]), categoryCatalog = ref([]), specialtyCatalog = ref([]), readonlyRows = ref([]), associationOptions = ref([]), associationSelected = ref([]), originalAssociations = ref([]), associationType = ref(''), associationTarget = ref('')
const catalogs = api.CATALOGOS_GENERALES, selectedCatalog = ref(''), catalogRows = ref([]), editing = ref(false)
const categoryFilter = ref('')
const clinical = reactive({ assigned: [], available: [], validations: {}, registerId: '', validationRegisterId: '', section: 2, type: 1, months: '', payer: '' })
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const activeModule = computed(() => modules.find(item => item.id === section.value))
const canCreate = computed(() => section.value !== 'catalogs')
const modalTitle = computed(() => modal.value === 'association' ? `Configurar ${associationType.value}` : modal.value === 'readonly' ? 'Información asociada' : modal.value === 'schedule' ? 'Horarios del consultorio' : modal.value === 'records' ? 'Registros clínicos y validaciones' : editing.value ? 'Editar servicio' : `Crear ${activeModule.value.label.toLowerCase()}`)
const filteredRows = computed(() => { const term = search.value.toLowerCase(); return rows.value.filter(row => [entityName(row), entityCode(row), entityDetail(row)].join(' ').toLowerCase().includes(term)) })
const selectedCatalogLabel = computed(() => catalogs.find(item => item.id === selectedCatalog.value)?.label || '')
const categoryFilterOptions = computed(() => [{ id: '', nombre: 'Todas las categorías' }, ...categoryCatalog.value])
const clinicalAssignedOptions = computed(() => clinical.assigned.map(row => ({ id: Number(row.id_master_registro ?? row.id_master ?? row.id), nombre: entityName(row) })))
const validationGroups = computed(() => [{ key: 'at_leastOne', label: 'AL MENOS UNO', rows: array(clinical.validations?.at_leastOne) }, { key: 'all_One', label: 'TODOS OBLIGATORIOS', rows: array(clinical.validations?.all_One) }, { key: 'frecuencias', label: 'FRECUENCIAS', rows: array(clinical.validations?.frecuencias) }].filter(group => group.rows.length))
const array = value => { if (Array.isArray(value)) return value; for (const key of ['data', 'items', 'perfiles', 'roles', 'permisos', 'menus', 'consultorios', 'especialidades', 'servicios', 'documentos']) if (Array.isArray(value?.[key])) return value[key]; return [] }
const entityId = row => row?.id ?? row?.id_menu ?? row?.id_perfil ?? row?.id_rol ?? row?.id_permiso ?? row?.id_servicio ?? row?.id_especialidad ?? row?.id_consultorio ?? row?.id_tipo_documento
const entityName = row => row?.nombre ?? row?.name ?? row?.menu ?? row?.profesional ?? row?.dia ?? `Registro #${entityId(row) || ''}`
const entityCode = row => row?._kind === 'permission' ? 'PERMISO' : row?._kind === 'role' ? 'ROL' : row?.codigo || row?.tag || `ID ${entityId(row) || '—'}`
const entityDetail = row => row?.descripcion ?? row?.servicio?.nombre ?? row?.perfil?.nombre ?? row?.categoria?.nombre ?? row?.permiso ?? row?.identificacion ?? (row?.hora_inicio ? `${row.hora_inicio} – ${row.hora_fin}` : 'Configuración institucional')

async function load() { loading.value = true; notice.text = ''; try { if (section.value === 'profiles') rows.value = array(await api.listarPerfilesSistema()); if (section.value === 'security') rows.value = array(await api.listarRolesSistema()).map(x => ({ ...x, _kind: 'role' })); if (section.value === 'services') { if (!categoryCatalog.value.length) categoryCatalog.value = array(await api.listarCategoriasServicios()); rows.value = array(categoryFilter.value ? await api.listarServiciosCategoria(categoryFilter.value) : await api.listarServiciosSistema()) } if (section.value === 'specialties') rows.value = array(await api.listarEspecialidadesSistema()); if (section.value === 'documents') rows.value = array(await api.listarTiposDocumentoTalento()); if (section.value === 'offices') rows.value = array(await api.listarConsultoriosSistema()) } catch (error) { showError(error) } finally { loading.value = false } }
function selectSection(id) { section.value = id; search.value = ''; rows.value = []; router.replace({ query: { ...route.query, seccion: id } }); if (id !== 'catalogs') load() }
async function ensureCatalogs() { const requests = []; if (!profileCatalog.value.length) requests.push(api.listarPerfilesSistema().then(v => profileCatalog.value = array(v))); if (!serviceCatalog.value.length) requests.push(api.listarServiciosSistema().then(v => serviceCatalog.value = array(v))); if (!categoryCatalog.value.length) requests.push(api.listarCategoriasServicios().then(v => categoryCatalog.value = array(v))); if (!specialtyCatalog.value.length) requests.push(api.listarEspecialidadesSistema().then(v => specialtyCatalog.value = array(v))); await Promise.all(requests) }
async function openCreate() { modalError.value = ''; editing.value = false; Object.assign(form, { name: '', tag: '', required: true, serviceId: '', profileId: '' }); Object.assign(serviceForm, emptyService()); if (section.value === 'services') { await ensureCatalogs(); modal.value = 'service' } else if (section.value === 'specialties') { await ensureCatalogs(); modal.value = 'specialty' } else modal.value = 'simple' }
function closeModal() { if (!saving.value) { modal.value = null; selectedEntity.value = null } }
async function submitModal() { saving.value = true; modalError.value = ''; try { if (modal.value === 'simple') { if (section.value === 'profiles') await api.crearPerfilSistema(form.name); if (section.value === 'security') await api.crearRolSistema(form.name); if (section.value === 'documents') await api.crearTipoDocumentoTalento({ nombre: form.name, is_required: Boolean(form.required), tag: form.tag }); if (section.value === 'offices') await api.crearConsultorioSistema(form.name) } if (modal.value === 'specialty') await api.crearEspecialidadSistema({ id_servicio: Number(form.serviceId), id_perfil: Number(form.profileId), nombre: form.name }); if (modal.value === 'service') { const payload = { ...serviceForm, codigo: serviceForm.codigo.replace(/[.,]/g, ''), costo: Number(serviceForm.costo), id_categoria: Number(serviceForm.id_categoria), required_asignacion: serviceForm.required_asignacion ? 1 : 0, required_equipo: serviceForm.required_equipo ? 1 : 0, almacen_alltrue: serviceForm.almacen_alltrue ? 1 : 0, json_perfiles: serviceForm.required_asignacion ? serviceForm.json_perfiles.map(Number) : [], equipo: serviceForm.required_equipo ? serviceForm.equipo.map(item => ({ id_perfil: Number(item.id_perfil), obligatorio: item.obligatorio ? 1 : 0 })) : [] }; if (!payload.cups) delete payload.cups; editing.value ? await api.actualizarServicioSistema(entityId(selectedEntity.value), payload) : await api.crearServicioSistema(payload) } if (modal.value === 'association' && await saveAssociation() === false) return; if (modal.value === 'schedule') await saveSchedule(); closeModal(); notice.type = 'success'; notice.text = 'Configuración guardada correctamente.'; await load() } catch (error) { modalError.value = obtenerMensajeError(error) } finally { saving.value = false } }
async function editService(row) { selectedEntity.value = row; editing.value = true; await ensureCatalogs(); const detail = await api.consultarServicioSistema(entityId(row)), value = detail?.data || detail || row; Object.assign(serviceForm, emptyService(), value); serviceForm.json_perfiles = array(value.json_perfiles || value.perfiles).map(entityId).filter(Boolean).map(Number); serviceForm.equipo = array(value.equipo).map(item => ({ id_perfil: Number(item.id_perfil ?? item.perfil?.id ?? entityId(item)), obligatorio: Boolean(item.obligatorio) })); modal.value = 'service' }
async function showProfessionals(row) { selectedEntity.value = row; readonlyRows.value = array(await api.listarProfesionalesEspecialidad(entityId(row))); modal.value = 'readonly' }
async function showProfileDocuments(row) { selectedEntity.value = row; associationTarget.value = 'documents'; associationType.value = 'documentos requeridos'; const [catalog, assigned] = await Promise.all([api.listarTiposDocumentoTalento(), api.listarDocumentosPerfil(entityId(row))]); associationOptions.value = array(catalog).map(x => ({ id: Number(entityId(x)), name: entityName(x) })); associationSelected.value = array(assigned).map(entityId).map(Number); originalAssociations.value = [...associationSelected.value]; modal.value = 'association' }
async function showProfileUsers(row) { selectedEntity.value = row; readonlyRows.value = array(await api.listarUsuariosPerfil(entityId(row))); modal.value = 'readonly' }
async function configureRole(row) { selectedEntity.value = row; associationTarget.value = 'permissions'; associationType.value = 'permisos del rol'; const [catalog, assigned] = await Promise.all([api.listarPermisosSistema(), api.listarPermisosRol(entityId(row))]); associationOptions.value = array(catalog).map(x => ({ id: entityName(x), name: entityName(x) })); const source = assigned?.permisos || assigned?.data?.permisos || array(assigned); associationSelected.value = array(source).map(entityName); originalAssociations.value = [...associationSelected.value]; modal.value = 'association' }
const flattenMenus = (items, parent = '') => array(items).flatMap(item => { const current = parent ? `${parent} / ${entityName(item)}` : entityName(item), children = item.submenus || item.children || item.menus || []; return [{ id: Number(entityId(item)), name: current }, ...flattenMenus(children, current)] }).filter(item => Number.isFinite(item.id) && item.id > 0)
async function configureRoleMenus(row) { selectedEntity.value = row; associationTarget.value = 'menus'; associationType.value = 'menús del rol'; const [catalog, assigned] = await Promise.all([api.listarMenusSistema(), api.listarMenusRol(entityId(row))]); associationOptions.value = flattenMenus(catalog); const source = assigned?.menus || assigned?.data?.menus || assigned; associationSelected.value = flattenMenus(source).map(item => item.id); originalAssociations.value = [...associationSelected.value]; modal.value = 'association' }
async function saveAssociation() { const add = associationSelected.value.filter(x => !originalAssociations.value.includes(x)), remove = originalAssociations.value.filter(x => !associationSelected.value.includes(x)); if (section.value === 'profiles') { if (remove.length && !window.confirm('¿Confirma que desea retirar los documentos seleccionados del perfil?')) return false; if (add.length) await api.actualizarDocumentosPerfil(entityId(selectedEntity.value), add, false); if (remove.length) await api.actualizarDocumentosPerfil(entityId(selectedEntity.value), remove, true) } else if (associationTarget.value === 'menus') { if (remove.length && !window.confirm('¿Confirma que desea retirar los menús seleccionados del rol?')) return false; if (add.length) await api.actualizarMenusRol(entityId(selectedEntity.value), add, false); if (remove.length) await api.actualizarMenusRol(entityId(selectedEntity.value), remove, true); navigationStore.clearMenus() } else { if (remove.length && !window.confirm('¿Confirma que desea retirar los permisos seleccionados del rol?')) return false; if (add.length) await api.actualizarPermisosRol(entityId(selectedEntity.value), add, false); if (remove.length) await api.actualizarPermisosRol(entityId(selectedEntity.value), remove, true); localStorage.removeItem('permissions') } return true }
async function showSchedules(row) { selectedEntity.value = row; await ensureCatalogs(); readonlyRows.value = array(await api.listarHorariosConsultorio(entityId(row))); Object.assign(scheduleForm, { dia: 1, start: '08:00', end: '12:00', id_especialidad: '' }); modal.value = 'schedule' }
async function saveSchedule() { const [sh, sm] = scheduleForm.start.split(':').map(Number), [eh, em] = scheduleForm.end.split(':').map(Number); if (eh * 60 + em <= sh * 60 + sm) throw new Error('La hora final debe ser posterior a la hora inicial.'); const response = await api.crearHorarioConsultorio(entityId(selectedEntity.value), [{ dia: Number(scheduleForm.dia), hora_inicio: sh, minuto_inicio: sm, hora_fin: eh, minuto_fin: em, id_especialidad: Number(scheduleForm.id_especialidad) }]), result = response?.data || response, failed = result?.diasErrados || result?.dias_errados || []; if (failed.length) throw new Error(`No fue posible guardar ${failed.length} franja(s). Revise cruces de horario y especialidad.`) }
const isTeamMember = item => serviceForm.equipo.some(member => Number(member.id_perfil) === Number(entityId(item)))
const teamRequired = item => Boolean(serviceForm.equipo.find(member => Number(member.id_perfil) === Number(entityId(item)))?.obligatorio)
function toggleTeam(item, checked) { const id = Number(entityId(item)); serviceForm.equipo = checked ? [...serviceForm.equipo, { id_perfil: id, obligatorio: true }] : serviceForm.equipo.filter(member => Number(member.id_perfil) !== id) }
function setTeamRequired(item, required) { const member = serviceForm.equipo.find(value => Number(value.id_perfil) === Number(entityId(item))); if (member) member.obligatorio = Boolean(required) }
async function reloadClinical() { const id = entityId(selectedEntity.value), [relations, validations, masters] = await Promise.all([api.listarRegistrosServicio(id), api.listarValidacionesRegistros(id), api.listarRegistrosMaestros()]); const value = relations?.data || relations || {}; clinical.assigned = array(value.in); const available = array(value.out).length ? array(value.out) : array(masters).filter(master => !clinical.assigned.some(row => Number(row.id_master_registro) === Number(entityId(master)))); clinical.available = available.map(row => ({ ...row, id: Number(row.id_master_registro ?? entityId(row)), nombre: entityName(row) })); clinical.validations = validations?.data || validations || {}; clinical.registerId = ''; clinical.validationRegisterId = '' }
async function openClinicalRecords(row) { selectedEntity.value = row; modalError.value = ''; modal.value = 'records'; try { await reloadClinical() } catch (error) { modalError.value = obtenerMensajeError(error) } }
async function addClinicalRecord() { saving.value = true; modalError.value = ''; try { await api.agregarRegistroServicio(entityId(selectedEntity.value), clinical.registerId); await reloadClinical() } catch (error) { modalError.value = obtenerMensajeError(error) } finally { saving.value = false } }
async function removeClinicalRecord(row) { if (!window.confirm(`¿Retirar el registro clínico “${entityName(row)}” del servicio?`)) return; saving.value = true; try { await api.retirarRegistroServicio(entityId(selectedEntity.value), row.id); await reloadClinical() } catch (error) { modalError.value = obtenerMensajeError(error) } finally { saving.value = false } }
async function addClinicalValidation() { if (clinical.section === 4 && clinical.type === 2 && !clinical.months) { modalError.value = 'Indique la periodicidad en meses.'; return } const payload = { id_registro: Number(clinical.validationRegisterId), id_seccion: Number(clinical.section), ...(clinical.section === 4 ? { tipo: Number(clinical.type) } : {}), ...(clinical.section === 4 && clinical.type === 2 ? { meses: Number(clinical.months) } : {}), ...(clinical.section === 4 && clinical.payer ? { pagador: Number(clinical.payer) } : {}) }; saving.value = true; modalError.value = ''; try { await api.agregarValidacionRegistro(entityId(selectedEntity.value), payload); await reloadClinical() } catch (error) { modalError.value = obtenerMensajeError(error) } finally { saving.value = false } }
async function removeClinicalValidation(type, row) { if (!window.confirm('¿Confirma que desea retirar esta validación clínica?')) return; const masterId = row.id_master_registro ?? row.id_master ?? row.id; saving.value = true; try { await api.retirarValidacionRegistro(entityId(selectedEntity.value), type, masterId); await reloadClinical() } catch (error) { modalError.value = obtenerMensajeError(error) } finally { saving.value = false } }
const validationDetail = (row, type) => type === 'frecuencias' ? `${Number(row.tipo) === 1 ? 'Sucesivo' : 'Periódico'}${row.meses ? ` · ${row.meses} meses` : ''}${row.pagador ? ` · Pagador ${row.pagador}` : ''}` : 'Regla clínica activa'
async function openCatalog(catalog) { selectedCatalog.value = catalog.id; loading.value = true; try { catalogRows.value = array(await api.consultarCatalogoSistema(catalog.id)) } catch (error) { showError(error) } finally { loading.value = false } }
function showError(error) { notice.type = 'danger'; notice.text = obtenerMensajeError(error) }
onMounted(() => { if (section.value !== 'catalogs') load() })
</script>

<style scoped>
.settings-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(120deg, #104f7f, #128ebf);
  color: #fff;
  box-shadow: 0 14px 34px rgba(14, 78, 126, .18)
}

.settings-hero span,
.settings-content>header small,
.config-modal header small {
  font-size: .61rem;
  font-weight: 800;
  letter-spacing: .08em
}

.settings-hero h1 {
  margin: .2rem 0;
  font-size: 1.65rem
}

.settings-hero p {
  margin: 0;
  opacity: .82
}

.hero-mark {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: #ffffff20;
  font-size: 2rem
}

.settings-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 1rem;
  align-items: start
}

.settings-nav,
.settings-content {
  overflow: hidden;
  border: 1px solid #dfe7ee;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(27, 65, 98, .06)
}

.settings-nav {
  padding: .55rem
}

.settings-nav header {
  padding: .7rem
}

.settings-nav header small,
.settings-nav header strong {
  display: block
}

.settings-nav header small {
  color: #8593a3;
  font-size: .58rem
}

.settings-nav button,
.settings-nav>a {
  display: flex;
  align-items: center;
  gap: .65rem;
  width: 100%;
  padding: .7rem;
  border: 1px solid transparent;
  border-radius: .72rem;
  background: transparent;
  color: #425267;
  text-align: left
}

.settings-nav button:hover,
.settings-nav button.active,
.settings-nav>a:hover {
  border-color: #d9e8f2;
  background: #f4f9fc;
  color: var(--bs-primary)
}

.settings-nav button>span,
.settings-nav>a>span,
.entity-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in srgb, var(--tone) 13%, white);
  color: var(--tone);
  font-size: 1.05rem
}

.settings-nav button>div,
.settings-nav>a>div {
  min-width: 0;
  flex: 1
}

.settings-nav strong,
.settings-nav small {
  display: block
}

.settings-nav strong {
  font-size: .76rem
}

.settings-nav small {
  color: #8491a1;
  font-size: .59rem
}

.settings-content {
  min-height: 650px
}

.settings-content>header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #e4ebf1;
  background: #fbfcfe
}

.settings-content h2 {
  margin: .15rem 0;
  font-size: 1.2rem
}

.settings-content header p {
  margin: 0;
  color: #748396;
  font-size: .7rem
}

.header-actions {
  display: flex;
  gap: .5rem
}

.header-actions label {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: 0 .65rem;
  border: 1px solid #dce4eb;
  border-radius: .55rem;
  background: #fff
}

.header-actions input {
  width: 170px;
  border: 0;
  outline: 0;
  font-size: .72rem
}

.loading-state,
.empty {
  display: grid;
  place-items: center;
  padding: 5rem 1rem;
  text-align: center;
  color: #718096
}

.empty>i {
  font-size: 2.8rem;
  color: #a9bece
}

.empty h3 {
  margin: .6rem 0 .1rem;
  font-size: 1rem
}

.empty p {
  margin: 0
}

.empty.small {
  padding: 2rem
}

.content-body {
  padding: 1rem
}

.entity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .7rem
}

.entity-grid article {
  display: flex;
  align-items: center;
  gap: .7rem;
  padding: .8rem;
  border: 1px solid #e2e9ef;
  border-radius: .8rem
}

.entity-copy {
  min-width: 0;
  flex: 1
}

.entity-copy small,
.entity-copy strong,
.entity-copy p {
  display: block;
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap
}

.entity-copy small {
  color: #8290a0;
  font-size: .58rem;
  font-weight: 800
}

.entity-copy strong {
  font-size: .8rem
}

.entity-copy p {
  color: #748396;
  font-size: .65rem
}

.catalog-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .5rem
}

.catalog-picker button {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .65rem;
  border: 1px solid #e1e8ee;
  border-radius: .7rem;
  background: #fff;
  text-align: left
}

.catalog-picker button.active {
  border-color: #8ac4eb;
  background: #f1f8fd;
  color: var(--bs-primary)
}

.catalog-picker button span {
  flex: 1
}

.catalog-picker strong,
.catalog-picker small {
  display: block
}

.catalog-picker strong {
  font-size: .71rem
}

.catalog-picker small {
  color: #8794a3;
  font-size: .56rem
}

.catalog-results {
  margin-top: 1rem;
  border-top: 1px solid #e4eaf0
}

.catalog-title {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0
}

.catalog-title span {
  color: #788698;
  font-size: .68rem
}

.simple-list {
  display: grid;
  gap: .4rem
}

.simple-list article {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .6rem;
  border: 1px solid #e5eaf0;
  border-radius: .6rem
}

.simple-list article>span {
  display: grid;
  place-items: center;
  min-width: 27px;
  height: 27px;
  border-radius: 8px;
  background: #e9f4fb;
  color: var(--bs-primary);
  font-size: .65rem
}

.simple-list strong,
.simple-list small {
  display: block
}

.simple-list strong {
  font-size: .73rem
}

.simple-list small {
  color: #8190a0;
  font-size: .62rem
}

.form-layer {
  position: fixed;
  inset: 0;
  z-index: 2050;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: #071522b8;
  backdrop-filter: blur(5px)
}

.config-modal {
  width: min(650px, 100%);
  max-height: 94vh;
  overflow: auto;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 28px 80px #0005
}

.config-modal>header {
  display: flex;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #e4eaf0
}

.config-modal h3 {
  margin: .15rem 0;
  font-size: 1.1rem
}

.config-modal .modal-body {
  padding: 1.25rem
}

.config-modal footer {
  display: flex;
  justify-content: flex-end;
  gap: .6rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e4eaf0
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .75rem;
  border: 1px solid #e1e8ee;
  border-radius: .7rem
}

.switch-row strong,
.switch-row small {
  display: block
}

.switch-row strong {
  font-size: .76rem
}

.switch-row small {
  color: #8190a0;
  font-size: .63rem
}

.check-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .45rem
}

.check-grid label {
  display: flex;
  align-items: center;
  gap: .45rem;
  padding: .55rem;
  border: 1px solid #e4e9ef;
  border-radius: .55rem;
  font-size: .7rem
}

@media(max-width:991px) {
  .settings-shell {
    grid-template-columns: 1fr
  }

  .settings-nav {
    display: flex;
    overflow: auto
  }

  .settings-nav header {
    display: none
  }

  .settings-nav button,
  .settings-nav>a {
    min-width: 210px
  }

  .settings-content {
    min-height: 520px
  }
}

@media(max-width:700px) {
  .settings-content>header {
    align-items: flex-start;
    flex-direction: column
  }

  .header-actions {
    width: 100%
  }

  .header-actions label {
    flex: 1
  }

  .header-actions input {
    width: 100%
  }

  .entity-grid,
  .catalog-picker {
    grid-template-columns: 1fr
  }

  .hero-mark {
    display: none
  }

  .config-modal footer {
    flex-direction: column-reverse
  }
}
</style>
