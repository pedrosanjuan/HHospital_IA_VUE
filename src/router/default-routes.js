export const DefaultRoutes = (prefix) => [
  {
    path: "/facturacion",
    name: prefix + ".facturacion",
    meta: { auth: true, name: "Facturación", billingSection: "dashboard" },
    component: () => import("@/views/pages/facturacion/FacturacionModulo.vue"),
  },
  ...[
    ["cuentas", "accounts", "Cuentas hospitalarias"], ["cargos", "charges", "Libro de cargos"],
    ["auditoria", "audit", "Auditoría de cuentas"], ["facturas", "invoices", "Facturas"],
    ["transmisiones", "transmissions", "Transmisiones FEV/RIPS"], ["radicaciones", "filings", "Radicaciones"],
    ["glosas", "glosses", "Glosas y devoluciones"], ["cartera", "portfolio", "Pagos y cartera"],
    ["parametrizacion", "settings", "Parametrización de facturación"],
  ].map(([path, billingSection, name]) => ({
    path: `/facturacion/${path}`,
    name: `${prefix}.facturacion-${path}`,
    meta: { auth: true, name, billingSection },
    component: () => import("@/views/pages/facturacion/FacturacionModulo.vue"),
  })),
  {
    path: "/facturacion/cuentas/:id",
    name: prefix + ".facturacion-cuenta-detalle",
    meta: { auth: true, name: "Detalle de cuenta hospitalaria" },
    component: () => import("@/views/pages/facturacion/DetalleCuenta.vue"),
  },
  {
    path: "/facturacion/facturas/:id",
    name: prefix + ".facturacion-factura-detalle",
    meta: { auth: true, name: "Detalle de factura", billingRecord: "invoice" },
    component: () => import("@/views/pages/facturacion/DetalleDocumento.vue"),
  },
  {
    path: "/facturacion/glosas/:id",
    name: prefix + ".facturacion-glosa-detalle",
    meta: { auth: true, name: "Detalle de glosa", billingRecord: "gloss" },
    component: () => import("@/views/pages/facturacion/DetalleDocumento.vue"),
  },
  {
    path: "/consulta-externa",
    redirect: "/consulta-externa/agenda",
  },
  {
    path: "/consulta-externa/agenda",
    name: prefix + ".consulta-externa-agenda",
    meta: { auth: true, name: "Agenda de consulta externa" },
    component: () => import("@/views/pages/intramural/AgendaConsultorios.vue"),
  },
  {
    path: "/consulta-externa/citas/nueva",
    redirect: "/consulta-externa/agenda",
  },
  {
    path: "/consulta-externa/citas/:id",
    name: prefix + ".consulta-externa-cita-detalle",
    meta: { auth: true, name: "Detalle de cita" },
    component: () => import("@/views/pages/intramural/DetalleCita.vue"),
  },
  {
    path: "/consulta-externa/solicitudes",
    name: prefix + ".consulta-externa-solicitudes",
    meta: { auth: true, name: "Solicitudes de citas", appointmentMode: "requests" },
    component: () => import("@/views/pages/intramural/ControlCitas.vue"),
  },
  {
    path: "/consulta-externa/no-atendidas",
    name: prefix + ".consulta-externa-no-atendidas",
    meta: { auth: true, name: "Citas no atendidas", appointmentMode: "unattended" },
    component: () => import("@/views/pages/intramural/ControlCitas.vue"),
  },
  {
    path: "/consulta-externa/consultorios",
    redirect: "/parametrizacion/general?seccion=offices",
  },
  {
    path: "/mi-agenda",
    name: prefix + ".mi-agenda",
    meta: { auth: true, name: "Mi agenda clínica", appointmentMode: "professional" },
    component: () => import("@/views/pages/intramural/ControlCitas.vue"),
  },
  {
    path: "/consulta-externa/horarios-profesionales",
    name: prefix + ".horarios-profesionales",
    meta: { auth: true, name: "Horarios de profesionales" },
    component: () => import("@/views/pages/intramural/HorariosProfesionales.vue"),
  },
  {
    path: "/agenda-intramural",
    name: prefix + ".agenda-intramural",
    meta: { auth: true, name: "Agenda intramural" },
    component: () => import("@/views/pages/intramural/AgendaConsultorios.vue"),
  },
  {
    path: "/programacion-consultorio",
    name: prefix + ".programacion-consultorio",
    meta: { auth: true, name: "Programación de consultorios" },
    component: () => import("@/views/pages/intramural/AgendaConsultorios.vue"),
  },
  {
    path: "/parametrizar-consultorio",
    redirect: "/parametrizacion/general?seccion=offices",
  },
  {
    path: "/almacen-parametrizacion",
    name: prefix + ".almacen-parametrizacion",
    meta: { auth: true, name: "Parametrización de almacenes", warehouseSection: "warehouses" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/almacen-transacciones",
    redirect: "/solicitudes-almacen",
  },
  {
    path: "/solicitudes-almacen",
    name: prefix + ".solicitudes-almacen",
    meta: { auth: true, name: "Solicitudes de almacén", warehouseSection: "requests" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/inventario-almacen",
    name: prefix + ".inventario-almacen",
    meta: { auth: true, name: "Inventario de almacén", warehouseSection: "inventory" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/traslados-almacen",
    name: prefix + ".traslados-almacen",
    meta: { auth: true, name: "Traslados de almacén", warehouseSection: "transfers" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/baja-inventario-almacen",
    name: prefix + ".baja-inventario-almacen",
    meta: { auth: true, name: "Baja de inventario", warehouseSection: "writeoffs" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/devoluciones-almacen",
    name: prefix + ".devoluciones-almacen",
    meta: { auth: true, name: "Devoluciones de almacén", warehouseSection: "returns" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/consumo-interno-almacen",
    name: prefix + ".consumo-interno-almacen",
    meta: { auth: true, name: "Consumo interno", warehouseSection: "consumption" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/entregas-locales-almacen",
    name: prefix + ".entregas-locales-almacen",
    meta: { auth: true, name: "Entregas locales", warehouseSection: "deliveries" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/almacen-cierre",
    name: prefix + ".almacen-cierre",
    meta: { auth: true, name: "Cierre de inventario", warehouseSection: "close" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/almacen-compras",
    name: prefix + ".almacen-compras",
    meta: { auth: true, name: "Compras de almacén", warehouseSection: "purchases" },
    component: () => import("@/views/pages/almacen/AlmacenModulo.vue"),
  },
  {
    path: "/unidad-quirurgica",
    name: prefix + ".unidad-quirurgica",
    meta: { auth: true, name: "Unidad quirúrgica" },
    component: () => import("@/views/pages/unidad-quirurgica/UnidadQuirurgica.vue"),
  },
  {
    path: "/unidad-quirurgica/agenda",
    name: prefix + ".unidad-quirurgica-agenda",
    meta: { auth: true, name: "Agenda quirúrgica" },
    component: () => import("@/views/pages/unidad-quirurgica/AgendaQuirurgica.vue"),
  },
  {
    path: "/unidad-quirurgica/historial",
    name: prefix + ".unidad-quirurgica-historial",
    meta: { auth: true, name: "Historial quirúrgico" },
    component: () => import("@/views/pages/unidad-quirurgica/AgendaQuirurgica.vue"),
  },
  {
    path: "/unidad-quirurgica/programar",
    name: prefix + ".unidad-quirurgica-programar",
    meta: { auth: true, name: "Programar cirugía" },
    component: () => import("@/views/pages/unidad-quirurgica/ProgramarCirugia.vue"),
  },
  {
    path: "/unidad-quirurgica/parametrizacion",
    name: prefix + ".unidad-quirurgica-parametrizacion",
    meta: { auth: true, name: "Parametrización quirúrgica" },
    component: () => import("@/views/pages/unidad-quirurgica/ParametrizacionQuirurgica.vue"),
  },
  {
    path: "/unidad-quirurgica/cirugias/:id",
    name: prefix + ".unidad-quirurgica-cirugia",
    meta: { auth: true, name: "Detalle de cirugía" },
    component: () => import("@/views/pages/unidad-quirurgica/DetalleCirugia.vue"),
  },
  {
    path: "/contrareferencias",
    name: prefix + ".contrareferencias",
    meta: { auth: true, name: "Contrarreferencias" },
    component: () => import("@/views/pages/referencias/Contrareferencias.vue"),
  },
  {
    path: "/contrareferencias/seguimiento",
    name: prefix + ".contrareferencias-seguimiento",
    meta: { auth: true, name: "Seguimiento urgente" },
    component: () => import("@/views/pages/referencias/SeguimientoContrareferencias.vue"),
  },
  {
    path: "/contrareferencias/:id/documentos",
    name: prefix + ".contrareferencias-documentos",
    meta: { auth: true, name: "Documentos de contrarreferencia" },
    component: () => import("@/views/pages/referencias/DocumentosContrareferencia.vue"),
  },
  {
    path: "/referencias",
    name: prefix + ".referencias",
    meta: { auth: true, name: "Referencias" },
    component: () => import("@/views/pages/referencias/Referencias.vue"),
  },
  {
    path: "/referencias/nueva",
    name: prefix + ".referencias-nueva",
    meta: { auth: true, name: "Nueva referencia" },
    component: () => import("@/views/pages/referencias/NuevaReferencia.vue"),
  },
  {
    path: "/referencias/autorizaciones",
    name: prefix + ".referencias-autorizaciones",
    meta: { auth: true, name: "Autorizaciones adicionales" },
    component: () => import("@/views/pages/referencias/Autorizaciones.vue"),
  },
  {
    path: "/referencias/establecimientos",
    name: prefix + ".referencias-establecimientos",
    meta: { auth: true, name: "Establecimientos de salud" },
    component: () => import("@/views/pages/referencias/EstablecimientosSalud.vue"),
  },
  {
    path: "/referencias/:id/contrareferencia",
    name: prefix + ".contrareferencia",
    meta: { auth: true, name: "Contrarreferencia" },
    component: () => import("@/views/pages/referencias/Contrareferencia.vue"),
  },
  {
    path: "/referencias/:id",
    name: prefix + ".referencias-detalle",
    meta: { auth: true, name: "Detalle de referencia" },
    component: () => import("@/views/pages/referencias/DetalleReferencia.vue"),
  },
  {
    path: "/hospitalizacion/pacientes/:id/atencion",
    alias: "/hospitalizacion/pacientes/:id",
    name: prefix + ".atencion-paciente",
    meta: { auth: true, name: "Atención hospitalaria" },
    component: () => import("@/views/pages/hospitalizacion/AtencionPaciente.vue"),
  },
  {
    path: "/admision/reservas/nueva",
    name: prefix + ".reservas-nueva",
    meta: { auth: true, name: "Nueva reserva de cama" },
    component: () => import("@/views/pages/reservas/NuevaReserva.vue"),
  },
  {
    path: "/admision/reservas",
    name: prefix + ".reservas-seguimiento",
    meta: { auth: true, name: "Seguimiento de reservas" },
    component: () => import("@/views/pages/reservas/ReservasAdmision.vue"),
  },
  {
    path: "/hospitalizacion/estaciones/:id/reservas",
    name: prefix + ".estacion-reservas",
    meta: { auth: true, name: "Reservas de la estación" },
    component: () => import("@/views/pages/reservas/ReservasEstacion.vue"),
  },
  {
    path: "/parametrizacion/ubicaciones-fisicas",
    name: prefix + ".parametrizacion-ubicaciones",
    meta: { auth: true, name: "Ubicaciones físicas" },
    component: () => import("@/views/pages/parametrizacion/UbicacionesFisicas.vue"),
  },
  {
    path: "/parametrizacion/usuarios",
    name: prefix + ".parametrizacion-usuarios",
    meta: { auth: true, name: "Configuración de usuarios" },
    component: () => import("@/views/pages/parametrizacion/Usuarios.vue"),
  },
  {
    path: "/parametrizacion/general",
    name: prefix + ".parametrizacion-general",
    meta: { auth: true, name: "Parametrización general" },
    component: () => import("@/views/pages/parametrizacion/ConfiguracionGeneral.vue"),
  },
  {
    path: "/parametrizacion/usuarios/:id",
    name: prefix + ".parametrizacion-usuario-detalle",
    meta: { auth: true, name: "Detalle de usuario" },
    component: () => import("@/views/pages/parametrizacion/DetalleUsuario.vue"),
  },
  {
    path: "/admisiones/:id",
    name: prefix + ".admisiones-detalle",
    meta: { auth: true, name: "Detalle de admisión" },
    component: () => import("@/views/pages/admisiones/DetalleAdmision.vue"),
  },
  {
    path: "/pacientes",
    name: prefix + ".pacientes-buscar",
    meta: { auth: true, name: "Buscar pacientes" },
    component: () => import("@/views/pages/pacientes/BuscarPacientes.vue"),
  },
  {
    path: "/pacientes/nuevo",
    name: prefix + ".pacientes-nuevo",
    meta: { auth: true, name: "Crear paciente" },
    component: () => import("@/views/pages/pacientes/CrearPaciente.vue"),
  },
  {
    path: "/pacientes/:id",
    name: prefix + ".pacientes-detalle",
    meta: { auth: true, name: "Detalle del paciente" },
    component: () => import("@/views/pages/pacientes/DetallePaciente.vue"),
  },
  // Módulo funcional HHospital: admisión, camas, censo y detalle de estancia.
  {
    path: "/hospitalizacion/nuevo-ingreso",
    name: prefix + ".hospitalizacion-nuevo-ingreso",
    meta: { auth: true, name: "Nuevo ingreso" },
    component: () => import("@/views/pages/hospitalizacion/FlujoHospitalizacion.vue"),
  },
  {
    path: "/hospitalizacion/estaciones",
    name: prefix + ".hospitalizacion-estaciones",
    meta: { auth: true, name: "Estaciones de enfermería" },
    component: () => import("@/views/pages/hospitalizacion/EstacionesEnfermeria.vue"),
  },
  {
    path: "/hospitalizacion/estaciones/:id",
    name: prefix + ".hospitalizacion-estacion-detalle",
    meta: { auth: true, name: "Detalle de estación" },
    component: () => import("@/views/pages/hospitalizacion/DetalleEstacion.vue"),
  },
  {
    path: "/hospitalizacion/censo",
    name: prefix + ".hospitalizacion-censo",
    meta: { auth: true, name: "Censo hospitalario" },
    component: () => import("@/views/pages/hospitalizacion/CensoHospitalario.vue"),
  },
  {
    path: "/hospitalizacion/traslados",
    name: prefix + ".hospitalizacion-traslados",
    meta: { auth: true, name: "Bandeja de traslados" },
    component: () => import("@/views/pages/hospitalizacion/BandejaTraslados.vue"),
  },
  {
    path: "/hospitalizacion/:id",
    name: prefix + ".hospitalizacion-detalle",
    meta: { auth: true, name: "Detalle de hospitalización" },
    component: () => import("@/views/pages/hospitalizacion/DetalleHospitalizacion.vue"),
  },
  {
    path: "/",
    name: prefix + ".home",
    meta: { auth: true, name: "Home" },
    component: () => import("@/views/IndexPage.vue"),
  },
  {
    path: "/dashboard-1",
    name: prefix + ".dashboard-1",
    meta: { auth: true, name: "dashboard-1" },
    component: () => import("@/views/dashboard-pages/dashboard-1.vue"),
  },
  {
    path: "/dashboard-2",
    name: prefix + ".product",
    meta: { auth: true, name: "Product" },
    component: () => import("@/views/dashboard-pages/dashboard-2.vue"),
  },
  {
    path: "/patient-dashboard",
    name: prefix + ".patient-dashboard",
    meta: { auth: true, name: "patient-dashboard" },
    component: () => import("@/views/dashboard-pages/dashboard-3.vue"),
  },
  {
    path: "/dashboard-4",
    name: prefix + ".dashboard-4",
    meta: { auth: true, name: "dashboard-4" },
    component: () => import("@/views/dashboard-pages/dashboard-4.vue"),
  },

  // email route
  {
    path: "/email/inbox",
    name: prefix + ".inbox",
    meta: { auth: true, name: "inbox" },
    component: () => import("@/views/pages/email/inbox.vue"),
  },
  {
    path: "/email/email-compose",
    name: prefix + ".email-compose",
    meta: { auth: true, name: "email-compose" },
    component: () => import("@/views/pages/email/email-compose.vue"),
  },

  // doctor route
  {
    path: "/doctor/doctor-list",
    name: prefix + ".doctor-list",
    meta: { auth: true, name: "doctor-list" },
    component: () => import("@/views/pages/doctor/all-doctor.vue"),
  },
  {
    path: "/doctor/add-doctor",
    name: prefix + ".add-doctor",
    meta: { auth: true, name: "add-doctor" },
    component: () => import("@/views/pages/doctor/add-doctor.vue"),
  },
  {
    path: "/doctor/doctor-profile",
    name: prefix + ".doctor-profile",
    meta: { auth: true, name: "doctor-profile" },
    component: () => import("@/views/pages/doctor/doctor-profile.vue"),
  },
  {
    path: "/doctor/edit-doctor",
    name: prefix + ".edit-doctor",
    meta: { auth: true, name: "edit-doctor" },
    component: () => import("@/views/pages/doctor/edit-doctor.vue"),
  },

  // calendar route
  {
    path: "/calendar",
    name: prefix + ".calendar",
    meta: { auth: true, name: "calendar" },
    component: () => import("@/views/pages/extra-pages/calendar.vue"),
  },

  // chat route
  {
    path: "/chat",
    name: prefix + ".chat",
    meta: { auth: true, name: "chat" },
    component: () => import("@/views/pages/chat/chat.vue"),
  },

  // ui-elements route
  {
    path: "/ui-elements/colors",
    name: prefix + ".colors",
    meta: { auth: true, name: "Colors" },
    component: () => import("@/views/components/ui-elements/ColorsView.vue"),
  },
  {
    path: "/ui-elements/typography",
    name: prefix + ".typography",
    meta: { auth: true, name: "Typography" },
    component: () => import("@/views/components/ui-elements/TypographyView.vue"),
  },
  {
    path: "/ui-elements/alerts",
    name: prefix + ".alerts",
    meta: { auth: true, name: "Alerts" },
    component: () => import("@/views/components/ui-elements/AlertsView.vue"),
  },
  {
    path: "/ui-elements/badges",
    name: prefix + ".badges",
    meta: { auth: true, name: "Badges" },
    component: () => import("@/views/components/ui-elements/BadgeView.vue"),
  },
  {
    path: "/ui-elements/breadcrumb",
    name: prefix + ".breadcrumb",
    meta: { auth: true, name: "Breadcrumb" },
    component: () => import("@/views/components/ui-elements/BreadCrumb.vue"),
  },
  {
    path: "/ui-elements/buttons",
    name: prefix + ".buttons",
    meta: { auth: true, name: "Buttons" },
    component: () => import("@/views/components/ui-elements/ButtonsView.vue"),
  },
  {
    path: "/ui-elements/cards",
    name: prefix + ".cards",
    meta: { auth: true, name: "Cards" },
    component: () => import("@/views/components/ui-elements/CardsView.vue"),
  },
  {
    path: "/ui-elements/carousel",
    name: prefix + ".carousel",
    meta: { auth: true, name: "Carousel" },
    component: () => import("@/views/components/ui-elements/CarouselView.vue"),
  },
  {
    path: "/ui-elements/video",
    name: prefix + ".video",
    meta: { auth: true, name: "Video" },
    component: () => import("@/views/components/ui-elements/VideoView.vue"),
  },
  {
    path: "/ui-elements/grid",
    name: prefix + ".grid",
    meta: { auth: true, name: "Grid" },
    component: () => import("@/views/components/ui-elements/GridView.vue"),
  },
  {
    path: "/ui-elements/images",
    name: prefix + ".images",
    meta: { auth: true, name: "Images" },
    component: () => import("@/views/components/ui-elements/ImagesView.vue"),
  },
  {
    path: "/ui-elements/list-group",
    name: prefix + ".list-group",
    meta: { auth: true, name: "List group" },
    component: () => import("@/views/components/ui-elements/ListGroup.vue"),
  },
  {
    path: "/ui-elements/modal",
    name: prefix + ".modal",
    meta: { auth: true, name: "Modal" },
    component: () => import("@/views/components/ui-elements/ModalView.vue"),
  },
  {
    path: "/ui-elements/notifications",
    name: prefix + ".notifications",
    meta: { auth: true, name: "Notifications" },
    component: () => import("@/views/components/ui-elements/NotificationsView.vue"),
  },
  {
    path: "/ui-elements/pagination",
    name: prefix + ".pagination",
    meta: { auth: true, name: "Pagination" },
    component: () => import("@/views/components/ui-elements/PaginationView.vue"),
  },
  {
    path: "/ui-elements/popovers",
    name: prefix + ".popovers",
    meta: { auth: true, name: "popovers" },
    component: () => import("@/views/components/ui-elements/PopoversView.vue"),
  },
  {
    path: "/ui-elements/progressbar",
    name: prefix + ".progressbar",
    meta: { auth: true, name: "Progressbar" },
    component: () => import("@/views/components/ui-elements/ProgressBars.vue"),
  },
  {
    path: "/ui-elements/tabs",
    name: prefix + ".tabs",
    meta: { auth: true, name: "Tabs" },
    component: () => import("@/views/components/ui-elements/TabsView.vue"),
  },
  {
    path: "/ui-elements/tooltips",
    name: prefix + ".tooltips",
    meta: { auth: true, name: "Tooltips" },
    component: () => import("@/views/components/ui-elements/TooltipsView.vue"),
  },

  // forms route
  {
    path: "/forms/form-elements",
    name: prefix + ".form-elements",
    meta: { auth: true, name: "Form Elements" },
    component: () =>
      import("@/views/components/forms/FormElement.vue"),
  },
  {
    path: "/forms/form-validation",
    name: prefix + ".form-validation",
    meta: { auth: true, name: "Form Validation" },
    component: () =>
      import("@/views/components/forms/FormValidation.vue"),
  },
  {
    path: "/forms/form-switch",
    name: prefix + ".form-switch",
    meta: { auth: true, name: "Form Switch" },
    component: () =>
      import("@/views/components/forms/FormSwitch.vue"),
  },
  {
    path: "/forms/form-checkbox",
    name: prefix + ".form-checkbox",
    meta: { auth: true, name: "Form Checkbox" },
    component: () =>
      import("@/views/components/forms/FormCheckbox.vue"),
  },
  {
    path: "/forms/form-radio",
    name: prefix + ".form-radio",
    meta: { auth: true, name: "Form Radio" },
    component: () =>
      import("@/views/components/forms/FormRadio.vue"),
  },

  // form wizard route
  {
    path: "/form-wizard/simple-wizard",
    name: prefix + ".simple-wizard",
    meta: { auth: true, name: "Simple Wizard" },
    component: () =>
      import("@/views/components/form-wizard/SimpalWizard.vue"),
  },
  {
    path: "/form-wizard/validate-wizard",
    name: prefix + ".validate-wizard",
    meta: { auth: true, name: "Validate Wizard" },
    component: () =>
      import("@/views/components/form-wizard/ValidateWizard.vue"),
  },
  {
    path: "/form-wizard/vertical-wizard",
    name: prefix + ".vertical-wizard",
    meta: { auth: true, name: "Vertical Wizard" },
    component: () =>
      import("@/views/components/form-wizard/VerticalWizard.vue"),
  },

  // tables route
  {
    path: "/table/basic-table",
    name: prefix + ".basic-table",
    meta: { auth: true, name: "Basic Table" },
    component: () => import("@/views/components/tables/basic-table.vue"),
  },
  {
    path: "/table/data-table",
    name: prefix + ".data-table",
    meta: { auth: true, name: "Data Table" },
    component: () => import("@/views/components/tables/data-table.vue"),
  },
  {
    path: "/table/editable-table",
    name: prefix + ".editable-table",
    meta: { auth: true, name: "Editable Table" },
    component: () => import("@/views/components/tables/editable-table.vue"),
  },

  // charts route
  {
    path: "/charts/chart-page",
    name: prefix + ".chart-page",
    meta: { auth: true, name: "Chart Page" },
    component: () => import("@/views/pages/charts/chart-page.vue"),
  },
  {
    path: "/charts/e-chart",
    name: prefix + ".e-chart",
    meta: { auth: true, name: "Chart Page" },
    component: () => import("@/views/pages/charts/e-chart.vue"),
  },
  {
    path: "/charts/am-chart",
    name: prefix + ".am-chart",
    meta: { auth: true, name: "AM Chart" },
    component: () => import("@/views/pages/charts/am-chart-page.vue"),
  },
  {
    path: "/charts/apexchart",
    name: prefix + ".apexchart",
    meta: { auth: true, name: "ApexChart" },
    component: () => import("@/views/pages/charts/apexchart.vue"),
  },

  // icons route
  {
    path: "/icons/dripicons",
    name: prefix + ".dripicons",
    meta: { auth: true, name: "dripicons" },
    component: () => import("@/views/components/icons/Dripicons.vue"),
  },
  {
    path: "/icons/fontawesome-5",
    name: prefix + ".fontawesome-5",
    meta: { auth: true, name: "fontawesome-5" },
    component: () => import("@/views/components/icons/IconFontawesome5.vue"),
  },
  {
    path: "/icons/line-awesome",
    name: prefix + "./icons/line-awesome",
    meta: { auth: true, name: "/icons/line-awesome" },
    component: () => import("@/views/components/icons/LineAwesome.vue"),
  },
  {
    path: "/icons/remixicon",
    name: prefix + ".remixicon",
    meta: { auth: true, name: "remixicon" },
    component: () => import("@/views/components/icons/Remixicon.vue"),
  },
  {
    path: "/icons/unicons",
    name: prefix + ".unicons",
    meta: { auth: true, name: "unicons" },
    component: () => import("@/views/components/icons/Unicons.vue"),
  },

  // maps route
  {
    path: "/maps/google-map",
    name: prefix + ".google-map",
    meta: { auth: true, name: "google-map" },
    component: () => import("@/views/pages/maps/GooglePage.vue"),
  },
  {
    path: "/maps/vector-map",
    name: prefix + ".vector-map",
    meta: { auth: true, name: "vector-map" },
    component: () => import("@/views/pages/maps/VectorPage.vue"),
  },

  // extra-pages route
  {
    path: "/extra-pages/timeline",
    name: prefix + ".timeline",
    meta: { auth: true, name: "Timeline" },
    component: () => import("@/views/pages/extra-pages/timeline.vue"),
  },
  {
    path: "/extra-pages/invoice",
    name: prefix + ".invoice",
    meta: { auth: true, name: "invoice" },
    component: () => import("@/views/pages/extra-pages/invoice.vue"),
  },
  {
    path: "/extra-pages/blank-page",
    name: prefix + ".blank-page",
    meta: { auth: true, name: "Blank Page" },
    component: () => import("@/views/pages/extra-pages/blank-page.vue"),
  },
  {
    path: "/extra-pages/pricing",
    name: prefix + ".pricing",
    meta: { auth: true, name: "Pricing" },
    component: () => import("@/views/pages/extra-pages/pricing.vue"),
  },
  {
    path: "/extra-pages/pages-pricing-one",
    name: prefix + ".pricing-one",
    meta: { auth: true, name: "Pricing-one" },
    component: () => import("@/views/pages/extra-pages/pricing-1.vue"),
  },
  {
    path: "/extra-pages/faq",
    name: prefix + ".faq",
    meta: { auth: true, name: "Faq" },
    component: () => import("@/views/pages/extra-pages/faq.vue"),
  },
  {
    path: "/extra-pages/privacy-policy",
    name: prefix + ".privacy-policy",
    meta: { auth: true, name: "privacy-policy" },
    component: () => import("@/views/pages/extra-pages/privacy-policy.vue"),
  },
  {
    path: "/extra-pages/terms-of-service",
    name: prefix + ".terms-of-service",
    meta: { auth: true, name: "terms-of-service" },
    component: () => import("@/views/pages/extra-pages/terms-and-service.vue"),
  },
  {
    path: "/extra-pages/privacy-setting",
    name: prefix + ".privacy-setting",
    meta: { auth: true, name: "privacy-setting" },
    component: () => import("@/views/pages/extra-pages/privacy-setting.vue"),
  },
  {
    path: "/extra-pages/account-setting",
    name: prefix + ".account-setting",
    meta: { auth: true, name: "account-setting" },
    component: () => import("@/views/pages/extra-pages/account-setting.vue"),
  },
];

// auth routes
export const AuthRoutes = (prefix) => [
  {
    path: "/auth/sign-in",
    name: prefix + ".sign-in",
    meta: { guest: true, name: "Iniciar sesión" },
    component: () => import("@/views/pages/auth/SignIn.vue"),
  },
  {
    path: "/auth/sign-up",
    name: prefix + ".sign-up",
    meta: { auth: true, name: "sign-up" },
    component: () => import("@/views/pages/auth/SignUp.vue"),
  },
  {
    path: "/auth/recover-password",
    name: prefix + ".recover-password",
    meta: { auth: true, name: "recover-password" },
    component: () => import("@/views/pages/auth/RecoverPw.vue"),
  },
  {
    path: "/auth/confirm-mail",
    name: prefix + ".confirm-mail",
    meta: { auth: true, name: "confirm-mail" },
    component: () => import("@/views/pages/auth/ConfirmMail.vue"),
  },
  {
    path: "/auth/lock-screen",
    name: prefix + ".lock-screen",
    meta: { auth: true, name: "Lock-screen" },
    component: () => import("@/views/pages/auth/LockScreen.vue"),
  },
];

export const ErrorRoutes = (prefix) => [
  {
    path: "/error/error-404",
    name: prefix + ".error-404",
    meta: { auth: true, name: "Error 404" },
    component: () => import("@/views/pages/extra-pages/error-404.vue"),
  },
  {
    path: "/error/error-500",
    name: prefix + ".error-500",
    meta: { auth: true, name: "Error 500" },
    component: () => import("@/views/pages/extra-pages/error-500.vue"),
  },
  {
    path: "/extra-pages/coming-soon",
    name: prefix + ".coming-soon",
    meta: { auth: true, name: "Comingsoon" },
    component: () => import("@/views/pages/extra-pages/coming-soon.vue"),
  },
  {
    path: "/extra-pages/maintenace",
    name: prefix + ".maintenance",
    meta: { auth: true, name: "Maintenance" },
    component: () => import("@/views/pages/extra-pages/maintenance.vue"),
  },
];
