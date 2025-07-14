const ModalExternalLink = () =>
  import('./components/PanelExternalLink/components/ModalExternalLink/ModalExternalLink.vue')
const Dashboard = () => import('./pages/Dashboard')
const Announcements = () => import('./pages/Announcements')
const Calendar = () => import('./pages/Calendar')
const ExternalLink = () => import('./pages/ExternalLink')

export const routes = [
  {
    path: '/classroom/:session_uuid/panel',
    name: 'classroom.panel',
    redirect: { name: 'classroom.panel.dashboard' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/panel/dashboard',
    name: 'classroom.panel.dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/panel/announcements',
    name: 'classroom.panel.announcements',
    component: Announcements,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/panel/create/modal_link_external',
    name: 'classroom.panel.modal.create.external.link',
    component: ModalExternalLink,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/panel/edit/modal_link_external/:id',
    name: 'classroom.panel.modal.edit.external.link',
    component: ModalExternalLink,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/panel/calendar',
    name: 'classroom.panel.calendar',
    component: Calendar,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/panel/external_link',
    name: 'classroom.panel.external.link',
    component: ExternalLink,
    meta: {
      requiresAuth: true,
    },
  },
]
