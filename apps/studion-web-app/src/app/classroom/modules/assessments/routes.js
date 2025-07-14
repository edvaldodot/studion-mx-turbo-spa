const Evaluation = () => import('./pages/Evaluation')
const EvaluationLTI = () => import('./pages/EvaluationLTI')
const Lessons = () => import('@/app/classroom/modules/lessons/pages/Lessons/Lessons.vue')
const ListEvaluationStudent = () => import('./pages/ListEvaluationStudent')
const EvaluationStudent = () => import('./pages/EvaluationStudent')
const EvaluationAll = () => import('./pages/EvaluationAll')
const CompetencyList = () => import('./pages/Competency/CompetencyList')
const CompetencyFeedback = () => import('./pages/Competency/CompetencyFeedback')
const PreProjectList = () => import('./pages/PreProject/PreProjectList.vue')

export const routes = [
  {
    path: '/classroom/:session_uuid/assessments',
    name: 'classroom.assessments',
    redirect: { name: 'classroom.assessments.evaluation' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/competency',
    name: 'classroom.assessments.competency',
    component: CompetencyList,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '/classroom/:session_uuid/assessments/competency/evaluation',
        name: 'classroom.assessments.competency.evaluation',
        component: CompetencyList,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/classroom/:session_uuid/assessments/competency/student',
        name: 'classroom.assessments.competency.student',
        component: CompetencyList,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/classroom/:session_uuid/assessments/competency/:id/feedback',
    name: 'classroom.assessments.competency.feedback',
    component: CompetencyFeedback,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/lti-evaluation',
    name: 'classroom.assessments.lti',
    component: EvaluationLTI,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/evaluation/:id?/:enrollment?',
    name: 'classroom.assessments.evaluation',
    component: Evaluation,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/evaluation-lessons/:type/:type_id',
    name: 'classroom.assessments.evaluation.access',
    component: Lessons,
    meta: {
      requiresAuth: true,
      isFromActivity: true,
    },
    props: true,
  },
  {
    path: '/classroom/:session_uuid/assessments/list/evaluation/student',
    name: 'classroom.assessments.evaluation.list.student',
    component: ListEvaluationStudent,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/evaluation/enrollment/make/:id',
    name: 'classroom.assessments.evaluation.student',
    component: EvaluationStudent,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/evaluation/all/:id',
    name: 'classroom.assessments.evaluation.all',
    component: EvaluationAll,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/classroom/:session_uuid/assessments/pre-project',
    name: 'classroom.assessments.preproject',
    component: PreProjectList,
    meta: {
      requiresAuth: true,
      requiresFeature: 'pre_project_examination',
    },
  },
]
