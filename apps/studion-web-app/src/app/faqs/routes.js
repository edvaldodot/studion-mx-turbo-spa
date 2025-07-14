const FaqList = () => import('./pages/FaqList')
const FaqCategories = () => import('./pages/FaqCategories')
const ModalAddFaq = () => import('./pages/ModalAddFaq')
const ModalAddCategory = () => import('./pages/ModalAddCategory')

export default [
  {
    name: 'faq.index',
    path: '/faq',
    redirect: { name: 'faq.questions' },
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'faq.questions',
    path: '/faq/questions',
    component: FaqList,
    meta: {
      requiresAuth: true,
      // vuex: ['faqs'],
      group: 'faq',
      description: 'global:route.faq.index'
    },
    children: [
      {
        name: 'faq.questions.create',
        path: 'create',
        component: ModalAddFaq,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'faq.questions' }
        }
      },
      {
        name: 'faq.questions.edit',
        path: 'edit/:id',
        component: ModalAddFaq,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'faq.questions' }
        }
      }
    ]
  },
  {
    name: 'faq.categories',
    path: '/faq/categories',
    component: FaqCategories,
    meta: {
      requiresAuth: true,
      group: 'faq',
      description: 'global:route.faq.categories'
    },
    children: [
      {
        name: 'faq.categories.create',
        path: 'create',
        component: ModalAddCategory,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'faq.categories' }
        }
      },
      {
        name: 'faq.categories.edit',
        path: 'edit/:id',
        component: ModalAddCategory,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'faq.categories' }
        }
      }
    ]
  }
]
