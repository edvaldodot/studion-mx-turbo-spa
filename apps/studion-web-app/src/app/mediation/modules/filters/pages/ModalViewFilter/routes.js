const FilterTabInfo = () => import('./pages/FilterTabInfo')
const FilterTabResult = () => import('./pages/FilterTabResult')

export const modalNestedRoutes = [
  {
    name: 'filter.view',
    path: 'info',
    component: FilterTabInfo,
    meta: {
      requiresAuth: true,
      modalCloseLink: { name: 'filter.list' }
    }
  },
  {
    name: 'filter.view.result',
    path: 'result',
    component: FilterTabResult,
    meta: {
      requiresAuth: true,
      modalCloseLink: { name: 'filter.list' }
    }
  }
]
