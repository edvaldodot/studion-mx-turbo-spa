import Vue from 'vue'
import Router from 'vue-router'
import beforeEach from './beforeEach'
import { routes as app } from '@/app'

Vue.use(Router)

const routes = [...app]

if (process.env.NODE_ENV !== 'production') {
  routes.push({
    path: '/dev-icons',
    name: 'dev.icons',
    component: () => import('@/app/dev/IconLibrary')
  })

  routes.push({
    path: '/test-page',
    name: 'test.page',
    component: () => import('@/app/dev/TestPage'),
  })
}

const router = new Router({
  routes,
  linkActiveClass: 'is-active-parent',
  linkExactActiveClass: 'is-active',
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach(beforeEach)

export default router
