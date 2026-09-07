<template>
  <main class="hh-page appointment-page">
    <section class="agenda-hero">
      <div><span>ATENCIÓN INTRAMURAL</span><h1>Agenda de consultorios</h1><p>Consulte disponibilidad, programe citas y gestione la atención diaria.</p></div>
      <div><router-link to="/parametrizar-consultorio" class="btn btn-outline-light"><i class="ph ph-gear me-1"></i>Consultorios</router-link><button class="btn btn-light text-primary" @click="openNewAppointment"><i class="ph ph-calendar-plus me-1"></i>Nueva cita</button><button class="btn btn-outline-light" :disabled="loading" @click="load"><i class="ph ph-arrows-clockwise me-1"></i>Actualizar</button></div>
    </section>

    <section class="agenda-filters">
      <div><label class="form-label">Consultorio</label><select v-model="filters.officeId" class="form-select"><option value="">Seleccione</option><option v-for="item in offices" :key="id(item)" :value="id(item)">{{ name(item) }}</option></select></div>
      <div><label class="form-label">Desde</label><input v-model="filters.from" type="date" class="form-control"></div>
      <div><label class="form-label">Hasta</label><input v-model="filters.to" type="date" :min="filters.from" class="form-control"></div>
      <button class="btn btn-primary" :disabled="loading || !canSearch" @click="load"><i class="ph ph-calendar-dots me-1"></i>Consultar agenda</button>
    </section>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <section class="agenda-metrics">
      <article><span class="blue"><i class="ph ph-calendar-check"></i></span><div><small>Citas programadas</small><strong>{{ occupied.length }}</strong></div></article>
      <article><span class="green"><i class="ph ph-clock"></i></span><div><small>Espacios disponibles</small><strong>{{ free.length }}</strong></div></article>
      <article><span class="amber"><i class="ph ph-user-check"></i></span><div><small>Pacientes presentes</small><strong>{{ arrivedCount }}</strong></div></article>
      <article><span class="purple"><i class="ph ph-stethoscope"></i></span><div><small>Especialidades</small><strong>{{ specialtyCount }}</strong></div></article>
    </section>

    <section class="agenda-shell">
      <header>
        <div><small>PROGRAMACIÓN DEL CONSULTORIO</small><h2>{{ selectedOfficeName }}</h2><p>{{ dateRangeLabel }}</p></div>
        <div class="legend"><span><i class="free-dot"></i>Disponible</span><span><i class="busy-dot"></i>Programada</span><span><i class="arrival-dot"></i>Paciente presente</span></div>
      </header>
      <div v-if="loading" class="loading-state"><span class="spinner-border text-primary"></span><p>Consultando programación…</p></div>
      <div v-else-if="!searched" class="empty-state"><i class="ph ph-calendar-blank"></i><h3>Seleccione un consultorio y período</h3><p>La disponibilidad y las citas se organizarán por día.</p></div>
      <div v-else-if="!days.length" class="empty-state"><i class="ph ph-calendar-x"></i><h3>Sin programación</h3><p>No existen turnos configurados dentro del período.</p></div>
      <div v-else class="agenda-board">
        <aside class="day-list">
          <button v-for="day in days" :key="day.date" :class="{ active: selectedDate === day.date }" @click="selectedDate = day.date">
            <span>{{ weekday(day.date) }}</span><strong>{{ dayNumber(day.date) }}</strong><small>{{ day.free }} libres · {{ day.busy }} citas</small>
          </button>
        </aside>
        <section class="turn-panel">
          <header><div><small>JORNADA</small><h3>{{ fullDate(selectedDate) }}</h3></div><span>{{ currentTurns.length }} turnos</span></header>
          <div v-if="!currentTurns.length" class="empty-turns">No hay turnos para este día.</div>
          <div v-else class="turn-list">
            <article v-for="(turn, index) in currentTurns" :key="turnId(turn) || index" :class="{ occupied: isOccupied(turn), arrived: turn.hora_llegada }">
              <time><strong>{{ time(turn.fecha_inicio) }}</strong><small>{{ time(turn.fecha_fin) }}</small></time>
              <span class="turn-icon"><i :class="isOccupied(turn) ? 'ph ph-user' : 'ph ph-clock'"></i></span>
              <div class="turn-copy">
                <small>{{ turn.especialidad || specialtyName(turn.id_especialidad) }}</small>
                <strong>{{ isOccupied(turn) ? turn.paciente || 'Paciente programado' : 'Espacio disponible' }}</strong>
                <p>{{ turn.profesional || 'Profesional por definir' }}<template v-if="turn.hora_llegada"> · Llegó {{ time(turn.hora_llegada) }}</template></p>
              </div>
              <button class="btn btn-sm" :class="isOccupied(turn) ? 'btn-outline-primary' : 'btn-primary'" @click="openTurn(turn)">
                {{ isOccupied(turn) ? 'Gestionar' : 'Agendar' }} <i class="ph ph-arrow-right ms-1"></i>
              </button>
            </article>
          </div>
        </section>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="modal" class="appointment-layer" @mousedown.self="closeModal">
        <section class="appointment-modal" role="dialog" aria-modal="true">
          <header><div><small>{{ modal === 'book' ? 'NUEVA CITA' : 'GESTIÓN DE CITA' }}</small><h3>{{ modalTitle }}</h3><p>{{ selectedTurn && formatDateTime(selectedTurn.fecha_inicio) }}</p></div><button class="btn-close" :disabled="saving" @click="closeModal"></button></header>

          <form v-if="modal === 'book'" @submit.prevent="book">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
              <div v-if="requestId" class="alert alert-info d-flex gap-2"><i class="ph ph-inbox fs-5"></i><span><strong class="d-block">Asignando solicitud #{{ requestId }}</strong><small>Seleccione el horario y consultorio para confirmar la cita.</small></span></div>
              <div class="row g-3 mb-3">
                <div class="col-md-6"><label class="form-label">Fecha de la cita *</label><input v-model="booking.date" type="date" :min="today" class="form-control" required></div>
                <div class="col-md-6"><label class="form-label">Hora de la cita *</label><input v-model="booking.time" type="time" class="form-control" required></div>
                <div class="col-12"><label class="form-label">Consultorio *</label><select v-model="booking.officeId" class="form-select" required><option value="">Seleccione</option><option v-for="item in offices" :key="id(item)" :value="id(item)">{{ name(item) }}</option></select></div>
              </div>
              <label v-if="!requestId" class="form-label">Identificación del paciente *</label>
              <div v-if="!requestId" class="input-group"><input v-model.trim="booking.dni" class="form-control" required placeholder="Número de identificación"><button type="button" class="btn btn-outline-primary" :disabled="searchingPatient || !booking.dni" @click="findPatient"><span v-if="searchingPatient" class="spinner-border spinner-border-sm"></span><i v-else class="ph ph-magnifying-glass"></i></button></div>
              <div v-if="patient" class="patient-summary"><span>{{ initials(patientName) }}</span><div><small>PACIENTE IDENTIFICADO</small><strong>{{ patientName }}</strong><p>{{ patient.identificacion }} · Paciente #{{ booking.patientId }}</p></div><i class="ph ph-check-circle"></i></div>
              <div class="row g-3 mt-0">
                <div class="col-md-6"><label class="form-label">Especialidad *</label><select v-model="booking.specialtyId" class="form-select" required @change="loadProfessionals"><option value="">Seleccione</option><option v-for="item in specialties" :key="id(item)" :value="id(item)">{{ name(item) }}</option></select></div>
                <div class="col-md-6"><label class="form-label">Profesional *</label><select v-model="booking.professionalId" class="form-select" required :disabled="loadingProfessionals" @change="loadActivities"><option value="">{{ loadingProfessionals ? 'Consultando…' : 'Seleccione' }}</option><option v-for="item in professionals" :key="id(item)" :value="id(item)">{{ name(item) }}</option></select></div>
                <div class="col-12"><label class="form-label">Actividad / orden de servicio *</label><select v-model="booking.activityId" class="form-select" required :disabled="loadingActivities || !booking.patientId"><option value="">{{ loadingActivities ? 'Consultando actividades…' : 'Seleccione una actividad' }}</option><option v-for="item in activities" :key="activityId(item)" :value="activityId(item)">{{ activityName(item) }}</option></select><small v-if="patient && !loadingActivities && !activities.length" class="text-warning">El paciente no tiene actividades disponibles para esta especialidad y profesional.</small></div>
                <div class="col-12"><label class="form-label">Anotación</label><textarea v-model.trim="booking.annotation" class="form-control" rows="2" maxlength="255" placeholder="Información útil para la programación"></textarea></div>
              </div>
            </div>
            <footer><button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancelar</button><button class="btn btn-primary" :disabled="saving || !canBook"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Confirmar cita</button></footer>
          </form>

          <template v-else>
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
              <section class="appointment-patient"><span>{{ initials(selectedTurn.paciente) }}</span><div><small>PACIENTE</small><h4>{{ selectedTurn.paciente }}</h4><p>{{ selectedTurn.profesional }} · {{ selectedTurn.especialidad || specialtyName(selectedTurn.id_especialidad) }}</p></div><em>{{ appointmentStatus(selectedTurn) }}</em></section>
              <div class="appointment-data"><div><small>Consultorio</small><strong>{{ selectedTurn.consultorio || selectedOfficeName }}</strong></div><div><small>Horario</small><strong>{{ time(selectedTurn.fecha_inicio) }}–{{ time(selectedTurn.fecha_fin) }}</strong></div><div><small>Orden de trabajo</small><strong>#{{ selectedTurn.id_orden_trabajo || '—' }}</strong></div><div><small>Orden de servicio</small><strong>#{{ selectedTurn.id_orden_de_servicio || '—' }}</strong></div></div>
              <label class="form-label mt-3">Observación para la acción</label><textarea v-model.trim="actionObservation" class="form-control" rows="2" maxlength="255"></textarea>
              <div class="appointment-actions">
                <button type="button" @click="router.push(`/consulta-externa/citas/${turnId(selectedTurn)}`)"><i class="ph ph-eye"></i><span><strong>Detalle e historial</strong><small>Reprogramar, documento y trazabilidad</small></span></button>
                <button type="button" @click="executeAction('call')"><i class="ph ph-megaphone"></i><span><strong>Llamar paciente</strong><small>Enviar turno al consultorio</small></span></button>
                <button type="button" @click="executeAction('arrival')"><i class="ph ph-sign-in"></i><span><strong>Registrar llegada</strong><small>Marcar hora actual</small></span></button>
                <button type="button" @click="executeAction('confirm')"><i class="ph ph-check-circle"></i><span><strong>Confirmar cita</strong><small>Actualizar estado</small></span></button>
                <button type="button" class="danger" @click="executeAction('absent')"><i class="ph ph-user-minus"></i><span><strong>No asistió</strong><small>Marcar inasistencia</small></span></button>
                <button type="button" class="danger" @click="executeAction('cancel')"><i class="ph ph-x-circle"></i><span><strong>Cancelar</strong><small>Requiere observación</small></span></button>
              </div>
            </div>
            <footer><button class="btn btn-outline-secondary" :disabled="saving" @click="closeModal">Cerrar</button></footer>
          </template>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { buscarPacienteExacto } from '@/services/hospitalizacion'
import * as api from '@/services/intramural'

const route=useRoute(),router=useRouter(),offices=ref([]),specialties=ref([]),professionals=ref([]),activities=ref([]),free=ref([]),occupied=ref([])
const loading=ref(false),saving=ref(false),searched=ref(false),error=ref(''),modalError=ref(''),modal=ref(null)
const selectedDate=ref(''),selectedTurn=ref(null),patient=ref(null),searchingPatient=ref(false),loadingProfessionals=ref(false),loadingActivities=ref(false),actionObservation=ref('')
const today=new Date().toISOString().slice(0,10)
const filters=reactive({officeId:'',from:today,to:today})
const requestId=ref(''),booking=reactive({dni:'',patientId:'',specialtyId:'',professionalId:'',activityId:'',officeId:'',date:today,time:'08:00',annotation:''})
const array=value=>{if(Array.isArray(value))return value;for(const key of['data','items','actividades','ordenesdeservicio','libres','ocupados'])if(Array.isArray(value?.[key]))return value[key];return[]}
const id=item=>item?.id??item?.id_consultorio??item?.id_especialidad??item?.id_user
const name=item=>item?.nombre??item?.name??item?.especialidad??item?.consultorio??`Registro #${id(item)}`
const canSearch=computed(()=>filters.officeId&&filters.from&&filters.to&&filters.to>=filters.from)
const selectedOfficeName=computed(()=>{const office=offices.value.find(item=>String(id(item))===String(filters.officeId));return office?name(office):'Agenda intramural'})
const patientName=computed(()=>patient.value?.nombre||patient.value?.nombre_completo||[patient.value?.primer_nombre,patient.value?.primer_apellido].filter(Boolean).join(' ')||'Paciente')
const canBook=computed(()=>booking.officeId&&booking.specialtyId&&booking.professionalId&&booking.activityId&&(requestId.value||booking.patientId))
const modalTitle=computed(()=>modal.value==='book'?'Agendar cita intramural':`Cita #${turnId(selectedTurn.value)||''}`)
const specialtyCount=computed(()=>new Set([...free.value,...occupied.value].map(x=>x.id_especialidad).filter(Boolean)).size)
const arrivedCount=computed(()=>occupied.value.filter(item=>item.hora_llegada).length)
const allDates=computed(()=>[...free.value,...occupied.value].map(item=>date(item.fecha_inicio||item.fecha)).filter(Boolean))
const days=computed(()=>[...new Set(allDates.value)].sort().map(value=>({date:value,free:free.value.filter(x=>date(x.fecha_inicio||x.fecha)===value).length,busy:occupied.value.filter(x=>date(x.fecha_inicio)===value).length})))
const currentTurns=computed(()=>[...free.value.filter(x=>date(x.fecha_inicio||x.fecha)===selectedDate.value),...occupied.value.filter(x=>date(x.fecha_inicio)===selectedDate.value)].sort((a,b)=>String(a.fecha_inicio).localeCompare(String(b.fecha_inicio))))
const dateRangeLabel=computed(()=>filters.from===filters.to?fullDate(filters.from):`${fullDate(filters.from)} – ${fullDate(filters.to)}`)
const date=value=>String(value||'').slice(0,10)
const time=value=>{const text=String(value||'');return text.includes('T')?text.slice(11,16):text.includes(' ')?text.split(' ')[1]?.slice(0,5):text.slice(0,5)}
const turnId=item=>item?.id_cita??item?.id
const isOccupied=item=>Boolean(turnId(item)||item?.paciente)
const specialtyName=value=>name(specialties.value.find(item=>String(id(item))===String(value))||{})||'Especialidad'
const initials=value=>String(value||'P').split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()
const weekday=value=>new Intl.DateTimeFormat('es-CO',{weekday:'short',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`)).replace('.','').toUpperCase()
const dayNumber=value=>String(value||'').slice(8,10)
const fullDate=value=>value?new Intl.DateTimeFormat('es-CO',{dateStyle:'long',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`)):'Sin fecha'
const formatDateTime=value=>value?new Intl.DateTimeFormat('es-CO',{dateStyle:'long',timeStyle:'short'}).format(new Date(String(value).replace(' ','T'))):''
const addMinutes=(value,minutes)=>{const result=new Date(String(value).replace(' ','T'));result.setMinutes(result.getMinutes()+minutes);return result.toISOString().slice(0,19).replace('T',' ')}
const activityId=item=>item?.id_actividad??item?.id_orden_de_servicio??item?.id
const activityName=item=>item?.actividad??item?.servicio??item?.nombre??item?.name??([item?.tag,item?.paquete].filter(Boolean).join(' · ')||`Actividad #${activityId(item)}`)
const appointmentStatus=item=>item?.estado||item?.status_name||({1:'Activa',2:'Atendida',3:'Solicitada',4:'Cancelada',5:'No disponible',6:'No atendida'}[Number(item?.status)]||'Programada')

async function load(){
 if(!canSearch.value)return
 loading.value=true;error.value=''
 try{const response=await api.consultarAgendaConsultorio(filters.officeId,{desde:filters.from,hasta:filters.to});const data=response?.data||response;free.value=array(data?.libres).map(item=>({...item,fecha_inicio:item.fecha_inicio||item.fecha,fecha_fin:item.fecha_fin||addMinutes(item.fecha_inicio||item.fecha,20)}));occupied.value=array(data?.ocupados);searched.value=true;selectedDate.value=days.value[0]?.date||''}
 catch(reason){free.value=[];occupied.value=[];error.value=obtenerMensajeError(reason)}finally{loading.value=false}
}
function resetBooking(turn={}){const start=turn.fecha_inicio||`${today} 08:00:00`;Object.assign(booking,{dni:'',patientId:'',specialtyId:turn.id_especialidad||'',professionalId:turn.id_profesional||'',activityId:'',officeId:turn.id_consultorio||filters.officeId||'',date:date(start)||today,time:time(start)||'08:00',annotation:''});patient.value=null;professionals.value=[];activities.value=[];modalError.value=''}
function openTurn(turn){selectedTurn.value=turn;modalError.value='';actionObservation.value='';if(isOccupied(turn)){modal.value='detail';return}resetBooking(turn);modal.value='book';if(booking.specialtyId)loadProfessionals()}
function openNewAppointment(){selectedTurn.value={fecha_inicio:`${today} 08:00:00`,id_consultorio:filters.officeId||''};resetBooking(selectedTurn.value);modal.value='book'}
function closeModal(){if(!saving.value)modal.value=null}
async function findPatient(){searchingPatient.value=true;modalError.value='';try{const response=await buscarPacienteExacto(booking.dni);patient.value=response?.data||response;booking.patientId=patient.value?.paciente_id||patient.value?.id;await loadActivities()}catch(reason){patient.value=null;booking.patientId='';modalError.value=obtenerMensajeError(reason)}finally{searchingPatient.value=false}}
async function loadProfessionals(){booking.professionalId='';booking.activityId='';professionals.value=[];activities.value=[];if(!booking.specialtyId)return;loadingProfessionals.value=true;try{professionals.value=array(await api.listarProfesionalesEspecialidad(booking.specialtyId))}catch(reason){modalError.value=obtenerMensajeError(reason)}finally{loadingProfessionals.value=false}}
async function loadActivities(){booking.activityId='';activities.value=[];if(!booking.specialtyId||!booking.professionalId||!booking.patientId)return;loadingActivities.value=true;try{const response=await api.consultarActividadesPaciente(booking.specialtyId,booking.professionalId,booking.patientId);const data=response?.data||response;activities.value=array(data?.actividades||data?.ordenesdeservicio||data)}catch(reason){modalError.value=obtenerMensajeError(reason)}finally{loadingActivities.value=false}}
async function book(){saving.value=true;modalError.value='';try{const available=array(await api.consultarConsultoriosDisponibles(`${booking.date} ${booking.time}:00`));if(available.length&&!available.some(item=>String(id(item))===String(booking.officeId)))throw new Error('El consultorio seleccionado ya no está disponible en ese horario. Seleccione otro consultorio.');const payload={fecha_inicio:`${booking.date} ${booking.time}:00`,id_paciente:Number(booking.patientId),id_user:Number(booking.professionalId),id_profesional:Number(booking.professionalId),id_especialidad:Number(booking.specialtyId),id_consultorio:Number(booking.officeId),id_actividad:Number(booking.activityId),anotacion:booking.annotation};if(requestId.value)await api.asignarSolicitudCita(requestId.value,payload);else await api.agendarCita(payload);modal.value=null;requestId.value='';await router.replace({path:route.path});filters.officeId=booking.officeId;await load()}catch(reason){modalError.value=obtenerMensajeError(reason)}finally{saving.value=false}}
async function executeAction(type){if(type==='cancel'&&!actionObservation.value){modalError.value='Escriba el motivo de la cancelación.';return}saving.value=true;modalError.value='';try{const citaId=turnId(selectedTurn.value);if(type==='call')await api.llamarPaciente(citaId);if(type==='arrival')await api.registrarHoraLlegada(citaId,new Date().toTimeString().slice(0,8));if(type==='confirm')await api.cambiarEstadoCita({id_cita:Number(citaId),observacion:actionObservation.value,status:1});if(type==='absent')await api.marcarNoAtendida(citaId);if(type==='cancel')await api.cancelarCita({id_cita:Number(citaId),observacion:actionObservation.value});modal.value=null;await load()}catch(reason){modalError.value=obtenerMensajeError(reason)}finally{saving.value=false}}
onMounted(async()=>{const results=await Promise.allSettled([api.listarConsultorios(),api.listarEspecialidades()]);if(results[0].status==='fulfilled')offices.value=array(results[0].value);if(results[1].status==='fulfilled')specialties.value=array(results[1].value);if(route.query.solicitud){requestId.value=String(route.query.solicitud);const start=String(route.query.fecha||`${today} 08:00:00`);selectedTurn.value={fecha_inicio:start,id_especialidad:route.query.especialidad||'',id_profesional:route.query.profesional||''};resetBooking(selectedTurn.value);Object.assign(booking,{patientId:route.query.paciente||'',dni:route.query.identificacion||'',activityId:route.query.actividad||'',professionalId:route.query.profesional||'',specialtyId:route.query.especialidad||''});modal.value='book';if(booking.specialtyId)await loadProfessionals();booking.professionalId=route.query.profesional||booking.professionalId;booking.activityId=route.query.actividad||booking.activityId}})
</script>

<style scoped>
.agenda-hero{display:flex;align-items:center;justify-content:space-between;padding:1.45rem 1.55rem;border-radius:1rem;background:linear-gradient(120deg,#114d78,#118cad);color:#fff;box-shadow:0 14px 34px rgba(15,75,117,.18)}.agenda-hero>div:last-child{display:flex;gap:.5rem}.agenda-hero span,.agenda-shell>header small,.appointment-modal header small{font-size:.7rem;font-weight:800;letter-spacing:.08em}.agenda-hero h1{margin:.2rem 0;font-size:1.65rem}.agenda-hero p{margin:0;opacity:.82}.agenda-filters{display:grid;grid-template-columns:1.4fr 1fr 1fr auto;align-items:end;gap:.7rem;margin-top:1rem;padding:.9rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}.agenda-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;margin-top:1rem}.agenda-metrics article{display:flex;align-items:center;gap:.65rem;padding:.85rem;border:1px solid #dfe7ed;border-radius:.8rem;background:#fff}.agenda-metrics article>span{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;font-size:1.05rem}.agenda-metrics small,.agenda-metrics strong{display:block}.agenda-metrics small{color:#7b8a98;font-size:.68rem}.agenda-metrics strong{font-size:1.2rem}.blue{background:#e7f3fb;color:#267fac}.green{background:#e6f7ee;color:#25815c}.amber{background:#fff2dc;color:#b8731c}.purple{background:#efedfb;color:#6d61cc}.agenda-shell{overflow:hidden;margin-top:1rem;border:1px solid #dfe7ed;border-radius:1rem;background:#fff;box-shadow:0 8px 25px rgba(28,65,93,.05)}.agenda-shell>header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.15rem;border-bottom:1px solid #e4eaee;background:#fbfcfd}.agenda-shell h2{margin:.1rem 0;font-size:1.05rem}.agenda-shell header p{margin:0;color:#778795}.legend{display:flex;gap:.8rem;font-size:.68rem}.legend span{display:flex;align-items:center;gap:.3rem}.legend i{width:8px;height:8px;border-radius:50%}.free-dot{background:#34a972}.busy-dot{background:#3283ae}.arrival-dot{background:#d28a27}.loading-state,.empty-state{display:grid;place-items:center;padding:4rem;text-align:center;color:#758594}.loading-state p,.empty-state p{margin:.5rem 0}.empty-state>i{font-size:2.7rem;color:#a4bdca}.empty-state h3{margin:.5rem 0 0;font-size:1rem}.agenda-board{display:grid;grid-template-columns:180px 1fr;min-height:520px}.day-list{display:flex;flex-direction:column;gap:.35rem;padding:.7rem;border-right:1px solid #e3e9ed;background:#f8fafb}.day-list button{display:grid;grid-template-columns:38px 1fr;align-items:center;padding:.6rem;border:1px solid transparent;border-radius:.65rem;background:transparent;color:#607284;text-align:left}.day-list button.active{border-color:#acd4e8;background:#fff;color:#1e749f;box-shadow:0 4px 12px rgba(31,97,135,.08)}.day-list button>span{grid-row:1/3;font-size:.65rem;font-weight:800}.day-list strong{font-size:1rem}.day-list small{font-size:.62rem}.turn-panel>header{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1rem;border-bottom:1px solid #e7ecef}.turn-panel h3{margin:.1rem 0;font-size:.9rem}.turn-panel header>span{padding:.3rem .55rem;border-radius:20px;background:#edf5fa;color:#287ca8;font-size:.67rem}.turn-list{display:grid;gap:.45rem;padding:.75rem}.turn-list article{display:flex;align-items:center;gap:.7rem;padding:.7rem;border:1px solid #d9e8e1;border-left:4px solid #35a971;border-radius:.7rem;background:#fbfefc}.turn-list article.occupied{border-color:#dce7ed;border-left-color:#3284ae;background:#fff}.turn-list article.arrived{border-left-color:#d18a28;background:#fffaf1}.turn-list time{min-width:48px;text-align:center}.turn-list time strong,.turn-list time small{display:block}.turn-list time strong{font-size:.78rem}.turn-list time small{color:#82909d;font-size:.65rem}.turn-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#e8f7ef;color:#27815d}.occupied .turn-icon{background:#e9f4fa;color:#287ba6}.turn-copy{min-width:0;flex:1}.turn-copy small,.turn-copy strong,.turn-copy p{display:block;margin:0}.turn-copy small{color:#287fa9;font-size:.66rem;font-weight:800}.turn-copy strong{font-size:.79rem}.turn-copy p{color:#788795;font-size:.68rem}.empty-turns{text-align:center;padding:3rem;color:#7a8997}.appointment-layer{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:1rem;background:#071522bd;backdrop-filter:blur(5px)}.appointment-modal{width:min(690px,100%);max-height:94vh;overflow:auto;border-radius:1rem;background:#fff;box-shadow:0 28px 80px #0005}.appointment-modal>header{display:flex;justify-content:space-between;padding:1rem 1.2rem;border-bottom:1px solid #e3e9ed;background:linear-gradient(120deg,#f2f9fd,#fff)}.appointment-modal h3{margin:.1rem 0;font-size:1.05rem}.appointment-modal header p{margin:0;color:#778795;font-size:.72rem}.appointment-modal .modal-body{padding:1.2rem}.appointment-modal footer{display:flex;justify-content:flex-end;gap:.55rem;padding:1rem 1.2rem;border-top:1px solid #e3e9ed}.patient-summary,.appointment-patient{display:flex;align-items:center;gap:.7rem;margin-top:.75rem;padding:.75rem;border:1px solid #bcddec;border-radius:.7rem;background:#f3fafd}.patient-summary>span,.appointment-patient>span{display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:#237fa9;color:#fff;font-size:.72rem;font-weight:800}.patient-summary>div,.appointment-patient>div{flex:1}.patient-summary small,.patient-summary strong,.patient-summary p,.appointment-patient small,.appointment-patient h4,.appointment-patient p{display:block;margin:0}.patient-summary small,.appointment-patient small{color:#25815d;font-size:.65rem;font-weight:800}.patient-summary p,.appointment-patient p{color:#758594;font-size:.7rem}.patient-summary>i{color:#27845e;font-size:1.2rem}.appointment-patient em{padding:.3rem .55rem;border-radius:20px;background:#e7f3fa;color:#267ca7;font-size:.67rem;font-style:normal}.appointment-data{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem;margin-top:.75rem}.appointment-data div{padding:.65rem;border:1px solid #e2e8ec;border-radius:.6rem}.appointment-data small,.appointment-data strong{display:block}.appointment-data small{color:#7b8997;font-size:.65rem}.appointment-data strong{font-size:.75rem}.appointment-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;margin-top:.8rem}.appointment-actions button{display:flex;align-items:center;gap:.6rem;padding:.7rem;border:1px solid #dce6eb;border-radius:.65rem;background:#fff;color:#40566a;text-align:left}.appointment-actions button>i{color:#287fa9;font-size:1.15rem}.appointment-actions button span{flex:1}.appointment-actions strong,.appointment-actions small{display:block}.appointment-actions strong{font-size:.73rem}.appointment-actions small{color:#82909d;font-size:.63rem}.appointment-actions button.danger>i{color:#bd5454}@media(max-width:800px){.agenda-filters,.agenda-metrics{grid-template-columns:repeat(2,1fr)}.agenda-board{grid-template-columns:1fr}.day-list{flex-direction:row;overflow:auto;border-right:0;border-bottom:1px solid #e3e9ed}.day-list button{min-width:145px}.agenda-hero,.agenda-shell>header{align-items:flex-start;flex-direction:column;gap:1rem}}@media(max-width:550px){.agenda-filters,.agenda-metrics,.appointment-data,.appointment-actions{grid-template-columns:1fr}.turn-list article{align-items:flex-start;flex-wrap:wrap}.turn-copy{min-width:calc(100% - 115px)}}
</style>
