import store from '@/store'
import ModalViewHistory from './pages/Project/History/components/ModalViewHistory'
import DownloadEvaluationStudent from './pages/Project/History/components/DownloadEvaluationStudent'

const EvaluationStudent = () =>
  import('../assessments/pages/EvaluationStudent/EvaluationStudent.vue')

async function redirectPreProject(to, _, next) {
  const isStudent = await store.dispatch('isStudent')

  if (isStudent && to.name === 'classroom.pre.project.student') {
    return next({ name: 'classroom.pre.project.student', params: to.params })
  }

  if (!isStudent && to.name === 'classroom.pre.project') {
    return next({ name: 'classroom.pre.project', params: to.params })
  }

  return next()
}

export const routes = [
  {
    path: '/classroom/:session_uuid/pre-project/panel',
    name: 'classroom.pre.project',
    component: () => import('./pages/ProjectWrapper'),
    beforeEnter: redirectPreProject,
    redirect: {
      name: 'classroom.pre.project.tccproject',
    },
    meta: {
      requiresAuth: true,
      requiresFeature: 'pre_project_examination',
    },
    children: [
      {
        path: 'tccProject',
        name: 'classroom.pre.project.tccproject',
        component: () => import('./pages/Project/TccProject'),
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: 'ModalDatatableProject/:id',
            name: 'classroom.pre.project.tccproject.modal.datatableProject',
            props: true,
            component: () => import('./pages/Project/TccProject/components/ModalDatatableProject'),
            meta: {
              requiresAuth: true,
            },
          },
        ],
      },
      {
        path: 'configurations',
        name: 'classroom.pre.project.configurations',
        component: () => import('./pages/Project/Configurations'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'management',
        name: 'classroom.pre.project.management',
        component: () => import('./pages/Project/Management'),
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: 'viewDetails/:id',
            name: 'classroom.pre.project.management.modal.view.details',
            props: true,
            component: () => import('./pages/Project/Management/components/ModalViewDetails'),
            meta: {
              requiresAuth: true,
            },
          },
          {
            path: 'createGroup',
            name: 'classroom.pre.project.management.modal.create',
            props: true,
            component: () => import('./pages/Project/Management/components/ModalAddGroup'),
            meta: {
              requiresAuth: true,
            },
          },
          {
            path: 'editGroup/:id',
            name: 'classroom.pre.project.management.modal.edit',
            props: true,
            component: () => import('./pages/Project/Management/components/ModalAddGroup'),
            meta: {
              requiresAuth: true,
            },
          },
        ],
      },
      {
        path: 'history',
        name: 'classroom.pre.project.history',
        component: () => import('./pages/Project/History'),
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: ':history/details',
            name: 'classroom.pre.project.details.history',
            component: ModalViewHistory,
            props: true,
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'classroom.pre.project.history' },
            },
            children: [
              {
                path: 'view/:id',
                name: 'classroom.pre.project.details.history.view',
                component: EvaluationStudent,
                meta: {
                  requiresAuth: true,
                  preProjectHistory: true,
                },
              },
              {
                path: 'view/:id/download',
                name: 'classroom.pre.project.details.history.download',
                component: DownloadEvaluationStudent,
                meta: {
                  requiresAuth: true,
                  preProjectHistory: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/classroom/:session_uuid/pre-project/student',
    name: 'classroom.pre.project.student',
    component: () => import('./pages/ProjectWrapper'),
    beforeEnter: redirectPreProject,
    redirect: {
      name: 'classroom.pre.project.student.project',
    },
    meta: {
      requiresAuth: true,
      requiresFeature: 'pre_project_examination',
    },
    children: [
      {
        path: 'list',
        name: 'classroom.pre.project.student.project',
        component: () => import('./pages/ProjectStudent/TccProjectStudent'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'my-groups',
        name: 'classroom.pre.project.student.groups',
        component: () => import('./pages/ProjectStudent/MyGroups'),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
]
