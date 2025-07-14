import ChatRoom from './pages/ChatRoom'
import ChatRoomList from './pages/ChatRoomList'

export const routes = [
  {
    path: '/classroom/:session_uuid/chatrooms',
    name: 'classroom.chat',
    component: ChatRoomList,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'nickname',
        name: 'classroom.chat.nickname',
        component: () => import('./components/ModalNicknameForm'),
        props: (route) => ({
          suggestion: route.query.suggestion,
        }),
        meta: {
          requiresAuth: true,
          redirect: {
            name: 'classroom.chat',
          },
        },
      },
    ],
  },
  {
    path: '/classroom/:session_uuid/chatrooms/:chatroom_id',
    name: 'classroom.chat.chatroom',
    component: ChatRoom,
    meta: {
      requiresAuth: true,
    },
  },
]