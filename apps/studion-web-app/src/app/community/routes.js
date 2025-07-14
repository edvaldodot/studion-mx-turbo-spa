import store from '@/store'

import { getAllProfilesHandler } from './beforeRouteHandlers'

const Community = () => import('./pages/Community')
const CommunityProfiles = () => import('./pages/CommunityProfiles')
const CommunityMetadata = () => import('./pages/CommunityMetadata')
const CommunitySessions = () => import('./pages/CommunitySessions')
const CommunityGroups = () => import('./pages/CommunityGroups')
const ModalAddUser = () => import('./pages/ModalAddUser')
const ModalChangePassword = () => import('./pages/ModalChangePassword')
const ModalBatchAddUser = () => import('./pages/ModalBatchAddUser')
const ModalUserBatchStatus = () => import('./pages/ModalUserBatchStatus')
const ModalUserBatchList = () => import('./pages/ModalUserBatchList')
const ModalAddProfile = () => import('./pages/ModalAddProfile')
const ModalLinkAccount = () => import('./pages/ModalLinkAccount')
const ModalAddMetadata = () => import('./pages/ModalAddMetadata')
const ModalAddSession = () => import('./pages/ModalAddSession')
const ModalSessionEnrollments = () => import('./pages/ModalSessionEnrollments')
const ModalStatusTimeline = () => import('./pages/ModalStatusTimeline')
const ModalSessionMediation = () => import('./pages/ModalSessionMediation')
const ModalFinishedBatches = () => import('./pages/ModalFinishedBatches')
const ModalBatchStatus = () => import('./pages/ModalBatchStatus')
const ModalSendBatchEnroll = () => import('./pages/ModalSendBatchEnroll')
const ModalEnrollUser = () => import('./pages/ModalEnrollUser')
const ModalUsersOfGroup = () => import('./pages/ModalUsersOfGroup')
const ModalAddGroup = () => import('./pages/ModalAddGroup')
const ModalSessionTimeline = () => import('./pages/ModalSessionTimeline')
const ModalBatchDate = () => import('./pages/ModalSessionTimeline/pages/ModalBatchDate')
const ModalSessionGroups = () => import('./pages/ModalSessionGroups')
const ModalSessionRecovery = () => import('./pages/ModalSessionRecovery')

export default [
  {
    name: 'community.index',
    path: '/community',
    redirect: { name: 'community.users' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'community.users',
    path: '/community/users',
    component: Community,
    meta: {
      requiresAuth: true,
      group: 'community',
      description: 'global:route.community.users',
    },
    children: [
      {
        name: 'community.users.create',
        path: 'create',
        component: ModalAddUser,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.users' },
        },
      },
      {
        name: 'community.users.edit',
        path: 'edit/:id',
        component: ModalAddUser,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'community.users' },
        },
      },
      {
        name: 'community.users.edit.password',
        path: 'edit/:id/password',
        component: ModalChangePassword,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'community.users.edit' },
        },
      },
      {
        name: 'community.users.batch',
        path: 'batch',
        component: ModalBatchAddUser,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.users' },
        },
      },
      {
        name: 'community.users.batch.edit',
        path: 'batch/edit',
        component: ModalBatchAddUser,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.users' },
        },
        props: {
          isBatchEditing: true,
        },
      },
      {
        name: 'community.users.batch.status',
        path: 'batch/status/:id',
        component: ModalUserBatchStatus,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.users.batch.list' },
        },
      },
      {
        name: 'community.users.batch.list',
        path: 'batch/list',
        component: ModalUserBatchList,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.users' },
        },
      },
      {
        name: 'community.users.link',
        path: 'create/link',
        component: ModalLinkAccount,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.users' },
        },
        beforeEnter: (to, from, next) => {
          return to.params.email && to.params.username && to.params.name
            ? next()
            : next({ name: 'community.users' })
        },
      },
    ],
  },
  {
    name: 'community.sessions',
    path: '/community/sessions',
    component: CommunitySessions,
    meta: {
      requiresAuth: true,
      group: 'community',
      description: 'global:route.comunity.sessions',
    },
    children: [
      {
        name: 'community.session.add',
        path: 'create',
        component: ModalAddSession,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.sessions' },
        },
      },
      {
        name: 'community.session.edit',
        path: 'edit/:id',
        component: ModalAddSession,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'community.sessions' },
        },
      },
      {
        name: 'community.sessions.enrollments',
        path: 'edit/:id/enrollments',
        component: ModalSessionEnrollments,
        props: true,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.sessions' },
        },
      },
      {
        name: 'community.sessions.status',
        path: 'edit/:id/enrollments/:enrollmentId/status',
        component: ModalStatusTimeline,
        props: true,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'community.sessions.mediation',
        path: 'edit/:id/mediation',
        component: ModalSessionMediation,
        meta: {
          requiresFeature: 'pm',
          requiresAuth: true,
          modalCloseLink: { name: 'community.sessions' },
        },
      },
      {
        name: 'community.sessions.enrollments.enroll.user',
        path: 'edit/:id/enrollments/enroll',
        component: ModalEnrollUser,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'community.sessions.enrollments.by.group',
        path: 'edit/:id/enrollments/groups',
        component: ModalSessionGroups,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.sessions.enrollments' },
        },
      },
      {
        name: 'community.sessions.enrollments.sendbatch',
        path: 'edit/:id/enrollments/sendbatch',
        component: ModalSendBatchEnroll,
        meta: {
          requiresAuth: true,
        },
        props: {
          isBatchEditing: true,
        },
        beforeEnter: (to, from, next) => {
          const { state } = store
          return state.Sessions.current === null ? next({ name: 'community.sessions' }) : next()
        },
      },
      {
        name: 'community.sessions.finished.batches',
        path: 'edit/:id/batchlist',
        component: ModalFinishedBatches,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'community.sessions.batch.status',
        path: 'edit/:id/batch/status',
        component: ModalBatchStatus,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'community.session.recovery',
        path: ':sessionId/recovery',
        props: true,
        component: ModalSessionRecovery,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.sessions' },
        },
      },
      {
        name: 'community.sessions.timeline',
        path: ':sessionId/timeline',
        component: ModalSessionTimeline,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.sessions' },
        },
        children: [
          {
            name: 'community.sessions.timeline.batch.date',
            path: 'batch/:topicId',
            props: true,
            component: ModalBatchDate,
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'community.sessions.timeline' },
            },
          },
        ],
      },
    ],
  },
  {
    name: 'community.profiles',
    path: '/community/profiles',
    component: CommunityProfiles,
    meta: {
      requiresAuth: true,
      group: 'community',
      description: 'global:route.comunity.profiles',
    },
    children: [
      {
        name: 'community.profiles.create',
        path: 'create',
        component: ModalAddProfile,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.profiles' },
        },
        beforeEnter: getAllProfilesHandler,
      },
      {
        name: 'community.profiles.edit',
        path: 'edit/:id',
        component: ModalAddProfile,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'community.profiles' },
        },
        beforeEnter: getAllProfilesHandler,
      },
    ],
  },
  {
    name: 'community.metadata',
    path: '/community/metadata',
    component: CommunityMetadata,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'community.metadata.create',
        path: 'create',
        component: ModalAddMetadata,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.metadata' },
        },
      },
      {
        name: 'community.metadata.edit',
        path: 'edit/:id',
        component: ModalAddMetadata,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'community.metadata' },
        },
      },
    ],
  },
  {
    name: 'community.groups',
    path: '/community/groups',
    component: CommunityGroups,
    meta: {
      requiresAuth: true,
      group: 'community',
      description: 'global:route.community.groups',
    },
    children: [
      {
        name: 'community.groups.create',
        path: '/community/groups/create',
        component: ModalAddGroup,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.groups' },
        },
      },
      {
        name: 'community.groups.update',
        path: '/community/groups/:groupId/update',
        component: ModalAddGroup,
        props: (router) => ({ groupId: parseInt(router.params.groupId) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.groups' },
        },
      },
      {
        name: 'community.groups.users',
        path: ':id/users',
        component: ModalUsersOfGroup,
        props: (router) => ({ id: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.groups' },
        },
      },
      {
        name: 'community.groups.users.add.single',
        path: ':id/users/add/single',
        component: ModalUsersOfGroup,
        props: (router) => ({ id: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'community.groups.users' },
        },
      },
    ],
  },
]
