import ClassesWrapper from './pages/ClassesWrapper'

const Solutions = () => import('./pages/Solutions')
const SolutionsList = () => import('./pages/SolutionsList')
const SolutionForm = () => import('./pages/SolutionForm')
const SolutionMetadata = () => import('./pages/SolutionMetadata')
const SolutionTools = () => import('./pages/SolutionTools')
const ModalToolsMedia = () => import('./pages/ModalToolsMedia')
const SolutionClasses = () => import('./pages/SolutionClasses')
const SolutionRequirements = () => import('./pages/SolutionRequirements')
const ModalAddTopic = () => import('./pages/ModalAddTopic')
const ModalFormSolutionMetadata = () => import('./pages/ModalFormSolutionMetadata')
const ModalBindTopicTemplate = () => import('./pages/ModalBindTopicTemplate')
const SolutionsMetadataList = () => import('./pages/SolutionsMetadataList')
const TopicsTemplates = () => import('./pages/TopicsTemplates')
const QuestionTemplates = () => import('./pages/QuestionTemplates')
const QuestionGroupTemplates = () => import('./pages/QuestionGroupTemplates')
const ModalAddQuestionTemplate = () => import('./pages/ModalAddQuestionTemplate')
const ModalAddQuestionGroupTemplate = () => import('./pages/ModalAddQuestionGroupTemplate')
const ModalNewScormVersion = () => import('./pages/ModalNewScormVersion')

export default [
  {
    name: 'solutions.index',
    path: '/solutions',
    component: Solutions,
    redirect: { name: 'solutions.list' },
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'solutions.list',
        path: 'list',
        component: SolutionsList,
        meta: {
          requiresAuth: true,
          group: 'solutions',
          description: 'global:route.solutions.index',
        },
      },
      {
        name: 'solutions.topicsTemplates',
        path: 'topics-templates',
        component: TopicsTemplates,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            name: 'solutions.topicsTemplates.create',
            path: 'create',
            component: ModalAddTopic,
            props: {
              isTopicTemplate: true,
            },
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'solutions.topicsTemplates' },
            },
          },
          {
            name: 'solutions.topicsTemplates.update',
            path: ':topicId/update',
            component: ModalAddTopic,
            props: (router) => ({
              topicId: parseInt(router.params.topicId),
              isTopicTemplate: true,
            }),
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'solutions.topicsTemplates' },
            },
          },
        ],
      },
      {
        name: 'solutions.metadata',
        path: 'metadata',
        component: SolutionsMetadataList,
        meta: {
          requiresAuth: true,
          requiresFeature: 'course_metas',
        },
        children: [
          {
            name: 'solutions.metadata.create',
            path: 'create',
            component: ModalFormSolutionMetadata,
            meta: {
              requiresAuth: true,
              requiresFeature: 'course_metas',
              modalCloseLink: { name: 'solutions.metadata' },
            },
          },
          {
            name: 'solutions.metadata.edit',
            path: 'edit/:id',
            component: ModalFormSolutionMetadata,
            props: {
              isEditing: true,
            },
            meta: {
              requiresAuth: true,
              requiresFeature: 'course_metas',
              modalCloseLink: { name: 'solutions.metadata' },
            },
          },
        ],
      },
      {
        name: 'solutions.questionTemplates',
        path: 'template-groups',
        component: QuestionGroupTemplates,
        meta: {
          requiresAuth: true,
          requiresFeature: 'questions_template',
        },
        children: [
          {
            name: 'solutions.questionTemplates.create',
            path: 'create',
            component: ModalAddQuestionGroupTemplate,
            meta: {
              requiresAuth: true,
              requiresFeature: 'questions_template',
              modalCloseLink: { name: 'solutions.questionTemplates' },
            },
          },
          {
            name: 'solutions.questionTemplates.edit',
            path: ':id/edit',
            component: ModalAddQuestionGroupTemplate,
            props: true,
            meta: {
              editing: true,
              requiresAuth: true,
              requiresFeature: 'questions_template',
              modalCloseLink: { name: 'solutions.questionTemplates' },
            },
          },
        ],
      },
      {
        name: 'solutions.questionTemplates.questions',
        path: 'question-templates/:id/questions',
        component: QuestionTemplates,
        props: true,
        meta: {
          requiresAuth: true,
          requiresFeature: 'questions_template',
          modalCloseLink: { name: 'solution.questionTemplates' },
        },
        children: [
          {
            name: 'solutions.questionTemplates.questions.create',
            path: 'create',
            component: ModalAddQuestionTemplate,
            meta: {
              requiresAuth: true,
              requiresFeature: 'questions_template',
              modalCloseLink: { name: 'solutions.questionTemplates.questions' },
            },
          },
          {
            name: 'solutions.questionTemplates.questions.edit',
            path: ':questionId/edit',
            component: ModalAddQuestionTemplate,
            props: true,
            meta: {
              requiresAuth: true,
              editing: true,
              requiresFeature: 'questions_template',
              modalCloseLink: { name: 'solutions.questionTemplates.questions' },
            },
          },
        ],
      },
    ],
  },
  {
    component: ClassesWrapper,
    path: '/solutions',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        name: 'solutions.create',
        path: '/solutions/create',
        component: SolutionForm,
        meta: {
          requiresAuth: true,
          group: 'solutions',
          description: 'global:route.solutions.create',
        },
      },
      {
        name: 'solutions.update',
        path: '/solutions/:id/update',
        component: SolutionForm,
        meta: {
          requiresAuth: true,
          group: 'solutions',
          description: 'global:route.solutions.update',
        },
      },
      {
        name: 'solutions.metadata.register',
        path: '/solutions/:id/metadata',
        component: SolutionMetadata,
        meta: {
          requiresAuth: true,
          requiresFeature: 'course_metas',
          backLink: 'solutions.index',
        },
      },
      {
        name: 'solutions.create.tools',
        path: '/solutions/:id/tools',
        component: SolutionTools,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            name: 'solution.create.tools.media',
            path: 'media',
            component: ModalToolsMedia,
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'solutions.create.tools' },
            },
          },
        ],
      },
      {
        name: 'solutions.create.classes',
        path: '/solutions/:id/classes',
        component: SolutionClasses,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            name: 'solutions.create.classes.create',
            path: 'create',
            component: ModalAddTopic,
            props: (router) => ({
              courseId: parseInt(router.params.id),
            }),
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'solutions.create.classes' },
            },
          },
          {
            name: 'solutions.create.classes.update',
            path: ':topicId/update',
            component: ModalAddTopic,
            props: (router) => ({
              courseId: parseInt(router.params.id),
              topicId: parseInt(router.params.topicId),
            }),
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'solutions.create.classes' },
            },
          },
          {
            name: 'solutions.create.classes.bind',
            path: 'bind',
            component: ModalBindTopicTemplate,
            props: (router) => ({
              courseId: parseInt(router.params.id),
            }),
            meta: {
              requiresAuth: true,
            },
          },
          {
            name: 'solutions.updateScorm',
            path: 'update-scorm/:topicId',
            component: ModalNewScormVersion,
            meta: {
              requiresAuth: true,
              modalCloseLink: { name: 'solutions.create.classes' },
            },
          },
        ],
      },
      {
        name: 'solutions.create.requirements',
        path: '/solutions/:id/requirements',
        component: SolutionRequirements,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
]
