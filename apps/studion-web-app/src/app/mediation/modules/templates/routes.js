import ActionTemplateList from './pages/ActionTemplateList'
import ActionTemplateCreate from './pages/ActionTemplateCreate'

export const routes = [
  {
    name: 'template.actions.index',
    path: '/mediation/template-actions',
    redirect: { name: 'template.actions.list' },
  },
  {
    name: 'template.actions.list',
    path: '/mediation/template-actions/list',
    component: ActionTemplateList,
    meta: {
      requiresAuth: true,
      group: 'template-actions',
      requiresFeature: 'pm_ai',
    },
  },
  {
    name: 'template.actions.create',
    path: '/mediation/template-actions/create',
    component: ActionTemplateCreate,
    meta: {
      requiresAuth: true,
      group: 'template-actions',
      requiresFeature: 'pm_ai',
    },
  },
  {
    name: 'template.actions.edit',
    path: '/mediation/template-actions/:id/edit',
    component: ActionTemplateCreate,
    meta: {
      isEditing: true,
      requiresAuth: true,
      group: 'template-actions',
      requiresFeature: 'pm_ai',
    },
  },
]
