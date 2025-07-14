export default {
  name: 'management.evaluation',
  path: 'evaluation',
  redirect: { name: 'management.evaluation.index' },
  component: () => import('./ManagementEvaluation.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:examination',
    tabLink: {
      text: 'classroom.assessments.tab.link.1',
      location: { name: 'management.evaluation' },
    },
  },
  children: [
    {
      path: 'index',
      name: 'management.evaluation.index',
      component: () => import('./tabs/TabEvaluation.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: 'preproject',
      name: 'management.evaluation.preproject',
      component: () => import('./tabs/TabPreProject.vue'),
      meta: {
        requiresAuth: true,
        requiresFeature: 'pre_project_examination',
      },
    },
  ],
}
