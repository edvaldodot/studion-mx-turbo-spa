import EvaluationStudent from '../assessments/pages/EvaluationStudent/EvaluationStudent.vue'

const Lessons = () => import('./pages/Lessons')

export const routes = [
  {
    path: '/classroom/:session_uuid/lessons',
    name: 'classroom.lessons.course',
    component: Lessons,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/lessons/:type/:type_id',
    name: 'classroom.lessons.course.type',
    component: Lessons,
    meta: {
      requiresAuth: true,
      parent: 'classroom.lessons.course',
    },
    props: true,
  },
  {
    path: '/classroom/:session_uuid/assessments/evaluation-lessons/:type/:type_id',
    name: 'classroom.lessons.course.evaluation.access',
    component: Lessons,
    meta: {
      requiresAuth: true,
      isFromActivity: true,
    },
    props: true,
  },
  {
    path: '/classroom/:session_uuid/pre-project/student/:type/:type_id',
    name: 'classroom.lessons.course.project.access',
    component: Lessons,
    meta: {
      requiresAuth: true,
      isFromProject: true,
      isFromActivity: true,
    },
    props: true,
  },
  {
    path: '/classroom/:session_uuid/pre-project/manager/:id',
    name: 'classroom.lessons.course.project.admin.access',
    component: EvaluationStudent,
    meta: {
      requiresAuth: true,
      isFromProject: true,
      isFromActivity: true,
    },
    props: true,
  },
]
