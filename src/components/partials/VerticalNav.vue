<template>
  <nav aria-label="Navegación principal">
    <ul class="navbar-nav iq-main-menu" id="sidebar-menu">
      <li class="nav-item static-item ms-2"><span class="nav-link static-item disabled text-start"><span class="default-icon">MENÚ PRINCIPAL</span><span class="mini-icon">-</span></span></li>
      <li v-if="loading" class="nav-item px-3 py-4 text-center" aria-live="polite"><span class="spinner-border spinner-border-sm text-primary"></span><span class="d-block mt-2 small text-muted">Cargando menú…</span></li>
      <li v-else-if="error" class="nav-item px-3 py-3"><div class="menu-message text-center"><i class="ri-error-warning-line text-danger"></i><p class="small mb-2">No fue posible cargar el menú de navegación.</p><button class="btn btn-sm btn-outline-primary" @click="retry">Reintentar</button></div></li>
      <li v-else-if="!menu.length" class="nav-item px-3 py-3"><div class="menu-message text-center"><i class="ri-menu-line text-muted"></i><p class="small mb-0">No tiene opciones de navegación disponibles.</p></div></li>

      <li v-for="item in menu" v-else :key="item.id" class="nav-item" :class="{ active: menuIsActive(item) }">
        <a v-if="item.submenus?.length" class="nav-link" href="#" role="button" :aria-expanded="openMenus.has(item.id)" @click.prevent="toggleMenu(item.id)">
          <i :class="iconClass(item.logo)" :title="item.nombre"></i><span class="item-name">{{ item.nombre }}</span><i class="right-icon ri-arrow-right-s-line" :class="{ rotated: openMenus.has(item.id) }"></i>
        </a>
        <router-link v-else-if="validInternalUrl(item.url)" class="nav-link" :to="internalUrl(item.url)" :aria-current="isActive(item.url) ? 'page' : undefined" @click="closeMobileSidebar"><i :class="iconClass(item.logo)"></i><span class="item-name">{{ item.nombre }}</span></router-link>
        <span v-else class="nav-link disabled"><i :class="iconClass(item.logo)"></i><span class="item-name">{{ item.nombre }}</span></span>

        <ul v-if="item.submenus?.length" v-show="openMenus.has(item.id)" class="sub-nav">
          <li v-for="child in item.submenus" :key="child.id" class="sidebar-layout" :class="{ active: isActive(child.url) }">
            <router-link v-if="validInternalUrl(child.url)" class="nav-link" :to="internalUrl(child.url)" :aria-current="isActive(child.url) ? 'page' : undefined" @click="closeMobileSidebar">
              <i :class="iconClass(child.icon)"></i><span class="item-name">{{ child.nombre }}</span>
            </router-link>
            <a v-else-if="validExternalUrl(child.url) && child.behavior === '_blank'" class="nav-link" :href="child.url" target="_blank" rel="noopener noreferrer"><i :class="iconClass(child.icon)"></i><span class="item-name">{{ child.nombre }}</span></a>
            <span v-else class="nav-link disabled" :title="child.url ? 'Ruta no disponible en el frontend' : 'Sin ruta configurada'"><i :class="iconClass(child.icon)"></i><span class="item-name">{{ child.nombre }}</span></span>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationStore } from '@/store/pinia/navigation'

const LOCATION = 'principal'
const route = useRoute(), router = useRouter(), navigation = useNavigationStore()
const openMenus = reactive(new Set())
const menu = computed(() => navigation.getMenu(LOCATION))
const loading = computed(() => navigation.isLoading(LOCATION))
const error = computed(() => navigation.getError(LOCATION))
const aliases = Object.freeze({ users: 'ri-group-line', user: 'ri-user-line', hospital: 'ri-hospital-line', dashboard: 'ri-dashboard-line', home: 'ri-home-line', calendar: 'ri-calendar-line', settings: 'ri-settings-3-line', reports: 'ri-file-chart-line' })

/** Solo admite nombres de Remix Icon; nunca inserta HTML recibido del backend. */
function iconClass(value) { const icon = String(value || '').trim().toLowerCase(); if (/^ri-[a-z0-9-]+$/.test(icon)) return `icon ${icon}`; return `icon ${aliases[icon] || 'ri-menu-line'}` }
function internalUrl(url) { const value = String(url || '').trim(); return value.startsWith('/') ? value : `/${value}` }
function validInternalUrl(url) { if (typeof url !== 'string' || !url.trim() || url.trim().startsWith('//') || /^[a-z]+:/i.test(url.trim())) return false; return router.resolve(internalUrl(url)).matched.length > 0 }
function validExternalUrl(url) { try { const parsed = new URL(url); return parsed.protocol === 'https:' } catch { return false } }
function isActive(url) { const normalized = internalUrl(url); return validInternalUrl(url) && (route.path === normalized || (normalized !== '/' && route.path.startsWith(`${normalized}/`))) }
function menuIsActive(item) { return isActive(item.url) || (item.submenus || []).some(child => isActive(child.url)) }
function toggleMenu(id) { openMenus.has(id) ? openMenus.delete(id) : openMenus.add(id) }
function openActiveParents() { menu.value.forEach(item => { if (menuIsActive(item)) openMenus.add(item.id) }) }
function closeMobileSidebar() { if (window.innerWidth < 1200) document.querySelector('aside.sidebar')?.classList.add('sidebar-mini') }
async function retry() { try { await navigation.refreshMenu(LOCATION); openActiveParents() } catch { /* El store conserva el error para mostrarlo aquí. */ } }
onMounted(async () => { try { await navigation.loadMenu(LOCATION); openActiveParents() } catch { /* El usuario puede reintentar sin un ciclo automático. */ } })
</script>

<style scoped>
.menu-message{padding:1rem;border:1px dashed var(--bs-border-color);border-radius:.75rem;color:var(--bs-secondary-color)}.menu-message i{font-size:1.5rem}.right-icon{margin-left:auto;transition:transform .2s}.right-icon.rotated{transform:rotate(90deg)}.sub-nav{list-style:none}.nav-link.disabled{cursor:not-allowed;opacity:.55}
</style>
