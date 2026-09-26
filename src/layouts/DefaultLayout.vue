<template>
  <div class="wrapper">
    <Sidebar></Sidebar>
    <main class="main-content content-page ">
      <div class="position-relative ">
        <Header />
      </div>
      <div :class="`content-inner ${pageLayout} pb-0`" id="page_layout">
        <router-view></router-view>
      </div>
      <Footer appName="Sofingtech" />
    </main>
    <context-help></context-help>
    <setting-offcanvas></setting-offcanvas>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import Sidebar from "@/components/partials/Sidebar.vue";
import Footer from "@/components/partials/Footer.vue";
import Header from "@/components/partials/Header.vue";
import SettingOffcanvas from '@/components/setting/SettingOffcanvas.vue';
import ContextHelp from '@/components/help/ContextHelp.vue';

// Pinia Store
import { useSetting } from '@/store/pinia';
import { usePermisosStore } from '@/store/pinia/permisos';

const store = useSetting();

// Al abrir la aplicación se refrescan los permisos del usuario: si le cambiaron los roles,
// las acciones visibles se actualizan sin cerrar sesión.
const permisos = usePermisosStore();
onMounted(() => permisos.refrescar());
const pageLayout = computed(() => store.page_layout_value);

</script>
