<template>
  <main class="hh-page station-reservations">
    <router-link :to="`/hospitalizacion/estaciones/${stationId}`" class="hh-back-link d-inline-flex align-items-center mb-3"><i class="ph ph-arrow-left me-1"></i>Volver a la estación</router-link>
    <section class="hh-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><span class="hh-eyebrow">Bandeja de enfermería</span><h1 class="mb-1">Reservas pendientes</h1><p class="mb-0 opacity-75">{{ stationName }} · {{ total }} solicitudes por responder</p></div>
      <div class="text-end"><button class="btn btn-light" :disabled="loading" @click="load"><i class="ph ph-arrows-clockwise me-1"></i>{{ loading ? 'Cargando...' : 'Actualizar' }}</button><small class="d-block mt-1 opacity-75">{{ updatedAt }}</small></div>
    </section>
    <div v-if="notice.text" class="alert" :class="`alert-${notice.type}`">{{ notice.text }}</div>
    <div v-if="error" class="alert alert-danger">{{ error }} <button class="btn btn-sm btn-outline-danger ms-2" @click="load">Reintentar</button></div>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border text-primary"></span><p class="text-muted mt-2">Actualizando solicitudes…</p></div>
    <div v-else-if="!rooms.length && !recoverable.length" class="card card-body text-center py-5 text-muted"><i class="ph ph-check-circle fs-1 text-success"></i><h2 class="h5 mt-2">Bandeja al día</h2><p>No hay reservas pendientes por procesar.</p></div>

    <section v-if="!loading && recoverable.length" class="card mb-4 border-warning">
      <header class="card-header bg-warning-subtle"><h2 class="h5 mb-1">Ingresos pendientes de completar</h2><p class="mb-0 small">Estas reservas quedaron aceptadas sin hospitalización y pueden recuperarse de forma segura.</p></header>
      <div class="card-body"><div class="row g-3"><article v-for="item in recoverable" :key="item.id_reserva || item.id" class="col-xl-6"><div class="reservation-card"><h3 class="h6">{{ item.nombre_paciente || item.paciente_nombre }}</h3><p class="text-muted">{{ item.nombre_cama || item.cama_nombre }} · Orden #{{ item.orden_trabajo_id || item.id_orden_trabajo }}</p><button class="btn btn-warning w-100" @click="openResponse(item,2)"><i class="ph ph-arrows-clockwise me-2"></i>Completar ingreso</button></div></article></div></div>
    </section>

    <template v-if="!loading && rooms.length">
      <section v-for="room in rooms" :key="room.id_sala" class="card mb-4 pending-panel">
        <header class="card-header bg-transparent d-flex justify-content-between"><div><span class="text-primary small fw-semibold">SALA</span><h2 class="h5 mb-0">{{ room.nombre_sala }}</h2></div><span class="badge bg-warning-subtle text-warning align-self-center">{{ room.reservas?.length || 0 }} pendientes</span></header>
        <div class="card-body"><div class="row g-3">
          <article v-for="reservation in sorted(room.reservas || [])" :key="reservation.id_reserva" class="col-xl-6"><div class="reservation-card">
            <div class="d-flex justify-content-between gap-2"><div class="patient-avatar">{{ initials(reservation.nombre_paciente) }}</div><span class="badge bg-warning-subtle text-warning align-self-start">{{ reservation.estado_reserva || 'Pendiente' }}</span></div>
            <h3 class="h5 mt-3 mb-0">{{ reservation.nombre_paciente }}</h3><small class="text-muted">{{ reservation.identificacion_paciente }}</small>
            <div class="reservation-data"><div><i class="ph ph-bed"></i><span><small>Cama solicitada</small><strong>{{ reservation.nombre_cama }}</strong><em>{{ reservation.nombre_habitacion }}</em></span></div><div><i class="ph ph-calendar"></i><span><small>Inicio programado</small><strong>{{ formatDate(reservation.fecha_ocupacion_inicio) }}</strong><em>{{ reservation.periodo }} días · {{ reservation.nombre_tipo_reserva }}</em></span></div><div><i class="ph ph-file-text"></i><span><small>Orden de trabajo</small><strong>#{{ reservation.orden_trabajo_id }}</strong><em>Solicitó: {{ reservation.reserved_by_nombre || reservation.reserved_by || 'No informado' }}</em></span></div></div>
            <div class="d-flex gap-2 mt-3"><button class="btn btn-outline-danger flex-fill" :disabled="busy(reservation)" @click="openResponse(reservation,3)">Rechazar</button><button class="btn btn-primary flex-fill" :disabled="busy(reservation)" @click="openResponse(reservation,2)">Aceptar e ingresar</button></div>
          </div></article>
        </div></div>
      </section>
    </template>

    <div v-if="dialog.open" class="response-backdrop" @mousedown.self="closeDialog"><section class="response-modal" role="dialog" aria-modal="true">
      <div class="modal-body">
        <div class="response-heading"><span class="response-icon" :class="dialog.status===2?'accept':'reject'"><i :class="dialog.status===2?'ph ph-check-circle':'ph ph-x-circle'"></i></span><div><small>CONFIRMACIÓN</small><h2 class="h5 mb-0">{{ dialog.status===2 ? '¿Aceptar e ingresar al paciente?' : '¿Rechazar esta reserva?' }}</h2></div></div>
        <div class="response-summary"><strong>{{ dialog.item?.nombre_paciente || dialog.item?.paciente_nombre }}</strong><span>{{ dialog.item?.identificacion_paciente || dialog.item?.paciente_identificacion }}</span><hr><div class="row g-2"><div class="col-6"><small>Cama</small><strong class="d-block">{{ dialog.item?.nombre_cama || dialog.item?.cama_nombre }}</strong></div><div class="col-6"><small>Ingreso previsto</small><strong class="d-block">{{ formatDate(dialog.item?.fecha_ocupacion_inicio) }}</strong></div></div></div>
        <div v-if="dialog.status===2" class="accept-explanation"><i class="ph ph-info"></i><span><strong>Esta acción ocupa la cama.</strong> El sistema creará la hospitalización, registrará la ubicación y completará la reserva automáticamente.</span></div>
        <div v-if="dialog.status===2 && (dialog.requiresService || dialog.services.length>1)" class="mt-3"><label class="form-label">Servicio de estancia *</label><SearchSelect v-if="dialog.services.length" v-model="dialog.serviceId" :options="dialog.services" placeholder="Seleccione el servicio de estancia"/><input v-else v-model.number="dialog.serviceId" type="number" min="1" class="form-control" placeholder="ID de la orden de servicio"><small class="text-muted">La orden tiene varias estancias; seleccione cuál se utilizará.</small></div>
        <label class="form-label mt-3">{{ dialog.status===3 ? 'Motivo del rechazo *' : 'Observación (opcional)' }}</label><textarea v-model.trim="dialog.observation" class="form-control" maxlength="255" rows="3"></textarea>
        <div v-if="dialog.error" class="alert alert-danger mt-3 mb-0">{{ dialog.error }}</div>
      </div>
      <footer><button class="btn btn-outline-secondary" :disabled="responding" @click="closeDialog">Volver</button><button class="btn px-4" :class="dialog.status===2?'btn-primary':'btn-danger'" :disabled="responding||(dialog.status===3&&!dialog.observation)||(dialog.requiresService&&!dialog.serviceId)" @click="confirmResponse"><span v-if="responding" class="spinner-border spinner-border-sm me-2"></span>{{ responding ? 'Procesando…' : dialog.status===2 ? 'Confirmar ingreso' : 'Confirmar rechazo' }}</button></footer>
    </section></div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import SearchSelect from '@/components/form/SearchSelect.vue'
import { obtenerMensajeError } from '@/services/api'
import { useReservationsStore } from '@/store/pinia/reservas'
const route=useRoute(),store=useReservationsStore(),stationId=route.params.id,loading=ref(true),error=ref(''),responding=ref(false),notice=reactive({text:'',type:'success'}),dialog=reactive({open:false,status:2,item:null,observation:'',serviceId:'',services:[],requiresService:false,error:''});let timer
const rooms=computed(()=>store.pendientesByEstacion[stationId]||[]),accepted=computed(()=>store.aceptadasByEstacion[stationId]||[]),recoverable=computed(()=>accepted.value.filter(item=>!item.id_hospitalizacion&&!item.hospitalizacion_id)),total=computed(()=>store.pendingCount(stationId)),stationName=computed(()=>rooms.value[0]?.nombre_estacion||accepted.value[0]?.nombre_estacion||`Estación #${stationId}`),updatedAt=computed(()=>store.lastUpdatedByEstacion[stationId]?`Actualizado ${new Intl.DateTimeFormat('es-CO',{timeStyle:'short'}).format(store.lastUpdatedByEstacion[stationId])}`:'Sin actualizar')
const formatDate=v=>{if(!v)return'—';const date=new Date(String(v).replace(' ','T'));return Number.isNaN(date.getTime())?v:new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(date)},initials=n=>String(n||'P').split(' ').slice(0,2).map(v=>v[0]).join('').toUpperCase(),sorted=a=>[...a].sort((x,y)=>String(x.fecha_ocupacion_inicio).localeCompare(String(y.fecha_ocupacion_inicio))),busy=r=>Boolean(store.respondingById[r.id_reserva||r.id])
const array=v=>Array.isArray(v)?v:v?[v]:[],sid=i=>i?.id_orden_de_servicio??i?.orden_de_servicio_id??i?.id
function servicesFrom(source){const values=source?.ordenes_de_servicio||source?.servicios_estancia||source?.estancias||source?.data?.ordenes_de_servicio||source?.data?.servicios_estancia||source?.data?.estancias||[];return array(values).map(i=>({...i,id:sid(i),nombre:i.nombre_servicio||i.servicio?.nombre||i.nombre||`Servicio de estancia #${sid(i)}`})).filter(i=>i.id)}
async function load(){if(document.hidden)return;loading.value=true;error.value='';try{await store.loadStation(stationId)}catch(e){error.value=obtenerMensajeError(e)}finally{loading.value=false}}
function openResponse(item,status){const services=servicesFrom(item);Object.assign(dialog,{open:true,item,status,observation:'',serviceId:services.length===1?services[0].id:'',services,requiresService:services.length>1,error:''})}
function closeDialog(){if(!responding.value)dialog.open=false}
async function confirmResponse(){if(dialog.requiresService&&!dialog.serviceId)return;responding.value=true;dialog.error='';try{await store.respond(stationId,dialog.item.id_reserva||dialog.item.id,dialog.status,dialog.observation,dialog.serviceId);dialog.open=false;notice.type='success';notice.text=dialog.status===2?'Reserva aceptada; paciente ingresado y cama ocupada correctamente.':'Reserva rechazada correctamente.'}catch(e){if(e?.status===422&&dialog.status===2){const services=servicesFrom(e.payload);if(services.length)dialog.services=services;dialog.requiresService=true;dialog.error=services.length?'Seleccione el servicio de estancia para completar el ingreso.':obtenerMensajeError(e)}else dialog.error=obtenerMensajeError(e)}finally{responding.value=false}}
function visibility(){if(!document.hidden)load()}onMounted(async()=>{await load();timer=setInterval(load,45000);document.addEventListener('visibilitychange',visibility)});onBeforeUnmount(()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility)})
</script>

<style scoped>
.reservation-card{height:100%;padding:1.2rem;border:1px solid #e2eaf2;border-radius:1rem;background:#fff}.pending-panel{border-top:3px solid var(--bs-warning)}.patient-avatar{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#176cad,#2ea4db);color:#fff;font-weight:800}.reservation-data{display:grid;gap:.7rem;margin-top:1rem}.reservation-data>div{display:flex;gap:.7rem;padding:.65rem;background:#f7f9fc;border-radius:.7rem}.reservation-data i{color:var(--bs-primary);font-size:1.2rem}.reservation-data small,.reservation-data strong,.reservation-data em{display:block}.reservation-data em{font-size:.75rem;color:#667085;font-style:normal}.response-backdrop{position:fixed;inset:0;z-index:1080;display:grid;place-items:center;padding:1rem;background:rgba(7,21,37,.62);backdrop-filter:blur(5px)}.response-modal{width:min(580px,100%);overflow:hidden;background:#fff;border-radius:1.15rem;box-shadow:0 28px 80px rgba(0,0,0,.28)}.response-modal .modal-body{padding:1.6rem}.response-modal footer{display:flex;justify-content:flex-end;gap:.7rem;padding:1rem 1.6rem;background:#f8fafc;border-top:1px solid #e8edf2}.response-heading{display:flex;align-items:center;gap:.9rem;margin-bottom:1rem}.response-heading small{display:block;color:#718096;font-weight:800}.response-icon{display:grid;place-items:center;width:54px;height:54px;border-radius:15px;font-size:1.65rem}.response-icon.accept{background:#e7f8f0;color:#168458}.response-icon.reject{background:#fff0f1;color:#c93f4c}.response-summary{padding:1rem;border:1px solid #e3eaf1;border-radius:.9rem;background:#fbfcfe}.response-summary>span{display:block;color:#667085}.accept-explanation{display:flex;gap:.65rem;margin-top:1rem;padding:.8rem;border-radius:.75rem;background:#edf8f4;color:#28765a}.accept-explanation>i{font-size:1.15rem;flex:none}@media(max-width:575px){.response-modal footer{flex-direction:column-reverse}.response-modal footer .btn{width:100%}}
</style>
