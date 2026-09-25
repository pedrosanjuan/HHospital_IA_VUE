<template>
  <template v-if="manual">
    <button class="context-help-button" type="button" aria-label="Abrir manual de esta pantalla" title="Manual de esta pantalla" @click="show = true">
      <i class="ph ph-question"></i>
      <span>Ayuda</span>
    </button>

    <Teleport to="body">
      <Transition name="help-fade">
        <div v-if="show" class="context-help-backdrop" @mousedown.self="show = false"></div>
      </Transition>
      <Transition name="help-slide">
        <aside v-if="show" class="context-help-panel" role="dialog" aria-modal="true" :aria-label="`Manual de ${manual.titulo}`">
          <header>
            <div class="help-heading-icon"><i class="ph ph-question"></i></div>
            <div><small>MANUAL DE PANTALLA</small><h2>{{ manual.titulo }}</h2></div>
            <button type="button" class="btn-close" aria-label="Cerrar manual" @click="show = false"></button>
          </header>

          <div class="context-help-body">
            <section class="help-intro"><i class="ph ph-info"></i><p>{{ manual.proposito }}</p></section>

            <details open>
              <summary><span><i class="ph ph-list-checks"></i>¿Qué puede hacer?</span><i class="ph ph-caret-down"></i></summary>
              <ul><li v-for="option in manual.acciones" :key="option">{{ option }}</li></ul>
            </details>

            <details open>
              <summary><span><i class="ph ph-footprints"></i>Uso recomendado</span><i class="ph ph-caret-down"></i></summary>
              <ol><li v-for="step in manual.pasos" :key="step">{{ step }}</li></ol>
            </details>

            <details v-if="manual.notas?.length">
              <summary><span><i class="ph ph-warning-circle"></i>Tenga en cuenta</span><i class="ph ph-caret-down"></i></summary>
              <ul><li v-for="note in manual.notas" :key="note">{{ note }}</li></ul>
            </details>

            <section class="help-route"><small>RUTA ACTUAL</small><code>{{ route.path }}</code></section>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </template>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { buscarManual } from '@/help/manuales'

const route = useRoute()
const show = ref(false)
// Los textos de cada pantalla viven en src/help/manuales/<modulo>.js.
const manual = computed(() => buscarManual(route.path))
watch(() => route.fullPath, () => { show.value = false })
</script>

<style scoped>
.context-help-button{position:fixed;right:0;top:calc(50% - 58px);z-index:1001;display:flex;align-items:center;gap:.35rem;padding:.58rem .65rem;border:0;border-radius:.65rem 0 0 .65rem;background:linear-gradient(135deg,#12638f,#1599b8);color:#fff;box-shadow:0 8px 22px #0c52734d}.context-help-button i{font-size:1.15rem;font-weight:800}.context-help-button span{overflow:hidden;max-width:0;opacity:0;font-size:.72rem;font-weight:700;transition:.2s}.context-help-button:hover span,.context-help-button:focus-visible span{max-width:55px;opacity:1}.context-help-backdrop{position:fixed;inset:0;z-index:2190;background:#06172473;backdrop-filter:blur(2px)}.context-help-panel{position:fixed;z-index:2200;top:0;right:0;width:min(430px,100%);height:100vh;overflow:auto;background:#f7fafc;box-shadow:-18px 0 55px #07192842}.context-help-panel>header{position:sticky;z-index:2;top:0;display:flex;align-items:center;gap:.7rem;padding:1rem 1.1rem;border-bottom:1px solid #dce7ed;background:linear-gradient(125deg,#104f79,#148eac);color:#fff}.help-heading-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#ffffff24;font-size:1.3rem}.context-help-panel header>div:nth-child(2){min-width:0;flex:1}.context-help-panel header small,.context-help-panel header h2{display:block;margin:0}.context-help-panel header small{font-size:.64rem;font-weight:800;letter-spacing:.09em;opacity:.75}.context-help-panel header h2{font-size:1.08rem}.context-help-panel .btn-close{filter:invert(1)}.context-help-body{display:grid;gap:.8rem;padding:1rem}.help-intro{display:flex;gap:.65rem;padding:.85rem;border:1px solid #bedcea;border-radius:.75rem;background:#edf8fc;color:#335f75}.help-intro i{font-size:1.25rem}.help-intro p{margin:0;font-size:.78rem;line-height:1.55}.context-help-body details{overflow:hidden;border:1px solid #dce6ec;border-radius:.75rem;background:#fff}.context-help-body summary{display:flex;align-items:center;justify-content:space-between;padding:.8rem .9rem;cursor:pointer;color:#294d63;font-size:.8rem;font-weight:800;list-style:none}.context-help-body summary span{display:flex;align-items:center;gap:.45rem}.context-help-body summary span i{color:#1686aa;font-size:1.05rem}.context-help-body details[open] summary>i{transform:rotate(180deg)}.context-help-body ul,.context-help-body ol{display:grid;gap:.55rem;margin:0;padding:.1rem 1rem .9rem 2rem;color:#5f7180;font-size:.76rem;line-height:1.45}.help-route{padding:.75rem;border-radius:.65rem;background:#e9eef2}.help-route small,.help-route code{display:block}.help-route small{color:#7a8a97;font-size:.61rem;font-weight:800}.help-route code{margin-top:.2rem;color:#286f91;font-size:.7rem;overflow-wrap:anywhere}.help-slide-enter-active,.help-slide-leave-active,.help-fade-enter-active,.help-fade-leave-active{transition:.24s ease}.help-slide-enter-from,.help-slide-leave-to{transform:translateX(100%)}.help-fade-enter-from,.help-fade-leave-to{opacity:0}@media(max-width:575px){.context-help-button span{display:none}.context-help-panel{width:100%}}
</style>
