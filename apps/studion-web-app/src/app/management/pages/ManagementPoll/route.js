export default {
  name: 'management.poll',
  path: 'poll',
  redirect: { name: 'management.poll.index' },
  component: () => import('./ManagementPoll.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:poll',
    tabLink: {
      text: 'solutions:tools.poll',
      location: { name: 'management.poll.index' },
    },
  },
  children: [
    {
      path: 'index',
      name: 'management.poll.index',
      component: () => import('./tabs/TabPoll.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
}