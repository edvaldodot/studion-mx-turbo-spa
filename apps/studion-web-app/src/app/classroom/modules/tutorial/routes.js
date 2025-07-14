import ClassroomTutorial from './pages/ClassroomTutorial'

export const routes = [
  {
    path: '/classroom/:session_uuid/tutorial',
    name: 'classroom.tutorial',
    component: ClassroomTutorial,
    meta: {
      requiresAuth: true,
    },
  },
]
