import ModalPoll from './components/ModalPoll/ModalPoll.vue'

const PollList = () => import('./pages/PollList')

export const routes = [
  {
    path: '/classroom/:session_uuid/polls',
    name: 'classroom.poll',
    redirect: {
      name: 'classroom.poll.active',
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/polls/active',
    name: 'classroom.poll.active',
    props: true,
    component: PollList,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'modal',
        name: 'classroom.poll.add',
        component: ModalPoll,
        props: true,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/classroom/:session_uuid/polls/ended',
    name: 'classroom.poll.ended',
    component: PollList,
    meta: {
      requiresAuth: true,
    },
  },
]
