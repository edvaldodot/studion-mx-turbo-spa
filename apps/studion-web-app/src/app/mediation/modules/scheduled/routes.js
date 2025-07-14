import childrenRoutes from './pages/childrenRoutes'

export default [
  {
    name: 'scheduled.index',
    path: '/mediation/scheduled',
    redirect: { name: 'mediation.scheduled.email' },
    component: () => import('./ScheduledIndex'),
    meta: {
      requiresAuth: true,
    },
    children: childrenRoutes,
  },
]
