import { createRouter, createWebHistory } from 'vue-router';

import { DefaultRoutes, AuthRoutes, ErrorRoutes } from './default-routes';
import DefaultLayout from "../layouts/DefaultLayout.vue"
import BlankLayout from '@/layouts/BlankLayout.vue';

const routes = [
    // Destinos raíz que puede entregar el menú dinámico del backend.
    { path: '/hospitalizacion', redirect: '/hospitalizacion/censo' },
    {
        path: '/admin',
        name: 'dashboard',
        component: DefaultLayout,
        meta: {},
        children: DefaultRoutes('dashboard'),
    },
    {
        path: '/auth',
        name: 'auth',
        component: BlankLayout,
        meta: {},
        children: AuthRoutes('auth'),
    },
    {
        path: '/page',
        name: 'page',
        component: BlankLayout,
        meta: {},
        children: ErrorRoutes('page'),
    },
]

const Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: ''
});

// Protege las pantallas clínicas y conserva el destino solicitado para volver
// a él después del inicio de sesión.
Router.beforeEach((to) => {
    const token = localStorage.getItem('access_token');
    if (to.meta.auth && !token) {
        return { path: '/auth/sign-in', query: { redirect: to.fullPath } };
    }
    if (to.meta.guest && token) return '/hospitalizacion/censo';
});

export default Router;
