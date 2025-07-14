const Catalog = () => import('./pages/Catalog')
const OfferingForm = () => import('./pages/OfferingForm')
const OfferingSolutionsForm = () => import('./pages/OfferingSolutionsForm')
const ModalOfferingSolutionsAdd = () => import('./pages/ModalOfferingSolutionsAdd')
const OfferingSessionsForm = () => import('./pages/OfferingSessionsForm')
const OfferingList = () => import('./pages/OfferingList')
const OfferingView = () => import('./pages/OfferingView')
const ModalSessionTimeline = () => import('@/app/community/pages/ModalSessionTimeline')

export default [
  {
    name: 'offerings.index',
    path: '/offerings',
    component: Catalog,
    redirect: { name: 'offerings.list' },
    meta: {
      requiresAuth: true,
      group: 'offerings',
      description: 'global:route.offerings.list'
    },
    children: [
      {
        name: 'offerings.list',
        path: '/offerings/catalog',
        component: OfferingList,
        meta: {
          requiresAuth: true,
          group: 'offerings'
        }
      }
    ]
  },
  {
    name: 'offerings.create',
    path: '/offerings/create',
    component: OfferingForm,
    meta: {
      requiresAuth: true,
      group: 'offerings',
      description: 'global:route.offerings.create'
    }
  },
  {
    name: 'offerings.update',
    path: '/offerings/:id/update',
    component: OfferingForm,
    meta: {
      requiresAuth: true,
      group: 'offerings',
      description: 'global:route.offerings.update'
    }
  },
  {
    name: 'offerings.solutions.edit',
    path: '/offerings/:id/solutions',
    component: OfferingSolutionsForm,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        name: 'offerings.solutions.add',
        path: 'add',
        component: ModalOfferingSolutionsAdd,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'offerings.solutions.edit' }
        }
      }
    ]
  },
  {
    name: 'offerings.sessions.edit',
    path: '/offerings/:id/sessions',
    component: OfferingSessionsForm,
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'offerings.view',
    path: '/offerings/:id',
    component: OfferingView,
    meta: {
      requiresAuth: true,
      group: 'offerings',
      description: 'global:route.offerings.view'
    },
    children: [
      {
        name: 'offerings.sessions.timeline',
        path: 'timeline/:sessionId',
        component: ModalSessionTimeline,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'offerings.view' }
        }
      }
    ]
  }
]
