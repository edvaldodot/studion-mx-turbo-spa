const SettingsGeneral = () => import('./pages/SettingsGeneral')
const SettingsAuth = () => import('./pages/SettingsAuth')
const SettingsSurveyNPS = () => import('./pages/SettingSurveyNPS')
const SettingsNotifications = () => import('./pages/SettingsNotifications')
const SettingsCertificate = () => import('./pages/SettingsCertificate')
const SettingsDashboard = () => import('./pages/SettingsDashboard')
const SettingsCategories = () => import('./pages/SettingsCategories')
const SettingsBranches = () => import('./pages/SettingsBranches')
const ModalAddBranch = () => import('./pages/ModalAddBranch')
const ModalAddCategory = () => import('./pages/ModalAddCategory')
const ModalAddCertificate = () => import('./pages/ModalAddCertificate')
const ModalPreviewCertificate = () => import('./pages/ModalPreviewCertificate')
const ModalEditEmail = () => import('./pages/ModalEditEmail')
const ModalEditFeaturedContent = () => import('./pages/ModalEditFeaturedContent')
const ModalEditAccessMessage = () => import('./pages/ModalEditAccessMessage')
const ModalAddTabs = () => import('./pages/ModalAddTabs')
const ModalAddBranchMetadata = () => import('./pages/ModalAddBranchMetadata')
const ModalBranchMetadataList = () => import('./pages/ModalBranchMetadataList')
const SettingsCustomInstructions = () => import('./pages/SettingsCustomInstructions')

export default [
  {
    name: 'settings.list',
    path: '/settings',
    redirect: { name: 'settings.general' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'settings.general',
    path: '/settings/general',
    component: SettingsGeneral,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'settings.survey_nps',
    path: '/settings/survey_nps',
    component: SettingsSurveyNPS,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'settings.auth',
    path: '/settings/auth',
    component: SettingsAuth,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'settings.notifications',
    path: '/settings/notifications',
    component: SettingsNotifications,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'settings.notifications.email.edit',
        path: 'email/edit/:id',
        component: ModalEditEmail,
        meta: {
          editing: true,
          modalCloseLink: { name: 'settings.notifications' },
        },
      },
    ],
  },
  {
    name: 'settings.certificate',
    path: '/settings/certificate',
    component: SettingsCertificate,
    meta: {
      requiresAuth: true,
      description: 'global:route.settings.certificate',
    },
    children: [
      {
        name: 'settings.certificate.create',
        path: 'create',
        component: ModalAddCertificate,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.certificate' },
        },
      },
      {
        name: 'settings.certificate.update',
        path: 'edit/:id',
        component: ModalAddCertificate,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'settings.certificate' },
        },
      },
      {
        name: 'settings.certificate.preview',
        path: 'preview/:id',
        component: ModalPreviewCertificate,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.certificate' },
        },
      },
    ],
  },
  {
    name: 'settings.dashboard',
    path: '/settings/dashboard',
    component: SettingsDashboard,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'settings.dashboard.featured_content.edit',
        path: 'featured-content/:id',
        component: ModalEditFeaturedContent,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.dashboard' },
        },
      },
      {
        name: 'settings.dashboard.featured_content.create',
        path: 'featured-content',
        component: ModalEditFeaturedContent,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.dashboard' },
        },
      },
      {
        name: 'settings.dashboard.access.edit',
        path: 'access-messages/:id',
        component: ModalEditAccessMessage,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.dashboard' },
        },
      },
      {
        name: 'settings.dashboard.tabs',
        path: 'tabs',
        component: ModalAddTabs,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.dashboard' },
        },
      },
    ],
  },
  {
    name: 'settings.categories',
    path: '/settings/categories',
    component: SettingsCategories,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'settings.categories.create',
        path: 'create',
        component: ModalAddCategory,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.categories' },
        },
      },
      {
        name: 'settings.categories.update',
        path: 'edit/:id',
        component: ModalAddCategory,
        props: (router) => ({ categoryId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'settings.categories' },
        },
      },
    ],
  },
  {
    name: 'settings.branches',
    path: '/settings/branches',
    component: SettingsBranches,
    meta: {
      requiresAuth: true,
      requiresFeature: 'branching',
    },
    children: [
      {
        name: 'settings.branches.create',
        path: ':id/create-child',
        component: ModalAddBranch,
        props: (router) => ({ parentId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          requiresFeature: 'branching',
          modalCloseLink: { name: 'settings.branches' },
        },
      },
      {
        name: 'settings.branches.edit',
        path: ':id/edit',
        component: ModalAddBranch,
        props: (router) => ({
          id: parseInt(router.params.id),
          isEditing: true,
        }),
        meta: {
          requiresAuth: true,
          requiresFeature: 'branching',
          modalCloseLink: { name: 'settings.branches' },
        },
      },
      {
        name: 'settings.branches.metadata',
        path: 'metadata',
        component: ModalBranchMetadataList,
        meta: {
          requiresAuth: true,
          requiresFeature: 'branching',
          modalCloseLink: { name: 'settings.branches' },
        },
      },
      {
        name: 'settings.branches.create.metadata',
        path: 'metadata/create',
        component: ModalAddBranchMetadata,
        meta: {
          requiresAuth: true,
          requiresFeature: 'branching',
          modalCloseLink: { name: 'settings.branches.metadata' },
        },
      },
      {
        name: 'settings.branches.edit.metadata',
        path: 'metadata/:id/edit',
        component: ModalAddBranchMetadata,
        props: (router) => ({
          id: parseInt(router.params.id),
          isEditing: true,
        }),
        meta: {
          requiresAuth: true,
          requiresFeature: 'branching',
          modalCloseLink: { name: 'settings.branches.metadata' },
        },
      },
    ],
  },
  {
    name: 'settings.instructions',
    path: '/custom-instructions',
    component: SettingsCustomInstructions,
    meta: {
      requiresAuth: true,
      requiresFeature: 'pm_ai',
    },
  },
]
