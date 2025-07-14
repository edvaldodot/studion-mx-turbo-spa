const ConferenceRoomList = () => import('./pages/ConferenceRoomList')
const ConferenceRoomWatch = () => import('./pages/ConferenceRoomWatch')
const ConferenceRoomLive = () => import('./pages/ConferenceRoomLive')
const ModalAddConference = () => import('./pages/ModalAddConference')
const ModalAddConferenceFolder = () => import('./pages/ModalAddConferenceFolder')
const ModalAttachments = () => import('./pages/ModalAttachments')
const ModalListConferenceSessions = () => import('./pages/ModalListConferenceSessions')
const ModalMoveConference = () => import('./pages/ModalMoveConference')
const ModalMoveFolder = () => import('./pages/ModalMoveFolder')

export const routes = [
  {
    path: '/classroom/:session_uuid/conferences-rooms/:folderId?',
    name: 'classroom.conference',
    component: ConferenceRoomList,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'classroom.conference.create',
        path: 'create',
        component: ModalAddConference,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.edit',
        path: ':id/edit',
        component: ModalAddConference,
        props: (router) => ({
          id: parseInt(router.params.id),
          isEditing: true,
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.folder.create',
        path: 'create/folder',
        component: ModalAddConferenceFolder,
        props: (router) => ({
          folderId: parseInt(router.params.folderId || 0),
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.folder.edit',
        path: ':id/edit/folder',
        component: ModalAddConferenceFolder,
        props: (router) => ({
          id: parseInt(router.params.id),
          folderId: parseInt(router.params.folderId || 0),
          isEditing: true,
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.move',
        path: 'move/:id',
        component: ModalMoveConference,
        props: (router) => ({
          id: parseInt(router.params.id),
          folderId: parseInt(router.params.folderId || 0),
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.move.folder',
        path: 'move/folder/:id',
        component: ModalMoveFolder,
        props: (router) => ({
          id: parseInt(router.params.id),
          folderId: parseInt(router.params.folderId || 0),
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.attachments',
        path: ':id/attachments',
        component: ModalAttachments,
        props: (router) => ({
          id: parseInt(router.params.id),
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.conference.sessions',
        path: ':id/sessions',
        component: ModalListConferenceSessions,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'classroom.conference' },
        },
      },
    ],
  },
  {
    path: '/classroom/:session_uuid/conferences-rooms/:id/watch',
    name: 'classroom.conference.watch',
    component: ConferenceRoomWatch,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/conferences-rooms/:id/live',
    name: 'classroom.conference.live',
    component: ConferenceRoomLive,
    meta: {
      requiresAuth: true,
      hideNavbar: true,
    },
  },
]
