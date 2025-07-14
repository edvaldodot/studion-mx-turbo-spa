import store from '@/store'
import { canRead } from '@/support/utils/permissions'

import { routes as AssessmentsRoutes } from './modules/assessments/routes'
import { routes as PollRoutes } from './modules/polls/routes'
import { routes as ChatRoomsRoutes } from './modules/chatrooms/routes'
import { routes as AttendanceListRoutes } from './modules/attendance_list/routes'
import { routes as ConferencesRoomsRoutes } from './modules/conferences_rooms/routes'
import { routes as MessageRoutes } from './modules/messages/routes'
import { routes as HelpRoutes } from './modules/help/routes'
import { routes as LessonsRoutes } from './modules/lessons/routes'
import { routes as LibraryRoutes } from './modules/library/routes'
import { routes as PanelRoutes } from './modules/panel/routes'
import { routes as ForumRoutes } from './modules/forum/routes'
import { routes as PreProject } from './modules/pre_project/routes'
import { routes as NotesRoutes } from './modules/notes/routes'
import { routes as TutorialRoutes } from './modules/tutorial/routes'

import config from '@/config'
const { CUSTOM_CLASSROOM_REDIRECT } = config

const Classroom = () => import('./modules/classroom/pages/Classroom')
const ClassroomLists = () => import('./modules/classroom/pages/ClassroomLists')
const ClassroomSolutions = () => import('./modules/classroom/pages/ClassroomSolutions')
const ClassroomOfferings = () => import('./modules/classroom/pages/ClassroomOfferings')
const ClassroomOfferSolutions = () => import('./modules/classroom/pages/ClassroomOfferSolutions')
const ClassroomTrails = () => import('./modules/classroom/pages/ClassroomTrails')
const ClassroomTrailSessions = () => import('./modules/classroom/pages/ClassroomTrailSessions')
const ModalBlockedAccess = () => import('./modules/classroom/pages/ModalBlockedAccess')

export default [
  {
    name: 'classroom.index',
    path: '/classroom',
    component: ClassroomLists,
    redirect: { name: 'classroom.sessions' },
    meta: {
      requiresAuth: true,
      group: 'classroom',
      description: 'global:route.classroom.index',
    },
    children: [
      {
        path: 'blocked/:session_uuid?',
        name: 'classroom.blocked',
        component: ModalBlockedAccess,
        meta: {
          requiresAuth: true,
        },
      },
      {
        name: 'classroom.sessions',
        path: 'solutions',
        component: ClassroomSolutions,
        meta: {
          requiresAuth: true,
          group: 'classroom',
          description: 'global:route.classroom.index',
        },
      },
      {
        name: 'classroom.offerings',
        path: 'offerings',
        component: ClassroomOfferings,
        meta: {
          requiresAuth: true,
          group: 'classroom',
          description: 'global:route.classroom.index',
        },
        beforeEnter(to, from, next) {
          const { state } = store

          if (!canRead(state, 'offerings')) {
            if (canRead(state, 'paths')) {
              next({ name: 'classroom.trails' })
              return
            }

            next({ name: 'classroom.sessions' })
            return
          }

          next()
        },
      },
      {
        name: 'classroom.offerings.solutions',
        path: 'offerings/:id/solutions',
        component: ClassroomOfferSolutions,
        props: (router) => ({ id: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          group: 'classroom',
          description: 'global:route.classroom.index',
        },
      },
      {
        name: 'classroom.trails',
        path: 'trails',
        component: ClassroomTrails,
        meta: {
          requiresAuth: true,
          group: 'classroom',
        },
        beforeEnter(to, from, next) {
          const { state } = store

          if (!canRead(state, 'paths')) {
            if (canRead(state, 'offerings')) {
              next({ name: 'classroom.offerings' })
              return
            }

            next({ name: 'classroom.sessions' })
            return
          }

          next()
        },
      },
      {
        name: 'classroom.trail.sessions',
        path: 'trails/:id/solutions',
        component: ClassroomTrailSessions,
        props: (router) => ({ trailId: parseInt(router.params.id) }),
        meta: {
          requiresAuth: true,
          group: 'classroom',
        },
      },
    ],
  },
  {
    name: 'classroom',
    path: '/classroom/:session_uuid',
    component: Classroom,
    redirect: (to) => {
      const { classroomTool } = to.params

      if (classroomTool) {
        return { name: `classroom.${classroomTool}` }
      }

      if (CUSTOM_CLASSROOM_REDIRECT) {
        return { name: CUSTOM_CLASSROOM_REDIRECT }
      }

      return { name: 'classroom.panel.dashboard' }
    },
    props: true,
    meta: {
      requiresAuth: true,
      group: 'classroom',
      description: 'global:route.classroom',
    },
    children: [
      {
        path: '/classroom/:session_uuid/wiki',
        name: 'classroom.wiki',
        redirect: { name: 'classroom.panel.dashboard' },
      },
      ...ForumRoutes,
      ...ChatRoomsRoutes,
      ...ConferencesRoomsRoutes,
      ...PollRoutes,
      ...AttendanceListRoutes,
      ...AssessmentsRoutes,
      ...MessageRoutes,
      ...HelpRoutes,
      ...LessonsRoutes,
      ...LibraryRoutes,
      ...PanelRoutes,
      ...PreProject,
      ...NotesRoutes,
      ...TutorialRoutes,
    ],
  },
]
