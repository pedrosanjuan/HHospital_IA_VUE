<template>
  <Transition name="global-loader">
    <div v-if="visible" class="global-loading" role="status" aria-live="polite" aria-label="Esperando respuesta del servidor">
      <div class="loading-card">
        <span class="loading-symbol"><i class="ph ph-heartbeat"></i><span></span></span>
        <div><strong>{{ message }}</strong><small>Por favor, espere un momento</small></div>
        <span v-if="requests > 1" class="request-count">{{ requests }}</span>
      </div>
    </div>
  </Transition>
  <Transition name="global-toast">
    <div v-if="successVisible" class="global-success" role="status" aria-live="polite">
      <span><i class="ph ph-check"></i></span>
      <div><strong>Proceso exitoso</strong><small>{{ successMessage }}</small></div>
      <button type="button" class="btn-close" aria-label="Cerrar" @click="successVisible = false"></button>
    </div>
  </Transition>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const requests = ref(0), mutations = ref(0), visible = ref(false), message = ref('Consultando información…')
const successVisible = ref(false), successMessage = ref('Acción realizada correctamente.')
let showTimer = null, hideTimer = null, successTimer = null, shownAt = 0

// Evita mostrar el indicador para respuestas instantáneas y garantiza que,
// una vez visible, permanezca el tiempo suficiente para poder percibirlo.
function handleRequest(event) {
  requests.value = Number(event.detail?.active || 0)
  mutations.value = Number(event.detail?.mutations || 0)
  message.value = mutations.value > 0 ? 'Guardando cambios…' : 'Consultando información…'
  if (requests.value > 0) {
    clearTimeout(hideTimer)
    if (mutations.value > 0) {
      clearTimeout(showTimer); showTimer = null
      visible.value = true; shownAt = Date.now()
      return
    }
    if (!visible.value && !showTimer) {
      showTimer = setTimeout(() => {
        showTimer = null
        if (requests.value > 0) { visible.value = true; shownAt = Date.now() }
      }, 180)
    }
    return
  }

  clearTimeout(showTimer); showTimer = null
  const remaining = Math.max(0, 450 - (Date.now() - shownAt))
  hideTimer = setTimeout(() => { visible.value = false }, remaining)
}

function handleSuccess(event) {
  successMessage.value = event.detail?.message || 'Acción realizada correctamente.'
  successVisible.value = true
  clearTimeout(successTimer)
  successTimer = setTimeout(() => { successVisible.value = false }, 3500)
}

// Se suscribe durante setup para alcanzar también las solicitudes disparadas
// por los hooks mounted de las primeras pantallas.
window.addEventListener('hhospital:request-state', handleRequest)
window.addEventListener('hhospital:request-success', handleSuccess)
onBeforeUnmount(() => {
  window.removeEventListener('hhospital:request-state', handleRequest)
  window.removeEventListener('hhospital:request-success', handleSuccess)
  clearTimeout(showTimer); clearTimeout(hideTimer); clearTimeout(successTimer)
})
</script>

<style scoped>
.global-loading{position:fixed;z-index:2000;inset:0;display:flex;align-items:flex-start;justify-content:center;padding-top:1.2rem;background:rgba(246,249,252,.35);backdrop-filter:blur(1.5px);pointer-events:all}.loading-card{display:flex;align-items:center;gap:.8rem;min-width:270px;padding:.72rem .9rem;border:1px solid rgba(24,112,174,.16);border-radius:.9rem;background:rgba(255,255,255,.97);box-shadow:0 12px 36px rgba(20,53,82,.18)}.loading-symbol{position:relative;display:grid;place-items:center;width:39px;height:39px;border-radius:11px;background:linear-gradient(135deg,#1471b3,#29a5dc);color:#fff;font-size:1.15rem}.loading-symbol>span{position:absolute;inset:-4px;border:2px solid rgba(32,139,204,.22);border-top-color:#218dcb;border-radius:14px;animation:loader-spin .85s linear infinite}.loading-card strong,.loading-card small,.global-success strong,.global-success small{display:block}.loading-card strong{color:#26384a;font-size:.8rem}.loading-card small{color:#8290a0;font-size:.65rem}.request-count{display:grid;place-items:center;margin-left:auto;min-width:22px;height:22px;padding:0 .3rem;border-radius:20px;background:#e8f3fb;color:#1673af;font-size:.62rem;font-weight:800}.global-success{position:fixed;z-index:2300;right:1rem;bottom:1rem;display:flex;align-items:center;gap:.7rem;width:min(380px,calc(100% - 2rem));padding:.8rem .9rem;border:1px solid #b9e4ce;border-radius:.85rem;background:#f2fcf6;color:#285d43;box-shadow:0 14px 38px #163d2b30}.global-success>span{display:grid;place-items:center;width:37px;height:37px;flex:none;border-radius:11px;background:#2b9a68;color:#fff;font-size:1.1rem}.global-success>div{min-width:0;flex:1}.global-success strong{font-size:.78rem}.global-success small{overflow-wrap:anywhere;color:#608070;font-size:.68rem}.global-success .btn-close{font-size:.65rem}.global-loader-enter-active,.global-loader-leave-active,.global-toast-enter-active,.global-toast-leave-active{transition:opacity .18s,transform .18s}.global-loader-enter-from,.global-loader-leave-to{opacity:0;transform:translateY(-6px)}.global-toast-enter-from,.global-toast-leave-to{opacity:0;transform:translateY(12px)}@keyframes loader-spin{to{transform:rotate(360deg)}}@media(max-width:575px){.global-loading{padding:calc(.7rem + env(safe-area-inset-top)) .7rem 0}.loading-card{width:100%;min-width:0}.global-success{right:.7rem;bottom:.7rem;width:calc(100% - 1.4rem)}}@media(prefers-reduced-motion:reduce){.loading-symbol>span{animation:none}.global-loader-enter-active,.global-loader-leave-active,.global-toast-enter-active,.global-toast-leave-active{transition:none}}
</style>
