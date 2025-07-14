import childrenRoutes from './pages/childrenRoutes'

export default [
  {
    name: 'management.index',
    path: '/management',
    redirect: { name: 'management.evaluation.index' },
    component: () => import('./ManagementIndex'),
    meta: {
      requiresAuth: true,
    },
    children: childrenRoutes,
  },
]
