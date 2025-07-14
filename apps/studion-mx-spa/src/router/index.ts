import { createRouter, createWebHistory } from 'vue-router'

import Catalog from '@/views/catalog/Catalog.vue';
import Classroom from '@/views/classroom'
import ThemeView from '@/views/theme/ThemeView.vue'

const routes = [
  {
    path: '/',
    name: 'Initial',
    component: Catalog,
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/classroom-v2/:journeyUuid/:sessionUuid',
    name: 'Classroom',
    component: Classroom,
  },
  {
    path: '/theme',
    name: 'Theme',
    component: ThemeView,
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
