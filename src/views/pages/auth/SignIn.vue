<template>
  <section class="sign-in-page custom-auth-height d-md-flex align-items-center">
    <b-container class="sign-in-page-bg my-md-5 mb-0 p-0"><b-row>
      <b-col md="6" class="text-center z-2 d-none d-md-block"><div class="sign-in-detail text-white h-100 d-flex flex-column justify-content-center px-5"><img src="/assets/images/logo-white.png" class="img-fluid mx-auto mb-4" style="max-width:180px" alt="HHospital IA"><i class="ri-hospital-line display-1 mb-3"></i><h2 class="text-white">Gestión hospitalaria conectada</h2><p>Admisiones, disponibilidad de camas y censo hospitalario desde un solo lugar.</p></div></b-col>
      <b-col md="6" class="position-relative z-2"><div class="sign-in-from d-flex flex-column justify-content-center">
        <p class="text-primary fw-semibold mb-1">HHospital IA</p><h1 class="mb-2">Bienvenido</h1><p class="text-muted">Ingrese sus credenciales institucionales para continuar.</p>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <form class="mt-3" @submit.prevent="submitLogin">
          <div class="form-group mb-3"><label for="email" class="form-label">Correo electrónico</label><input id="email" v-model.trim="form.email" type="email" class="form-control" autocomplete="username" placeholder="usuario@hospital.com" required></div>
          <div class="form-group mb-3"><div class="d-flex justify-content-between"><label for="password" class="form-label">Contraseña</label><router-link to="/auth/recover-password">¿Olvidó su contraseña?</router-link></div><div class="input-group"><input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control" autocomplete="current-password" required><button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword"><i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i></button></div></div>
          <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="loading"><span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>Iniciar sesión</button>
        </form><small class="text-muted text-center mt-4"><i class="ri-lock-line me-1"></i>Conexión protegida mediante autenticación Bearer.</small>
      </div></b-col>
    </b-row></b-container>
  </section>
</template>

<script setup>
import { usePermisosStore } from '@/store/pinia/permisos'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerMensajeError } from '@/services/api'
import { login } from '@/services/hospitalizacion'
import { useNavigationStore } from '@/store/pinia/navigation'
const router = useRouter(), route = useRoute(), loading = ref(false), showPassword = ref(false), errorMessage = ref('')
const navigation = useNavigationStore()
const form = reactive({ email: '', password: '' })

/** Persiste únicamente los datos necesarios para autenticar las siguientes solicitudes. */
async function submitLogin() {
  loading.value = true; errorMessage.value = ''
  try {
    const response = await login(form)
    let previousUserId = null
    try { previousUserId = JSON.parse(localStorage.getItem('user_info') || '{}').id } catch { /* No hay sesión reutilizable. */ }
    navigation.clearMenus()
    if (previousUserId !== null && previousUserId !== undefined) localStorage.removeItem(`hhospital:navigation:${previousUserId}`)
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('user_info', JSON.stringify(response.user_info || {}))
    localStorage.setItem('permissions', JSON.stringify(response.permisos || []))
    // El store de permisos puede venir de una sesión anterior en esta misma pestaña.
    usePermisosStore().codigos = (response.permisos || []).map(item => typeof item === 'string' ? item : item?.name).filter(Boolean)
    // Un fallo del menú no invalida un login correcto; el sidebar ofrecerá reintentar.
    try { await navigation.loadMenu('principal', response.user_info?.id) } catch { /* Estado visible en el sidebar. */ }
    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/hospitalizacion/censo')
  } catch (error) { errorMessage.value = obtenerMensajeError(error) } finally { loading.value = false }
}
</script>
