import { config } from '@vue/test-utils';
import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router';
import { createI18n } from 'vue-i18n'
import pt from '../src/support/i18n/locales/pt-br.json'
import { createPinia, setActivePinia } from 'pinia'

const pinia = createPinia()
setActivePinia(pinia)

const i18n = createI18n({
  legacy: false,
  locale: 'pt',
  messages: {
    pt,
  },
})

// Mock RouterLink e RouterView
config.global.stubs = {
  RouterLink: {
    template: '<a><slot /></a>',
  },
  RouterView: {
    template: '<div><slot /></div>',
  },
};

// Definindo rota corretamente tipada
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: {
      template: '<div>Home</div>',
    },
  },
  {
    path: '/classroom-v2/:journeyId/:classroomId',
    name: 'classroom',
    component: {
      template: '<div>Classroom</div>',
    },
  },
];

// Criando e exportando o router
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

config.global.plugins = [router, i18n, pinia]
export { router }
