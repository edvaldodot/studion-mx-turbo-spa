import { modalNestedRoutes } from './pages/ModalViewFilter/routes'

const FiltersList = () => import('./pages/FiltersList')
const ModalAddFilter = () => import('./pages/ModalAddFilter')
const ModalViewFilter = () => import('./pages/ModalViewFilter')

export const routes = [
  {
    name: 'filter.index',
    path: '/mediation/filter',
    redirect: { name: 'filter.list' }
  },
  {
    name: 'filter.list',
    path: '/mediation/filter/list',
    component: FiltersList,
    meta: {
      requiresAuth: true,
      group: 'filter'
    },
    children: [
      {
        name: 'filter.add',
        path: 'create',
        component: ModalAddFilter,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'filter.list' }
        }
      },
      {
        path: 'view/:id',
        component: ModalViewFilter,
        children: modalNestedRoutes
      }
    ]
  }
]
