export default {
  name: 'management.messages',
  path: 'messages',
  component: () => import('./ManagementMessages.vue'),
  redirect: { name: 'management.messages.index' },
  meta: {
    requiresAuth: true,
    context: 'classroom:messages',
    tabLink: {
      text: 'global:menu.classroom.messages',
      location: { name: 'management.messages.index' },
    },
  },
  children: [
    {
      path: 'index',
      name: 'management.messages.index',
      component: () => import('./tabs/TabMessages.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: 'add',
      name: 'management.messages.add',
      component: () => import('./tabs/AddMessage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
