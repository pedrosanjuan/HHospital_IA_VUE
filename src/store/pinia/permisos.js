// Permisos del usuario en sesión, para OCULTAR en pantalla las acciones que no puede hacer.
//
// Es solo una ayuda visual: quien decide es el backend, que responde 403 si falta el permiso.
// Uso en un componente:
//   const { puede } = usePermisos()
//   <button v-if="puede('hospitalizacion.egreso.registrar')">Egresar</button>
import { defineStore, storeToRefs } from 'pinia'
import { apiRequest } from '@/services/api'

const CLAVE = 'permissions' // la guarda SignIn.vue al iniciar sesión

// El login antiguo guardaba objetos { name, … }; el actual guarda solo los códigos.
function leerGuardados() {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE) || '[]')
    return guardados.map(item => (typeof item === 'string' ? item : item?.name)).filter(Boolean)
  } catch {
    return []
  }
}

export const usePermisosStore = defineStore('permisos', {
  state: () => ({ codigos: leerGuardados(), refrescado: false }),
  getters: {
    conjunto: state => new Set(state.codigos),
  },
  actions: {
    /** Vuelve a pedir los permisos al backend (p. ej. si cambiaron los roles del usuario). */
    async refrescar() {
      try {
        const respuesta = await apiRequest('/v1/myprofile/permisos')
        this.codigos = Array.isArray(respuesta?.data) ? respuesta.data : []
        localStorage.setItem(CLAVE, JSON.stringify(this.codigos))
      } catch {
        // Sin conexión o sesión vencida: se conservan los permisos guardados.
      } finally {
        this.refrescado = true
      }
    },
    /** true si el usuario tiene AL MENOS UNO de los permisos indicados. */
    puede(...codigos) {
      return codigos.flat().some(codigo => this.conjunto.has(codigo))
    },
  },
})

/** Atajo para las plantillas: const { puede } = usePermisos() */
export function usePermisos() {
  const store = usePermisosStore()
  const { codigos } = storeToRefs(store)
  return { puede: (...codigos) => store.puede(...codigos), codigos, refrescar: store.refrescar }
}
