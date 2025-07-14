import { mixin } from '@/mixins'

import { routes as auth } from './auth'
import { routes as classroom } from './classroom'
import { routes as dashboard } from './dashboard'
import { routes as solutions } from './solutions'
import { routes as trails } from './trails'
import { routes as offerings } from './offerings'
import { routes as faqs } from './faqs'
import { routes as library } from './library'
import { routes as management } from './management'
import { routes as mediation } from './mediation'
import { routes as community } from './community'
import { routes as ranking } from './ranking'
import { routes as reports } from './reports'
import { routes as settings } from './settings'
import { routes as profile } from './profile'
import { routes as external } from './external'
import NotFoundPage from '@/components/general/NotFoundPage'
import InMaintenance from '@/app/others/pages/InMaintenance'
import V2Components from '@/app/others/pages/V2Components'
import {
  propsHandlerUnauthorized,
  beforeEnterUnauthorized,
} from '@/components/general/NotAuthorizedPage/NotAuthorizedRouteHandlers'

const notFoundRoute = [
  {
    name: 'catchall',
    path: '*',
    redirect: { name: '404' },
    meta: {
      requiresAuth: false,
      hideNavbar: false,
    },
  },
  {
    name: '404',
    path: '/404',
    component: NotFoundPage,
    meta: {
      requiresAuth: false,
      hideNavbar: false,
    },
  },
  {
    name: '401',
    path: '/401/:error',
    component: () => import('@/components/general/NotAuthorizedPage'),
    meta: {
      requiresAuth: false,
      hideNavbar: true,
    },
    props: propsHandlerUnauthorized,
    beforeEnter: beforeEnterUnauthorized,
  },
  {
    name: 'maintenance',
    path: '/maintenance',
    component: InMaintenance,
    meta: {
      hideNavbar: true,
    },
  },
  // TODO: provisório
  {
    name: 'v2components',
    path: '/components',
    component: V2Components,
    meta: {
      hideNavbar: true,
    },
  },
  {
    path: '/portal',
    children: [
      {
        name: 'portal',
        path: '/',
        beforeEnter() {
          mixin.methods.$portalRedirect('MAIN_URL')
        },
      },
      {
        name: 'portal.profile',
        path: 'profile',
        beforeEnter() {
          mixin.methods.$portalRedirect('PROFILE_URL')
        },
      },
      {
        name: 'portal.courses',
        path: 'courses',
        beforeEnter() {
          mixin.methods.$portalRedirect('COURSES_URL')
        },
      },
      {
        name: 'portal.courses.trail',
        path: 'courses-trail',
        beforeEnter(to) {
          mixin.methods.$portalRedirect('TRAIL_COURSES_URL', to.params)
        },
      },
      {
        name: 'portal.logout',
        path: 'logout',
        beforeEnter() {
          mixin.methods.$portalRedirect('LOGOUT_URL')
        },
      },
    ],
  },
  {
    path: '/sige',
    children: [
      {
        name: 'sige',
        path: '/',
        beforeEnter() {
          mixin.methods.$SigeRedirect('MAIN_URL')
        },
      },
    ],
  },
]

export default [
  ...auth,
  ...dashboard,
  ...classroom,
  ...solutions,
  ...trails,
  ...offerings,
  ...faqs,
  ...library,
  ...management,
  ...mediation,
  ...community,
  ...ranking,
  ...reports,
  ...settings,
  ...profile,
  ...external,
  ...notFoundRoute,
]