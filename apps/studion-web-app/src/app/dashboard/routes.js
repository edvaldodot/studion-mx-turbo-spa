const Dashboard = () => import('./pages/Dashboard')
const ModalMetadataNew = () => import('./pages/ModalMetadataNew')
const ModalMetadataPending = () => import('./pages/ModalMetadataPending')

export default [
  {
    name: 'index',
    path: '/',
    redirect: { name: 'dashboard' },
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        name: 'dashboard.profile.new',
        path: '/dashboard/profile/new',
        component: ModalMetadataNew,
        meta: {
          requiresAuth: true
        }
      },
      {
        name: 'dashboard.profile.pending',
        path: '/dashboard/profile/pending',
        component: ModalMetadataPending,
        meta: {
          requiresAuth: true
        }
      }
    ]
  }
]
