import config from '@/config'
const MessagesInbox = () => import('./pages/Inbox')
const MessagesSent = () => import('./pages/Sent')
const MessagesDraft = () => import('./pages/Draft')
const MessagesTrash = () => import('./pages/Trash')
const MessagesView = () => import('./pages/View')
const MessagesPrint = () => import('./pages/Print')
const MessagesNew = () => import('./pages/New')
const { HIDDEN_TOOLS } = config

export const routes = [
  {
    path: '/classroom/:session_uuid/messages',
    name: 'classroom.messages',
    redirect: { name: 'classroom.messages.inbox' },
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/inbox',
    name: 'classroom.messages.inbox',
    component: MessagesInbox,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/sent',
    name: 'classroom.messages.sent',
    component: MessagesSent,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/draft',
    name: 'classroom.messages.draft',
    component: MessagesDraft,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/trash',
    name: 'classroom.messages.trash',
    component: MessagesTrash,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/:type/view/:interaction_id',
    name: 'classroom.messages.view',
    component: MessagesView,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/:interaction_id/print',
    name: 'classroom.messages.print',
    component: MessagesPrint,
    meta: {
      hideNavbar: true,
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/inbox/new',
    name: 'classroom.messages.new',
    component: MessagesNew,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1,
    },
  },
  {
    path: '/classroom/:session_uuid/messages/:interaction_id/forward',
    name: 'classroom.messages.forward',
    component: MessagesNew,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/:interaction_id/reply',
    name: 'classroom.messages.reply',
    component: MessagesNew,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  },
  {
    path: '/classroom/:session_uuid/messages/draft/:interaction_id',
    name: 'classroom.messages.edit.draft',
    component: MessagesNew,
    meta: {
      requiresAuth: true,
      softLock: HIDDEN_TOOLS.indexOf('998') !== -1
    }
  }
]
