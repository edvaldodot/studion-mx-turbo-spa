export default {
  name: 'management.doubts',
  path: 'doubts',
  redirect: { name: 'management.doubts.index' },
  component: () => import('./ManagementDoubts.vue'),
  meta: {
    context: 'classroom:doubts',
    tabLink: {
      text: 'global:menu.classroom.help',
      location: { name: 'management.doubts' },
    },
  },
  children: [
    {
      path: 'index',
      name: 'management.doubts.index',
      component: () => import('./tabs/TabsDoubtsList.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: 'help/:uuid/:id',
      name: 'management.doubts.unique',
      component: () => import('./tabs/TabsSingleDoubt.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
