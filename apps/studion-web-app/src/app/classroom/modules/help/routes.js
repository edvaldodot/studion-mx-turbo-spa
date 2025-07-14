const HelpList = () => import('./pages/HelpList')
const DoubtCategories = () => import('./pages/DoubtCategories')
const ModalCreate = () => import('./pages/DoubtCategories/components/ModalCreate')
export const routes = [
  {
    name: 'classroom.knowledgeBase',
    path: '/classroom/:session_uuid/help',
    component: HelpList,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'classroom.categories',
    path: '/classroom/:session_uuid/categories',
    component: DoubtCategories,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'classroom.categories.create',
        path: 'create',
        component: ModalCreate,
        props: true,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'classroom.categories' },
        },
      },
      {
        name: 'classroom.categories.edit',
        path: 'edit/:id',
        component: ModalCreate,
        props: true,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'classroom.categories' },
        },
      },
    ],
  },
]
