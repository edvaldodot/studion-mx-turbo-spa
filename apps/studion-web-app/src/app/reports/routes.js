const ReportsList = () => import('./pages/ReportsList')
const ReportsView = () => import('./pages/ReportsView')
const ModalAddReport = () => import('./pages/ModalAddReport')

export default [
  {
    name: 'reports.list',
    path: '/reports',
    component: ReportsList,
    meta: {
      requiresAuth: true,
      vuex: ['reports']
    },
    children: [
      {
        name: 'reports.list.create',
        path: 'create',
        component: ModalAddReport,
        meta: {
          modalCloseLink: { name: 'reports.list' }
        }
      },
      {
        name: 'reports.list.edit',
        path: 'edit/:id',
        component: ModalAddReport,
        meta: {
          editing: true,
          modalCloseLink: { name: 'reports.list' }
        }
      }
    ]
  },
  {
    name: 'reports.view',
    path: '/reports/:id',
    component: ReportsView,
    meta: {
      requiresAuth: true
    }
  }
]
