const ForumList = () => import('./pages/ForumList')
const ForumDiscussion = () => import('./pages/ClassroomForumDiscussion')
const ForumEvaluationStudent = () => import('./pages/ForumEvaluationStudent')
const ModalAddForum = () => import('./pages/ModalAddForum')
const ForumEvaluation = () => import('./pages/ForumEvaluation')
const ModalMoveForumPost = () => import('./components/ModalMoveForumPost')
const ModalListForumSessions = () => import('./pages/ModalListForumSessions')

export const routes = [
  {
    path: '/classroom/:session_uuid/forum',
    name: 'classroom.forum',
    component: ForumList,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'classroom.forum.create',
        path: 'create',
        component: ModalAddForum,
        meta: {
          requiresAuth: true,
          modalCloseLink: { name: 'classroom.forum' },
        },
      },
      {
        name: 'classroom.forum.edit',
        path: 'edit/:id',
        component: ModalAddForum,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'classroom.forum' },
        },
      },
      {
        name: 'classroom.forum.sessions',
        path: 'sessions/:id',
        component: ModalListForumSessions,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'classroom.forum' },
        },
      },
    ],
  },
  {
    name: 'classroom.forum.discussion',
    path: '/classroom/:session_uuid/forum/discussion/:id',
    component: ForumDiscussion,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'classroom.forum.discussion.move.post',
        path: 'move/:postId',
        component: ModalMoveForumPost,
        props: true,
        meta: {
          requiresAuth: true,
          editing: true,
          modalCloseLink: { name: 'classroom.forum.discussion' },
        },
      },
    ],
  },
  {
    name: 'classroom.forum.evaluation',
    path: '/classroom/:session_uuid/forum/evaluation/:id',
    component: ForumEvaluation,
    meta: {
      requiresAuth: true,
      backName: 'classroom.forum',
    },
  },
  {
    name: 'classroom.forum.evaluation.student',
    path: '/classroom/:session_uuid/forum/evaluation/:id/correction/:applicationUserId',
    component: ForumEvaluationStudent,
    meta: {
      requiresAuth: true,
      modalCloseLink: { name: 'classroom.forum.evaluation' },
    },
  },
]
