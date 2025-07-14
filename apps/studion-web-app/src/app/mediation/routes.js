import beforeEnterMediationSetup from './beforeEnter'

import { routes as FilterRoutes } from './modules/filters/routes'
import { routes as TemplateRoutes } from './modules/templates/routes'
import { default as ScheduledRoutes } from './modules/scheduled/routes'

const MediationList = () => import('./pages/MediationList')
const MediationData = () => import('./pages/MediationData')
const MediationActions = () => import('./pages/MediationActions')
const MediationListActions = () => import('./pages/MediationListActions')
const MediationBatchActions = () => import('./pages/MediationBatchActions')
const MediationBatchList = () => import('./pages/MediationBatchList')
const MediationDailyActions = () => import('./pages/MediationDailyActions')
const MediationLink = () => import('./pages/MediationLink')
const MediationModalAddLink = () => import('./pages/MediationModalAddLink')
const MediationModalActionReport = () => import('./pages/MediationModalActionReport')
const PreviewForumModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewForumModal/PreviewForumModal.vue')
const PreviewAnnoucementModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewAnnoucementModal/PreviewAnnoucementModal.vue')
const PreviewEventModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewEventModal/PreviewEventModal.vue')
const PreviewEmailModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewEmailModal/PreviewEmailModal.vue')
const PreviewPollModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewPollModal/PreviewPollModal.vue')
const PreviewSMSModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewSMSModal/PreviewSMSModal.vue')
const PreviewChatModal = () =>
  import('@/app/mediation/components/MediationModalPreview/PreviewChatModal/PreviewChatModal.vue')

PreviewAnnoucementModal
PreviewEventModal
PreviewEmailModal
PreviewPollModal
PreviewSMSModal

export default [
  {
    name: 'mediation.index',
    path: '/mediation',
    redirect: { name: 'mediation.list' },
    meta: {
      requiresFeature: 'pm',
      requiresAuth: true,
    },
  },
  {
    name: 'mediation.list',
    path: '/mediation/list',
    component: MediationList,
    meta: {
      requiresFeature: 'pm',
      requiresAuth: true,
      group: 'mediation',
      description: 'global:route.mediation.index',
    },
    children: [
      {
        name: 'mediation.list.report',
        path: ':id/report/:session_id',
        component: MediationModalActionReport,
        beforeEnter: beforeEnterMediationSetup,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          modalCloseLink: { name: 'mediation.list' },
        },
      },
    ],
  },
  {
    name: 'mediation.create',
    path: '/mediation/create',
    component: MediationData,
    meta: {
      requiresFeature: 'pm',
      requiresAuth: true,
      group: 'mediation',
    },
  },
  {
    name: 'mediation.edit',
    path: '/mediation/:id/edit',
    component: MediationData,
    beforeEnter: beforeEnterMediationSetup,
    meta: {
      requiresFeature: 'pm',
      requiresAuth: true,
      group: 'mediation',
    },
  },
  {
    name: 'mediation.actions.redirect',
    path: '/mediation/:id',
    redirect: (router) => ({ name: 'mediation.actions', params: router.params }),
  },
  {
    path: '/mediation/:id/actions',
    component: MediationActions,
    children: [
      {
        name: 'mediation.actions',
        path: '/',
        props: true,
        component: MediationListActions,
        beforeEnter: beforeEnterMediationSetup,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          group: 'mediation',
        },
      },
      {
        name: 'mediation.batch.list',
        path: 'batch/list',
        component: MediationBatchList,
        beforeEnter: beforeEnterMediationSetup,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          group: 'mediation',
        },
        children: [
          {
            name: 'mediation.batch.list.add',
            path: 'add',
            component: MediationBatchActions,
            meta: {
              requiresFeature: 'pm',
              requiresAuth: true,
              group: 'mediation',
              modalCloseLink: { name: 'mediation.batch.list' },
            },
          },
        ],
      },
      {
        name: 'mediation.actions.day',
        path: ':day',
        component: MediationDailyActions,
        beforeEnter: beforeEnterMediationSetup,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          group: 'mediation',
        },
        children: [
          {
            name: 'topic.preview.action',
            path: 'discussion/preview/',
            props: true,
            component: PreviewForumModal,
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'announcement.preview.action',
            path: 'announcement/preview/',
            props: true,
            component: PreviewAnnoucementModal,
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'event.preview.action',
            path: 'event/preview/',
            props: true,
            component: PreviewEventModal,
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'email.preview.action',
            path: 'email/preview/',
            props: true,
            component: PreviewEmailModal,
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'poll.preview.action',
            path: 'poll/preview/',
            props: true,
            component: PreviewPollModal,
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'sms.preview.action',
            path: 'sms/preview/',
            props: true,
            component: PreviewSMSModal,
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'chat.preview.action',
            path: 'chat/preview/',
            props: true,
            component: PreviewChatModal,
            meta: {
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  },
  {
    name: 'mediation.link',
    path: '/mediation/:id/link',
    component: MediationLink,
    beforeEnter: beforeEnterMediationSetup,
    meta: {
      requiresFeature: 'pm',
      requiresAuth: true,
      group: 'mediation',
    },
    children: [
      {
        name: 'mediation.link.add',
        path: 'add',
        component: MediationModalAddLink,
        beforeEnter: beforeEnterMediationSetup,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          modalCloseLink: { name: 'mediation.link' },
        },
      },
      {
        name: 'mediation.link.report',
        path: 'report/:session_id',
        component: MediationModalActionReport,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          modalCloseLink: { name: 'mediation.link' },
        },
      },
    ],
  },

  ...FilterRoutes,
  ...TemplateRoutes,
  ...ScheduledRoutes,
]
