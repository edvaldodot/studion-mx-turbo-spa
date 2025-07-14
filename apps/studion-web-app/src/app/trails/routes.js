const TrailsList = () => import('./pages/TrailsList')
const TrailsForm = () => import('./pages/TrailForm')
const TrailSolutions = () => import('./pages/TrailSolutions')
const ModalTrailUsersList = () => import('./pages/ModalTrailUsersList')
const ModalTrailSingleUserEnroll = () => import('./pages/ModalTrailSingleUserEnroll')
const ModalAddTrailSolutions = () => import('./pages/ModalAddTrailSolutions')
const ModalTrailGroups = () => import('./pages/ModalTrailGroups')
const ModalChangeStatus = () => import('./pages/ModalChangeStatus')
const ModalSessionTimeline = () => import('../community/pages/ModalSessionTimeline')
const ModalStatusTimeline = () => import('../community/pages/ModalStatusTimeline')

export default [
  {
    name: 'trails.list',
    path: '/trails',
    component: TrailsList,
    meta: {
      requiresAuth: true,
      vuex: ['Trails'],
    },
    children: [
      {
        name: 'trails.users',
        path: ':id/users',
        component: ModalTrailUsersList,
        props: (router) => ({ trailId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'trails.list' },
        },
      },
      {
        name: 'trails.users.status',
        path: ':trailId/users/sessions/:id/enroll/:enrollmentId/status',
        component: ModalStatusTimeline,
        props: (router) => ({
          trailId: router.params.trailId,
          sessionId: parseInt(router.params.id),
          enrollmentId: parseInt(router.params.enrollmentId),
          name: router.params.name,
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'session.enroll.change-status',
        path: ':trailId/users/sessions/:id/enroll/:enrollmentId/change-status',
        props: (router) => ({
          trailId: router.params.trailId,
          sessionId: parseInt(router.params.id),
          enrollmentId: parseInt(router.params.enrollmentId),
        }),
        component: ModalChangeStatus,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'trails.enroll.single',
        path: ':id/users/enroll/single',
        component: ModalTrailSingleUserEnroll,
        props: (router) => ({ trailId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'trails.users' },
        },
      },
      {
        name: 'trails.enroll.batch',
        path: ':id/users/enroll/batch',
        component: ModalTrailSingleUserEnroll,
        props: (router) => ({ trailId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'trails.users' },
        },
      },
      {
        name: 'trails.groups',
        path: ':id/groups',
        component: ModalTrailGroups,
        props: (router) => ({ trailId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'trails.list' },
        },
      },
    ],
  },
  {
    name: 'trails.create',
    path: '/trails/create',
    component: TrailsForm,
    meta: {
      requiresAuth: true,
      group: 'trails',
      vuex: ['Trails'],
    },
  },
  {
    name: 'trails.update',
    path: '/trails/:id/update',
    component: TrailsForm,
    meta: {
      requiresAuth: true,
      group: 'trails',
      vuex: ['Trails'],
    },
  },
  {
    name: 'trails.create.solutions',
    path: '/trails/:id/solutions',
    component: TrailSolutions,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'add',
        name: 'trails.create.solutions.add',
        component: ModalAddTrailSolutions,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'trails.create.solutions' },
        },
      },
      {
        path: 'timeline',
        name: 'trails.create.solutions.timeline',
        component: ModalSessionTimeline,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'trails.create.solutions' },
          type: 'trail',
        },
      },
    ],
  },
]
