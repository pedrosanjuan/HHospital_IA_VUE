// Lista blanca local: nunca se ejecutan componentes ni endpoints enviados por
// la API. Cada tipo se habilita solamente después de confirmar su contrato.
export const clinicalFormRegistry = {
  registroclinico_visita_enfermeria: {
    component: () => import('@/views/clinical/VisitaEnfermeriaForm.vue'),
    endpoint: '/v1/RegistroClinico/registroclinico_visita_enfermeria',
    icon: 'ph ph-nurse', color: 'nursing',
  },
  registroclinico_valoracion_medica: {
    component: () => import('@/views/clinical/ValoracionMedicaForm.vue'),
    endpoint: '/v1/RegistroClinico/registroclinico_valoracion_medica',
    icon: 'ph ph-stethoscope', color: 'medical',
  },
}

export const resolveClinicalForm = tableName => clinicalFormRegistry[String(tableName || '').toLowerCase()] || null
